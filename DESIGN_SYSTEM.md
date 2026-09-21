# Roland Cosmo Academic Space — Design System

For AI / implementers. Recreate or extend this product from this document. Do not invent a second visual language.

**Product:** Gunther M. Roland academic space (SYMBION · COSMO). Public faculty homepage + Enter Class + Research workbench.  
**Files:** `roland-cosmo/index.html` + `styles.css` (public site); `class.html` / `research.html` + `hub.css` (hubs).  
**UI copy language:** English only. Chinese is for internal notes, never for on-screen chrome.  
**Do not casually rewrite locked copy.** Skip unreasonable source-MD bits; keep MIT citation links on publications/sources.

---

## 1. What this product is

A physics-faculty academic space, not a startup landing page and not an LMS clone.

| Surface | Route | Role |
|---|---|---|
| Public homepage | `index.html` | Identity, research, teaching, selected work, twin teaser |
| Enter Class | `class.html` | Teaching: Class (online/onsite) and Digital twin |
| Research hub | `research.html` | Research: project list + 3-column workbench with Citta |

**Locked IA**

- Top nav is always **Home / Enter Class / Research**.
- Enter Class splits into **Class | Digital twin**.
- Class then splits into **Online | Onsite**.
- Research workbench is **Citta (collaborator)**, not the teaching twin.
- The teaching twin is a **disclosed simulated AI**, never presented as Professor Roland.
- Homepage CTAs and in-page jumps go to `class.html` / `research.html` (except official MIT citation links).

---

## 2. Style register (do not drift)

Derived from MIT physics / faculty-profile evidence — not a generic “premium dark SaaS” preset.

| Dial | Value | How it shows |
|---|---|---|
| Energy | quiet | Desaturated steel-navy, no neon, no electric `#166cff` |
| Finish | polished | 16px cards, 1px hairlines, Georgia display, no brutal offsets |
| Density | sparse on public screens; denser in workbench | One viewport per homepage section; workbench packs three columns |
| Weight | medium-light | Georgia 400 for titles; Inter 600–700 only on chrome/labels |
| Seriousness | solemn | Academic, archival, laboratory — not playful illustration chrome |

**Material:** Cool ice paper + dusk navy. Public homepage is a sequence of full-viewport “screens.” Hubs sit under a **shared glass topbar** with ice interiors.

**Banned (hard)**

- High-saturation bright blue (`#166cff` and similar electric blues). Use steel `#5c738a` / ice `#a8b8c8`.
- Purple/violet dark, neon glow, glassmorphism-with-glow-borders, cyberpunk dashboards.
- Warm kraft/paper as the main workbench skin.
- Oppressive full-bleed black chat.
- 0-radius “prison” workbench.
- Copying Class’s cosmic split onto the Online/Onsite step.
- Giant unused twin figure inside the twin **chat** desk (figure belongs on the Enter Class **gate** card only).

---

## 3. Color tokens

Shared CSS variables live in `:root` of `styles.css` and `hub.css`.

### 3.1 Core

| Token | Hex / value | Use |
|---|---|---|
| `--navy` | `#061224` | Topbar, homepage hero ground, dark panels |
| `--navy-2` | `#0a1d34` | Slightly lifted navy |
| `--ink` | `#122033` | Body text on light |
| `--blue` | `#5c738a` | Steel accent, eyebrows, links — **not** bright blue |
| `--space-blue` | `#a8b8c8` | Kicker, orbit dots, muted labels on navy |
| `--ice` | `#e8eef6` | Hover wash, chips, raised pills |
| `--space-ice` | `#d7e6f6` | Body on navy (homepage hero support) |
| `--silver` | `#9aabc0` | Meta, timestamps, kicker on light |
| `--muted` | `#5d6d80` | Secondary body |
| `--line` | `rgba(16, 28, 44, .10)` | Hairlines |
| `--paper` | `#eef2f7` | Page ground (cool grey-ice, not kraft) |
| `--white` | `#fff` | Cards, publications screen |
| `--chat` | `#f4f8fc` | Twin/Citta message wells (`hub.css`) |
| `--ok` | `#1a8f63` | Onsite / live / success |
| `--warn` | `#b7812e` | Prototype-only / caution |
| `--neg` | `#9a4a32` | Outlier / exclusion |

