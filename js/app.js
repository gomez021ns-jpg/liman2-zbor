/* Liman 2 - ponašanje strana: dijalozi (predlog, pravila), kontakt i označavanje
   aktivne stavke menija. Nema servera ni praćenja posetilaca.
   Adresa Zbora i druge izmene domaćina stoje u podesavanja.js. */
(function () {
  "use strict";

  var P = window.LIMAN2 || {};
  var ADRESA_ZBORA = P.adresaZbora || "";

  // Koren sajta (folder iznad js/): strane su i u podfolderima (zapisnici/, nas-kraj/, akcije/),
  // pa se veze koje pravi skripta grade od korena, a ne od strane na kojoj se nalazi.
  var KOREN = document.currentScript && document.currentScript.src
    ? new URL("..", document.currentScript.src).href
    : "";

  function nadji(id) { return document.getElementById(id); }

  function otvoriDijalog(ime) {
    var dijalog = nadji("dlg-" + ime);
    if (!dijalog) { return; }
    if (typeof dijalog.showModal === "function") {
      dijalog.showModal();
    } else {
      dijalog.setAttribute("open", "open");        // stariji pregledači
    }
    var prvo = dijalog.querySelector("input, textarea");
    if (prvo) { prvo.focus(); }
  }

  function zatvoriDijalog(dijalog) {
    if (!dijalog) { return; }
    if (typeof dijalog.close === "function") {
      dijalog.close();
    } else {
      dijalog.removeAttribute("open");
    }
  }

  // Dugmad koja otvaraju dijalog
  document.querySelectorAll("[data-dijalog]").forEach(function (dugme) {
    dugme.addEventListener("click", function () {
      otvoriDijalog(dugme.getAttribute("data-dijalog"));
    });
  });

  // Zatvaranje: dugme "Otkaži/Zatvori" i klik na zatamnjeni deo
  document.querySelectorAll(".dijalog").forEach(function (dijalog) {
    dijalog.querySelectorAll("[data-zatvori]").forEach(function (dugme) {
      dugme.addEventListener("click", function () { zatvoriDijalog(dijalog); });
    });
    dijalog.addEventListener("click", function (dogadjaj) {
      if (dogadjaj.target === dijalog) { zatvoriDijalog(dijalog); }
    });
  });

  function proveri(forma) {
    var prvoLose = null;
    forma.querySelectorAll("[required]").forEach(function (polje) {
      if (!polje.value.trim()) {
        polje.setAttribute("aria-invalid", "true");
        if (!prvoLose) { prvoLose = polje; }
      } else {
        polje.removeAttribute("aria-invalid");
      }
    });
    return prvoLose;
  }

  function posaljiPostom(tema, telo, status) {
    if (!ADRESA_ZBORA) {
      status.textContent = "Adresa Zbora nije podešena (vidi podesavanja.js).";
      return;
    }
    status.textContent = "Otvara se program za poštu. Ako se ne otvori, pošalji isto na " + ADRESA_ZBORA + ".";
    var veza = "mailto:" + ADRESA_ZBORA +
      "?subject=" + encodeURIComponent(tema) +
      "&body=" + encodeURIComponent(telo);
    window.location.href = veza;
  }

  function kontaktPolje(forma) {
    var polje = forma.elements["kontakt"];
    return polje && polje.value.trim() ? "\nKontakt: " + polje.value.trim() : "";
  }

  // Predlog
  var formaPredlog = nadji("forma-predlog");
  if (formaPredlog) {
    formaPredlog.addEventListener("submit", function (dogadjaj) {
      dogadjaj.preventDefault();
      var status = formaPredlog.querySelector(".dijalog-status");
      var lose = proveri(formaPredlog);
      if (lose) {
        status.textContent = 'Popuni polja "Naslov predloga" i "Obrazloženje".';
        lose.focus();
        return;
      }
      var ime = formaPredlog.elements["ime"].value.trim();
      var telo = "Predlog sa sajta Liman 2\n\n" +
        formaPredlog.elements["tekst"].value.trim() + "\n\n" +
        "Poslao: " + (ime || "komšija (bez imena)") +
        kontaktPolje(formaPredlog);
      posaljiPostom("Predlog: " + formaPredlog.elements["naslov"].value.trim(), telo, status);
    });
  }

  // Očišćene greške kad posetilac počne da kuca
  document.querySelectorAll(".dijalog-forma input, .dijalog-forma textarea").forEach(function (polje) {
    polje.addEventListener("input", function () {
      if (polje.value.trim()) { polje.removeAttribute("aria-invalid"); }
    });
  });

  // Kontakt u podnožju: adresa iz podesavanja.js (da se menja na jednom mestu)
  document.querySelectorAll("[data-eposta]").forEach(function (veza) {
    if (!ADRESA_ZBORA) {
      veza.hidden = true;
      return;
    }
    // data-tema (npr. "Naš kraj: Štrand") ide u naslov poruke, da Zbor zna o čemu se piše
    var tema = veza.getAttribute("data-tema");
    veza.href = "mailto:" + ADRESA_ZBORA + (tema ? "?subject=" + encodeURIComponent(tema) : "");
    veza.title = ADRESA_ZBORA;
  });

  // Facebook stranica Zbora: adresa iz podesavanja.js
  document.querySelectorAll("[data-facebook]").forEach(function (veza) {
    if (!P.facebookStranica) {
      veza.hidden = true;
      return;
    }
    veza.href = P.facebookStranica;
  });

  // Instagram nalog Zbora: adresa iz podesavanja.js
  document.querySelectorAll("[data-instagram]").forEach(function (veza) {
    if (!P.instagram) {
      (veza.closest("li") || veza).hidden = true;
      return;
    }
    veza.href = P.instagram;
  });

  // Viber: data-viber="zbor" (Zbor građana) ili "komsije" (Zajednica komšija); linkovi iz
  // podesavanja.js, a bez linka stavka se ne vidi
  var VIBER = { zbor: P.viberZbor, komsije: P.viberKomsije };
  document.querySelectorAll("[data-viber]").forEach(function (veza) {
    var adresa = VIBER[veza.getAttribute("data-viber")];
    if (!adresa) {
      (veza.closest("li") || veza).hidden = true;
      return;
    }
    veza.href = adresa;
  });

  // Kartica "Sledeći zbor": podaci iz podesavanja.js (ništa se ne izmišlja)
  function kaoDatum(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) { return iso; }
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear() + ".";
  }

  var kada = document.querySelector("[data-zbor-kada]");
  function prikaziSledeciZbor() {
    if (!kada) return;
    var sledeci = P.sledeciZbor || {};
    var imaDatum = !!(sledeci.datum && sledeci.datum.length);
    kada.textContent = imaDatum ? kaoDatum(sledeci.datum) + (sledeci.vreme ? " u " + sledeci.vreme : "") : "Još nije zakazan";
    var gde = document.querySelector("[data-zbor-gde]");
    if (gde) { gde.hidden = !(imaDatum && sledeci.mesto); gde.textContent = sledeci.mesto || ''; }
    var red = document.querySelector("[data-zbor-red]");
    if (red) {
      var tacke = sledeci.dnevniRed || [];
      red.hidden = !(imaDatum && tacke.length);
      red.textContent = tacke.length ? "Dnevni red: " + tacke.join(" · ") : '';
    }
  }
  prikaziSledeciZbor();

  /* ---------- "Podeli stranu": sistemski prozor ili kopiranje linka ----------
     Nema spoljnog servisa ni praćenja: link se deli preko telefona/pregledača. */
  function adresaStrane() {
    // bez #dela i bez upita - deli se čist link na stranu
    // Kad je strana otvorena sa diska (file://) NE postoji link koji bi komšija mogao da otvori:
    // `location.origin` je za file: različit po pregledačima - Edge/Chrome daju "file://" (pa bi
    // se kopirala putanja file:///C:/Users/… sa ovog računara), a Firefox i Safari daju doslovno
    // "null" (pa bi tekst bio "null/C:/Users/…"). Zato se vraća prazno, a podeli() to javi.
    // Kad sajt dobije domen, ovo radi samo od sebe - ništa se ne menja.
    if (location.protocol === "file:") { return ""; }
    return location.origin + location.pathname;
  }

  function potvrdiNaDugmetu(dugme, tekst) {
    var prvo = dugme.getAttribute("data-prvobitni-tekst");
    if (prvo === null) {
      prvo = dugme.textContent;
      dugme.setAttribute("data-prvobitni-tekst", prvo);
    }
    dugme.textContent = tekst;
    window.setTimeout(function () { dugme.textContent = prvo; }, 2500);
  }

  function podeli(dugme) {
    var adresa = adresaStrane();
    if (!adresa) {
      // strana je otvorena sa diska - nema linka koji bi komšija otvorio (vidi adresaStrane)
      potvrdiNaDugmetu(dugme, "Nema linka za deljenje");
      return;
    }
    var podaci = { title: document.title, url: adresa };
    if (navigator.share) {
      // telefon/tablet: sistemski prozor za deljenje (Viber, WhatsApp, mejl…)
      navigator.share(podaci).catch(function () { /* posetilac je odustao */ });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(podaci.url).then(function () {
        potvrdiNaDugmetu(dugme, "Link je kopiran");
      }, function () {
        potvrdiNaDugmetu(dugme, "Kopiraj iz adrese");
      });
      return;
    }
    window.prompt("Kopiraj link:", podaci.url);
  }

  document.querySelectorAll("[data-podeli]").forEach(function (dugme) {
    dugme.addEventListener("click", function () { podeli(dugme); });
  });

  /* ---------- "Dodaj u kalendar" (.ics) ----------
     Vreme se piše kao lokalno (bez "Z" i bez TZID): kalendar ga tumači u zoni posetioca,
     što je za zbor u Novom Sadu tačno. Trajanje se NE upisuje - Zbor ga ne objavljuje. */
  function zaIcs(tekst) {
    return String(tekst === undefined || tekst === null ? "" : tekst)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  // RFC 5545: red se prelama na najviše 75 OKTETA (UTF-8 bajtova), a nastavak počinje jednim
  // razmakom. Ranije se brojalo `red.length` (UTF-16 jedinice), pa je red sa našim diacriticima
  // (č, ć, š, ž, đ = 2 bajta u UTF-8) mogao da pređe 75 bajtova iako ima manje od 75 znakova.
  function okteta(znak) {
    var k = znak.charCodeAt(0);
    if (k < 128) { return 1; }
    if (k < 2048) { return 2; }
    if (k >= 0xD800 && k <= 0xDBFF) { return 4; }   // prvi deo para (emoji) - 4 bajta
    return 3;
  }

  function prelomi(red) {
    var GRANICA = 74;                 // okteta po redu; RFC 5545 dozvoljava najviše 75
    var delovi = [];
    var deo = "";
    var brojac = 0;
    for (var i = 0; i < red.length; i++) {
      var znak = red.charAt(i);
      // surrogate par se ne sme razdvojiti prelomom - uzima se kao celina
      if (znak >= "\uD800" && znak <= "\uDBFF" && i + 1 < red.length) {
        znak += red.charAt(i + 1);
        i += 1;
      }
      var b = znak.length === 1 ? okteta(znak) : 4;
      if (deo && brojac + b > GRANICA) {
        delovi.push(deo);
        deo = " ";                    // nastavak počinje jednim razmakom (RFC 5545)
        brojac = 1;
      }
      deo += znak;
      brojac += b;
    }
    if (deo) { delovi.push(deo); }
    return delovi.join("\r\n");
  }

  function dvocifren(broj) { return (broj < 10 ? "0" : "") + broj; }

  function pecatVremena() {
    var d = new Date();
    return d.getUTCFullYear() + dvocifren(d.getUTCMonth() + 1) + dvocifren(d.getUTCDate()) +
      "T" + dvocifren(d.getUTCHours()) + dvocifren(d.getUTCMinutes()) +
      dvocifren(d.getUTCSeconds()) + "Z";
  }

  function napraviIcs(zbor) {
    zbor = zbor || {};
    var datum = String(zbor.datum || "").replace(/-/g, "");
    if (!/^\d{8}$/.test(datum)) { return ""; }          // nema datuma - nema fajla
    var vreme = String(zbor.vreme || "").replace(":", "");
    var imaVreme = /^\d{4}$/.test(vreme);

    // `adresaStrane()` je prazno kad je strana otvorena sa diska - tada se "Sajt:" i "URL:"
    // NE upisuju (ništa se ne izmišlja), a DESCRIPTION ostaje samo ako ima dnevnog reda.
    var sajt = adresaStrane();
    var opis = [];
    (zbor.dnevniRed || []).forEach(function (tacka) { opis.push("- " + tacka); });
    if (sajt) { opis.push("Sajt: " + sajt); }
    var opisTekst = opis.join("\n");

    var redovi = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Liman 2//Zbor gradjana MZ Bosko Buha//SR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:zbor-" + datum + (imaVreme ? "T" + vreme : "") + "@liman2",
      "DTSTAMP:" + pecatVremena(),
      imaVreme ? "DTSTART:" + datum + "T" + vreme + "00"
               : "DTSTART;VALUE=DATE:" + datum,
      "SUMMARY:" + zaIcs("Zbor građana MZ Boško Buha")
    ];
    if (opisTekst) { redovi.push("DESCRIPTION:" + zaIcs(opisTekst)); }
    if (sajt) { redovi.push("URL:" + sajt); }
    if (zbor.mesto) { redovi.push("LOCATION:" + zaIcs(zbor.mesto)); }
    redovi.push("END:VEVENT", "END:VCALENDAR");

    return redovi.map(prelomi).join("\r\n") + "\r\n";
  }

  function preuzmiIcs(tekst, datum) {
    var fajl = new Blob([tekst], { type: "text/calendar;charset=utf-8" });
    var adresa = URL.createObjectURL(fajl);
    var veza = document.createElement("a");
    veza.href = adresa;
    veza.download = "zbor-" + datum + ".ics";
    document.body.appendChild(veza);
    veza.click();
    document.body.removeChild(veza);
    window.setTimeout(function () { URL.revokeObjectURL(adresa); }, 1000);
  }

  // Kalendar i prikaz uvek čitaju isti, poslednji potvrđeni termin.
  var dugmeKalendar = document.querySelector("[data-kalendar]");
  function osveziKalendar() {
    if (dugmeKalendar) dugmeKalendar.hidden = !napraviIcs(P.sledeciZbor || {});
  }
  if (dugmeKalendar) {
    dugmeKalendar.addEventListener("click", function () {
      var termin = P.sledeciZbor || {}, ics = napraviIcs(termin);
      if (ics) preuzmiIcs(ics, termin.datum);
    });
    osveziKalendar();
  }
  if (kada && location.protocol !== 'file:') {
    var terminSekvenca = 0;
    // termin iz podesavanja.js - vraća se kad Zbor u aplikaciji ukloni termin sa servisa
    var terminIzPodesavanja = P.sledeciZbor || {};
    function osveziTermin() {
      var broj = ++terminSekvenca;
      fetch('/api/assembly', {cache:'no-store'}).then(function(response) {
        if (!response.ok) throw new Error('API');
        return response.json();
      }).then(function(termin) {
        if (broj !== terminSekvenca) return;
        P.sledeciZbor = (termin && termin.datum && termin.vreme)
          ? {datum:termin.datum, vreme:termin.vreme, mesto:termin.mesto || '', dnevniRed:[]}
          : terminIzPodesavanja;           // servis kaže "nema termina" (null) - nije zakazan
        prikaziSledeciZbor(); osveziKalendar();
      }).catch(function() { /* Pri nedostupnom serveru ostaje postojeći prikaz. */ });
    }
    osveziTermin();
    if (window.EventSource) {
      var zborDogadjaji = new EventSource('/api/events');
      zborDogadjaji.addEventListener('update', osveziTermin);
      window.addEventListener('pagehide', function() { zborDogadjaji.close(); }, {once:true});
    }
    document.addEventListener('visibilitychange', function() { if (!document.hidden) osveziTermin(); });
  }

  /* ---------- Zarobljavanje fokusa u pregledima (a11y) ----------
     `.pregled` i `.pregled-teksta` su obični divovi sa role="dialog" aria-modal="true", pa za
     razliku od <dialog> (koji fokus drži sam, preko showModal()) Tab može da pobegne na stranu
     ispod pregleda. Zato se Tab i Shift+Tab vrte u krug unutar pregleda. Fokus se u pregled
     prebacuje pri otvaranju i vraća na sličicu/dugme pri zatvaranju - to je već urađeno ispod. */
  function fokusabilni(kontejner) {
    var kandidati = kontejner.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), ' +
      'select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(kandidati, function (el) {
      // `hidden` i `display: none` nemaju nijedan pravougaonik - ne smeju u krug
      return !el.hidden && el.getClientRects().length > 0;
    });
  }

  function zamkaZaTab(kontejner) {
    kontejner.addEventListener("keydown", function (dogadjaj) {
      if (dogadjaj.key !== "Tab") { return; }
      var lista = fokusabilni(kontejner);
      if (!lista.length) { dogadjaj.preventDefault(); return; }
      var prvi = lista[0];
      var poslednji = lista[lista.length - 1];
      var unutra = kontejner.contains(document.activeElement);
      if (dogadjaj.shiftKey) {
        if (!unutra || document.activeElement === prvi) {
          dogadjaj.preventDefault();
          poslednji.focus();
        }
      } else if (!unutra || document.activeElement === poslednji) {
        dogadjaj.preventDefault();
        prvi.focus();
      }
    });
  }

  /* ---------- Pregled fotografija (galerija) ----------
     Svaka `.galerija-lista` unutar elementa sa `data-galerija` je jedna grupa. Klik na sliku
     otvara pregled preko cele strane; listanje ide strelicama, dugmadima, tasterima levo/desno
     i povlačenjem prsta. Okvir je uvek iste veličine, pa slike ne skaču pri listanju. */
  var pregled = null;
  var slike = [];
  var naSlici = 0;
  var povratakFokusa = null;

  function napraviPregled() {
    if (pregled) { return pregled; }
    pregled = document.createElement("div");
    pregled.className = "pregled";
    pregled.hidden = true;
    pregled.setAttribute("role", "dialog");
    pregled.setAttribute("aria-modal", "true");
    pregled.setAttribute("aria-label", "Pregled fotografija");
    pregled.innerHTML =
      '<button class="pregled-zatvori" type="button" aria-label="Zatvori pregled">×</button>' +
      '<span class="pregled-broj" aria-live="polite"></span>' +
      '<button class="pregled-dugme pregled-dugme--levo" type="button" aria-label="Prethodna fotografija">‹</button>' +
      '<div class="pregled-okvir"><div class="pregled-sloj"><span class="pregled-pozadina" aria-hidden="true"></span>' +
        '<img class="pregled-slika" alt=""></div></div>' +
      '<button class="pregled-dugme pregled-dugme--desno" type="button" aria-label="Sledeća fotografija">›</button>';
    document.body.appendChild(pregled);

    // nova fotografija ulazi tek kad se učita (klizanje i pretapanje pri listanju)
    pregled.querySelector(".pregled-slika").addEventListener("load", function () {
      var sloj = pregled.querySelector(".pregled-sloj");
      window.requestAnimationFrame(function () { sloj.classList.remove("ulazi"); });
    });
    window.addEventListener("resize", postaviStrelice);

    pregled.querySelector(".pregled-zatvori").addEventListener("click", zatvoriPregled);
    pregled.querySelector(".pregled-dugme--levo").addEventListener("click", function () { pomeri(-1); });
    pregled.querySelector(".pregled-dugme--desno").addEventListener("click", function () { pomeri(1); });

    // klik na tamnu podlogu zatvara (na sliku i dugmad ne)
    pregled.addEventListener("click", function (dogadjaj) {
      if (dogadjaj.target === pregled) { zatvoriPregled(); }
    });

    // povlačenje prsta levo/desno (dodir na telefonu)
    var pocetak = null;
    pregled.addEventListener("pointerdown", function (dogadjaj) { pocetak = dogadjaj.clientX; });
    pregled.addEventListener("pointerup", function (dogadjaj) {
      if (pocetak === null) { return; }
      var pomeraj = dogadjaj.clientX - pocetak;
      pocetak = null;
      if (Math.abs(pomeraj) > 40) { pomeri(pomeraj < 0 ? 1 : -1); }
    });

    document.addEventListener("keydown", function (dogadjaj) {
      if (pregled.hidden || !pregled.classList.contains("je-otvoren")) { return; }
      if (dogadjaj.key === "Escape") { zatvoriPregled(); }
      else if (dogadjaj.key === "ArrowLeft") { pomeri(-1); }
      else if (dogadjaj.key === "ArrowRight") { pomeri(1); }
    });
    zamkaZaTab(pregled);                  // Tab ne sme da pobegne na stranu ispod pregleda
    return pregled;
  }

  // Okvir pregleda je uvek iste veličine i oblika (3:2, CSS), pa strelice stoje uz njegove ivice.
  // Mere se `offset*` vrednosti - one ne zavise od animacije (transform), pa strelice ne "šetaju".
  function postaviStrelice() {
    if (!pregled || pregled.hidden) { return; }
    var okvir = pregled.querySelector(".pregled-okvir");
    var levoDugme = pregled.querySelector(".pregled-dugme--levo");
    var desnoDugme = pregled.querySelector(".pregled-dugme--desno");
    if (!okvir.offsetWidth) { return; }
    var w = levoDugme.offsetWidth || 54;
    var h = levoDugme.offsetHeight || 54;
    var y = Math.round(okvir.offsetTop + okvir.offsetHeight / 2 - h / 2);
    var unutra = 14;                                  // strelica stoji malo unutar okvira
    levoDugme.style.left = Math.round(okvir.offsetLeft + unutra) + "px";
    levoDugme.style.top = y + "px";
    levoDugme.style.transform = "none";
    desnoDugme.style.left = Math.round(okvir.offsetLeft + okvir.offsetWidth - unutra - w) + "px";
    desnoDugme.style.right = "auto";
    desnoDugme.style.top = y + "px";
    desnoDugme.style.transform = "none";
  }

  // `smer` (1 = sledeća, -1 = prethodna): stara slika klizne na tu stranu i izbledi, nova uđe sa
  // suprotne. Pri otvaranju (bez smera) nova se samo pojavi.
  function pokaziSliku(koja, smer) {
    if (!slike.length) { return; }
    naSlici = ((koja % slike.length) + slike.length) % slike.length;   // kruži
    var okvir = pregled.querySelector(".pregled-okvir");
    var sloj = okvir.querySelector(".pregled-sloj");
    var im = sloj.querySelector(".pregled-slika");
    var puna = slike[naSlici].puna;
    if (im.getAttribute("src") !== puna) {
      if (smer && im.getAttribute("src")) {
        // kopija stare slike odlazi preko nove i nestaje
        var stari = sloj.cloneNode(true);
        stari.classList.remove("ulazi");
        stari.classList.add("odlazi");
        stari.setAttribute("aria-hidden", "true");
        stari.style.setProperty("--smer", String(-smer));
        okvir.appendChild(stari);
        void stari.offsetWidth;
        stari.classList.add("je-otisao");
        window.setTimeout(function () { stari.remove(); }, 600);
      }
      sloj.style.setProperty("--smer", String(smer || 0));
      sloj.classList.add("ulazi");                     // skida se kad se slika učita
      var adresa;
      try { adresa = new URL(puna, location.href).href; } catch (greska) { adresa = puna; }
      sloj.querySelector(".pregled-pozadina").style.backgroundImage =
        'url("' + adresa.replace(/["\\]/g, "\\$&") + '")';
      im.src = puna;
      if (im.complete && im.naturalWidth) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { sloj.classList.remove("ulazi"); });
        });
      }
    }
    im.alt = slike[naSlici].alt;
    pregled.querySelector(".pregled-broj").textContent = (naSlici + 1) + " / " + slike.length;
    var imaVise = slike.length > 1;
    pregled.querySelector(".pregled-dugme--levo").hidden = !imaVise;
    pregled.querySelector(".pregled-dugme--desno").hidden = !imaVise;
    postaviStrelice();
  }

  function pomeri(smer) { pokaziSliku(naSlici + smer, smer); }

  var poslednjaGrupa = null;
  function otvoriPregled(grupa, indeks, izvor) {
    napraviPregled();
    poslednjaGrupa = grupa;
    slike = [];
    grupa.querySelectorAll("a[href]").forEach(function (veza) {
      var im = veza.querySelector("img");
      if (!im) { return; }
      slike.push({ puna: veza.getAttribute("href"), alt: im.getAttribute("alt") || "" });
    });
    if (!slike.length) { return; }
    povratakFokusa = izvor || null;
    window.clearTimeout(tajmerZatvaranja);
    pregled.hidden = false;
    postaviPolaziste(izvor, true);
    document.documentElement.classList.add("pregled-otvoren");
    pokaziSliku(indeks);
    void pregled.offsetWidth;                          // da prelaz krene od zatvorenog stanja
    pregled.classList.add("je-otvoren");
    pregled.querySelector(".pregled-zatvori").focus();
  }

  // Fotografija kreće od mesta i veličine sličice na koju je kliknuto i raste do pune veličine
  // (i vraća se u nju pri zatvaranju): CSS `--polaziste` je pomeraj i umanjenje okvira do sličice.
  // `odmah` (pri otvaranju): okvir se BEZ animacije postavi na sličicu, pa tek onda kreće da raste.
  // Inače bi prelaz krenuo iz podrazumevanog stanja (skoro pune veličine) i slika bi "iskočila".
  function postaviPolaziste(izvor, odmah) {
    var okvir = pregled.querySelector(".pregled-okvir");
    if (odmah) {
      okvir.style.transition = "none";
      okvir.style.transform = "none";                // meri se prava veličina okvira, bez umanjenja
    }
    var slicica = izvor && izvor.querySelector ? (izvor.querySelector("img") || izvor) : null;
    var sa = slicica && slicica.getBoundingClientRect ? slicica.getBoundingClientRect() : null;
    var o = okvir.getBoundingClientRect();
    if (!sa || !sa.width || !o.width || sa.bottom < 0 || sa.top > window.innerHeight) {
      okvir.style.removeProperty("--polaziste");   // sličica nije na ekranu - samo blago poraste
    } else {
      var umanjenje = Math.max(0.06, Math.min(sa.width / o.width, sa.height / o.height));
      var dx = Math.round(sa.left + sa.width / 2 - (o.left + o.width / 2));
      var dy = Math.round(sa.top + sa.height / 2 - (o.top + o.height / 2));
      okvir.style.setProperty("--polaziste",
        "translate(" + dx + "px, " + dy + "px) scale(" + umanjenje.toFixed(3) + ")");
    }
    if (odmah) {
      okvir.style.removeProperty("transform");       // sada važi --polaziste iz CSS-a, bez prelaza
      void okvir.offsetWidth;                        // pregledač zapamti početno stanje (na sličici)
      okvir.style.removeProperty("transition");
    }
  }

  // Zatvaranje ide unazad (podloga bledi, fotografija se vraća u sličicu), pa se tek onda sakrije.
  var tajmerZatvaranja = null;
  function zatvoriPregled() {
    if (!pregled || pregled.hidden || !pregled.classList.contains("je-otvoren")) { return; }
    // pri listanju je možda prikazana druga fotografija - vraća se u njenu sličicu ako je ima
    var veze = poslednjaGrupa ? poslednjaGrupa.querySelectorAll("a[href]") : [];
    postaviPolaziste(veze[naSlici] || povratakFokusa);
    pregled.classList.remove("je-otvoren");
    document.documentElement.classList.remove("pregled-otvoren");
    if (povratakFokusa && povratakFokusa.focus) { povratakFokusa.focus({ preventScroll: true }); }
    var bezPokreta = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tajmerZatvaranja = window.setTimeout(function () {
      pregled.hidden = true;
      pregled.querySelector(".pregled-slika").removeAttribute("src");
      pregled.querySelectorAll(".pregled-sloj.odlazi").forEach(function (s) { s.remove(); });
    }, bezPokreta ? 0 : 480);
  }

  // Jedan osluškivač za sve galerije (i one koje se nacrtaju kasnije, npr. kartice vesti).
  document.addEventListener("click", function (dogadjaj) {
    if (dogadjaj.button !== 0 || dogadjaj.metaKey || dogadjaj.ctrlKey || dogadjaj.shiftKey) {
      return;                                   // novi tab i dalje radi kao bez skripte
    }
    var veza = dogadjaj.target.closest ? dogadjaj.target.closest("a[href]") : null;
    if (!veza) { return; }
    var grupa = veza.closest("[data-galerija]");
    if (!grupa) { return; }
    var veze = grupa.querySelectorAll("a[href]");
    var indeks = Array.prototype.indexOf.call(veze, veza);
    if (indeks < 0) { return; }
    dogadjaj.preventDefault();
    otvoriPregled(grupa, indeks, veza);
  });

  // Za proveru iz konzole (i za testove): ZBOR.ics({datum:"2026-12-06",vreme:"18:00"})
  window.ZBOR = { ics: napraviIcs };

  // Poslednji zbor i njegov zapisnik
  var poslednji = P.poslednjiZbor || {};
  // datum poslednjeg zbora stoji na više mesta (kartica "Sledeći zbor" i kartica
  // "Usvojeni zaključci") - sva se pune iz istog podatka, da se ne raziđu
  document.querySelectorAll("[data-zbor-poslednji]").forEach(function (mesto) {
    if (poslednji.datum) {
      mesto.textContent = kaoDatum(poslednji.datum);
    }
  });
  var vezaZapisnik = document.querySelector("[data-zbor-zapisnik]");
  if (vezaZapisnik) {
    if (poslednji.zapisnik) {
      // zapisnik je na sajtu - otvara se u istom tabu
      vezaZapisnik.href = KOREN + poslednji.zapisnik;
      vezaZapisnik.removeAttribute("target");
      vezaZapisnik.removeAttribute("rel");
    } else {
      vezaZapisnik.href = KOREN + "zapisnici/index.html";   // spisak zapisnika
    }
  }

  // Pojas ispod heroja: prava fotografija kraja ako postoji (assets/foto-pojas.jpg),
  // inače traka sa brojevima - da ne stoji prazan prostor ni izmišljen crtež.
  var fotoPojas = document.querySelector("[data-foto-pojas]");
  var traka = document.querySelector("[data-cinjenice]");
  if (fotoPojas) {
    var slika = fotoPojas.querySelector("img");
    var pokaziTraku = function () {
      if (traka) { traka.hidden = false; }
    };
    if (!slika) {
      pokaziTraku();
    } else if (slika.complete) {
      // slika je već prošla učitavanje (ili nije uspela) pre nego što je skripta krenula
      if (slika.naturalWidth > 0) {
        fotoPojas.hidden = false;
      } else {
        pokaziTraku();
      }
    } else {
      slika.addEventListener("load", function () {
        fotoPojas.hidden = false;
        if (traka) { traka.hidden = true; }
      });
      slika.addEventListener("error", pokaziTraku);
    }
  } else if (traka) {
    traka.hidden = false;
  }

  // Brojevi u traci: uzimaju se iz stvarnih podataka, ne pišu se rukom
  var brojPrijava = document.querySelector("[data-broj-prijava]");
  if (brojPrijava && window.PRIJAVE) {
    if (window.PRIJAVE.length > 0) {
      brojPrijava.textContent = window.PRIJAVE.length;
    } else {
      // nema prijava: umesto "0 prijava" stoji poziv da se prva prijavi
      var stavka = brojPrijava.closest ? brojPrijava.closest(".cinjenica") : null;
      if (stavka) {
        stavka.outerHTML = '<a class="cinjenica" href="' + KOREN + 'radar.html#prijavi">' +
          '<span class="cinjenica-broj">Prijavi prvi</span>' +
          '<span class="cinjenica-natpis">u Komšijskom radaru još nema prijava</span></a>';
      }
    }
  }
  var brojOdluka = document.querySelector("[data-broj-odluka]");
  if (brojOdluka) {
    var odluka = document.querySelectorAll(".odluke-lista li").length;
    if (odluka) { brojOdluka.textContent = odluka; }
  }

  /* ---------- Vesti (data/vesti.js) ----------
     PRAVILO (korisnik, obavezno): na naslovnoj se vide NAJVIŠE 2 objave u "Aktuelno i akcije".
     Sve starije idu u `arhiva.html` - puni se iz istog fajla, ništa se ne premešta ručno.
     Kartica može imati svoj natpis (vrsta), link na stranu sajta, tekst linka i više
     fotografija (galeriju - prva je naslovna, klik otvara pregled svih).
     Dok vesti nema, u index.html ostaje kartica sa žutim poljima kao podsetnik domaćinu. */
  var NA_NASLOVNOJ = 2;

  // "2 fotografije", "5 fotografija" - da natpis na kartici bude gramatički tačan
  function kolikoFotografija(broj) {
    var zadnje = broj % 10, zadnjeDve = broj % 100;
    if (zadnje === 1 && zadnjeDve !== 11) { return broj + " fotografija"; }
    if (zadnje >= 2 && zadnje <= 4 && (zadnjeDve < 12 || zadnjeDve > 14)) {
      return broj + " fotografije";
    }
    return broj + " fotografija";
  }

  function kolikoObjava(broj) {
    var zadnje = broj % 10, zadnjeDve = broj % 100;
    if (zadnje === 1 && zadnjeDve !== 11) { return broj + " objava"; }
    if (zadnje >= 2 && zadnje <= 4 && (zadnjeDve < 12 || zadnjeDve > 14)) {
      return broj + " objave";
    }
    return broj + " objava";
  }

  // jedna kartica vesti - isti izgled i na naslovnoj i u arhivi
  function napraviKarticuVesti(vest) {
    var kartica = document.createElement("article");
    kartica.className = "kartica kartica--vest";

    var slikeVesti = (vest.slike && vest.slike.length)
      ? vest.slike
      : (vest.slika ? [vest.slika] : []);
    if (slikeVesti.length) {
      var okvir = document.createElement("div");
      okvir.className = "kartica-slika";
      // zamućena kopija iste slike popunjava prostor oko nje (slika se vidi cela, bez odsecanja);
      // apsolutna adresa, jer bi se relativna u CSS promenljivoj tumačila prema styles.css
      try {
        okvir.style.setProperty("--pozadina",
          'url("' + new URL(slikeVesti[0], location.href).href.replace(/["\\]/g, "\\$&") + '")');
      } catch (greska) { /* bez pozadine - slika se i dalje vidi cela */ }

      // sve fotografije su u jednoj grupi: prva se vidi na kartici, klik otvara pregled svih
      var grupa = document.createElement("div");
      grupa.className = "kartica-slika-grupa";
      grupa.setAttribute("data-galerija", "");
      slikeVesti.forEach(function (putanja, i) {
        var veza = document.createElement("a");
        veza.href = putanja;
        veza.target = "_blank";                   // bez skripte otvara samu sliku
        veza.rel = "noopener";
        if (i > 0) { veza.className = "u-galeriji"; }
        var im = document.createElement("img");
        im.className = "kartica-slika-img";
        im.src = putanja;
        im.alt = vest.alt || "";
        im.loading = "lazy";
        veza.appendChild(im);
        grupa.appendChild(veza);
      });
      okvir.appendChild(grupa);

      if (slikeVesti.length > 1) {
        var broj = document.createElement("span");
        broj.className = "kartica-slika-broj";
        broj.textContent = kolikoFotografija(slikeVesti.length);
        okvir.appendChild(broj);
      }
      kartica.appendChild(okvir);
    }

    var telo = document.createElement("div");
    telo.className = "kartica-telo";

    var natpis = document.createElement("p");
    natpis.className = "natpis";
    natpis.textContent = vest.vrsta
      ? vest.vrsta
      : "VEST" + (vest.datum ? " · " + kaoDatum(vest.datum) : "");
    telo.appendChild(natpis);

    var naslov = document.createElement("h3");
    if (vest.link) {
      var vezaNaslov = document.createElement("a");
      vezaNaslov.href = vest.link;
      vezaNaslov.textContent = vest.naslov || "";
      naslov.appendChild(vezaNaslov);
    } else {
      naslov.textContent = vest.naslov || "";
    }
    telo.appendChild(naslov);

    if (vest.uvod) {
      var uvod = document.createElement("p");
      uvod.className = "kartica-uvod";
      uvod.textContent = vest.uvod;
      telo.appendChild(uvod);

      // "Procitaj vise" se vidi samo kad uvod ne staje u 6 redova (podesiUvode)
      var vise = document.createElement("button");
      vise.type = "button";
      vise.className = "kartica-vise";
      vise.hidden = true;
      vise.setAttribute("aria-haspopup", "dialog");
      vise.textContent = "Pročitaj više";
      telo.appendChild(vise);
    }
    if (vest.link && vest.linkTekst) {
      var donja = document.createElement("a");
      donja.className = "kartica-veza-tekst";
      donja.href = vest.link;
      donja.textContent = vest.linkTekst;
      telo.appendChild(donja);
    }

    kartica.appendChild(telo);
    return kartica;
  }

  function poredajVesti(spisak) {
    return spisak.slice().sort(function (a, b) {
      return String(b.datum || "").localeCompare(String(a.datum || "")) ||   // najnovije prve
        (b.kreirano || 0) - (a.kreirano || 0);
    });
  }

  var kutijaAkcija = document.getElementById("akcije");
  var arhiva = document.getElementById("arhiva-vesti");

  // Crta naslovnu (najviše 2) i arhivu (sve ostale). Poziva se dvaput: odmah sa data/vesti.js,
  // pa još jednom kad stignu vesti iz aplikacije za moderatora (servis, /api/vesti).
  function prikaziVesti(vesti) {
  if (kutijaAkcija) {
    kutijaAkcija.querySelectorAll(".kartica--vest").forEach(function (k) { k.remove(); });
  }
  if (kutijaAkcija && vesti.length) {
    var praznaKartica = kutijaAkcija.querySelector("[data-vest-prazna]");
    if (praznaKartica) { praznaKartica.hidden = true; }
    vesti.slice(0, NA_NASLOVNOJ).forEach(function (vest) {
      kutijaAkcija.appendChild(napraviKarticuVesti(vest));
    });
  }

  // arhiva (arhiva.html): sve što nije na naslovnoj, najnovije prve
  if (arhiva) {
    arhiva.innerHTML = "";
    var starije = vesti.slice(NA_NASLOVNOJ);
    if (!starije.length) {
      arhiva.innerHTML = '<p class="lista-prazna">Arhiva je za sada prazna - sve objave su ' +
        'na <a href="index.html#aktuelno">naslovnoj</a>. Kad dođe nova, starija se seli ovde.</p>';
    } else {
      var brojacArhive = document.createElement("p");
      brojacArhive.className = "sitno";
      brojacArhive.textContent = "U arhivi: " + kolikoObjava(starije.length) +
        " (dve najnovije su na naslovnoj).";
      arhiva.appendChild(brojacArhive);

      var mreza = document.createElement("div");
      mreza.className = "kartice";
      starije.forEach(function (vest) { mreza.appendChild(napraviKarticuVesti(vest)); });
      arhiva.appendChild(mreza);
    }
  }
  }

  prikaziVesti(poredajVesti(window.VESTI || []));

  // Vesti koje Zbor unese kroz aplikaciju za moderatora stoje na servisu. Bez servisa (dvoklik,
  // GitHub Pages) ostaju samo one iz data/vesti.js - ništa se ne kvari, samo ih nema.
  if ((kutijaAkcija || arhiva) && location.protocol !== "file:") {
    fetch("/api/vesti", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (saServisa) {
        if (!Array.isArray(saServisa) || !saServisa.length) { return; }
        var naServisu = {};
        saServisa.forEach(function (v) { naServisu[v.id] = true; });
        var staticke = (window.VESTI || []).filter(function (v) { return !naServisu[v.id]; });
        prikaziVesti(poredajVesti(saServisa.concat(staticke)));
        podesiUvode();
      })
      .catch(function () { /* servis nije tu - ostaju vesti iz data/vesti.js */ });
  }

  /* ---------- Skok na deo strane (#aktuelno, #radar…) posle učitavanja ----------
     Radar i vesti sa servisa se crtaju posle učitavanja, pa deo iznad sidra poraste i pregledač
     promaši mesto na koje je skočio. Zato se prvih 6 sekundi, kad god se visina strane promeni,
     sidro ponovo dovede na vrh - dok posetilac sam ne počne da skroluje ili klikne. */
  (function () {
    var id = decodeURIComponent((location.hash || "").slice(1));
    var cilj = id && !/^p-/.test(id) ? document.getElementById(id) : null;
    if (!cilj || !window.ResizeObserver) { return; }
    var gotovo = false;
    var prekini = function () { gotovo = true; posmatrac.disconnect(); };
    var posmatrac = new ResizeObserver(function () { if (!gotovo) { cilj.scrollIntoView(); } });
    posmatrac.observe(document.body);
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (vrsta) {
      window.addEventListener(vrsta, prekini, { once: true, passive: true });
    });
    window.setTimeout(prekini, 6000);
  })();

  /* ---------- Naš kraj: sve fotografije u istom okviru (vidi kraj styles.css) ----------
     Kartice priča i galerije u pričama dobijaju zamućenu kopiju svoje slike kao pozadinu, a
     fotografija u tekstu priče se uvija u okvir 3:2. Adresa je apsolutna, jer bi se relativna
     u CSS promenljivoj tumačila prema styles.css. */
  function pozadinaOd(element, src) {
    if (!element || !src) { return; }
    try {
      element.style.setProperty("--pozadina",
        'url("' + new URL(src, location.href).href.replace(/["\\]/g, "\\$&") + '")');
    } catch (greska) { /* bez pozadine - slika se i dalje vidi cela */ }
  }
  document.querySelectorAll(".kartica--kraj .kartica-slika").forEach(function (okvir) {
    var im = okvir.querySelector("img");
    if (im) { pozadinaOd(okvir, im.getAttribute("src")); }
  });
  document.querySelectorAll("figure.kraj-slika > img").forEach(function (im) {
    var okvir = document.createElement("span");
    okvir.className = "kraj-slika-okvir";
    im.parentNode.insertBefore(okvir, im);
    okvir.appendChild(im);
    pozadinaOd(okvir, im.getAttribute("src"));
  });
  document.querySelectorAll(".galerija--jednako .galerija-lista a, a.vreme-foto").forEach(function (veza) {
    var im = veza.querySelector("img");
    if (im) { pozadinaOd(veza, im.getAttribute("src")); }
  });

  /* ---------- Meni na telefonu (dugme ☰ u zaglavlju) ----------
     Dugme stoji u HTML-u sa `hidden`; tek ovde se otkriva, pa bez skripte meni ostaje vidljiv. */
  var meniDugme = document.querySelector(".meni-dugme");
  var zaglavlje = document.querySelector(".header");
  if (meniDugme && zaglavlje) {
    meniDugme.hidden = false;
    document.documentElement.classList.add("ima-meni-dugme");
    var postaviMeni = function (otvoren) {
      zaglavlje.classList.toggle("meni-otvoren", otvoren);
      meniDugme.setAttribute("aria-expanded", otvoren ? "true" : "false");
      meniDugme.setAttribute("aria-label", otvoren ? "Zatvori meni" : "Otvori meni");
    };
    meniDugme.addEventListener("click", function () {
      postaviMeni(!zaglavlje.classList.contains("meni-otvoren"));
    });
    // izbor stavke, Escape ili klik van zaglavlja zatvaraju meni
    zaglavlje.addEventListener("click", function (dogadjaj) {
      if (dogadjaj.target.closest && dogadjaj.target.closest(".nav a")) { postaviMeni(false); }
    });
    document.addEventListener("keydown", function (dogadjaj) {
      if (dogadjaj.key === "Escape" && zaglavlje.classList.contains("meni-otvoren")) {
        postaviMeni(false);
        meniDugme.focus();
      }
    });
    document.addEventListener("click", function (dogadjaj) {
      if (!zaglavlje.contains(dogadjaj.target)) { postaviMeni(false); }
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", function (m) {
      if (m.matches) { postaviMeni(false); }
    });
  }

  /* ---------- Uvod na kartici: 6 redova i ceo tekst u pregledu ----------
     Uvod može imati do 1500 znakova (vesti.py), pa bi kartica bila ogromna. Zato se na kartici
     vidi najviše 6 redova (`-webkit-line-clamp` u styles.css), a ako tekst ne staje, ispod njega
     se pojavi "Pročitaj više" i otvara ceo tekst u pregledu preko strane. */
  function podesiUvode() {
    document.querySelectorAll(".kartica-uvod").forEach(function (uvod) {
      var dugme = uvod.nextElementSibling;
      if (!dugme || !dugme.classList.contains("kartica-vise")) { return; }
      // skriven tekst ima veći scrollHeight od prikazane visine
      dugme.hidden = uvod.scrollHeight <= uvod.clientHeight + 1;
    });
  }

  var pregledTeksta = null;
  var fokusPrePregleda = null;

  function napraviPregledTeksta() {
    if (pregledTeksta) { return pregledTeksta; }
    pregledTeksta = document.createElement("div");
    pregledTeksta.className = "pregled-teksta";
    pregledTeksta.hidden = true;
    pregledTeksta.setAttribute("role", "dialog");
    pregledTeksta.setAttribute("aria-modal", "true");
    pregledTeksta.setAttribute("aria-labelledby", "pregled-teksta-naslov");
    pregledTeksta.innerHTML =
      '<div class="pregled-teksta-okvir">' +
        '<button class="pregled-teksta-zatvori" type="button" aria-label="Zatvori tekst">×</button>' +
        '<p class="pregled-teksta-natpis"></p>' +
        '<h2 id="pregled-teksta-naslov"></h2>' +
        '<p class="pregled-teksta-tekst"></p>' +
        '<a class="pregled-teksta-veza" hidden></a>' +
      "</div>";
    document.body.appendChild(pregledTeksta);

    pregledTeksta.querySelector(".pregled-teksta-zatvori")
      .addEventListener("click", zatvoriPregledTeksta);

    // klik na tamnu podlogu zatvara (na plocu i tekst ne)
    pregledTeksta.addEventListener("click", function (dogadjaj) {
      if (dogadjaj.target === pregledTeksta) { zatvoriPregledTeksta(); }
    });

    document.addEventListener("keydown", function (dogadjaj) {
      if (pregledTeksta.hidden) { return; }
      if (dogadjaj.key === "Escape") { zatvoriPregledTeksta(); }
    });
    zamkaZaTab(pregledTeksta);            // Tab ne sme da pobegne na stranu ispod pregleda
    return pregledTeksta;
  }

  function otvoriPregledTeksta(kartica, izvor) {
    var uvod = kartica.querySelector(".kartica-uvod");
    if (!uvod) { return; }
    napraviPregledTeksta();

    var naslov = kartica.querySelector(".kartica-telo h3");
    var natpis = kartica.querySelector(".kartica-telo .natpis");
    pregledTeksta.querySelector(".pregled-teksta-natpis").textContent =
      natpis ? natpis.textContent : "";
    pregledTeksta.querySelector(".pregled-teksta-okvir h2").textContent =
      naslov ? naslov.textContent : "";
    // textContent je ceo uvod - skraćivanje je samo na ekranu (CSS), pa se ovde ništa ne gubi
    pregledTeksta.querySelector(".pregled-teksta-tekst").textContent = uvod.textContent;

    // ako kartica vodi na stranu sajta, link stoji i u pregledu
    var veza = pregledTeksta.querySelector(".pregled-teksta-veza");
    var uKartici = kartica.querySelector(".kartica-veza-tekst");
    if (uKartici && uKartici.getAttribute("href")) {
      veza.href = uKartici.getAttribute("href");
      veza.textContent = uKartici.textContent;
      veza.hidden = false;
    } else {
      veza.hidden = true;
      veza.removeAttribute("href");
    }

    fokusPrePregleda = izvor || null;
    document.documentElement.classList.add("pregled-teksta-otvoren");
    pregledTeksta.hidden = false;
    pregledTeksta.querySelector(".pregled-teksta-okvir").scrollTop = 0;
    pregledTeksta.querySelector(".pregled-teksta-zatvori").focus();
  }

  function zatvoriPregledTeksta() {
    if (!pregledTeksta || pregledTeksta.hidden) { return; }
    pregledTeksta.hidden = true;
    document.documentElement.classList.remove("pregled-teksta-otvoren");
    if (fokusPrePregleda && fokusPrePregleda.focus) { fokusPrePregleda.focus(); }
  }

  // jedan osluškivač za sve kartice (i one koje se nacrtaju kasnije, npr. u arhivi)
  document.addEventListener("click", function (dogadjaj) {
    var dugme = dogadjaj.target.closest ? dogadjaj.target.closest(".kartica-vise") : null;
    if (!dugme) { return; }
    var kartica = dugme.closest(".kartica");
    if (!kartica) { return; }
    dogadjaj.preventDefault();
    otvoriPregledTeksta(kartica, dugme);
  });

  podesiUvode();
  // 6 redova zavisi od širine kartice - pri promeni prozora se dugme pojavi ili sakrije
  var cekanjeSirine = null;
  window.addEventListener("resize", function () {
    if (cekanjeSirine) { return; }
    cekanjeSirine = window.setTimeout(function () { cekanjeSirine = null; podesiUvode(); }, 150);
  });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(podesiUvode); }

  // Označi stavku menija za deo stranice koji se vidi (uvek samo jedna)
  var stavke = [];
  document.querySelectorAll(".nav a").forEach(function (veza0) {
    var id = (veza0.getAttribute("href") || "").replace("#", "");
    var deo = id ? document.getElementById(id) : null;
    if (deo) { stavke.push({ veza: veza0, deo: deo }); }
  });

  function oznaci() {
    var linija = 120;                     // odmah ispod zaglavlja
    var aktivna = null;
    stavke.forEach(function (stavka) {
      if (stavka.deo.getBoundingClientRect().top - linija <= 0) { aktivna = stavka.veza; }
    });
    stavke.forEach(function (stavka) {
      if (stavka.veza === aktivna) {
        stavka.veza.setAttribute("aria-current", "true");
      } else {
        stavka.veza.removeAttribute("aria-current");
      }
    });
  }

  if (stavke.length) {
    var cekanje = false;
    window.addEventListener("scroll", function () {
      if (cekanje) { return; }
      cekanje = true;
      window.requestAnimationFrame(function () {
        oznaci();
        cekanje = false;
      });
    }, { passive: true });
    oznaci();
  }

  /* ===== Blagi 3D efekti (stil je u styles.css, "Blagi 3D efekti") =====
     Ko u sistemu ima uključeno "smanji animacije", ne dobija naginjanje ni pomeranje. */
  var smanjiPokrete = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Kartice vesti se naginju ka mišu (do 4°). Kartice crta app.js posle učitavanja, pa je
  //    osluškivač na document. Samo za miš - na dodir nema "prelaza", kartica stoji ravno.
  if (!smanjiPokrete && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var NAGIB = 4;
    var nagnuta = null;
    var ispravi = function (k) {
      if (!k) { return; }
      k.classList.remove("je-nagnuta");
      k.style.removeProperty("--rx");
      k.style.removeProperty("--ry");
    };
    document.addEventListener("pointermove", function (e) {
      var k = e.target.closest ? e.target.closest(".kartica") : null;
      if (k !== nagnuta) { ispravi(nagnuta); nagnuta = k; }
      if (!k) { return; }
      var r = k.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;    // 0..1
      var y = (e.clientY - r.top) / r.height;    // 0..1
      k.classList.add("je-nagnuta");
      k.style.setProperty("--ry", ((x - 0.5) * 2 * NAGIB).toFixed(2) + "deg");
      k.style.setProperty("--rx", ((0.5 - y) * 2 * NAGIB).toFixed(2) + "deg");
      k.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
      k.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
    });
    document.documentElement.addEventListener("pointerleave", function () {
      ispravi(nagnuta);
      nagnuta = null;
    });
  }

  // 2. "Nekad i sad" - klik (dodir, Enter, razmak) okrene fotografiju: nekad / danas
  document.querySelectorAll(".okret").forEach(function (okret) {
    var scena = okret.querySelector(".okret-scena");
    if (!scena) { return; }
    scena.addEventListener("click", function () {
      var okrenut = okret.classList.toggle("je-okrenut");
      scena.setAttribute("aria-pressed", okrenut ? "true" : "false");
    });
  });

  // 3. Fotografija ispod naslovne ide sporije od strane (do ±45 px; slika je viša od pojasa)
  var pojasDubina = document.querySelector(".foto-pojas");
  var slikaDubina = pojasDubina && pojasDubina.querySelector("img");
  if (slikaDubina && !smanjiPokrete) {
    var cekaDubina = false;
    var pomeriDubinu = function () {
      cekaDubina = false;
      var r = pojasDubina.getBoundingClientRect();
      var visina = window.innerHeight;
      if (r.bottom < 0 || r.top > visina || !r.height) { return; }
      // -1 kad je pojas na vrhu ekrana, +1 kad je na dnu
      var t = ((r.top + r.height / 2) / visina) * 2 - 1;
      slikaDubina.style.setProperty("--pomak", (t * 45).toFixed(1) + "px");
    };
    window.addEventListener("scroll", function () {
      if (!cekaDubina) { cekaDubina = true; window.requestAnimationFrame(pomeriDubinu); }
    }, { passive: true });
    window.addEventListener("resize", pomeriDubinu);
    slikaDubina.addEventListener("load", pomeriDubinu);
    pomeriDubinu();
  }
})();
