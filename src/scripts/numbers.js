import { pick, locale } from './lang.js';
const STATS_URL = 'https://tics.ro/api/public-stats';
const DURATION = 1400;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cells = [...document.querySelectorAll('[data-count]')];

const show = (el, value) => {
  const dec = +el.dataset.dec;
  const text = value.toLocaleString(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  el.textContent = `${el.dataset.prefix}${text}${el.dataset.suffix}`;
};

function run(el) {
  const end = +el.dataset.count;
  const start = performance.now();
  const frame = now => {
    const p = Math.min(1, (now - start) / DURATION);
    show(el, end * (1 - (1 - p) ** 4));
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
  }), { threshold: .6 });
  cells.forEach(el => { show(el, 0); io.observe(el); });
}

fetch(STATS_URL).then(r => (r.ok ? r.json() : null)).then(stats => {
  if (!stats) return;
  cells.forEach(el => {
    const value = stats[el.dataset.stat];
    if (Number.isFinite(value)) { el.dataset.count = value; if (reduced) show(el, value); }
  });
}).catch(() => {});
