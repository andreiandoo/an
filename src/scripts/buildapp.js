import { pick, locale } from './lang.js';
const section = document.getElementById('construim');
if (section) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const app = document.getElementById('ba-app');
  const typed = document.getElementById('ba-typed');
  const idea = section.querySelector('.ba-idea');
  const stages = [...section.querySelectorAll('#ba-stages li')];
  const stageBox = section.querySelector('.ba-stage');
  const codeBox = document.getElementById('ba-code');
  const termBox = document.getElementById('ba-term');
  const progress = document.getElementById('ba-progress');
  const CODE = [
    ['k', 'public function store'], ['t', '(Request $r)'], ['n', ''], ['p', '{'], ['n', ''],
    ['s', '  $slot = Slot::free('], ['t', '$r->time'], ['s', ');'], ['n', ''],
    ['t', '  $visit = '], ['k', 'Visit::create'], ['t', '(['], ['n', ''],
    ['s', "    'pet' => "], ['t', '$r->pet,'], ['n', ''],
    ['s', "    'slot' => "], ['t', '$slot,'], ['n', ''],
    ['t', '  ]);'], ['n', ''],
    ['k', '  Reminder::whatsapp'], ['t', '($visit);'], ['n', ''],
    ['k', '  return '], ['t', '$visit;'], ['n', ''], ['p', '}'],
  ];
  const TERM = pick({ ro: ['Baza de date migrată', 'Conturi și roluri', 'Plăți conectate', 'Reminder pe WhatsApp', '142 de teste trecute', 'Publicat pe vetloc.ro'], en: ['Database migrated', 'Accounts and roles', 'Payments connected', 'WhatsApp reminders', '142 tests passed', 'Published on vetloc.ro'] });
  const spans = CODE.map(([kind, value]) => {
    if (kind === 'n') { const br = document.createElement('br'); codeBox.append(br); return br; }
    const s = document.createElement('span');
    s.className = kind;
    s.textContent = value;
    codeBox.append(s);
    return s;
  });
  const rows = TERM.map(line => {
    const li = document.createElement('li');
    li.textContent = line;
    termBox.append(li);
    return li;
  });
  const numbers = [...section.querySelectorAll('[data-n]')].map(el => ({ el: el.querySelector('u'), n: +el.dataset.n, s: el.dataset.s }));
  const text = typed.dataset.text;
  const clamp = n => Math.min(1, Math.max(0, n));
  const fmt = n => Math.round(n).toLocaleString(locale);
  let current = -1, visible = false, eased = 0, count = 0;

  const setStage = s => {
    current = s;
    app.dataset.s = s;
    stageBox.dataset.s = s;
    idea.classList.toggle('is-done', s > 0);
    stages.forEach((li, i) => { li.classList.toggle('is-on', i === s); li.classList.toggle('is-past', i < s); });
  };

  if (reduced) {
    typed.textContent = text;
    spans.forEach(s => s.classList.add('is-on'));
    rows.forEach(r => r.classList.add('is-on'));
    progress.style.transform = 'none';
    setStage(4);
    numbers.forEach(c => { c.el.textContent = `${fmt(c.n)}${c.s}`; });
  } else {
    section.classList.add('is-live');
    const frame = () => {
      if (visible) {
        const r = section.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - innerHeight));
        eased += (p - eased) * .12;
        const s = Math.min(stages.length - 1, Math.floor(eased * stages.length * 1.02));
        if (s !== current) setStage(s);
        typed.textContent = text.slice(0, Math.round(clamp(eased / .17) * text.length));
        const coded = clamp((eased - .56) / .2);
        spans.forEach((sp, i) => sp.classList.toggle('is-on', i / spans.length < coded));
        const built = clamp((eased - .6) / .22);
        rows.forEach((row, i) => row.classList.toggle('is-on', (i + 1) / rows.length <= built + .01));
        progress.style.transform = `scaleX(${built.toFixed(3)})`;
        const target = s >= 3 ? clamp((eased - .6) / .14) : 0;
        count += (target - count) * .12;
        numbers.forEach(c => { c.el.textContent = `${fmt(c.n * count)}${c.s}`; });
      }
      requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);
    setStage(0);
    requestAnimationFrame(frame);
  }
}
