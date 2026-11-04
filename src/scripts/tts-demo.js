// Dubnow demo: dubidu.net gives a worker and a short demo ticket (POST /api/dubnow/demo, this site's origin only),
// then the text goes straight to the worker over a WebSocket and the voice comes back as a WAV.
const API = 'https://dubidu.net/api/dubnow/demo';
const WAIT_MAX_MS = 6 * 60 * 1000;
const form = document.getElementById('tts');

if (form) {
  const samples = JSON.parse(form.dataset.samples);
  const text = form.elements.text;
  const lang = form.elements.lang;
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('.tts-status');
  const audio = form.querySelector('audio');
  const chars = form.querySelector('[data-count-chars]');
  const times = Object.fromEntries([...form.querySelectorAll('[data-t]')].map(el => [el.dataset.t, el]));
  let edited = false;
  let busy = false;

  const say = (msg, kind = '') => { status.textContent = msg; status.dataset.kind = kind; };
  const secs = ms => `${(ms / 1000).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const count = () => { chars.textContent = text.value.length; };
  count();

  text.addEventListener('input', () => { edited = true; count(); });
  // Until the visitor writes their own text, switching language swaps in a sample sentence in that language.
  lang.addEventListener('change', () => { if (!edited) { text.value = samples[lang.value] ?? ''; count(); } });
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    lang.value = b.dataset.lang;
    lang.dispatchEvent(new Event('change'));
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  }));

  async function worker(started) {
    while (Date.now() - started < WAIT_MAX_MS) {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ lang: lang.value }) });
      if (r.status === 429) throw new Error('Prea multe cereri într-un minut. Mai încearcă puțin mai târziu.');
      const data = await r.json().catch(() => ({}));
      if (data.status === 'ready') return data;
      if (data.status === 'warming') {
        say(`Pornim un server de voce. Mai durează cam ${Math.max(5, Math.round(data.eta_s))} s.`, 'wait');
        await sleep((data.retry_after_s ?? 5) * 1000);
        continue;
      }
      throw new Error(data.message || 'Serverul de voce nu răspunde acum. Încearcă din nou în câteva minute.');
    }
    throw new Error('Serverul a pornit prea greu. Încearcă din nou peste un minut.');
  }

  function speak(w, voice, sent) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(w.worker_url.replace(/^http/, 'ws') + '/dub?ticket=' + encodeURIComponent(w.ticket));
      const timer = setTimeout(() => { ws.close(); reject(new Error('Vocea n-a venit la timp. Încearcă din nou.')); }, 60000);
      ws.onmessage = e => {
        const m = JSON.parse(e.data);
        if (m.type === 'ready') {
          sent.at = performance.now();
          // due_ms far ahead: the worker drops lines whose moment has passed, and this one has no film behind it.
          ws.send(JSON.stringify({ type: 'lines', lines: [{ i: 0, text: text.value.trim(), ref: w.voices[voice], lang: lang.value, slot_ms: 0, due_ms: 120000 }] }));
        } else if (m.type === 'audio' || m.type === 'error') {
          clearTimeout(timer);
          ws.close();
          if (m.type === 'audio') resolve(m); else reject(new Error('Serverul n-a putut citi textul. Încearcă alt text.'));
        }
      };
      ws.onerror = () => { clearTimeout(timer); reject(new Error('Legătura cu serverul de voce s-a întrerupt.')); };
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy || !text.value.trim()) return;
    busy = true;
    button.disabled = true;
    Object.values(times).forEach(el => { el.textContent = '-'; });
    const started = Date.now();
    const t0 = performance.now();
    try {
      say('Cerem un server de voce…', 'wait');
      const w = await worker(started);
      times.server.textContent = secs(performance.now() - t0);
      say('Serverul citește textul…', 'wait');
      const sent = {};
      const m = await speak(w, form.elements.voice.value, sent);
      times.voice.textContent = secs(performance.now() - sent.at);
      times.audio.textContent = secs(m.ms);
      const bytes = Uint8Array.from(atob(m.wav), c => c.charCodeAt(0));
      if (audio.src) URL.revokeObjectURL(audio.src);
      audio.src = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
      audio.hidden = false;
      audio.play().catch(() => {});
      say('Gata. Poți schimba textul, limba sau vocea și generezi din nou.', 'ok');
    } catch (err) {
      say(err instanceof TypeError ? 'Nu ajungem la serverul de voce. Verifică internetul și încearcă din nou.' : err.message, 'err');
    } finally {
      busy = false;
      button.disabled = false;
    }
  });
}
