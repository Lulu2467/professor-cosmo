/* Research Focus — atom63/halftone-animation inspired canvas field + term hubs
   Reference: https://github.com/atom63/halftone-animation */
(() => {
  const stage = document.querySelector("[data-nebula]");
  if (!stage) return;

  const canvas = stage.querySelector("canvas");
  const cloud = stage.querySelector("[data-nebula-words]");
  if (!canvas || !cloud) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // --- atom63-like constants (ink / Viscose palette) ---
  const SPACING = 7;
  const DOT_MIN = 0.25;
  const DOT_MAX = 2.15;
  const R_INNER = 0.3;
  const R_RING1 = 0.46;
  const R_RING1_W = 0.032;
  const R_RING2 = 0.72;
  const R_RING2_W = 0.026;
  const CORE_BREATHE = 0.045;
  const CORE_FREQ = 14;
  const CORE_SPEED = 0.55;
  const ENTRY_MS = 2800;
  const WAVE_BAND = 0.1;
  const WAVE_SIGMA = 0.032;
  const CURSOR_SIGMA = 0.055;
  const RIPPLE_SPEED = 0.32;
  const RIPPLE_LIFE = 1.35;

  const TERMS = [
    { t: "Heavy-ion collisions", w: 5 },
    { t: "Jet quenching", w: 5 },
    { t: "Quark-gluon plasma", w: 4 },
    { t: "Experimental Particle Physics", w: 4 },
    { t: "Machine Learning for HEP", w: 4 },
    { t: "RHIC", w: 3 },
    { t: "sPHENIX", w: 3 },
    { t: "Nuclear Physics", w: 3 },
    { t: "LHC", w: 3 },
    { t: "Collectivity", w: 3 },
    { t: "QGP probes", w: 2 },
    { t: "Data Analysis", w: 2 },
    { t: "CMS", w: 2 },
    { t: "Triggers", w: 2 },
  ];

  const HUB_POS = [
    [0.5, 0.54], [0.26, 0.36], [0.74, 0.36], [0.14, 0.6], [0.86, 0.6],
    [0.5, 0.26], [0.66, 0.78], [0.32, 0.8], [0.08, 0.44], [0.92, 0.46],
    [0.6, 0.64], [0.36, 0.46], [0.72, 0.22], [0.24, 0.2],
  ];

  let w = 0;
  let h = 0;
  let dots = [];
  let cells = [];
  let hubs = [];
  let ripples = [];
  let raf = 0;
  let start = 0;
  let cx = 0.5;
  let cy = 0.5;
  let pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: false, last: 0 };
  let hubsReady = false;
  let resizing = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }
  function smoothstep(a, b, x) {
    const t = clamp01((x - a) / (b - a || 1));
    return t * t * (3 - 2 * t);
  }
  function noiseVal(x, y, t) {
    const wx = x + 0.32 * Math.sin(y * 3.1 + t * 0.38);
    const wy = y + 0.32 * Math.cos(x * 2.7 - t * 0.3);
    return (
      Math.sin(wx * 6.8 + t * 0.75) * 0.28 +
      Math.sin(wy * 5.0 - t * 0.62) * 0.25 +
      Math.sin((wx + wy) * 3.8 + t * 0.52) * 0.22 +
      Math.sin(Math.sqrt(wx * wx + wy * wy) * 8.5 - t * 1.05) * 0.25
    );
  }

  function resize() {
    if (resizing) return;
    resizing = true;
    const rect = stage.getBoundingClientRect();
    const nextW = Math.max(1, Math.round(rect.width));
    const nextH = Math.max(1, Math.round(rect.height));
    if (nextW === w && nextH === h && canvas.width) {
      resizing = false;
      return;
    }
    w = nextW;
    h = nextH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
    buildCells();
    if (!hubsReady) {
      buildHubs();
      hubsReady = true;
    }
    resizing = false;
  }

  function buildDots() {
    const cols = Math.max(20, Math.round(w / SPACING));
    const rows = Math.max(16, Math.round(h / SPACING));
    const next = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nx = (x + 0.5) / cols;
        const ny = (y + 0.5) / rows;
        const dx = nx - cx;
        const dy = (ny - cy) * (h / w);
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        next.push({ nx, ny, dist, angle, x: x / cols, y: y / rows });
      }
    }
    dots = next;
  }

  function buildCells() {
    // Infalling Gaussian blobs (atom63 CELL_COUNT style)
    cells = Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
      return {
        angle,
        startR: 0.64 + Math.random() * 0.1,
        sigma: 0.024 * (0.75 + Math.random() * 0.4),
        progress: Math.random() * 0.35,
        speed: 0.0016 + Math.random() * 0.0012,
        amp: 0.55 + Math.random() * 0.45,
      };
    });
  }

  function buildHubs() {
    cloud.innerHTML = "";
    hubs = TERMS.map((term, i) => {
      const [nx, ny] = HUB_POS[i] || [0.5, 0.5];
      const el = document.createElement("button");
      el.type = "button";
      el.className = `nebula-word s${term.w}`;
      el.textContent = term.t;
      el.setAttribute("role", "listitem");
      el.setAttribute("aria-label", term.t);
      cloud.appendChild(el);
      return {
        el,
        nx,
        ny,
        weight: term.w,
        phase: i * 0.65,
        ox: (i % 2 === 0 ? 1 : -1) * (8 + term.w),
        oy: -12 - term.w * 1.5,
      };
    });
  }

  function cellField(nx, ny) {
    let v = 0;
    for (const c of cells) {
      const r = c.startR * (1 - c.progress);
      const cxn = cx + Math.cos(c.angle) * r;
      const cyn = cy + Math.sin(c.angle) * r * (w / h);
      const dx = nx - cxn;
      const dy = ny - cyn;
      v += Math.exp(-(dx * dx + dy * dy) / (2 * c.sigma * c.sigma)) * c.amp * c.progress;
    }
    return v;
  }

  function structureAmp(nx, ny, dist, t) {
    const breathe = 1 + CORE_BREATHE * Math.sin(t * 1.1) * Math.cos(t * 0.7);
    const rInner = R_INNER * breathe;
    if (dist < rInner) {
      const n = noiseVal(nx * CORE_FREQ, ny * CORE_FREQ, t * CORE_SPEED);
      return clamp01(0.55 + n * 0.55);
    }
    if (dist > R_RING1 - R_RING1_W && dist < R_RING1) {
      const edge = 1 - Math.abs(dist - (R_RING1 - R_RING1_W / 2)) / (R_RING1_W / 2);
      return clamp01(edge * 0.85);
    }
    if (dist > R_RING2 - R_RING2_W && dist < R_RING2) {
      const edge = 1 - Math.abs(dist - (R_RING2 - R_RING2_W / 2)) / (R_RING2_W / 2);
      return clamp01(edge * 0.55);
    }
    return 0;
  }

  function entryWave(dist, entry) {
    if (entry >= 1) return { gate: 1, wave: 0 };
    const radius = easeOutCubic(entry) * 0.95;
    const fill = 1 - smoothstep(radius - WAVE_BAND * 0.35, radius + WAVE_BAND * 0.12, dist);
    const band = Math.exp(-Math.pow((dist - radius) / WAVE_SIGMA, 2)) * 1.15;
    const lag = Math.exp(-Math.pow((dist - Math.max(0, radius - 0.12)) / (WAVE_SIGMA * 1.5), 2)) * 0.45;
    return {
      gate: clamp01(fill * 0.92 + band * 0.35),
      wave: clamp01(band + lag),
    };
  }

  function cursorAmp(nx, ny) {
    if (!pointer.on) return 0;
    const dx = nx - pointer.x;
    const dy = ny - pointer.y;
    return Math.exp(-(dx * dx + dy * dy) / (2 * CURSOR_SIGMA * CURSOR_SIGMA)) * 0.7;
  }

  function rippleAmp(nx, ny) {
    let v = 0;
    for (const r of ripples) {
      const dx = (nx - r.nx) * w;
      const dy = (ny - r.ny) * h;
      const dist = Math.hypot(dx, dy);
      const wave = r.age * RIPPLE_SPEED * Math.max(w, h);
      const band = Math.exp(-Math.pow((dist - wave) / 16, 2));
      const fade = 1 - r.age / RIPPLE_LIFE;
      v += band * fade * 0.65;
    }
    return v;
  }

  function draw(now) {
    if (!start) start = now;
    const tMs = now - start;
    const t = tMs / 1000;
    const entry = reduce ? 1 : clamp01(tMs / ENTRY_MS);

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;

    // Drift cells toward core
    for (const c of cells) {
      c.progress = Math.min(1, c.progress + c.speed * (reduce ? 0 : 1));
      if (c.progress >= 1 && !reduce) {
        c.progress = 0;
        c.angle = Math.random() * Math.PI * 2;
        c.startR = 0.5 + Math.random() * 0.1;
      }
    }

    ctx.clearRect(0, 0, w, h);

    // Quiet paper wash
    const wash = ctx.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, Math.max(w, h) * 0.62);
    wash.addColorStop(0, "rgba(16, 35, 61, 0.05)");
    wash.addColorStop(1, "rgba(16, 35, 61, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    for (const d of dots) {
      const { gate, wave } = entryWave(d.dist, entry);
      if (gate < 0.02 && wave < 0.02) continue;

      let amp = structureAmp(d.nx, d.ny, d.dist, t);
      amp += cellField(d.nx, d.ny) * 0.85;
      amp += cursorAmp(d.nx, d.ny);
      amp += rippleAmp(d.nx, d.ny);
      amp = clamp01(amp * 0.72 + wave * 0.55);

      // Soft organism mask — fade outside outer ring
      const mask = 1 - smoothstep(0.58, 0.78, d.dist);
      amp *= mask;
      if (amp < 0.03) continue;

      const r = DOT_MIN + amp * (DOT_MAX - DOT_MIN);
      const a = (0.15 + amp * 0.75) * Math.max(gate, wave * 0.85);
      if (a < 0.03 || r < 0.2) continue;

      ctx.beginPath();
      ctx.fillStyle = `rgba(10, 10, 10, ${a})`;
      ctx.arc(d.nx * w, d.ny * h, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Term hubs fade in after wavefront
    const hubAlpha = reduce ? 1 : smoothstep(0.45, 0.85, entry);
    for (const hub of hubs) {
      const breathe = 1 + Math.sin(t * 0.9 + hub.phase) * 0.025;
      let hx = hub.nx * w;
      let hy = hub.ny * h;
      if (pointer.on) {
        const dx = hx - pointer.x * w;
        const dy = hy - pointer.y * h;
        const dist = Math.hypot(dx, dy) || 1;
        const fall = Math.exp(-(dist * dist) / (2 * 85 * 85));
        hx += (dx / dist) * fall * -5;
        hy += (dy / dist) * fall * -5;
      }

      const coreR = (1.8 + hub.weight * 0.45) * breathe;
      ctx.globalAlpha = hubAlpha;
      ctx.beginPath();
      ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
      ctx.arc(hx, hy, coreR, 0, Math.PI * 2);
      ctx.fill();
      if (hub.weight >= 4) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(10, 10, 10, 0.14)";
        ctx.lineWidth = 1;
        ctx.arc(hx, hy, coreR + 5 + Math.sin(t + hub.phase), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      hub.el.style.opacity = String(hubAlpha);
      hub.el.style.transform = `translate(${hx + hub.ox}px, ${hy + hub.oy}px) translate(-50%, -100%)`;
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].age += 1 / 60;
      if (ripples[i].age > RIPPLE_LIFE) ripples.splice(i, 1);
    }

    if (!reduce) raf = requestAnimationFrame(draw);
  }

  function onMove(e) {
    const rect = stage.getBoundingClientRect();
    pointer.tx = clamp01((e.clientX - rect.left) / rect.width);
    pointer.ty = clamp01((e.clientY - rect.top) / rect.height);
    pointer.on = true;
    const now = performance.now();
    if (now - pointer.last > 70) {
      ripples.push({ nx: pointer.tx, ny: pointer.ty, age: 0 });
      if (ripples.length > 14) ripples.shift();
      pointer.last = now;
    }
  }
  function onLeave() {
    pointer.on = false;
    pointer.tx = cx;
    pointer.ty = cy;
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  const ro = new ResizeObserver(() => {
    clearTimeout(ro._t);
    ro._t = setTimeout(() => {
      resize();
      if (reduce) {
        cancelAnimationFrame(raf);
        start = performance.now() - ENTRY_MS;
        draw(performance.now());
      }
    }, 80);
  });
  ro.observe(stage);

  resize();
  start = 0;
  if (reduce) {
    start = performance.now() - ENTRY_MS;
    draw(performance.now());
  } else {
    raf = requestAnimationFrame(draw);
  }
})();
