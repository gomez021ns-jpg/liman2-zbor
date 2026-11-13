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
  { datum: "2026-11-13", velika: false, nove: [], dorade: [
    "Dugme \"← Sve priče iz kraja\" (i \"nazad\" u zapisnicima i na strani akcije) poravnato je sa levom ivicom teksta ispod njega.",
    "Na strani \"Limani kroz vreme\" dugmad za razdoblja su kraća i ujednačena, a uvod je kraći.",
  ] },
  { datum: "2026-11-13", velika: false, nove: [], dorade: [
    "Iz priče \"Šampioni i rokenroleri\" je sklonjena arhivska fotografija benda Blitzkrieg.",
  ] },
  { datum: "2026-11-13", velika: false, nove: [], dorade: [
    "Na naslovnoj, u mozaiku \"Priče koje čine Liman 2\", fotografije su bez natpisa - naziv priče se pojavi tek kad se pređe mišem preko slike.",
    "Iz podnožja su sklonjeni broj verzije i rečenica \"Bez praćenja posetilaca\"; broj verzije i \"Šta je novo\" vidi samo domaćin na svom računaru.",
    "U pričama \"Naš kraj\" i na strani \"Limani kroz vreme\" na fotografijama više nema brojeva - ispod svake slike piše ko ju je snimio ili odakle je.",
    "Fotografije sa dna priča o Štrandu, Kabelu i Danubiusu su prebačene u sam tekst; klik na bilo koju fotografiju u priči je uveličava, a strelicama se lista kroz sve slike te priče.",
    "Galerija \"Liman 2 u slikama\" je u širini teksta, sve slike su iste veličine, tri u redu.",
  ] },
  { datum: "2026-11-12", velika: false, nove: [
    "Nova strana u \"Naš kraj\": \"Limani kroz vreme\" - 55 arhivskih fotografija Limana, Štranda i Mosta slobode od 1937. do 1991, poređanih po razdobljima, sa opisima Andreja Semnica; parovi \"nekad i danas\" stoje jedan ispod drugog.",
  ], dorade: [] },
  { datum: "2026-11-11", velika: false, nove: [
    "Linkovi za Viber: \"Zbor građana MZ Boško Buha\" (u podnožju svake strane, u kartici \"Sledeći zbor\" na naslovnoj i na strani \"Zbor građana\") i \"Zajednica komšija MZ Boško Buha\" (u podnožju svake strane).",
  ], dorade: [] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "U priči \"Šampioni i rokenroleri\" su fotografije ljudi i mesta o kojima se piše, svaka sa brojem i potpisom izvora.",
    "Izvori i napomene u toj priči su na kraju teksta, u jednom spisku, pa tekst teče bez prekida.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [
    "Nova priča u \"Naš kraj\": \"Liman 2 - kvart koji je stvarao šampione i rokenrolere\" - basket, pank, rok, metal i škola \"Jovan Popović\" iz koje su izlazili bendovi, uz linkove na intervjue.",
  ], dorade: [] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "U \"Naš kraj\" su sve fotografije ujednačene: kartice priča izgledaju isto kao kartice u \"Aktuelno i akcije\", a fotografije u pričama i njihove galerije su u okvirima iste veličine - slika se vidi cela.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "Fotografije sa prvog zbora (strana \"Zbor građana\") složene su kao mozaik - uspravne i položene fotografije se lepo uklapaju, bez praznina.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "Galerija \"Liman 2 u slikama\" je uža i složena kao mozaik, sa dve veće fotografije.",
    "Pregled fotografija se otvara i zatvara blago - fotografija izađe iz sličice na koju si kliknuo i vrati se u nju.",
    "U pregledu su sve fotografije u okviru iste veličine (slika se vidi cela, oko nje je njena zamućena kopija), strelice stoje uz ivice okvira, a pri listanju slike klize i pretapaju se.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "U arhivi vesti dugme \"Nazad na aktuelno\" sada vodi na \"Aktuelno i akcije\" na naslovnoj (ranije se klikom ništa nije dešavalo).",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "Kad Zbor ukloni zakazani termin zbora, na naslovnoj odmah piše da sledeći zbor još nije zakazan - bez osvežavanja strane.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "Uz \"Priče koje čine Liman 2\" na naslovnoj stoji mozaik fotografija iz priča - Liman 2 nekad, Žuta kuća, Štrand, pruga gde je danas Bulevar i Boško Buha; klik vodi na priču.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [
    "Objave u \"Aktuelno i akcije\" Zbor sada može da unosi i kroz aplikaciju za moderatore, sa fotografijama - pojave se na naslovnoj i u arhivi.",
    "Na telefonu je meni sakriven iza dugmeta ☰ u gornjem desnom uglu.",
  ], dorade: [
    "Dugme \"Prijavi problem\" je skinuto iz zaglavlja (ostaje na naslovnoj i u radaru), a meni je pomeren udesno.",
    "Natpis na naslovnoj sada glasi \"Sajt nezavisnih građana Limana 2\".",
    "Slike na karticama u \"Aktuelno i akcije\" vide se cele, bez odsecanja.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [], dorade: [
    "Komšijski radar se prikazuje i kad server ne radi: mapa, granica i spisak su tu, a jasno piše da slanje prijava i podrške trenutno ne radi; kad se server vrati, strana se sama osveži.",
    "Prijava poslata posle ponoći više ne dobija jučerašnji datum - datum se računa po vremenu Novog Sada.",
    "Radar je zaštićen od zloupotrebe: sa iste adrese ne može da stigne gomila prijava ili zahteva za podršku, a na istu e-poštu ne može da ode gomila poruka.",
  ] },
  { datum: "2026-11-11", velika: false, nove: [
    "Nov izgled sajta: svetlije boje, naslovna sa mozaikom fotografija iz kraja i bistom Boška Buhe u pozadini, a Komšijski radar je odmah na naslovnoj.",
    "Nova strana \"Zbor građana\" - šta je zbor, zašto je važan i kako je sve počelo na Bronxu.",
    "Nova strana \"Važni telefoni i adrese\" (u meniju \"Kontakti\", u podnožju \"Korisni kontakti\").",
    "Komšijski radar ima novi tok: prijavu prvo pregleda moderator, pa je tek onda objavi na mapi; podrška prijavi se potvrđuje linkom koji stigne e-poštom, a prijave su i u tabeli sa filterima.",
  ], dorade: [
    "Vraćen je broj verzije u podnožju svake strane i strana na koju vodi link za potvrdu podrške.",
  ] },
  { datum: "2026-11-10", velika: false, nove: [], dorade: [
    "Sajt je sređen po folderima: zapisnici su u \"zapisnici\", priče u \"nas-kraj\", akcije u \"akcije\", a stil i skripte u \"css\" i \"js\" - adrese strana su kraće i jasnije.",
    "Stari linkovi koje ste već podelili i dalje rade: sa stare adrese strana sama prebaci na novu.",
    "Provera pre objave sada proverava i svaku vezu na svakoj strani, pa pokvaren link ne može da ode na web.",
  ] },
  { datum: "2026-11-10", velika: false, nove: [
    "Tri nova zapisnika: šesti zbor (22. 2. 2026), sedmi zbor (18. 5. 2026) i osmi zbor (16. 6. 2026) - u spisku zapisnika i svaki na svojoj strani.",
  ], dorade: [
    "Svi zapisnici su sada na latinici - i tri ranija koja su bila ćirilicom i osmi; tekst je prenet slovo za slovo, bez izmena.",
    "Na naslovnoj i u kartici \"Sledeći zbor\" kao poslednji zbor stoji osmi zbor (16. 6. 2026), sa linkom na njegov zapisnik.",
  ] },
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
