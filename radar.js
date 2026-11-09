/* Komšijski radar - logika stranice.
   Koristi radar-osnova.js. Radi u dva režima:
   data-radar="kompakt" - pregled na naslovnoj strani; data-radar="pun" - cela strana radara. */
(function () {
  "use strict";

  var R = window.RADAR;
  var P = window.LIMAN2 || {};
  var ADRESA = P.adresaZbora || "";

  if (!R) { return; }

  var SVE = (window.PRIJAVE || []).slice().sort(function (a, b) {
    return String(b.datum || "").localeCompare(String(a.datum || ""));
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
      SVE.forEach(function (prijava) {
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
        lista.innerHTML = praznoHtml("", "Trenutno nema prijava",
          "Radar je prazan - nijedan problem iz kraja još nije prijavljen. Ako znaš za problem " +
          "(rasveta, smeće, parking, zelenilo, trotoar), prijavi ga i prati šta se dešava.");
      } else {
        lista.innerHTML = najpodrzanije.map(function (prijava) {
          var status = R.statusInfo(prijava);
          return '<a class="prijava" href="radar.html#p-' + R.bezbedno(prijava.id) + '">' +
            '<span class="znacka" style="--boja:' + status.boja + '">' + R.bezbedno(status.naziv) + '</span>' +
            '<h3>' + R.bezbedno(R.skrati(prijava.opis, 70)) + '</h3>' +
            '<p class="prijava-meta">' + (prijava.podrske || 0) + ' komšija podržava · ' +
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
    var mapa = R.napraviMapu(el, { pomeranje: true, tocak: true });
    MAPA_STRANE = mapa;                        // istu mapu koristi i obrazac za izbor tačke prijave
    var sloj = mapa ? L.layerGroup().addTo(mapa) : null;
    var lista = document.getElementById("radar-lista");
    var listaPredugo = document.getElementById("radar-predugo");
    var brojac = document.getElementById("radar-brojac");
    var filterVrsta = document.getElementById("filter-vrsta");
    var filterStatus = document.getElementById("filter-status");
    var filterPredugo = document.getElementById("filter-predugo");

    // nema nijedne prijave - filteri nemaju šta da filtriraju, pa se sklanjaju zajedno sa sekcijom
    // (da ne ostane prazna traka i veliki razmak između uvoda i mapa)
    if (!SVE.length) {
      var trakaFiltera = document.querySelector(".filteri");
      if (trakaFiltera) {
        var sekcijaFiltera = trakaFiltera.closest ? trakaFiltera.closest("section") : null;
        if (sekcijaFiltera) { sekcijaFiltera.hidden = true; } else { trakaFiltera.hidden = true; }
      }
      if (lista) {
        // bez dugmeta: "Prijavi problem" stoji u zaglavlju (uvek vidljivo) i obrazac je odmah ispod
        lista.innerHTML = praznoHtml("", "Trenutno nema prijava",
          "Radar je prazan - nijedan problem iz kraja još nije prijavljen. Ako znaš za problem " +
          "(rasveta, smeće, parking, zelenilo, trotoar), prijavi ga i prati šta se dešava.");
      }
      if (listaPredugo) {
        // kad nema nijedne prijave, ni sekcija "Čeka predugo" nema šta da pokaže - sklanja se cela
        var sekcijaPredugo = listaPredugo.closest ? listaPredugo.closest("section") : null;
        if (sekcijaPredugo) { sekcijaPredugo.hidden = true; }
      }
      if (brojac) { brojac.textContent = ""; }
      return;
    }

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
        prikazi.forEach(function (prijava) {
          var marker = R.markerZa(prijava, sloj);
          marker.bindPopup(popupHtml(prijava));
          marker.on("click", function () { otvoriDetalj(prijava.id, true); });
        });
      }

      R.nacrtajListu(lista, prikazi);
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
        : '<div class="detalj-foto detalj-foto--nema">Fotografija nije priložena</div>';
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
        '<p class="detalj-podrske">' + (prijava.podrske || 0) + ' komšija podržava</p>' +
        '<p class="detalj-napomena">Podrška jednim klikom (uz potvrdu e-poštom) stiže sa serverom. ' +
          'Prijave objavljuje moderator, a lica i tablice na fotografijama se zamućuju pre objave.</p>' +
        '<div class="detalj-deljenje">' +
          '<input id="detalj-link" type="text" readonly value="' + R.bezbedno(linkPrijave(prijava.id)) + '">' +
          '<button class="dugme dugme--obrub" type="button" id="detalj-kopiraj">Kopiraj link</button>' +
        '</div>' +
        // sa diska (file://) je ovo putanja sa ovog računara - komšija ne može da je otvori
        (location.protocol === "file:"
          ? '<p class="detalj-napomena">Ovo je link sa tvog računara - radi samo na njemu. ' +
            'Link za deljenje komšijama radi kad sajt bude na internetu.</p>'
          : '') +
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

      var kopiraj = document.getElementById("detalj-kopiraj");
      var poruka = sadrzaj.querySelector(".detalj-status");
      if (kopiraj) {
        kopiraj.addEventListener("click", function () {
          var polje = document.getElementById("detalj-link");
          function javi(tekst) { if (poruka) { poruka.textContent = tekst; } }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(polje.value).then(
              function () { javi("Link je kopiran."); },
              function () { polje.select(); javi("Kopiraj ručno: Ctrl+C."); }
            );
          } else {
            polje.select();
            javi("Kopiraj ručno: Ctrl+C.");
          }
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
    });

    osvezi();

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
          postaviTacku(polozaj.coords.latitude, polozaj.coords.longitude, true, tacnost);
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

    forma.addEventListener("submit", function (dogadjaj) {
      dogadjaj.preventDefault();

      var nedostaje = [];
      if (!tacka) { nedostaje.push("tačka na mapi"); }
      if (!poljeVrsta || !poljeVrsta.value) { nedostaje.push("vrsta problema"); }
      if (!poljeOpis || !poljeOpis.value.trim()) { nedostaje.push("opis"); }
      var eposta = poljeEposta ? poljeEposta.value.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) { nedostaje.push("e-pošta"); }
      var primalac = poljeUstanova ? ustanovaPoId(poljeUstanova.value) : null;
      if (!primalac) { nedostaje.push("ustanova kojoj šalješ prijavu"); }
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

      /* FAZA 2 - kad bude server i baza:
         fetch("/api/prijave", { method: "POST", body: ... })
         Server tada šalje link za potvrdu na e-poštu (važi 24 sata), prijava se
         objavljuje posle potvrde i odobrenja moderatora, a podrška ide istim putem
         (jedan glas po e-mail adresi). Do tada prijava ide Zboru e-poštom. */

      var telo = [
        "Prijava problema sa sajta Liman 2 (Komšijski radar)",
        "",
        "Kome: " + primalac.naziv + " (" + primalac.email + ")",
        "Vrsta: " + (R.VRSTE[podaci.vrsta] || podaci.vrsta),
        "Tačka: " + podaci.lokacija[0].toFixed(5) + ", " + podaci.lokacija[1].toFixed(5),
        "Na mapi: https://www.openstreetmap.org/?mlat=" + podaci.lokacija[0] +
          "&mlon=" + podaci.lokacija[1] +
          "#map=18/" + podaci.lokacija[0] + "/" + podaci.lokacija[1],
        "",
        "Opis:",
        podaci.opis,
        "",
        "E-pošta za potvrdu i obaveštenja: " + eposta,
        ociscenaFotografija
          ? "Fotografija je pripremljena - prikači preuzetu kopiju uz ovu poruku (nema podatke o lokaciji)."
          : "Bez fotografije."
      ].join("\n");

      if (!primalac.email) {
        if (status) { status.textContent = "Izaberi kome šalješ prijavu (spisak ustanova je u obrascu)."; }
        return;
      }
      // kopija ide Zboru, osim kad je Zbor i primalac
      var adresaZbora = primalac.email !== ADRESA ? ADRESA : "";
      var kopija = adresaZbora ? "&cc=" + encodeURIComponent(adresaZbora) : "";

      window.location.href = "mailto:" + primalac.email +
        "?subject=" + encodeURIComponent("Prijava problema: " + (R.VRSTE[podaci.vrsta] || podaci.vrsta)) +
        "&body=" + encodeURIComponent(telo) + kopija;

      if (status) {
        status.textContent = "Otvara se program za poštu: prijava ide na " + primalac.email +
          (adresaZbora ? " (kopija Zboru: " + adresaZbora + ")" : "") +
          ". Pošalji poruku i prikači fotografiju ako je imaš.";
      }
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
