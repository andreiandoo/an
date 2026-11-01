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

const TAGLINES = ['Construiesc aplicații', 'Caut cofondatori', 'Fondator Tixello', '17 ani de software'];
const name = document.querySelector('.brand-name');
const tagline = document.getElementById('tagline');
if (name) {
  const text = name.textContent;
  name.textContent = '';
  [...text].forEach((ch, i) => {
    const l = document.createElement('span');
    l.className = 'l';
    l.style.setProperty('--i', i);
    l.textContent = ch === ' ' ? '\u00a0' : ch;
    l.setAttribute('aria-hidden', 'true');
    name.append(l);
  });
  name.parentElement.classList.add('is-ready');
}
if (tagline) {
  let n = 0;
  const swap = () => {
    tagline.classList.remove('is-in');
    setTimeout(() => {
      tagline.textContent = TAGLINES[n++ % TAGLINES.length];
      tagline.classList.add('is-in');
    }, reduced ? 0 : 320);
  };
  swap();
  if (!reduced) setInterval(swap, 3200);
}

const navBox = document.querySelector('.site-header .nav');
if (navBox && matchMedia('(hover: hover)').matches) {
  const pill = document.createElement('span');
  pill.className = 'nav-pill';
  navBox.prepend(pill);
  navBox.querySelectorAll('a:not(.cta)').forEach(a => {
    a.addEventListener('pointerenter', () => {
      pill.style.width = `${a.offsetWidth + 24}px`;
      pill.style.transform = `translateX(${a.offsetLeft - 12}px)`;
      pill.classList.add('is-on');
      navBox.querySelectorAll('a').forEach(x => x.classList.toggle('is-lit', x === a));
    });
  });
  navBox.addEventListener('pointerleave', () => {
    pill.classList.remove('is-on');
    navBox.querySelectorAll('a').forEach(x => x.classList.remove('is-lit'));
  });
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
