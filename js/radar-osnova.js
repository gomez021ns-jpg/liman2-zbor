/* Komšijski radar - mapa prijava na Liman 2 (MZ Boško Buha).
   Mapa: Leaflet + OpenStreetMap pločice; pločice idu sa javnih OSM servera i traže internet.
   Podaci: data/prijave.js i data/granica.js (čitaju se kao JS, jer fetch ne radi preko file://).
   Prva faza: nema servera - prijava se šalje e-poštom Zboru. Mesta gde se kači server
   označena su sa "FAZA 2". */
(function () {
  "use strict";

  var P = window.LIMAN2 || {};
  var PRIJAVE = window.PRIJAVE || [];
  var GRANICA = window.GRANICA_MZ || [];
  var MAPA = P.mapa || { centar: [45.2407, 19.846], zoom: 15, najmanji: 13, najveci: 19 };
  var PREDUGO_DANA = P.predugoDana || 30;
  var ADRESA = P.adresaZbora || "";

  // izvori pločica iz podešavanja; prvi koji radi se zadržava
  var PLOCICE = (P.plocice && P.plocice.length) ? P.plocice : [{
    url: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    najveciZoom: 20,
    atribucija: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" ' +
      'rel="noopener">OpenStreetMap</a> saradnici, &copy; CARTO'
  }];

  var VRSTE = {
    rasveta: "Rasveta",
    smece: "Smeće i kontejneri",
    parking: "Parking",
    zelenilo: "Zelenilo",
    ulice: "Ulice i trotoari",
    vodovod: "Vodovod",
    kanalizacija: "Kanalizacija",
    grejanje: "Grejanje i toplovod",
    komunalno: "Komunalni problemi",
    prevoz: "Gradski prevoz",
    buka: "Buka",
    zivotinje: "Životinje",
    razno: "Razno"
  };

  var STATUSI = {
    // boje su namerno van crvene porodice sajta (crvena je pozadina i akcenat):
    // sve imaju ≥4.5:1 sa belim slovom na znački
    primljeno: { naziv: "Primljeno", boja: "#55615f" },
    proverava_se: { naziv: "Proverava se", boja: "#1f4fa0" },
    u_radu: { naziv: "U rešavanju", boja: "#694394" },
    zatvoreno: { naziv: "Zatvoreno", boja: "#55615f" },
    prijavljeno: { naziv: "Prijavljeno", boja: "#8a5200" },
    prosledjeno: { naziv: "Prosleđeno nadležnima", boja: "#985000" },
    odgovor: { naziv: "Stigao odgovor", boja: "#0d5f68" },
    reseno: { naziv: "Rešeno", boja: "#2d6b52" },
    odbijeno: { naziv: "Odbijeno od nadležnih institucija", boja: "#a12b2b" }
  };

  // ---- pomoćne ----
  function uDatum(iso) {
    return iso ? new Date(iso + "T00:00:00") : new Date(0);
  }

  function danaOd(iso) {
    return Math.floor((new Date() - uDatum(iso)) / 86400000);
  }

  function formatDatum(iso) {
    var d = uDatum(iso);
    if (isNaN(d.getTime())) { return ""; }
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear() + ".";
  }

  function predugo(prijava) {
    var ceka = prijava.status === "prijavljeno" || prijava.status === "prosledjeno";
    return ceka && danaOd(prijava.datum) > PREDUGO_DANA;
  }

  function statusInfo(prijava) {
    return STATUSI[prijava.status] || { naziv: prijava.status, boja: "#55615f" };
  }

  function skrati(tekst, najvise) {
    tekst = String(tekst || "");
    return tekst.length > najvise ? tekst.slice(0, najvise - 1).trim() + "…" : tekst;
  }

  function bezbedno(tekst) {
    // Beži se i jednostruki navodnik: sad su svi atributi dvostruki, pa nije problem, ali da
    // ne bude zamka ako neko kasnije napiše atribut sa '...'.
    return String(tekst == null ? "" : tekst)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // 1 dan, 2 dana, 5 dana, 21 dan, 22 dana, 31 dan - isto pravilo kao
  // kolikoFotografija() i kolikoObjava() u app.js (mod 10 uz izuzetak za 11)
  function dodajDane(broj) {
    var zadnje = broj % 10, zadnjeDve = broj % 100;
    if (zadnje === 1 && zadnjeDve !== 11) { return broj + " dan"; }
    return broj + " dana";
  }

  // ---- mapa ----
  // Pločice: uzima se prvi izvor iz podešavanja; ako se pločice ne učitaju
  // (blokada servera, prekid), automatski se prelazi na sledeći izvor.
  function dodajPlocice(mapa, indeks) {
    if (!mapa || indeks >= PLOCICE.length) { return null; }

    var izvor = PLOCICE[indeks];
    var greske = 0;
    var sloj = L.tileLayer(izvor.url, {
      maxZoom: 19,
      subdomains: izvor.poddomeni || "abc",
      detectRetina: izvor.retina !== false,
      attribution: izvor.atribucija || ""
    }).addTo(mapa);

    sloj.on("tileload", function () { greske = 0; });
    sloj.on("tileerror", function () {
      greske += 1;
      if (greske >= 4) {
        mapa.removeLayer(sloj);
        dodajPlocice(mapa, indeks + 1);
      }
    });
    return sloj;
  }

  function napraviMapu(el, podesavanja) {
    if (!window.L || !el) {
      if (el) { el.innerHTML = '<p class="mapa-greska">Mapa se nije učitala (nedostaje Leaflet).</p>'; }
      return null;
    }
    var mapa = L.map(el, {
      center: MAPA.centar,
      zoom: MAPA.zoom,
      minZoom: MAPA.najmanji,
      maxZoom: MAPA.najveci,
      scrollWheelZoom: !!podesavanja.tocak,
      dragging: podesavanja.pomeranje !== false
    });

    dodajPlocice(mapa, 0);

    if (GRANICA.length) {
      var granica = L.polygon(GRANICA, {
        color: "#0d5f68",
        weight: 2,
        opacity: 0.65,
        dashArray: "6 6",
        fillColor: "#0d5f68",
        fillOpacity: 0.05,
        interactive: false
      }).addTo(mapa);
      // uokviri mesnu zajednicu, da se odmah vidi ceo kraj
      mapa.fitBounds(granica.getBounds(), { padding: [18, 18] });
      if (mapa.getZoom() > MAPA.najveci) { mapa.setZoom(MAPA.najveci); }
    }
    return mapa;
  }

  function ikona(prijava) {
    return L.divIcon({
      className: "radar-pin",
      html: '<span class="radar-pin-tacka" style="--boja:' + statusInfo(prijava).boja + '"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }

  function markerZa(prijava, mapa) {
    return L.marker(prijava.lokacija, { icon: ikona(prijava), title: VRSTE[prijava.vrsta] || "Prijava" })
      .addTo(mapa);
  }

  // Ivice poligona pripadaju području, kao i u serverskoj proveri.
  function uGranici(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || GRANICA.length < 3) return false;
    var inside = false, previous = GRANICA[GRANICA.length - 1];
    for (var i = 0; i < GRANICA.length; i++) {
      var current = GRANICA[i], ay = previous[0], ax = previous[1], by = current[0], bx = current[1];
      var cross = (lon - ax) * (by - ay) - (lat - ay) * (bx - ax);
      if (Math.abs(cross) <= 1e-12 && lon >= Math.min(ax,bx)-1e-10 && lon <= Math.max(ax,bx)+1e-10 && lat >= Math.min(ay,by)-1e-10 && lat <= Math.max(ay,by)+1e-10) return true;
      if ((ay > lat) !== (by > lat) && lon < (bx - ax) * (lat - ay) / (by - ay) + ax) inside = !inside;
      previous = current;
    }
    return inside;
  }

  // ---- delovi stranice ----
  function prikaziPodrsku(prijava) {
    var zavrseni = ["prosledjeno", "u_radu", "odgovor", "reseno", "odbijeno", "zatvoreno"];
    return zavrseni.indexOf(prijava.status) === -1 && !(prijava.istorija || []).some(function (event) {
      return zavrseni.indexOf(event.status) !== -1;
    });
  }
  function htmlKartica(prijava, opcije) {
    var status = statusInfo(prijava);
    var dana = danaOd(prijava.datum);
    var meta = (VRSTE[prijava.vrsta] || "Prijava") + " · " + (prijava.adresa || 'Lokacija na mapi') + " · prijavljeno " + formatDatum(prijava.datum);
    var podrske = prijava.podrske
      ? prijava.podrske + " komšija podržava"
      : "još bez podrške";
    return '' +
      '<article class="prijava' + (predugo(prijava) ? " prijava--predugo" : "") + '">' +
        '<p class="prijava-vrh">' +
          '<span class="znacka" style="--boja:' + status.boja + '">' + bezbedno(status.naziv) + '</span>' +
          (predugo(prijava) ? '<span class="znacka znacka--predugo">čeka predugo</span>' : '') +
        '</p>' +
        '<h3>' + bezbedno(skrati(prijava.opis, 90)) + '</h3>' +
        (prijava.na_mapi === false ? '<p class="prijava-meta">Rešena prijava je u arhivi; više nije prikazana na mapi.</p>' : '') +
        '<p class="prijava-meta">' + bezbedno(meta) + ' · ' + dodajDane(dana) + '</p>' +
        (prikaziPodrsku(prijava) ? '<p class="prijava-meta">' + bezbedno(podrske) + '</p>' : '') +
        (opcije && opcije.dugme === false ? '' :
          '<button class="veza-jaka prijava-otvori" type="button" data-prijava="' +
            bezbedno(prijava.id) + '">Otvori prijavu</button>' +
          (prikaziPodrsku(prijava) ? '<button class="dugme dugme--akcenat" type="button" data-prijava="' + bezbedno(prijava.id) + '" data-odmah-podrzi>Podrži prijavu</button>' : '')) +
      '</article>';
  }

  function podesiVisinuTabele(el) {
    if (el._radarObserver) el._radarObserver.disconnect();
    var table = el.querySelector('.radar-tabela');
    if (!table || table.tBodies[0].rows.length <= 10) {
      el.style.maxHeight = '';
      return;
    }
    var frame = 0;
    function izmeri() {
      frame = 0;
      var rows = table.tBodies[0].rows;
      if (!table.isConnected || rows.length <= 10) return;
      var height = table.tHead.getBoundingClientRect().height + 2;
      for (var i = 0; i < 10; i++) height += rows[i].getBoundingClientRect().height;
      var value = Math.ceil(height) + 'px';
      if (el.style.maxHeight !== value) el.style.maxHeight = value;
    }
    function zakazi() { if (!frame) frame = requestAnimationFrame(izmeri); }
    if (window.ResizeObserver) {
      el._radarObserver = new ResizeObserver(zakazi);
      el._radarObserver.observe(el);
      el._radarObserver.observe(table);
    }
    izmeri();
  }

  function nacrtajListu(el, prijave, opcije) {
    if (!el) { return; }
    if (!prijave.length) {
      if (el._radarObserver) el._radarObserver.disconnect();
      el.style.maxHeight = '';
      el.innerHTML = '<p class="lista-prazna">Nema prijava za izabrane filtere.</p>';
      return;
    }
    var redovi = prijave.map(function(prijava) {
      var status = statusInfo(prijava), id = bezbedno(prijava.id);
      var prikazPodrske = prikaziPodrsku(prijava);
      var aktivnosti = opcije && opcije.dugme === false ? '' :
        '<button class="veza-jaka prijava-otvori" type="button" data-prijava="' + id + '">Detalji</button>' +
        (prikazPodrske ? '<button class="radar-tabela-podrzi" type="button" data-prijava="' + id + '" data-odmah-podrzi>Podrži</button>' : '');
      return '<tr>' +
        '<td><time datetime="' + bezbedno(prijava.datum) + '">' + bezbedno(formatDatum(prijava.datum)) + '</time></td>' +
        '<td><strong>' + bezbedno(skrati(prijava.opis, 90)) + '</strong><span class="radar-tabela-dodatno">' + bezbedno(VRSTE[prijava.vrsta] || 'Prijava') + '</span></td>' +
        '<td>' + bezbedno(prijava.adresa || 'Lokacija na mapi') + '</td>' +
        '<td><span class="znacka" style="--boja:' + status.boja + '">' + bezbedno(status.naziv) + '</span>' +
          (predugo(prijava) ? '<span class="znacka znacka--predugo">čeka predugo</span>' : '') +
          (prijava.na_mapi === false ? '<span class="radar-tabela-dodatno">Više nije na mapi</span>' : '') +
          (prikazPodrske ? '<span class="radar-tabela-dodatno">' + (Number(prijava.podrske) || 0) + ' podrški</span>' : '') + '</td>' +
        '<td><div class="radar-tabela-akcije">' + aktivnosti + '</div></td>' +
      '</tr>';
    }).join('');
    el.innerHTML = '<table class="radar-tabela"><caption class="skriveno">Spisak prijava, od najnovije ka najstarijoj</caption>' +
      '<thead><tr><th scope="col">Datum</th><th scope="col">Prijava</th><th scope="col">Lokacija</th><th scope="col">Status</th><th scope="col">Akcije</th></tr></thead>' +
      '<tbody>' + redovi + '</tbody></table>';
    podesiVisinuTabele(el);
  }

  window.RADAR = {
    VRSTE: VRSTE,
    STATUSI: STATUSI,
    predugo: predugo,
    danaOd: danaOd,
    formatDatum: formatDatum,
    statusInfo: statusInfo,
    bezbedno: bezbedno,
    skrati: skrati,
    dodajDane: dodajDane,
    napraviMapu: napraviMapu,
    ikona: ikona,
    markerZa: markerZa,
    htmlKartica: htmlKartica,
    uGranici: uGranici,
    prikaziPodrsku: prikaziPodrsku,
    nacrtajListu: nacrtajListu
  };
})();
