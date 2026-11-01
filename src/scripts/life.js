const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const bar = document.createElement('div');
bar.className = 'progress';
document.body.append(bar);

// Heading words rise into place; every heading ends on an orange mark.
document.querySelectorAll('main h1, main h2').forEach(h => {
  if (h.closest('.t-intro')) return;
  const text = h.textContent.trim();
  const end = /[.?!]$/.test(text) ? text.slice(-1) : '.';
  const body = /[.?!]$/.test(text) ? text.slice(0, -1) : text;
  const words = body.split(/\s+/);
  h.setAttribute('aria-label', text);
  h.textContent = '';
  words.forEach((word, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.transitionDelay = `${Math.min(i, 14) * 28}ms`;
    if (i === words.length - 1) {
      const mark = document.createElement('i');
      mark.className = 'mark';
      mark.textContent = end;
      inner.append(mark);
    }
    w.append(inner);
    h.append(w, ' ');
  });
  h.classList.add('split');
});

document.querySelectorAll('.price, .steps li, .service, .why li, .check li, .proof li, .built li, details, .shop-top li, .shop-group li, .domains li, .cof-main, .terms li').forEach((el, i, all) => {
  if (!el.classList.contains('reveal')) el.classList.add('reveal');
});

const watch = document.querySelectorAll('.split, .reveal');
if (reduced || !('IntersectionObserver' in window)) {
  watch.forEach(el => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  watch.forEach(el => io.observe(el));
}

const band = document.getElementById('band');
const portrait = document.querySelector('.portrait img');
const tunnel = document.getElementById('clienti');
let lastY = scrollY, offset = 0, speed = 0, direction = -1, unit = 0, then = 0;

function frame(now) {
  const dt = Math.min(now - then, 50);
  then = now;
  const y = scrollY;
  const delta = y - lastY;
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  if (header) {
    const r = tunnel?.getBoundingClientRect();
    const inTunnel = r && r.top < 80 && r.bottom > 0;
    if (delta > 2 && y > 160) header.classList.add('is-up');
    else if (delta < -2) header.classList.remove('is-up');
    if (inTunnel) header.classList.add('is-up');
    header.classList.toggle('is-stuck', y > 40);
  }
  if (band && !reduced) {
    if (delta) direction = delta > 0 ? -1 : 1;
    speed += (Math.min(40, Math.abs(delta)) * 40 - speed) * .08;
    unit ||= band.firstElementChild.offsetWidth;
    offset += direction * (30 + speed) * dt / 1000;
    if (unit) offset = ((offset % unit) + unit) % unit - unit;
    band.style.transform = `translate3d(${offset.toFixed(1)}px,0,0)`;
  }
  if (portrait && !reduced) {
    const r = portrait.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      portrait.style.transform = `scale(1.08) translate3d(0,${(p * -24).toFixed(1)}px,0)`;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(n => { then = n; frame(n); });
addEventListener('resize', () => { unit = 0; });
