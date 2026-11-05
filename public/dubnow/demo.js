// Dubnow demo in the visitor's browser: the model is downloaded once from Hugging Face (pinned revision, kept in the
// Cache API), then speech is synthesised locally with onnxruntime-web, on the graphics card (WebGPU) or the CPU (WASM).
// Nothing is sent to a server. Same approach as Dubnow Lab (dubnow repo, lab/lab.js).
import * as ort from './ort/ort.all.min.mjs';
import { setOrt, UnicodeProcessor, TextToSpeech, loadVoiceStyle, writeWavFile } from './helper.js?v=2';

const HF = 'https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46';
// File sizes in bytes, for the progress bar.
const MODEL = { 'onnx/tts.json': 8253, 'onnx/unicode_indexer.json': 277676, 'onnx/duration_predictor.onnx': 3700147,
  'onnx/text_encoder.onnx': 36416150, 'onnx/vector_estimator.onnx': 256534781, 'onnx/vocoder.onnx': 101424195 };
const CACHE = 'dubnow-v1';
const SPEED = 1.05;
const STEPS = { webgpu: 10, wasm: 5 }; // 5 steps on the CPU: about twice as fast, slightly rougher

// UI strings follow <html lang>: English on /en/ pages, Romanian everywhere else.
const EN = document.documentElement.lang === 'en';
const LOCALE = EN ? 'en-US' : 'ro-RO';
const T = EN ? {
  packDownload: p => `The browser is downloading the translation pack: ${p}%…`,
  pairUnavailable: 'The browser cannot translate between these languages. Choose another language.',
  translatorFailed: e => `Translation did not start. Press Generate again. (${e.name}: ${e.message})`,
  preparingTranslation: 'Preparing the translation in the browser…',
  translating: 'Translating the text…',
  translateFailed: e => `Translation failed. (${e.name}: ${e.message})`,
  downloadFailed: s => `The download failed (${s}).`,
  downloading: (a, b) => `Downloading the model: ${a} of ${b} MB…`,
  prepGpu: 'Preparing the model on the graphics card…',
  prepCpu: 'Preparing the model on the processor…',
  noStart: 'The browser could not start the model.',
  engineGpu: 'graphics card (WebGPU)',
  engineCpu: n => `processor, ${n} ${n === 1 ? 'thread' : 'threads'}`,
  engineCpuMany: n => `processor, ${n} threads`,
  readyGpu: 'The model is ready. Write a text and press Generate.',
  readyCpu: 'The model is ready, on the processor. The first sentence may take a few seconds.',
  noNet: 'Could not download the model. Check your internet connection and try again.',
  voiceFailed: m => `the voice did not download: ${m}`,
  generating: 'Generating the voice on your computer…',
  doneFast: 'Done, faster than real time. Change the text, language or voice and generate again.',
  doneSlow: 'Done. On this computer, synthesis is slower than real time.',
  synthFailed: m => `Synthesis failed. Press Generate again or try another text. (${m})`,
  startCached: 'Start the model (already downloaded)',
  inBrowser: 'The model is already in your browser. Start it.',
  lineProgress: (i, n) => `Generating line ${i} of ${n}…`,
  cast: list => `Voices: ${list}.`,
} : {
  packDownload: p => `Browserul descarcă pachetul de traducere: ${p}%…`,
  pairUnavailable: 'Browserul nu poate traduce între aceste limbi. Alege altă limbă.',
  translatorFailed: e => `Traducerea n-a pornit. Apasă din nou Generează. (${e.name}: ${e.message})`,
  preparingTranslation: 'Pregătesc traducerea în browser…',
  translating: 'Traduc textul…',
  translateFailed: e => `Traducerea n-a mers. (${e.name}: ${e.message})`,
  downloadFailed: s => `Descărcarea a eșuat (${s}).`,
  downloading: (a, b) => `Descarc modelul: ${a} din ${b} MB…`,
  prepGpu: 'Pregătesc modelul pe placa video…',
  prepCpu: 'Pregătesc modelul pe procesor…',
  noStart: 'Browserul nu a putut porni modelul.',
  engineGpu: 'placa video (WebGPU)',
  engineCpu: n => `procesor, ${n} ${n === 1 ? 'fir' : 'fire'}`,
  engineCpuMany: n => `procesor, ${n} fire`,
  readyGpu: 'Modelul e gata. Scrie un text și apasă Generează.',
  readyCpu: 'Modelul e gata, pe procesor. Prima frază poate dura câteva secunde.',
  noNet: 'Nu am putut descărca modelul. Verifică internetul și încearcă din nou.',
  voiceFailed: m => `vocea nu s-a descărcat: ${m}`,
  generating: 'Generez vocea pe calculatorul tău…',
  doneFast: 'Gata, mai repede decât timpul real. Schimbă textul, limba sau vocea și generează din nou.',
  doneSlow: 'Gata. Pe acest calculator sinteza e mai lentă decât timpul real.',
  synthFailed: m => `Sinteza n-a mers. Apasă din nou Generează sau încearcă alt text. (${m})`,
  startCached: 'Pornește modelul (e deja descărcat)',
  inBrowser: 'Modelul e deja în browserul tău. Pornește-l.',
  lineProgress: (i, n) => `Generez replica ${i} din ${n}…`,
  cast: list => `Voci: ${list}.`,
};

