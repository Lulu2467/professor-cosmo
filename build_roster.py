# -*- coding: utf-8 -*-
import html
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
src = json.loads(Path(r"E:\file\研课symbion\文档\lecture-2026-10-professors.json").read_text(encoding="utf-8"))

TOPICS = {
    "Julia R. Greer": ["Materials architecture", "Energy storage", "Nanofabrication", "Additive manufacturing"],
    "Cosimo Arnesano": ["Business analytics", "Machine learning", "Data mining", "Consumer behavior", "Financial modeling"],
    "Susan Moeller": ["International news", "Media and policy", "Media literacy", "Digital media"],
    "Sarah Kavanagh": ["Education policy", "Educational equity", "Teacher education", "Teacher development"],
    "Richard Payne": ["Silk Road history", "Religious exchange", "Medieval Europe", "Historical method"],
    "Andrew Nevins": ["Writing systems", "Phonology", "Syntax", "Language acquisition"],
    "Daniel Casasanto": ["Cognitive neuroscience", "Psycholinguistics", "Gesture", "Social psychology"],
    "Vivian Zayas": ["Personality science", "Close relationships", "Social cognition", "Cultural psychology"],
    "Katherine F. Smith": ["Planetary health", "Biogeography", "Environmental change"],
    "Samuel Kunes": ["Memory biology", "Neural plasticity", "Visual neurons", "Genetic control"],
    "Alexander Ploss": ["Immunology", "Virology", "Liver pathogens", "Immune response"],
    "Osman Yagan": ["Machine learning", "Network science", "Cybersecurity", "Decision systems"],
    "Gunther Roland": ["Heavy-ion collisions", "Jet quenching", "Quark-gluon plasma", "Data analysis"],
    "Haifeng Xu": ["Algorithms", "Big data", "Multi-agent systems", "Computational economics"],
    "Neal Bangerter": ["Brain-machine interfaces", "Medical imaging", "Signal processing", "Bioengineering"],
    "Patrick Houlihan": ["Natural language", "Machine learning", "Computational finance", "Stochastic models"],
    "Sen Wang": ["Robot perception", "Localization", "Autonomous driving", "Computer vision"],
    "James J. Choi": ["Biomedical imaging", "Drug delivery", "Noninvasive devices", "Tissue diagnostics"],
    "Anastasia Romanou": ["Numerical models", "Climate simulation", "Machine learning", "Atmospheric science"],
    "Enrico Pajer": ["Cosmology", "Inflation", "Quantum field theory", "General relativity"],
    "Joe Moore": ["Water treatment", "Environmental microbiology", "Water quality", "Nanotechnology"],
    "Diana Haidar": ["Machine design", "Nanocomposites", "3D printing", "Extreme environments"],
    "Lorena Martin": ["Sports analytics", "Performance data", "Data visualization", "Sports management"],
    "Matthew Grimes": ["Entrepreneurship", "Market opportunity", "Sustainable futures", "Business models"],
    "Johannes Ruf": ["Financial mathematics", "FinTech", "Stochastic analysis", "Portfolio theory"],
    "Oliver Linton": ["Financial econometrics", "Time series", "Empirical finance", "Volatility"],
    "Raghavendra Rau": ["Financial valuation", "Corporate finance", "Asset pricing", "Behavioral finance"],
    "Philip Allmendinger": ["Urban planning", "Land economy", "Smart cities", "Planning theory"],
    "Donald Robertson": ["Causal inference", "Econometrics", "Policy analysis", "Macroeconomics"],
}

SHORT = {
    "California Institute of Technology": "Caltech",
    "University of Southern California": "USC",
    "The University of Maryland": "Maryland",
    "University of Pennsylvania": "Penn",
    "University of Chicago": "Chicago",
    "University College London": "UCL",
    "Cornell University": "Cornell",
    "Brown University": "Brown",
    "Harvard University": "Harvard",
    "Princeton University": "Princeton",
    "Carnegie Mellon University": "Carnegie Mellon",
    "Massachusetts Institute of Technology": "MIT",
    "Imperial College London": "Imperial",
    "Impeiral College London": "Imperial",
    "Columbia University": "Columbia",
    "Cambridge University": "Cambridge",
    "University of Cambridge": "Cambridge",
    "London School of Economics and Political Science": "LSE",
}


