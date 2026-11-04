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

export const skills = ['Laravel', 'PHP', 'Vue.js', 'Product design', 'Python', 'MVP-uri', 'Filament', 'Livewire', 'Animație', 'PostgreSQL', 'MySQL', 'Supabase', 'Strategie de marketing', 'Tailwind', 'Bootstrap', 'CSS', 'WordPress', 'Magento', 'CodeIgniter', 'Stripe', 'Aplicații mobile', 'AWS', 'Cloudflare', 'Vercel', 'Railway', 'Integrări AI', 'Claude', 'ChatGPT', 'Gemini', 'Grok', 'Extensii Chrome', 'Conducere de echipe'];

// Monochrome marks from @lobehub/icons-static-svg 1.102.0, 24×24 viewBox.
export const ai = [
  { name: 'Claude', d: 'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z' },
  { name: 'ChatGPT', d: 'M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z' },
  { name: 'Gemini', d: 'M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z' },
  { name: 'Grok', d: 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815' },
];

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