setOrt(ort);
ort.env.wasm.wasmPaths = new URL('./ort/', import.meta.url).href;
ort.env.wasm.numThreads = crossOriginIsolated ? Math.min(navigator.hardwareConcurrency || 4, 8) : 1;

const form = document.getElementById('tts');
const $ = sel => form.querySelector(sel);
const text = form.elements.text, lang = form.elements.lang, from = form.elements.from;
const samples = JSON.parse(form.dataset.samples);
// Example texts (quote, paragraph, script) exist in Romanian and English; "free" uses the per-language sample sentence.
const presets = JSON.parse(form.dataset.presets || '{}');
const PAGE = EN ? 'en' : 'ro';
const modeBtns = [...form.querySelectorAll('[data-mode]')], hint = $('.tts-script-hint');
const VOICES = [...form.querySelectorAll('input[name=voice]')].map(i => ({ id: i.value, label: i.nextElementSibling?.textContent.trim() ?? i.value }));
let mode = 'free';
const loadBtn = $('[data-load]'), goBtn = $('button[type=submit]'), status = $('.tts-status'), audio = $('audio');
const bar = $('.tts-bar'), engineEl = document.querySelector('[data-engine]');
const times = Object.fromEntries([...form.querySelectorAll('[data-t]')].map(el => [el.dataset.t, el]));
const translated = $('.tts-translated');
let tts = null, ep = null, edited = false, busy = false;
const styles = {}, translators = {};

