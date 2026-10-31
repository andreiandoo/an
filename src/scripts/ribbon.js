const section = document.getElementById('ribbon');
const canUse = () => {
  if (!section || innerWidth < 768 || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

if (canUse()) {
  section.classList.add('is-on');
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { io.disconnect(); start(); }
  }, { rootMargin: '500px' }).observe(section);
}

const FILES = ['tixello', 'ambilet', 'bilete-online', 'tics', 'dreamsatlas', 'viaqui', 'e-test', 'dubidu', 'emud'];
const CELL_W = 360, CELL_H = 780, PAD = 10, RADIUS = 18;

const VS = `
  uniform float uP, uTime, uLen, uWidth;
  varying vec2 vUv; varying float vShade;
  void main() {
    vUv = uv * vec2(3.0, 1.0);
    float flat_ = smoothstep(.45, 1.0, uP);
    float s = (uv.x - .5) * uLen + mix(11.0, -5.0, uP);
    float amp = 1.0 - flat_;
    float ph = uP * 3.0 + uTime * .08;
    vec3 c = vec3(s, amp * 1.15 * sin(s * .42 + ph) + mix(1.75, 0.0, smoothstep(0.0, .55, uP)), amp * 1.6 * cos(s * .3 + ph));
    float tw = amp * 1.15 * sin(s * .38 - ph * .7);
    vec3 across = vec3(0.0, cos(tw), sin(tw));
    vShade = .78 + .22 * cos(tw);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c + across * (uv.y - .5) * uWidth, 1.0);
  }`;
const FS = `
  uniform sampler2D uMap;
  varying vec2 vUv; varying float vShade;
  void main() {
    vec4 t = texture2D(uMap, vUv);
    if (t.a < .5) discard;
    float g = dot(t.rgb, vec3(.299, .587, .114));
    gl_FragColor = vec4(vec3(g) * vShade, 1.0);
    #include <colorspace_fragment>
  }`;

async function atlas() {
  const c = document.createElement('canvas');
  c.width = CELL_W * FILES.length;
  c.height = CELL_H;
  const g = c.getContext('2d');
  const images = await Promise.all(FILES.map(f => new Promise((ok, no) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = no;
    i.src = `/shots/${f}.jpg`;
  })));
  images.forEach((img, i) => {
    const x = i * CELL_W + PAD, w = CELL_W - PAD * 2;
    g.save();
    g.beginPath();
    g.roundRect(x, 0, w, CELL_H, RADIUS);
    g.clip();
    g.drawImage(img, 0, 0, 780, 780 * CELL_H / w, x, 0, w, CELL_H);
    g.restore();
  });
  return c;
}

async function start() {
  const canvas = section.querySelector('canvas');
  const [T, source] = await Promise.all([import('three'), atlas()]).catch(() => [null, null]);
  if (!T) { section.classList.remove('is-on'); return; }

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, .1, 100);
  camera.position.z = 11;

  const map = new T.CanvasTexture(source);
  map.wrapS = T.RepeatWrapping;
  map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const width = 3.1, length = 3 * FILES.length * width * CELL_W / CELL_H;
  const uniforms = { uMap: { value: map }, uP: { value: 0 }, uTime: { value: 0 }, uLen: { value: length }, uWidth: { value: width } };
  const material = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms, side: T.DoubleSide });
  scene.add(new T.Mesh(new T.PlaneGeometry(1, 1, 500, 6), material));

  function resize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);

  function frame(now) {
    if (visible) {
      const r = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      uniforms.uP.value = p;
      uniforms.uTime.value = now / 1000;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