### 3.2 Surfaces (recipes, not extra tokens)

| Surface | Recipe |
|---|---|
| Homepage hero | `radial-gradient(ellipse 70% 80% at 78% 44%, #1a3558, transparent 55%)` over `--navy` |
| Research featured card | Dusk gradient `#1c4866 → #163850 → #102a44 → #0c2238` + left radial `#5c94b6` at ~42% |
| Teaching screen | `--navy` + right radial `#1a3558` |
| Assistant screen | `#081525` + right radial `#16345c` |
| Class pane | `#1a3d5c → #123044 → #0b2238` with orbit glow at 78% 48% |
| Twin pane | Dark left `#07111e`, blooming sky `#cfe8f6 / #8fc4de` at 88% 38%, figure on cutout PNG |
| Online card | Solid dusk `#163850`, white type |
| Onsite card | Sage `#e7f1ea`, ink type, idx `#2f6b4e` |
| Split-gate / studio page | Ice `#f2f6fa` |
| Hub / homepage topbar | Official-site glass: homepage dark void glass `rgba(8,12,16,.22)` + `blur(16px)`; hubs light paper glass `color-mix(paper 58%, transparent)` + `blur(18px)` + white hairline + inset highlight |

### 3.3 Type on dark vs light

| Context | Title | Body | Label |
|---|---|---|---|
| Light paper | `--ink` / `--navy` | `--muted` | `--silver` or `#5d7a98` |
| Navy / dusk | `#fff` | `#d5e4f0` or `#b7c6d6` | `#b7cde0` / `--space-blue` |
| Twin pane (dark left) | `#fff` | `#d5e4f0` | `#b7cde0` |

Focus ring: `outline: 3px solid #8aa0b4; outline-offset: 2px`.

---

## 4. Typography

**Pairing**

- Display / titles: `Georgia, "Times New Roman", serif`, weight **400**, tracking `-0.03em` to `-0.045em`.
- UI / labels / body chrome: `Inter, "Helvetica Neue", Arial, sans-serif`.

**Scale (homepage)**

| Role | Spec |
|---|---|
| Hero name `h1` | `clamp(40px, 7.2vh, 88px)/.92` Georgia 400, `#fff` |
| Section `h2` | `clamp(28px, 4.4vh, 44px)/1.12` Georgia 400 |
| Card `h3` | `clamp(22px, 3.2vh, 30px)/1.1` Georgia 400 |
| List `h3` | `clamp(18px, 2.4vh, 24px)/1.15` Georgia 400 |
| Body | 13–16px Inter, line-height 1.55–1.65 |
| Eyebrow / kicker | 10–11px Inter 600–700, letter-spacing `.22em–.28em`, uppercase |
| Nav | 11px Inter 700, letter-spacing `.08em`, uppercase, pill |

**Hub titles:** `h1` `clamp(32px, 5vw, 48px)/1` Georgia; split-head can tighten to `clamp(28px, 4vh, 42px)`.

**Section heading layout (locked)**

- Eyebrow **above** title, **left-aligned**, same left edge as content.
- Title **left-aligned**. Never `text-align: center` or `text-align: right` with a 14ch trap (that stacks words in the optical middle).
- Optional one editorial `<br>` for a two-line couplet (`Reconstructing the first / microseconds of matter.`).
- Measure about `11em–16em` on section titles — two lines max, not four.

**Eyebrow mark:** 28×1px steel rule + 12px gap + uppercase label.

---

## 5. Spacing, radius, chrome