const say = (msg, kind = '') => { status.textContent = msg; status.dataset.kind = kind; };
const secs = s => `${s.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
// The counter, and a text box tall enough for the whole text (a script or a paragraph would be cut otherwise).
const count = () => {
  $('[data-count-chars]').textContent = text.value.length;
  text.style.height = 'auto';
  text.style.height = `${text.scrollHeight + 2}px`;
};
const progress = f => { bar.hidden = f == null; bar.firstElementChild.style.width = `${Math.round((f || 0) * 100)}%`; };
count();

text.addEventListener('input', () => { edited = true; count(); });
// Until the visitor writes their own text, switching language swaps in a sample sentence in the language they write in.
// Every example text (quote, paragraph, script) exists in all the voice languages and is shown in the language the
// visitor writes in, so any pair of "I write in" and "The voice speaks in" works with any kind of text.
function fill() {
  const set = presets[mode], w = from.value || lang.value;
  text.value = (set ? set[w] ?? set[PAGE] : null) ?? samples[w] ?? '';
  count();
}
const resample = () => { if (!edited) fill(); };
modeBtns.forEach(b => b.addEventListener('click', () => {
  mode = b.dataset.mode;
  modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  if (hint) hint.hidden = mode !== 'script';
  edited = false;
  fill();
}));

// A script is two or more lines, each "Name: what they say". Each character gets its own voice: the first one the
// voice the visitor chose, the next ones from the other gender first, so two speakers always sound different.
function dialogue(value) {
  const rows = value.split(/\n+/).map(r => r.trim()).filter(Boolean);
  const lines = rows.map(r => r.match(/^([^:]{1,30}?)\s*:\s*(\S.*)$/)).filter(Boolean);
  return lines.length >= 2 && lines.length === rows.length ? lines.map(m => ({ who: m[1], said: m[2] })) : null;
}
function cast(lines, first) {
  const g = first[0];
  const order = [first, ...VOICES.map(v => v.id).filter(v => v[0] !== g), ...VOICES.map(v => v.id).filter(v => v[0] === g && v !== first)];
  const who = [...new Set(lines.map(l => l.who))];
  return Object.fromEntries(who.map((w, i) => [w, order[i % order.length]]));
}

// Choosing a language is a user gesture too: the translator starts (and fetches its language pack) right then.
const prepare = () => { if (from.value && from.value !== lang.value && 'Translator' in globalThis) translator().catch(() => {}); };
lang.addEventListener('change', () => { resample(); prepare(); });
from.addEventListener('change', () => { resample(); prepare(); });
// Chrome's on-device Translator API (desktop Chrome 138+, Edge 148+). Elsewhere the visitor writes in the voice's language.
if (!('Translator' in globalThis)) {
  from.value = ''; // the EN page preselects English; without a translator, write in the voice's language
  from.disabled = true;
  document.querySelector('.tts-no-translate').hidden = false;
}

// One translator per language pair, kept as a promise so the click and the language change share it. A failed one is
// forgotten, so the next attempt starts again. Translator.create() needs a user activation when a pack must be downloaded.
function translator() {
  const pair = { sourceLanguage: from.value, targetLanguage: lang.value };
  const key = `${pair.sourceLanguage}>${pair.targetLanguage}`;
  translators[key] ??= Translator.create({ ...pair, monitor(m) {
    m.addEventListener('downloadprogress', e => { if (busy) say(T.packDownload(Math.round(e.loaded * 100)), 'wait'); });
  } }).catch(async e => {
    delete translators[key];
    console.warn('[dubnow] translator', key, e);
    throw new Error(await Translator.availability(pair).catch(() => '') === 'unavailable'
      ? T.pairUnavailable
      : T.translatorFailed(e));
  });
  return translators[key];
}

// The text in the voice's language: translated in the browser when the visitor writes in another one.
// A translator the browser has dropped meanwhile (idle, memory) is created again once.
async function inLanguage(value) {
  if (!from.value || from.value === lang.value) return value;
  say(T.preparingTranslation, 'wait');
  for (let attempt = 0; ; attempt++) {
    const t = await translator();
    say(T.translating, 'wait');
    try {
      return await t.translate(value);
    } catch (e) {
      console.warn('[dubnow] translate', e);
      delete translators[`${from.value}>${lang.value}`];
      if (attempt) throw new Error(T.translateFailed(e));
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
    if (!r.ok) throw new Error(T.downloadFailed(r.status));
    const reader = r.body.getReader(), parts = [];
    for (;;) {
      const { done: end, value } = await reader.read();
      if (end) break;
      parts.push(value);
      done += value.length;
      progress(Math.min(1, done / total));
      say(T.downloading(Math.round(done / 1048576), Math.round(total / 1048576)), 'wait');
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
        say(candidate === 'webgpu' ? T.prepGpu : T.prepCpu, 'wait');
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
    if (!tts) throw new Error(T.noStart);
    const threads = ort.env.wasm.numThreads;
    engineEl.textContent = ep === 'webgpu' ? T.engineGpu : T.engineCpu(threads);
    times.load.textContent = secs((performance.now() - t0) / 1000);
    loadBtn.hidden = true;
    goBtn.hidden = false;
    say(ep === 'webgpu' ? T.readyGpu : T.readyCpu, 'ok');
  } catch (err) {
    progress(null);
    loadBtn.disabled = false;
    say(err instanceof TypeError ? T.noNet : err.message, 'err');
  } finally {
    busy = false;
  }
}

loadBtn.addEventListener('click', load);

async function synth(said, voice) {
  try {
    styles[voice] ??= await loadVoiceStyle([`${HF}/voice_styles/${voice}.json`]);
  } catch (e) {
    throw new Error(T.voiceFailed(e.message));
  }
  return tts.call(said, lang.value, styles[voice], STEPS[ep], SPEED);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (busy || !tts || !text.value.trim()) return;
  busy = true;
  goBtn.disabled = true;
  const value = text.value.trim();
  const lines = mode === 'script' ? dialogue(value) : null;
  let said, parts = null;
  try {
    if (lines) {
      parts = [];
      for (const l of lines) parts.push({ who: l.who, said: await inLanguage(l.said) });
      said = parts.map(p => `${p.who}: ${p.said}`).join('\n');
    } else {
      said = await inLanguage(value);
    }
  } catch (err) {
    console.error('[dubnow]', err);
    say(err.message, 'err');
    busy = false;
    goBtn.disabled = false;
    return;
  }
  translated.hidden = said === value;
  translated.querySelector('q').textContent = said;
  try {
    const voice = form.elements.voice.value;
    say(T.generating, 'wait');
    await new Promise(r => setTimeout(r, 30)); // let the status paint before the main thread gets busy
    const t0 = performance.now();
    // One retry: a voice file that failed to download or a graphics card that stumbled once should not end the try.
    const once = (line, v) => synth(line, v).catch(err => {
      console.warn('[dubnow] retrying', err);
      return synth(line, v);
    });
    let wav, roles = null;
    if (parts) {
      // Line by line, each with its character's voice, with a short pause between lines.
      roles = cast(parts, voice);
      const gap = new Array(Math.floor(0.35 * tts.sampleRate)).fill(0);
      wav = [];
      for (let i = 0; i < parts.length; i++) {
        say(T.lineProgress(i + 1, parts.length), 'wait');
        await new Promise(r => setTimeout(r, 30));
        const out = await once(parts[i].said, roles[parts[i].who]);
        wav = wav.length ? wav.concat(gap, out.wav) : out.wav;
      }
    } else {
      ({ wav } = await once(said, voice));
    }
    const spent = (performance.now() - t0) / 1000;
    const length = wav.length / tts.sampleRate;
    times.voice.textContent = secs(spent);
    times.audio.textContent = secs(length);
    times.rtf.textContent = `${(spent / length).toLocaleString(LOCALE, { maximumFractionDigits: 2 })}×`;
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(new Blob([writeWavFile(wav, tts.sampleRate)], { type: 'audio/wav' }));
    audio.hidden = false;
    audio.play().catch(() => {});
    const label = id => VOICES.find(v => v.id === id)?.label ?? id;
    const castNote = roles ? ` ${T.cast(Object.entries(roles).map(([w, v]) => `${w}: ${label(v)}`).join(' · '))}` : '';
    say((spent < length ? T.doneFast : T.doneSlow) + castNote, 'ok');
  } catch (err) {
    console.error('[dubnow]', err, said);
    say(T.synthFailed(err?.message ?? err), 'err');
  } finally {
    busy = false;
    goBtn.disabled = false;
  }
});

(async () => {
  const gpu = await webgpu();
  engineEl.textContent = gpu ? T.engineGpu : crossOriginIsolated ? T.engineCpuMany(ort.env.wasm.numThreads) : T.engineCpu(1);
  if (await cached()) {
    loadBtn.textContent = T.startCached;
    say(T.inBrowser, '');
  }
})();
