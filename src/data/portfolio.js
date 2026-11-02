export const products = [
  { name: 'Tixello', file: 'tixello', tag: 'SaaS ticketing', url: 'https://tixello.com', stat: '408.153 bilete' },
  { name: 'AmBilet', file: 'ambilet', tag: 'Bilete', url: 'https://ambilet.ro', stat: '+148% vânzări' },
  { name: 'bilete.online', file: 'bilete-online', tag: 'Atracții', url: 'https://bilete.online' },
  { name: 'TICS Radar', file: 'tics', tag: 'Comparator', url: 'https://tics.ro', stat: '20 de platforme' },
  { name: 'Dreams Atlas', file: 'dreamsatlas', tag: 'AI', url: 'https://dreamsatlas.com', stat: '3,22M afișări' },
  { name: 'Viaqui', file: 'viaqui', tag: 'Turism', url: 'https://viaqui.com' },
  { name: 'e-test.ro', file: 'e-test', tag: 'Educație', url: 'https://e-test.ro' },
  { name: 'dubidu', file: 'dubidu', tag: 'Lansare 1 dec.', url: 'https://dubidu.net' },
  { name: 'eMUD', file: 'emud', tag: 'De vânzare', url: 'https://a-n.ro' },
  { name: 'ePAS', file: 'epas', tag: 'Prototip', url: 'https://epas.ro', h: 1688 },
];

export const inWork = [
  { name: 'Story of WHO', file: 'storyofwho', url: 'https://storyofwho.com', status: 'În lucru', text: 'Povești de seară pentru copii, personalizate cu AI.' },
  { name: 'Route-a-Roo', file: 'routearoo', status: 'În lucru', text: 'Planificare de turnee pentru artiști: rute, săli, organizare.' },
  { name: 'Actoria', file: 'actoria', status: 'În lucru', text: 'Leagă actorii de directorii de casting și casele de producție.' },
  { name: 'CineSunt', file: 'cinesunt', status: 'În lucru', text: 'Platformă de autocunoaștere.' },
  { name: 'Bine.ro', file: 'bine', url: 'https://bine.ro', status: 'De vânzare', text: 'Cumperi online, iar o parte din bani merge automat la o cauză.' },
];

export const roles = [
  { name: 'Narada', years: '2020–2022', role: 'CTO', text: 'ONG de educație. Strategie tehnică, arhitectură și echipe de dezvoltare, inclusiv Naradix LMS, cu peste 27.000 de utilizatori, și HartaEdu.', url: 'https://narada.ro' },
  { name: 'LAROCK Festival', years: '2024–2025', role: 'Project Manager și director de festival', text: 'Festival de rock pe mai multe zile, cu artiști din țară și din afară.', url: 'https://larockfestival.ro' },
  { name: 'FREEFEST Festival', years: '2011–2013', role: 'Director de festival', text: 'Festival de muzică cu intrare liberă. Trei ediții la rând: operațiuni, artiști, logistică.' },
];

const slug = name => name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const c = (name, url, cat, work) => ({ name, url, cat, work, file: slug(name) });

