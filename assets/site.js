// andreinastase.ro — v2 interactions: scroll reveals, stacking portfolio,
// header state, scroll progress, counters, forms. No framework.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header + progress */
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress span');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
    stackPanels();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Închide' : 'Meniu';
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.textContent = 'Meniu'; }); });
  }

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal, .panel');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          if (e.target.classList.contains('panel')) e.target.classList.add('in-view');
          if (!e.target.classList.contains('panel')) io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety net: nothing stays hidden if the observer never fires
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-in', 'in-view'); }); }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in', 'in-view'); });
  }

  /* stacking portfolio: earlier panels shrink + dim as the next one covers them */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var headerH = 76;
  function stackPanels() {
    if (reduce || window.innerWidth < 960 || !panels.length) return;
    panels.forEach(function (p, i) {
      var next = panels[i + 1];
      if (!next) { p.style.transform = ''; p.style.setProperty('--dim', 0); return; }
      var r = next.getBoundingClientRect();
      var covered = Math.min(1, Math.max(0, (window.innerHeight - r.top) / window.innerHeight));
      var s = 1 - covered * 0.06;
      p.style.transform = 'scale(' + s.toFixed(4) + ')';
      p.style.setProperty('--dim', (covered * 0.6).toFixed(3));
    });
  }

  /* counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = parseFloat(el.getAttribute('data-count')), t0 = null;
        var dur = 1400;
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * k);
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* forms: static site → opens the mail client prefilled.
     Set data-endpoint="https://..." on the form to POST instead (Formspree, Laravel, etc.). */
  document.querySelectorAll('form[data-mail]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('.hp input');
      if (hp && hp.value) return;
      var data = new FormData(form), lines = [];
      data.forEach(function (v, k) { if (k !== 'website' && v) lines.push(k + ': ' + v); });
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function () { done(form); }).catch(function () { done(form); });
        return;
      }
      var subject = encodeURIComponent(form.getAttribute('data-subject') || 'Mesaj de pe andreinastase.ro');
      window.location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + subject + '&body=' + encodeURIComponent(lines.join('\n'));
      done(form);
    });
  });
  function done(form) {
    var msg = form.querySelector('.form-done');
    if (msg) msg.hidden = false;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Trimis'; }
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  onScroll();
})();
