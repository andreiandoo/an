# Decizii de design

- 2026-11-01: fără fonturi serif în acest proiect. Prima mostră a fost respinsă.
- Text: „9 produse construite”, nu „live”.
- „În lucru”: Story of WHO, Route-a-Roo, Actoria, CineSunt, Bine.ro, toate rămân.
- Cele 18 domenii merg pe o pagină separată.
- Veniturile Stripe sunt puse deoparte până când e gata site-ul.
- 2026-11-01: monocrom, un singur accent folosit minimal. Text mic și îngust, fără titluri mari sau late.
- 2026-11-01: carduri pe arc, în mișcare și animate.
- 2026-11-01: carduri format telefon. Derulare și culoare doar la hover, altfel alb-negru. Accent portocaliu aprobat.
- Clipurile claude-motion vin doar după varianta finală a paginii.
- 2026-11-01: construcție Astro static pe branch-ul redesign. Fără link pentru Route-a-Roo (domeniu expirat), Actoria (503), CineSunt (temă goală).
- 2026-11-01: panglica doar pe Servicii, acasă doar arc. Ordine arc: Tixello, AmBilet, bilete.online, TICS, Dreams Atlas, Viaqui, e-test, dubidu, eMUD. Clienți: tunel 3D.
- 2026-11-01: două obiective pe homepage: prezentare personală și promovarea ideii de cofondator. Accente portocalii mici, peste tot. Cifre reale pe proiecte.
- 2026-11-01: imagini mereu color, inclusiv ribbon și fotografia. Fără box-shadow. Texte mai mari. Prețuri explicative și pași cu scroll.
- 2026-11-01: Servicii: haos spre ordine, aplicația explodată 3D, calculator cu slidere.
- 2026-11-01: haos cu streamlines și procesare; aplicația explodată cu piese 3D reale și etichete; Cofondator: produsul care se construiește singur.
- 2026-11-01: explozie: piesele apar doar pe felia în focus. Builder cu colaboratori, cod, terminal și telefon. Site lansat pe andreinastase.ro.

## 2026-11-01: home page, depth and receipt
Three real product screens as hero layers, moving at different rates while the dark section rises over them. They stay static inside the frame: images move only on hover. A small receipt collects real figures while scrolling and lands in the contact section as a ledger ending in "Urmează proiectul vostru". The TICS line stays live. Principles from scroll-craft; its engine and paid image generation are not used.

## 2026-11-02: process as stacked cards
"Cum lucrez" takes the mechanics of clay.com's features section: sticky cards stacking over each other, a tag with growing rings, a two-tone heading, and one ball travelling through a machine on every card. The machines are our own Three.js models in neutral tones with an orange ball; no Clay artwork is used. One WebGL renderer draws into a 2D canvas per card, Three loads only near the section.
