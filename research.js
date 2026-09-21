(() => {
  const counts = [1, 2, 4, 7, 12, 18, 26, 35, 44, 50, 47, 39, 28, 18, 10, 6, 3, 1, 1, 0];
  const min = 9.5;
  const max = 10.1;
  const excluded = [978];
  const width = (max - min) / counts.length;
  const labels = {
    paper: "Source paper",
    code: "Code comparison",
    run: "Run output",
    figure: "20-bin figure",
    doc: "Project Doc",
    records: "Full Project record",
    matrix: "Project implementability"
  };

  document.querySelectorAll(".histogram").forEach((node) => {
    counts.forEach((count, i) => {
      const low = min + i * width;
      const high = min + (i + 1) * width;
      const contains = excluded.some((value) => value >= low && (i === counts.length - 1 ? value <= high : value < high));
      const bar = document.createElement("span");
      bar.className = "bar" + (contains ? " contains-outlier" : "");
      bar.style.height = `${Math.max(2, count / 50 * 126)}px`;
      bar.tabIndex = 0;
      bar.dataset.tip = `${low.toFixed(2)}–${high.toFixed(2)} m/s² · ${count}`;
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${low.toFixed(2)} to ${high.toFixed(2)} meters per second squared: ${count} observations`);
      node.appendChild(bar);
    });
  });

  const projects = document.getElementById("projectsView");
  const workbench = document.getElementById("workbenchView");
  const toast = document.getElementById("toast");
  let timer;
  const say = (text) => {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const showPane = (name) => {
    document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("active", p.dataset.content === name));
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.pane === name));
    document.querySelectorAll(".asset").forEach((a) => a.classList.toggle("active", a.dataset.pane === name));
    document.getElementById("inspectTitle").textContent = labels[name];
  };

  const openProject = () => {
    projects.hidden = true;
    workbench.hidden = false;
    showPane("records");
    document.getElementById("thread").scrollTop = 0;
  };
  const returnToProjects = () => {
    workbench.hidden = true;
    projects.hidden = false;
  };

  document.querySelectorAll("[data-project]").forEach((card) => card.addEventListener("click", openProject));
  document.getElementById("backProjects").addEventListener("click", returnToProjects);
  document.querySelectorAll("[data-pane]").forEach((button) => button.addEventListener("click", () => showPane(button.dataset.pane)));
  document.getElementById("newProject").addEventListener("click", () => say("Prototype only — New Project is the single creation entry and is not connected"));
  document.querySelectorAll("[data-toast]").forEach((b) => b.addEventListener("click", () => say(b.dataset.toast)));
  document.querySelector("[data-confirm]").addEventListener("click", () => {
    document.getElementById("confirmCard").innerHTML = "<b>✓ Confirmation receipt</b><p>978 excluded from derived Run 8; source row retained; 352 observations passed to the 20-bin histogram.</p>";
    say("Prototype receipt shown locally");
  });
  document.getElementById("composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = document.getElementById("prompt");
    if (!p.value.trim()) { p.focus(); say("Enter a Project instruction first"); return; }
    p.value = "";
    p.focus();
    say("Prototype only — no message was sent");
  });
  document.getElementById("thread").addEventListener("keydown", (e) => {
    if (e.key === "PageDown" || e.key === "PageUp") {
      e.preventDefault();
      e.currentTarget.scrollBy({ top: (e.key === "PageDown" ? 1 : -1) * e.currentTarget.clientHeight * 0.85, behavior: "smooth" });
    }
  });

  const menu = document.getElementById("menuButton");
  menu.addEventListener("click", () => {
    const open = document.querySelector(".topbar").classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });

  if (new URLSearchParams(location.search).get("project") === "pendulum" || location.hash === "#workbench") {
    openProject();
  }
})();
