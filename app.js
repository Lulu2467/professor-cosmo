const drawer = document.querySelector('#chatDrawer');
const backdrop = document.querySelector('#backdrop');
const input = document.querySelector('#chatInput');
const messages = document.querySelector('#messages');
const toast = document.querySelector('#joinToast');
const menu = document.querySelector('#menuButton');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function openChat(prompt = '') {
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  if (prompt && input) input.value = prompt;
  setTimeout(() => input?.focus(), 50);
}

function closeChat() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (backdrop) backdrop.hidden = true;
  document.body.style.overflow = '';
  document.querySelector('[data-open-chat]')?.focus();
}

document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => openChat()));
document.querySelector('#closeChat')?.addEventListener('click', closeChat);
backdrop?.addEventListener('click', closeChat);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer?.classList.contains('open')) closeChat();
});

function setTwinLoading(on) {
  const wrap = document.querySelector('[data-twin-status]');
  const text = document.querySelector('[data-twin-status-text]');
  if (wrap) wrap.dataset.twinStatus = on ? 'loading' : 'ready';
  if (text) text.textContent = on ? 'Loading' : 'Online & Ready';
}

function addMessage(kind, text, opts = {}) {
  if (!messages) return;
  const row = document.createElement('div');
  row.className = `msg ${kind}`;
  const who = document.createElement('span');
  who.className = 'msg-who';
  who.textContent = kind === 'ai' ? 'Gunther Roland' : 'Student';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const p = document.createElement('p');
  p.textContent = text;
  bubble.append(p);
  if (opts.note) {
    const note = document.createElement('span');
    note.className = 'attach-note';
    note.textContent = opts.note;
    p.append(document.createElement('br'), note);
  }
  if (opts.imageUrl) {
    const wrap = document.createElement('span');
    wrap.className = 'attach-preview';
    const img = document.createElement('img');
    img.src = opts.imageUrl;
    img.alt = opts.fileName || 'Attached image';
    wrap.append(img);
    bubble.append(wrap);
  }
  row.append(who, bubble);
  messages.append(row);
  messages.scrollTop = messages.scrollHeight;
}

const attachments = [];
const chips = document.querySelector('#attachChips');
const fileInput = document.querySelector('#attachFile');

function renderChips() {
  if (!chips) return;
  chips.hidden = attachments.length === 0;
  chips.innerHTML = '';
  attachments.forEach((item, i) => {
    const chip = document.createElement('span');
    chip.className = 'attach-chip';
    const label = document.createElement('b');
    label.textContent = item.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.textContent = 'x';
    remove.addEventListener('click', () => {
      if (item.url) URL.revokeObjectURL(item.url);
      attachments.splice(i, 1);
      renderChips();
    });
    chip.append(label, remove);
    chips.append(chip);
  });
}

function addAttachment(file, kind) {
  if (!file) return;
  if (attachments.length >= 3) {
    showToast('Up to 3 attachments in this prototype.');
    return;
  }
  const item = {
    name: file.name,
    kind,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url: kind === 'image' ? URL.createObjectURL(file) : '',
  };
  attachments.push(item);
  renderChips();
}

fileInput?.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) addAttachment(file, file.type.startsWith('image/') ? 'image' : 'file');
  fileInput.value = '';
});

