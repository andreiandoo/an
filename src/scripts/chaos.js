const section = document.getElementById('haos');
if (section && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const NS = 'http://www.w3.org/2000/svg';
  const GATHER = [.04, .3], TRAVEL_START = .32, GROUP_STEP = .05, CARD_STEP = .012, TRAVEL_LEN = .26;
  const view = section.querySelector('.chaos-view');
  const svg = document.getElementById('chaos-lines');
  const proc = document.getElementById('chaos-proc');
  const tiles = [...section.querySelectorAll('.chaos-tile')];
  const copy = [...section.querySelectorAll('.chaos-copy p')];
  const cards = [...section.querySelectorAll('.chaos-cards li')];
  const clamp = n => Math.min(1, Math.max(0, n));
  const smooth = n => n * n * (3 - 2 * n);
  const seeded = i => { const x = Math.sin(i * 127.1 + 11.7) * 43758.5453; return x - Math.floor(x); };

  section.classList.add('is-live');
  let items = [], routes = [], lines = [], eased = 0, visible = false, stage = -1, procOn = false;

  const rel = el => {
    const r = el.getBoundingClientRect(), v = view.getBoundingClientRect();
    return { x: r.left - v.left, y: r.top - v.top, w: r.width, h: r.height };
  };

  function layout() {
    const w = view.clientWidth, h = view.clientHeight, wide = w >= 800;
    const p = rel(proc), app = rel(document.getElementById('chaos-app'));
    const pile = wide ? { x: w * .13, y: h * .58 } : { x: w * .5, y: h * .3 };
    const inPt = wide ? { x: p.x, y: p.y + p.h / 2 } : { x: p.x + p.w / 2, y: p.y };
    const outPt = wide ? { x: p.x + p.w, y: p.y + p.h / 2 } : { x: p.x + p.w / 2, y: p.y + p.h };
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.textContent = '';
    routes = [];
    lines = [];
    const curve = (a, b) => (wide
      ? `C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`
      : `C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}`);
    tiles.forEach((tile, g) => {
      const t = rel(tile);
      const end = wide ? { x: t.x, y: t.y + t.h / 2 } : { x: t.x + t.w / 2, y: t.y };
      [-7, 0, 7].forEach((off, k) => {
        const shift = pt => (wide ? { x: pt.x, y: pt.y + off * (g - 2.5) * .5 + off * .4 } : { x: pt.x + off * (g - 2.5) * .5 + off * .4, y: pt.y });
        const a = shift(pile), b = shift(inPt), c = shift(outPt);
        const d = `M${a.x},${a.y} ${curve(a, b)} L${c.x},${c.y} ${curve(c, wide ? { x: end.x, y: end.y + off } : { x: end.x + off, y: end.y })}`;
        const base = document.createElementNS(NS, 'path');
        base.setAttribute('d', d);
        base.setAttribute('class', 'line');
        const flow = document.createElementNS(NS, 'path');
        flow.setAttribute('d', d);
        flow.setAttribute('class', 'flow');
        flow.style.animationDelay = `${-(g * .5 + k * .3)}s`;
        svg.append(base, flow);
        lines.push({ base, flow, g });
        if (k === 1) routes[g] = { path: base, len: base.getTotalLength() };
      });
    });
    items = cards.map((el, i) => {
      const cw = el.offsetWidth, ch = el.offsetHeight;
      const g = +el.dataset.g;
      return {
        el, g, i, cw, ch, clean: false, gone: false,
        label: el.querySelector('span'), raw: el.querySelector('span').textContent, cleanText: el.dataset.clean,
        sx: seeded(i) * (w - cw * .7) + cw * .05,
        sy: seeded(i + 40) * (h * .68) + h * .22,
        sr: (seeded(i + 80) - .5) * 34,
        px: pile.x + (seeded(i + 120) - .5) * 26,
        py: pile.y + (seeded(i + 160) - .5) * 26,
        pr: (seeded(i + 200) - .5) * 10,
        start: TRAVEL_START + g * GROUP_STEP + (i % 3) * CARD_STEP,
      };
    });
  }

  function frame(now) {
    if (visible) {
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      eased += (p - eased) * .12;
      const gather = smooth(clamp((eased - GATHER[0]) / (GATHER[1] - GATHER[0])));
      const show = smooth(clamp((eased - .26) / .08));
      const counts = tiles.map(() => 0);
      let moving = false;

      items.forEach(it => {
        const u = clamp((eased - it.start) / TRAVEL_LEN);
        if (u <= 0) {
          const float = (1 - gather) * 7;
          const x = it.sx + (it.px - it.sx) * gather + Math.sin(now / 900 + it.i) * float;
          const y = it.sy + (it.py - it.sy) * gather + Math.cos(now / 1100 + it.i * 2) * float;
          const s = 1 - gather * .28;
          it.el.style.opacity = 1;
          it.el.style.transform = `translate3d(${(x - it.cw / 2).toFixed(1)}px,${(y - it.ch / 2).toFixed(1)}px,0) rotate(${(it.sr + (it.pr - it.sr) * gather).toFixed(2)}deg) scale(${s.toFixed(3)})`;
          if (it.clean) { it.clean = false; it.label.textContent = it.raw; it.el.classList.remove('is-clean'); }
          return;
        }
        moving ||= u < 1;
        const route = routes[it.g];
        const pt = route.path.getPointAtLength(smooth(u) * route.len);
        const clean = u > .46;
        if (clean !== it.clean) {
          it.clean = clean;
          it.label.textContent = clean ? it.cleanText : it.raw;
          it.el.classList.toggle('is-clean', clean);
        }
        const s = clean ? .5 : .72 - u * .4;
        it.el.style.opacity = clamp((1 - u) / .08).toFixed(3);
        it.el.style.transform = `translate3d(${(pt.x - it.cw / 2).toFixed(1)}px,${(pt.y - it.ch / 2).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
        if (u >= 1) counts[it.g]++;
      });

      tiles.forEach((t, g) => {
        t.style.setProperty('--fill', (counts[g] / 3).toFixed(2));
        t.classList.toggle('is-full', counts[g] === 3);
      });
      lines.forEach(l => {
        const on = eased > TRAVEL_START + l.g * GROUP_STEP - .02;
        l.base.style.opacity = show.toFixed(3);
        l.flow.style.opacity = on && eased < .94 ? 1 : 0;
      });
      if (moving !== procOn) { procOn = moving; proc.classList.toggle('is-on', moving); }
      section.style.setProperty('--show', show.toFixed(3));
      const next = eased < .3 ? 0 : eased < .72 ? 1 : 2;
      if (next !== stage) { stage = next; copy.forEach((c, i) => c.classList.toggle('is-on', i === next)); }
    }
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);
  addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  layout();
  requestAnimationFrame(frame);
}
