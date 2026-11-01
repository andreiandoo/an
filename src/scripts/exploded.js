const section = document.getElementById('explodat');
const canUse = () => {
  if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const W = 512, H = 1108, R = 56, ACCENT = '#ff4a1c', INK = '#f2f2f2', DIM = '#565656', PLATE = '#2b2b2b', EDGE = '#6a6a6a';
const FONT = '"Geist Variable", system-ui, sans-serif';

function plate(paint) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.beginPath();
  g.roundRect(0, 0, W, H, R);
  g.clip();
  g.fillStyle = PLATE;
  g.fillRect(0, 0, W, H);
  paint(g);
  g.strokeStyle = EDGE;
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(3, 3, W - 6, H - 6, R - 3);
  g.stroke();
  return c;
}
const label = (g, text) => { g.fillStyle = INK; g.font = `500 44px ${FONT}`; g.fillText(text, 44, 96); };
const box = (g, x, y, w, h, fill = DIM, r = 14) => { g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };

const PAINTERS = [
  null,
  g => {
    label(g, 'Conturi');
    [0, 1, 2, 3, 4, 5].forEach(i => {
      const y = 160 + i * 150;
      g.fillStyle = i === 1 ? ACCENT : DIM;
      g.beginPath(); g.arc(92, y + 44, 44, 0, 7); g.fill();
      box(g, 164, y + 14, 240, 22); box(g, 164, y + 52, 150, 18, '#444');
    });
  },
  g => {
    label(g, 'Reguli');
    const steps = [[60, 170], [270, 330], [60, 490], [270, 650], [60, 810]];
    g.strokeStyle = ACCENT; g.lineWidth = 5; g.beginPath();
    steps.forEach(([x, y], i) => { const px = x + 91, py = y + 55; if (i) g.lineTo(px, py); else g.moveTo(px, py); });
    g.stroke();
    steps.forEach(([x, y], i) => box(g, x, y, 182, 110, i === 2 ? ACCENT : DIM));
  },
  g => {
    label(g, 'Date');
    for (let i = 0; i < 12; i++) {
      const y = 160 + i * 74;
      box(g, 44, y, 424, 56, i === 4 ? ACCENT : '#3c3c3c', 10);
      box(g, 64, y + 20, 110, 16, i === 4 ? '#fff' : DIM, 6);
      box(g, 200, y + 20, 170, 16, i === 4 ? '#fff' : DIM, 6);
    }
  },
  g => {
    label(g, 'Plăți');
    box(g, 44, 170, 424, 250, ACCENT, 26);
    box(g, 80, 340, 180, 22, '#fff', 8);
    box(g, 80, 220, 76, 56, '#fff', 12);
    [0, 1, 2, 3, 4].forEach(i => {
      const y = 480 + i * 104;
      box(g, 44, y, 424, 84, '#3c3c3c');
      box(g, 72, y + 32, 170, 20); box(g, 368, y + 32, 72, 20, i ? DIM : ACCENT);
    });
  },
  g => {
    label(g, 'Mesaje');
    [[44, 170, 330, 120, DIM], [138, 320, 330, 120, ACCENT], [44, 470, 280, 120, DIM], [138, 620, 330, 150, DIM], [44, 800, 330, 120, DIM]].forEach(([x, y, w, h, c]) => box(g, x, y, w, h, c, 24));
  },
];

const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const clamp = n => Math.min(1, Math.max(0, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

async function start() {
  const canvas = document.getElementById('exploded-canvas');
  const [T, shot] = await Promise.all([import('three'), load('/shots/tixello.jpg')]);
  await document.fonts?.ready;

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, .1, 100);
  const group = new T.Group();
  scene.add(group);

  const sheets = [plate(g => g.drawImage(shot, 0, 0, 780, 780 * H / W, 0, 0, W, H)), ...PAINTERS.slice(1).map(plate)];
  const geo = new T.PlaneGeometry(3.2, 3.2 * H / W);
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const layers = sheets.map((sheet, i) => {
    const map = new T.CanvasTexture(sheet);
    map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = anisotropy;
    const material = new T.MeshBasicMaterial({ map, alphaTest: .5, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, material);
    group.add(mesh);
    return { mesh, material, out: 0 };
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < .8 ? 29 : 25;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const items = [...section.querySelectorAll('#exploded-list li')];
  const end = section.querySelector('.exploded-end');
  const intro = section.querySelector('.exploded-intro');
  const count = layers.length;
  let eased = 0, visible = false, current = -2;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);

  function frame() {
    if (visible) {
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      eased += (p - eased) * .12;
      const turn = smooth(0, .14, eased) * (1 - smooth(.88, 1, eased));
      const spread = smooth(.1, .26, eased) * (1 - smooth(.86, .98, eased));
      group.rotation.set(-turn * 1.02, 0, turn * .72);
      group.position.x = -turn * 1.1;
      group.position.y = -turn * .9;
      const active = eased >= .28 && eased < .86 ? Math.min(count - 1, Math.floor((eased - .28) / .58 * count)) : -1;
      layers.forEach((l, i) => {
        l.out += ((i === active ? 1 : 0) - l.out) * .14;
        l.mesh.position.set(l.out * 1.9, l.out * -1.1, ((count - 1) / 2 - i) * 1.5 * spread + l.out * (i * 1.5 + .9));
        const shade = active < 0 ? 1 : .55 + l.out * .45;
        l.material.color.setScalar(shade);
      });
      if (active !== current) {
        current = active;
        items.forEach((li, i) => { li.classList.toggle('is-on', i === active); li.classList.toggle('is-past', active >= 0 && i < active); });
      }
      const done = smooth(.88, .96, eased);
      end.style.opacity = done.toFixed(3);
      intro.style.opacity = (1 - smooth(.2, .3, eased)).toFixed(3);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  section.classList.add('is-live');
  resize();
  requestAnimationFrame(frame);
}

if (canUse()) {
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { io.disconnect(); start().catch(() => section.classList.remove('is-live')); }
  }, { rootMargin: '600px' }).observe(section);
}
