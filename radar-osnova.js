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
    prijavljeno: { naziv: "Prijavljeno", boja: "#8a5200" },
    prosledjeno: { naziv: "Prosleđeno nadležnima", boja: "#1f4fa0" },
    odgovor: { naziv: "Stigao odgovor", boja: "#0d5f68" },
    reseno: { naziv: "Rešeno", boja: "#2d6b52" },
    odbijeno: { naziv: "Odbijeno", boja: "#55615f" }
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

  // ---- delovi stranice ----
  function htmlKartica(prijava, opcije) {
    var status = statusInfo(prijava);
    var dana = danaOd(prijava.datum);
    var meta = (VRSTE[prijava.vrsta] || "Prijava") + " · prijavljeno " + formatDatum(prijava.datum);
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
        '<p class="prijava-meta">' + bezbedno(meta) + ' · ' + dodajDane(dana) + '</p>' +
        '<p class="prijava-meta">' + bezbedno(podrske) + '</p>' +
        (opcije && opcije.dugme === false ? '' :
          '<button class="veza-jaka prijava-otvori" type="button" data-prijava="' +
            bezbedno(prijava.id) + '">Otvori prijavu</button>') +
      '</article>';
  }

  function nacrtajListu(el, prijave, opcije) {
    if (!el) { return; }
    if (!prijave.length) {
      el.innerHTML = '<p class="lista-prazna">Nema prijava za izabrane filtere.</p>';
      return;
    }
    el.innerHTML = prijave.map(function (p) { return htmlKartica(p, opcije); }).join("");
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
    nacrtajListu: nacrtajListu
  };
})();