def slugify(name):
    s = name.lower().replace(".", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def school_name(raw):
    if raw == "Impeiral College London":
        return "Imperial College London"
    return raw


def sentences_of(text):
    text = " ".join((text or "").split())
    parts = re.split(r"(?<=[.!?])\s+", text)
    clean = [part.strip() for part in parts if len(part.strip()) > 30]
    if not clean and text:
        clean = [text[:280]]
    return clean[:6]


def trim(text, limit):
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"


def split_name(name):
    parts = name.split()
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], " ".join(parts[1:])


def homepage(url):
    url = (url or "").strip()
    if not url:
        return ""
    if url.startswith("www."):
        return "https://" + url
    return url


roster = []
for p in src["professors"]:
    name = p["name"]
    topics = TOPICS[name]
    school = school_name(p.get("schoolEn") or "")
    short = SHORT.get(p.get("schoolEn") or "", school)
    pos = (p.get("positionEn") or "").strip()
    if not pos:
        role1 = f"Professor at {school}."
    elif school.lower() in pos.lower():
        role1 = pos if pos.endswith(".") else pos + "."
    else:
        role1 = f"{pos.rstrip('.')} at {school}."
    bio = sentences_of(p.get("introduceEn") or "")
    role2 = trim(bio[0], 170) if bio else (topics[0] if topics[0].endswith(".") else topics[0] + ".")
    line1, line2 = split_name(name)
    home = homepage(p.get("homepageUrl"))
    projects = []
    for i, topic in enumerate(topics):
        projects.append(
            {
                "id": f"theme-{i}",
                "name": topic,
                "type": short,
                "year": "Now",
                "href": home,
                "cite": f"{name} · {short}",
                "blurb": trim(bio[i % len(bio)], 240) if bio else topic,
            }
        )
    first = name.split()[0]
    roster.append(
        {
            "slug": slugify(name),
            "name": name,
            "first": first,
            "initials": p.get("displayName") or first[:1],
            "line1": line1,
            "line2": line2,
            "school": school,
            "schoolShort": short,
            "role1": role1,
            "role2": role2,
            "courseCode": p["courseCode"],
            "courseEn": " ".join(p["courseNameEn"].split()),
            "topics": topics,
            "sentences": bio,
            "homepage": home,
            "projects": projects,
            "joinCopy": f"Work with {name} on {', '.join(topics[:3])}.",
            "photo": "https://mio.neoschool.com/" + p["avatar"].lstrip("/"),
            "template": name == "Gunther Roland",
        }
    )

(root / "roster-data.js").write_text(
    "window.LECTURE_ROSTER = " + json.dumps(roster, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)

rows = []
for i, p in enumerate(roster, 1):
    href = "index.html" if p["template"] else f"index.html?p={p['slug']}"
    rows.append(
        f"""<a class="roster-row" href="{html.escape(href)}">
      <em>{i:02d}</em>
      <div><b>{html.escape(p['name'])}</b><small>{html.escape(p['school'])}</small></div>
      <div><b>{html.escape(p['courseEn'])}</b><small>{html.escape(p['courseCode'])} · October Lecture</small></div>
      <time>Enter</time>
    </a>"""
    )

page = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>26年10月 Lecture · 29 professors</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css?v=168">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="roster.html">
      <span class="brand-mark" aria-hidden="true"><img src="assets/symbion-mark.svg" width="28" height="28" alt=""></span>
      <span class="brand-text">October Lecture</span>
    </a>
  </header>
  <main class="roster-main">
    <h1>October<br>Lecture.</h1>
    <p class="roster-lead">26年10月 Lecture，核心课程，启用状态为启用。共 29 位。点进一位教授的数字人站。Gunther Roland 用对照站原文。其他人的肖像来自教师照片。时间线是研究方向，不是论文列表。</p>
    <div class="roster-list">
      {''.join(rows)}
    </div>
  </main>
</body>
</html>
"""
(root / "roster.html").write_text(page, encoding="utf-8")

head = """  <script src="roster-data.js"></script>
  <script>if(new URLSearchParams(location.search).get("p")&&new URLSearchParams(location.search).get("p")!=="gunther-roland")document.documentElement.classList.add("prof-pending");</script>
  <style>html.prof-pending body{visibility:hidden}</style>
"""
marker = "roster-data.js"
boot = '  <script src="apply-prof.js"></script>\n'
for name in ["index.html", "class.html", "class-recorded.html", "class-onsite.html", "research.html"]:
    file = root / name
    text = file.read_text(encoding="utf-8")
    if marker not in text:
        text = text.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + head, 1)
    if "apply-prof.js" not in text:
        text = text.replace("<script src=\"app.js", boot + "<script src=\"app.js", 1)
    file.write_text(text, encoding="utf-8")

print("roster", len(roster))
