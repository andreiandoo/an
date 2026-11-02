const ACCENT = '#ff4a1c';
const BALL_R = .18, IN_R = .21, OUT_R = .255, SEAT = -.07;
const clamp = n => Math.min(1, Math.max(0, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function machines(T, RoundedBox) {
  const physical = (color, options) => new T.MeshPhysicalMaterial({ color, roughness: .42, clearcoat: .4, clearcoatRoughness: .35, ...options });
  const M = {
    ceramic: physical('#f1efe9'),
    stone: physical('#cfccc4', { roughness: .62, clearcoat: .1 }),
    graphite: physical('#1d1d1f', { roughness: .36, clearcoat: .6 }),
    steel: new T.MeshStandardMaterial({ color: '#d4d6d8', metalness: 1, roughness: .26 }),
    hot: physical(ACCENT, { roughness: .3, clearcoat: .9 }),
    glass: physical('#101012', { roughness: .08, clearcoat: 1 }),
  };
  const glow = () => new T.MeshStandardMaterial({ color: '#3a3a3a', emissive: ACCENT, emissiveIntensity: 0, roughness: .3 });

  const mesh = (parent, geo, material, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (parent, w, h, d, material, x, y, z) => mesh(parent, new RoundedBox(w, h, d, 4, Math.min(w, h, d) * .24), material, x, y, z);
  const cyl = (parent, r, h, material, x, y, z, top = r) => mesh(parent, new T.CylinderGeometry(top, r, h, 48), material, x, y, z);
  const lathe = (parent, points, material, x = 0, y = 0, z = 0) => mesh(parent, new T.LatheGeometry(points.map(p => new T.Vector2(...p)), 72), material, x, y, z);
  const flatRing = (parent, r, tube, material, x, y, z) => {
    const m = mesh(parent, new T.TorusGeometry(r, tube, 16, 96), material, x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  function gear(parent, r, hole, teeth, depth, material, x = 0, y = 0, z = 0) {
    const shape = new T.Shape(), low = r * .93, step = Math.PI * 2 / (teeth * 4);
    for (let i = 0; i < teeth * 4; i++) {
      const rad = i % 4 === 1 || i % 4 === 2 ? r : low, a = i * step;
      if (i) shape.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); else shape.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    shape.closePath();
    if (hole) { const h = new T.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); shape.holes.push(h); }
    const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2, curveSegments: 48 });
    geo.translate(0, 0, -depth / 2);
    return mesh(parent, geo, material, x, y, z);
  }

  // Soft contact darkening under objects, cheaper and softer than the shadow map alone.
  const blobMap = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,.5)');
    g.addColorStop(.6, 'rgba(0,0,0,.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  })();
  const blob = (parent, w, d, x, z) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: blobMap, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, .004, z);
    parent.add(m);
  };

  // A U-shaped profile swept along a curve, so the ball sits in a real channel.
  const PROFILE = (() => {
    const out = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; out.push([Math.cos(a) * OUT_R, Math.sin(a) * OUT_R]); }
    for (let i = 12; i >= 0; i--) { const a = Math.PI + i / 12 * Math.PI; out.push([Math.cos(a) * IN_R, Math.sin(a) * IN_R]); }
    return out;
  })();
  function sweep(curve, steps, closed) {
    const pos = [], index = [], n = PROFILE.length, up = new T.Vector3(0, 1, 0), S = new T.Vector3(), U = new T.Vector3();
    for (let i = 0; i <= steps; i++) {
      const u = i / steps, P = curve.getPointAt(u), D = curve.getTangentAt(u);
      S.crossVectors(D, up).normalize();
      U.crossVectors(S, D);
      PROFILE.forEach(([s, v]) => pos.push(P.x + S.x * s + U.x * v, P.y + S.y * s + U.y * v, P.z + S.z * s + U.z * v));
      if (i === steps) break;
      for (let k = 0; k < n; k++) {
        const a = i * n + k, b = i * n + (k + 1) % n, c = a + n, d = b + n;
        index.push(a, b, d, a, d, c);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setIndex(index);
    geo.computeVertexNormals();
    return geo;
  }
  function support(parent, P) {
    const h = P.y - OUT_R;
    cyl(parent, .15, .04, M.steel, P.x, .02, P.z);
    cyl(parent, .032, h, M.steel, P.x, h / 2, P.z);
    cyl(parent, .07, .1, M.graphite, P.x, h - .06, P.z);
    blob(parent, .9, .7, P.x, P.z);
  }
  function channel(parent, points, posts = []) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    const m = mesh(parent, sweep(curve, 150), M.ceramic);
    m.material.side = T.DoubleSide;
    posts.forEach(u => support(parent, curve.getPointAt(u)));
    return (u, ball) => { const p = curve.getPointAt(clamp(u)); ball.position.set(p.x, p.y - SEAT, p.z); };
  }

  // The layers of a product. Each one reads as a different kind of part.
  function layers(parent, w, d) {
    const H = .28, parts = [];
    const add = () => { const g = new T.Group(); parent.add(g); parts.push(g); return g; };
    const base = add();
    box(base, w, H, d, M.graphite, 0, 0, 0);
    for (let x = 0; x < 6; x++) for (let z = 0; z < 4; z++) cyl(base, .035, .03, M.steel, (x - 2.5) * w * .15, H / 2 + .012, (z - 1.5) * d * .2);
    const slots = add();
    box(slots, w * .96, H, d * .96, M.ceramic, 0, 0, 0);
    [-.25, 0, .25].forEach(k => box(slots, w * .72, .05, .05, M.graphite, 0, H / 2 - .005, k * d));
    const fins = add();
    box(fins, w * .92, H * .7, d * .92, M.stone, 0, -H * .12, 0);
    for (let i = 0; i < 11; i++) box(fins, .035, H * .4, d * .78, M.steel, (i - 5) * w * .08, H * .28, 0);
    const keys = add();
    box(keys, w * .88, H, d * .88, M.ceramic, 0, 0, 0);
    for (let x = 0; x < 5; x++) for (let z = 0; z < 3; z++) box(keys, w * .13, .05, d * .17, x === 4 && z === 0 ? M.hot : M.stone, (x - 2) * w * .16, H / 2 + .012, (z - 1) * d * .23);
    const screen = add();
    box(screen, w * .84, H, d * .84, M.hot, 0, 0, 0);
    box(screen, w * .72, .04, d * .72, M.glass, 0, H / 2 - .005, 0);
    [.5, .3, .42].forEach((k, i) => box(screen, w * k, .012, .05, M.ceramic, -w * (.3 - k / 2), H / 2 + .022, (i - 1) * d * .18));
    return { parts, H };
  }

  // 1. The idea drops in and the dial settles on an answer.
  function intake(g) {
    const X = -1.05, A = -.32, leds = [glow(), glow(), glow()];
    blob(g, 4, 3.2, X, 0);
    lathe(g, [[0, 0], [1.18, 0], [1.21, .03], [1.21, .15], [1.17, .19], [.99, .19], [.97, .23], [.97, .34], [.9, .39], [0, .39]], M.stone, X);
    lathe(g, [[.8, .39], [.86, .6], [.89, 1.2], [.87, 1.8], [.79, 2.05], [.6, 2.2], [.3, 2.27], [0, 2.27]], M.ceramic, X);
    flatRing(g, .895, .024, M.steel, X, .78, 0);
    flatRing(g, .885, .024, M.steel, X, 1.78, 0);
    const hopper = lathe(g, [[.2, 2.2], [.22, 2.5], [.3, 2.64], [.95, 3.2], [1.03, 3.27], [1.01, 3.31], [.9, 3.25], [.26, 2.68], [.18, 2.5]], M.steel, X);
    hopper.material = M.steel.clone();
    hopper.material.side = T.DoubleSide;
    flatRing(g, 1.03, .04, M.graphite, X, 3.29, 0);

    const dial = new T.Group();
    dial.position.set(X + Math.sin(A) * .86, 1.28, Math.cos(A) * .86);
    dial.rotation.y = A;
    g.add(dial);
    mesh(dial, new T.TorusGeometry(.37, .045, 16, 64), M.steel, 0, 0, .03);
    const face = cyl(dial, .36, .04, M.ceramic, 0, 0, .02);
    face.rotation.x = Math.PI / 2;
    for (let i = 0; i < 13; i++) {
      const a = 2.3 - i / 12 * 3.46, tick = box(dial, .018, i % 3 ? .05 : .085, .012, i > 8 ? M.hot : M.graphite, Math.cos(a) * .27, Math.sin(a) * .27, .05);
      tick.rotation.z = a - Math.PI / 2;
    }
    const needle = new T.Group();
    needle.position.z = .07;
    dial.add(needle);
    box(needle, .026, .27, .012, M.hot, 0, .1, 0);
    const cap = cyl(dial, .04, .04, M.steel, 0, 0, .08);
    cap.rotation.x = Math.PI / 2;

    const bar = new T.Group();
    bar.position.set(X + Math.sin(A) * .89, .58, Math.cos(A) * .89);
    bar.rotation.y = A;
    g.add(bar);
    box(bar, .62, .14, .06, M.graphite, 0, 0, 0);
    leds.forEach((m, i) => mesh(bar, new T.SphereGeometry(.04, 20, 14), m, (i - 1) * .17, 0, .035));

    const spout = cyl(g, .33, .5, M.steel, -.22, 1.2, 0);
    spout.rotation.z = Math.PI / 2;
    const roll = channel(g, [[-.2, 1.25, 0], [.7, 1.17, 0], [1.7, 1, .05], [2.7, .84, 0], [3.9, .72, 0]], [.34, .68]);
    return (u, ball, t) => {
      const fall = clamp(u / .34);
      ball.visible = u < .34 || u > .44;
      if (u < .44) ball.position.set(X, 5.8 - 3.2 * fall * fall, 0);
      else roll((u - .44) / .56, ball);
      needle.rotation.z = 1.15 - smooth(.3, .55, u) * 2.05 + Math.sin(t * 7) * .02 * (1 - smooth(.5, .7, u));
      leds.forEach((m, i) => { m.emissiveIntensity = smooth(.36 + i * .05, .42 + i * .05, u) * 4; });
    };
  }

  // 2. A precision ring reads what passes through and a fixed ticket comes out.
  function scanner(g) {
    const roll = channel(g, [[-3.9, 2.65, 0], [-2, 2.24, 0], [0, 1.74, 0], [2, 1.28, 0], [3.9, 1.02, 0]], [.17, .82]);
    const light = glow();
    blob(g, 3, 2.4, 0, 0);
    lathe(g, [[0, 0], [.92, 0], [.95, .03], [.95, .13], [.9, .17], [.42, .24], [.36, .34], [.34, .55], [.3, .68], [0, .68]], M.stone);
    const head = new T.Group();
    head.position.set(0, 1.74, 0);
    head.rotation.y = .62;
    g.add(head);
    const big = gear(head, 1.14, .84, 40, .15, M.graphite);
    mesh(head, new T.TorusGeometry(.82, .055, 16, 96), M.steel, 0, 0, 0);
    const scale = new T.Group();
    head.add(scale);
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2, tick = box(scale, .03, i % 7 ? .09 : .14, .05, i % 7 ? M.steel : M.hot, Math.cos(a) * .7, Math.sin(a) * .7, 0);
      tick.rotation.z = a - Math.PI / 2;
    }
    mesh(head, new T.TorusGeometry(.6, .01, 10, 96), light, 0, 0, 0);
    const pinion = gear(head, .25, .05, 9, .17, M.steel, .86, -1.03, 0);
    const motor = cyl(head, .17, .36, M.ceramic, .86, -1.03, -.24);
    motor.rotation.x = Math.PI / 2;

    blob(g, 2.8, 1.9, 2, -1.1);
    const printer = new T.Group();
    printer.position.set(2, 0, -1.1);
    printer.rotation.y = -.22;
    g.add(printer);
    box(printer, 1.6, .74, .9, M.ceramic, 0, .37, 0);
    box(printer, 1.26, .04, .16, M.graphite, 0, .745, 0);
    cyl(printer, .05, .03, M.hot, .62, .75, .3);
    const ticket = box(printer, 1.02, 1.3, .035, M.ceramic, 0, 0, 0);
    box(ticket, .34, .34, .02, M.hot, -.27, .4, .022);
    [[.2, .18, .28], [.08, .3, .18], [-.2, .76, 0], [-.32, .76, 0], [-.44, .5, -.13]].forEach(([y, w, x]) => box(ticket, w, .035, .012, M.graphite, x, y, .022));
    return (u, ball, t) => {
      roll(u, ball);
      big.rotation.z = t * .18 + u * 2;
      pinion.rotation.z = -(t * .18 + u * 2) * 40 / 9;
      scale.rotation.z = -t * .3 - u * 3;
      light.emissiveIntensity = smooth(.34, .46, u) * (1 - smooth(.54, .66, u)) * 8;
      ticket.position.y = .1 + smooth(.5, .86, u) * 1.28;
    };
  }

  // 3. A gantry sets each layer down in order.
  function gantry(g) {
    const Z = -.8;
    blob(g, 5, 3.6, 0, Z);
    box(g, 3.5, .22, 2.5, M.ceramic, 0, .11, Z);
    box(g, 2.7, .04, 1.9, M.stone, 0, .225, Z);
    [-1.6, 1.6].forEach(x => {
      cyl(g, .07, 3.9, M.steel, x, 2.15, Z);
      cyl(g, .13, .16, M.graphite, x, .3, Z);
    });
    box(g, 3.75, .15, .26, M.graphite, 0, 4.12, Z);
    const carriage = new T.Group();
    carriage.position.set(1.3, 4, Z);
    g.add(carriage);
    box(carriage, .54, .24, .42, M.ceramic, 0, 0, 0);
    const cable = cyl(carriage, .012, 1, M.steel, 0, -.5, 0);
    const hook = new T.Group();
    carriage.add(hook);
    box(hook, .8, .08, .14, M.graphite, 0, 0, 0);
    [-.36, .36].forEach(x => box(hook, .05, .22, .1, M.steel, x, -.12, 0));
    const { parts, H } = layers(g, 2.2, 1.6);
    parts.forEach(p => { p.position.z = Z; });
    const roll = channel(g, [[-3.9, 2.25, .5], [-2.5, 1.5, .85], [-1, .84, 1.05], [.8, .56, 1.1], [2.3, .46, .9], [3.9, .36, .7]], [.24, .45, .68]);
    const place = (u, ball) => {
      roll(u, ball);
      let hx = 1.3, hy = 3.4;
      parts.forEach((p, i) => {
        const q = clamp((u - (.08 + i * .15)) / .15), slide = smooth(0, .4, q), drop = smooth(.4, 1, q);
        const rest = .39 + i * (H + .03), x = 1.3 * (1 - slide), y = 3.3 + (rest - 3.3) * drop;
        p.visible = q > 0;
        p.position.x = x;
        p.position.y = y;
        if (q > 0 && q < 1) { hx = x; hy = y + .32; }
      });
      carriage.position.x += (hx - carriage.position.x) * .22;
      const hookY = hy - 4;
      hook.position.y += (hookY - hook.position.y) * .22;
      cable.scale.y = Math.max(.02, -hook.position.y);
      cable.position.y = hook.position.y / 2;
    };
    return place;
  }

  // 4. The finished product turns while the ball keeps circling it.
  function orbit(g) {
    const R = 1.78, Y = .92, START = Math.PI * .62, beacon = glow();
    blob(g, 5.4, 4.6, 0, 0);
    lathe(g, [[0, 0], [1.28, 0], [1.31, .03], [1.31, .14], [1.27, .18], [0, .18]], M.stone);
    const table = new T.Group();
    table.position.y = .18;
    g.add(table);
    const rim = gear(table, 1.2, 0, 44, .1, M.steel, 0, .06, 0);
    rim.rotation.x = Math.PI / 2;
    const { parts, H } = layers(table, 1.55, 1.55);
    parts.forEach((p, i) => { p.position.y = .26 + i * (H + .03); });
    const top = .26 + 5 * (H + .03);
    cyl(table, .03, .5, M.steel, -.28, top + .2, -.28);
    mesh(table, new T.SphereGeometry(.08, 24, 16), beacon, -.28, top + .49, -.28);
    flatRing(table, .13, .012, M.steel, -.28, top + .42, -.28);

    const ring = new T.CatmullRomCurve3(Array.from({ length: 64 }, (_, i) => {
      const a = i / 64 * Math.PI * 2;
      return new T.Vector3(Math.cos(a) * R, Y, Math.sin(a) * R);
    }), true);
    mesh(g, sweep(ring, 220), M.ceramic);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .25; support(g, new T.Vector3(Math.cos(a) * R, Y, Math.sin(a) * R)); }
    const enter = [Math.cos(START) * R, Y, Math.sin(START) * R];
    const roll = channel(g, [[-3.9, 2.35, .55], [-2.9, 1.66, .95], [-1.9, 1.16, 1.32], enter], [.42]);
    return (u, ball, t, state) => {
      if (u < .6) { state.spin = 0; roll(u / .6, ball); } else {
        state.spin += state.dt * 1.5;
        const a = START - state.spin;
        ball.position.set(Math.cos(a) * R, Y - SEAT, Math.sin(a) * R);
      }
      table.rotation.y = t * .14;
      beacon.emissiveIntensity = 2 + Math.sin(t * 3) * 1.6;
    };
  }

  return { M, BALL_R, builders: [intake, scanner, gantry, orbit] };
}