function submit() {
  if (!input) return;
  const value = input.value.trim();
  if (!value && attachments.length === 0) return;

  const pending = attachments.splice(0, attachments.length);
  renderChips();
  const names = pending.map((a) => a.name).join(', ');
  const image = pending.find((a) => a.kind === 'image' && a.url);
  const text = value || (image ? 'Shared an image.' : `Shared: ${names}`);
  addMessage('user', text, {
    note: names && value ? `Attached: ${names}` : '',
    imageUrl: image?.url || '',
    fileName: image?.name || '',
  });
  pending.forEach((a) => {
    if (a.url && a !== image) URL.revokeObjectURL(a.url);
  });
  input.value = '';

  const q = value.toLowerCase();
  let answer =
    'I can help with this course, lecture slides, and assigned readings. Ask about a concept, a reading, or an assignment.';
  if (pending.length) {
    answer = `Received ${pending.length} file(s) in this prototype. In production, I would match ${names || 'the upload'} to the current course materials.`;
  } else if (q.includes('lecture') || q.includes('concept') || q.includes('explain')) {
    answer =
      'Here is a course-scoped take: start from the lecture definition, then check one worked example in the slides. Tell me which concept you want clarified.';
  } else if (q.includes('reading') || q.includes('paper') || q.includes('understand')) {
    answer =
      'For readings, I can help summarize claims, evidence, and open questions. Share the section or figure you are stuck on.';
  } else if (q.includes('assignment') || q.includes('clarify') || q.includes('homework')) {
    answer =
      'Assignment help stays within course requirements: goals, deliverables, and how work is evaluated. What part of the brief is unclear?';
  } else if (q.includes('class') || q.includes('course') || q.includes('junior')) {
    answer = 'This chat stays tied to the current course context. Use Class to open a course room, then ask me about that material.';
  } else if (q.includes('research') || q.includes('project') || q.includes('join') || q.includes('apply')) {
    answer =
      'Research applications live on the Research page. In this course chat I prioritize lecture and reading questions.';
  } else if (q.includes('timeline') || q.includes('history') || q.includes('ice')) {
    answer = 'The Home timeline shows research milestones. For this course, ask about slides, readings, or discussions instead.';
  } else if (q.includes('qgp') || q.includes('quark')) {
    answer =
      'Quark-gluon plasma appears across several course threads. Ask about the lecture slide or reading section you are reviewing.';
  } else if (
    !q.includes('course') &&
    !q.includes('lecture') &&
    !q.includes('reading') &&
    !q.includes('class') &&
    !q.includes('lab') &&
    !q.includes('assign')
  ) {
    answer =
      'I focus on course content, lecture materials, readings, and class discussions. Try a question tied to this course.';
  }
  setTwinLoading(true);
  setTimeout(() => {
    addMessage('ai', answer);
    setTwinLoading(false);
  }, 520);
}

document.querySelectorAll('[data-suggest]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!input) return;
    input.value = btn.dataset.suggest || btn.textContent.trim();
    input.focus();
    submit();
  });
});

document.querySelector('#chatForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  submit();
});
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
});

let toastTimer;
function showToast(text) {
  if (!toast) return;
  toast.hidden = false;
  toast.textContent = text;
  requestAnimationFrame(() => toast.classList.add('is-on'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-on');
    setTimeout(() => {
      toast.hidden = true;
    }, 250);
  }, 3200);
}

document.querySelectorAll('[data-join]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('applied')) return;
    const name = btn.dataset.join || 'this project';
    btn.classList.add('applied');
    const mark = btn.querySelector('span');
    if (mark) {
      mark.textContent = btn.classList.contains('join-cis') ? 'Application sent' : 'OK';
    }
    btn.setAttribute('aria-label', `Application submitted for ${name}`);
    showToast(`Application submitted for "${name}".`);
  });
});

menu?.addEventListener('click', () => {
  const open = document.querySelector('.topbar')?.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('[data-nav]').forEach((a) =>
  a.addEventListener('click', () => {
    document.querySelector('.topbar')?.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
  })
);

/* Highlight hash target on research archive */
if (location.hash) {
  const target = document.querySelector(location.hash);
  target?.scrollIntoView({ block: 'start' });
}

/* Staggered entrance — apply before first paint settles */
const reveals = [...document.querySelectorAll('[data-reveal]')];
const markIn = () => {
  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.92) el.classList.add('is-in');
  });
};
if (reduce) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else if (reveals.length) {
  markIn();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  reveals.forEach((el) => {
    if (!el.classList.contains('is-in')) io.observe(el);
  });
}

/* Magnetic buttons */
if (!reduce) {
  document.querySelectorAll('[data-mag]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* Soft tilt on portrait / panels */
if (!reduce) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 6}deg)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}
