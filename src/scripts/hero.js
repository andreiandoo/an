const hero = document.querySelector('.home-hero');
if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const wide = matchMedia('(min-width: 901px)');
  const header = document.querySelector('.site-header');
  let queued = false;

  const update = () => {
    queued = false;
    const p = Math.min(1, Math.max(0, scrollY / innerHeight));
    hero.style.setProperty('--hp', p.toFixed(4));
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  const layout = () => {
    document.documentElement.style.setProperty('--hh', `${header.offsetHeight}px`);
    hero.classList.toggle('is-live', wide.matches);
    queue();
  };

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', layout);
  layout();
}
