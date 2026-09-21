(() => {
  const CLASSES = {
    online: { id: "sem", mode: "online", name: "Heavy-ion seminar", meta: "Zoom · Wed 11:00 · 24 students", action: "Open link" },
    onsite: { id: "jl", mode: "onsite", name: "Junior Lab 8.13 / 8.14", meta: "Rm 26-028 · Tue / Thu 14:00 · 18 students", action: "Enter room" }
  };
  const STICKER_ASSET_V = 3;
  const STICKERS = [
    { id: "thinking", src: "assets/roland-twin/thinking.png?v=3", label: "Thinking…" },
    { id: "great", src: "assets/roland-twin/great.png?v=3", label: "Great!" },
    { id: "on-it", src: "assets/roland-twin/on-it.png?v=3", label: "On it…" },
    { id: "awesome", src: "assets/roland-twin/awesome.png?v=3", label: "Awesome!" },
    { id: "hmm", src: "assets/roland-twin/hmm.png?v=3", label: "Hmm…" },
    { id: "wait", src: "assets/roland-twin/take-your-time.png?v=3", label: "Take your time" }
  ];
  const THREADS = [
    { id: "t1", name: "Maya Chen", initials: "MC", question: "Do we exclude the 978 outlier before the mean?", time: "2m ago", status: "active" },
    { id: "t2", name: "Eli Vargas", initials: "EV", question: "What should the lab notebook include tonight?", time: "12m ago", status: "active" },
    { id: "t3", name: "James Smith", initials: "JS", question: "How is the uncertainty calculated for the final result?", time: "1h ago", status: "resolved" },
    { id: "t4", name: "Liu Tao", initials: "LT", question: "Can you explain the difference between the two methods in the lab?", time: "2h ago", status: "resolved" },
    { id: "t5", name: "Sarah Kim", initials: "DS", question: "What does the graph in Fig. 3 show?", time: "3h ago", status: "resolved" },
    { id: "t6", name: "Daniel Wu", initials: "DV", question: "Is the sample size sufficient for this experiment?", time: "5h ago", status: "resolved" }
  ];
  const TURNS = {
    t1: [
      { kind: "student", who: "Maya Chen", text: "Do we exclude the 978 outlier before the mean?", time: "10:24 AM" },
      { kind: "twin", who: "Gunther M. Roland", text: "A suspected value stays in the source. Exclusion needs explicit confirmation, then a new derived run — not a silent rewrite.", time: "10:26 AM" },
      { kind: "evidence", title: "Course analysis practice", meta: "Junior Lab · 8.13 / 8.14", note: "Exclusion, notebooks, and claims" },
      { kind: "decision", title: "Exclude 978 from the derived mean.", reason: "Write the exclusion decision in the notebook.", flags: [
        { label: "Original row", value: "Preserved" },
        { label: "Notebook", value: "Required" },
        { label: "Derived run", value: "New" }
      ] },
      { kind: "confirmed", text: "Yes — exclude 978 after you write the decision in the notebook. Keep the original row.", time: "10:28 AM" }
    ],
    t2: [
      { kind: "student", who: "Eli Vargas", text: "What should the lab notebook include tonight?", time: "10:12 AM" },
      { kind: "twin", who: "Gunther M. Roland", sticker: "on-it", text: "Junior Lab asks for experimental practice, data analysis, and a written claim with uncertainties. Start with the measurement question, then the assumption you are testing.", time: "10:13 AM" },
      { kind: "evidence", title: "Lab notebook template", meta: "Junior Lab · 8.13 / 8.14", note: "MIT OpenCourseWare · course materials" },
      { kind: "twin", who: "Gunther M. Roland", sticker: "wait", text: "Take the write-up slowly. Record the assumption before you compute.", time: "10:14 AM" }
    ],
    t3: [
      { kind: "student", who: "James Smith", text: "How is the uncertainty calculated for the final result?", time: "9:18 AM" },
      { kind: "twin", who: "Gunther M. Roland", text: "Report the combined uncertainty from the measurements you actually took. Do not inherit a value from a sample notebook.", time: "9:21 AM" }
    ],
    t4: [
      { kind: "student", who: "Liu Tao", text: "Can you explain the difference between the two methods in the lab?", time: "8:04 AM" },
      { kind: "twin", who: "Gunther M. Roland", text: "One method estimates from a single run. The other compares two independent determinations. Record both, then state which claim you are making.", time: "8:07 AM" }
    ],
    t5: [
      { kind: "student", who: "Sarah Kim", text: "What does the graph in Fig. 3 show?", time: "7:40 AM" },
      { kind: "twin", who: "Gunther M. Roland", text: "Fig. 3 is a derived plot. Caption the axes, the cut, and the claim before you interpret the shape.", time: "7:44 AM" }
    ],
    t6: [
      { kind: "student", who: "Daniel Wu", text: "Is the sample size sufficient for this experiment?", time: "Yesterday" },
      { kind: "twin", who: "Gunther M. Roland", text: "Sufficiency is a claim. State the precision you need, then say whether the present run supports it.", time: "Yesterday" }
    ]
  };

  const studio = document.getElementById("modeView");
  const desk = document.getElementById("classDesk");
  const twin = document.getElementById("twinView");
  const gate = document.getElementById("enterGate");
  const hub = document.getElementById("main");
  const crumb = document.getElementById("crumb");
  const toast = document.getElementById("toast");
  const msgs = document.getElementById("twinMsgs");
  const input = document.getElementById("twinInput");
  const tray = document.getElementById("stickerTray");
  const threadList = document.getElementById("threadList");
  let timer;
  let role = "prof";
  let thread = "t1";
  const decided = {};

  const say = (text) => {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const stickerSrc = (id) => STICKERS.find((s) => s.id === id)?.src || `assets/roland-twin/hmm.png?v=${STICKER_ASSET_V}`;
  const Q_FACE = "assets/roland-twin/avatar.png?v=1";
  const currentThread = () => THREADS.find((t) => t.id === thread) || THREADS[0];
  const proto = () => say("Prototype only — this control is not connected");

  const docIcon = `<span class="doc-ico" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M6 3.5h5.2L14.5 7v9.5H6z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M11.2 3.5V7H14.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></span>`;

  const turnHead = (name, label, time, ava, mirror) => mirror
    ? `<header class="turn-h">
        <time>${time || ""}</time>
        <span>${name} · ${label}</span>
      </header>`
    : `<header class="turn-h">
        ${ava || ""}
        <span>${name} · ${label}</span>
        <time>${time || ""}</time>
      </header>`;

  const renderTurn = (t) => {
    if (t.kind === "student") {
      const who = role === "student" ? "You" : t.who;
      const label = role === "student" ? "Student" : "Student";
      const side = role === "student" ? "me" : "";
      if (side) {
        return `<article class="turn student me">
          <div class="turn-stack">
            ${turnHead(who, label, t.time, "", true)}
            <div class="bubble student">${t.text}</div>
          </div>
        </article>`;
      }
      return `<article class="turn student">
        ${turnHead(who, label, t.time)}
        <div class="bubble student">${t.text}</div>
      </article>`;
    }
    if (t.kind === "twin") {
      const sticker = t.sticker ? `<img class="sticker" src="${stickerSrc(t.sticker)}" alt="">` : "";
      const ava = `<img class="ava q tiny" src="${Q_FACE}" alt="">`;
      const side = role === "prof" ? "me" : "";
      if (side) {
        return `<article class="turn from-twin me">
          <div class="turn-stack">
            ${turnHead("Gunther M. Roland", "Digital twin", t.time, ava, true)}
            ${sticker}
            <div class="bubble twin">${t.text}</div>
          </div>
          ${ava}
        </article>`;
      }
      return `<article class="turn from-twin">
        ${turnHead("Gunther M. Roland", "Digital twin", t.time, ava)}
        ${sticker}
        <div class="bubble twin">${t.text}</div>
      </article>`;
    }
    if (t.kind === "evidence") {
      const side = role === "prof" ? " me" : "";
      return `<article class="work-card evidence-card${side}">
        <span class="k">Evidence</span>
        <div class="ev-row">
          ${docIcon}
          <div>
            <b>${t.title}</b>
            <small>${t.meta}</small>
            ${t.note ? `<small>${t.note}</small>` : ""}
          </div>
          <button type="button" class="text-link" data-view-source>View source →</button>
        </div>
      </article>`;
    }
    if (t.kind === "decision") {
      const on = !!decided[thread];
      const flags = (t.flags || []).map((f) => `<li><span>${f.label}</span><i class="flag">${f.value}</i></li>`).join("");
      const side = role === "prof" ? " me" : "";
      return `<article class="work-card decision-card${on ? " is-on" : ""}${side}">
        <span class="k">Decision</span>
        <div class="decision-body">
          <div>
            <h3>${t.title}</h3>
            <p><span>Reason</span>${t.reason}</p>
          </div>
          <ul class="flags">${flags}</ul>
        </div>
        <button type="button" class="btn ink" data-confirm-decision ${on ? "disabled" : ""}>${on ? "Confirmed" : "Confirm decision →"}</button>
      </article>`;
    }
    const who = role === "prof" ? "You" : "Professor Roland";
    const side = role === "prof" ? "me" : "";
    const sticker = t.sticker ? `<img class="sticker" src="${stickerSrc(t.sticker)}" alt="">` : "";
    const text = t.label || t.text || "";
    const bubble = text ? `<div class="bubble prof">${text}</div>` : "";
    const ava = `<img class="ava q tiny" src="${Q_FACE}" alt="">`;
    if (side) {
      return `<article class="turn prof me">
        <div class="turn-stack">
          ${turnHead(who, t.kind === "confirmed" ? "Confirmed" : "Professor", t.time || "", ava, true)}
          ${sticker}${bubble}
        </div>
        ${ava}
      </article>`;
    }
    return `<article class="turn prof">
      ${turnHead(who, t.kind === "confirmed" ? "Confirmed" : "Professor", t.time || "", ava)}
      ${sticker}${bubble}
    </article>`;
  };

  const paintThreads = () => {
    const active = THREADS.filter((t) => t.status === "active");
    const resolved = THREADS.filter((t) => t.status === "resolved");
    const item = (t) => `
      <button class="thread-item${t.id === thread ? " on" : ""}" type="button" data-thread="${t.id}">
        <span class="well">${t.initials}</span>
        <span>
          <b>${t.name}<time>${t.time}</time></b>
          <small>${t.question}</small>
        </span>
      </button>`;
    threadList.innerHTML = `${active.map(item).join("")}
      <p class="thread-group">Resolved</p>
      ${resolved.map(item).join("")}`;
  };

  const paintThread = () => {
    msgs.innerHTML = (TURNS[thread] || []).map(renderTurn).join("");
    const t = currentThread();
    input.placeholder = role === "student" ? "Ask the twin…" : "Reply as professor…";
    input.setAttribute("aria-label", role === "student" ? "Ask the twin" : "Reply as professor");
    document.getElementById("sideName").textContent = t.name;
    document.getElementById("sideInitials").textContent = t.initials;
    document.getElementById("sideCourse").textContent = "Junior Lab · 8.13 / 8.14";
    document.getElementById("sideStudent").hidden = role === "student";
    tray.hidden = role !== "prof";
    twin.dataset.role = role;
    document.querySelectorAll(".role-switch [data-role]").forEach((b) => b.classList.toggle("on", b.dataset.role === role));
    crumb.innerHTML = `Class / <b>Digital twin</b>`;
    paintThreads();
    msgs.scrollTop = 0;
  };

  const setRole = (next) => {
    role = next === "student" ? "student" : "prof";
    paintThread();
  };

  const show = (which) => {
    [gate, studio, desk, twin].forEach((el) => { el.hidden = el !== which; });
    hub.dataset.view = which === gate ? "gate" : which === twin ? "twin" : which === desk ? "desk" : "studio";
    document.body.dataset.view = hub.dataset.view;
    document.querySelectorAll("[data-branch]").forEach((b) => {
      b.classList.toggle("on", (which === twin && b.dataset.branch === "twin") || (which !== twin && b.dataset.branch === "class"));
    });
  };

  const openGate = () => {
    crumb.innerHTML = `Class / Digital twin`;
    show(gate);
  };

  const openStudio = () => {
    crumb.textContent = "Class";
    show(studio);
  };

  const openTwin = (nextRole) => {
    if (nextRole) setRole(nextRole);
    else paintThread();
    show(twin);
  };

  const openDesk = (kind) => {
    const c = CLASSES[kind];
    document.getElementById("nextName").textContent = c.name;
    document.getElementById("nextMeta").textContent = c.meta;
    document.getElementById("enterSession").textContent = c.action;
    document.getElementById("classLead").textContent = kind === "online" ? "Online · 1 class" : "Onsite · 1 class";
    document.getElementById("classCount").textContent = kind === "online" ? "1 online" : "1 onsite";
    document.getElementById("classList").innerHTML = `
      <button class="class-row" type="button" data-open-class>
        <span class="mode ${c.mode}">${c.mode}</span>
        <span><b>${c.name}</b><small>${c.meta}</small></span>
        <span class="ghost">Open</span>
      </button>`;
    crumb.innerHTML = `Class / <b>${c.mode}</b>`;
    show(desk);
    document.querySelector("[data-open-class]")?.addEventListener("click", () => say("Prototype only — session tools are not connected"));
  };

  tray.innerHTML = STICKERS.map((s) => `<button type="button" data-sticker="${s.id}" aria-label="${s.label}"><img src="${s.src}" alt=""></button>`).join("");

  document.querySelectorAll("[data-enter-class]").forEach((el) => {
    const go = (e) => {
      if (e.target.closest("[data-mode]")) return;
      openStudio();
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      go(e);
    });
  });
  document.querySelectorAll("[data-open-twin]").forEach((b) => {
    const go = () => openTwin("prof");
    b.addEventListener("click", go);
    b.addEventListener("keydown", (e) => {
      if (e.target !== b) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      go();
    });
  });
  document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    openDesk(b.dataset.mode);
  }));
  document.querySelectorAll("[data-back-mode]").forEach((b) => b.addEventListener("click", openStudio));
  document.querySelectorAll("[data-branch]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.branch === "twin") openTwin(role);
    else openStudio();
  }));
  document.querySelectorAll(".role-switch [data-role]").forEach((b) => b.addEventListener("click", () => setRole(b.dataset.role)));
  threadList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-thread]");
    if (!btn) return;
    thread = btn.dataset.thread;
    paintThread();
  });
  document.querySelector("[data-filter-threads]")?.addEventListener("click", proto);
  document.querySelector("[data-view-profile]")?.addEventListener("click", proto);
  document.querySelectorAll(".source-list li").forEach((li) => {
    li.tabIndex = 0;
    li.addEventListener("click", proto);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); proto(); }
    });
  });
  msgs.addEventListener("click", (e) => {
    if (e.target.closest("[data-view-source]")) {
      proto();
      return;
    }
    const confirm = e.target.closest("[data-confirm-decision]");
    if (!confirm || confirm.disabled) return;
    decided[thread] = true;
    paintThread();
    msgs.scrollTop = msgs.scrollHeight;
    say("Prototype only — decision was not recorded");
  });
  tray.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sticker]");
    if (!btn || role !== "prof") return;
    const s = STICKERS.find((x) => x.id === btn.dataset.sticker);
    if (!s) return;
    msgs.insertAdjacentHTML("beforeend", renderTurn({ kind: "prof", sticker: s.id }));
    msgs.scrollTop = msgs.scrollHeight;
    say("Prototype only — sticker was not sent");
  });
  document.getElementById("twinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) { input.focus(); return; }
    const text = input.value.trim();
    input.value = "";
    msgs.insertAdjacentHTML("beforeend", renderTurn(role === "student"
      ? { kind: "student", who: "You", text }
      : { kind: "prof", text }));
    msgs.scrollTop = msgs.scrollHeight;
    say("Prototype only — no message was sent");
  });

  document.getElementById("enterSession").addEventListener("click", () => say("Prototype only — live session is not connected"));
  document.getElementById("newClass").addEventListener("click", () => say("Prototype only — New class is not connected"));

  const menu = document.getElementById("menuButton");
  menu.addEventListener("click", () => {
    const open = document.querySelector(".topbar").classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });

  const params = new URLSearchParams(location.search);
  if (params.get("branch") === "twin" || location.hash === "#twin") {
    openTwin(params.get("role") === "student" ? "student" : "prof");
  } else if (params.get("mode") === "online" || params.get("mode") === "onsite") {
    openDesk(params.get("mode"));
  } else if (params.get("branch") === "class") {
    openStudio();
  } else {
    openGate();
  }
})();
