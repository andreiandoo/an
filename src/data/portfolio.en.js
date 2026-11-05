// English twin of portfolio.js: same exports and shapes, text translated, numbers unchanged.
export { ai, socials } from './portfolio.js';

export const products = [
  { name: 'Tixello', file: 'tixello', tag: 'SaaS ticketing', url: 'https://tixello.com', cs: '/en/projects/tixello/', stat: '410,444 tickets' },
  { name: 'AmBilet', file: 'ambilet', tag: 'Tickets', url: 'https://ambilet.ro', cs: '/en/projects/ambilet/', stat: '+148% sales' },
  { name: 'bilete.online', file: 'bilete-online', tag: 'Attractions', url: 'https://bilete.online', cs: '/en/projects/bilete-online/', stat: '7,954 attractions' },
  { name: 'TICS Radar', file: 'tics', tag: 'Comparison site', url: 'https://tics.ro', cs: '/en/projects/tics/', stat: '20 platforms' },
  { name: 'Dreams Atlas', file: 'dreamsatlas', tag: 'AI', url: 'https://dreamsatlas.com', stat: '3.22M impressions' },
  { name: 'Viaqui', file: 'viaqui', tag: 'Travel', url: 'https://viaqui.com', cs: '/en/projects/viaqui/', stat: '113,093 attractions' },
  { name: 'e-test.ro', file: 'e-test', tag: 'Education', url: 'https://e-test.ro' },
  { name: 'dubidu', file: 'dubidu', tag: 'AI dubbing', url: 'https://dubidu.net', cs: '/en/projects/dubidu/', stat: 'Case study' },
  { name: 'eMUD', file: 'emud', tag: 'For sale', url: 'https://a-n.ro', cs: '/en/projects/emud/', stat: 'Case study' },
  { name: 'ePAS', file: 'epas', tag: 'Prototype', url: 'https://epas.ro' },
];

export const inWork = [
  { name: 'Story of WHO', file: 'storyofwho', url: 'https://storyofwho.com', status: 'In progress', text: 'Bedtime stories for children, personalized with AI.' },
  { name: 'Route-a-Roo', file: 'routearoo', status: 'In progress', text: 'Tour planning for artists: routes, venues, logistics.' },
  { name: 'Actoria', file: 'actoria', status: 'In progress', text: 'Connects actors with casting directors and production companies.' },
  { name: 'CineSunt', file: 'cinesunt', status: 'In progress', text: 'A self-discovery platform.' },
  { name: 'Bine.ro', file: 'bine', url: 'https://bine.ro', status: 'For sale', text: 'You shop online, and part of the money goes automatically to a cause.' },
];

export const roles = [
  { name: 'Narada', years: '2020–2022', role: 'CTO', text: 'Education NGO. Technical strategy, architecture and development teams, including Naradix LMS, with over 27,000 users, and HartaEdu.', url: 'https://narada.ro' },
  { name: 'LAROCK Festival', years: '2024–2025', role: 'Project Manager and festival director', editions: 'editions 2 and 3', text: 'Multi-day rock festival with Romanian and international artists.', url: 'https://larockfestival.ro' },
  { name: 'FREEFEST Festival', years: '2011–2013', role: 'Festival director', editions: 'editions 1, 2 and 3', text: 'Free-entry music festival. Three editions in a row: operations, artists, logistics.' },
];

// Same slug as portfolio.js, so the screenshot files match.
const slug = name => name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const c = (name, url, cat, work) => ({ name, url, cat, work, file: slug(name) });

