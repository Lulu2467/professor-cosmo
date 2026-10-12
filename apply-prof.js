function clip(text, limit) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const space = cut.lastIndexOf(" ");
  return `${(space > 40 ? cut.slice(0, space) : cut).trim()}…`;
}

const ARROW = `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.1195 15.2675V3.74375L2.80511 17.0563L2.14136 16.3925L15.4557 3.07813H3.93198V2.14062H17.057V15.2656H16.1195V15.2675Z" fill="currentColor"/></svg>`;

function svgPortrait(initials, round) {
  const safe = String(initials || "").replace(/[&<>"]/g, "");
  const svg = round
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="#10233d"/><text x="64" y="72" text-anchor="middle" font-family="Inter,sans-serif" font-size="36" font-weight="600" fill="#ffffff">${safe}</text></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1067" viewBox="0 0 800 1067"><rect width="800" height="1067" fill="#efe6d6"/><text x="400" y="560" text-anchor="middle" font-family="Inter,sans-serif" font-size="132" font-weight="600" fill="#10233d">${safe}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

(() => {
  const finish = () => document.documentElement.classList.remove("prof-pending");
  try {
    const slug = new URLSearchParams(location.search).get("p");
    const roster = window.LECTURE_ROSTER || [];
    const prof = slug && slug !== "gunther-roland" ? roster.find((p) => p.slug === slug) : null;
    if (!prof) return;

    window.ACTIVE_SLUG = prof.slug;
    window.TWIN_FULL = prof.name;
    window.TWIN_SIGN = prof.name;
    window.TWIN_FIRST = prof.first;
    window.ACTIVE_COURSE = prof.courseEn;
    window.ACTIVE_TOPICS = prof.topics;
    window.ACTIVE_PROJECTS = prof.projects;
    window.ACTIVE_TERMS = prof.topics.map((t, i) => ({ t, w: Math.max(2, 5 - Math.floor(i / 3)) }));
    const notes = prof.sentences && prof.sentences.length ? prof.sentences : prof.topics;
    window.ACTIVE_COURSES = {
      lecture: {
        mode: "Live",
        modeClass: "is-live",
        title: prof.courseEn,
        meta: `${prof.courseCode} / ${prof.schoolShort} / October 2026`,
        lectures: prof.topics.slice(0, 4).map((topic, i) => [
          String(i + 1).padStart(2, "0"),
          topic,
          clip(notes[i % notes.length], 120),
          "",
        ]),
      },
    };
    window.ACTIVE_SESSIONS = {
      none: {
        kind: "Online",
        title: prof.courseEn,
        meta: `${prof.courseCode} / ${prof.school} / October 2026`,
        room: "Online",
        when: "October 2026",
        bring: "Notes for this lecture",
        cta: "Open the lecture",
        todayKicker: prof.courseCode,
        todayTitle: prof.courseEn,
        todayGoal: `${prof.name} teaches ${prof.courseEn} online. There is no onsite room for this October lecture.`,
        tasks: prof.topics.slice(0, 3).map((topic, i) => [
          String(i + 1).padStart(2, "0"),
          `Review ${topic} in ${prof.first}'s lecture.`,
        ]),
        materials: [["Course", prof.courseEn]].concat(prof.homepage ? [["Faculty page", prof.name]] : []),
        submit: [["Note a question for this lecture", "note"]],
        schedule: [["Oct", prof.courseCode, prof.courseEn, "2026", true]],
        peopleTitle: "Faculty",
        peopleBody: `${prof.name}, ${prof.school}.`,
        accessTitle: "Format",
        accessBody: `${prof.courseEn} is an online October lecture.`,
        chatSeed: "",
      },
    };

    const portrait = prof.photo || svgPortrait(prof.initials, false);
    const avatar = prof.photo || svgPortrait(prof.initials, true);
    document.querySelectorAll(".brand-text").forEach((el) => {
      el.textContent = prof.name;
    });
    document.querySelectorAll(".brand").forEach((el) => {
      el.setAttribute("aria-label", `${prof.name} homepage`);
    });
    document.querySelectorAll(".symbion-face, .twin-avatar").forEach((img) => {
      img.src = avatar;
      img.alt = "";
    });
    const heroImg = document.querySelector(".hero-figure img");
    if (heroImg) {
      heroImg.src = portrait;
      heroImg.alt = `Portrait of ${prof.name}`;
    }
    const title = document.getElementById("chatTitle");
    if (title) title.textContent = prof.name;
    document.querySelectorAll(".twin-sub").forEach((el) => {
      el.textContent = `Digital Twin · ${prof.schoolShort}`;
    });
    document.querySelectorAll(".twin-avatar").forEach((img) => {
      img.alt = `${prof.name} digital twin`;
    });
    const greet = document.querySelector("#messages .msg.ai .bubble p");
    if (greet) {
      greet.textContent = `Hello, I'm ${prof.first}'s digital twin. Feel free to ask me questions about this course, lecture slides and assigned readings.`;
    }
    const who = document.querySelector("#messages .msg.ai .msg-who");
    if (who) who.textContent = prof.name;
    const input = document.getElementById("chatInput");
    if (input) input.placeholder = `Ask ${prof.first} about this course, readings or lecture content...`;
    const inputLabel = document.querySelector('label[for="chatInput"]');
    if (inputLabel) inputLabel.textContent = `Ask ${prof.first}`;

    const lines = document.querySelectorAll(".hero-copy h1 .line");
    if (lines[0]) lines[0].textContent = prof.line1;
    if (lines[1]) lines[1].textContent = prof.line2;
    const role = document.querySelector(".hero-role");
    if (role) {
      role.replaceChildren(document.createTextNode(prof.role1), document.createElement("br"), document.createTextNode(prof.role2));
    }

    if (document.body.classList.contains("page-home")) {
      document.title = `${prof.name} - SYMBION - COSMO`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = `${prof.name} - teaching and research hub. Powered by Symbion and Cosmo.`;
      const index = document.querySelector("[data-ice-list]");
      if (index) {
        index.replaceChildren(
          ...prof.projects.map((item) => {
            const li = document.createElement("li");
            li.textContent = item.name;
            return li;
          }),
        );
      }
      const fallback = document.querySelector("[data-ice-fallback] ol");
      if (fallback) {
        fallback.replaceChildren(
          ...prof.projects.map((item) => {
            const li = document.createElement("li");
            const b = document.createElement("b");
            b.textContent = item.year;
            li.append(b, " ");
            if (item.href) {
              const a = document.createElement("a");
              a.href = item.href;
              a.target = "_blank";
              a.rel = "noopener";
              a.textContent = `${item.name} / ${item.type}`;
              li.append(a);
            } else {
              li.append(`${item.name} / ${item.type}`);
            }
            return li;
          }),
        );
      }
      const hint = document.querySelector(".timeline-hint");
      if (hint) {
        hint.textContent = prof.homepage
          ? "Scroll or drag the ring. Click a card to open the faculty profile."
          : "Scroll or drag the ring.";
      }
    } else {
      document.title = document.title.replace("Gunther M. Roland", prof.name);
    }

    const onlineList = document.querySelector(".studio-panel:not(.onsite) .studio-list");
    if (onlineList) {
      const kicker = onlineList.parentElement.querySelector(".panel-kicker");
      if (kicker) kicker.textContent = `01 / Online · ${prof.schoolShort}`;
      const intro = onlineList.parentElement.querySelector("header p:last-child");
      if (intro) intro.textContent = `${prof.name}'s October lecture: ${prof.courseEn}.`;
      onlineList.innerHTML = `<li><a class="course-entry" href="class-recorded.html?id=lecture&p=${encodeURIComponent(prof.slug)}"><div><em>Live</em><b></b><span>Online Lecture (Live)</span></div><time>October 2026</time><span class="entry-go" aria-hidden="true">${ARROW}</span></a></li>`;
      onlineList.querySelector("b").textContent = prof.courseEn;
    }
    const onsite = document.querySelector(".studio-panel.onsite");
    if (onsite) {
      const kicker = onsite.querySelector(".panel-kicker");
      if (kicker) kicker.textContent = `02 / Onsite · ${prof.schoolShort}`;
      const intro = onsite.querySelector("header p:last-child");
      if (intro) intro.textContent = `${prof.courseEn} has no onsite meetings.`;
      const list = onsite.querySelector(".studio-list");
      if (list) list.innerHTML = `<li class="onsite-empty">${prof.name} teaches this lecture online.</li>`;
    }

    const joinHeading = document.getElementById("joinHeading");
    if (joinHeading) joinHeading.textContent = "Join";
    const joinCopy = document.querySelector(".join-copy");
    if (joinCopy) joinCopy.textContent = prof.joinCopy;
    const joinPoints = [...document.querySelectorAll(".join-points li")];
    joinPoints.forEach((li, i) => {
      if (prof.topics[i]) li.textContent = prof.topics[i];
      else li.remove();
    });
    const joinBtn = document.querySelector("[data-join]");
    if (joinBtn) {
      joinBtn.dataset.join = `${prof.name} October Lecture`;
      const span = joinBtn.querySelector("span");
      if (span && !joinBtn.classList.contains("applied")) span.textContent = "Join this lecture";
    }
    const pubBody = document.querySelector(".pub-table tbody");
    if (pubBody) {
      const pub = document.querySelector(".pub-block");
      if (pub) pub.setAttribute("aria-label", "Research themes");
      const label = document.querySelector(".pub-block .lab-label span");
      const aside = document.querySelector(".pub-block .lab-label i");
      if (label) label.textContent = "Research themes";
      if (aside) aside.textContent = "From the faculty profile";
      ["Focus", "Topic", "School", ""].forEach((text, i) => {
        const th = document.querySelectorAll(".pub-table thead th")[i];
        if (th) th.textContent = text;
      });
      pubBody.replaceChildren(
        ...prof.topics.slice(0, 5).map((topic) => {
          const tr = document.createElement("tr");
          const cells = ["Focus", topic, prof.school, "—"];
          cells.forEach((text, i) => {
            const td = document.createElement("td");
            if (i === 0) {
              const em = document.createElement("em");
              em.textContent = text;
              td.append(em);
            } else td.textContent = text;
            tr.append(td);
          });
          return tr;
        }),
      );
    }
    const note = document.querySelector(".lab-note");
    if (note) {
      note.textContent = `This page is an independent prototype, not an official ${prof.school} site. Faculty profile links open from Home.`;
    }

    const materials = document.querySelector("a.btn.ghost");
    if (materials && /ocw\.mit\.edu/.test(materials.getAttribute("href") || "")) {
      if (prof.homepage) materials.href = prof.homepage;
      else materials.remove();
    }

    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|#|data:)/.test(href)) return;
      const url = new URL(href, location.href);
      if (!url.pathname.endsWith(".html")) return;
      url.searchParams.set("p", prof.slug);
      const file = url.pathname.split("/").pop();
      a.setAttribute("href", `${file}${url.search}${url.hash}`);
    });
  } finally {
    finish();
  }
})();
