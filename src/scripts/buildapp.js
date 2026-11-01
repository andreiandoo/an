const section = document.getElementById('construim');
if (section) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const app = document.getElementById('ba-app');
  const typed = document.getElementById('ba-typed');
  const idea = section.querySelector('.ba-idea');
  const stages = [...section.querySelectorAll('#ba-stages li')];
  const numbers = [...section.querySelectorAll('[data-n]')].map(el => ({ el: el.querySelector('u'), n: +el.dataset.n, s: el.dataset.s }));
  const text = typed.dataset.text;
  const clamp = n => Math.min(1, Math.max(0, n));
  const fmt = n => Math.round(n).toLocaleString('ro-RO');
  let current = -1, visible = false, eased = 0, count = 0;

  const setStage = s => {
    current = s;
    app.dataset.s = s;
    idea.classList.toggle('is-done', s > 0);
    stages.forEach((li, i) => { li.classList.toggle('is-on', i === s); li.classList.toggle('is-past', i < s); });
  };

  if (reduced) {
    typed.textContent = text;
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
