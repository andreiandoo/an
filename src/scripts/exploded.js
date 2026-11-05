import { pick, locale } from './lang.js';
const section = document.getElementById('explodat');
const canUse = () => {
  if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const TRAY_W = 3.5, TRAY_H = 7.2, GAP = 2.05;
const CALLS = [
  ...pick({
    ro: [['Ecrane', 'Formulare', 'Butoane'], ['Roluri', 'Parole', 'Drepturi'], ['Calcule', 'Fluxuri', 'Validări'], ['Tabele', 'Backup', 'Căutare'], ['Carduri', 'Facturi', 'Abonamente'], ['Emailuri', 'SMS', 'Programări']],
    en: [['Screens', 'Forms', 'Buttons'], ['Roles', 'Passwords', 'Permissions'], ['Calculations', 'Flows', 'Validation'], ['Tables', 'Backup', 'Search'], ['Cards', 'Invoices', 'Subscriptions'], ['Emails', 'SMS', 'Bookings']],
  }),
];
const COLORS = ['#7c4dff', '#14b8a6', '#ff4a1c', '#3b82f6', '#22c55e', '#ec4899'];
const clamp = n => Math.min(1, Math.max(0, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

function kit(T, RoundedBox) {
  const mat = (color, metalness = .35, roughness = .4) => new T.MeshStandardMaterial({ color, metalness, roughness });
  const add = (parent, geo, material, x = 0, y = 0, z = 0, lift = 0) => {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.userData = { z, lift };
    parent.add(m);
    return m;
  };
  const box = (parent, w, h, d, material, x, y, z, lift) => add(parent, new RoundedBox(w, h, d, 3, Math.min(w, h, d) * .3), material, x, y, z, lift);
  const cyl = (parent, r, d, material, x, y, z, lift, seg = 40) => {
    const m = add(parent, new T.CylinderGeometry(r, r, d, seg), material, x, y, z, lift);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  const gear = (parent, r, teeth, material, x, y, z, lift) => {
    const shape = new T.Shape();
    const inner = r * .8, step = Math.PI * 2 / (teeth * 4);
    for (let i = 0; i < teeth * 4; i++) {
      const rad = i % 4 === 1 || i % 4 === 2 ? r : inner;
      const a = i * step;
      if (i) shape.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); else shape.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    shape.closePath();
    const hole = new T.Path();
    hole.absarc(0, 0, r * .28, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new T.ExtrudeGeometry(shape, { depth: .16, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2 });
    return add(parent, geo, material, x, y, z, lift);
  };
  return { mat, add, box, cyl, gear };
}

function tray(T, K, color, name) {
  const g = new T.Group();
  K.box(g, TRAY_W, TRAY_H, .14, K.mat('#26282e', .75, .35), 0, 0, 0, 0);
  K.box(g, TRAY_W + .1, TRAY_H + .1, .05, K.mat(color, .5, .35), 0, 0, -.08, 0);
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 1 : -1) * (TRAY_W / 2 - .22), y = (i < 2 ? 1 : -1) * (TRAY_H / 2 - .22);
    K.cyl(g, .07, .1, K.mat('#b9bec9', .9, .25), x, y, .08, 0, 16);
  }
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = Math.round(512 * TRAY_H / TRAY_W);
  const x = c.getContext('2d');
  x.fillStyle = '#26282e';
  x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#363a43';
  x.lineWidth = 2;
  for (let i = 40; i < c.height; i += 48) { x.beginPath(); x.moveTo(0, i); x.lineTo(c.width, i); x.stroke(); }
  for (let i = 40; i < c.width; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, c.height); x.stroke(); }
  x.fillStyle = color;
  x.font = '500 44px "Geist Variable", system-ui, sans-serif';
  x.fillText(name, 40, c.height - 44);
  const map = new T.CanvasTexture(c);
  map.colorSpace = T.SRGBColorSpace;
  const face = new T.Mesh(new T.PlaneGeometry(TRAY_W - .3, TRAY_H - .3), new T.MeshBasicMaterial({ map, toneMapped: false }));
  face.position.z = .075;
  face.userData = { z: .075, lift: 0 };
  g.add(face);
  return g;
}

function buildUi(T, K, g, shot, anisotropy) {
  const parts = [[.08, .12], [.2, .5], [.14, .95], [.2, 1.45], [.2, .75], [.18, .25]];
  const side = K.mat('#17181c', .4, .5);
  let top = TRAY_H / 2 - .1, source = 0;
  const made = parts.map(([share, lift]) => {
    const h = (TRAY_H - .2) * share;
    const c = document.createElement('canvas');
    c.width = 780;
    c.height = Math.round(780 * h / (TRAY_W - .2));
    c.getContext('2d').drawImage(shot, 0, source, 780, c.height, 0, 0, c.width, c.height);
    source += c.height;
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = anisotropy;
    const face = new T.MeshBasicMaterial({ map, toneMapped: false });
    const mesh = new T.Mesh(new T.BoxGeometry(TRAY_W - .24, h - .004, .07), [side, side, side, side, face, side]);
    mesh.position.set(0, top - h / 2, .12);
    mesh.userData = { z: .12, lift };
    g.add(mesh);
    top -= h;
    return mesh;
  });
  return [made[1], made[3], made[2]];
}

function buildRoles(K, g) {
  const skin = [K.mat('#14b8a6', .2, .4), K.mat('#e2e8f0', .2, .5), K.mat('#0f766e', .3, .4)];
  const calls = [];
  for (let i = 0; i < 9; i++) {
    const x = -1.05 + (i % 3) * 1.05, y = 2.3 - Math.floor(i / 3) * 1.45;
    const m = skin[i % 3], lift = .2 + (i % 4) * .28;
    const body = K.cyl(g, .3, .34, m, x, y, .26, lift);
    K.add(g, K.g.sphere, m, x, y, .62, lift);
    if (i === 1) calls[0] = body;
  }
  const key = K.mat('#fbbf24', .85, .28);
  calls[1] = K.cyl(g, .3, .12, key, -.7, -2.3, .2, 1.1);
  K.box(g, 1.25, .17, .12, key, .1, -2.3, .2, 1.1);
  K.box(g, .15, .3, .12, key, .55, -2.47, .2, 1.1);
  calls[2] = K.box(g, .85, 1.05, .22, K.mat('#14b8a6', .55, .3), 1.05, -2.3, .24, .6);
  return calls;
}

function buildRules(K, g, spin) {
  const steel = K.mat('#c7ccd6', .9, .28), orange = K.mat('#ff4a1c', .5, .32), dark = K.mat('#3f434d', .8, .35);
  const a = K.gear(g, 1.05, 12, orange, -.62, 1.7, .12, .55);
  const b = K.gear(g, .72, 8, steel, .98, 2.4, .12, .95);
  const c = K.gear(g, .55, 6, dark, .9, .95, .12, .3);
  spin.push([a, 1], [b, -1.5], [c, -1.9]);
  const chips = [[-1.05, -.65], [0, -.65], [1.05, -.65], [-1.05, -1.75], [0, -1.75], [1.05, -1.75], [-.5, -2.8], [.6, -2.8]];
  const made = chips.map(([x, y], i) => K.box(g, .78, .6, .18, i === 4 ? orange : dark, x, y, .18, .15 + (i % 3) * .35));
  return [a, made[1], made[6]];
}

function buildData(K, g) {
  const blue = K.mat('#3b82f6', .7, .28), light = K.mat('#93c5fd', .8, .25), dark = K.mat('#1e293b', .8, .3);
  const calls = [];
  [[-.82, 1.75], [.85, 1.75]].forEach(([x, y], s) => {
    for (let i = 0; i < 6; i++) {
      const disk = K.cyl(g, .68, .16, i % 2 ? light : blue, x, y, .2 + i * .19, .1 + i * .24);
      if (s === 0 && i === 4) calls[0] = disk;
    }
  });
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const on = (r * 3 + c * 5) % 7 === 0;
      const cell = K.box(g, .66, .36, .13, on ? K.mat('#ff4a1c', .4, .35) : dark, -1.1 + c * .74, .35 - r * .52, .16, .1 + ((r + c) % 3) * .3);
      if (r === 2 && c === 3) calls[1] = cell;
      if (r === 5 && c === 0) calls[2] = cell;
    }
  }
  return calls;
}

