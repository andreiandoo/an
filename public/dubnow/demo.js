// Dubnow demo in the visitor's browser: the model is downloaded once from Hugging Face (pinned revision, kept in the
// Cache API), then speech is synthesised locally with onnxruntime-web, on the graphics card (WebGPU) or the CPU (WASM).
// Nothing is sent to a server. Same approach as Dubnow Lab (dubnow repo, lab/lab.js).
import * as ort from './ort/ort.all.min.mjs';
import { setOrt, UnicodeProcessor, TextToSpeech, loadVoiceStyle, writeWavFile } from './helper.js';

const HF = 'https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46';
// File sizes in bytes, for the progress bar.
const MODEL = { 'onnx/tts.json': 8253, 'onnx/unicode_indexer.json': 277676, 'onnx/duration_predictor.onnx': 3700147,
  'onnx/text_encoder.onnx': 36416150, 'onnx/vector_estimator.onnx': 256534781, 'onnx/vocoder.onnx': 101424195 };
const CACHE = 'dubnow-v1';
const SPEED = 1.05;
const STEPS = { webgpu: 10, wasm: 5 }; // 5 steps on the CPU: about twice as fast, slightly rougher

setOrt(ort);
ort.env.wasm.wasmPaths = new URL('./ort/', import.meta.url).href;
ort.env.wasm.numThreads = crossOriginIsolated ? Math.min(navigator.hardwareConcurrency || 4, 8) : 1;

const form = document.getElementById('tts');
const $ = sel => form.querySelector(sel);
const text = form.elements.text, lang = form.elements.lang, from = form.elements.from;
const samples = JSON.parse(form.dataset.samples);
const loadBtn = $('[data-load]'), goBtn = $('button[type=submit]'), status = $('.tts-status'), audio = $('audio');
const bar = $('.tts-bar'), engineEl = document.querySelector('[data-engine]');
const times = Object.fromEntries([...form.querySelectorAll('[data-t]')].map(el => [el.dataset.t, el]));
const translated = $('.tts-translated');
let tts = null, ep = null, edited = false, busy = false;
const styles = {}, translators = {};