export const clients = [
  c('Fiskl', 'https://fiskl.com', 'Fintech', 'Company website'),
  c('DMonitor.tech', 'https://dmonitor.tech', 'Fintech', 'Web platform with 12 API integrations'),
  { ...c('Libazon', '', 'E-commerce', 'Full marketplace'), offline: true },
  { ...c('SAGA Festival', '', 'Events', 'Website and ticketing integration'), offline: true },
  c('Naradix', 'https://naradix.ro', 'Education', 'LMS development and optimization'),
  c('Sipex Online', 'https://sipex-online.ro', 'E-commerce', 'PrestaShop store'),
  c('Clinica Dr. Melnic', 'https://clinicadrmelnic.ro', 'Health', 'Website design and development'),
  c('HelloFins', 'https://hellofins.com', 'Fintech', 'WordPress and WooCommerce development'),
  c('Arhiserv', 'https://arhiserv.ro', 'Corporate', 'Company website'),
  { ...c('Wooba', '', 'E-commerce', 'Online store'), offline: true },
  c('Educativa', 'https://educativa.ro', 'Education', 'Website'),
  c('Optiuni.ro', 'https://optiuni.ro/cautare/', 'Education', 'Full-stack development'),
  c('Edmundo', 'https://edmun.do', 'Education', 'Multilingual WordPress development'),
  { ...c('Glora.us', '', 'E-commerce', 'Online store'), offline: true },
  c('PerformanceHR', 'https://performancehr.com.au', 'Corporate', 'Company website'),
  c('Ploiești 2024', 'https://ploiesti2024.eurospirit.ro/', 'Corporate', 'Youth Capital platform'),
  c('HartaEdu', 'https://hartaedu.ro', 'Education', 'Idea, MVP and development'),
  { ...c('LT Wealth', '', 'Fintech', 'Website'), offline: true },
  c('Talent Financiar', 'https://talentfinanciar.ro', 'Education', 'Website'),
  c('Teamology Institute', 'https://teamology.ro', 'Education', 'Website'),
  c('Daisy Tech', 'https://daisy-tech.ro', 'E-commerce', 'Website'),
  c('Din Cămară', 'https://din-camara.ro', 'E-commerce', 'Online store'),
  c('eHealth Romania', 'https://ehealthromania.com', 'Health', 'Medical news portal'),
  c('Genuin Shop', 'https://genuin.shop', 'E-commerce', 'Online store'),
  c('Virtual360', 'https://virtual360.ro', 'Corporate', 'Website'),
  c('BeeWell', 'https://beewell.ro', 'E-commerce', 'Online store'),
  c('D10E', 'https://d10e.biz', 'Corporate', 'Website'),
  c('The Entrepreneurship Academy', 'https://entrepreneurship-academy.ro', 'Education', 'Website'),
  c('IUF World', 'https://iuf.world', 'Events', 'Website'),
  { ...c('Edu-Start', 'https://dev.edu-start.ro', 'Education', 'Platform and website'), cs: '/en/projects/edustart/' },
  c('Reveal', 'https://reveal.ro', 'Corporate', 'Website'),
  c('SICAR Museum', 'https://sicarmuseum.ro', 'Culture', 'Museum website'),
  c('EuroSpirit', 'https://eurospirit.ro', 'Education', 'Organization website'),
  c('ACS Arhivarul', 'https://acsarhivarul.ro', 'Sport', 'Sports club website'),
  c('Spot Admissions', 'https://spotadmissions.ro', 'Education', 'Admissions website'),
  c('AVE România', 'https://ave-romania.ro', 'Education', 'Organization website'),
  c('BISM', 'https://bism.ro', 'Education', 'Business school website'),
  { ...c('Sportiv Educat', 'https://sportiveducat.ro', 'Sport', 'Platform for sports clubs'), cs: '/en/projects/sportiv-educat/' },
];

export const numbers = [
  {
    name: 'Tixello', url: 'https://tixello.com', note: 'Processed through the platform, cumulative, as of 5 November 2026.',
    metrics: [
      { value: 5016, label: 'events' },
      { value: 107255, label: 'customers' },
      { value: 410444, label: 'tickets sold' },
      { value: 5208961, prefix: '€', label: 'processed' },
    ],
  },
  {
    name: 'AmBilet', url: 'https://ambilet.ro', note: 'Growth in sales and revenue.',
    metrics: [
      { value: 148, prefix: '+', suffix: '%', label: '5-month average' },
      { value: 300, prefix: 'over ', suffix: '%', label: 'in a single month' },
    ],
  },
  {
    name: 'Dreams Atlas', url: 'https://dreamsatlas.com',
    metrics: [
      { value: 3.22, dec: 2, suffix: 'M', label: 'organic impressions' },
      { value: 332, label: 'customers' },
    ],
  },
  {
    name: 'bilete.online', url: 'https://bilete.online', note: 'Tickets to attractions, museums and parks.',
    metrics: [
      { value: 7954, label: 'attractions in Romania' },
    ],
  },
  {
    name: 'Viaqui', url: 'https://viaqui.com', note: 'Tickets to attractions worldwide.',
    metrics: [
      { value: 113093, label: 'attractions' },
      { value: 51, label: 'countries' },
    ],
  },
  {
    name: 'TICS Radar', url: 'https://tics.ro', note: 'Tracked live.',
    metrics: [
      { value: 4632, key: 'liveEvents', label: 'events' },
      { value: 580857, label: 'seats monitored' },
      { value: 20, key: 'platforms', label: 'platforms' },
      { value: 498, key: 'cities', label: 'cities' },
    ],
  },
];

