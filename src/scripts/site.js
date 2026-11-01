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
  const hours = calc.querySelector('[name="ore"]'), rate = calc.querySelector('[name="tarif"]'), out = calc.querySelector('[data-out]');
  const update = () => { out.textContent = `${Math.round((+hours.value || 0) * (+rate.value || 0) * 48).toLocaleString('ro-RO')} lei`; };
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
