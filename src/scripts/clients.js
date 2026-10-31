const filters = document.getElementById('filters');
const rows = document.getElementById('rows');
const peek = document.getElementById('peek');

if (filters && rows) {
  filters.hidden = false;
  filters.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    rows.querySelectorAll('li').forEach(li => { li.hidden = !!btn.dataset.cat && li.dataset.cat !== btn.dataset.cat; });
  });
}

if (peek && rows && matchMedia('(hover: hover) and (min-width: 900px)').matches) {
  const img = peek.querySelector('img');
  const W = 340, H = 212, OFFSET = 24;
  rows.addEventListener('pointermove', e => {
    const a = e.target.closest('a[data-peek]');
    if (!a) { peek.classList.remove('is-on'); return; }
    if (img.getAttribute('src') !== a.dataset.peek) img.src = a.dataset.peek;
    const x = Math.min(e.clientX + OFFSET, innerWidth - W - 12);
    const y = Math.min(e.clientY + OFFSET, innerHeight - H - 12);
    peek.style.transform = `translate3d(${x}px,${y}px,0)`;
    peek.classList.add('is-on');
  });
  rows.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
}
