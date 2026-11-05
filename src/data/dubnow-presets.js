// Example texts for the Dubnow demo, in Romanian and English. All original, written for this page.
// In a script, every line starts with the character's name and a colon; each character gets its own voice.
export const presets = {
  quote: {
    ro: 'Cele mai bune povești nu se citesc. Se ascultă, seara, cu lumina stinsă și cu cineva drag alături.',
    en: 'The best stories are not read. They are heard, at night, with the lights off and someone you love beside you.',
  },
  paragraph: {
    ro: 'În fiecare seară, Mara alege un film și se așază pe canapea lângă fratele ei mai mic. El are cinci ani și încă nu poate citi subtitrarea, așa că până acum se uita doar la imagini. De data asta, personajele vorbesc în română, iar el râde la fiecare glumă, înaintea ei. La final o întreabă dacă mâine se mai uită la unul. Filmul a durat o oră și douăzeci de minute, dar seara a părut mult mai lungă. Și mult mai frumoasă.',
    en: 'Every evening, Mara picks a film and sits on the sofa next to her little brother. He is five and cannot read subtitles yet, so until now he only watched the pictures. This time, the characters speak his language, and he laughs at every joke before she does. At the end he asks whether they can watch another one tomorrow. The film lasted an hour and twenty minutes, but the evening felt much longer. And much nicer.',
  },
  script: {
    ro: 'Vulpea: Ai văzut? Râul a înghețat peste noapte!\nUrsul: Am văzut. Am încercat deja să merg pe el.\nVulpea: Și? Cum a fost?\nUrsul: Rece. Foarte rece. Și puțin ud, la final.\nVulpea: Deci gheața nu te-a ținut.\nUrsul: M-a ținut trei pași. Al patrulea a fost o greșeală.',
    en: 'Fox: Did you see? The river froze overnight!\nBear: I saw. I have already tried walking on it.\nFox: And? How was it?\nBear: Cold. Very cold. And a little wet, at the end.\nFox: So the ice did not hold you.\nBear: It held me for three steps. The fourth was a mistake.',
  },
};

export const modes = {
  ro: [['free', 'Text liber'], ['quote', 'Citat'], ['paragraph', 'Paragraf'], ['script', 'Scenariu']],
  en: [['free', 'Freeform'], ['quote', 'Quote'], ['paragraph', 'Paragraph'], ['script', 'Script']],
};
