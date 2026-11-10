// Vesti iz kraja - kartice u "Aktuelno i akcije" na naslovnoj.
//
// Dodaje ih i uređuje program Zbor/vesti.py (dvoklik na Zbor/Vesti.bat): on sam smanji slike
// (do 1100 px), skine podatke o lokaciji i uređaju (EXIF), pretvori ih u JPG, napravi male
// verzije za spisak i upiše stavku ovde. Ručno se ne piše.
//
//   {
//     id: "rasveta-kod-skole",            // jedinstven, od naslova (mala slova i crtice)
//     datum: "2026-11-12",                // YYYY-MM-DD - po njemu se sortira
//     vrsta: "VEST · 12. 11. 2026.",      // mali natpis iznad naslova; ako ga nema, "VEST · datum"
//     naslov: "Nova rasveta kod škole",   // do 70 znakova
//     uvod: "Prva rečenica. Druga.",      // do 1500 znakova
//     slike: [                            // galerija; prva je naslovna slika kartice
//       "assets/vesti/rasveta-kod-skole-01.jpg",
//       "assets/vesti/rasveta-kod-skole-02.jpg"
//     ],
//     alt: "Radnici postavljaju stub",    // obavezan ako ima slika (opis za slepe i pretrage)
//     link: "akcija-2026-10-31.html",     // opciono: strana na sajtu (naslov je tada link)
//     linkTekst: "Otvori zapisnik →"      // opciono: mali link na dnu kartice
//   }
//
// Pravila (proverava `python Zbor/proveri.py`):
// - `datum` YYYY-MM-DD, `naslov` do 70, `uvod` do 1500, `id` jedinstven,
// - `slike` može da bude prazan spisak; ako ima slika, `alt` je obavezan,
// - `link` mora da vodi na fajl koji postoji (ili da počinje sa http),
// - na naslovnoj se prikazuju najviše 2 najnovije kartice, a starije idu u arhiva.html.
window.VESTI = [
  {
    id: "vratimo-sjaj-lepom-limanu-2",
    datum: "2026-10-31",
    vrsta: "AKCIJA · SUBOTA 31. 10. 2026. U 11.00",
    naslov: "Vratimo sjaj lepom Limanu 2",
    uvod: "Čistili smo, sređivali i krečili prostor oko našeg bloka, a drugi deo ekipe preuzeo je krečenje Bulevara oslobođenja. Okupljanje je bilo u 11.00, u ulici Boška Buha 10 - hvala svima koji su došli!",
    slike: ["assets/akcija-2026-10-31/letak.jpg", "assets/akcija-2026-10-31/foto-01.jpg", "assets/akcija-2026-10-31/foto-02.jpg", "assets/akcija-2026-10-31/foto-03.jpg", "assets/akcija-2026-10-31/foto-04.jpg", "assets/akcija-2026-10-31/foto-05.jpg", "assets/akcija-2026-10-31/foto-06.jpg", "assets/akcija-2026-10-31/foto-07.jpg", "assets/akcija-2026-10-31/foto-08.jpg", "assets/akcija-2026-10-31/foto-09.jpg", "assets/akcija-2026-10-31/foto-10.jpg", "assets/akcija-2026-10-31/foto-11.jpg", "assets/akcija-2026-10-31/foto-12.jpg"],
    alt: "Letak akcije Vratimo sjaj lepom Limanu 2 - subota 31. 10. 2026. u 11.00, okupljanje u ulici Boška Buha 10",
    link: "akcije/2026-10-31.html",
  },
  {
    id: "usvojeni-zakljucci-sa-poslednjeg-zbora",
    datum: "2025-10-26",
    vrsta: "ZBOR GRAĐANA · 26. 10. 2025.",
    naslov: "Usvojeni zaključci sa poslednjeg zbora",
    uvod: "Pregled dogovorenog i ko je za šta zadužen, uz ceo zapisnik.",
    slike: ["assets/zbor-2025-10-26.jpg"],
    alt: "Zbor građana MZ Boško Buha, 26. oktobar 2025.",
    link: "zapisnici/2025-10-26.html",
    linkTekst: "Otvori zapisnik →",
  },
];