export const clients = [
  c('Fiskl', 'https://fiskl.com', 'Fintech', 'Site de prezentare'),
  c('DMonitor.tech', 'https://dmonitor.tech', 'Fintech', 'Platformă web cu 12 integrări API'),
  { ...c('Libazon', '', 'E-commerce', 'Marketplace complet'), offline: true },
  { ...c('SAGA Festival', '', 'Evenimente', 'Site și integrare de ticketing'), offline: true },
  c('Naradix', 'https://naradix.ro', 'Educație', 'Dezvoltare și optimizare LMS'),
  c('Sipex Online', 'https://sipex-online.ro', 'E-commerce', 'Magazin PrestaShop'),
  c('Clinica Dr. Melnic', 'https://clinicadrmelnic.ro', 'Sănătate', 'Design și dezvoltare site'),
  c('HelloFins', 'https://hellofins.com', 'Fintech', 'Dezvoltare WordPress și WooCommerce'),
  c('Arhiserv', 'https://arhiserv.ro', 'Corporate', 'Site de companie'),
  { ...c('Wooba', '', 'E-commerce', 'Magazin online'), offline: true },
  c('Educativa', 'https://educativa.ro', 'Educație', 'Site'),
  c('Optiuni.ro', 'https://optiuni.ro', 'Fintech', 'Dezvoltare full-stack'),
  c('Edmundo', 'https://edmun.do', 'Educație', 'Dezvoltare WordPress multilingv'),
  { ...c('Glora.us', '', 'E-commerce', 'Magazin online'), offline: true },
  c('PerformanceHR', 'https://performancehr.com.au', 'Corporate', 'Site de companie'),
  c('Ploiești 2024', 'https://ploiesti2024.eurospirit.ro/', 'Corporate', 'Platforma Capitalei Tineretului'),
  c('HartaEdu', 'https://hartaedu.ro', 'Educație', 'Idee, MVP și dezvoltare'),
  { ...c('LT Wealth', '', 'Fintech', 'Site'), offline: true },
  c('Talent Financiar', 'https://talentfinanciar.ro', 'Educație', 'Site'),
  c('Teamology Institute', 'https://teamology.ro', 'Educație', 'Site'),
  c('Daisy Tech', 'https://daisy-tech.ro', 'E-commerce', 'Site'),
  c('Din Cămară', 'https://din-camara.ro', 'E-commerce', 'Magazin online'),
  c('eHealth Romania', 'https://ehealthromania.com', 'Sănătate', 'Portal de știri medicale'),
  c('Genuin Shop', 'https://genuin.shop', 'E-commerce', 'Magazin online'),
  c('Virtual360', 'https://virtual360.ro', 'Corporate', 'Site'),
  c('BeeWell', 'https://beewell.ro', 'E-commerce', 'Magazin online'),
  c('D10E', 'https://d10e.biz', 'Corporate', 'Site'),
  c('The Entrepreneurship Academy', 'https://entrepreneurship-academy.ro', 'Educație', 'Site'),
  c('IUF World', 'https://iuf.world', 'Evenimente', 'Site'),
  c('Edu-Start', 'https://edu-start.ro', 'Educație', 'Platformă și site'),
  c('Reveal', 'https://reveal.ro', 'Corporate', 'Site'),
  c('SICAR Museum', 'https://sicarmuseum.ro', 'Cultură', 'Site de muzeu'),
  c('EuroSpirit', 'https://eurospirit.ro', 'Educație', 'Site de organizație'),
  c('ACS Arhivarul', 'https://acsarhivarul.ro', 'Sport', 'Site de club sportiv'),
  c('Sportiv Educat', 'https://sportiveducat.ro', 'Sport', 'Platformă pentru cluburi sportive'),
];

export const numbers = [
  {
    name: 'Tixello', url: 'https://tixello.com', note: 'Procesate prin platformă.',
    metrics: [
      { value: 4980, label: 'evenimente' },
      { value: 106853, label: 'clienți' },
      { value: 408153, label: 'bilete vândute' },
      { value: 5184956, suffix: ' €', label: 'procesați' },
    ],
  },
  {
    name: 'AmBilet', url: 'https://ambilet.ro', note: 'Creștere de vânzări și venituri.',
    metrics: [
      { value: 148, prefix: '+', suffix: '%', label: 'medie pe 5 luni' },
      { value: 300, prefix: 'peste ', suffix: '%', label: 'într-o singură lună' },
    ],
  },
  {
    name: 'Dreams Atlas', url: 'https://dreamsatlas.com',
    metrics: [
      { value: 3.22, dec: 2, suffix: 'M', label: 'afișări organice' },
      { value: 332, label: 'clienți' },
    ],
  },
  {
    name: 'TICS Radar', url: 'https://tics.ro', note: 'Urmărite live.',
    metrics: [
      { value: 4632, key: 'liveEvents', label: 'evenimente' },
      { value: 580857, label: 'locuri monitorizate' },
      { value: 20, key: 'platforms', label: 'platforme' },
      { value: 498, key: 'cities', label: 'orașe' },
    ],
  },
];

export const skills = ['Laravel', 'Vue.js', 'Product design', 'PHP', 'MVP-uri', 'Animație', 'PostgreSQL', 'Strategie de marketing', 'WordPress', 'Stripe', 'Aplicații mobile', 'AWS', 'Integrări AI', 'Extensii Chrome', 'Conducere de echipe'];

export const socials = [
  ['LinkedIn', 'https://linkedin.com/in/andreinastase'],
  ['GitHub', 'https://github.com/andreiandoo'],
  ['Facebook', 'https://www.facebook.com/sinecvanon/'],
  ['Instagram', 'https://www.instagram.com/sinecvanon/'],
];

