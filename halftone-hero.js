/* Hero: Antimetal / atom63-style shockwave halftone → portrait reveal */
(() => {
  const stage = document.querySelector("[data-halftone]");
  if (!stage) return;

  const canvas = stage.querySelector("canvas");
  const img = stage.querySelector("img");
  if (!canvas || !img) return;

  if (typeof window.__htStop === "function") window.__htStop();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);

  // Slightly wider pitch = cleaner print-like dots (less muddy compression).
  const GAP = 8;
  const DOT_MIN = 0.55;
  const DOT_MAX = GAP * 0.42;
  const ENTRY_MS = 2800;
  const HOLD_MS = 700;
  const REVEAL_MS = 1400;
  const WAVE_BAND = 0.11;
  const WAVE_LAG = 0.16;
  const CURSOR_R = 84;
  const SPRITE_R = 32;

  let dots = [];
  let raf = 0;
  let start = 0;
  let running = false;
  let viewW = 0;
  let viewH = 0;
  let maxDist = 1;
  let pointer = { x: 0, y: 0, active: false };
  let alive = true;
  let sprite = null;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function smoothstep(a, b, x) {
    if (a === b) return x >= b ? 1 : 0;
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function stop() {
    alive = false;
    running = false;
    cancelAnimationFrame(raf);
    stage.removeEventListener("pointermove", onPointer);
    stage.removeEventListener("pointerleave", onPointerLeave);
  }
  window.__htStop = stop;

  /** Soft anti-aliased ink disc used as a scaled sprite (crisp at any radius). */
  function buildSprite() {
    const size = SPRITE_R * 2 + 4;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    const mid = size / 2;
    const grad = g.createRadialGradient(mid, mid, 0, mid, mid, SPRITE_R);
    grad.addColorStop(0, "rgba(10, 10, 10, 1)");
    grad.addColorStop(0.72, "rgba(10, 10, 10, 0.96)");
    grad.addColorStop(0.9, "rgba(10, 10, 10, 0.35)");
    grad.addColorStop(1, "rgba(10, 10, 10, 0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(mid, mid, SPRITE_R, 0, Math.PI * 2);
    g.fill();
    sprite = c;
  }

  function sizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === viewW && h === viewH && canvas.width) return { w, h };
    viewW = w;
    viewH = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { w, h };
  }

  /** Match CSS object-fit: cover + object-position for faithful sampling. */
  function coverSourceRect(dw, dh) {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const scale = Math.max(dw / nw, dh / nh);
    const sw = dw / scale;
    const sh = dh / scale;
    // object-position: 48% 16%
    const sx = (nw - sw) * 0.48;
    const sy = (nh - sh) * 0.16;
    return { sx, sy, sw, sh };
  }

  function buildDots(w, h) {
    const cols = Math.max(20, Math.round(w / GAP));
    const rows = Math.max(20, Math.round(h / GAP));

    // Oversample source so luminance isn't blocky / "compressed".
    const sampleScale = 3;
    const sample = document.createElement("canvas");
    sample.width = cols * sampleScale;
    sample.height = rows * sampleScale;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    const src = coverSourceRect(sample.width, sample.height);
    sctx.drawImage(img, src.sx, src.sy, src.sw, src.sh, 0, 0, sample.width, sample.height);
    const { data } = sctx.getImageData(0, 0, sample.width, sample.height);

    const cx = w * 0.5;
    const cy = h * 0.42;
    maxDist = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.06;

    const next = [];
    const ss = sampleScale;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Average a small neighborhood for stable, print-like tone.
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let aSum = 0;
        let count = 0;
        const x0 = x * ss;
        const y0 = y * ss;
        for (let oy = 0; oy < ss; oy++) {
          for (let ox = 0; ox < ss; ox++) {
            const i = ((y0 + oy) * sample.width + (x0 + ox)) * 4;
            aSum += data[i + 3];
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }
        const a = aSum / (255 * count);
        if (a < 0.05) continue;
        const lum = (0.2126 * (rSum / count) + 0.7152 * (gSum / count) + 0.0722 * (bSum / count)) / 255;
        // Gentle S-curve keeps midtones readable without muddy blotches.
        const tone = clamp01((1 - lum) * a);
        const amp = Math.pow(tone, 0.92);
        if (amp < 0.035) continue;

        const px = (x + 0.5) * (w / cols);
        const py = (y + 0.5) * (h / rows);
        const dist = Math.hypot(px - cx, py - cy) / maxDist;
        next.push({
          x: px,
          y: py,
          dist,
          amp,
          phase: (x * 12.9898 + y * 78.233) % (Math.PI * 2),
        });
      }
    }
    dots = next;
  }

  function entryGate(dist, radius) {
    const fill = 1 - smoothstep(radius - WAVE_BAND * 0.4, radius + WAVE_BAND * 0.12, dist);
    const band = Math.exp(-Math.pow((dist - radius) / WAVE_BAND, 2));
    const lagR = Math.max(0, radius - WAVE_LAG);
    const band2 = Math.exp(-Math.pow((dist - lagR) / (WAVE_BAND * 1.4), 2)) * 0.5;
    return clamp01(fill * 0.94 + band * 0.62 + band2 * 0.3);
  }

  function drawDot(x, y, r, alpha) {
    if (!sprite || r < 0.2 || alpha < 0.02) return;
    const size = r * 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - r, y - r, size, size);
  }

  function drawFrame(tMs) {
    if (!alive) return false;
    ctx.clearRect(0, 0, viewW, viewH);
    ctx.globalAlpha = 1;

    const entryT = clamp01(tMs / ENTRY_MS);
    const radius = easeOutCubic(entryT) * 1.08;
    const after = Math.max(0, tMs - ENTRY_MS - HOLD_MS);
    const revealT = clamp01(after / REVEAL_MS);
    const fadeDots = 1 - easeInOut(revealT);

    if (revealT > 0.28) stage.classList.add("is-photo");
    else stage.classList.remove("is-photo");

    const breathe = entryT > 0.85 ? 1 + Math.sin(tMs * 0.002) * 0.02 : 1;

    for (const d of dots) {
      const gate = entryGate(d.dist, radius);
      if (gate < 0.025) continue;

      let amp = d.amp * gate;
      if (pointer.active) {
        const pd = Math.hypot(d.x - pointer.x, d.y - pointer.y);
        if (pd < CURSOR_R) {
          amp = clamp01(amp + Math.pow(1 - pd / CURSOR_R, 2) * 0.42);
        }
      }

      const pulse = 1 + Math.sin(tMs * 0.0024 + d.phase) * 0.03 * Math.min(1, entryT * 1.15);
      const r = (DOT_MIN + amp * (DOT_MAX - DOT_MIN)) * breathe * pulse;
      const alpha = (0.28 + amp * 0.72) * fadeDots * (0.25 + 0.75 * gate);
      drawDot(d.x, d.y, r, alpha);
    }

    ctx.globalAlpha = 1;
    img.style.opacity = String(easeInOut(revealT));

    if (revealT >= 1) {
      running = false;
      img.style.opacity = "1";
      canvas.style.opacity = "0";
      canvas.style.pointerEvents = "none";
      return false;
    }
    return true;
  }

  function showPhotoFallback() {
    stage.classList.add("is-ready", "is-photo");
    img.style.opacity = "1";
    canvas.style.opacity = "0";
    canvas.style.pointerEvents = "none";
    running = false;
  }

  function tick(now) {
    if (!alive) return;
    if (!start) start = now;
    if (drawFrame(now - start)) raf = requestAnimationFrame(tick);
  }

  function startAnim() {
    if (!alive) return;
    cancelAnimationFrame(raf);
    start = 0;
    running = true;
    stage.classList.remove("is-photo");
    canvas.style.opacity = "1";
    canvas.style.pointerEvents = "auto";
    img.style.opacity = "0";
    if (!sprite) buildSprite();
    const { w, h } = sizeCanvas();
    try {
      buildDots(w, h);
    } catch (err) {
      showPhotoFallback();
      return;
    }
    if (reduce || !dots.length) {
      showPhotoFallback();
      return;
    }
    pointer.x = w * 0.5;
    pointer.y = h * 0.42;
    // Paint first frame immediately so the figure never sits blank.
    drawFrame(0);
    raf = requestAnimationFrame(tick);
  }

  function onPointer(e) {
    if (!running || !alive) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }
  function onPointerLeave() {
    pointer.active = false;
  }

  stage.addEventListener("pointermove", onPointer);
  stage.addEventListener("pointerleave", onPointerLeave);

  function onReady() {
    if (!alive) return;
    stage.classList.add("is-ready");
    startAnim();
  }

  if (img.complete && img.naturalWidth) onReady();
  else img.addEventListener("load", onReady, { once: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!alive || !img.naturalWidth) return;
      if (running) {
        const { w, h } = sizeCanvas();
        buildDots(w, h);
        return;
      }
      sizeCanvas();
      stage.classList.add("is-photo");
      img.style.opacity = "1";
      canvas.style.opacity = "0";
    }, 160);
  });
})();
