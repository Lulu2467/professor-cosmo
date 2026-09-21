/**
 * Wires the ported ring into the timeline section of the static page.
 *
 * Nothing is imported at the top level on purpose: three and gsap come off a
 * CDN through the import map, and if either fails to arrive the section has to
 * degrade to the readable list underneath rather than take the page with it.
 * So the ring is pulled in dynamically and every failure lands in one place.
 */
const section = document.querySelector("#timeline");

const fallback = (why) => {
  if (!section) return;
  section.classList.add("is-fallback");
  if (why) console.warn("[ice-ring]", why);
};

(async () => {
  if (!section) return;

  const container = section.querySelector("[data-ice-canvas]");
  const list = section.querySelector("[data-ice-list]");
  if (!container || !list) return fallback("markup missing");

  // No context, no ring. Tested before the import so a machine without WebGL
  // does not pay for the download.
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
  // Released rather than left for the collector: browsers cap live contexts,
  // and the ring needs one of its own a moment from now.
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  if (!gl) return fallback("no WebGL context");

  const groupOf = (side) => {
    const box = section.querySelector(`[data-ice-meta="${side}"]`);
    if (!box) return { box: null, goo: null, layers: [], plain: null };
    return {
      box,
      goo: box.querySelector("[data-ice-goo]"),
      layers: [...box.querySelectorAll("[data-ice-layer]")],
      plain: box.querySelector("[data-ice-plain]"),
    };
  };

  // Ratio of the section on screen at which the ring earns the wheel. Below
  // it the page keeps the gesture outright, so scrolling in from the hero is
  // never interrupted.
  const LOCK_AT = 0.9;
  let locked = false;

  let ring;
  try {
    const { createRing } = await import("./ring.js?v=99");
    ring = createRing(
      {
        container,
        list,
        items: [...list.children],
        loader: section.querySelector("[data-ice-loader]"),
        live: section.querySelector("[data-ice-live]"),
        cut: section.querySelector("[data-ice-cut]"),
        filterId: "iceNameGoo",
        groups: { left: groupOf("left"), right: groupOf("right") },
      },
      {
        shouldCaptureWheel: () => locked,
        onInteractive: () => section.classList.add("is-live"),
        onOpen: (project) => {
          if (!project?.href) return;
          // Anchor click keeps the gesture trusted across browsers that
          // block window.open from async / module handlers.
          const a = document.createElement("a");
          a.href = project.href;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
        onWheelRelease: (dir) => {
          // Home page only: release upward back to the hero. Downward stays
          // on the timeline (end of the page).
          if (dir < 0) {
            document.querySelector("#home")?.scrollIntoView({ block: "start" });
          }
        },
      },
    );
  } catch (err) {
    return fallback(err?.message ?? err);
  }

  section.classList.add("is-ready");

  // The reference ring opened on page load because it *was* the page. Here it
  // is a section below the hero, so the entry is held until the reader has
  // actually arrived at it — and the loop is stopped outright whenever the
  // section is off screen, so the hero and the boards below are not sharing a
  // frame budget with a ring nobody can see.
  let started = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const r = entry.intersectionRatio;
        if (r > 0) ring.resume();
        else ring.pause();

        locked = r >= LOCK_AT;
        // Only once the section is genuinely on its way out. Refilling the
        // moment it stops being flush would undo the hand-over: the page snaps
        // back here, the budget is restored, and the reader is stuck.
        if (r < 0.35) ring.resetWheel();

        if (!started && r >= 0.35) {
          started = true;
          ring.start();
        }
      }
    },
    { threshold: [0, 0.2, 0.35, 0.6, LOCK_AT, 1] },
  );
  io.observe(section);

  // The hint has served its purpose the moment the reader does either of the
  // two things it is describing.
  const usedIt = () => section.classList.add("is-used");
  container.addEventListener("pointerdown", usedIt, { once: true });
  container.addEventListener("wheel", usedIt, { once: true, passive: true });
})();
