const section = document.querySelector('.process');
const canUse = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const ACCENT = '#ff4a1c', INK = '#1b1b1b', IVORY = '#f7f6f3', STONE = '#bdbbb5';
const BALL_Y = .2, EXIT = .72;
const clamp = n => Math.min(1, Math.max(0, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function kit(T, RoundedBox) {
  const mat = (color, roughness = .5) => new T.MeshStandardMaterial({ color, roughness, metalness: 0 });
  const mesh = (parent, geo, material, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (parent, w, h, d, material, x, y, z) => mesh(parent, new RoundedBox(w, h, d, 4, Math.min(w, h, d) * .22), material, x, y, z);
  const post = (parent, r, h, material, x, z) => mesh(parent, new T.CylinderGeometry(r, r, h, 24), material, x, h / 2, z);
  const ivory = mat(IVORY, .3);
  // Two rails, so the ball visibly rides the track.
  const track = (parent, points, posts = []) => {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    [-.13, .13].forEach(z => {
      const rail = new T.CatmullRomCurve3(points.map(p => new T.Vector3(p[0], p[1], p[2] + z)));
      mesh(parent, new T.TubeGeometry(rail, 90, .05, 12), ivory);
    });
    posts.forEach(u => {
      const p = curve.getPoint(u);
      post(parent, .045, p.y, ivory, p.x, p.z);
    });
    return curve;
  };
  return { mat, mesh, box, post, track };
}

// 1. The idea drops in and comes out with an answer.
function funnel(T, k, g) {
  const ink = k.mat(INK, .4), lamp = [0, 1, 2].map(() => new T.MeshStandardMaterial({ color: STONE, emissive: ACCENT, emissiveIntensity: 0, roughness: .4 }));
  k.box(g, 1.3, 1.9, 1.3, k.mat(IVORY, .55), -1, .95, 0);
  const shape = [[.17, 0], [.22, .35], [1.05, 1.15], [1.12, 1.3]].map(([x, y]) => new T.Vector2(x, y));
  const cone = k.mesh(g, new T.LatheGeometry(shape, 48), ink, -1, 1.9, 0);
  cone.material.side = T.DoubleSide;
  lamp.forEach((m, i) => k.mesh(g, new T.SphereGeometry(.075, 20, 14), m, -1.32 + i * .32, .55, .66));
  const curve = k.track(g, [[-.4, 1.25, 0], [.5, 1.15, 0], [1.6, .95, 0], [2.6, .8, 0], [3.8, .7, 0]], [.3, .62]);
  return (u, ball) => {
    const fall = clamp(u / .34), roll = clamp((u - .44) / .56);
    if (u < .44) ball.position.set(-1, 5.2 - 3.4 * fall * fall, 0);
    else { const p = curve.getPoint(roll); ball.position.set(p.x, p.y + BALL_Y, p.z); }
    ball.visible = u < .34 || u > .44;
    lamp.forEach((m, i) => { m.emissiveIntensity = smooth(.34 + i * .03, .4 + i * .03, u) * 2; });
  };
}

// 2. The scanner reads the work and a fixed price rises.
function scanner(T, k, g) {
  const ink = k.mat(INK, .4), hot = new T.MeshStandardMaterial({ color: ACCENT, roughness: .4 });
  const curve = k.track(g, [[-3.8, 2.5, 0], [-2, 2.15, 0], [0, 1.65, 0], [2, 1.2, 0], [3.8, .95, 0]], [.22, .75]);
  const ring = new T.Group();
  ring.position.set(0, 1.65, 0);
  ring.rotation.y = 1.05;
  g.add(ring);
  k.mesh(ring, new T.TorusGeometry(.72, .12, 20, 64), ink);
  const ticks = new T.Group();
  ring.add(ticks);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const t = k.mesh(ticks, new T.BoxGeometry(.05, .17, .1), i % 3 ? k.mat(STONE) : hot, Math.cos(a) * .96, Math.sin(a) * .96, 0);
    t.rotation.z = a - Math.PI / 2;
  }
  k.box(g, .5, .92, .9, k.mat(IVORY, .55), 0, .46, 0);
  k.post(g, .05, 1.4, k.mat(STONE), 1.75, -.9);
  const price = k.box(g, 1.25, .78, .14, k.mat(IVORY, .35), 1.75, 1.7, -.9);
  k.mesh(price, new T.SphereGeometry(.1, 20, 14), hot, -.38, .16, .09);
  k.box(price, .62, .06, .03, ink, .12, .16, .08);
  k.box(price, .9, .05, .03, k.mat(STONE), 0, -.12, .08);
  return (u, ball, t) => {
    const p = curve.getPoint(u);
    ball.position.set(p.x, p.y + BALL_Y, p.z);
    ticks.rotation.z = t * .5 + u * 5;
    price.position.y = .1 + smooth(.46, .8, u) * 1.6;
    price.visible = u > .44;
  };
}

// 3. Each pass of the ball adds a finished layer.
function stack(T, k, g) {
  const white = k.mat(IVORY, .4), dark = k.mat(INK, .4), hot = new T.MeshStandardMaterial({ color: ACCENT, roughness: .4 });
  k.box(g, 2.5, .24, 1.9, k.mat(STONE, .6), .1, .12, -.75);
  const plates = [white, dark, white, dark, hot].map((m, i) => k.box(g, 2.2 - i * .12, .3, 1.6 - i * .1, m, .1, 0, -.75));
  const curve = k.track(g, [[-3.8, 2.2, .3], [-2.4, 1.5, .55], [-1, .85, .8], [.8, .55, .9], [2.3, .42, .7], [3.8, .35, .5]], [.2, .42, .66]);
  return (u, ball) => {
    const p = curve.getPoint(u);
    ball.position.set(p.x, p.y + BALL_Y, p.z);
    plates.forEach((m, i) => {
      const a = .12 + i * .15, q = smooth(a, a + .17, u);
      m.position.y = .4 + i * .32 + (1 - q) * 5;
      m.visible = q > 0;
    });
  };
}

// 4. The finished product keeps running.
function orbit(T, k, g) {
  const white = k.mat(IVORY, .4), dark = k.mat(INK, .4), hot = new T.MeshStandardMaterial({ color: ACCENT, roughness: .4 });
  const R = 1.72, Y = .8;
  const tower = new T.Group();
  g.add(tower);
  k.box(tower, 2, .24, 2, k.mat(STONE, .6), 0, .12, 0);
  [white, dark, white, dark, hot].forEach((m, i) => k.box(tower, 1.5 - i * .1, .3, 1.5 - i * .1, m, 0, .4 + i * .32, 0));
  [R - .13, R + .13].forEach(r => {
    const rail = k.mesh(g, new T.TorusGeometry(r, .05, 12, 120), k.mat(IVORY, .3), 0, Y, 0);
    rail.rotation.x = Math.PI / 2;
  });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .5; k.post(g, .045, Y, white, Math.cos(a) * R, Math.sin(a) * R); }
  const curve = k.track(g, [[-3.8, 2.1, 1.2], [-2.8, 1.55, 1.5], [-1.6, 1.02, 1.62], [-.6, .84, R]], [.4]);
  return (u, ball, t, state) => {
    if (u < .6) {
      state.spin = 0;
      const p = curve.getPoint(u / .6);
      ball.position.set(p.x, p.y + BALL_Y, p.z);
    } else {
      state.spin += state.dt * 1.5;
      const a = Math.atan2(R, -.6) - state.spin;
      ball.position.set(Math.cos(a) * R, Y + BALL_Y, Math.sin(a) * R);
    }
    tower.rotation.y = t * .15;
  };
}

async function start(cards) {
  const [T, { RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
    import('three'),
    import('three/addons/environments/RoomEnvironment.js'),
    import('three/addons/geometries/RoundedBoxGeometry.js'),
  ]);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.environment = new T.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .75;
  const sun = new T.DirectionalLight('#ffffff', 1.5);
  sun.position.set(-3.5, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -6;
  sun.shadow.camera.right = sun.shadow.camera.top = 6;
  sun.shadow.radius = 6;
  scene.add(sun);
  const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: .2 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const k = kit(T, RoundedBoxGeometry);
  const ball = new T.Mesh(new T.SphereGeometry(.22, 32, 24), new T.MeshStandardMaterial({ color: ACCENT, roughness: .35 }));
  ball.castShadow = true;
  scene.add(ball);
  const camera = new T.PerspectiveCamera(28, 1, .1, 60);

  const builders = [funnel, scanner, stack, orbit];
  const items = cards.map((card, i) => {
    const group = new T.Group();
    group.visible = false;
    scene.add(group);
    const canvas = card.querySelector('canvas');
    return { card, canvas, ctx: canvas.getContext('2d'), group, update: builders[Math.min(i, 3)](T, k, group), eased: 0, on: false, state: { spin: 0, dt: 0 } };
  });

  function layout() {
    const r = items[0].canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 1.5), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (!w || !h) return;
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    items.forEach(it => { it.canvas.width = w; it.canvas.height = h; });
    camera.aspect = w / h;
    const far = Math.max(1, .88 / camera.aspect);
    camera.position.set(-3.4 * far, 4.4, 10.4 * far);
    camera.lookAt(.1, 1.45, 0);
    camera.updateProjectionMatrix();
  }

  function draw(it, t) {
    items.forEach(o => { o.group.visible = o === it; });
    it.update(it.eased, ball, t, it.state);
    renderer.render(scene, camera);
    it.ctx.clearRect(0, 0, it.canvas.width, it.canvas.height);
    it.ctx.drawImage(renderer.domElement, 0, 0);
  }

  const place = i => {
    const it = items[i], next = items[i + 1], vh = innerHeight;
    const stuck = parseFloat(getComputedStyle(it.card).top) || 0;
    if (!next) return clamp((vh - it.card.getBoundingClientRect().top) / Math.max(1, vh - stuck));
    const travel = vh - stuck + it.card.offsetHeight;
    return clamp((1 - (next.card.getBoundingClientRect().top - stuck) / travel) / EXIT);
  };

  layout();
  addEventListener('resize', () => { layout(); if (reduced) items.forEach(it => draw(it, 0)); });
  if (reduced) {
    items.forEach((it, i) => { it.eased = i === items.length - 1 ? .5 : .9; draw(it, 0); });
    return;
  }
  const seen = new IntersectionObserver(entries => entries.forEach(e => {
    items.find(it => it.card === e.target).on = e.isIntersecting;
  }));
  items.forEach(it => seen.observe(it.card));
  let last = performance.now();
  const frame = now => {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    items.forEach((it, i) => {
      if (!it.on) return;
      it.eased += (place(i) - it.eased) * (1 - Math.exp(-dt * 9));
      it.state.dt = dt;
      draw(it, now / 1000);
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if (section && canUse()) {
  const cards = [...section.querySelectorAll('.pc')];
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect();
    start(cards).catch(() => {});
  }, { rootMargin: '600px 0px' });
  near.observe(section);
}
