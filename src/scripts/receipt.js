const panel = document.getElementById('tally');
const ledger = document.getElementById('ledger');
if (panel && ledger) {
  const KEY = 'tally-hidden';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = panel.querySelector('ol');
  const head = panel.querySelector('.tally-head');
  const rows = [...ledger.querySelectorAll('li[data-at]')];
  const added = new Set();
  const away = new Set();
  let hidden = false;
  try { hidden = sessionStorage.getItem(KEY) === '1'; } catch {}

  // Live figures come from the same cell the numbers section updates.
  const refresh = row => {
    const stat = row.dataset.live;
    const cell = stat && document.querySelector(`[data-stat="${stat}"]`);
    if (cell) row.querySelector('b').textContent = (+cell.dataset.count).toLocaleString('ro-RO');
  };
  const place = () => {
    panel.hidden = hidden || added.size === 0;
    panel.classList.toggle('is-away', away.size > 0);
  };
  const add = i => {
    if (added.has(i)) return;
    added.add(i);
    refresh(rows[i]);
    const li = rows[i].cloneNode(true);
    li.className = '';
    li.dataset.i = i;
    const next = [...list.children].find(el => +el.dataset.i > i);
    list.insertBefore(li, next ?? null);
    place();
    if (!reduced) li.classList.add('is-new');
  };

  const seen = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    seen.unobserve(e.target);
    add(+e.target.dataset.tally);
  }), { rootMargin: '0px 0px -35% 0px' });
  rows.forEach((row, i) => {
    const el = document.querySelector(row.dataset.at);
    if (!el) return;
    el.dataset.tally = i;
    seen.observe(el);
  });

  // The panel steps aside for the tunnel and lands in the contact section.
  const aside = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? away.add(e.target) : away.delete(e.target)));
    rows.forEach(refresh);
    place();
  }, { threshold: .02 });
  ['.t-view', '#contact'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) aside.observe(el);
  });

  head.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    head.setAttribute('aria-expanded', open);
  });
  panel.querySelector('.tally-x').addEventListener('click', () => {
    hidden = true;
    try { sessionStorage.setItem(KEY, '1'); } catch {}
    place();
  });
}
