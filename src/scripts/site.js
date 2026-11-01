const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-header .nav');
if (toggle && nav) {
  const set = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Închide' : 'Meniu';
  };
  toggle.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
}

const calc = document.querySelector('[data-calc]');
if (calc) {
  const MAX_SLABS = 34, LEI_PER_SLAB = 6000, WEEKS = 48, HOURS_PER_DAY = 8;
  const q = s => calc.querySelector(s);
  const hours = q('[name="ore"]'), rate = q('[name="tarif"]'), out = q('[data-out]'), stack = q('[data-stack]');
  const fmt = n => Math.round(n).toLocaleString('ro-RO');
  const slabs = Array.from({ length: MAX_SLABS }, (_, i) => {
    const s = document.createElement('i');
    s.style.setProperty('--n', i);
    stack.append(s);
    return s;
  });
  let shown = 0, target = 0, raf = 0;
  const tick = () => {
    shown += (target - shown) * .16;
    if (Math.abs(target - shown) < 1) shown = target;
    out.textContent = `${fmt(shown)} lei`;
    raf = shown === target ? 0 : requestAnimationFrame(tick);
  };
  const update = () => {
    const h = +hours.value, r = +rate.value;
    target = h * r * WEEKS;
    q('[data-show="ore"]').textContent = h;
    q('[data-show="tarif"]').textContent = `${r} lei`;
    q('[data-days]').textContent = fmt(h * WEEKS / HOURS_PER_DAY);
    const count = Math.max(1, Math.min(MAX_SLABS, Math.round(target / LEI_PER_SLAB)));
    slabs.forEach((s, i) => s.classList.toggle('is-on', i < count));
    if (!raf) raf = requestAnimationFrame(tick);
  };
  hours.addEventListener('input', update);
  rate.addEventListener('input', update);
  update();
}

document.querySelectorAll('form[data-endpoint]').forEach(form => {
  const fail = document.createElement('p');
  fail.className = 'form-error';
  fail.hidden = true;
  fail.textContent = 'Mesajul nu a putut fi trimis. Scrieți-mi direct la salut@andreinastase.ro.';
  form.querySelector('button[type="submit"]').before(fail);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    data.set('subiect', form.dataset.subject || 'Mesaj de pe andreinastase.ro');
    btn.disabled = true;
    fail.hidden = true;
    try {
      const res = await fetch(form.dataset.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.querySelector('.form-done').hidden = false;
      btn.textContent = 'Trimis';
    } catch {
      fail.hidden = false;
      btn.disabled = false;
    }
  });
});
