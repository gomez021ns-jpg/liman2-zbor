# Liman 2 - Zbor građana MZ "Boško Buha" (`Zbor/`)

Nezavisan sajt građana Limana 2 (Novi Sad): vesti iz kraja, akcije, zapisnici zborova i
**"Komšijski radar"** - mapa prijava komunalnih problema sa obrascem koji prijavu šalje e-poštom.
Nastao 8. 11. 2026. **Nije UnderGRAND aplikacija**: ne ide na javni UnderGRAND sajt
(`objavi_web.py` ga ne dira). Od 9. 11. 2026 ima **svoju** verziju `x.y.z`, koja se broji drukčije
nego u aplikacijama iz korena (vidi "Verzije" ispod).

## Raspored foldera (od 10. 11. 2026, korisnik: "sredi")
```
Zbor/
├─ index.html  radar.html  arhiva.html  verzije.html   (u korenu)
├─ zapisnici/  index.html (spisak) + YYYY-MM-DD.html (svaki zbor)
├─ nas-kraj/   index.html (sve priče) + liman-2.html, bosko-buha.html, skola-jovan-popovic.html,
│              fk-kabel.html, strand.html, danubius.html, zuta-kuca.html
├─ akcije/     2026-10-31.html (i buduće akcije)
├─ css/styles.css     js/ (app.js, radar.js, radar-osnova.js, verzije.js)
├─ podesavanja.js     (jedini fajl koji domaćin menja ručno - zato ostaje na vrhu)
├─ data/  assets/  vendor/
├─ alati/      vesti.py, proveri.py, objavi_zbor.py, *.bat  (ne ide na web)
└─ PROCITAJ-ME.txt, CLAUDE.md
```
- Premešteno sa `git mv` (istorija ostaje). **Veze su relativne prema strani**: strane u podfolderu
  imaju `../` ispred svega (stil, skripte, slike, meni, podnožje). Nova strana u podfolderu = kopija
  susedne strane iz istog foldera.
- Veze koje pravi **skripta** grade se od korena sajta: `js/app.js` i `js/verzije.js` računaju `KOREN`
  iz svoje adrese (`new URL("..", document.currentScript.src)`), pa link "Šta je novo" i link na
  poslednji zapisnik rade sa svake strane. `podesavanja.js` → `poslednjiZbor.zapisnik` je putanja
  od korena (`zapisnici/2026-06-16.html`); linkovi u `data/vesti.js` takođe (vesti su na naslovnoj i
  u arhivi, obe u korenu).
- Za `file://` (dvoklik) veze idu na `.../index.html`, ne na folder.
- **Stare adrese** (`zapisnik-*.html`, `kraj-*.html`, `liman-2.html`, `nas-kraj.html`, `zapisnici.html`,
  `akcija-2026-10-31.html`) postoje **samo na webu**: `alati/objavi_zbor.py` (`STARE_ADRESE`) na
  njihovim mestima pravi male strane koje prebace na novu adresu - drugari su već dobili linkove.
- `alati/proveri.py` proverava i **sve veze na svim stranama** (href, src, og:image): veza ka fajlu
  koji ne postoji je greška, pa objava neće proći.

## Pravila (korisnik)
- **Statičan sajt**: nema servera, baze ni instalacije; radi i kad se otvori dupli klik na `index.html`.
- **Ništa se ne šalje nigde i nema praćenja posetilaca.** Prijava i predlog idu preko `mailto:`
  u pregledaču posetioca, a e-pošta prijavioca se nikad ne prikazuje javno.
- Sav tekst na **srpskom, latinica**. Ništa se ne izmišlja: ono što Zbor nije poslao ostaje
  prazno ili `[ovako]` na žutoj podlozi (klasa `.popuni`).
  **Zapisnici su svi na latinici** (korisnik, 10. 11. 2026: "da budu svi na latinici"). Do tada su
  tri bila ćirilična (`zapisnici/2025-04-27`, `-07-24`, `-09-14`, sa `lang="sr-Cyrl"`); preneti su
  na latinicu **slovo za slovo** (Lj/Nj/Dž, u reči velikim slovima LJ/NJ/DŽ), bez ijedne druge
  izmene. Zapisnik koji stigne ćirilicom (npr. osmi) prenosi se isto tako. Tekst zapisnika je
  **verbatim** - i greške u kucanju ostaju ("Studnet", "aminima", "otrebno"); menjaju se samo crte
  (" - ") i navodnici (pravi), a "Ime – tekst" postaje `<strong>Ime:</strong> tekst`.
  Terminologija se uzima iz izvornog zapisnika (npr. "PGR rekreativnog područja \"Štrand - Kabel\"").
- **Navodnici su uvek pravi (" ")** - i levi i desni, nikad tipografski. Ako navodnik treba unutar
  atributa (npr. `alt="..."`), piše se `&quot;` da se HTML ne pokvari. Crta u tekstu je ` - ` sa
  razmacima sa obe strane.