function buildPay(K, g) {
  const green = K.mat('#16a34a', .45, .32), gold = K.mat('#f5c542', .95, .22), white = K.mat('#e5e7eb', .3, .45);
  const card = K.box(g, 2.7, 1.72, .1, green, 0, 2, .3, 1.2);
  K.box(g, .46, .36, .1, gold, -.8, 2.2, .35, 1.2);
  K.box(g, 2.68, .3, .1, K.mat('#0f172a', .4, .4), 0, 1.5, .34, 1.2);
  let coins;
  for (let c = 0; c < 3; c++) for (let i = 0; i < 4 + c * 2; i++) {
    const coin = K.cyl(g, .4, .1, gold, -1.05 + c * 1.05, -.1, .15 + i * .12, .12 + i * .12, 28);
    if (c === 2 && i === 7) coins = coin;
  }
  const paper = K.box(g, 2.5, 1.9, .06, white, 0, -2.1, .16, .55);
  for (let i = 0; i < 4; i++) K.box(g, 1.9 - (i % 2) * .6, .14, .05, K.mat('#6b7280', .2, .5), -.1, -1.5 - i * .34, .2, .55);
  return [card, paper, coins];
}

function buildNotify(T, K, g) {
  const pink = K.mat('#ec4899', .4, .35), rose = K.mat('#fbcfe8', .25, .45), gold = K.mat('#f5c542', .9, .25);
  const pts = [[0, 0], [.52, 0], [.56, .1], [.5, .3], [.42, .72], [.32, .92], [.12, 1.02], [0, 1.03]].map(([x, y]) => new T.Vector2(x, y));
  const bell = K.add(g, new T.LatheGeometry(pts, 36), gold, 0, 1.75, .22, 1);
  bell.scale.setScalar(1.05);
  K.add(g, K.g.sphere, gold, 0, 1.6, .22, 1);
  const envelopes = [];
  for (let i = 0; i < 6; i++) {
    const x = -1 + (i % 2) * 2, y = .1 - Math.floor(i / 2) * 1.05;
    envelopes.push(K.box(g, 1.3, .84, .12, i % 3 === 1 ? pink : rose, x * .62, y, .18, .25 + i * .24));
  }
  return [envelopes[0], envelopes[3], bell];
}