const say = (msg, kind = '') => { status.textContent = msg; status.dataset.kind = kind; };
const secs = s => `${s.toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
const count = () => { $('[data-count-chars]').textContent = text.value.length; };
const progress = f => { bar.hidden = f == null; bar.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };
count();

text.addEventListener('input', () => { edited = true; count(); });
// Until the visitor writes their own text, switching language swaps in a sample sentence in the language they write in.
const resample = () => { if (!edited) { text.value = samples[from.value || lang.value] ?? ''; count(); } };
// Choosing a language is a user gesture too: the translator starts (and fetches its language pack) right then.
const prepare = () => { if (from.value && from.value !== lang.value && 'Translator' in globalThis) translator().catch(() => {}); };
lang.addEventListener('change', () => { resample(); prepare(); });
from.addEventListener('change', () => { resample(); prepare(); });
// Chrome's on-device Translator API (desktop Chrome 138+, Edge 148+). Elsewhere the visitor writes in the voice's language.
if (!('Translator' in globalThis)) {
  from.disabled = true;
  document.querySelector('.tts-no-translate').hidden = false;
}

// One translator per language pair, kept as a promise so the click and the language change share it. A failed one is
// forgotten, so the next attempt starts again. Translator.create() needs a user activation when a pack must be downloaded.
function translator() {
  const pair = { sourceLanguage: from.value, targetLanguage: lang.value };
  const key = `${pair.sourceLanguage}>${pair.targetLanguage}`;
  translators[key] ??= Translator.create({ ...pair, monitor(m) {
    m.addEventListener('downloadprogress', e => { if (busy) say(`Browserul descarcă pachetul de traducere: ${Math.round(e.loaded * 100)}%…`, 'wait'); });
  } }).catch(async e => {
    delete translators[key];
    console.warn('[dubnow] translator', key, e);
    throw new Error(await Translator.availability(pair).catch(() => '') === 'unavailable'
      ? 'Browserul nu poate traduce între aceste limbi. Alege altă limbă.'
      : `Traducerea n-a pornit. Apasă din nou Generează. (${e.name}: ${e.message})`);
  });
  return translators[key];
}

// The text in the voice's language: translated in the browser when the visitor writes in another one.
// A translator the browser has dropped meanwhile (idle, memory) is created again once.
async function inLanguage(value) {
  if (!from.value || from.value === lang.value) return value;
  say('Pregătesc traducerea în browser…', 'wait');
  for (let attempt = 0; ; attempt++) {
    const t = await translator();
    say('Traduc textul…', 'wait');
    try {
      return await t.translate(value);
    } catch (e) {
      console.warn('[dubnow] translate', e);
      delete translators[`${from.value}>${lang.value}`];
      if (attempt) throw new Error(`Traducerea n-a mers. (${e.name}: ${e.message})`);
    }
  }
}
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
  lang.value = b.dataset.lang;
  lang.dispatchEvent(new Event('change'));
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}));

// A real graphics card only: software adapters (SwiftShader) run, but far slower than the CPU path. ?cpu forces the CPU.
async function webgpu() {
  if (new URLSearchParams(location.search).has('cpu')) return false;
  try {
    const a = navigator.gpu && await navigator.gpu.requestAdapter();
    return !!a && !a.isFallbackAdapter && !/swiftshader/i.test(`${a.info?.vendor} ${a.info?.architecture} ${a.info?.description}`);
  } catch { return false; }
}

const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);

async function cached() {
  if (!('caches' in globalThis)) return false;
  const c = await caches.open(CACHE);
  return (await Promise.all(Object.keys(MODEL).map(f => c.match(`${HF}/${f}`)))).every(Boolean);
}

// Every model file as bytes: from the cache when it is there, otherwise downloaded (one progress bar for all) and cached.
// A full cache (private window, little disk) only means the next visit downloads again.
async function files() {
  const c = 'caches' in globalThis ? await caches.open(CACHE).catch(() => null) : null;
  const out = {}, missing = [];
  for (const f of Object.keys(MODEL)) {
    const hit = c && await c.match(`${HF}/${f}`);
    if (hit) out[f] = await hit.arrayBuffer(); else missing.push(f);
  }
  const total = missing.reduce((n, f) => n + MODEL[f], 0);
  let done = 0;
  for (const f of missing) {
    const r = await fetch(`${HF}/${f}`);
    if (!r.ok) throw new Error(`Descărcarea a eșuat (${r.status}).`);
    const reader = r.body.getReader(), parts = [];
    for (;;) {
      const { done: end, value } = await reader.read();
      if (end) break;
      parts.push(value);
      done += value.length;
      progress(Math.min(1, done / total));
      say(`Descarc modelul: ${Math.round(done / 1048576)} din ${Math.round(total / 1048576)} MB…`, 'wait');
    }
    const blob = new Blob(parts);
    await c?.put(`${HF}/${f}`, new Response(blob)).catch(() => {});
    out[f] = await blob.arrayBuffer();
  }
  return out;
}

async function load() {
  const t0 = performance.now();
  busy = true;
  loadBtn.disabled = true;
  try {
    const bytes = await files();
    progress(null);
    const json = f => JSON.parse(new TextDecoder().decode(bytes[f]));
    const cfgs = json('onnx/tts.json'), processor = new UnicodeProcessor(json('onnx/unicode_indexer.json'));
    const nets = ['duration_predictor', 'text_encoder', 'vector_estimator', 'vocoder'];
    const gpu = await webgpu();
    for (const candidate of gpu ? ['webgpu', 'wasm'] : ['wasm']) {
      try {
        say(candidate === 'webgpu' ? 'Pregătesc modelul pe placa video…' : 'Pregătesc modelul pe procesor…', 'wait');
        const opts = { executionProviders: [candidate], graphOptimizationLevel: 'all' };
        const sessions = [];
        for (const n of nets) sessions.push(await ort.InferenceSession.create(new Uint8Array(bytes[`onnx/${n}.onnx`]), opts));
        const t = new TextToSpeech(cfgs, processor, ...sessions);
        // Some graphics drivers load the model and then fail on the first run: try one short line before trusting it.
        if (candidate === 'webgpu') {
          styles.F1 ??= await loadVoiceStyle([`${HF}/voice_styles/F1.json`]);
          await timeout(t.call('Bună.', 'ro', styles.F1, 2, SPEED), 30000);
        }
        tts = t;
        ep = candidate;
        break;
      } catch (e) {
        console.warn('[dubnow]', candidate, e);
      }
    }
    if (!tts) throw new Error('Browserul nu a putut porni modelul.');
    const threads = ort.env.wasm.numThreads;
    engineEl.textContent = ep === 'webgpu' ? 'placa video (WebGPU)' : `procesor, ${threads} ${threads === 1 ? 'fir' : 'fire'}`;
    times.load.textContent = secs((performance.now() - t0) / 1000);
    loadBtn.hidden = true;
    goBtn.hidden = false;
    say(ep === 'webgpu' ? 'Modelul e gata. Scrie un text și apasă Generează.' : 'Modelul e gata, pe procesor. Prima frază poate dura câteva secunde.', 'ok');
  } catch (err) {
    progress(null);
    loadBtn.disabled = false;
    say(err instanceof TypeError ? 'Nu am putut descărca modelul. Verifică internetul și încearcă din nou.' : err.message, 'err');
  } finally {
    busy = false;
  }
}

loadBtn.addEventListener('click', load);

async function synth(said, voice) {
  try {
    styles[voice] ??= await loadVoiceStyle([`${HF}/voice_styles/${voice}.json`]);
  } catch (e) {
    throw new Error(`vocea nu s-a descărcat: ${e.message}`);
  }
  return tts.call(said, lang.value, styles[voice], STEPS[ep], SPEED);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (busy || !tts || !text.value.trim()) return;
  busy = true;
  goBtn.disabled = true;
  let said;
  try {
    said = await inLanguage(text.value.trim());
  } catch (err) {
    console.error('[dubnow]', err);
    say(err.message, 'err');
    busy = false;
    goBtn.disabled = false;
    return;
  }
  translated.hidden = said === text.value.trim();
  translated.querySelector('q').textContent = said;
  try {
    const voice = form.elements.voice.value;
    say('Generez vocea pe calculatorul tău…', 'wait');
    await new Promise(r => setTimeout(r, 30)); // let the status paint before the main thread gets busy
    const t0 = performance.now();
    // One retry: a voice file that failed to download or a graphics card that stumbled once should not end the try.
    const { wav } = await synth(said, voice).catch(err => {
      console.warn('[dubnow] retrying', err);
      return synth(said, voice);
    });
    const spent = (performance.now() - t0) / 1000;
    const length = wav.length / tts.sampleRate;
    times.voice.textContent = secs(spent);
    times.audio.textContent = secs(length);
    times.rtf.textContent = `${(spent / length).toLocaleString('ro-RO', { maximumFractionDigits: 2 })}×`;
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(new Blob([writeWavFile(wav, tts.sampleRate)], { type: 'audio/wav' }));
    audio.hidden = false;
    audio.play().catch(() => {});
    say(spent < length ? 'Gata, mai repede decât timpul real. Schimbă textul, limba sau vocea și generează din nou.' : 'Gata. Pe acest calculator sinteza e mai lentă decât timpul real.', 'ok');
  } catch (err) {
    console.error('[dubnow]', err, said);
    say(`Sinteza n-a mers. Apasă din nou Generează sau încearcă alt text. (${err?.message ?? err})`, 'err');
  } finally {
    busy = false;
    goBtn.disabled = false;
  }
});

(async () => {
  const gpu = await webgpu();
  engineEl.textContent = gpu ? 'placa video (WebGPU)' : crossOriginIsolated ? `procesor, ${ort.env.wasm.numThreads} fire` : 'procesor, 1 fir';
  if (await cached()) {
    loadBtn.textContent = 'Pornește modelul (e deja descărcat)';
    say('Modelul e deja în browserul tău. Pornește-l.', '');
  }
})();