- Fotografije pre objave: **zamutiti registarske tablice**, skinuti EXIF (lokacija i uređaj).
  Lica na snimcima sa javnih akcija i zborova **mogu da se vide** (korisnik, 8. 11. 2026).
- Spoljno: Leaflet je **lokalno** u `vendor/leaflet/`; fontovi idu sa Google-a; pločice mape sa
  OSM/FOSSGIS (traži internet - bez interneta mapa je siva, strana radi).
  Podaci granice su ODbL: © OpenStreetMap saradnici, atribucija mora da stoji.

## Delovi
- `index.html` - naslovna: hero, sledeći zbor, prvi zbor (30. 3. 2025) sa fotografijama,
  Komšijski radar, važni telefoni, aktuelno i akcije, predlozi, Naš kraj (`#nas-kraj`).
- `radar.html` - Komšijski radar: mapa, filteri (vrsta, status, "čeka predugo"), spisak prijava,
  detalj prijave (`#p-<id>`) i obrazac za prijavu sa izborom ustanove.
- `js/radar-osnova.js` - `VRSTE` (rasveta, smece, parking, zelenilo, ulice, vodovod,
  kanalizacija, grejanje, komunalno, prevoz, buka, zivotinje, razno) i `STATUSI`
  (prijavljeno, prosledjeno, odgovor, reseno, odbijeno) - **jedini izvor tih spiskova**;
  `js/radar.js` crta stranu, `js/app.js` radi dijaloge i označava stavku menija.
- `zapisnici/index.html` + `zapisnici/YYYY-MM-DD.html` - zapisnici, svaki na svojoj strani (Google Drive
  fascikla se **više ne koristi** - svi zapisnici su na sajtu). Osam zborova: 30. 3., 27. 4., 24. 7.,
  14. 9. i 26. 10. 2025, pa 22. 2., 18. 5. i 16. 6. 2026 (od 10. 11. 2026; datumi iz samih zapisnika -
  imena PDF-ova su imala 22.05 i 17.06). Novi zapisnik: nova strana po uzoru na postojeću, stavka na
  vrh spiska u `zapisnici/index.html`, `poslednjiZbor` u `podesavanja.js` i rečenica u `index.html` (#prvi-zbor).
- `akcije/2026-10-31.html` - strana građanske akcije "Vratimo sjaj lepom Limanu 2": letak i
  galerija sa 12 fotografija (pregled sa listanjem). Sa naslovne vodi kartica u "Aktuelno i akcije".
- `arhiva.html` - arhiva vesti: sve objave koje nisu na naslovnoj (starije od dve najnovije),
  isti izgled kartica; puni se iz `data/vesti.js` preko `js/app.js` (`#arhiva-vesti`).
- `nas-kraj/index.html` + `nas-kraj/*.html` + `nas-kraj/liman-2.html` - "Naš kraj", priče o kraju (vidi "Naš kraj" ispod).
- `css/styles.css` - izgled cele strane (crvena `#b62a22` je akcenat, porodica je ista kao u ostalim
  aplikacijama samo sa svojom paletom). Dugmad imaju savremene efekte: blago podizanje na prelaz
  mišem (`translateY(-1px)`), utisak na klik, unutrašnji prelaz svetla i prsten za tastaturu
  (`:focus-visible`); svi prelazi se gase uz `prefers-reduced-motion`.
- `podesavanja.js` - sve što domaćin menja na jednom mestu: e-pošta Zbora, Facebook stranica, Instagram,
  `sledeciZbor` (datum, vreme, mesto, dnevni red), `poslednjiZbor` (datum i strana zapisnika),
  mapa (centar, zoom), izvori pločica sa rezervama i `predugoDana`.
- `data/prijave.js` (`window.PRIJAVE`, trenutno prazno), `data/ustanove.js` (`window.USTANOVE` -
  kome prijava ide, sa vrstama koje ta ustanova prima), `data/granica.js` (`window.GRANICA_MZ` -
  granica MZ iz OSM-a, relation/13798671), `data/fotografije/` - fotografije prijava.
- `data/vesti.js` (`window.VESTI`) - vesti iz kraja za kartice u "Aktuelno i akcije"; puni ih
  program `vesti.py` (vidi "Vesti" ispod), slike idu u `assets/vesti/` (+ `mala/`).
- `alati/` - `proveri.py` i `Proveri.bat` (provera pre objave, vidi ispod), `vesti.py` i `Vesti.bat`
  (program za vesti), `objavi_zbor.py` (objava pregleda), `Pokreni.bat` (lokalni server),
  `Napravi precicu.bat` (prečica "Zbor MZ BB vesti"). Ništa iz `alati/` ne ide na web.
- `PROCITAJ-ME.txt` - uputstvo za članove Zbora (ide uz ZIP za pregled).
- `data/verzije.js` (`window.VERZIJE`, istorija izmena), `js/verzije.js` (računa broj i upisuje ga
  u podnožje) i `verzije.html` (strana "Šta je novo") - vidi "Verzije".

## Verzije (od 9. 11. 2026, korisnik)
- Broj je **`x.y.z`** i **ne piše se rukom** - `js/verzije.js` (i `proveri.py`, istim pravilom) ga
  računa iz `data/verzije.js`, od najstarijeg unosa ka najnovijem:
  `velika: true` → x+1, y i z na nulu · ima nešto u `nove` → y+1, z na nulu · samo `dorade` → z+1.
  **Ovo nije pravilo iz korena** (tamo se ništa ne vraća na nulu) - Zbor ima svoje.
- Dok sajt nije na webu, x je 0. **Objavljivanje na web je prvi unos sa `velika: true` → 1.0.0.**
- Nov unos ide **na vrh** (`datum`, `velika`, `nove`, `dorade`); jedna izmena = jedan unos, nikad
  oba spiska prazna. Stavke su rečenice za komšije, ne za programere, i sa pravim navodnicima
  (u JS-u `\"`), jer se prikazuju na `verzije.html`.
- **Svaka izmena na sajtu dobija unos pre nego što je posao gotov.** `proveri.py` proveri
  redosled datuma i oblik unosa, a upozori ako je neki fajl sajta menjan više od 10 minuta posle
  `data/verzije.js` (upozorenje, ne greška).
- Broj verzije stoji u podnožju svake strane, uz link "Šta je novo" (`verzije.html`).

## Deljenje i kalendar (od 8. 11. 2026)
- **"Podeli stranu"** - dugme u `.podnozje-veze` na svakoj strani (naslovna, radar, zapisnici,
  priča i svi zapisnici). Redom: `navigator.share` (na telefonu Viber, WhatsApp, mejl…),
  pa `navigator.clipboard` uz natpis "Link je kopiran", na kraju `prompt`. Deli se
  `location.origin + location.pathname` - bez `#dela` i bez upita. Nema spoljnog servisa za
  deljenje, ni brojanja klikova.
- **Sa diska (`file://`) deljenje NE radi i to se javlja - link se ne izmišlja.** `adresaStrane()`
  tada vraća prazno, a dugme pokaže "Nema linka za deljenje". Razlog: za `file:` je
  `location.origin` različit po pregledačima - Edge/Chrome daju `file://` (pa bi se kopirala
  putanja `file:///C:/Users/…` sa tog računara, koju komšija ne može da otvori), a Firefox i
  Safari daju doslovno `"null"` (pa bi tekst bio `null/C:/Users/…`). Isti razlog važi za "Kopiraj
  link" u detalju prijave (`js/radar.js` → `linkPrijave`): tamo se link i dalje prikazuje (domaćinu
  koristi na tom računaru), ali uz napomenu `.detalj-napomena` da radi samo lokalno. **Kad sajt
  dobije domen, obe stvari prorade same od sebe - u kodu se ništa ne menja.**
