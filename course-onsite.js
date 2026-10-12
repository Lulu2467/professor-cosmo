(function () {
const SESSIONS = {
  lab: {
    kind: "Laboratory",
    title: "Junior Lab 8.13 / 8.14",
    meta: "Laboratory & communication / Fall 2025 / Spring 2026",
    room: "Rm 26-028",
    when: "Tue 14:00-17:00",
    bring: "Lab notebook, USB drive",
    cta: "Enter today's lab",
    todayKicker: "Today's lab focus",
    todayTitle: "Lab block A / Oscilloscope & timing",
    todayGoal:
      "Measure signal timing on the scope, capture uncertainties in the notebook, and prepare a 90-second oral update for the TA.",
    tasks: [
      ["01", "Set up the scope and verify the probe compensation."],
      ["02", "Record three timing runs with explicit uncertainty."],
      ["03", "Draft the oral update: method, result, one doubt."],
    ],
    materials: [
      ["Guide", "Oscilloscope timing brief (PDF)"],
      ["Template", "Notebook page checklist"],
      ["Reference", "Uncertainty quick card"],
    ],
    submit: [
      ["Upload notebook photo", "image"],
      ["Submit timing CSV", "file"],
    ],
    schedule: [
      ["Tue", "Lab block A", "Oscilloscope & timing", "14:00", true],
      ["Thu", "Lab block B", "Data reduction", "14:00", false],
      ["Tue", "Oral check", "Notebook review", "15:30", false],
    ],
    peopleTitle: "On the floor",
    peopleBody: "Prof. Roland and lab TAs rotate through benches during the block.",
    accessTitle: "Room access",
    accessBody: "Building 26 / room 26-028. Arrive a few minutes early to claim a station.",
    chatSeed: "Ask about today's timing measurement, notebook format, or uncertainty reporting.",
  },
  seminar: {
    kind: "Seminar",
    title: "Heavy Ion Physics Group Seminar",
    meta: "MIT onsite seminar / Fall 2025 / Spring 2026",
    room: "Rm 26-414",
    when: "Wed 15:00-16:30",
    bring: "Notebook or tablet for notes",
    cta: "Enter seminar room",
    todayKicker: "Today's seminar",
    todayTitle: "Group talk / soft physics updates",
    todayGoal:
      "Follow the speaker, capture one question for discussion, and note any cross-links to Junior Lab or CMS analysis work.",
    tasks: [
      ["01", "Skim the seminar abstract before entering."],
      ["02", "Write one clarifying question during the talk."],
      ["03", "Post a short takeaway after the Q&A."],
    ],
    materials: [
      ["Agenda", "Seminar schedule"],
      ["Slides", "Speaker deck (when posted)"],
      ["Notes", "Shared takeaway board"],
    ],
    submit: [
      ["Post takeaway note", "note"],
      ["Upload question card", "file"],
    ],
    schedule: [
      ["Wed", "Talk", "Soft physics updates", "15:00", true],
      ["Wed", "Q&A", "Open discussion", "15:50", false],
      ["Wed", "Close", "Announcements", "16:20", false],
    ],
    peopleTitle: "Attendees",
    peopleBody: "Heavy-ion group members, students, and invited guests.",
    accessTitle: "Seminar room",
    accessBody: "Rm 26-414. Arrive a few minutes early; seating is open.",
    chatSeed: "Ask for a plain-language summary of today's talk, or help drafting a discussion question.",
  },
};

const id = new URLSearchParams(location.search).get("id") || (window.ACTIVE_SLUG ? "none" : "lab");
const session = window.ACTIVE_SLUG
  ? (window.ACTIVE_SESSIONS && (window.ACTIVE_SESSIONS[id] || window.ACTIVE_SESSIONS.none))
  : (SESSIONS[id] || SESSIONS.lab);

const setText = (sel, value) => {
  const el = document.getElementById(sel);
  if (el) el.textContent = value;
};

setText("modeLabel", session.kind);
setText("courseTitle", session.title);
setText("courseMeta", session.meta);
setText("roomCode", session.room);
setText("sessionWhen", session.when);
setText("roomHint", session.bring);
setText("todayKicker", session.todayKicker);
setText("todayTitle", session.todayTitle);
setText("todayGoal", session.todayGoal);
setText("peopleTitle", session.peopleTitle);
setText("peopleBody", session.peopleBody);
setText("accessTitle", session.accessTitle);
setText("accessBody", session.accessBody);
setText("chatSeed", session.chatSeed);

const enterBtn = document.getElementById("enterBtn");
if (enterBtn) {
  const label = enterBtn.querySelector("span");
  if (label) label.textContent = session.cta;
}

document.title = `${session.title} - Onsite - ${window.TWIN_FULL || "Gunther M. Roland"}`;
document.body.dataset.onsiteKind = id;

const taskList = document.getElementById("taskList");
if (taskList) {
  taskList.innerHTML = session.tasks
    .map(
      ([n, text]) => `
    <li>
      <em>${n}</em>
      <span>${text}</span>
      <button type="button" class="task-check" data-task="${n}" aria-pressed="false" aria-label="Mark task ${n} done">Done</button>
    </li>`,
    )
    .join("");
}

const materialList = document.getElementById("materialList");
if (materialList) {
  materialList.innerHTML = session.materials
    .map(
      ([kind, name]) => `
    <li>
      <em>${kind}</em>
      <button type="button" class="text-link" data-material="${name}">${name}</button>
    </li>`,
    )
    .join("");
}

const submitRow = document.getElementById("submitRow");
if (submitRow) {
  submitRow.innerHTML = session.submit
    .map(
      ([label, kind]) => `
    <button type="button" class="submit-chip" data-submit="${kind}">${label}</button>`,
    )
    .join("");
}

const list = document.getElementById("sessionList");
if (list) {
  list.innerHTML = session.schedule
    .map(
      ([day, name, blurb, time, next]) => `
    <li class="${next ? "is-next" : ""}">
      <em>${day}</em>
      <div><b>${name}</b><span>${blurb}</span></div>
      <time>${time}</time>
    </li>`,
    )
    .join("");
}

const toast = (text) => {
  const el = document.getElementById("joinToast");
  if (!el) return;
  el.hidden = false;
  el.textContent = text;
  el.classList.add("is-on");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove("is-on");
    setTimeout(() => {
      el.hidden = true;
    }, 220);
  }, 2600);
};

document.getElementById("enterBtn")?.addEventListener("click", () => {
  toast(`Entered: ${session.todayTitle} (prototype session).`);
  document.querySelector(".session-now")?.classList.add("is-live");
});

document.getElementById("taskList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".task-check");
  if (!btn) return;
  const on = btn.getAttribute("aria-pressed") === "true";
  btn.setAttribute("aria-pressed", String(!on));
  btn.textContent = on ? "Done" : "Checked";
  btn.closest("li")?.classList.toggle("is-done", !on);
});

document.getElementById("materialList")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-material]");
  if (!btn) return;
  toast(`Opened material: ${btn.dataset.material} (prototype).`);
});

document.getElementById("submitRow")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-submit]");
  if (!btn) return;
  const kind = btn.dataset.submit;
  if (kind === "image" || kind === "file" || kind === "note") {
    document.querySelector("#attachFile")?.click();
  }
  else {
    document.querySelector("[data-open-chat]")?.click();
    const input = document.querySelector("#chatInput");
    if (input) input.value = "Here is my short note for today: ";
  }
  toast("Submission flow opened in this prototype.");
});
})();
