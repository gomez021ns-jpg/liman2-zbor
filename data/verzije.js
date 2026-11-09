// Verzija sajta i istorija izmena. Ovde se dodaju unosi; logika je u verzije.js,
// a strana sa celom istorijom je verzije.html (link Šta je novo u podnožju).
//
// Broj verzije se NE piše rukom (isto pravilo kao u aplikacijama u korenu, korisnik
// 7. 11. 2026): verzije.js ga računa iz ove liste, pa se prepisivanjem stavke iz jedne
// vrste u drugu menjaju i brojevi svih verzija posle nje.
//
// Nomenklatura je x.y.z (korisnik 9. 11. 2026):
//   x - baš nešto ozbiljno urađeno na sajtu   -> unos sa velika: true;  y i z padaju na nulu
//   y - unesene nove funkcije                 -> unos ima nešto u nove; z pada na nulu
//   z - sitne prepravke                       -> unos ima samo dorade
//
// Dok sajt nije objavljen na web, x je 0 (0.y.z je po pravilu razvoj, sve sme da se menja).
// Objavljivanje sajta je prvi unos sa velika: true i tada verzija postaje 1.0.0.
//
// Nov unos ide NA VRH liste i ima četiri polja: datum (oblik 2026-11-09), velika (true
// samo za ozbiljne rezove), nove (šta je novo) i dorade (dorade i ispravke). Svaka stavka
// je jedna rečenica napisana za komšije, ne za programere - ovo čitaju i oni koji ne vide
// kod. Jedan unos = jedna izmena; ako izmena ima i novog i sitnog, ide u isti unos, pa se
// broji y (novi unos nikad ne ostavlja oba spiska prazna).
//
// OBAVEZNO: svaka izmena na sajtu dobija unos ovde, pre nego što se posao završi.
// python proveri.py to i proverava - ako se sajt menja a istorija se ne dopuni, ispiše
// upozorenje. Bez novog unosa posao nije gotov.