async function start() {
  const canvas = document.getElementById('exploded-canvas');
  const callBox = document.getElementById('exploded-calls');
  const [T, { RoundedBoxGeometry }, { RoomEnvironment }, shot] = await Promise.all([
    import('three'),
    import('three/addons/geometries/RoundedBoxGeometry.js'),
    import('three/addons/environments/RoomEnvironment.js'),
    load('/shots/tixello.jpg'),
  ]);
  await document.fonts?.ready;

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const key = new T.DirectionalLight('#ffffff', 2.2);
  key.position.set(-5, 8, 12);
  const rim = new T.DirectionalLight('#ff4a1c', 1.6);
  rim.position.set(8, -4, 3);
  scene.add(key, rim);
  const camera = new T.PerspectiveCamera(30, 1, .1, 200);
  const group = new T.Group();
  scene.add(group);

  const K = kit(T, RoundedBoxGeometry);
  K.g = { sphere: new T.SphereGeometry(.2, 24, 16) };
  const spin = [];
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const names = [...section.querySelectorAll('#exploded-list li')].map(li => li.dataset.title);
  const trays = COLORS.map((c, i) => { const t = tray(T, K, c, names[i]); group.add(t); return t; });
  const anchors = [
    buildUi(T, K, trays[0], shot, anisotropy),
    buildRoles(K, trays[1]),
    buildRules(K, trays[2], spin),
    buildData(K, trays[3]),
    buildPay(K, trays[4]),
    buildNotify(T, K, trays[5]),
  ];
  const parts = trays.map(t => t.children.filter(c => c.userData.lift));
  parts.flat().forEach(m => { m.userData.scale = m.scale.x; });

  const count = trays.length;
  let wide = true;
  const busMat = K.mat('#6b7280', .85, .3);
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => [sx * (TRAY_W / 2 - .55), sy * (TRAY_H / 2 + .02)]);
  const bus = corners.map(([x, y]) => K.cyl(group, .03, 1, busMat, x, y, 0, 0, 10));
  const glow = new T.MeshBasicMaterial({ color: '#ff4a1c', toneMapped: false });
  const packets = Array.from({ length: 16 }, (_, i) => {
    const m = new T.Mesh(K.g.sphere, glow);
    m.scale.setScalar(.45);
    group.add(m);
    return { m, c: corners[i % 4], k: i / 16 };
  });

  const calls = [0, 1, 2].map(() => {
    const el = document.createElement('div');
    el.className = 'call';
    el.innerHTML = '<i></i><span></span>';
    callBox.append(el);
    return { el, text: el.querySelector('span') };
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = camera.aspect >= .8;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  const items = [...section.querySelectorAll('#exploded-list li')];
  const end = section.querySelector('.exploded-end');
  const intro = section.querySelector('.exploded-intro');
  const v = new T.Vector3();
  const state = trays.map(() => ({ out: 0 }));
  let eased = 0, visible = false, current = -2, last = 0;
  const SIDE_X = .75, SIDE_Y = -.66, SIDE_DIST = 5.4;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);

  function frame(now) {
    const dt = Math.min(now - last, 400) / 1000;
    const ease = rate => 1 - Math.exp(-dt * rate);
    last = now;
    if (visible) {
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      eased += (p - eased) * ease(7);
      const turn = smooth(0, .12, eased) * (1 - smooth(.9, 1, eased));
      const spread = smooth(.08, .24, eased) * (1 - smooth(.88, .98, eased));
      group.rotation.set(-turn * 1.02, 0, turn * .72 + Math.sin(now / 2600) * .02 * turn);
      group.position.set(-turn * (wide ? 2.4 : .6), -turn * .4, 0);
      camera.position.z = (wide ? 21 : 34) + spread * (wide ? 11 : 14);
      const active = eased >= .26 && eased < .86 ? Math.min(count - 1, Math.floor((eased - .26) / .6 * count)) : -1;

      trays.forEach((t, i) => {
        const s = state[i];
        s.out += ((i === active ? 1 : 0) - s.out) * ease(6);
        const baseZ = ((count - 1) / 2 - i) * GAP * spread;
        if (wide) t.position.set(s.out * SIDE_DIST * SIDE_X, s.out * SIDE_DIST * SIDE_Y, baseZ + s.out * .6);
        else t.position.set(s.out * 1.2, s.out * -1.1, baseZ + s.out * (i * GAP + 1.6));
        t.visible = i === 0 || spread > .015 || s.out > .02;
        parts[i].forEach(m => {
          m.position.z = m.userData.z + m.userData.lift * s.out * 1.1;
          if (i === 0) return;
          m.visible = s.out > .03;
          m.scale.setScalar(m.userData.scale * Math.max(.001, smooth(0, 1, s.out)));
        });
      });
      spin.forEach(([m, speed]) => { m.rotation.z += dt * speed * (.25 + spread); });

      const length = (count - 1) * GAP * spread;
      bus.forEach(m => { m.scale.y = Math.max(.001, length); m.visible = spread > .02; });
      packets.forEach(pk => {
        const t = (now / 3200 + pk.k) % 1;
        pk.m.position.set(pk.c[0], pk.c[1], (t - .5) * length);
        pk.m.visible = spread > .3;
      });
      if (active !== current) {
        current = active;
        items.forEach((li, i) => { li.classList.toggle('is-on', i === active); li.classList.toggle('is-past', active >= 0 && i < active); });
        calls.forEach((c, i) => { if (active >= 0) c.text.textContent = CALLS[active][i]; });
      }
      end.style.opacity = smooth(.9, .97, eased).toFixed(3);
      intro.style.opacity = (1 - smooth(.18, .26, eased)).toFixed(3);
      renderer.render(scene, camera);

      const w = canvas.clientWidth, h = canvas.clientHeight;
      calls.forEach((c, i) => {
        const on = active >= 0 && state[active].out > .7;
        c.el.classList.toggle('is-on', on);
        if (!on) return;
        anchors[active][i].getWorldPosition(v).project(camera);
        c.el.style.transform = `translate3d(${((v.x + 1) / 2 * w).toFixed(0)}px,${((1 - v.y) / 2 * h).toFixed(0)}px,0)`;
      });
    }
    requestAnimationFrame(frame);
  }
  section.classList.add('is-live');
  resize();
  requestAnimationFrame(n => { last = n; frame(n); });
}

if (canUse()) {
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { io.disconnect(); start().catch(() => section.classList.remove('is-live')); }
  }, { rootMargin: '600px' }).observe(section);
}
