const section = document.getElementById('haos');
if (section && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const view = section.querySelector('.chaos-view');
  const panel = section.querySelector('.chaos-panel');
  const before = section.querySelector('.chaos-before');
  const after = section.querySelector('.chaos-after');
  const all = [...section.querySelectorAll('.chaos-cards li')];
  let cards = all;
  const clamp = n => Math.min(1, Math.max(0, n));
  const smooth = n => n * n * (3 - 2 * n);
  const seeded = i => { const x = Math.sin(i * 127.1 + 11.7) * 43758.5453; return x - Math.floor(x); };

  section.classList.add('is-live');
  let items = [], eased = 0, visible = false;

  function layout() {
    const w = view.clientWidth, h = view.clientHeight;
    cards = all.filter(c => c.offsetParent);
    const cols = w < 700 ? 2 : 3;
    const rows = Math.ceil(cards.length / cols);
    const cardW = cards[0].offsetWidth, cardH = cards[0].offsetHeight, gap = 8;
    const pw = cols * cardW + (cols - 1) * gap + 32;
    const ph = rows * cardH + (rows - 1) * gap + 72;
    panel.style.width = `${pw}px`;
    panel.style.height = `${ph}px`;
    const shift = h * (w < 700 ? .12 : .08);
    panel.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
    items = cards.map((el, i) => ({
      el,
      sx: (seeded(i) - .5) * (w - cardW * .6),
      sy: (seeded(i + 40) - .5) * (h - cardH * 3) + shift * .6,
      sr: (seeded(i + 80) - .5) * 34,
      tx: (i % cols - (cols - 1) / 2) * (cardW + gap),
      ty: (Math.floor(i / cols) - (rows - 1) / 2) * (cardH + gap) + 20 + shift,
      set: false,
    }));
  }

  function frame(now) {
    if (visible) {
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      eased += (p - eased) * .12;
      items.forEach((it, i) => {
        const t = smooth(clamp((eased - .12 - i * .012) / .5));
        const float = (1 - t) * 7;
        const x = it.sx + (it.tx - it.sx) * t + Math.sin(now / 900 + i) * float;
        const y = it.sy + (it.ty - it.sy) * t + Math.cos(now / 1100 + i * 2) * float;
        it.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(it.sr * (1 - t)).toFixed(2)}deg)`;
        const set = t > .98;
        if (set !== it.set) { it.set = set; it.el.classList.toggle('is-set', set); }
      });
      const done = smooth(clamp((eased - .35) / .3));
      panel.style.opacity = done.toFixed(3);
      after.style.opacity = done.toFixed(3);
      before.style.opacity = (1 - done).toFixed(3);
    }
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);
  addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  layout();
  requestAnimationFrame(frame);
}
