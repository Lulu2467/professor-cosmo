(function () {
  // Teaching course panel: stippled orbital sphere
  // References: horizontal particle disk + vertical elliptical meridians (poles meet)
  const field = document.querySelector(".course-orbit");
  if (!field) return;

  let canvas = field.querySelector(".orbit-sphere");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "orbit-sphere";
    canvas.setAttribute("aria-hidden", "true");
    field.innerHTML = "";
    field.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, S = 1;
  let rot = 0;
  let points = [];
  let glows = [];
  let raf = 0;

  function resize() {
    const rect = field.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W * 0.5;
    cy = H * 0.48;
    S = Math.min(W, H) * 0.42;
    build();
  }

  function pushOnEllipse(out, opts) {
    const {
      rx, ry, roll = 0, pitch = 0, yaw = 0,
      count, sizeMin, sizeMax, alphaMin, alphaMax, jitter = 0.012
    } = opts;
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cyw = Math.cos(yaw), syw = Math.sin(yaw);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 + Math.random() * 0.02;
      let x = Math.cos(t) * rx;
      let y = Math.sin(t) * ry;
      let z = 0;
      // roll around Z, then pitch around X, then yaw around Y
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
        x: x3, y: y3, z: z3,
        r: sizeMin + Math.random() * (sizeMax - sizeMin),
        a: alphaMin + Math.random() * (alphaMax - alphaMin)
      });
    }
  }

  function build() {
    points = [];
    glows = [];

    // Horizontal disk: concentric flattened ellipses (ref image 2/3)
    const rings = [0.18, 0.32, 0.46, 0.62, 0.78, 0.94];
    rings.forEach((f, i) => {
      pushOnEllipse(points, {
        rx: S * f,
        ry: S * f * 0.34,
        pitch: 1.05,
        yaw: -0.08,
        count: Math.round(40 + f * 90),
        sizeMin: 0.35,
        sizeMax: 1.1,
        alphaMin: 0.22,
        alphaMax: 0.72,
        jitter: 0.01 + i * 0.002
      });
    });

    // Soft spiral arm fill on the disk
    for (let i = 0; i < 900; i++) {
      const u = Math.pow(Math.random(), 0.7);
      const r = u * S * 0.92;
      const a = u * 4.2 + Math.random() * 0.4;
      const spread = (Math.random() - 0.5) * S * 0.04;
      let x = Math.cos(a) * r + Math.cos(a + Math.PI / 2) * spread;
      let y = Math.sin(a) * r * 0.34 + Math.sin(a + Math.PI / 2) * spread * 0.5;
      let z = (Math.random() - 0.5) * S * 0.03;
      // tilt disk
      const cp = Math.cos(1.05), sp = Math.sin(1.05);
      const yt = y * cp - z * sp;
      const zt = y * sp + z * cp;
      points.push({
        x, y: yt, z: zt,
        r: 0.3 + Math.random() * 0.7,
        a: 0.12 + (1 - u) * 0.35
      });
    }

    // Vertical / longitudinal ellipses meeting at poles (ref image 2)
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
        count: dashed ? 70 : 110,
        sizeMin: dashed ? 0.45 : 0.35,
        sizeMax: dashed ? 1.0 : 0.85,
        alphaMin: dashed ? 0.18 : 0.2,
        alphaMax: dashed ? 0.55 : 0.62,
        jitter: 0.008
      });
    }

    // A few mid-tilt staggered ellipses (ref image 4 mix)
    const extras = [
      { pitch: 0.55, yaw: 0.4, rx: 0.9, ry: 0.55, dashed: true },
      { pitch: 1.35, yaw: -0.55, rx: 0.78, ry: 0.7, dashed: false },
      { pitch: 0.35, yaw: 1.1, rx: 0.7, ry: 0.95, dashed: true }
    ];
    extras.forEach((e) => {
      pushOnEllipse(points, {
        rx: S * e.rx,
        ry: S * e.ry,
        pitch: e.pitch,
        yaw: e.yaw,
        count: e.dashed ? 64 : 96,
        sizeMin: 0.35,
        sizeMax: 0.95,
        alphaMin: 0.2,
        alphaMax: 0.65,
        jitter: 0.01
      });
    });

    // Sparse spherical halo
    for (let i = 0; i < 420; i++) {
      const u = Math.random();
      const v = Math.random();
      const th = 2 * Math.PI * u;
      const ph = Math.acos(2 * v - 1);
      const rr = S * (0.55 + Math.random() * 0.55);
      points.push({
        x: rr * Math.sin(ph) * Math.cos(th),
        y: rr * Math.cos(ph),
        z: rr * Math.sin(ph) * Math.sin(th),
        r: 0.25 + Math.random() * 0.7,
        a: 0.06 + Math.random() * 0.18
      });
    }

    // Bright orbiting glow nodes
    const glowAngles = [0.2, 1.4, 2.5, 3.9, 5.1];
    glowAngles.forEach((t, i) => {
      const r = S * (0.42 + (i % 3) * 0.16);
      glows.push({
        t,
        r,
        pitch: 1.05,
        size: 2.2 + (i % 2) * 2.8,
        speed: 0.18 + i * 0.04
      });
    });
  }

  function project(x, y, z) {
    const a = rot;
    const xr = x * Math.cos(a) - z * Math.sin(a);
    const zr = x * Math.sin(a) + z * Math.cos(a);
    return [cx + xr, cy + y, zr];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 1.35);
    wash.addColorStop(0, "rgba(140,180,210,.14)");
    wash.addColorStop(0.45, "rgba(60,100,140,.05)");
    wash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    const sorted = points.map((p) => {
      const q = project(p.x, p.y, p.z);
      return { p, q };
    }).sort((a, b) => a.q[2] - b.q[2]);

    for (let i = 0; i < sorted.length; i++) {
      const { p, q } = sorted[i];
      if (q[0] < -4 || q[0] > W + 4 || q[1] < -4 || q[1] > H + 4) continue;
      const depth = Math.min(1, Math.max(0, (q[2] / S + 1) * 0.5));
      const alpha = p.a * (0.45 + depth * 0.55);
      ctx.fillStyle = `rgba(230,242,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(q[0], q[1], p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core bloom
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.22);
    core.addColorStop(0, "rgba(255,255,255,.95)");
    core.addColorStop(0.25, "rgba(220,236,252,.45)");
    core.addColorStop(0.6, "rgba(150,190,220,.1)");
    core.addColorStop(1, "rgba(100,150,200,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(200,230,255,.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Moving glow sparks on disk
    glows.forEach((g) => {
      const t = g.t + rot * g.speed;
      let x = Math.cos(t) * g.r;
      let y = Math.sin(t) * g.r * 0.34;
      let z = 0;
      const cp = Math.cos(1.05), sp = Math.sin(1.05);
      const yt = y * cp - z * sp;
      const zt = y * sp + z * cp;
      const q = project(x, yt, zt);
      const grd = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], g.size * 3.2);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.35, "rgba(210,230,255,.55)");
      grd.addColorStop(1, "rgba(160,200,240,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(q[0], q[1], g.size * 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    if (!reduce) rot += 0.0022;
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  draw();
  raf = requestAnimationFrame(loop);

  let timer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      draw();
      raf = requestAnimationFrame(loop);
    }, 120);
  });
})();
