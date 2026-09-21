import { PROJECTS } from "./projects.js?v=89";

/**
 * Every tunable in one place, ported from the Ice-works reference ring. The
 * dev panel that used to drive these is gone, so this is now the only place
 * the ring is tuned from.
 *
 * Two conventions worth knowing before reading further:
 *
 *  - Every px figure is quoted at `refWidth` and scaled from there.
 *  - Below `narrowAt` and again below `tightAt` the ring is re-proportioned
 *    rather than just scaled down. Those bands multiply the fit, they do not
 *    replace it, and they stack.
 *
 * Geometry note: the reference ran 18 cards on a 340px ring. This timeline has
 * 12, and a shorter list on the same ring would arrive as a sparse arc with
 * two cards on screen. Radius and stage offset are therefore both scaled by
 * 12/18, which holds the arc spacing — and so the gap between neighbouring
 * cards, which is what the goo is measured against — at the reference value.
 * posX follows from it: the reference parks the front of the ring on the
 * screen's centre line, i.e. posX = -2 * ringRadius * endScale / refWidth.
 */
const CARD_RATIO = PROJECTS.length / 18;

export function defaultParams() {
  return {
    // -- colour ----------------------------------------------------------
    ink: "#0d1b2a", // untextured silhouette and the heading
    page: "#fafafa", // what is behind the ring, for the tag to read

    // -- fit ------------------------------------------------------------
    refWidth: 1512,
    refHeight: 870, // viewport, i.e. screen less menu bar and browser chrome
    fitHeight: 0, // 0 = width alone drives scale, 1 = whichever axis is tighter
    minScale: 0.5, // a phone is not a small desktop; bracket the extremes
    maxScale: 1.75,

    narrowAt: 1024, // inclusive
    narrowPlane: 1.25,
    narrowRadius: 1.3, // cards grow faster than the arc, or the gaps close up
    narrowText: 1.5, // type cannot shrink like a picture can and stay readable
    narrowPosX: -2.5 * CARD_RATIO,
    narrowEndScale: 4.22,

    tightAt: 640, // inclusive
    tightRadius: 0.82, // multiplies narrowRadius
    tightPosX: -3.5 * CARD_RATIO,
    tightSplit: 0.8, // the heading, competing with the ring for centre screen
    tightName: 1.5, // the name is the only label left, so it takes the billing
    tightNameBottom: 16, // px
    tightNameRight: 16, // px
    tightMetaWidth: 70, // vw of box, and so of filter region, around it

    // -- geometry, all at the reference window ---------------------------
    planeSize: 90, // long edge in px; aspect locked at 1.5 : 1
    count: PROJECTS.length, // one plane per entry, so the deal comes out even
    ringRadius: 340 * CARD_RATIO,
    seed: 0, // where plane 0 sits, degrees (0 = 3 o'clock)
    radial: true, // long edge points outward; off = long edge along the ring
    radius: 6, // corner
    textured: true, // off = flat silhouette, useful for reading the goo
    blend: 14, // px over which neighbouring art crossfades in the goo
    imageOffset: 0, // rotates the whole deal; 0 lands the entry on PROJECTS[0]

    // -- loading ---------------------------------------------------------
    // The counter is the gate: the entry launches on the frame it reads 100.
    holdAfter: 0,
    loaderChase: 0.18,
    loaderBottom: 1, // vh
    loaderOut: 0.45, // seconds to fade once the hold lets go

    // -- entry timing ----------------------------------------------------
    stagger: 0.34,
    launchTime: 1.95,
    spreadEase: "power2.out",
    spreadTime: 3.6,
    // Where the ring goes once formed. stageAt is a fraction of the spread, so
    // 0.5 starts the move midway through the ring drawing.
    stageAt: 0.7,
    spinTurns: 1,
    spinTime: 2.6,
    spinEase: "power2.inOut",
    spinDelay: 0,
    posX: -2 * CARD_RATIO, // fraction of half the viewport width
    posY: 0,
    endScale: 4.46,
    moveTime: 2.2,
    moveEase: "power2.inOut",
    moveDelay: 0.2,

    // -- scroll / drag / click, live once the entry finishes --------------
    scrollSpeed: 0.0022, // rad/s of angular velocity per px of wheel delta
    damping: 0.94, // velocity kept per 60fps frame
    maxSpeed: 12, // rad/s, so one flick cannot run away
    dragSpeed: 1,
    snap: true, // settle with a plane facing front
    snapTime: 0.8, // run-in, once the flick itself is spent
    snapFrom: 1, // rad/s under which the ring commits to a slot
    pickTime: 0.55, // click-to-centre: seconds for one slot, root-scaled
    pickEase: "power3.inOut",
    // How much wheel the ring may spend before the page takes the wheel back,
    // so the section can never trap a reader scrolling through it. Spent once
    // per engagement and earned back by reaching for the ring again — see the
    // wheel block in ring.js.
    wheelBudget: 1000, // px of |delta|

    // -- the intro heading, in the scene ---------------------------------
    text: "RESEARCH ARC",
    textSize: 41,
    textFont: "Inter",
    textWeight: 400,
    textTracking: 0, // em
    textAt: 0.42, // fraction of the spread
    textTime: 0.95,
    textStagger: 0.015,
    textEase: "power4.out",
    textOut: true,
    textOutAt: -0.5, // seconds relative to the ring landing; negative = early
    textOutTime: 0.7,
    textOutEase: "power2.in",

    // -- the meta either side of the ring --------------------------------
    // [number . name] left, [era . year] right. Insets and gaps in vw so the
    // pairs hold their relationship as the window changes.
    metaLeft: 5.5,
    metaRight: 5.5,
    metaGapL: 4.7,
    metaGapR: 3.6,
    metaWidth: 34, // this box is the filter region
    nameSize: (24 / 1440) * 100, // vw, quoted at 1440
    nameFont: "Inter",
    nameWeight: 500,
    idxSize: (16 / 1440) * 100, // a step lighter and smaller than the name
    idxFont: "Inter",
    idxWeight: 400,
    listSize: 0.9, // vw; the column's line height is unitless so rows follow

    // The morph between one entry's words and the next.
    nameMorphTime: 1.2,
    nameEase: "circ.out",
    nameBlur: 8.5, // px the outgoing word smears to before it lets go
    nameEdge: 400, // alpha gain — how abruptly the threshold sets
    nameCut: 0.33, // and the alpha it sets at
    nameSoften: 0.35, // px of blur after it, standing in for antialiasing

    // -- glass lip along the top and bottom ------------------------------
    glass: true,
    bandTop: 0.08, // fraction of viewport height
    bandBottom: 0.08,
    refract: 60, // px the image is pulled in at the very edge
    squeeze: 0.05,
    ripple: 5, // px of wave along the lip
    rippleFreq: 0.02,
    fringe: 1.5, // px of chromatic split
    sheen: 0.05,

    // -- pointer ---------------------------------------------------------
    // Nothing is drawn at the cursor. It softens the field around itself,
    // leans the nearest planes toward it and strings honey back between them.
    hover: true,
    touchHold: 0.16, // seconds of near-still press before a finger counts
    touchSlop: 10, // px of travel inside that window that calls it a swipe
    lag: 0.3, // cursor smoothing, per 60fps frame
    melt: 34, // px added to the ring's own blend at the cursor
    meltReach: 260, // px the softening and the wake carry
    reach: 1.7, // lean and swell falloff, in plane long edges
    swell: 0.09,
    pull: 26, // px a plane leans toward the cursor
    grab: 0.14, // how fast a plane takes up a lean, per 60fps frame
    release: 0.06, // and how slowly it lets go — asymmetric on purpose
    web: 0.2, // hovered thread width, as a fraction of the facing edge
    webReach: 1.15,
    wave: 4, // px of capillary wake at full pointer speed
    waveFreq: 0.05,
    waveSpeed: 7,

    // How the cards either side of the hovered one get out of its way. The
    // pointer block above answers to the cursor; these answer to the card.
    sideScale: 0.035,
    sidePush: 17, // px
    sideDim: 0.15,
    sideReach: 2.4, // in plane long edges, measured from the hovered card

    // -- particles behind the hovered card -------------------------------
    focusParticles: true,
    focusParticleFrom: 1024,
    focusParticleReach: 82,
    focusParticleCell: 11,
    focusParticleOpacity: 0.58,
    focusParticleEnter: 0.16,
    focusParticleExit: 0.11,
    focusParticleDrift: 0.7,
    focusParticleOut: 3.2,

    // -- particle-to-image opening --------------------------------------
    // The first atlas cell begins as a four-way mirrored ASCII diamond. It
    // contracts and squares into a large centre card before the ring fires.
    assemble: true,
    assembleFrom: 1024,
    assembleTime: 1.55,
    assembleEase: "power3.inOut",
    assembleSpread: 3.8,
    assembleCardScale: 2.6,
    assembleCell: 13,
    assembleOpacity: 0.96,
    assembleHaloReach: 148,
    assembleHaloOpacity: 0.72,

    // -- the cursor tag, drawn in the same shader pass --------------------
    tagFrom: 1024, // viewport width it needs; below that there is no cursor
    tagText: "Focus",
    tagSize: 14,
    tagWeight: 500,
    tagArrow: 14, // px
    tagGap: 6,
    // Offset off the cursor deliberately: sitting under it, the tag covers
    // the thing being pointed at. World px, so +y is up like posY.
    tagX: 64,
    tagY: -38,
    tagFrost: 0.16,
    tagRim: 0.02,
    tagRefract: 39.5,

    // -- honey between neighbouring planes --------------------------------
    thread: 1.0,
    thin: 0.4,
    pinch: 0.35,
    sag: 6,
    dissolve: 2.9,
    fillet: 14,

    // -- birth of the seed -------------------------------------------------
    wobble: 3,
    goo: 35,
  };
}
