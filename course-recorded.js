const COURSES = {
  "live-ml": {
    mode: "Live",
    modeClass: "is-live",
    title: "Data Analysis & Machine Learning",
    meta: "Online Lecture (Live) / CIS / 10.17-12.27",
    lectures: [
      ["01", "Course kickoff", "Tools, datasets, and live schedule", "48m"],
      ["02", "Feature pipelines", "Cleaning and transforms", "52m"],
      ["03", "Model lab", "Baselines and diagnostics", "55m"],
      ["04", "Live review", "Project mid-check", "45m"],
    ],
  },
  subatomic: {
    mode: "Recorded",
    modeClass: "is-recorded",
    title: "Introduction to experimental subatomic physics",
    meta: "Recorded Lecture / CIS / Join any time",
    lectures: [
      ["01", "Detectors overview", "Tracking, calorimetry, PID", "42m"],
      ["02", "Trigger basics", "From collision to readout", "38m"],
      ["03", "Data taking", "Runs, luminosity, quality", "44m"],
      ["04", "Analysis sketch", "From raw to physics plot", "40m"],
    ],
  },
  "cis-research": {
    mode: "Research",
    modeClass: "is-research",
    title: "CIS Research",
    meta: "Online research track / CIS / 1.15-3.28",
    lectures: [
      ["01", "Research brief", "Scope and milestones", "36m"],
      ["02", "Method clinic", "Design choices and checks", "41m"],
      ["03", "Progress review", "Results and next steps", "39m"],
      ["04", "Final readout", "Talk and write-up", "47m"],
    ],
  },
};

const id = new URLSearchParams(location.search).get("id") || (window.ACTIVE_SLUG ? "lecture" : "subatomic");
const course = window.ACTIVE_SLUG
  ? (window.ACTIVE_COURSES && (window.ACTIVE_COURSES[id] || window.ACTIVE_COURSES.lecture))
  : (COURSES[id] || COURSES.subatomic);

const titleEl = document.getElementById("courseTitle");
const metaEl = document.getElementById("courseMeta");
const listEl = document.getElementById("lectureList");
const nowEl = document.getElementById("nowPlaying");
const modeEl = document.querySelector(".course-mode");

if (titleEl) titleEl.textContent = course.title;
if (metaEl) metaEl.textContent = course.meta;
if (modeEl) {
  modeEl.textContent = course.mode || "Recorded";
  modeEl.className = `course-mode ${course.modeClass || "is-recorded"}`;
}
document.title = `${course.title} - Class - ${window.TWIN_FULL || "Gunther M. Roland"}`;

if (listEl) {
  listEl.innerHTML = course.lectures
    .map(
      ([n, name, blurb, dur], i) => `
    <li>
      <a href="#l${n}" class="${i === 0 ? "is-active" : ""}" data-title="${n} / ${name}">
        <em>${n}</em>
        <div><b>${name}</b><span>${blurb}</span></div>
        <time>${dur}</time>
      </a>
    </li>`,
    )
    .join("");

  const clock = document.querySelector(".course-stage-caption span:last-child");
  const showClock = (dur) => {
    if (!clock) return;
    clock.textContent = dur || (window.ACTIVE_SLUG ? "October 2026" : "");
  };
  if (nowEl && course.lectures[0]) {
    const [n, name, , dur] = course.lectures[0];
    nowEl.textContent = `${n} / ${name}`;
    showClock(dur);
  }

  listEl.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    listEl.querySelectorAll("a").forEach((x) => x.classList.remove("is-active"));
    a.classList.add("is-active");
    if (nowEl) nowEl.textContent = a.dataset.title || a.textContent.trim();
    showClock(a.querySelector("time")?.textContent || "");
  });
}

document.getElementById("playBtn")?.addEventListener("click", () => {
  document.querySelector("[data-open-chat]")?.click();
});
