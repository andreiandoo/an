export const products = [
  { name: 'Tixello', file: 'tixello', tag: 'SaaS ticketing', url: 'https://tixello.com' },
  { name: 'AmBilet', file: 'ambilet', tag: 'Bilete', url: 'https://ambilet.ro' },
  { name: 'bilete.online', file: 'bilete-online', tag: 'Atracții', url: 'https://bilete.online' },
  { name: 'Viaqui', file: 'viaqui', tag: 'Turism', url: 'https://viaqui.com' },
  { name: 'TICS Radar', file: 'tics', tag: 'Comparator', url: 'https://tics.ro' },
  { name: 'e-test.ro', file: 'e-test', tag: 'Educație', url: 'https://e-test.ro' },
  { name: 'Dreams Atlas', file: 'dreamsatlas', tag: 'AI', url: 'https://dreamsatlas.com' },
  { name: 'dubidu', file: 'dubidu', tag: 'Lansare 1 dec.', url: 'https://dubidu.net' },
  { name: 'eMUD', file: 'emud', tag: 'De vânzare', url: 'https://a-n.ro' },
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
  c('Libazon', 'https://libazon.com', 'E-commerce', 'Marketplace complet'),
  c('SAGA Festival', 'https://sagafestival.com', 'Evenimente', 'Site și integrare de ticketing'),
  c('Naradix', 'https://naradix.ro', 'Educație', 'Dezvoltare și optimizare LMS'),
  c('Sipex Online', 'https://sipex-online.ro', 'E-commerce', 'Magazin PrestaShop'),
  c('Clinica Dr. Melnic', 'https://clinicadrmelnic.ro', 'Sănătate', 'Design și dezvoltare site'),
  c('HelloFins', 'https://hellofins.com', 'Fintech', 'Dezvoltare WordPress și WooCommerce'),
  c('Arhiserv', 'https://arhiserv.ro', 'Corporate', 'Site de companie'),
  c('Wooba', 'https://wooba.ro', 'E-commerce', 'Magazin online'),
  c('Educativa', 'https://educativa.ro', 'Educație', 'Site'),
  c('Optiuni.ro', 'https://optiuni.ro', 'Fintech', 'Dezvoltare full-stack'),
  c('Edmundo', 'https://edmun.do', 'Educație', 'Dezvoltare WordPress multilingv'),
  c('Glora.us', 'https://glora.us', 'E-commerce', 'Magazin online'),
  c('PerformanceHR', 'https://performancehr.com.au', 'Corporate', 'Site de companie'),
  c('Ploiești 2024', 'https://ploiesti2024.eurospirit.ro/', 'Corporate', 'Platforma Capitalei Tineretului'),
  c('HartaEdu', 'https://hartaedu.ro', 'Educație', 'Idee, MVP și dezvoltare'),
  c('LT Wealth', 'https://ltwealth.ro', 'Fintech', 'Site'),
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
];
