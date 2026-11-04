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
const text = form.elements.text, lang = form.elements.lang;
const samples = JSON.parse(form.dataset.samples);
const loadBtn = $('[data-load]'), goBtn = $('button[type=submit]'), status = $('.tts-status'), audio = $('audio');
const bar = $('.tts-bar'), engineEl = document.querySelector('[data-engine]');
const times = Object.fromEntries([...form.querySelectorAll('[data-t]')].map(el => [el.dataset.t, el]));
let tts = null, ep = null, edited = false, busy = false;
const styles = {};

const say = (msg, kind = '') => { status.textContent = msg; status.dataset.kind = kind; };
const secs = s => `${s.toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
const count = () => { $('[data-count-chars]').textContent = text.value.length; };
const progress = f => { bar.hidden = f == null; bar.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };
count();

text.addEventListener('input', () => { edited = true; count(); });
// Until the visitor writes their own text, switching language swaps in a sample sentence in that language.
lang.addEventListener('change', () => { if (!edited) { text.value = samples[lang.value] ?? ''; count(); } });
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

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (busy || !tts || !text.value.trim()) return;
  busy = true;
  goBtn.disabled = true;
  try {
    const voice = form.elements.voice.value;
    styles[voice] ??= await loadVoiceStyle([`${HF}/voice_styles/${voice}.json`]);
    say('Generez vocea pe calculatorul tău…', 'wait');
    await new Promise(r => setTimeout(r, 30)); // let the status paint before the main thread gets busy
    const t0 = performance.now();
    const { wav } = await tts.call(text.value.trim(), lang.value, styles[voice], STEPS[ep], SPEED);
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
    console.error('[dubnow]', err);
    say('Sinteza n-a mers. Încearcă un text mai scurt sau altă limbă.', 'err');
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
