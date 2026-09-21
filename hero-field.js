/* Home hero: interactive field sits right of the portrait; keep type clear */
(() => {
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector("[data-hero-field]");
  if (!hero || !canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const SPACING = 11;
  const DOT_MIN = 0.35;
  const DOT_MAX = 2.2;

  let w = 0;
  let h = 0;
  let dots = [];
  let cells = [];
  let ripples = [];
  let raf = 0;
  let t0 = 0;
  let pointer = { x: 0.78, y: 0.48, tx: 0.78, ty: 0.48, on: false, last: 0 };

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }
  function noise(x, y, t) {
    return (
      Math.sin(x * 2.4 + t * 0.35) * 0.34 +
      Math.sin(y * 3.1 - t * 0.28) * 0.28 +
      Math.sin((x + y) * 1.7 + t * 0.22) * 0.22
    );
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    const nextW = Math.max(1, Math.round(rect.width));
    const nextH = Math.max(1, Math.round(rect.height));
    if (nextW === w && nextH === h && canvas.width) return;
    w = nextW;
    h = nextH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  // Keep field subtle; globe carries the right-side presence
  function zoneSoft(nx) {
    const leftClear = clamp01((0.42 - nx) / 0.22);
    const rightField = clamp01((nx - 0.62) / 0.3);
    return Math.max(leftClear * 0.12, rightField * 0.45);
  }

  function build() {
    const cols = Math.max(22, Math.round(w / SPACING));
    const rows = Math.max(16, Math.round(h / SPACING));
    dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nx = (x + 0.5) / cols;
        const ny = (y + 0.5) / rows;
        const soft = zoneSoft(nx);
        if (soft < 0.04) continue;
        dots.push({
          nx,
          ny,
          phase: (x * 0.37 + y * 0.61) % (Math.PI * 2),
          soft,
        });
      }
    }
    cells = Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      r: 0.12 + (i % 3) * 0.05,
      sigma: 0.07 + (i % 2) * 0.025,
      amp: 0.38 + (i % 3) * 0.12,
      drift: 0.12 + i * 0.035,
    }));
  }

  function field(nx, ny, t) {
    let v = 0.26 + noise(nx * 3.2, ny * 3.4, t) * 0.18;
    for (const c of cells) {
      const cx = 0.78 + Math.cos(c.angle + t * c.drift) * c.r;
      const cy = 0.48 + Math.sin(c.angle + t * c.drift * 0.85) * c.r * 1.1;
      const dx = nx - cx;
      const dy = ny - cy;
      v += Math.exp(-(dx * dx + dy * dy) / (2 * c.sigma * c.sigma)) * c.amp;
    }
    return clamp01(v);
  }

  function draw(now) {
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    ctx.clearRect(0, 0, w, h);

    const wash = ctx.createRadialGradient(
      w * 0.82,
      h * 0.46,
      0,
      w * 0.78,
      h * 0.5,
      Math.max(w, h) * 0.55
    );
    wash.addColorStop(0, "rgba(16, 35, 61, 0.08)");
    wash.addColorStop(0.5, "rgba(16, 35, 61, 0.03)");
    wash.addColorStop(1, "rgba(16, 35, 61, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = "rgba(16, 35, 61, 1)";
    ctx.lineWidth = 1;
    for (let x = w * 0.62; x < w; x += 28) {
      const a = 0.4 + 0.6 * Math.sin(t * 0.4 + x * 0.04);
      ctx.globalAlpha = 0.015 + a * 0.028;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(16, 35, 61, 1)");
      grad.addColorStop(0.78, "rgba(16, 35, 61, 1)");
      grad.addColorStop(1, "rgba(16, 35, 61, 0)");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    ctx.restore();

    const hot = [];

    for (const d of dots) {
      let amp = field(d.nx, d.ny, t) * d.soft;

      if (pointer.on) {
        const dx = (d.nx - pointer.x) * w;
        const dy = (d.ny - pointer.y) * h;
        const dist = Math.hypot(dx, dy);
        const fall = Math.exp(-(dist * dist) / (2 * 120 * 120));
        amp += fall * 0.65 * d.soft;
      }

      for (const r of ripples) {
        const dx = (d.nx - r.nx) * w;
        const dy = (d.ny - r.ny) * h;
        const dist = Math.hypot(dx, dy);
        const wave = r.age * 180;
        const band = Math.exp(-Math.pow((dist - wave) / 24, 2));
        const fade = 1 - r.age / 1.5;
        amp += band * fade * 0.55 * d.soft;
      }

      const pulse = 1 + Math.sin(t * 1.15 + d.phase) * 0.05;
      const radius = (DOT_MIN + amp * (DOT_MAX - DOT_MIN)) * pulse;
      // Soften the section seam so the field dissolves into the timeline
      const bottomFade = d.ny > 0.78 ? clamp01((1 - d.ny) / 0.22) : 1;
      const alpha = (0.08 + amp * 0.48) * d.soft * bottomFade;
      if (radius < 0.28 || alpha < 0.03) continue;

      ctx.beginPath();
      ctx.fillStyle = `rgba(10, 10, 10, ${alpha})`;
      ctx.arc(d.nx * w, d.ny * h, radius, 0, Math.PI * 2);
      ctx.fill();

      if (amp > 0.55 && d.soft > 0.45 && hot.length < 28) {
        hot.push({ x: d.nx * w, y: d.ny * h, a: amp });
      }
    }

    if (hot.length > 2) {
      ctx.save();
      ctx.lineWidth = 1;
      for (let i = 0; i < hot.length; i++) {
        const a = hot[i];
        for (let j = i + 1; j < hot.length; j++) {
          const b = hot[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 70 || dist < 18) continue;
          const alpha = (1 - dist / 70) * 0.11 * Math.min(a.a, b.a);
          ctx.strokeStyle = `rgba(16, 35, 61, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Orbital presence is handled by hero-globe; keep field as soft grain only

    if (pointer.on && pointer.x > 0.55) {
      const px = pointer.x * w;
      const py = pointer.y * h;
      ctx.save();
      ctx.strokeStyle = "rgba(16, 35, 61, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].age += 1 / 60;
      if (ripples[i].age > 1.5) ripples.splice(i, 1);
    }

    if (!reduce) raf = requestAnimationFrame(draw);
  }

  function onMove(e) {
    const rect = hero.getBoundingClientRect();
    pointer.tx = clamp01((e.clientX - rect.left) / rect.width);
    pointer.ty = clamp01((e.clientY - rect.top) / rect.height);
    pointer.on = true;
    const now = performance.now();
    if (now - pointer.last > 90 && pointer.tx > 0.5) {
      ripples.push({ nx: pointer.tx, ny: pointer.ty, age: 0 });
      if (ripples.length > 10) ripples.shift();
      pointer.last = now;
    }
  }
  function onLeave() {
    pointer.on = false;
    pointer.tx = 0.78;
    pointer.ty = 0.48;
  }

  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);

  let roT;
  const ro = new ResizeObserver(() => {
    clearTimeout(roT);
    roT = setTimeout(() => {
      resize();
      if (reduce) {
        cancelAnimationFrame(raf);
        t0 = performance.now();
        draw(performance.now());
      }
    }, 60);
  });
  ro.observe(hero);

  resize();
  if (reduce) draw(performance.now());
  else raf = requestAnimationFrame(draw);
})();
