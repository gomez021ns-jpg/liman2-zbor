/* Komšijski radar - logika stranice.
   Koristi radar-osnova.js. Radi u dva režima:
   data-radar="kompakt" - pregled na naslovnoj strani; data-radar="pun" - cela strana radara. */
(async function () {
  "use strict";
  var stanjeApi = {};
  var statusApi = document.getElementById('radar-api-status');
  // Prijave dolaze sa servisa (/api/). Kad servisa nema (strana otvorena sa diska, pregled na GitHub
  // Pages, servis pao), radar se ipak nacrta - iz data/prijave.js - a slanje prijava i podrške se
  // isključi uz poruku. Strana u pozadini proverava da li se servis vratio (vidi cekajServis).
  var SA_DISKA = location.protocol === "file:";
  var NEDOSTUPAN = "Slanje prijava i podrške trenutno ne radi - radar nije povezan sa serverom. " +
    "Pokušaj malo kasnije ili piši Zboru.";
  var VEZA_PUKLA = "Veza sa radarom nije uspela - pokušaj ponovo malo kasnije.";
  var POVEZAN = false;
  if (!SA_DISKA) {
    try {
      var odgovorApi = await fetch('/api/reports', {cache:'no-store', signal:typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8000) : undefined});
      if (!odgovorApi.ok) throw new Error('API');
      var podaciApi = await odgovorApi.json();
      if (!Array.isArray(podaciApi)) throw new Error('API');
      window.PRIJAVE = podaciApi;
      POVEZAN = true;
    } catch (greska) { /* ostaje data/prijave.js */ }
  }
  if (POVEZAN) {
    fetch('/api/health', {cache:'no-store'}).then(function(r) { return r.json(); }).then(function(data) {
      stanjeApi = data;
      if (statusApi && data.mail_mode !== 'smtp') statusApi.textContent = 'Test režim: mejl obaveštenja se ne šalju na stvarne adrese.';
    }).catch(function() {});
  } else {
    if (statusApi) {
      statusApi.textContent = SA_DISKA
        ? "Strana je otvorena sa diska - prijave se šalju samo preko sajta na internetu."
        : NEDOSTUPAN;
      statusApi.classList.add("radar-api-nedostupan");
    }
    if (!SA_DISKA) { cekajServis(); }
  }

  // Servis se vratio: ako komšija još ništa nije uneo, strana se tiho osveži; inače se samo
  // uključi slanje, da se ne izgubi ono što je napisao. Proverava se sve ređe (20 s → 5 min).
  function cekajServis() {
    var pauza = 20000;
    function proveri() {
      if (document.hidden) { setTimeout(proveri, pauza); return; }
      fetch('/api/health', {cache:'no-store'}).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d || !d.ok) { throw new Error('API'); }
        var forma = document.getElementById("forma-radar");
        var uneto = forma && Array.prototype.some.call(forma.elements, function (polje) {
          if (polje.tagName === "SELECT") { return polje.selectedIndex > 0; }
          return polje.type !== "submit" && polje.type !== "button" && !!polje.value;
        });
        if (!uneto) { location.reload(); return; }
        POVEZAN = true; stanjeApi = d;
        if (statusApi) {
          statusApi.classList.remove("radar-api-nedostupan");
          statusApi.textContent = "Veza sa radarom je ponovo tu - možeš da pošalješ prijavu.";
        }
        var dugme = forma.querySelector('button[type="submit"]');
        if (dugme) { dugme.disabled = false; }
      }).catch(function () {
        pauza = Math.min(pauza * 2, 300000);
        setTimeout(proveri, pauza);
      });
    }
    setTimeout(proveri, pauza);
  }

  var R = window.RADAR;
  var P = window.LIMAN2 || {};
  var ADRESA = P.adresaZbora || "";

  if (!R) { return; }

  var SVE = (window.PRIJAVE || []).slice().sort(function (a, b) {
    return (b.kreirano || 0) - (a.kreirano || 0) || String(b.datum || "").localeCompare(String(a.datum || ""));
  });

  // Jedna mapa na strani: pregled prijava i izbor tačke za novu prijavu su ISTA mapa.
  // Napravi je pokreniPunu (data-radar="pun"), pa je obrazac koristi - ranije su bile dve mape.
  var MAPA_STRANE = null;

  function poId(id) {
    for (var i = 0; i < SVE.length; i++) {
      if (SVE[i].id === id) { return SVE[i]; }
    }
    return null;
  }

  // Link ka prijavi. Kad je strana otvorena sa diska (file://) ovo je putanja sa ovog računara -
  // domaćinu koristi, ali komšija je ne može otvoriti, pa htmlDetalj uz nju daje napomenu.
  function linkPrijave(id) {
    return location.href.split("#")[0] + "#p-" + id;
  }

  function popupHtml(prijava) {
    var status = R.statusInfo(prijava);
    return '<div class="radar-popup">' +
      '<span class="znacka" style="--boja:' + status.boja + '">' + R.bezbedno(status.naziv) + '</span>' +
      '<strong>' + R.bezbedno(R.VRSTE[prijava.vrsta] || "Prijava") + '</strong>' +
      '<p>' + R.bezbedno(R.skrati(prijava.opis, 110)) + '</p>' +
      (R.predugo(prijava)
        ? '<p class="radar-popup-predugo">čeka predugo - ' + R.dodajDane(R.danaOd(prijava.datum)) + '</p>'
        : '') +
      '</div>';
  }

  // ---- prazno stanje ----
  // `veza` prazna = bez dugmeta (na naslovnoj sekcija već ima svoje dugme "Prijavi problem",
  // pa bi se pojavila dva ista dugmeta jedan pod drugim)
  function praznoHtml(veza, naslov, tekst) {
    return '<div class="prazno">' +
      '<p class="prazno-naslov">' + R.bezbedno(naslov) + '</p>' +
      '<p class="prazno-tekst">' + R.bezbedno(tekst) + '</p>' +
      (veza ? '<a class="dugme dugme--akcenat" href="' + R.bezbedno(veza) + '">Prijavi problem</a>' : '') +
      '</div>';
  }

  // ---- pregled na naslovnoj strani ----
  function pokreniKompakt(el) {
    var mapa = R.napraviMapu(el, { pomeranje: true, tocak: false });
    var lista = document.getElementById("radar-lista");
    var broj = document.getElementById("radar-broj");
    var najpodrzanije = SVE.slice().sort(function (a, b) {
      return (b.podrske || 0) - (a.podrske || 0);
    }).slice(0, 3);

    if (mapa) {
      SVE.filter(function(prijava) { return prijava.na_mapi !== false; }).forEach(function (prijava) {
        var marker = R.markerZa(prijava, mapa);
        marker.bindPopup(popupHtml(prijava));
        marker.on("popupopen", function () {
          var popup = marker.getPopup().getElement();
          if (!popup) { return; }
          var veza = document.createElement("a");
          veza.className = "veza-jaka";
          veza.href = "radar.html#p-" + prijava.id;
          veza.textContent = "Otvori prijavu";
          popup.appendChild(veza);
        });
      });
    }

    if (lista) {
      if (!SVE.length) {
        // bez dugmeta: u sekciji ispod liste stoji stalno dugme "Prijavi problem"
        lista.innerHTML = POVEZAN
          ? praznoHtml("", "Trenutno nema prijava",
            "Radar je prazan - nijedan problem iz kraja još nije prijavljen. Ako znaš za problem " +
            "(rasveta, smeće, parking, zelenilo, trotoar), prijavi ga i prati šta se dešava.")
          : praznoHtml("", "Prijave trenutno ne mogu da se učitaju",
            "Radar nije povezan sa serverom. Pokušaj ponovo malo kasnije.");
      } else {
        lista.innerHTML = najpodrzanije.map(function (prijava) {
          var status = R.statusInfo(prijava);
          return '<a class="prijava" href="radar.html#p-' + R.bezbedno(prijava.id) + '">' +
            '<span class="znacka" style="--boja:' + status.boja + '">' + R.bezbedno(status.naziv) + '</span>' +
            '<h3>' + R.bezbedno(R.skrati(prijava.opis, 70)) + '</h3>' +
            '<p class="prijava-meta">' + (R.prikaziPodrsku(prijava) ? (prijava.podrske || 0) + ' komšija podržava · ' : '') +
              (R.predugo(prijava) ? '<b>čeka predugo</b>' : 'pre ' + R.dodajDane(R.danaOd(prijava.datum))) +
            '</p></a>';
        }).join("");
      }
    }

    if (broj) {
      var cekaju = SVE.filter(R.predugo).length;
      if (SVE.length) {
        broj.hidden = false;
        broj.textContent = SVE.length + " prijava" + (cekaju ? " · " + cekaju + " čeka predugo" : "");
      } else {
        // prazno stanje iznad već piše da nema prijava - ovaj red se sklanja da se ne ponavlja
        broj.textContent = "";
        broj.hidden = true;
      }
    }
  }

  // ---- cela strana radara ----
  function pokreniPunu(el) {
    var mapa = R.napraviMapu(el, { pomeranje: true, tocak: !document.querySelector(".radar-naslovna") });
    MAPA_STRANE = mapa;                        // istu mapu koristi i obrazac za izbor tačke prijave
    var sloj = mapa ? L.layerGroup().addTo(mapa) : null;
    var lista = document.getElementById("radar-lista");
    var listaPredugo = document.getElementById("radar-predugo");
    var brojac = document.getElementById("radar-brojac");
    var filterVrsta = document.getElementById("filter-vrsta");
    var filterStatus = document.getElementById("filter-status");
    var filterPredugo = document.getElementById("filter-predugo");

    var trakaFiltera = document.querySelector('.filteri');
    var sekcijaFiltera = trakaFiltera && trakaFiltera.closest('section');
    var sekcijaPredugo = listaPredugo && listaPredugo.closest('section');

    // padajuće liste se pune iz podataka, da se ne raziđu sa spiskom vrsta i statusa
    if (filterVrsta) {
      Object.keys(R.VRSTE).forEach(function (kljuc) {
        filterVrsta.insertAdjacentHTML("beforeend",
          '<option value="' + kljuc + '">' + R.bezbedno(R.VRSTE[kljuc]) + "</option>");
      });
    }
    if (filterStatus) {
      Object.keys(R.STATUSI).forEach(function (kljuc) {
        filterStatus.insertAdjacentHTML("beforeend",
          '<option value="' + kljuc + '">' + R.bezbedno(R.STATUSI[kljuc].naziv) + "</option>");
      });
    }

    function izabrane() {
      var vrsta = filterVrsta ? filterVrsta.value : "";
      var status = filterStatus ? filterStatus.value : "";
      var samoPredugo = filterPredugo ? filterPredugo.checked : false;
      return SVE.filter(function (prijava) {
        if (vrsta && prijava.vrsta !== vrsta) { return false; }
        if (status && prijava.status !== status) { return false; }
        if (samoPredugo && !R.predugo(prijava)) { return false; }
        return true;
      });
    }

    function osvezi() {
      var prikazi = izabrane();

      if (sloj) {
        sloj.clearLayers();
        prikazi.filter(function(prijava) { return prijava.na_mapi !== false; }).forEach(function (prijava) {
          var marker = R.markerZa(prijava, sloj);
          marker.bindPopup(popupHtml(prijava));
          marker.on("click", function () { otvoriDetalj(prijava.id, true); });
        });
      }

      if (sekcijaFiltera) sekcijaFiltera.hidden = !SVE.length;
      if (sekcijaPredugo) sekcijaPredugo.hidden = !SVE.length;
      if (lista && !SVE.length) {
        if (lista._radarObserver) lista._radarObserver.disconnect();
        lista.style.maxHeight = '';
        lista.innerHTML = POVEZAN
          ? praznoHtml('', 'Trenutno nema prijava', 'Još nema objavljenih prijava. Ako znaš za problem u kraju, prijavi ga.')
          : praznoHtml('', 'Prijave trenutno ne mogu da se učitaju', 'Radar nije povezan sa serverom. Pokušaj ponovo malo kasnije.');
      } else { R.nacrtajListu(lista, prikazi); }
      if (brojac) {
        brojac.textContent = prikazi.length + " od " + SVE.length + " prijava";
      }

      if (listaPredugo) {
        var cekaju = SVE.filter(R.predugo);
        listaPredugo.innerHTML = cekaju.length
          ? cekaju.map(function (prijava) {
              return '<li><a href="#p-' + R.bezbedno(prijava.id) + '">' +
                R.bezbedno(R.skrati(prijava.opis, 70)) + '</a> - ' +
                R.dodajDane(R.danaOd(prijava.datum)) + ' bez odgovora</li>';
            }).join("")
          : '<li class="lista-prazna">Trenutno nema prijava koje čekaju predugo.</li>';
      }
    }

    [filterVrsta, filterStatus, filterPredugo].forEach(function (polje) {
      if (polje) { polje.addEventListener("change", osvezi); }
    });

    function centrirajNa(id) {
      var prijava = poId(id);
      if (prijava && mapa) {
        mapa.setView(prijava.lokacija, Math.max(mapa.getZoom(), 17));
      }
    }

    // ---- detalj prijave (svaka prijava ima svoju adresu: radar.html#p-<id>) ----
    var dijalog = document.getElementById("dlg-detalj");
    var sadrzaj = document.getElementById("detalj-sadrzaj");
    var menjamAdresu = false;

    function htmlDetalj(prijava) {
      var status = R.statusInfo(prijava);
      var fotografija = prijava.fotografija
        ? '<img class="detalj-foto" src="data/fotografije/' + R.bezbedno(prijava.fotografija) +
          '" alt="Fotografija uz prijavu">'
        : '';
      var istorija = (prijava.istorija || []).map(function (korak) {
        var stanje = R.statusInfo(korak);
        return '<li><span class="detalj-korak" style="--boja:' + stanje.boja + '">' +
          R.bezbedno(stanje.naziv) + '</span> ' +
          '<time datetime="' + R.bezbedno(korak.datum) + '">' + R.formatDatum(korak.datum) + '</time>' +
          '<p>' + R.bezbedno(korak.napomena) + '</p></li>';
      }).join("");
      return '' +
        '<p class="detalj-vrh">' +
          '<span class="znacka" style="--boja:' + status.boja + '">' + R.bezbedno(status.naziv) + '</span>' +
          (R.predugo(prijava) ? '<span class="znacka znacka--predugo">čeka predugo</span>' : '') +
        '</p>' +
        '<p class="detalj-meta">' + R.bezbedno(R.VRSTE[prijava.vrsta] || "Prijava") +
          ' · prijavljeno ' + R.formatDatum(prijava.datum) +
          ' · ' + R.dodajDane(R.danaOd(prijava.datum)) + '</p>' +
        '<p class="detalj-opis">' + R.bezbedno(prijava.opis) + '</p>' +
        fotografija +
        '<h3 class="detalj-podnaslov">Tok prijave</h3>' +
        '<ol class="detalj-istorija">' + istorija + '</ol>' +
        (R.prikaziPodrsku(prijava) && !POVEZAN ? '<p class="detalj-podrske">' + (prijava.podrske || 0) + ' komšija podržava</p>' +
          '<p class="detalj-napomena">' + R.bezbedno(NEDOSTUPAN) + '</p>' : '') +
        (R.prikaziPodrsku(prijava) && POVEZAN ? '<p class="detalj-podrske">' + (prijava.podrske || 0) + ' komšija podržava</p>' +
          '<button class="dugme dugme--akcenat" type="button" id="podrzi-dugme">Podrži prijavu</button>' +
          '<form id="podrzi-forma" hidden><label for="podrzi-email">Tvoja e-pošta</label><input id="podrzi-email" type="email" autocomplete="email" maxlength="254" required placeholder="ime@primer.rs"><p class="detalj-napomena">Poslaćemo ti link za potvrdu podrške. Adresa nije javna.</p><button class="dugme dugme--akcenat" type="submit">Pošalji link za potvrdu</button><p id="podrzi-status" role="status"></p></form>' : '') +
        '<p class="detalj-status" role="status"></p>';
    }

    function otvoriDetalj(id, promeniAdresu) {
      var prijava = poId(id);
      if (!prijava || !dijalog || !sadrzaj) { return; }
      sadrzaj.innerHTML = htmlDetalj(prijava);
      if (typeof dijalog.showModal === "function") {
        if (!dijalog.open) { dijalog.showModal(); }
      } else if (!dijalog.hasAttribute("open")) {
        dijalog.setAttribute("open", "open");
      }
      if (promeniAdresu) {
        menjamAdresu = true;
        location.hash = "p-" + id;
      }
      centrirajNa(id);

      var dugmePodrska = document.getElementById("podrzi-dugme");
      var formaPodrska = document.getElementById("podrzi-forma");
      if (dugmePodrska && formaPodrska) {
        dugmePodrska.addEventListener("click", function () {
          dugmePodrska.hidden = true; formaPodrska.hidden = false;
          document.getElementById("podrzi-email").focus();
        });
        formaPodrska.addEventListener("submit", async function (event) {
          event.preventDefault();
          var input = document.getElementById("podrzi-email");
          var message = document.getElementById("podrzi-status");
          var submit = formaPodrska.querySelector('button[type="submit"]');
          if (!input.reportValidity()) return;
          submit.disabled = true; message.textContent = "Šaljemo link…";
          try {
            var response = await fetch('/api/support/request', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({report_id:id,email:input.value.trim()})});
            var data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Slanje nije uspelo.');
            input.hidden = true; formaPodrska.querySelector('label').hidden = true;
            formaPodrska.querySelector('.detalj-napomena').hidden = true; submit.hidden = true;
            message.textContent = data.message + (stanjeApi.mail_mode === 'test' ? ' Test režim: poruka je sačuvana lokalno, nije poslata.' : '');
          } catch (err) { message.textContent = (err instanceof TypeError ? VEZA_PUKLA : err.message) || 'Slanje nije uspelo.'; submit.disabled = false; }
        });
      }
    }

    if (dijalog) {
      dijalog.addEventListener("close", function () {
        if (location.hash.indexOf("#p-") === 0) {
          try {
            history.replaceState(null, "", location.pathname + location.search);
          } catch (greska) {
            location.hash = "";
          }
        }
      });
    }

    window.addEventListener("hashchange", function () {
      if (menjamAdresu) { menjamAdresu = false; return; }
      var id = (location.hash || "").replace("#p-", "");
      if (location.hash.indexOf("#p-") === 0 && poId(id)) {
        otvoriDetalj(id, false);
      } else if (dijalog && dijalog.open) {
        dijalog.close();
      }
    });

    document.addEventListener("click", function (dogadjaj) {
      var cilj = dogadjaj.target;
      var dugme = cilj && cilj.closest ? cilj.closest("[data-prijava]") : null;
      if (!dugme) { return; }
      dogadjaj.preventDefault();
      otvoriDetalj(dugme.getAttribute("data-prijava"), true);
      if (dugme.hasAttribute("data-odmah-podrzi")) {
        var podrska = document.getElementById("podrzi-dugme");
        if (podrska) podrska.click();
      }
    });

    osvezi();
    // Prikaži prijave i kada su izvan početnog kadra granice naselja.
    if (mapa && SVE.some(function(p) { return p.na_mapi !== false; })) {
      var granice = mapa.getBounds();
      SVE.forEach(function(p) { if (p.na_mapi !== false && Array.isArray(p.lokacija)) granice.extend(p.lokacija); });
      mapa.fitBounds(granice, {padding:[18,18], maxZoom:15, animate:false});
    }
    if (mapa && window.ResizeObserver) {
      var observer = new ResizeObserver(function() { mapa.invalidateSize({pan:false}); });
      observer.observe(el);
    }
    var prethodniPodaci = JSON.stringify(SVE);
    var trajeOsvezavanje = false, ponovno = false;
    async function osveziPodatke() {
      if (trajeOsvezavanje) { ponovno = true; return; }
      trajeOsvezavanje = true;
      try {
        var response = await fetch('/api/reports', {cache:'no-store'});
        if (!response.ok) throw new Error('API');
        var podaci = await response.json();
        podaci.sort(function(a,b) { return (b.kreirano || 0) - (a.kreirano || 0) || String(b.datum || '').localeCompare(String(a.datum || '')); });
        var noviPodaci = JSON.stringify(podaci);
        if (noviPodaci !== prethodniPodaci) {
          var poznati = new Set(SVE.filter(function(p) { return p.na_mapi !== false; }).map(function(p) { return p.id; }));
          var dodate = podaci.filter(function(p) { return p.na_mapi !== false && !poznati.has(p.id) && Array.isArray(p.lokacija); });
          prethodniPodaci = noviPodaci; SVE = podaci; window.PRIJAVE = podaci;
          osvezi();
          if (mapa && dodate.some(function(p) { return !mapa.getBounds().contains(p.lokacija); })) {
            var kadar = mapa.getBounds(); dodate.forEach(function(p) { kadar.extend(p.lokacija); });
            mapa.fitBounds(kadar, {padding:[18,18], animate:false});
          }
        }
      } catch (_) { /* Sačuvaj poslednji prikaz; veza će pokušati ponovo. */ }
      finally { trajeOsvezavanje = false; if (ponovno) { ponovno = false; osveziPodatke(); } }
    }
    if (!POVEZAN) {
      // bez servisa nema ni osvežavanja uživo; kad se servis vrati, cekajServis osveži stranu
    } else if (window.EventSource) {
      var dogadjaji = new EventSource('/api/events');
      dogadjaji.addEventListener('update', osveziPodatke);
      window.addEventListener('pagehide', function() { dogadjaji.close(); }, {once:true});
      window.addEventListener('pageshow', function(e) { if (e.persisted) location.reload(); });
    } else { setInterval(osveziPodatke, 10000); }
    document.addEventListener('visibilitychange', function() { if (!document.hidden) osveziPodatke(); });

    // duboki link: radar.html#p-<id> otvara prijavu odmah
    if (location.hash.indexOf("#p-") === 0 && poId(location.hash.replace("#p-", ""))) {
      otvoriDetalj(location.hash.replace("#p-", ""), false);
    }
  }

  // ---- obrazac za prijavu problema ----
  function pokreniObrazac() {
    var forma = document.getElementById("forma-radar");
    if (!forma) { return; }
    var poljeVrsta = document.getElementById("radar-vrsta");
    var poljeOpis = document.getElementById("radar-opis");
    var poljeEposta = document.getElementById("radar-eposta");
    var poljeFoto = document.getElementById("radar-foto");
    var koordinate = document.getElementById("odabir-koordinate");
    var status = document.getElementById("radar-status");
    var brojacOpisa = document.getElementById("opis-broj");
    var pregled = document.getElementById("foto-pregled");
    var preuzmi = document.getElementById("foto-preuzmi");
    var ocistiFoto = document.getElementById("foto-ocisti");
    var dugmeLokacija = document.getElementById("moja-lokacija");
    var poljeUstanova = document.getElementById("radar-ustanova");
    var opisUstanove = document.getElementById("ustanova-opis");
    var ustanove = window.USTANOVE || [];
    var izabraoUstanovu = false;      // dok komšija sam ne izabere, ustanova se predlaže po vrsti problema

    var mapa = MAPA_STRANE;           // ista mapa kao pregled prijava - na strani nema druge mape
    var marker = null;
    var krugTacnosti = null;          // krug oko tačke kad je lokacija iz pregledača netačna
    var tacka = null;
    var ociscenaFotografija = null;

    function ustanovaPoId(id) {
      for (var i = 0; i < ustanove.length; i++) {
        if (ustanove[i].id === id) { return ustanove[i]; }
      }
      return null;
    }

    function ispisiUstanovu() {
      if (!opisUstanove) { return; }
      var izabrana = poljeUstanova ? ustanovaPoId(poljeUstanova.value) : null;
      if (!izabrana) {
        opisUstanove.textContent = "Prijava ide e-poštom izabrane ustanove, a kopija Zboru - da uđe u radar.";
        return;
      }
      var kopija = ADRESA && izabrana.email !== ADRESA ? " Kopija ide Zboru (" + ADRESA + ")." : "";
      opisUstanove.textContent = izabrana.opis + " Ide na: " + izabrana.email + "." + kopija;
    }

    if (poljeUstanova) {
      ustanove.forEach(function (ustanova) {
        poljeUstanova.insertAdjacentHTML("beforeend",
          '<option value="' + R.bezbedno(ustanova.id) + '">' + R.bezbedno(ustanova.naziv) + "</option>");
      });
      poljeUstanova.addEventListener("change", function () {
        izabraoUstanovu = true;
        ispisiUstanovu();
      });
      ispisiUstanovu();
    }

    if (poljeVrsta) {
      Object.keys(R.VRSTE).forEach(function (kljuc) {
        poljeVrsta.insertAdjacentHTML("beforeend",
          '<option value="' + kljuc + '">' + R.bezbedno(R.VRSTE[kljuc]) + "</option>");
      });

      // predlog ustanove po vrsti problema (komšija ga može promeniti)
      poljeVrsta.addEventListener("change", function () {
        if (izabraoUstanovu || !poljeUstanova) { return; }
        var vrsta = poljeVrsta.value;
        for (var i = 0; i < ustanove.length; i++) {
          if (ustanove[i].vrste.indexOf(vrsta) !== -1) {
            poljeUstanova.value = ustanove[i].id;
            ispisiUstanovu();
            return;
          }
        }
      });
    }

    function ispisiTacku() {
      if (!koordinate) { return; }
      if (!tacka) {
        koordinate.textContent = "Tačka nije izabrana - klikni na mapu.";
        return;
      }
      koordinate.innerHTML = "Izabrano: " + tacka[0].toFixed(5) + ", " + tacka[1].toFixed(5) +
        ' · <a href="https://www.openstreetmap.org/?mlat=' + tacka[0] + "&mlon=" + tacka[1] +
        "#map=18/" + tacka[0] + "/" + tacka[1] +
        '" target="_blank" rel="noopener">vidi na OpenStreetMap-u</a>';
    }

    function postaviTacku(lat, lon, centriraj, tacnost) {
      if (!R.uGranici(lat, lon)) {
        tacka = null;
        if (marker && mapa) { mapa.removeLayer(marker); marker = null; }
        if (krugTacnosti && mapa) { mapa.removeLayer(krugTacnosti); krugTacnosti = null; }
        var blizuVan = document.getElementById('radar-blizu');
        if (blizuVan) { blizuVan.hidden = true; blizuVan.textContent = ''; }
        if (koordinate) koordinate.textContent = 'Lokacija je van označene granice. Izaberi tačku unutar područja MZ Boško Buha.';
        if (status) status.textContent = 'Prijave su moguće samo unutar označene granice.';
        return false;
      }
      if (status) status.textContent = '';
      tacka = [lat, lon];
      if (mapa) {
        if (!marker) {
          marker = L.marker(tacka, {
            draggable: true,
            icon: L.divIcon({
              className: "radar-pin",
              html: '<span class="radar-pin-tacka radar-pin-tacka--odabir"></span>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            })
          }).addTo(mapa);
          marker.on("dragend", function () {
            var mesto = marker.getLatLng();
            postaviTacku(mesto.lat, mesto.lng, false);   // ručno pomereno - krug tačnosti više ne važi
          });
        } else {
          marker.setLatLng(tacka);
        }

        // krug tačnosti: pokaže dokle lokacija može da omaši (računar često zna samo po internetu)
        if (krugTacnosti) { mapa.removeLayer(krugTacnosti); krugTacnosti = null; }
        if (tacnost && tacnost > 0) {
          krugTacnosti = L.circle(tacka, {
            radius: tacnost,
            color: "#1f4fa0",
            weight: 1,
            opacity: 0.7,
            fillColor: "#1f4fa0",
            fillOpacity: 0.08,
            interactive: false
          }).addTo(mapa);
        }

        if (centriraj) {
          if (krugTacnosti) {
            mapa.fitBounds(krugTacnosti.getBounds().pad(0.3));   // vidi se cela nesigurnost
          } else {
            mapa.setView(tacka, Math.max(mapa.getZoom(), 17));
          }
        }
      }
      ispisiTacku();
      var blizu = document.getElementById('radar-blizu');
      if (blizu) {
        var kandidati = SVE.filter(function (p) {
          var dy = (p.lokacija[0] - lat) * 111000;
          var dx = (p.lokacija[1] - lon) * 78000;
          return Math.sqrt(dx * dx + dy * dy) < 150;
        }).slice(0, 4);
        blizu.hidden = !kandidati.length;
        blizu.innerHTML = kandidati.length ? '<strong>Prijave u blizini — proveri da li problem već postoji:</strong>' + kandidati.map(function(p) {
          return '<p><button type="button" class="veza-jaka prijava-otvori" data-prijava="' + R.bezbedno(p.id) + '">' + R.bezbedno(R.skrati(p.opis, 90)) + '</button></p>';
        }).join('') : '';
      }
      return true;
    }

    if (mapa) {
      mapa.on("click", function (dogadjaj) {
        postaviTacku(dogadjaj.latlng.lat, dogadjaj.latlng.lng, false);
      });
    }

    if (dugmeLokacija) {
      var porukaLokacije = function (greska) {
        if (!window.isSecureContext) {
          return "Pregledač daje lokaciju samo preko https ili lokalnog servera - kad se strana " +
            "otvori dvoklikom na fajl, lokacija je blokirana. Klikni tačku na mapi.";
        }
        if (!greska) { return "Lokacija nije dostupna - klikni tačku na mapi."; }
        if (greska.code === 1) {          // PERMISSION_DENIED
          return "Pregledač je odbio lokaciju za ovaj sajt. Klikni ikonicu lokacije levo u adresnoj " +
            "traci, izaberi \"Dozvoli\" i probaj ponovo - ili klikni tačku na mapi.";
        }
        if (greska.code === 2) {          // POSITION_UNAVAILABLE
          return "Lokacija nije dostupna. U Windows-u uključi Lokaciju (Podešavanja → Privatnost i " +
            "bezbednost → Lokacija) i probaj ponovo - ili klikni tačku na mapi.";
        }
        if (greska.code === 3) {          // TIMEOUT
          return "Traženje lokacije je isteklo - probaj ponovo ili klikni tačku na mapi.";
        }
        return "Lokacija nije dostupna - klikni tačku na mapi.";
      };

      dugmeLokacija.addEventListener("click", function () {
        if (!navigator.geolocation) {
          if (status) { status.textContent = "Pregledač ne daje lokaciju - klikni tačku na mapi."; }
          return;
        }
        if (!window.isSecureContext) {     // file:// ili http sa drugog računara - API je blokiran
          if (status) { status.textContent = porukaLokacije(null); }
          return;
        }
        if (status) { status.textContent = "Tražim lokaciju…"; }
        navigator.geolocation.getCurrentPosition(function (polozaj) {
          var tacnost = polozaj.coords.accuracy || 0;
          if (!postaviTacku(polozaj.coords.latitude, polozaj.coords.longitude, true, tacnost)) return;
          if (status) {
            var m = Math.round(tacnost);
            if (m > 150) {
              status.textContent = "Lokacija je nađena, ali netačno (±" + m + " m) - računar često " +
                "zna lokaciju samo po internetu. Pomeri marker ili klikni tačno mesto na mapi.";
            } else {
              status.textContent = "Lokacija upisana (tačnost ±" + m +
                " m). Proveri da li je tačka na pravom mestu.";
            }
          }
        }, function (greska) {
          if (status) { status.textContent = porukaLokacije(greska); }
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      });
    }

    if (poljeOpis && brojacOpisa) {
      var osveziBrojac = function () {
        brojacOpisa.textContent = poljeOpis.value.length + " / 500";
      };
      poljeOpis.addEventListener("input", osveziBrojac);
      osveziBrojac();
    }

    // Fotografija: smanjuje se na najviše 1600 px i ponovo kodira u JPEG,
    // pa u novom fajlu nema EXIF podataka (lokacija, uređaj, vreme snimanja).
    if (poljeFoto) {
      poljeFoto.addEventListener("change", function () {
        var fajl = poljeFoto.files && poljeFoto.files[0];
        if (!fajl) { return; }
        var citac = new FileReader();
        citac.onload = function () {
          var slika = new Image();
          slika.onload = function () {
            var najveca = 1600;
            var razmera = Math.min(1, najveca / Math.max(slika.width, slika.height));
            var platno = document.createElement("canvas");
            platno.width = Math.round(slika.width * razmera);
            platno.height = Math.round(slika.height * razmera);
            platno.getContext("2d").drawImage(slika, 0, 0, platno.width, platno.height);
            platno.toBlob(function (blob) {
              if (!blob) {
                if (status) { status.textContent = "Fotografiju nije moguće pripremiti."; }
                return;
              }
              ociscenaFotografija = blob;
              var adresa = URL.createObjectURL(blob);
              if (pregled) { pregled.src = adresa; pregled.hidden = false; }
              if (preuzmi) {
                preuzmi.href = adresa;
                preuzmi.download = "prijava-fotografija.jpg";
                preuzmi.hidden = false;
              }
              if (ocistiFoto) { ocistiFoto.hidden = false; }
              if (status) {
                status.textContent = "Fotografija je smanjena i očišćena od podataka o lokaciji i uređaju.";
              }
            }, "image/jpeg", 0.82);
          };
          slika.src = citac.result;
        };
        citac.readAsDataURL(fajl);
      });
    }

    if (!forma) { return; }

    // bez servisa se prijava ne može poslati - dugme je isključeno dok se veza ne vrati
    var dugmeSlanje = forma.querySelector('button[type="submit"]');
    if (dugmeSlanje && !POVEZAN) { dugmeSlanje.disabled = true; }

    forma.addEventListener("submit", function (dogadjaj) {
      dogadjaj.preventDefault();
      if (!POVEZAN) { if (status) { status.textContent = NEDOSTUPAN; } return; }

      var nedostaje = [];
      if (!tacka || !R.uGranici(tacka[0], tacka[1])) { nedostaje.push("tačka unutar označene granice na mapi"); }
      if (!poljeVrsta || !poljeVrsta.value) { nedostaje.push("vrsta problema"); }
      if (!poljeOpis || !poljeOpis.value.trim()) { nedostaje.push("opis"); }
      var eposta = poljeEposta ? poljeEposta.value.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) { nedostaje.push("e-pošta"); }
      if (nedostaje.length) {
        if (status) { status.textContent = "Popuni: " + nedostaje.join(", ") + "."; }
        return;
      }

      var podaci = {
        lokacija: tacka.slice(),
        vrsta: poljeVrsta.value,
        opis: poljeOpis.value.trim(),
        eposta: eposta,
        fotografija: ociscenaFotografija,
        poslato: new Date().toISOString()
      };

      var submit = forma.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      if (status) status.textContent = "Šaljemo prijavu…";
      function posalji(fotografija) {
        return fetch('/api/reports', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({vrsta:podaci.vrsta, opis:podaci.opis, eposta:podaci.eposta,
            lat:tacka[0], lon:tacka[1], adresa:(document.getElementById('radar-adresa').value || '').trim(),
            fotografija:fotografija})
        }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || 'Slanje nije uspelo'); return d; }); });
      }
      function gotovo(fotografija) {
        posalji(fotografija).then(function (result) {
          forma.reset(); tacka = null;
          if (marker && mapa) { mapa.removeLayer(marker); marker = null; }
          if (krugTacnosti && mapa) { mapa.removeLayer(krugTacnosti); krugTacnosti = null; }
          ociscenaFotografija = null;
          if (pregled) pregled.hidden = true;
          if (preuzmi) preuzmi.hidden = true;
          if (ocistiFoto) ocistiFoto.hidden = true;
          ispisiTacku(); if (brojacOpisa) brojacOpisa.textContent = '0 / 500';
          if (status) status.textContent = result.message + ' Broj prijave: ' + result.id + '.';
        }).catch(function (e) { if (status) status.textContent = e instanceof TypeError ? VEZA_PUKLA : e.message + ' Pokušaj ponovo.'; })
          .finally(function () { if (submit) submit.disabled = false; });
      }
      if (ociscenaFotografija) {
        var reader = new FileReader();
        reader.onload = function () { gotovo(String(reader.result).split(',')[1]); };
        reader.onerror = function () { if (status) status.textContent = 'Fotografiju nije moguće pročitati.'; if (submit) submit.disabled = false; };
        reader.readAsDataURL(ociscenaFotografija);
      } else { gotovo(null); }
    });
  }

  if (document.querySelector('[data-radar="kompakt"]')) {
    pokreniKompakt(document.querySelector('[data-radar="kompakt"]'));
  }
  if (document.querySelector('[data-radar="pun"]')) {
    pokreniPunu(document.querySelector('[data-radar="pun"]'));
  }
  pokreniObrazac();
})();