// What I build, for the moving band on the home page. The technologies are listed once, under "What I know".
export const skills = ['Web apps', 'iOS and Android apps', 'SaaS platforms', 'Marketplaces', 'Admin panels', 'Payments and invoicing', 'AI integrations', 'Chrome extensions', 'Client portals', 'Reports and data', 'MVPs', 'Company websites'];

export const stack = [
  ['Backend', 'PHP, Laravel, Filament, Livewire, CodeIgniter, Python'],
  ['Frontend', 'JavaScript, Vue.js, CSS, Tailwind, Bootstrap'],
  ['Data', 'SQL, MySQL, PostgreSQL, Supabase'],
  ['CMS and stores', 'WordPress, Magento'],
  ['Hosting', 'AWS, Cloudflare, Vercel, Railway'],
  ['Product', 'Stripe payments, iOS and Android apps, Chrome extensions'],
];

export const aiUses = ['API integrations', 'MCP servers', 'Coding agents', 'Automations', 'Voice: transcription, translation, synthesis'];


export const steps = [
  { title: 'Free call', list: ['You do not need to prepare anything or know technical terms.', 'You tell me how you work today and what gets in your way.', 'If it is not worth building, I tell you directly and we stop there.', 'You pick the time in the calendar yourself.'], head: ['An honest answer:', 'worth building or not.'], time: '30 minutes', you: '30 minutes', text: 'You tell me what you want to solve. I tell you whether I can help and how.', get: 'An honest answer: worth building or not.' },
  { title: 'Analysis', list: ['We talk for an hour, then I send you a few questions.', 'We decide what goes into the first version and what waits for later.', 'The first step is the analysis: if you do not like what I propose, you stop there.'], head: ['A fixed price,', 'before any line of code.'], time: '2–5 days', you: 'an hour of discussion and a few answers', text: 'I look at how you work today and we decide what is worth doing.', get: 'A fixed price, before any line of code.' },
  { title: 'We build', list: ['You pay in stages.', 'The code, data and accounts are in your company’s name.', 'The app runs on your accounts, usually for €40 a month, paid directly to the providers.', 'No commission per booking or per user.'], head: ['The app, the code,', 'the accounts and the instructions.'], time: '3–8 weeks', you: 'a look at each stage', text: 'I deliver in stages and you see every step.', get: 'The app, the code, the accounts and the instructions.' },
  { title: 'After launch', list: ['You write to me only when you want something new.', 'If I am no longer available, you have everything another developer needs to continue.'], head: ['An app that stays', 'yours.'], time: 'as long as you need', you: 'only when you want something new', text: 'Changes cost from €150 or go into a monthly subscription you can stop at any time.', get: 'An app that stays yours.' },
];

export const founderSteps = [
  { title: 'You tell me the idea', list: ['Tell me what problem you have seen and who has it.', 'If you want, I sign a non-disclosure agreement before the first call.', 'The idea belongs to the company. What you write to me stays between us.'], head: ['On a call', 'or in writing.'], time: '30 minutes', text: 'On a call or in writing. If you write to me, I reply within one business day with what I think and what questions I have.' },
  { title: 'We explore the problem', list: ['This stage is free.', 'We talk to the people who have the problem, not only to each other.'], head: ['We choose what goes', 'into the first version.'], time: '1–2 weeks, free', text: 'You give me context and put me in touch with at least one person, besides you, who has the problem. At the end we choose what goes into the first version and write down the terms. Until we sign, you pay nothing and give up no part of the company.' },
  { title: 'We build the first version', list: ['I am responsible for the product, you for customers and sales.', 'The code, accounts and data are in the company’s name from the first line.'], head: ['The first customers use it', 'quickly.'], time: '3–6 weeks', text: 'In stages, so the first customers can use it quickly. You bring the customers and what they say, I bring the product.' },
  { title: 'We keep going', list: ['Each of us earns their share gradually, over a few years.', 'If we part ways, I keep only the share earned until then, and the company keeps all the code.'], head: ['We grow the product', 'based on what customers say.'], time: 'after launch', text: 'I stay in the product and we grow it based on what customers say. My share is earned as we work.' },
];