| Token | Value |
|---|---|
| `--header` | `64px` |
| `--screen` | `calc(100dvh - 64px)` |
| `--pad-x` | `clamp(1.4rem, 6vw, 6.5rem)` (homepage) |
| Hub horizontal pad | `clamp(18px, 4vw, 48px)` topbar; `clamp(22px, 4vw, 56px)` split-head |
| `--r` | `16px` (cards, panes, rails) |
| `--r-sm` | `10px` (brand mark, inputs) |
| Pills | `border-radius: 999px` |
| Subbar | `48px` tall, ground `#f4f7fb` |

**Elevation**

- Quiet: none, or `1px` line.
- Pane hover: `translateY(-2px)` + `box-shadow: 0 16px 40px rgba(14, 36, 60, .16)`.
- Assistant card: `0 24px 50px rgba(0, 0, 0, .28)`.

---

## 6. Layout

### 6.1 Homepage — one screen per section

`html` uses `scroll-snap-type: y proximity`. Each `.screen` is exactly `--screen` tall, `overflow: hidden`, snap start.

**Order**

1. `#home` `.space-home` — L/R identity + ENTER CLASS / RESEARCH HUB  
2. `#research` — signal strip + heading + featured QGP card + 02/03 list  
3. `#teaching` — copy left, course panel right  
4. `#publications` — heading left, dropped from the top (`margin-top: clamp(48px, 10vh, 112px)`); paper rows **pinned to the bottom** of the screen  
5. `#cosmo` — twin teaser + companion card  
6. `#sources` + footer (end screen, may scroll)

**Home hero:** full-bleed `.space-frame` with page padding only. Identity cluster left, particle portrait right; columns share the viewport so sides are not empty. Identity stays a tight stack; leftover space sits *between* the two columns. Portrait height `min(62vh, 560px)`.  
**Gate:** compact 2-col strip under a hairline. Each door is italic Georgia `01/02` + locked body, then a **matching ghost pill** (`Enter class` / `Research hub`) under the lede. Hover/focus fills white, navy type, `translateY(-2px)`. Note sits full-width under both.  
**Research:** `.research-grid` = featured card (flex 1) over 02/03 row. Featured card itself is `.72fr` orbit | `1.28fr` copy.  
**Teaching:** `.9fr` intro | `1.1fr` course panel.  
**Publications:** flex column; `.paper-list { margin-top: auto }`. Three MIT Physics profile links.  
**Assistant:** `1fr / 1fr`, copy left, white companion card right.

**Topbar:** same layout on Home / Enter Class / Research (`minmax(160px, 1fr) auto minmax(160px, 1fr)`). Glass recipe follows `官网/cn`: homepage uses translucent dark void glass over navy hero; hubs use frosted paper glass over ice interiors with ink/muted nav (white hover/active chips, 8px radius — not frosted pills on dusk).

Breakpoints: stack hero/teaching/assistant/featured under ~900px; hide desktop nav under ~820px (hamburger).

### 6.2 Enter Class hub (`class.html`)

Column: topbar → (gate has no subbar) → Class | Digital twin subbar on inner views. Landing is the **Class or digital twin** gate.

**Gate (`#enterGate`)** — ice `#f3f7fa`. Hero `ENTER CLASS` + `Class or digital twin.` Two equal cards + bottom rail:

- **01 Class (Knowledge):** navy `#153B55`. Copy + `ENTER CLASS →`. Knowledge orbits follow interlocking ellipses (wide dashed ice track + solid teal/ice rings at complementary angles + soft planetary core) — not concentric circles. Physics/Data/Notebook chips are **glass** (`blur 18px`, translucent ice fill, inset highlight) — not solid navy tiles. Online / Onsite are secondary metadata, not the primary CTA.
- **02 Digital twin (Intelligence):** ice panel. Copy + `CONNECT WITH TWIN →`. Professor figure ≤ ~46% width with light fade. Identity chip + Simulated AI metadata (not a CTA).
- **Rail:** 01 Knowledge / 02 Intelligence — two equal entries, no student Growth/profile step.

