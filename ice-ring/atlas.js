import * as THREE from "three";
import { PROJECTS } from "./projects.js?v=90";

// Cell aspect matches the plane's 1.5 : 1 so nothing is distorted.
const CELL_W = 512;
const CELL_H = Math.round(CELL_W / 1.5);

const rng = (seed) => {
  let a = (seed * 1831565813 + 0x6d2b79f5) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Viscose-inspired dark plates — photographic hue variety from the reference
// ring (chrome / violet / alpine / emerald / rose…), kept deep + restrained.
const TONES = [
  { deep: "#1a1e26", mid: "#2e3644", lift: "#5a687c", edge: "#8a98ac", soft: [160, 172, 190] }, // chrome steel
  { deep: "#241c1a", mid: "#3e2e2a", lift: "#6e5044", edge: "#9a7464", soft: [175, 145, 125] }, // veiled warm
  { deep: "#121c2e", mid: "#223858", lift: "#3e6a9c", edge: "#6a96c4", soft: [115, 155, 205] }, // star alloy
  { deep: "#1a1430", mid: "#322858", lift: "#5a46a0", edge: "#8670c8", soft: [155, 140, 210] }, // prism fold
  { deep: "#281814", mid: "#4a2820", lift: "#8a4634", edge: "#b8684c", soft: [195, 125, 100] }, // molten copper
  { deep: "#0e1e28", mid: "#1a3a4c", lift: "#366e88", edge: "#5e9cb8", soft: [105, 165, 195] }, // alpine ice
  { deep: "#181c20", mid: "#2c3238", lift: "#4c5660", edge: "#788490", soft: [140, 150, 160] }, // modular gray
  { deep: "#0c221c", mid: "#183c32", lift: "#2c6c54", edge: "#4aa888", soft: [85, 175, 145] }, // emerald vessel
  { deep: "#101c22", mid: "#1c343c", lift: "#385860", edge: "#5a8890", soft: [105, 155, 165] }, // liquid chassis
  { deep: "#0c1426", mid: "#162848", lift: "#2a4878", edge: "#4a70a8", soft: [90, 130, 190] }, // midnight glass
  { deep: "#22161a", mid: "#3c262c", lift: "#6c444c", edge: "#987078", soft: [180, 130, 140] }, // rose mercury
  { deep: "#161820", mid: "#2a2c3a", lift: "#4c5070", edge: "#7478a0", soft: [135, 140, 180] }, // silver noise
];

const toneOf = (project, i) => {
  // Prefer Viscose-like variety along the ring; nudge by experiment when useful.
  const key = `${project.type} ${project.id}`.toLowerCase();
  if (key.includes("na49") || key.includes("sps")) return TONES[3];
  if (key.includes("sphenix")) return TONES[7];
  if (key.includes("future") || key.includes("hl-lhc") || key.includes("trigger")) {
    return TONES[2];
  }
  if (key.includes("jet") || key.includes("dijet") || key.includes("quench")) {
    return TONES[4];
  }
  if (key.includes("small") || key.includes("collectivity")) return TONES[10];
  if (key.includes("hard") || key.includes("z boson") || key.includes("z-medium") || key.includes("zjet")) {
    return TONES[9];
  }
  if (key.includes("cms") || key.includes("lhc")) return TONES[5];
  if (key.includes("phobos") || key.includes("rhic")) {
    return TONES[i % 2 === 0 ? 0 : 6];
  }
  return TONES[i % TONES.length];
};

const rgba = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

/**
 * Charcoal / steel plates — soft dark gradients, quiet dots, light type.
 */
export function buildAtlas(projects = PROJECTS, onProgress) {
  const cols = Math.ceil(Math.sqrt(projects.length));
  const rows = Math.ceil(projects.length / cols);

  const canvas = document.createElement("canvas");
  canvas.width = cols * CELL_W;
  canvas.height = rows * CELL_H;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const paint = (project, i) => {
    const ox = (i % cols) * CELL_W;
    const oy = Math.floor(i / cols) * CELL_H;
    const rand = rng(i * 97 + 13);
    const tone = toneOf(project, i);

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, CELL_W, CELL_H);
    ctx.clip();
    ctx.translate(ox, oy);

    // Soft charcoal ground (lifted off pure black).
    ctx.fillStyle = tone.deep;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Diagonal steel wash.
    const base = ctx.createLinearGradient(0, CELL_H * 0.15, CELL_W, CELL_H * 0.9);
    base.addColorStop(0, tone.lift);
    base.addColorStop(0.38, tone.mid);
    base.addColorStop(0.72, tone.deep);
    base.addColorStop(1, tone.mid);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Vertical breath — keeps faces from reading as flat slabs.
    const veil = ctx.createLinearGradient(0, 0, 0, CELL_H);
    veil.addColorStop(0, `${tone.edge}55`);
    veil.addColorStop(0.35, `${tone.mid}00`);
    veil.addColorStop(0.75, `${tone.deep}66`);
    veil.addColorStop(1, `${tone.lift}33`);
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Soft highlight bloom — upper-left for title zone.
    const ax = CELL_W * (0.14 + rand() * 0.16);
    const ay = CELL_H * (0.14 + rand() * 0.18);
    const ar = CELL_W * (0.5 + rand() * 0.18);
    const bloomA = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar);
    bloomA.addColorStop(0, `${tone.edge}66`);
    bloomA.addColorStop(0.45, `${tone.lift}33`);
    bloomA.addColorStop(1, `${tone.lift}00`);
    ctx.fillStyle = bloomA;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Lower-right depth — charcoal, not pure black.
    const bx = CELL_W * (0.68 + rand() * 0.2);
    const by = CELL_H * (0.62 + rand() * 0.26);
    const br = CELL_W * (0.48 + rand() * 0.16);
    const bloomB = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bloomB.addColorStop(0, "rgba(8,10,14,0.42)");
    bloomB.addColorStop(0.55, "rgba(8,10,14,0.14)");
    bloomB.addColorStop(1, "rgba(8,10,14,0)");
    ctx.fillStyle = bloomB;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Quiet mid sheen.
    const cx = CELL_W * (0.42 + rand() * 0.22);
    const cy = CELL_H * (0.38 + rand() * 0.22);
    const cr = CELL_W * (0.26 + rand() * 0.1);
    const mist = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    mist.addColorStop(0, `${tone.edge}28`);
    mist.addColorStop(1, `${tone.edge}00`);
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, CELL_W, CELL_H);

    // Sparse stipple field — restrained dots, denser in lower-right.
    const soft = tone.soft;
    for (let n = 0; n < 48; n++) {
      const px = rand() * CELL_W;
      const py = rand() * CELL_H;
      const bias = (px / CELL_W) * 0.35 + (py / CELL_H) * 0.45;
      if (rand() > 0.35 + bias * 0.4) continue;
      const r = 0.6 + rand() * 1.4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(soft, 0.045 + rand() * 0.07);
      ctx.fill();
    }

    // A few quieter white pin-dots for depth.
    for (let n = 0; n < 28; n++) {
      const px = rand() * CELL_W;
      const py = rand() * CELL_H;
      if (py < CELL_H * 0.22 && px < CELL_W * 0.55) continue; // keep title zone clean
      ctx.beginPath();
      ctx.arc(px, py, 0.55 + rand() * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255], 0.03 + rand() * 0.05);
      ctx.fill();
    }

    // One soft constellation cluster (very light).
    const clusterX = CELL_W * (0.62 + rand() * 0.22);
    const clusterY = CELL_H * (0.48 + rand() * 0.28);
    for (let n = 0; n < 9; n++) {
      const ang = rand() * Math.PI * 2;
      const dist = rand() * CELL_W * 0.12;
      const px = clusterX + Math.cos(ang) * dist;
      const py = clusterY + Math.sin(ang) * dist * 0.75;
      ctx.beginPath();
      ctx.arc(px, py, 0.7 + rand() * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255], 0.04 + rand() * 0.06);
      ctx.fill();
    }

    // Hairline rim.
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, CELL_W - 4, CELL_H - 4);
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 1.25;
    ctx.strokeRect(1, 1, CELL_W - 2, CELL_H - 2);

    // Label.
    const labelSize = Math.round(CELL_H * 0.048);
    ctx.font = `600 ${labelSize}px Inter, "Helvetica Neue", Arial, sans-serif`;
    ctx.textBaseline = "alphabetic";
    if (typeof ctx.letterSpacing === "string") ctx.letterSpacing = "1.6px";
    ctx.fillStyle = "rgba(255,255,255,0.44)";
    ctx.fillText(
      `${String(i + 1).padStart(2, "0")}  ${project.type.toUpperCase()}`,
      CELL_W * 0.07,
      CELL_H * 0.12,
    );
    if (typeof ctx.letterSpacing === "string") ctx.letterSpacing = "0px";

    // Title.
    const title = project.name.length > 22
      ? `${project.name.slice(0, 20)}…`
      : project.name;
    const titleSize = Math.round(CELL_H * 0.1);
    ctx.font = `600 ${titleSize}px Inter, "Helvetica Neue", Arial, sans-serif`;
    if (typeof ctx.letterSpacing === "string") {
      ctx.letterSpacing = `${Math.round(titleSize * -0.03)}px`;
    }
    ctx.fillStyle = "rgba(250,250,250,0.94)";
    ctx.fillText(title, CELL_W * 0.07, CELL_H * 0.3);
    if (typeof ctx.letterSpacing === "string") ctx.letterSpacing = "0px";

    // Year.
    const yearSize = Math.round(CELL_H * 0.22);
    ctx.font = `500 ${yearSize}px Inter, "Helvetica Neue", Arial, sans-serif`;
    if (typeof ctx.letterSpacing === "string") {
      ctx.letterSpacing = `${Math.round(yearSize * -0.045)}px`;
    }
    ctx.fillStyle = "rgba(255,255,255,0.52)";
    ctx.fillText(project.year, CELL_W * 0.07, CELL_H * 0.9);
    if (typeof ctx.letterSpacing === "string") ctx.letterSpacing = "0px";

    ctx.restore();
  };

  let settled = 0;
  const tick = () => onProgress?.(settled / projects.length);

  paint(projects[0], 0);
  settled = 1;
  texture.needsUpdate = true;
  tick();

  const first = Promise.resolve();

  const ready = new Promise((resolve) => {
    let next = 1;
    const step = () => {
      const until = Math.min(projects.length, next + 2);
      for (; next < until; next++) paint(projects[next], next);
      settled = next;
      tick();
      if (next < projects.length) requestAnimationFrame(step);
      else {
        texture.needsUpdate = true;
        resolve();
      }
    };
    if (projects.length > 1) requestAnimationFrame(step);
    else resolve();
  });

  return {
    texture,
    grid: [cols, rows],
    count: projects.length,
    first,
    ready,
  };
}
