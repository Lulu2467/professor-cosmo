(function () {
  // Featured card: 4 soft spiral arms + diffused dust, ~1/3 side view
  const field = document.querySelector(".featured-card .orbit-field.galaxy");
  if (!field) return;

  const canvas = field.querySelector(".galaxy-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0;
  let scale = 1, rot = 0;
  // ~1/3 side view — clear elliptical depth
  const tilt = 0.92;
  let raf = 0;
  const stars = [];

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

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
    cy = H * 0.52;
    scale = Math.min(W, H) / 310;
    makeStars();
  }

  function makeStars() {
    stars.length = 0;
    const armCount = 4;
    const base = Math.min(W, H);
    const armStars = Math.round(Math.min(7500, Math.max(4000, base * 18)));
    // Much more diffuse mist / scatter around arms
    const mistStars = Math.round(armStars * 1.8);
    const sprayStars = Math.round(armStars * 1.1);
    const haloStars = Math.round(armStars * 0.85);
    const coreStars = Math.round(armStars * 0.07);

    // Four spiral arm spines — soft width, not hard thin lines
    for (let i = 0; i < armStars; i++) {
      const arm = (Math.random() * armCount) | 0;
      const u = 0.1 + Math.pow(Math.random(), 0.72) * 0.9;
      const r = u * 150;
      const wind = r * 0.018;
      const sigma = 4.2 + r * 0.055;
      const offset = gauss() * sigma;
      const a = arm * (Math.PI / 2) + wind + offset * 0.0035;
      const x = Math.cos(a) * r + Math.cos(a + Math.PI / 2) * offset;
      const y = Math.sin(a) * r + Math.sin(a + Math.PI / 2) * offset;
      const z = gauss() * (2.8 + r * 0.014);
      const dist = Math.abs(offset) / sigma;
      const tip = Math.pow(u, 1.05);
      const alpha = Math.max(0.05, (0.7 - dist * 0.45) * (1.05 - tip * 0.48));
      const q = Math.random();
      stars.push({
        x, y, z,
        r: dist < 0.5 ? 0.4 + Math.random() * 0.8 : 0.2 + Math.random() * 0.45,
        a: alpha,
        kind: q < 0.12 ? 2 : q < 0.5 ? 1 : 0
      });
    }

    // Soft mist hugging arms (wider feather)
    for (let i = 0; i < mistStars; i++) {
      const arm = (Math.random() * armCount) | 0;
      const u = Math.pow(Math.random(), 0.65);
      const r = 6 + u * 165;
      const wind = r * 0.018;
      const offset = gauss() * (14 + r * 0.14);
      const a = arm * (Math.PI / 2) + wind + (Math.random() - 0.5) * 0.7;
      stars.push({
        x: Math.cos(a) * r + Math.cos(a + Math.PI / 2) * offset,
        y: Math.sin(a) * r + Math.sin(a + Math.PI / 2) * offset,
        z: gauss() * (4 + r * 0.022),
        r: 0.1 + Math.random() * 0.32,
        a: 0.035 + Math.random() * 0.16,
        kind: Math.random() < 0.22 ? 1 : 0
      });
    }

    // Fine spray filling inter-arm voids
    for (let i = 0; i < sprayStars; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 12 + Math.pow(Math.random(), 0.55) * 155;
      const jitter = gauss() * (18 + r * 0.08);
      stars.push({
        x: Math.cos(a) * r + Math.cos(a + Math.PI / 2) * jitter,
        y: Math.sin(a) * r + Math.sin(a + Math.PI / 2) * jitter,
        z: gauss() * (5 + r * 0.025),
        r: 0.08 + Math.random() * 0.28,
        a: 0.025 + Math.random() * 0.12,
        kind: Math.random() < 0.15 ? 1 : 0
      });
    }

    // Compact bright core
    for (let i = 0; i < coreStars; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.abs(gauss()) * 13;
      stars.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        z: gauss() * 3,
        r: 0.35 + Math.random() * 0.9,
        a: 0.4 + Math.random() * 0.45,
        kind: Math.random() < 0.6 ? 2 : 1
      });
    }

    // Far field stardust
    for (let i = 0; i < haloStars; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.pow(Math.random(), 0.45) * 195;
      stars.push({
        x: Math.cos(a) * r + gauss() * 36,
        y: Math.sin(a) * r + gauss() * 36,
        z: gauss() * 42,
        r: 0.08 + Math.random() * 0.36,
        a: 0.03 + Math.random() * 0.13,
        kind: Math.random() < 0.1 ? 2 : 0
      });
    }
  }

  function project(x, y, z) {
    const cyy = Math.cos(tilt);
    const sy = Math.sin(tilt);
    const yy = y * cyy - z * sy;
    const zz = y * sy + z * cyy;
    return [cx + x * scale, cy + yy * scale, zz];
  }

  function colorFor(kind, alpha) {
    if (kind === 2) return `rgba(255,252,248,${alpha})`;
    if (kind === 1) return `rgba(220,234,255,${alpha})`;
    return `rgba(155,190,230,${alpha})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.6);
    wash.addColorStop(0, "rgba(45, 75, 115, .07)");
    wash.addColorStop(0.5, "rgba(20, 40, 70, .02)");
    wash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    // Soft elliptical disk haze matching 1/3 side view
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.06);
    ctx.scale(1, Math.max(0.32, Math.cos(tilt) * 0.92 + 0.12));
    const haze = ctx.createRadialGradient(0, 0, 6 * scale, 0, 0, 145 * scale);
    haze.addColorStop(0, "rgba(170,200,245,.07)");
    haze.addColorStop(0.4, "rgba(90,130,185,.03)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(0, 0, 145 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const spin = rot;
    const arr = new Array(stars.length);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const x = s.x * Math.cos(spin) - s.y * Math.sin(spin);
      const y = s.x * Math.sin(spin) + s.y * Math.cos(spin);
      arr[i] = { s, p: project(x, y, s.z) };
    }
    arr.sort((a, b) => a.p[2] - b.p[2]);

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < arr.length; i++) {
      const s = arr[i].s;
      const p = arr[i].p;
      if (p[0] < -5 || p[0] > W + 5 || p[1] < -5 || p[1] > H + 5) continue;
      const far = Math.min(1, Math.abs(p[2]) / 48);
      const radius = s.r * Math.max(0.42, scale * 0.88);
      const alpha = s.a * (0.72 - 0.28 * far);
      ctx.fillStyle = colorFor(s.kind, alpha);
      ctx.beginPath();
      ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * scale);
    core.addColorStop(0, "rgba(255,255,255,.95)");
    core.addColorStop(0.14, "rgba(255,248,230,.55)");
    core.addColorStop(0.4, "rgba(190,215,255,.14)");
    core.addColorStop(1, "rgba(100,140,190,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8 * Math.max(0.7, scale), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function loop() {
    if (!reduce) rot += 0.00045;
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  draw();
  raf = requestAnimationFrame(loop);

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      draw();
      raf = requestAnimationFrame(loop);
    }, 120);
  });
})();
