document.querySelectorAll('.process').forEach(section => {
  const steps = [...section.querySelectorAll('.process-steps > li')];
  const nav = [...section.querySelectorAll('.process-nav li')];
  const line = section.querySelector('.process-nav');
  if (!steps.length) return;

  let current = -1;
  function update() {
    const r = section.querySelector('.process-steps').getBoundingClientRect();
    const mid = innerHeight * .5;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    line.style.setProperty('--p', p.toFixed(3));
    let index = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) index = i; });
    if (index === current) return;
    current = index;
    steps.forEach((s, i) => s.classList.toggle('is-on', i === index));
    nav.forEach((n, i) => { n.classList.toggle('is-on', i === index); n.classList.toggle('is-past', i < index); });
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
});
