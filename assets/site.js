// andreinastase.ro — v3. Reveal la scroll, meniu mobil, formulare, screenshot-uri lipsă.
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* meniu mobil */
  var toggle = document.querySelector('.nav-toggle'), nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Închide' : 'Meniu';
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.textContent = 'Meniu'; }); });
  }

  /* reveal la scroll */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  } else {
    els.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* screenshot lipsă → arată placeholder-ul cu numele fișierului */
  document.querySelectorAll('.shot img').forEach(function (img) {
    img.addEventListener('error', function () { img.classList.add('is-missing'); });
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-missing');
  });

  /* calculator: cât costă munca repetitivă */
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var hours = calc.querySelector('[name="ore"]'), rate = calc.querySelector('[name="tarif"]'), out = calc.querySelector('[data-out]');
    function upd() {
      var h = parseFloat(hours.value) || 0, r = parseFloat(rate.value) || 0;
      out.textContent = Math.round(h * r * 48).toLocaleString('ro-RO') + ' lei';
    }
    hours.addEventListener('input', upd); rate.addEventListener('input', upd); upd();
  }

  /* formulare: site static → deschide clientul de email precompletat.
     Pune data-endpoint="https://..." pe <form> ca să trimită prin POST (Formspree, Laravel etc.). */
  document.querySelectorAll('form[data-mail]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('.hp input'); if (hp && hp.value) return;
      var data = new FormData(form), lines = [];
      data.forEach(function (v, k) { if (k !== 'website' && v) lines.push(k + ': ' + v); });
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) { fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function () { done(form); }).catch(function () { done(form); }); return; }
      var subject = encodeURIComponent(form.getAttribute('data-subject') || 'Mesaj de pe andreinastase.ro');
      window.location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + subject + '&body=' + encodeURIComponent(lines.join('\n'));
      done(form);
    });
  });
  function done(form) {
    var msg = form.querySelector('.form-done'); if (msg) msg.hidden = false;
    var btn = form.querySelector('button[type="submit"]'); if (btn) { btn.disabled = true; btn.textContent = 'Trimis'; }
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
