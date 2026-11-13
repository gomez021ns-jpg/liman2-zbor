// Verzija sajta: računa broj iz window.VERZIJE (data/verzije.js) i crta ga.
// Pravilo brojanja i uputstvo za dopunu istorije stoje u data/verzije.js.
// Ovde je samo logika - broj se NE piše rukom, računa se iz cele istorije.
// Ubacuje red sa brojem verzije u podnožje svake strane i crta verzije.html.

(function () {
  // Koren sajta (folder iznad js/) - strana "Šta je novo" je u korenu, a ova skripta radi i na
  // stranama iz podfoldera (zapisnici/, nas-kraj/, akcije/).
  var KOREN = document.currentScript && document.currentScript.src
    ? new URL("..", document.currentScript.src).href
    : "";

  // Broj se računa iz cele istorije, od najstarijeg ka najnovijem:
  //   velika -> x raste, y i z padaju na nulu
  //   nove   -> y raste, z pada na nulu
  //   dorade -> samo z raste
  // Zato broj uvek odgovara onome što je stvarno urađeno i ne piše se rukom.
  var x = 0, y = 0, z = 0, i;
  for (i = window.VERZIJE.length - 1; i >= 0; i--) {
    if (window.VERZIJE[i].velika) {
      x++; y = 0; z = 0;
    } else if (window.VERZIJE[i].nove && window.VERZIJE[i].nove.length) {
      y++; z = 0;
    } else {
      z++;
    }
    window.VERZIJE[i].v = x + "." + y + "." + z;
  }

  var najnovija = window.VERZIJE[0];
  window.APP_VERZIJA = najnovija.v;
  window.APP_VERZIJA_DATUM = najnovija.datum;

  function bezbedno(tekst) {
    return String(tekst == null ? "" : tekst)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // 2026-11-09 -> 9. 11. 2026. (isti oblik kao formatDatum u radar-osnova.js)
  function formatDatum(datum) {
    var delovi = String(datum).split("-");
    return Number(delovi[2]) + ". " + Number(delovi[1]) + ". " + delovi[0] + ".";
  }

  function oznaka(unos) {
    var imaNovo = unos.nove && unos.nove.length;
    var imaDorade = unos.dorade && unos.dorade.length;
    if (unos.velika) { return "verzija-oznaka verzija-oznaka--velika"; }
    if (imaNovo && imaDorade) { return "verzija-oznaka verzija-oznaka--oba"; }
    if (imaNovo) { return "verzija-oznaka verzija-oznaka--novo"; }
    return "verzija-oznaka verzija-oznaka--dorada";
  }

  function oznakaTekst(unos) {
    var imaNovo = unos.nove && unos.nove.length;
    var imaDorade = unos.dorade && unos.dorade.length;
    if (unos.velika) { return "Velika izmena"; }
    if (imaNovo && imaDorade) { return "Novo i dorada"; }
    return imaNovo ? "Novo" : "Dorada";
  }

  // Red sa brojem verzije ide u podnožje svake strane. Ubacuje se iz koda, a ne piše se u
  // svakom HTML-u: jedan izvor istine, pa broj ne može da se raziđe od strane do strane.
  // Od 13. 11. 2026 (korisnik): broj verzije i link "Šta je novo" vidi samo domaćin - kad sajt otvori
  // sa svog računara (dvoklik, lokalni server, Docker na localhost-u). Posetioci na webu ih ne vide;
  // strana verzije.html i dalje postoji (noindex, bez linka). To nije zaključavanje, samo sklanjanje.
  function lokalno() {
    var h = location.hostname;
    return location.protocol === "file:" || h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
  }

  function uPodnozje() {
    if (!lokalno()) { return; }
    var podnozje = document.querySelector(".podnozje .omot");
    if (!podnozje) { return; }
    // donja traka podnožja (.podnozje-dno) se pravi tek ovde - na webu je nema
    var omot = podnozje.querySelector(".podnozje-dno");
    if (!omot) {
      omot = document.createElement("div");
      omot.className = "podnozje-dno";
      podnozje.appendChild(omot);
    }
    if (omot.querySelector(".podnozje-verzija")) { return; }
    var red = document.createElement("p");
    red.className = "podnozje-verzija";
    // formatDatum() već vraća tačku na kraju (9. 11. 2026.), pa se ovde ne dodaje druga.
    red.innerHTML = "Verzija sajta <b>v" + bezbedno(najnovija.v) + "</b> · " +
      bezbedno(formatDatum(najnovija.datum)) + " · " +
      '<a href="' + KOREN + 'verzije.html">Šta je novo</a>';
    omot.insertBefore(red, omot.firstChild);
  }

  // verzije.html: cela istorija, najnovija verzija na vrhu.
  function uSpisak() {
    var kutija = document.getElementById("verzije-spisak");
    var html = "", j, k, unos, stavke;
    if (!kutija) { return; }
    for (j = 0; j < window.VERZIJE.length; j++) {
      unos = window.VERZIJE[j];
      stavke = [];
      for (k = 0; k < (unos.nove || []).length; k++) { stavke.push(["novo", unos.nove[k]]); }
      for (k = 0; k < (unos.dorade || []).length; k++) { stavke.push(["dorada", unos.dorade[k]]); }
      html += '<section class="verzija-unos">' +
        '<h2><span class="verzija-broj">v' + bezbedno(unos.v) + "</span>" +
        '<span class="' + oznaka(unos) + '">' + oznakaTekst(unos) + "</span>" +
        '<span class="verzija-datum">' + bezbedno(formatDatum(unos.datum)) + "</span></h2><ul>";
      for (k = 0; k < stavke.length; k++) {
        html += '<li class="verzija-stavka verzija-stavka--' + stavke[k][0] + '">' +
          bezbedno(stavke[k][1]) + "</li>";
      }
      html += "</ul></section>";
    }
    kutija.innerHTML = html;
  }

  uPodnozje();
  uSpisak();
})();