- **"Dodaj u kalendar"** - dugme `[data-kalendar]` u kartici "Sledeći zbor"; `hidden` je dok
  `sledeciZbor.datum` nije popunjen (ništa se ne izmišlja). `js/app.js` pravi `.ics` po RFC 5545:
  `DTSTART` je **lokalno vreme** (bez `Z` i bez `TZID`) pa ga kalendar tumači u zoni posetioca;
  **`DTEND` se ne upisuje** jer Zbor ne objavljuje trajanje; tekst se eskejpuje (`\`, `;`, `,`,
  novi red) i redovi se prelamaju na **74 okteta** - UTF-8 bajtova, ne znakova (`okteta()` u
  `js/app.js`): naša slova č, ć, š, ž, đ su po 2 bajta, pa bi brojanje `red.length` prešlo 75.
  Fajl je `zbor-YYYY-MM-DD.ics` i pravi se u pregledaču (Blob) - ništa se ne šalje na server.
  `DESCRIPTION` i `URL` se **ne upisuju kad nema sadržaja** (sa diska nema adrese sajta, a bez
  dnevnog reda nema opisa) - prazna svojstva se ne izmišljaju.
- Za proveru iz konzole: `ZBOR.ics({datum:"2026-12-06", vreme:"18:00", mesto:"Bronx"})`
  (`window.ZBOR` postoji samo zbog toga).

## Blagi 3D efekti (od 9. 11. 2026, korisnik: "dobri su efekti")
Isprobani na probnoj strani (obrisana posle prenosa), pa prebačeni na sajt. Stil je blok
"Blagi 3D efekti" na kraju `css/styles.css`, a pokreće ih kraj `js/app.js`:
- **Kartice vesti** (`.kartica`, naslovna i arhiva) se naginju ka mišu do **4°**, podignu 3 px i
  dobiju odsjaj; `js/app.js` postavlja `--rx`/`--ry`/`--gx`/`--gy` i klasu `.je-nagnuta`. Samo za
  `(hover: hover) and (pointer: fine)` - na dodir kartica stoji ravno.
- **"Nekad i sad"** (fotografija u sekciji `#nas-kraj`, `figure.okret` u `index.html`): dugme sa dve strane
  (`foto-03.jpg` nekad / `uvod.jpg` danas), klik/Enter/razmak okreće (`.je-okrenut`, `aria-pressed`).
- **Dubina**: `.foto-pojas img` je 440 px u pojasu od 340 px (`margin: -50px 0`), `js/app.js` je
  pomera do ±45 px (`--pomak`) dok se skroluje - ivica slike se nikad ne vidi.
- **"Sledeći zbor"** (`.kartica-zbor`) se na prelaz mišem izdigne 6 px i nagne 4° unazad.
- **Puna dugmad** (`--akcenat`, `--crveno`, `--bela`, `--svetlo`) imaju donju ivicu od 4 px i na
  klik utonu (`translateY(4px)`); `.dugme--obrub` ostaje ravno.
- Uz `prefers-reduced-motion` nema naginjanja, izdizanja ni pomeranja (okretanje radi, bez animacije).

## Naš kraj (od 9. 11. 2026)
Priče o kraju iz korisnikovog paketa `liman2_nas_kraj_sajt.zip` (`nas-kraj.md`). Korisnik je izabrao da se
"Nekad i sad" i "Priča o Limanu 2" **prekroje i spoje**, da se ništa ne ponavlja:
- `nas-kraj/index.html` - polazna strana: 7 kartica (`.kartice--kraj`, grid), dugme "Pošalji fotografiju ili
  sećanje". Meni svuda: **"Naš kraj"** (na naslovnoj `#nas-kraj`, drugde `nas-kraj/index.html`); u podnožju
  "Naš kraj" umesto "Priča o Limanu 2".
- Priče, svaka na svojoj strani: `nas-kraj/bosko-buha.html`, `nas-kraj/skola-jovan-popovic.html`,
  `nas-kraj/fk-kabel.html`, `nas-kraj/strand.html`, `nas-kraj/danubius.html`, `nas-kraj/zuta-kuca.html`. Tekst je
  **doslovno iz `nas-kraj.md`**, samo su duge crte zamenjene sa " - " (raspon brojeva `1936-1937`).
- `nas-kraj/liman-2.html` (adresa ostaje, zbog već podeljenih linkova) = postojeća priča **spojena** sa
  "Liman pre Limana": dodati grčko poreklo imena, Mali/Veliki Liman (1764), pruga na mestu Bulevara,
  Trčika, kuće bez kanalizacije, nasipanje do 1955; škola i Dunav su skraćeni na link ka svojim pričama.
- Naslovna: sekcija `#nas-kraj` (bila `#nekad`) - fotografija koja se okreće ostaje, ispod tri kartice
  (Boško Buha, Štrand, Žuta kuća) i dugmad "Sve priče iz kraja" / "Priča o Limanu 2".
- Struktura priče: `article.zapisnik.clanak` (uvod, prva fotografija sa brojem `.foto-broj`, tekst,
  `aside.zanimljivosti` - crna ploča, `.poziv-kraj` - svetao okvir sa fotoaparatom i crvenim dugmetom) → galerija `data-galerija` (ako ima
  više fotografija) → **`#izvori` - poseban deo "Izvori"** (korisnik: "bitno je da se napiše odakle je
  izvor fotki u posebnom delu"): "Izvori fotografija" (numerisano, broj = broj u uglu fotografije),
  "Još fotografija na drugim sajtovima" (samo linkovi) i "Izvori teksta".
- **Fotografije se ne vuku sa tuđih sajtova** - preuzete su u `assets/nas-kraj/` (1100 px + `mala/`
  400 px, JPG bez EXIF-a, tablice zamućene - škola). Wikimedia Commons: autor i licenca pročitani sa
  strane slike (spomenik na Jabuci - javno vlasništvo; škola i Danubius - CC BY-SA 3.0, uz link na
  licencu i napomenu "smanjeno"). Ostale "uz dozvolu".
- Nije preuzeto: "Liman - pogled na naselje i Dunav" (vojvodinauzivo.rs blokira automatsko
  preuzimanje - ne zaobilazi se; stoji kao link) i Fortepan tramvaj (nije iz Novog Sada, bio je samo
  "ilustracija"). Žuta kuća: fotografiju je poslao korisnik 9. 11. 2026 (WebP → JPG preko Windows WIC dekodera, jer
  System.Drawing ne čita WebP) - `assets/nas-kraj/zuta-kuca-01.jpg`; **izvor fotografije još nije upisan**
  (`.popuni` u "Izvorima" priče) - upisati kad korisnik javi autora; ostale fotografije su
  linkovi u izvorima.
- Dugme "Pošalji fotografiju ili sećanje" je `a[data-eposta][data-tema]` - `js/app.js` pravi
  `mailto:` sa naslovom poruke iz `data-tema` (npr. "Naš kraj: Štrand").
- Nova priča: nova `nas-kraj/<ime>.html` po uzoru na postojeću (isti delovi i "Izvori"), kartica u
  `nas-kraj/index.html`, a po želji i na naslovnoj.
- **Proveriti u izvorima pre prave objave** (nisu provereni, preneti su iz paketa): Kabel osvojio
  Srpsku ligu Vojvodina 2024/25; Jockov 40 golova 1952; najava preseljenja Danubiusa 2023; rečenica o
  crkvi na mestu Žute kuće i "podeljenim mišljenjima" komšija.

## Galerija i pregled fotografija (od 8. 11. 2026)
- Galerija je `.galerija` + `.galerija-lista`; da bi imala pregled, na njoj stoji `data-galerija`.
  Galerija sa akcije je na **strani akcije** (`akcije/2026-10-31.html`), a na naslovnoj je ostala
  samo ona kod prvog zbora. Slike sa akcije se **ne prikazuju na naslovnoj** - do njih vodi naslov
  kartice "Vratimo sjaj lepom Limanu 2" (jedini link u kartici; posebna veza ispod teksta je
  uklonjena kao suvišna).
- Sličice u spisku su **iste veličine** (`.galerija-lista img`: visina 170 px, `object-fit: cover`),
  pa se portret i pejzaž ne razlikuju.
- Klik na sličicu otvara `js/app.js` pregled preko cele strane (`.pregled`): `.pregled-okvir` je uvek
  isti (apsolutno postavljen, `inset: 64px 76px 52px`; na telefonu `56px 8px 84px`), a slika se u
  njemu uklapa sa `object-fit: contain` - zato sve slike imaju isti okvir i ne skaču pri listanju.
  **Slike ne smeju biti same apsolutno postavljene sa `width/height: auto`** - tada `img` uzima
  prirodnu veličinu (pre učitavanja 0x0), pa je zato okvir `.pregled-okvir`.
- Strelice ‹ › **računa `js/app.js` (`postaviStrelice`) iz prirodne veličine slike**: stoje unutar
  fotografije, 6 px od njene ivice i po sredini njene visine - ne uz ivicu okvira, gde bi visile u
  praznoj traci koju `object-fit: contain` ostavlja kod uskih (portret) slika. Preračunavaju se pri
  svakom listanju, posle učitavanja slike (`load`) i pri promeni veličine prozora. Listanje: dugmad,
  tasteri levo/desno, povlačenje prsta (dodir), brojač "3 / 12"; zatvaraju Esc, × i klik na tamnu
  podlogu. Fokus se vraća na sličicu, strana iza ne skroluje (`html.pregled-otvoren`).
- **Fokus ne može da pobegne iz pregleda** (`zamkaZaTab()` u `js/app.js`): `.pregled` je običan div sa
  `role="dialog" aria-modal="true"`, pa bi - za razliku od `<dialog>`, koji fokus drži sam preko
  `showModal()` - Tab otišao na stranu ispod. Zato se Tab i Shift+Tab vrte u krug unutar pregleda.
  `fokusabilni()` izbacuje `hidden` i `display: none` elemente (strelice kad je samo jedna slika),
  pa nevidljivo ne ulazi u krug. Isti mehanizam važi i za `.pregled-teksta`.
- Bez skripte link i dalje otvara punu sliku u novom tabu; Ctrl/Cmd/Shift-klik to radi i sa skriptom.

## Podnožje (od 8. 11. 2026)
- Ista rečenica na svim stranama: "Sajt vode komšije sa Limana 2, uz podršku Zbora građana MZ
  Boško Buha, udruženja građana "Andergrand" i UnderGRAND radija." Naziv radija je link na
  `https://undergrandradio.com/` (`target="_blank"`, `rel="noopener"`), stil `.podnozje-brend a`.
- Menja se u svakoj strani pojedinačno (strane su statične); na `radar.html` u istom pasusu stoji
  i atribucija mapa.
- **Od 9. 11. 2026 tri kolone** (korisnik izabrao predlog "A"): `.podnozje-kolone` (grid) =
  `.podnozje-brend` (logo 52 px sa crvenim rubom + "Liman 2 / Zbor građana MZ Boško Buha" +
  rečenica) | `nav` "Sajt" (Naslovna - osim na `index.html`, Zapisnici zborova, Priča o Limanu 2,
  Pravila objavljivanja, Podeli stranu) | `nav` "Prati nas" (Instagram `data-instagram`, Facebook
  `data-facebook`, "Piši Zboru" `data-eposta`). Ispod je `.podnozje-dno`: verzija (ubacuje je
  `js/verzije.js` na početak) i "Bez praćenja posetilaca". Linkovi su bez podvlačenja, podvuku se
  na prelaz mišem. Na užem ekranu (760 px) brend ide preko cele širine, a ispod 420 px sve u jednu
  kolonu.
- Adrese mreža su u `podesavanja.js` (`facebookStranica`, `instagram`); `js/app.js` ih upisuje, a
  ako je adresa prazna, stavka se sakrije.

## Provera pre objave
```
python Zbor/alati/proveri.py            ili dvoklik na Zbor/alati/Proveri.bat
python Zbor/alati/proveri.py --sve      ispiše i svaku prijavu koja je u redu
```
Samo čita, ništa ne menja; izlaz 0 = sve u redu, 1 = ima grešaka (upozorenja ne prekidaju).
Proverava:
- `data/prijave.js` - obavezna polja, `id` jedinstven i za adresu (`radar.html#p-<id>`),
  `vrsta` i `status` iz `js/radar-osnova.js`, `datum` (YYYY-MM-DD), `podrske`, svaki korak
  `istorija`, `lokacija` **unutar granice MZ** i da fotografija postoji u `data/fotografije/`;
- `data/ustanove.js` - jedinstven `id`, ispravna e-pošta, poznate vrste i da **svaku vrstu
  prima bar jedna ustanova** (inače prijava nema kome da ode);
- `data/granica.js` - bar tri tačke, ispravan oblik i zatvorena granica.
JS oblika `window.X = [ … ];` (ključevi bez navodnika) se čita tako što se pretvori u JSON,
pa se greška prijavi sa redom i kolonom.

## Boje linkova po podlozi (od 8. 11. 2026)
- `a` koristi `var(--link)` i `var(--link-hover)`. Podrazumevano je **belo** (`--na-crvenoj`), jer
  je cela strana crvena - ranije je link bio crven na crvenom (npr. u poruci „arhiva je prazna“,
  kontrast 1:1, praktično nevidljiv).
- Bele ploče vraćaju crveni akcent i tamnu koprenu za obrub dugmad: `.preskoci`, `.zapisnik`,
  `.prijava`, `.filteri`, `.forma-radar`, `.kartica`, `.telefoni-grupa`, `.dijalog`
  (`--link: var(--akcent)`, `--obrub-hover: rgb(0 0 0 / .06)`).
- Crne ploče daju bele linkove: `.header`, `.kartica-zbor`, `.traka-cinjenice`, `.odluke`,
  `.traka-predlozi`, `.podnozje`.
- `.dugme--obrub:hover` **ne menja boju teksta** (ranije je išao u `--crvena-tamna`, skoro nevidljiv
  na crvenoj) - samo dobije koprenu: belu na crvenom, tamnu na belom.
- Kada se dodaje nova ploča sa svojom pozadinom, postavi joj `--link`/`--link-hover` (i
  `--obrub-hover` ako sadrži obrub dugmad). Provereno u pregledaču: na svih 11 strana nema
  vidljivog linka sa kontrastom ispod 3:1.

## Vesti (od 8. 11. 2026)
- **PRAVILO (korisnik, obavezno)**: na naslovnoj se u "Aktuelno i akcije" vide **najviše 2
  objave**; sve starije idu u `arhiva.html` (puni se iz istog fajla - ništa se ne premešta ručno).
  U zaglavlju te sekcije stoji link **„Arhiva vesti“** (ranije je tu bio „Vesti na Facebook-u“;
  Facebook je ostao u podnožju).
- Vesti su u `data/vesti.js` (`window.VESTI`), isti obrazac kao `prijave.js`/`ustanove.js`.
  `js/app.js` crta kartice u "Aktuelno i akcije": **najviše 2 najnovije**, po `datum` (najnovije prve).
  Dok vesti nema, umesto njih stoji kartica sa žutim poljima (`data-vest-prazna` u `index.html`) -
  čim se pojavi prva vest, `js/app.js` je sakrije.
- Vesti se **ne pišu ručno**: program `Zbor/alati/vesti.py` (dvoklik na `Zbor/alati/Vesti.bat`, prečica
  "Zbor MZ BB vesti" na desktopu). Prozor ima datum (unapred današnji), natpis/vrstu, naslov, uvod,
  izbor slike, opis slike, **link** (strana na sajtu) i tekst linka; dugmad **„Dodaj karticu“**,
  **„Proveri podatke“**, **„Objavi na GitHub“**, **„Otvori data/vesti.js“**, a ispod spiska
  „Uredi izabranu“, „Obriši izabranu“ i „Otkaži izmenu“.
- U `data/vesti.js` su i **obe stalne kartice** (akcija "Vratimo sjaj lepom Limanu 2" i zbor
  "Usvojeni zaključci…"), pa se i one menjaju kroz program - `index.html` više ne sadrži te kartice,
  samo praznu karticu sa žutim poljima (koja se sakrije kad fajl nije prazan).
- Polja kartice: `id`, `datum`, `vrsta` (mali natpis; ako ga nema - "VEST · datum"), `naslov`,
  `uvod` (do 1500), `slike` (spisak fotografija - **prva je naslovna na kartici**, ostale su
  galerija), `alt` (obavezan ako ima fotografija), `link` (naslov kartice tada vodi tamo) i
  `linkTekst` (mali link na dnu).
- **Vesti se menjaju isključivo kroz program.** Stavka dodata ručno preko
  `window.VESTI.push(...)` na kraju `data/vesti.js` vidi se na sajtu, ali je program i
  `proveri.py` ne vide (čitaju samo glavni spisak `window.VESTI = [...]`), pa joj se ne može
  prići ni urediti - zato `proveri.py` sada prijavljuje takav `push` kao grešku.

- **Uvod na kartici staje u 6 redova.** Uvod može imati do 1500 znakova, pa bi kartica bila
  ogromna: `.kartica-uvod` u `css/styles.css` koristi `-webkit-line-clamp: 6`, a `js/app.js`
  (`podesiUvode()`) proveri da li je tekst skraćen i samo tada pokaže dugme **„Pročitaj više“**.
  Dugme otvara `pregled-teksta` - belu ploču preko strane sa naslovom, natpisom, celim tekstom
  (`white-space: pre-line`, pa se novi red iz programa vidi kao novi pasus) i linkom kartice.
  Zatvara se na ×, na tamnu podlogu i na Escape; fokus se vraća na dugme, a `zamkaZaTab()` drži
  Tab/Shift+Tab unutar ploče. Isti pregled radi i
  u `arhiva.html` (kartice pravi ista funkcija). Provera skraćenosti se ponavlja pri promeni
  širine prozora i posle učitavanja fontova.

  fotografija, 2-4 fotografije, 5+ fotografija - `kolikoFotografija()` u `js/app.js`); klik na
  naslovnu sliku otvara **pregled svih fotografija te kartice** (strelicama levo-desno).
  Osluškivač za pregled je jedan, na nivou strane (`document`), pa radi i za kartice koje
  `js/app.js` nacrta posle učitavanja.
- Fotografije na kartici: program ih prima **bilo koje veličine i formata** (JPG/PNG sa telefona),
  smanjuje na **1100 px** duže strane, **pretvara u JPG**, skida EXIF i pravi `mala/` verziju
  (400 px); imena su `<id>-01.jpg`, `<id>-02.jpg`…
- **`data/vesti.js` se ne otvara dvoklikom**: Windows `.js` veže za Windows Script Host, pa bi ga
  pokrenuo kao skriptu i prijavio `window is undefined` (linija 16). U programu ide dugme
  „Otvori data/vesti.js“ (otvara Notepad, `otvori_u_notepadu()`); ručno: desni klik → Open with →
  Notepad. Isto važi za `data/prijave.js`, `data/ustanove.js` i `data/granica.js`.
- Pravila (sprovodi program, proverava i `proveri.py`):
  `datum` YYYY-MM-DD · `naslov` do **70** znakova · `uvod` do **500** · `id` jedinstven (od naslova,
  mala slova i crtice) · `slika` može da bude `null`, ali ako je ima - `alt` je **obavezan** ·
  tablice zamutiti pre unosa (lica mogu da se vide).
- Slika: program uzima bilo koju (sa telefona), smanjuje na **1100 px** duže strane, kvalitet 82,
  **skida EXIF**, pravi `assets/vesti/mala/<id>.jpg` (**400 px**). Obrada ide preko Windows-a
  (`System.Drawing` kroz PowerShell), jer Pillow nije instaliran.
- „Objavi na GitHub“ prvo pokrene `proveri.py`; ako provera ne prođe - ništa se ne objavljuje.
  Zatim `git add Zbor`, `git commit -m "Zbor: vest - <naslov>"`, `git push origin main`.
- Provera programa bez prozora: `python Zbor/alati/vesti.py --probaj` (doda probnu vest, proveri je i
  sve vrati kako je bilo).

## Grafika u podnožju (od 8. 11. 2026)
- **Ikonice uz linkove** u podnožju su SVG **maske** (`mask`/`-webkit-mask` + `background:
  currentColor`, 15 px), pa se boje prate tekst i hover. Nema novih slika - SVG je u `data:` URL-u
  u `css/styles.css`, pa važi na svim stranama.
- Koja ikonica ide gde bira se po `href`/`data-` atributu linka (`[data-ikona="zapisnici"]`,
  `[data-ikona="nas-kraj"]`, `[data-ikona="naslovna"]` - od 10. 11. 2026, jer `href` više nije isti na svim stranama; `[href*="facebook"]`, `[href*="instagram"]`, `a[data-eposta]`,
  `button[data-dijalog="pravila"]`, `button[data-podeli]`); podrazumevano je dokument.
  Radio ikonica je uz link u rečenici podnožja (`.podnozje-brend a`).
- Silueta blokova iznad podnožja je probana i **uklonjena na korisnikov zahtev** (8. 11. 2026) -
  ne vraćati bez pitanja.

## Pregled
`.claude/launch.json` → "zbor" (port 8441, `python -m http.server --directory Zbor`) ili dupli
klik na `Zbor/index.html`. Mapa traži internet.

## Pregled na webu - GitHub Pages (od 9. 11. 2026)
- Korisnik je hteo link za drugare (ZIP im je već poslao): **https://gomez021ns-jpg.github.io/liman2-zbor/**
  - poseban **javni** repozitorijum `github.com/gomez021ns-jpg/liman2-zbor` = folder
  `C:\Users\HAL9000\liman2-zbor` (Pages: main, / root). Fotografije sa Gradskog info-a su uključene
  (korisnikov izbor za pregled); dozvola i dalje treba pre prave objave.
- Pravi ga `python Zbor/alati/objavi_zbor.py` (`--posalji` = i `git push`; prijava je sačuvana, Claude
  može sam). Kopira **samo spisak dozvoljenog** (`*.html`, `*.js`, `css/styles.css`, `assets/`, `data/`,
  `vendor/`; nikad `.py`, `.bat`, `.txt`, `.md`, `CLAUDE.md`), dodaje `.nojekyll` i `README.md`.
  Prekida ako `proveri.py` nađe grešku, ako neki fajl sadrži vrednost iz `.env` ili ako neka JPG
  slika ima EXIF.
- Ovo je **pregled**: svaka objavljena strana dobija `<meta name="robots" content="noindex, nofollow">`
  (ubacuje ga skript, izvorni fajlovi ga nemaju), pa sajt nije u Google pretrazi i verzija ostaje 0.x.
  **Prava objava** = `objavi_zbor.py --javno` (bez noindex) + unos `velika: true` u `data/verzije.js`
  (1.0.0) + `og:url`/apsolutni `og:image` na ovoj adresi (vidi "Šta još nije popunjeno").
- Posle svake izmene sajta: ponovo `objavi_zbor.py --posalji`; Pages se osveži za minut-dva.
- Pages drži `.css`/`.js` 10 minuta u kešu (`max-age=600`), pa je posle objave posetilac video nove
  strane sa starim stilom. Zato `objavi_zbor.py` u objavljenim stranama svakoj vezi na naš `.css`/`.js`
  dodaje `?v=<otisak fajla>` (prvih 8 znakova SHA-1) - izvorni fajlovi to nemaju.

## Lokacija u radaru (od 8. 11. 2026)
- Dugme **„Koristi moju lokaciju“** radi samo u **bezbednom kontekstu**: preko lokalnog servera
  (`http://127.0.0.1:8441`) ili https. Kad se strana otvori **dvoklikom na fajl** (`file://`),
  pregledači blokiraju geolokaciju - zato za to služi **`Zbor/alati/Pokreni.bat`** (pokrene server na
  8441 i otvori radar u Edge-u; zatvaranjem prozora server se gasi).
- Poruke o grešci su razvrstane po `code` (1 = odbijeno u pregledaču, 2 = lokacija isključena u
  Windows-u, 3 = isteklo vreme) i uvek kažu šta kliknuti; ako nema bezbednog konteksta, poruka
  kaže da se otvori preko servera.
- Windows: **Podešavanja → Privatnost i bezbednost → Lokacija** mora biti uključena; u Edge-u
  ikonica lokacije u adresnoj traci → „Dozvoli“ za `127.0.0.1`.

## Šta još nije popunjeno
- Naslovna: **sve tri kartice u "Aktuelno i akcije" su u `data/vesti.js`** (nema ih više u HTML-u):
  - akcija - `vrsta` "AKCIJA · …", letak `assets/akcija-2026-10-31/letak.jpg`, `link`
    `akcije/2026-10-31.html` (naslov kartice vodi tamo);
  - zbor građana - fotografija `assets/zbor-2025-10-26.jpg`, `link` `zapisnici/2025-10-26.html`,
    `linkTekst` "Otvori zapisnik →";
  - vesti - unose se programom `Zbor/alati/vesti.py` (vidi "Vesti").
  `index.html` sadrži samo karticu sa žutim poljima (`.popuni`) za slučaj da `data/vesti.js` bude
  prazan - `js/app.js` je sakrije čim ima ijednu karticu. Sve slike kartica su u istom okviru
  (`.kartica-slika-img`, `object-fit: cover`, 160 px).
- `assets/akcija-2026-10-31/` - letak + `foto-01…12.jpg` sa akcije (do 1100 px, bez EXIF-a) i
  `mala/` (400 px) za spisak; uputstvo za dodavanje novih u `procitaj-me.txt` tamo.
- Fotografije u "Priči o Limanu 2" (Gradski info) i u pričama "Naš kraj" objavljene su **uz dozvolu**
  (korisnik, 9. 11. 2026: "imamo dozvole... samo treba potpisati") - potpis je u delu "Izvori" na dnu priče.
- **`og:image` je relativna putanja** (`assets/og-slika.png`) i **`og:url` ne postoji** - Open Graph
  traži apsolutne URL-ove, pa Viber/WhatsApp/Facebook neće prikazati sliku uz link. Ne može da se
  popravi dok sajt nema domen. **Kad dobije domen:** na strane sa `og:*` (`index`, `radar`,
  `arhiva`, `liman-2`, `akcija-2026-10-31`, `nas-kraj` i šest `nas-kraj/*.html`) upisati pune URL-ove i dodati `og:url`; zapisničkim
  stranama (`zapisnici/index.html` i svi `zapisnici/*.html`) `og:*` uopšte ne postoji - dodati ga tad.
- Pregled je na GitHub Pages (vidi "Pregled na webu"); da li prava objava ostaje na toj adresi ili
  dobija svoj domen još nije odlučeno. Sajt nije u `objavi_web.py` i ne ide tamo.
