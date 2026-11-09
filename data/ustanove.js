// Ustanove kojima se iz Komšijskog radara šalju prijave komunalnih problema.
//
// Prijava sa sajta ide e-poštom izabrane ustanove, a kopija ide Zboru (da prijava
// uđe u radar i da se vidi šta je i kome poslato). Ako primalac jeste Zbor, kopije nema.
//
// `vrste` služi samo za PREDLOG: kad komšija izabere vrstu problema, sajt sam predloži
// nadležnu ustanovu (prva u nizu), a komšija može da izabere drugu. Spisak vrsta je u
// radar-osnova.js (`VRSTE`): rasveta, smece, parking, zelenilo, ulice, vodovod, kanalizacija,
// grejanje, komunalno, prevoz, buka, zivotinje, razno.
//
// Adrese su sa zvaničnih sajtova, proverene 8. 11. 2026:
//   novisad.rs - gradske uprave (strane uprava i "Važni telefoni"), cistocans.co.rs,
//   vikns.rs, nstoplana.rs, parkingns.rs.
// Kad se adresa promeni, menja se SAMO ovde - obrazac u radar.html i radar.js čitaju spisak.
window.USTANOVE = [
  {
    id: "zbor",
    naziv: "Zbor građana MZ Boško Buha",
    email: "zbormzboskobuha@gmail.com",
    vrste: ["razno"],
    opis: "Prijava ide Zboru - on je prosleđuje nadležnima i prati odgovor."
  },
  {
    id: "inspekcija",
    naziv: "Gradska uprava za inspekcijske poslove (komunalna inspekcija)",
    email: "dispecer@inspekcija.novisad.rs",
    vrste: ["rasveta", "ulice", "komunalno", "buka"],
    opis: "Dežurni komunalni inspektor: komunalni red, rasveta, trotoari, buka i ulice."
  },
  {
    id: "cistoca",
    naziv: "JKP Čistoća Novi Sad",
    email: "cistoca.reklamacije@cistocans.co.rs",
    vrste: ["smece", "zivotinje"],
    opis: "Iznošenje smeća, kontejneri, kabasti i baštenski otpad; zoohigijena (napuštene i uginule životinje)."
  },
  {
    id: "vodovod",
    naziv: "JKP Vodovod i kanalizacija Novi Sad",
    email: "kontakt.centar@vikns.rs",
    vrste: ["vodovod", "kanalizacija"],
    opis: "Voda, kanalizacija, gušenja, poplave i radovi u ulici."
  },
  {
    id: "toplana",
    naziv: "JKP Novosadska toplana",
    email: "osj@nstoplana.rs",
    vrste: ["grejanje"],
    opis: "Grejanje: curenja na instalacijama, hladni radijatori, havarije."
  },
  {
    id: "parking",
    naziv: "JKP Parking servis Novi Sad",
    email: "office@parkingns.rs",
    vrste: ["parking"],
    opis: "Parkiranje, nepropisno parkiranje, napuštena i havarisana vozila."
  },
  {
    id: "zelenilo",
    naziv: "JKP Gradsko zelenilo Novi Sad",
    email: "odrzavanje@zelenilo.com",
    vrste: ["zelenilo"],
    opis: "Drveće, zelene površine, ambrozija, orezivanje i štete na zelenilu."
  },
  {
    id: "gsp",
    naziv: "JGSP Novi Sad (gradski prevoz)",
    email: "reklamacije@gspns.rs",
    vrste: ["prevoz"],
    opis: "Autobusi: kašnjenja, preskakanje stanica, ponašanje vozača i karte."
  },
  {
    id: "urbanizam",
    naziv: "Gradska uprava za urbanizam i građevinske poslove",
    email: "urbanizam@uprava.novisad.rs",
    vrste: [],
    opis: "Bespravna gradnja, gradilišta, dozvole i urbanistički uslovi."
  },
  {
    id: "imovina",
    naziv: "Gradska uprava za imovinu i imovinsko-pravne poslove",
    email: "kontakt@imovina.novisad.rs",
    vrste: [],
    opis: "Gradsko zemljište, objekti i imovinsko-pravni poslovi."
  },
  {
    id: "grad",
    naziv: "Grad Novi Sad - Gradska kuća",
    email: "gradns@novisad.rs",
    vrste: [],
    opis: "Opšti kontakt Grada: Trg slobode 1, pisarnica i otvorena kancelarija."
  },
  {
    id: "zastitnik",
    naziv: "Zaštitnik građana Grada Novog Sada (ombudsman)",
    email: "lokalni.ombudsman@novisad.rs",
    vrste: [],
    opis: "Kad ustanova ne odgovori ili prekrši prava građana."
  }
];
