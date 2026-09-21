/* Home hero: ink stippled orbital sphere (idle focal on the right) */
(() => {
  const mount = document.querySelector("[data-hero-globe]");
  if (!mount) return;

  let canvas = mount.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    mount.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let DPR = 1;
  let cx = 0;
  let cy = 0;
  let S = 1;
  let rot = 0;
  let tiltX = 0;
  let tiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let points = [];
  let glows = [];
  let raf = 0;

  function resize() {
    const rect = mount.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W * 0.52;
    cy = H * 0.5;
    S = Math.min(W, H) * 0.46;
    build();
  }

  function pushOnEllipse(out, opts) {
    const {
      rx,
      ry,
      roll = 0,
      pitch = 0,
      yaw = 0,
      count,
      sizeMin,
      sizeMax,
      alphaMin,
      alphaMax,
      jitter = 0.012,
    } = opts;
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cyw = Math.cos(yaw);
    const syw = Math.sin(yaw);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 + Math.random() * 0.02;
      let x = Math.cos(t) * rx;
      let y = Math.sin(t) * ry;
      let z = 0;
      let x1 = x * cr - y * sr;
      let y1 = x * sr + y * cr;
      let z1 = z;
      let y2 = y1 * cp - z1 * sp;
      let z2 = y1 * sp + z1 * cp;
      let x2 = x1;
      let x3 = x2 * cyw + z2 * syw;
      let z3 = -x2 * syw + z2 * cyw;
      let y3 = y2;
      x3 += (Math.random() - 0.5) * jitter * S;
      y3 += (Math.random() - 0.5) * jitter * S;
      z3 += (Math.random() - 0.5) * jitter * S * 0.6;
      out.push({
        x: x3,
        y: y3,
        z: z3,
        r: sizeMin + Math.random() * (sizeMax - sizeMin),
        a: alphaMin + Math.random() * (alphaMax - alphaMin),
      });
    }
  }

  function build() {
    points = [];
    glows = [];

    const rings = [0.18, 0.32, 0.46, 0.62, 0.78, 0.94];
    rings.forEach((f, i) => {
      pushOnEllipse(points, {
        rx: S * f,
        ry: S * f * 0.34,
        pitch: 1.05,
        yaw: -0.08,
        count: Math.round(36 + f * 80),
        sizeMin: 0.4,
        sizeMax: 1.25,
        alphaMin: 0.28,
        alphaMax: 0.78,
        jitter: 0.01 + i * 0.002,
      });
    });

    for (let i = 0; i < 720; i++) {
      const u = Math.pow(Math.random(), 0.7);
      const r = u * S * 0.92;
      const a = u * 4.2 + Math.random() * 0.4;
      const spread = (Math.random() - 0.5) * S * 0.04;
      let x = Math.cos(a) * r + Math.cos(a + Math.PI / 2) * spread;
      let y = Math.sin(a) * r * 0.34 + Math.sin(a + Math.PI / 2) * spread * 0.5;
      let z = (Math.random() - 0.5) * S * 0.03;
      const cp = Math.cos(1.05);
      const sp = Math.sin(1.05);
      const yt = y * cp - z * sp;
      const zt = y * sp + z * cp;
      points.push({
        x,
        y: yt,
        z: zt,
        r: 0.32 + Math.random() * 0.75,
        a: 0.14 + (1 - u) * 0.4,
      });
    }

    const meridians = 7;
    for (let m = 0; m < meridians; m++) {
      const yaw = (m / meridians) * Math.PI;
      const dashed = m % 3 === 1;
      pushOnEllipse(points, {
        rx: S * (0.88 + (m % 2) * 0.06),
        ry: S * (0.96 + (m % 2) * 0.04),
        roll: 0,
        pitch: Math.PI / 2,
        yaw,
        count: dashed ? 64 : 100,
        sizeMin: dashed ? 0.45 : 0.38,
        sizeMax: dashed ? 1.1 : 0.95,
        alphaMin: dashed ? 0.22 : 0.26,
        alphaMax: dashed ? 0.62 : 0.72,
        jitter: 0.008,
      });
    }

    const extras = [
      { pitch: 0.55, yaw: 0.4, rx: 0.9, ry: 0.55, dashed: true },
      { pitch: 1.35, yaw: -0.55, rx: 0.78, ry: 0.7, dashed: false },
      { pitch: 0.35, yaw: 1.1, rx: 0.7, ry: 0.95, dashed: true },
    ];
    extras.forEach((e) => {
      pushOnEllipse(points, {
        rx: S * e.rx,
        ry: S * e.ry,
        pitch: e.pitch,
        yaw: e.yaw,
        count: e.dashed ? 58 : 88,
        sizeMin: 0.38,
        sizeMax: 1.05,
        alphaMin: 0.22,
        alphaMax: 0.68,
        jitter: 0.01,
      });
    });

    for (let i = 0; i < 360; i++) {
      const u = Math.random();
      const v = Math.random();
      const th = 2 * Math.PI * u;
      const ph = Math.acos(2 * v - 1);
      const rr = S * (0.55 + Math.random() * 0.55);
      points.push({
        x: rr * Math.sin(ph) * Math.cos(th),
        y: rr * Math.cos(ph),
        z: rr * Math.sin(ph) * Math.sin(th),
        r: 0.28 + Math.random() * 0.7,
        a: 0.08 + Math.random() * 0.22,
      });
    }

    [0.2, 1.4, 2.5, 3.9, 5.1].forEach((t, i) => {
      glows.push({
        t,
        r: S * (0.42 + (i % 3) * 0.16),
        size: 2 + (i % 2) * 2.4,
        speed: 0.16 + i * 0.035,
      });
    });
  }

  function project(x, y, z) {
    // gentle pointer tilt
    const tx = tiltX * 0.35;
    const ty = tiltY * 0.28;
    let y1 = y * Math.cos(ty) - z * Math.sin(ty);
    let z1 = y * Math.sin(ty) + z * Math.cos(ty);
    let x1 = x;
    let x2 = x1 * Math.cos(tx) + z1 * Math.sin(tx);
    let z2 = -x1 * Math.sin(tx) + z1 * Math.cos(tx);
    let y2 = y1;

    const a = rot;
    const xr = x2 * Math.cos(a) - z2 * Math.sin(a);
    const zr = x2 * Math.sin(a) + z2 * Math.cos(a);
    return [cx + xr, cy + y2, zr];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    tiltX += (targetTiltX - tiltX) * 0.06;
    tiltY += (targetTiltY - tiltY) * 0.06;

    const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 1.4);
    wash.addColorStop(0, "rgba(16, 35, 61, 0.1)");
    wash.addColorStop(0.45, "rgba(16, 35, 61, 0.04)");
    wash.addColorStop(1, "rgba(16, 35, 61, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    const sorted = points
      .map((p) => ({ p, q: project(p.x, p.y, p.z) }))
      .sort((a, b) => a.q[2] - b.q[2]);

    for (let i = 0; i < sorted.length; i++) {
      const { p, q } = sorted[i];
      if (q[0] < -4 || q[0] > W + 4 || q[1] < -4 || q[1] > H + 4) continue;
      const depth = Math.min(1, Math.max(0, (q[2] / S + 1) * 0.5));
      const alpha = p.a * (0.6 + depth * 0.5);
      ctx.fillStyle = `rgba(10, 10, 10, ${Math.min(0.9, alpha)})`;
      ctx.beginPath();
      ctx.arc(q[0], q[1], p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.2);
    core.addColorStop(0, "rgba(250, 250, 250, 0.95)");
    core.addColorStop(0.3, "rgba(250, 250, 250, 0.35)");
    core.addColorStop(0.7, "rgba(16, 35, 61, 0.05)");
    core.addColorStop(1, "rgba(16, 35, 61, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(10, 10, 10, 0.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
    ctx.fill();

    glows.forEach((g) => {
      const t = g.t + rot * g.speed;
      let x = Math.cos(t) * g.r;
      let y = Math.sin(t) * g.r * 0.34;
      let z = 0;
      const cp = Math.cos(1.05);
      const sp = Math.sin(1.05);
      const yt = y * cp - z * sp;
      const zt = y * sp + z * cp;
      const q = project(x, yt, zt);
      const grd = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], g.size * 3);
      grd.addColorStop(0, "rgba(10, 10, 10, 0.55)");
      grd.addColorStop(0.4, "rgba(16, 35, 61, 0.18)");
      grd.addColorStop(1, "rgba(16, 35, 61, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(q[0], q[1], g.size * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    if (!reduce) rot += 0.002;
    draw();
    raf = requestAnimationFrame(loop);
  }

  function onMove(e) {
    const rect = mount.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetTiltX = Math.max(-0.55, Math.min(0.55, nx * 0.9));
    targetTiltY = Math.max(-0.45, Math.min(0.45, -ny * 0.75));
  }
  function onLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
  }

  mount.addEventListener("pointermove", onMove);
  mount.addEventListener("pointerleave", onLeave);

  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    resize();
    draw();
    raf = requestAnimationFrame(loop);
  });
  ro.observe(mount);

  resize();
  draw();
  raf = requestAnimationFrame(loop);
})();
