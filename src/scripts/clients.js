const section = document.getElementById('clienti');
const list = document.getElementById('tunnel');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// A new random order on every visit, so no client is always first.
if (list) {
  const items = [...list.children];
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  list.append(...items);
}

if (section && list && !reduced) {
  const SPACING = 560, FAR = 5 * SPACING, FADE_FAR = 1.4 * SPACING, NEAR = -420, SCROLL_VH = 30, EASE = .1;
  const touch = matchMedia('(hover: none)').matches;
  const all = [...list.children].map(el => ({ el, cat: el.dataset.cat, shown: false, name: el.dataset.name, work: el.dataset.work }));
  const title = section.querySelector('.t-intro');
  const now = section.querySelector('.t-now');
  const nowName = now.querySelector('b'), nowWork = now.querySelector('span'), nowCount = now.querySelector('i');
  const filters = document.getElementById('filters');
  let items = all, target = 0, cam = 0, current = -1, visible = false;

  section.classList.add('is-live');

  function layout() {
    const rx = Math.min(innerWidth * .27, 460), ry = innerHeight * (innerWidth < 700 ? .17 : .2);
    items.forEach((it, i) => {
      const a = i * 2.399963;
      it.x = Math.cos(a) * rx;
      it.y = Math.sin(a) * ry;
      it.z = (i + 1) * SPACING;
    });
    section.style.height = `${(items.length + 1) * SCROLL_VH + 100}vh`;
  }

  function read() {
    const r = section.getBoundingClientRect();
    const range = r.height - innerHeight;
    target = Math.min(1, Math.max(0, -r.top / range)) * items.length * SPACING;
  }

  function draw() {
    items.forEach(it => {
      const d = it.z - cam;
      const show = d < FAR && d > NEAR;
      if (show !== it.shown) { it.shown = show; it.el.style.visibility = show ? 'visible' : 'hidden'; }
      if (!show) return;
      const fadeFar = Math.min(1, (FAR - d) / FADE_FAR);
      const fadeNear = d < 0 ? Math.max(0, 1 - d / NEAR) : 1;
      it.el.style.opacity = (fadeFar * fadeNear * Math.min(1, cam / SPACING)).toFixed(3);
      it.el.style.pointerEvents = d < 0 ? 'none' : 'auto';
      it.el.style.transform = `translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,${(-d).toFixed(1)}px) rotateY(${(it.x * -.012).toFixed(2)}deg) rotateX(${(it.y * .012).toFixed(2)}deg)`;
    });
    now.style.opacity = Math.min(1, cam / SPACING).toFixed(3);
    title.style.opacity = Math.max(0, 1 - cam / (SPACING * .5)).toFixed(3);
    const index = Math.max(0, Math.min(items.length - 1, Math.round(cam / SPACING) - 1));
    if (index !== current) {
      if (touch) { items[current]?.el.classList.remove('is-on'); items[index]?.el.classList.add('is-on'); }
      current = index;
      const it = items[index];
      nowName.textContent = it.name;
      nowWork.textContent = it.work;
      nowCount.textContent = `${String(index + 1).padStart(2, '0')} / ${items.length}`;
    }
  }

  function tick() {
    if (visible) {
      read();
      cam += (target - cam) * EASE;
      if (Math.abs(target - cam) < .3) cam = target;
      draw();
    }
    requestAnimationFrame(tick);
  }

  function apply(cat) {
    items = cat ? all.filter(it => it.cat === cat) : all;
    all.forEach(it => {
      const on = items.includes(it);
      it.el.hidden = !on;
      it.shown = false;
      it.el.style.visibility = 'hidden';
    });
    all.forEach(it => it.el.classList.remove('is-on'));
    current = -1;
    cam = target = 0;
    layout();
    scrollTo({ top: section.offsetTop, behavior: 'instant' });
    draw();
  }

  filters.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    apply(btn.dataset.cat);
  });

  all.forEach(it => it.el.addEventListener('focusin', () => {
    const i = items.indexOf(it);
    const range = section.offsetHeight - innerHeight;
    if (i >= 0) scrollTo({ top: section.offsetTop + range * (i + 1) / items.length, behavior: 'instant' });
  }));

  addEventListener('resize', layout);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section, {});
  layout();
  all.forEach(it => { it.el.style.visibility = 'hidden'; });
  draw();
  requestAnimationFrame(tick);
}
