(function () {
  const visual = document.querySelector(".space-visual");
  if (!visual) return;

  const canvas = visual.querySelector(".space-field");
  const img = visual.querySelector(".space-portrait-src");
  if (!canvas || !img) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0, h = 0, cx = 0, cy = 0;
  let face = [];
  let orbiters = [];
  let orbits = [];
  let t = 0;
  let running = false;
  let imgReady = false;

  function visible() {
    const home = document.getElementById("spaceHome");
    if (home && home.hidden) return false;
    return visual.offsetParent !== null || visual.getClientRects().length > 0;
  }

  function resize() {
    const rect = visual.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w * 0.5;
    cy = h * 0.5;
    buildOrbits();
    if (imgReady) sampleFace();
  }

  function buildOrbits() {
    const s = Math.min(w, h);
    orbits = [
      { a: s * 0.47, b: s * 0.43, rot: -0.16, dash: [], alpha: 0.3, width: 1 },
      { a: s * 0.41, b: s * 0.27, rot: 0.48, dash: [3, 11], alpha: 0.24, width: 1 },
      { a: s * 0.36, b: s * 0.36, rot: 0.1, dash: [], alpha: 0.16, width: 1.1 },
      { a: s * 0.28, b: s * 0.4, rot: -0.78, dash: [1, 9], alpha: 0.22, width: 1 },
      { a: s * 0.23, b: s * 0.15, rot: 1.12, dash: [5, 13], alpha: 0.18, width: 0.8 },
      { a: s * 0.5, b: s * 0.2, rot: 0.92, dash: [2, 16], alpha: 0.13, width: 0.8 },
      { a: s * 0.19, b: s * 0.19, rot: 0.3, dash: [2, 7], alpha: 0.12, width: 0.7 }
    ];

    orbiters = [];
    const hues = [
      [158, 184, 214],
      [186, 200, 214],
      [120, 148, 176],
      [210, 220, 228]
    ];
    for (let i = 0; i < 56; i++) {
      const ring = orbits[i % 4];
      const col = hues[i % hues.length];
      orbiters.push({
        ring,
        ang: Math.random() * Math.PI * 2,
        speed: (0.18 + Math.random() * 0.55) * (i % 3 === 0 ? -1 : 1) * 0.012,
        size: 0.7 + Math.random() * 2.4,
        r: col[0], g: col[1], b: col[2],
        pulse: Math.random() * Math.PI * 2,
        trail: Math.random() > 0.62
      });
    }
  }

  function isBackdrop(r, g, b) {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 58 || lum > 128) return false;
    if (r >= b) return false;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    return sat < 0.4 && b >= g - 2 && Math.abs(r - g) < 32 && r >= 68 && r <= 140;
  }

  function photoCrop() {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const fallback = { cropX: iw * 0.06, cropY: 0, cropW: iw * 0.94, cropH: ih };
    const tw = 96;
    const th = 96;
    const probe = document.createElement("canvas");
    probe.width = tw;
    probe.height = th;
    const pctx = probe.getContext("2d");
    try {
      pctx.drawImage(img, 0, 0, tw, th);
      const d = pctx.getImageData(0, 0, tw, th).data;
      let minX = tw, minY = th, maxX = 0, maxY = 0, hits = 0;
      for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
          const i = (y * tw + x) * 4;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (isBackdrop(r, g, b)) continue;
          hits++;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      if (!hits || maxX <= minX) return fallback;
      const padX = 0.03;
      const padY = 0.02;
      const x0 = Math.max(0, (minX / tw - padX) * iw);
      const y0 = Math.max(0, (minY / th - padY) * ih);
      const x1 = Math.min(iw, (maxX / tw + padX) * iw);
      const y1 = Math.min(ih, (maxY / th + padY) * ih);
      return { cropX: x0, cropY: y0, cropW: x1 - x0, cropH: y1 - y0 };
    } catch (err) {
      return fallback;
    }
  }

  function drawFigure(target, tx, ty, tw, th) {
    const { cropX, cropY, cropW, cropH } = photoCrop();
    const ar = cropW / Math.max(1, cropH);
    let dw = tw;
    let dh = th;
    let dx = tx;
    let dy = ty;
    if (ar > 1) {
      dh = tw / ar;
      dy = ty + (th - dh) / 2;
    } else {
      dw = th * ar;
      dx = tx + (tw - dw) / 2;
    }
    target.drawImage(img, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
  }

  function markBackdrop(data, sw, sh) {
    const n = sw * sh;
    const bg = new Uint8Array(n);
    const stack = [];
    const trySeed = (x, y) => {
      if (x < 0 || y < 0 || x >= sw || y >= sh) return;
      const i = y * sw + x;
      if (bg[i]) return;
      if (!isBackdrop(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])) return;
      bg[i] = 1;
      stack.push(i);
    };
    for (let y = 0; y < sh; y += 1) trySeed(0, y);
    for (let x = 0; x < sw; x += 2) {
      trySeed(x, 0);
      trySeed(x, sh - 1);
    }
    trySeed(sw - 1, 0);
    trySeed(sw - 1, sh - 1);
    while (stack.length) {
      const i = stack.pop();
      const x = i % sw;
      const y = (i / sw) | 0;
      trySeed(x - 1, y);
      trySeed(x + 1, y);
      trySeed(x, y - 1);
      trySeed(x, y + 1);
    }
    return bg;
  }

  function sampleFace() {
    if (!img.naturalWidth) return;
    const sw = 420;
    const sh = 420;
    const off = document.createElement("canvas");
    off.width = sw;
    off.height = sh;
    const octx = off.getContext("2d");
    try {
      octx.drawImage(img, 0, 0, sw, sh);
      const data = octx.getImageData(0, 0, sw, sh).data;
      const bg = markBackdrop(data, sw, sh);
      const raw = [];
      const step = 2;
      let cxw = 0, cyw = 0, wsum = 0;
      for (let y = 0; y < sh; y += step) {
        for (let x = 0; x < sw; x += step) {
          const i = y * sw + x;
          if (bg[i]) continue;
          const o = i * 4;
          const r = data[o], g = data[o + 1], b = data[o + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 10) continue;
          raw.push({ x, y, r, g, b, lum });
          if (lum > 88) {
            const wt = lum * lum;
            cxw += x * wt;
            cyw += y * wt;
            wsum += wt;
          }
        }
      }
      if (!raw.length || wsum <= 0) {
        face = [];
        canvas._drawPhoto = true;
        return;
      }
      const fcx = cxw / wsum;
      const fcy = cyw / wsum;
      let rad = 0;
      for (let i = 0; i < raw.length; i++) {
        const p = raw[i];
        if (p.lum < 48) continue;
        const dx = (p.x - fcx) * 1.05;
        const dy = (p.y - fcy) * 0.92;
        const d = Math.hypot(dx, dy);
        if (d > rad) rad = d;
      }
      rad = Math.max(rad * 0.78, 1);
      canvas._figAspect = 1;
      const next = [];
      const edgePad = sw * 0.1;
      for (let i = 0; i < raw.length; i++) {
        const p = raw[i];
        const nx = (p.x - fcx) / rad;
        const ny = (p.y - fcy) / rad;
        const rr = Math.hypot(nx * 1.02, ny * 0.9);
        if (rr > 1.02) continue;
        const ovalFall = rr < 0.38 ? 1 : Math.max(0, 1 - Math.pow((rr - 0.38) / 0.64, 1.65));
        const edge = Math.min(p.x, p.y, sw - 1 - p.x, sh - 1 - p.y) / edgePad;
        const edgeFall = Math.max(0, Math.min(1, edge));
        const fall = ovalFall * edgeFall;
        if (fall < 0.04) continue;
        const navyMix = Math.pow(1 - fall, 1.08);
        const cool = Math.min(0.38, 0.06 + rr * 0.32);
        let r, g, b;
        if (p.lum < 58) {
          r = Math.round(p.r * 0.42 + 70 * 0.58);
          g = Math.round(p.g * 0.42 + 108 * 0.58);
          b = Math.round(p.b * 0.42 + 168 * 0.58);
        } else {
          r = Math.round(p.r * (1 - cool) + 150 * cool);
          g = Math.round(p.g * (1 - cool) + 186 * cool);
          b = Math.round(p.b * (1 - cool) + 232 * cool);
        }
        r = Math.round(r * (1 - navyMix) + 6 * navyMix);
        g = Math.round(g * (1 - navyMix) + 18 * navyMix);
        b = Math.round(b * (1 - navyMix) + 40 * navyMix);
        next.push({
          nx, ny,
          r, g, b,
          lum: p.lum,
          size: ((p.lum > 170 ? 1.18 : p.lum < 55 ? 0.95 : 0.48) + (p.lum / 255) * 1.2) * (0.28 + 0.72 * fall),
          alpha: (p.lum < 55 ? 0.34 : 0.18 + p.lum / 420) * fall * fall * (p.lum > 160 ? 1.15 : 1),
          phase: Math.random() * Math.PI * 2,
          jitter: 0.12 + Math.random() * 0.85,
          scatter: rr > 0.58 ? (rr - 0.58) * 9 : 0
        });
      }
      face = next;
      canvas._drawPhoto = false;
    } catch (err) {
      face = [];
      canvas._drawPhoto = true;
    }
  }

  function orbitPoint(ring, ang) {
    const x = ring.a * Math.cos(ang);
    const y = ring.b * Math.sin(ang);
    const c = Math.cos(ring.rot);
    const s = Math.sin(ring.rot);
    return { x: cx + x * c - y * s, y: cy + x * s + y * c };
  }

  function drawOrbits() {
    orbits.forEach((ring) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.a, ring.b, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(158, 184, 214, ${ring.alpha})`;
      ctx.lineWidth = ring.width;
      ctx.setLineDash(ring.dash);
      ctx.stroke();
      ctx.restore();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.min(w, h) * 0.28);
    glow.addColorStop(0, "rgba(90, 150, 230, 0.18)");
    glow.addColorStop(0.45, "rgba(40, 90, 160, 0.08)");
    glow.addColorStop(1, "rgba(6, 18, 36, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.28, 0, Math.PI * 2);
    ctx.fill();

    drawOrbits();

    const span = Math.min(w, h) * 0.42;
    if (canvas._drawPhoto && img.naturalWidth) {
      const size = span * 2.05;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, span * 0.98, span * 1.04, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.88;
      ctx.filter = "saturate(0.68) contrast(1.04)";
      drawFigure(ctx, cx - size / 2, cy - size / 2, size, size);
      ctx.filter = "none";
      const fade = ctx.createRadialGradient(cx, cy, span * 0.34, cx, cy, span * 1.02);
      fade.addColorStop(0, "rgba(6,18,36,0)");
      fade.addColorStop(0.55, "rgba(6,18,36,0.18)");
      fade.addColorStop(1, "rgba(6,18,36,0.96)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = fade;
      ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
    }
    for (let i = 0; i < face.length; i++) {
      const p = face[i];
      const drift = reduce ? 0 : Math.sin(t * 0.9 + p.phase) * p.jitter;
      const driftY = reduce ? 0 : Math.cos(t * 0.7 + p.phase * 1.3) * p.jitter * 0.7;
      const out = reduce ? 0 : p.scatter * (0.35 + 0.15 * Math.sin(t * 0.5 + p.phase));
      const x = cx + p.nx * span + drift + (p.nx * out);
      const y = cy + p.ny * span + driftY + (p.ny * out);
      const pulse = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 1.4 + p.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha * pulse})`;
      ctx.arc(x, y, p.size * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < orbiters.length; i++) {
      const o = orbiters[i];
      if (!reduce) o.ang += o.speed;
      const p = orbitPoint(o.ring, o.ang);
      const pulse = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * 2 + o.pulse);
      if (o.trail && !reduce) {
        const back = orbitPoint(o.ring, o.ang - 0.12);
        const grd = ctx.createLinearGradient(back.x, back.y, p.x, p.y);
        grd.addColorStop(0, `rgba(${o.r},${o.g},${o.b},0)`);
        grd.addColorStop(1, `rgba(${o.r},${o.g},${o.b},${0.35 * pulse})`);
        ctx.beginPath();
        ctx.strokeStyle = grd;
        ctx.lineWidth = Math.max(0.6, o.size * 0.45);
        ctx.moveTo(back.x, back.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${o.r},${o.g},${o.b},${0.55 + 0.4 * pulse})`;
      ctx.shadowColor = `rgba(${o.r},${o.g},${o.b},0.9)`;
      ctx.shadowBlur = 8 * pulse;
      ctx.arc(p.x, p.y, o.size * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function tick() {
    if (!visible()) {
      running = false;
      return;
    }
    t += 0.016;
    draw();
    if (!reduce) requestAnimationFrame(tick);
  }

  function start() {
    if (running || !visible()) return;
    running = true;
    if (reduce) draw();
    else requestAnimationFrame(tick);
  }

  img.addEventListener("load", () => {
    imgReady = true;
    resize();
    start();
  });
  if (img.complete && img.naturalWidth) {
    imgReady = true;
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (!running) start();
    else if (reduce) draw();
  });
  ro.observe(visual);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else {
      running = false;
      start();
    }
  });

  const home = document.getElementById("spaceHome");
  if (home) {
    const mo = new MutationObserver(() => {
      if (visible()) {
        resize();
        running = false;
        start();
      } else running = false;
    });
    mo.observe(home, { attributes: true, attributeFilter: ["hidden"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  resize();
  if (imgReady) start();
})();
