const section = document.querySelector('.process');
const canUse = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};
const EXIT = .72;
const clamp = n => Math.min(1, Math.max(0, n));

async function start(cards) {
  const [T, { RoomEnvironment }, { RoundedBoxGeometry }, { machines }] = await Promise.all([
    import('three'),
    import('three/addons/environments/RoomEnvironment.js'),
    import('three/addons/geometries/RoundedBoxGeometry.js'),
    import('./process-machines.js'),
  ]);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.environment = new T.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .7;
  const sun = new T.DirectionalLight('#fff6ec', 1.7);
  sun.position.set(-4, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -6;
  sun.shadow.camera.right = sun.shadow.camera.top = 6;
  sun.shadow.bias = -.0004;
  sun.shadow.normalBias = .02;
  scene.add(sun);
  const rim = new T.DirectionalLight('#dfe8ff', .7);
  rim.position.set(6, 3, -5);
  scene.add(rim);
  const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: .16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const { M, BALL_R, builders } = machines(T, RoundedBoxGeometry);
  const ball = new T.Mesh(new T.SphereGeometry(BALL_R, 40, 28), M.hot);
  ball.castShadow = true;
  scene.add(ball);
  const camera = new T.PerspectiveCamera(28, 1, .1, 60);

  const items = cards.map((card, i) => {
    const group = new T.Group();
    group.visible = false;
    scene.add(group);
    const canvas = card.querySelector('canvas');
    return { card, canvas, ctx: canvas.getContext('2d'), group, update: builders[Math.min(i, 3)](group), eased: 0, on: false, state: { spin: 0, dt: 0 } };
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
    camera.position.set(-3.4 * far, 4.6, 10.8 * far);
    camera.lookAt(.1, 1.6, 0);
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
    // The gantry eases towards its target, so it needs a few passes to settle.
    items.forEach((it, i) => {
      it.eased = i === items.length - 1 ? .5 : .9;
      for (let n = 0; n < 40; n++) it.update(it.eased, ball, 0, it.state);
      draw(it, 0);
    });
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