`ENTER CLASS` opens the Class studio. `CONNECT WITH TWIN` opens the twin workbench. `?branch=class` still opens studio; `?branch=twin` opens twin.

**Studio (`#modeView`)** — ice. Class path only: Online / Onsite. No Digital Twin card here (Twin is chosen on the gate or via the Class | Digital twin subbar).

- **Left (wide):** locked heading `Online or onsite.` + two meeting cards. Online `#163850`, Onsite `#e7f1ea`. Cards sit under the title and fill the width.
- **Right:** Upcoming (online seminar), Next onsite, Class info. White cards, navy `Enter class` pill.
- **Rail:** 01 Type (active + check) / 02 Session pending — two steps only.

**Class desk:** ice page, next-session navy banner, class rows with `online` ice pill or `onsite` sage pill.

**Twin desk:** academic workbench, not a chat clone. Ice canvas `#f3f7fa`. Three independent scrolls.

| | Professor desk | Student view |
|---|---|---|
| Grid | `236px / 1fr / 292px` | `1fr / 292px` |
| Left | Student threads (active + resolved). Initials wells. | Hidden |
| Center | Twin identity header · disclosure · editorial conversation (max ~880px) · composer | Same, asks the twin |
| Right | Student · Course context · Sources (3) · Twin profile | Course context · Sources · Twin profile |
| Student turn | Name · Student · time, white bubble, left | You · Student, right |
| Twin turn | Gunther M. Roland · Digital twin, ice panel, left. 28px face in the label only | Same, left |
| Evidence | Independent card, not inside a bubble | Same |
| Decision | Independent card: reason + PRESERVED / REQUIRED / NEW + Confirm | Same (read) |
| Professor record | Compact navy bubble, right | Ice bubble labelled Professor Roland, left |
| Stickers | Tray in composer; optional in-thread sticker as content | Hidden |

Header title is **Digital twin** (Georgia) only — no Active/online dot. The twin is disclosed simulated AI with no presence state. Breadcrumb is `Class / Digital twin` — do not repeat Professor in the crumb. Avatars: 40px in the twin header and right profile only. Scope twin conversation styles to `.twin .msgs` so Citta is not affected. Sticker tiles stay `#f6f6f6`. Right rail hidden under 1280px; threads become a horizontal strip under 820px.

### 6.3 Research hub (`research.html`)

Overview: project cards in a 3-col grid.  
Workbench **left smallest, middle next, right largest**:

```
grid-template-columns: minmax(168px, 16%) minmax(280px, 32%) minmax(380px, 52%);
```

Left rail = files/nav. Middle = Citta (research collaborator). Right = inspector / outputs (largest).  
Citta You-bubbles hug the right next to the avatar.

---

## 7. Motion

| Element | Behavior |
|---|---|
| Cosmic rings / tracks | `orbit-spin` linear infinite, 14–42s, alternate reverse |
| Nebula | `nebula-breathe` 7.5s ease-in-out |
| Dust | `twinkle` ~3.6s |
| Homepage / course orbit rings | Four ellipses, static. Depth via stroke, not element opacity (particles stay independent): p1 dashed faint, p2 brightest/closest, p3 mid, p4 thinnest/darkest. |
| Homepage / course orbit particles | Ride ellipse via rotating `i::after`, 14–26s. Default 1.5px pinpricks; two medium (3px); **only two large** (8px) with bloom. Core nucleus stays the brightest. |
| Featured card gradient | Static; particles move on rings |
| Reduced motion | Kill orbit/nebula/dust/path animations |
| Pane hover | 0.2–0.25s `translateY(-2px)` |

Do not add high-frequency bounce or neon pulse.

---

## 8. Components (recipes)

**Brand mark:** 34×34, 10px radius, 1px ice border, `GR` 10px Inter 700.

