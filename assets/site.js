// Mobile nav, FAQ, and forms. No framework needed for this size of site.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Forms: the site is static, so each form opens the visitor's mail client
  // with the message pre-filled. Swap for Formspree / a Laravel endpoint
  // by setting data-endpoint on the <form>.
  document.querySelectorAll('form[data-mail]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp') && form.querySelector('.hp').value) return;
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (v, k) { if (k !== 'website' && v) lines.push(k + ': ' + v); });
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function () { done(form); })
          .catch(function () { done(form); });
        return;
      }
      var subject = encodeURIComponent(form.getAttribute('data-subject') || 'Mesaj de pe andreinastase.ro');
      var body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + subject + '&body=' + body;
      done(form);
    });
  });

  function done(form) {
    var msg = form.querySelector('.form-done');
    if (msg) { msg.hidden = false; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Trimis'; }
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