window.VERZIJE = [
  { datum: "2026-11-09", velika: false, nove: [], dorade: [
    "Žuta kuća je dobila pravu fotografiju - kuću sa muralom na fasadi - na kartici, na naslovnoj i na vrhu priče.",
  ] },
  { datum: "2026-11-09", velika: false, nove: [], dorade: [
    "\"Naš kraj\" lepše izgleda: slike na karticama idu od ivice do ivice, kartice su u ravnim redovima, a Žuta kuća, koja nema slobodnu fotografiju, dobila je žuti plakat sa kućicom umesto sive ploče.",
    "Poziv \"Pošalji fotografiju ili sećanje\" na dnu priča je u svetlom okviru sa ikonicom fotoaparata i crvenim dugmetom.",
    "Posle svake objave pregledač odmah povlači nove stilove - više se ne dešava da se nova strana vidi sa starim izgledom.",
  ] },
  { datum: "2026-11-09", velika: false, nove: [
    "Nova strana \"Naš kraj\": sve priče o mestima, ljudima i istoriji Limana 2 na jednom mestu, sa karticama.",
    "Šest novih priča: Boško Buha, OŠ \"Jovan Popović\", FK Kabel, Štrand, Veslački klub \"Danubius 1885\" i Žuta kuća - sa fotografijama, zanimljivostima i dugmetom za slanje fotografije ili sećanja.",
    "Na dnu svake priče poseban deo \"Izvori\": odakle je svaka fotografija (broj u uglu fotografije odgovara spisku), gde ima još fotografija i odakle je tekst.",
  ], dorade: [
    "\"Priča o Limanu 2\" spojena sa \"Liman pre Limana\": dodati pruga na mestu Bulevara, Trčika na Fruškogorskoj, kuće bez kanalizacije i zanimljivosti, a delovi o školi i Dunavu vode na svoje priče - ništa se ne ponavlja.",
    "\"Nekad i sad\" na naslovnoj postalo je \"Naš kraj\" (fotografija koja se okreće ostaje, ispod su tri priče), a u meniju i podnožju stoji \"Naš kraj\".",
  ] },
  { datum: "2026-11-09", velika: false, nove: [
    "Instagram Zbora u podnožju svake strane, uz Facebook i e-poštu.",
    "Novo podnožje u tri kolone: ko vodi sajt, linkovi sajta i \"Prati nas\" (Instagram, Facebook, Piši Zboru), a ispod verzija sajta i napomena da sajt ne prati posetioce.",
  ], dorade: [
    "Potpis ispod fotografije \"Nekad i sad\" se sada jasno vidi na crvenoj podlozi.",
  ] },
  { datum: "2026-11-09", velika: false, nove: [
    "\"Nekad i sad\" na naslovnoj: klik na staru fotografiju je okrene i pokaže Liman 2 danas, a još jedan klik je vrati.",
    "Blagi 3D izgled: kartice vesti se nagnu ka mišu, fotografija ispod naslova ide sporije dok se skroluje, kartica \"Sledeći zbor\" se izdigne kao ulaznica, a puna dugmad imaju debljinu i utonu na klik.",
  ], dorade: [
    "Ko u podešavanjima telefona ili računara ima uključeno \"smanji animacije\", ne vidi naginjanje ni pomeranje.",
  ] },
  { datum: "2026-11-09", velika: false, nove: [], dorade: [
    "Navodnici u istoriji izmena i u poruci o lokaciji na radaru su sada pravi (\" \"), kao u ostatku sajta.",
  ] },
  { datum: "2026-11-09", velika: false, nove: [
    "Verzija sajta i istorija izmena: broj verzije (x.y.z) piše u podnožju svake strane, a na strani \"Šta je novo\" (verzije.html) vidi se tačno šta je u kojoj verziji urađeno, od prve do poslednje.",
    "Pravilo koje se samo proverava: svaka izmena na sajtu mora da dobije unos u data/verzije.js, pa python proveri.py upozori ako se sajt menja a istorija se ne dopuni.",
  ], dorade: [] },
  { datum: "2026-11-09", velika: false, nove: [
    "Fokus ostaje u okviru koji je otvoren: dok je pregled fotografije ili pregled celog teksta otvoren, Tab i Shift+Tab idu u krug samo po tom okviru i ne beže na meni ili podnožje ispod. Važno za komšije koje koriste samo tastaturu ili čitač ekrana.",
  ], dorade: [
    "Opisi za pretragu i društvene mreže (`meta description`) u tri zapisnika prebačeni su sa ćirilice na latinicu, kao i sav tekst oko njih; tela zapisnika ostaju ćirilična i dalje pravilno označena kao srpska ćirilica.",
    "Usklađena terminologija sa izvornim zapisnikom: \"PGR rekreativnog područja\" (na sajtu je pisalo \"rekreacionog\").",
  ] },
  { datum: "2026-11-09", velika: false, nove: [], dorade: [
    "Sajt otvoren dvoklikom sa diska više ne nudi lažnu adresu za deljenje: piše \"Nema linka za deljenje\", a izvoz u kalendar (.ics) izostavi redove sa adresom sajta umesto da upiše nepostojeću adresu.",
    "Prelamanje dugih redova u .ics fajlu sada se računa po oktetima (bajtovima) kako traži RFC 5545, a ne po broju znakova - nazivi sa č, ć, ž i š se više ne lome pogrešno i ne cepaju dvobajtne znakove.",
    "Gramatika uz broj dana: \"21 dan\" i \"31 dan\" (bilo \"21 dana\"); pravilo sada radi za svaki broj.",
    "Zaštita od ubacivanja koda u tekst (`bezbedno`) sada preskače i apostrof, ne samo dvostruki navodnik.",
    "Upozorenje u detaljima prijave kada je sajt otvoren sa diska: lokalne veze (zapisnici, vesti) tada ne rade, pa piše da se sajt pokrene preko Pokreni.bat.",
    "Ispravka: upareni tipografski navodnici u komentarima u kodu.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Uvod na kartici je najviše šest redova, a ispod se pojavi dugme \"Pročitaj više\" koje otvori ceo tekst u pregledu preko cele strane.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "U CLAUDE.md zapisano pravilo: vesti se dodaju samo kroz program \"Zbor MZ BB vesti\", nikako ručno preko window.VESTI.push(...).",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Provera podataka (proveri.py) sada hvata vesti ubačene ručno preko window.VESTI.push(...) i prijavi ih kao grešku.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Program za vesti preimenovan u \"Zbor MZ BB vesti\" (bio \"UnderGRAND Vesti\"), a uvod vesti može imati do 1500 znakova (bilo 500).",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Linkovi i obrub dugmadi sada se jasno vide i na crvenoj podlozi - ranije su se gubili.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Najviše dve objave na naslovnoj strani; sve starije idu u arhivu vesti (arhiva.html), i to je obavezno pravilo.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Uklonjena silueta blokova iznad podnožja (na zahtev korisnika); ikonice uz linkove ostaju.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Grafika u podnožju: silueta blokova Limana 2 i ikonice uz svaki link.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [
    "Lokacija iz pregledača pokazuje tačnost i krug nesigurnosti na mapi, pa se vidi koliko je položaj približan.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [
    "Dugme \"Koristi moju lokaciju\" sa jasnim porukama (dozvola odbijena, pregledač ne podržava, otvoreno sa diska) i Pokreni.bat za lokalni server.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [
    "Osam novih vrsta prijave na radaru: vodovod, kanalizacija, komunalni problemi, grejanje i toplovod, razno, gradski prevoz, buka i životinje.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Svih 12 fotografija sa akcije vide se i u kartici na naslovnoj, ne samo na strani akcije.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Galerija fotografija na kartici vesti (više slika po objavi), a klik na sliku otvara pregled sa listanjem.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Uvod kartice može imati do 500 znakova (bilo 300).",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Sve tri kartice u \"Aktuelno i akcije\" prebačene su u data/vesti.js i u program za vesti - nijedan tekst se više ne kuca u HTML-u.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "\"Otvori data/vesti.js\" otvara Notepad direktno, a ne preko Windows Script Host-a.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Uklonjen link na Google Drive fasciklu; savremeniji efekti na dugmadima.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Meni sređen: jedno \"Aktuelno i akcije\", a redosled stavki u meniju je isti kao redosled delova na strani.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Program za vesti (vesti.py i Vesti.bat), fajl data/vesti.js i kartice u \"Aktuelno i akcije\" na naslovnoj strani.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Pravilo o fotografijama zapisano u CLAUDE.md: lica smeju da se vide, registarske tablice se zamućuju.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Fotografija zbora u kartici \"Usvojeni zaključci\" i link na zapisnik.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Uklonjena suvišna veza za fotografije; pravi tipografski navodnici i u kodu.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Tekst akcije dopunjen (Bulevar oslobođenja 137-151), ispravljena gramatika i stavljeni pravi navodnici.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Strelice u pregledu fotografija stoje uz samu fotografiju, ne uz ivicu okvira.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Zasebna strana akcije sa fotografijama i link na UnderGRAND radio u podnožju.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [
    "Pregled fotografija sa listanjem levo-desno i galerije ujednačene veličine.",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "12 fotografija sa akcije u galeriji; letak ispunjava okvir kartice.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Letak akcije u malom okviru kartice (160 px), ne preko cele širine.",
  ] },
  { datum: "2026-11-08", velika: false, nove: [], dorade: [
    "Letak akcije \"Vratimo sjaj lepom Limanu 2\" kao naslovna slika u \"Aktuelno i akcije\".",
  ] },
  { datum: "2026-11-08", velika: false, nove: [
    "Deljenje strane i \"Dodaj u kalendar\" (.ics fajl sa vremenom, mestom i opisom akcije).",
  ], dorade: [] },
  { datum: "2026-11-08", velika: false, nove: [
    "Sajt Liman 2 - Zbor građana MZ Boško Buha: naslovna strana, radar prijava, zapisnici zborova i priča o kraju.",
  ], dorade: [] },
];