export const steps = [
  { title: 'Apel gratuit', list: ['Nu pregătiți nimic și nu aveți nevoie de termeni tehnici.', 'Îmi povestiți cum lucrați azi și ce vă încurcă.', 'Dacă nu merită construit, vă spun direct și ne oprim aici.', 'Alegeți singuri ora din calendar.'], head: ['Un răspuns sincer:', 'merită construit sau nu.'], time: '30 de minute', you: '30 de minute', text: 'Îmi spuneți ce vreți să rezolvați. Vă spun dacă vă pot ajuta și cum.', get: 'Un răspuns sincer: merită construit sau nu.' },
  { title: 'Analiză', list: ['Vorbim o oră, apoi vă trimit câteva întrebări.', 'Stabilim ce intră în prima versiune și ce rămâne pentru mai târziu.', 'Primul pas e analiza: dacă nu vă convine ce propun, vă opriți acolo.'], head: ['Un preț fix,', 'înainte de orice linie de cod.'], time: '2–5 zile', you: 'o oră de discuție și câteva răspunsuri', text: 'Mă uit la cum lucrați azi și stabilim ce merită făcut.', get: 'Un preț fix, înainte de orice linie de cod.' },
  { title: 'Construim', list: ['Plătiți pe etape.', 'Codul, datele și conturile sunt pe numele firmei voastre.', 'Aplicația rulează pe conturile voastre, de obicei cu 40 € pe lună, plătiți direct furnizorilor.', 'Fără comision pe rezervare sau pe utilizator.'], head: ['Aplicația, codul,', 'conturile și instrucțiunile.'], time: '3–8 săptămâni', you: 'câte o privire pe fiecare etapă', text: 'Livrez pe etape și vedeți fiecare pas.', get: 'Aplicația, codul, conturile și instrucțiunile.' },
  { title: 'După lansare', list: ['Îmi scrieți doar când vreți ceva nou.', 'Dacă eu nu mai sunt disponibil, aveți tot ce îi trebuie altui programator ca să continue.'], head: ['O aplicație care rămâne', 'a voastră.'], time: 'cât aveți nevoie', you: 'doar când vreți ceva nou', text: 'Modificările costă de la 150 € sau intră într-un abonament lunar pe care îl opriți oricând.', get: 'O aplicație care rămâne a voastră.' },
];

export const founderSteps = [
  { title: 'Îmi spui ideea', list: ['Spune-mi ce problemă ai văzut și cine o are.', 'Dacă vrei, semnez un acord de confidențialitate înainte de primul apel.', 'Ideea rămâne a firmei. Ce îmi scrii rămâne între noi.'], head: ['Într-un apel', 'sau în scris.'], time: '30 de minute', text: 'Într-un apel sau în scris. Dacă îmi scrii, îți răspund în cel mult o zi lucrătoare, cu ce cred și ce întrebări am.' },
  { title: 'Explorăm problema', list: ['Etapa asta e gratuită.', 'Vorbim cu oamenii care au problema, nu doar între noi.'], head: ['Alegem ce intră', 'în prima versiune.'], time: '1–2 săptămâni, gratuit', text: 'Îmi dai context și mă pui în legătură cu cel puțin un om, în afară de tine, care are problema. La final alegem ce intră în prima versiune și scriem termenii. Până semnăm, nu plătești nimic și nu cedezi nimic din firmă.' },
  { title: 'Construim prima versiune', list: ['Eu răspund de produs, tu de clienți și de vânzări.', 'Codul, conturile și datele sunt pe numele firmei de la prima linie.'], head: ['Primii clienți o folosesc', 'repede.'], time: '3–6 săptămâni', text: 'Pe etape, ca primii clienți să o folosească repede. Tu aduci clienții și ce spun ei, eu produsul.' },
  { title: 'Mergem mai departe', list: ['Fiecare își câștigă partea treptat, în câțiva ani.', 'Dacă ne despărțim, rămân doar cu partea câștigată până atunci, iar firma păstrează tot codul.'], head: ['Creștem produsul', 'după ce spun clienții.'], time: 'după lansare', text: 'Rămân în produs și îl creștem după ce spun clienții. Partea mea se câștigă pe măsură ce lucrăm.' },
];