**Nav pill:** 9×16 padding, 999px radius; idle transparent; hover ice wash; active = frosted white `rgba(255,255,255,.78)` + `#061224` type.

**Primary button (light):** navy fill, white type, 999px (`btn.ink`).  
**Primary on navy:** matching ghost pills (`.space-btn`, min 176×42, 999px radius). Each door is `01/02` + lede, pill under the copy. Hover/focus fills white, navy type, `translateY(-2px)`.

**Signal strip:** white rounded `--r` bar, 4 cells, 9px labels + Georgia values.

**Featured research card:** 16px radius, dusk gradient, left orbit field (transparent over card gradient), right copy with **soft** left-to-right navy veil (`transparent → rgba(8,28,48,.28)`), not a hard two-tone split.

**Studio cards:** 16px radius. Online `#163850` / Onsite `#e7f1ea`, sitting in the Class studio left column.

**Paper row:** `70px 1fr 40px` — italic Georgia index, title, `↗`. Hover ice wash. Links go to MIT Physics faculty profile.

**Disclosure:** left steel rule 3px + ice well. Twin always labelled simulated AI.

**Stickers:** `roland-cosmo/assets/roland-twin/*.png` — thinking, great, on-it, awesome, hmm, take-your-time (caption baked into art). Professor-only send; tray hover lifts and scales the thumb in place (no floating duplicate card).

**Toast:** navy, 8px radius, bottom center, prototype-only copy.

---

## 9. Assets

| File | Use |
|---|---|
| `assets/gunther-roland-supplied.jpg` | Homepage particle portrait source |
| `assets/roland-twin/figure-cut.png` | Gate twin figure (transparent) |
| `assets/roland-twin/figure.png` | Original black-bg; do not put on light/sky without cutout |
| `assets/roland-twin/avatar.png` | Figma poster-ui avatar (2427:10629); topbar, twin header, chat turns |
| `assets/roland-twin/face.png` | Same export as avatar (legacy path) |
| `assets/roland-twin/*.jpg` | Professor sticker pack |

---

## 10. Copy & routing rules for AI

- On-screen strings stay **English**. Do not translate UI.
- Do not rewrite faculty facts; sources are MIT Physics / Open Learning / OCW (accessed 2026-09-14). Prototype is **not** an official MIT product — keep that disclosure.
- Twin: every reply disclosed as simulated AI; not the professor.
- Citta: research collaborator in the workbench.
- Query: `class.html?branch=twin&role=student|prof`, `?mode=online|onsite`; `research.html?project=pendulum`.
- Prototype actions toast “Prototype only — …” rather than fake success.

---

## 11. Implementation map

| Concern | File |
|---|---|
| Homepage layout + tokens | `styles.css` |
| Particle portrait | `particle-field.js` |
| Homepage chat drawer (legacy companion) | `app.js` |
| Enter Class + Research chrome, twin, workbench | `hub.css` |
| Class / twin / mode routing | `class.js` |
| Research workbench | `research.js` |

Cache-bust query on CSS/JS when shipping visual changes (`styles.css?v=`, `hub.css?v=`).

---

## 12. Quality bar (reject if)

1. Section titles sit in the optical center as a narrow right-aligned stack.  
2. Publications list floats high with a large empty well under the last row — pin the list to the bottom of the screen.  
3. Online/Onsite looks like Class/Twin (full-bleed cosmic vs empty ice).  
4. Twin figure has a black rectangle, or dark clothes vanish into a light sky (`mix-blend: lighten` on a light field).  
5. Bright electric blue, purple-dark, or kraft workbench.  
6. Student “You” bubbles sit left with empty space on the right.  
7. Twin chat and Citta bubble alignment leak styles into each other.  
8. Chinese UI chrome on the public or hub pages.

When adding a screen: ice or dusk, Georgia display left-aligned, Inter chrome, steel accent, 16px radius, one heat zone (orbit, sky bloom, or figure) — not three competing effects.
