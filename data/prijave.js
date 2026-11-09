// Prijave za Komšijski radar.
// TRENUTNO NEMA PRIJAVA - radar je prazan, a sajt prikazuje poziv da se prva prijavi.
//
// Nova prijava se dodaje u niz ispod, po ovom obrascu:
// {
//   id: "rasveta-kod-igralista",      // deo adrese: radar.html#p-rasveta-kod-igralista
//   lokacija: [45.23979, 19.84796],   // [širina, dužina] - tačka na mapi
//   vrsta: "rasveta",                 // rasveta, smece, parking, zelenilo, ulice
//   opis: "Ugašena je rasveta kod igrališta.",
//   fotografija: null,                // ili ime fajla u data/fotografije/
//   status: "prijavljeno",            // prijavljeno, prosledjeno, odgovor, reseno, odbijeno
//   podrske: 0,
//   datum: "2026-11-08",
//   istorija: [
//     { datum: "2026-11-08", status: "prijavljeno", napomena: "Prijava primljena sa sajta." }
//   ]
// }
//
// E-pošta prijavioca se ovde NE upisuje (nikad se ne prikazuje javno).
// `Proveri.bat` (ili `python Zbor/proveri.py`) proverava status, vrstu, datum, jedinstven id
// i da je tačka u granici MZ; ništa ne menja, samo čita.
window.PRIJAVE = [];
