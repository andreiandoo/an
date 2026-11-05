import { pick, locale } from './lang.js';
const stage = document.getElementById('stage');
if (stage) {
  const COPIES = 2, DRIFT = 34, PAN_SPEED = 90, DRAG_THRESHOLD = 6;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const originals = [...stage.children];

  stage.classList.add('is-live');
  document.getElementById('ctrl').classList.add('is-on');
  for (let c = 1; c < COPIES; c++) originals.forEach(el => {
    const copy = el.cloneNode(true);
    copy.tabIndex = -1;
    copy.setAttribute('aria-hidden', 'true');
    stage.append(copy);
  });

  const items = [...stage.children].map((el, index) => {
    el.draggable = false;
    return { el, index, img: el.querySelector('img'), range: 0, pan: 0, dir: 1, hot: false, on: false };
  });

  let gap = 0, total = 0, radius = 0;
  function measure() {
    const frame = items[0].el.querySelector('.frame');
    gap = frame.offsetWidth + Math.max(16, frame.offsetWidth * .1);
    total = gap * items.length;
    radius = Math.max(1300, innerWidth * 2.3);
    items.forEach(it => { it.range = Math.max(0, it.img.offsetHeight - frame.offsetHeight); });
  }
  addEventListener('resize', measure);

  let t = 0, target = null, running = !reduced, visible = true, hover = false, last = 0;
  let dragging = false, moved = 0, startX = 0, startT = 0;
  const mod = (n, m) => ((n % m) + m) % m;

  function draw(dt) {
    items.forEach(it => {
      const x = mod(it.index * gap - t + total / 2, total) - total / 2;
      const a = x / radius;
      const px = radius * Math.sin(a), py = radius * (1 - Math.cos(a));
      it.el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${a.toFixed(4)}rad)`;
      const active = touch ? Math.abs(x) < gap / 2 : it.hot;
      if (active !== it.on) { it.on = active; it.el.classList.toggle('is-on', active); }
      if (reduced || !it.range) return;
      if (active) {
        it.pan += it.dir * PAN_SPEED * dt / 1000;
        if (it.pan >= it.range) { it.pan = it.range; it.dir = -1; }
        if (it.pan <= 0) { it.pan = 0; it.dir = 1; }
      } else if (it.pan > 0) {
        it.pan *= Math.max(0, 1 - dt / 160);
        it.dir = 1;
        if (it.pan < 1) it.pan = 0;
      } else return;
      it.img.style.transform = `translate3d(0,${(-it.pan).toFixed(1)}px,0)`;
    });
  }

  function tick(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    if (visible) {
      if (target !== null) {
        const d = target - t;
        t += d * Math.min(1, dt / 140);
        if (Math.abs(d) < .5) { t = target; target = null; }
      } else if (running && !hover && !dragging) t += DRIFT * dt / 1000;
      draw(dt);
    }
    requestAnimationFrame(tick);
  }

  const step = dir => { target = (Math.round((target ?? t) / gap) + dir) * gap; };
  document.getElementById('prev').onclick = () => step(-1);
  document.getElementById('next').onclick = () => step(1);

  const toggle = document.getElementById('toggle'), path = document.getElementById('toggle-path');
  function setRunning(v) {
    running = v;
    path.setAttribute('d', v ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5l11 7-11 7z');
    toggle.setAttribute('aria-label', v ? pick({ ro: 'Oprește mișcarea', en: 'Pause motion' }) : pick({ ro: 'Pornește mișcarea', en: 'Play motion' }));
    toggle.setAttribute('aria-pressed', String(!v));
  }
  toggle.onclick = () => setRunning(!running);
  setRunning(running);

  items.forEach(it => {
    it.el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') it.hot = hover = true; });
    it.el.addEventListener('pointerleave', () => { it.hot = hover = false; });
    it.el.addEventListener('focus', e => {
      if (e.target.matches(':focus-visible')) { target = it.index * gap; it.hot = true; }
    });
    it.el.addEventListener('blur', () => { it.hot = false; });
  });

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; startX = e.clientX; startT = t; target = null;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
    t = startT - (e.clientX - startX);
    if (moved > DRAG_THRESHOLD) stage.classList.add('is-drag');
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-drag');
    if (moved <= DRAG_THRESHOLD && e.type === 'pointerup') {
      const el = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.closest?.('.item'));
      if (el) window.open(el.closest('.item').href, '_blank', 'noopener');
    }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('dragstart', e => e.preventDefault());
  stage.addEventListener('click', e => { if (e.detail) e.preventDefault(); });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
  measure();
  requestAnimationFrame(n => { last = n; tick(n); });
}
