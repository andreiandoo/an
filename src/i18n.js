// Two languages: Romanian at the root, English under /en/. Every page has a twin in the other language;
// `alternate` finds it so the header switcher and hreflang links always point to the matching page.
export const pairs = [
  ['/', '/en/'],
  ['/servicii/', '/en/services/'],
  ['/cofondator/', '/en/cofounder/'],
  ['/domenii/', '/en/domains/'],
  ['/proiecte/', '/en/projects/'],
  ['/audit-aplicatii-ai/', '/en/ai-app-audit/'],
];

export function alternate(path, lang) {
  const i = lang === 'en' ? 1 : 0;
  const hit = pairs.find(p => p[i] === path);
  if (hit) return hit[1 - i];
  if (lang === 'en' && path.startsWith('/en/projects/')) return path.replace('/en/projects/', '/proiecte/');
  if (lang !== 'en' && path.startsWith('/proiecte/')) return path.replace('/proiecte/', '/en/projects/');
  return lang === 'en' ? '/' : '/en/';
}

export const locale = lang => (lang === 'en' ? 'en-US' : 'ro-RO');
export const num = (n, lang, dec = 0) => n.toLocaleString(locale(lang), { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const ui = {
  ro: {
    home: '/',
    nav: [['/proiecte/', 'Proiecte'], ['/servicii/', 'Servicii'], ['/cofondator/', 'Cofondator', true], ['/#despre', 'Cine sunt']],
    cta: ['/#contact', 'Apel gratuit'],
    menu: 'Meniu', close: 'Închide', brandLabel: 'Andrei Năstase, pagina principală', navLabel: 'Principal', footLabel: 'Subsol',
    switchLabel: 'English version', switchText: 'EN',
    foot: [['/proiecte/', 'Proiecte'], ['/servicii/', 'Servicii'], ['/audit-aplicatii-ai/', 'Audit aplicații AI'], ['/cofondator/', 'Cofondator'], ['/domenii/', 'Domenii de vânzare']],
    jobTitle: 'Senior full-stack developer',
  },
  en: {
    home: '/en/',
    nav: [['/en/projects/', 'Projects'], ['/en/services/', 'Services'], ['/en/cofounder/', 'Co-founder', true], ['/en/#despre', 'About']],
    cta: ['/en/#contact', 'Free call'],
    menu: 'Menu', close: 'Close', brandLabel: 'Andrei Năstase, home page', navLabel: 'Main', footLabel: 'Footer',
    switchLabel: 'Versiunea în română', switchText: 'RO',
    foot: [['/en/projects/', 'Projects'], ['/en/services/', 'Services'], ['/en/ai-app-audit/', 'AI app audit'], ['/en/cofounder/', 'Co-founder'], ['/en/domains/', 'Domains for sale']],
    jobTitle: 'Senior full-stack developer',
  },
};

// Shared labels used by components and case studies.
export const words = {
  ro: {
    back: '← Proiecte', short: 'Pe scurt', code: 'Cât cod', estimate: 'estimare',
    endH: 'Ai un proiect asemănător?', endP: 'Construiesc produse web de la idee la lansare, ca dezvoltator sau ca cofondator tehnic. Scrie-mi și vedem dacă se potrivește.',
    write: 'Scrie-mi', more: 'Alte proiecte', contact: '/#contact', projects: '/proiecte/',
    summary: ['Problema', 'Ce am construit', 'Rezultatul'],
    process: 'Cum lucrez', lasts: 'Durează', yourTime: 'Timpul vostru',
  },
  en: {
    back: '← Projects', short: 'In short', code: 'How much code', estimate: 'estimate',
    endH: 'Working on something similar?', endP: 'I build web products from idea to launch, as a developer or as a technical co-founder. Write to me and we will see if it fits.',
    write: 'Write to me', more: 'More projects', contact: '/en/#contact', projects: '/en/projects/',
    summary: ['The problem', 'What I built', 'The result'],
    process: 'How I work', lasts: 'Takes', yourTime: 'Your time',
  },
};
