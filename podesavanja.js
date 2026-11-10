// Podaci koje domaćin menja na jednom mestu (koriste ih app.js i radar.js).
window.LIMAN2 = {
  // E-pošta Zbora građana - na nju stižu prijave problema, predlozi i kontakt
  adresaZbora: "zbormzboskobuha@gmail.com",

  // Facebook stranica Zbora (link u podnožju svih strana)
  facebookStranica: "https://www.facebook.com/profile.php?id=61574829249878",

  // Instagram nalog Zbora (link u podnožju svih strana)
  instagram: "https://www.instagram.com/zbor_boskobuha/",

  // Zapisnici sa zborova su strane na sajtu (zapisnici.html) - Google Drive fascikla se
  // više ne koristi, pa ovde nema adrese.

  // Sledeći zbor: kad bude zakazan, popuni datum, vreme, mesto i dnevni red.
  // Dok je `datum` prazan, na sajtu piše "Još nije zakazan" (ništa se ne izmišlja).
  sledeciZbor: {
    datum: "",          // npr. "2026-12-06"
    vreme: "",          // npr. "18:00"
    mesto: "",          // npr. "Bronx, Liman II"
    dnevniRed: []       // npr. ["Usvajanje zapisnika", "Rasveta u ulici X", "Predlozi komisija"]
  },

  // Poslednji održani zbor i njegov zapisnik.
  // `zapisnik` je strana na sajtu (npr. "zapisnik-2025-10-26.html"); ako je prazan, link vodi
  // na spisak zapisnika (zapisnici.html).
  poslednjiZbor: {
    datum: "2026-06-16",
    zapisnik: "zapisnik-2026-06-16.html"
  },

  // Mapa: centar je Liman 2 / MZ Boško Buha (OpenStreetMap)
  mapa: {
    centar: [45.2407, 19.8460],
    zoom: 15,
    najmanji: 13,
    najveci: 19
  },

  // Pločice mape - prvi izvor koji radi se koristi, ostali su rezerva.
  // Podaci su uvek OpenStreetMap; atribucija "© OpenStreetMap saradnici" mora da stoji.
  // Ako se neki izvor ne učita (blokada ili prekid), skripta sama pređe na sledeći.
  //
  // Zašto ne CARTO: od 2025. njihove osnovne pločice traže API ključ.
  // Zašto ne javni OSM serveri kao prvi izvor: odbijaju zahteve sa strana otvorenih
  // sa diska (nema Referer-a) i traže umerenu upotrebu
  // (https://operations.osmfoundation.org/policies/tiles/) - ostaju kao rezerva
  // za slučaj kada sajt bude na svom domenu.
  // Kad sajt dobije domen i više poseta, uzeti besplatan ključ (Stadia Maps ili
  // Thunderforest) i dodati ga u URL izvora.
  plocice: [
    // Prvi izvor je OpenStreetMap (FOSSGIS server): iste pločice kao na openstreetmap.org,
    // pa se granica MZ i ulice poklapaju sa OSM-om. Radi i kad se strana otvori sa diska.
    {
      naziv: "OpenStreetMap (FOSSGIS)",
      url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
      retina: false,
      najveciZoom: 19,
      atribucija: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> saradnici'
    },
    // Zvanični OSM server: vraća "Access blocked" dok se strana otvara sa diska (nema Referer-a),
    // a proradi kad sajt bude na svom domenu.
    {
      naziv: "OpenStreetMap",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      retina: false,
      najveciZoom: 19,
      atribucija: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> saradnici'
    },
    // Poslednja rezerva: Esri ima drugu podlogu (drugačije ulice i oznake od OSM-a), pa se
    // koristi samo ako nijedan OSM izvor ne radi.
    {
      naziv: "Esri World Street Map",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      retina: false,
      najveciZoom: 19,
      atribucija: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> saradnici, pločice &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>'
    }
  ],

  // Prijava bez odgovora duže od ovog broja dana ide u listu "čeka predugo"
  predugoDana: 30
};
