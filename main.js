/* ═══════════════════════════════════════════
   TraceWorks Alpha — Motion & Interactions
   Jakub primary · Jhey secondary · Emil selective
═══════════════════════════════════════════ */

'use strict';

/* ── Section Navigation ── */
const SECTIONS = ['home','services','process','pricing','kicuddy'];

function showSection(name) {
  if (!SECTIONS.includes(name)) return;

  const prev = document.querySelector('.section.active');
  const next = document.getElementById(name);
  if (!next || prev === next) return;

  if (prev) prev.classList.remove('active');
  next.classList.add('active');
  next.classList.remove('entering');
  void next.offsetWidth;
  next.classList.add('entering');

  window.scrollTo({ top: 0, behavior: 'instant' });

  // Nav theme
  const isLight = name !== 'home' && name !== 'kicuddy';
  document.getElementById('nav').classList.toggle('light-nav', isLight);

  // Reset and re-observe reveals in new section
  next.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('in');
  });
  requestAnimationFrame(() => observeReveals());

  // Process: draw timeline
  if (name === 'process') {
    setTimeout(() => {
      const line = document.getElementById('timelineLine');
      if (line) line.classList.add('drawn');
    }, 300);
  }

  // KiCuddy: replay terminal animation
  if (name === 'kicuddy') {
    setTimeout(() => {
      const term = document.getElementById('kcTerminal');
      if (!term) return;
      term.classList.remove('running');
      void term.offsetWidth;
      term.classList.add('running');
    }, 400);
  }

  closeMobileNav();
}

/* ── Nav link delegation ── */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-nav]');
  if (!el) return;
  e.preventDefault();
  showSection(el.getAttribute('data-nav'));
});

/* ── Mobile nav ── */
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('drawer');
const overlay   = document.getElementById('drawerOverlay');

function closeMobileNav() {
  hamburger.classList.remove('open');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    closeMobileNav();
  } else {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
});
overlay.addEventListener('click', closeMobileNav);

/* ═══════════════════════════════════════════
   REVEAL SYSTEM (Jakub: blur + translate + opacity)
   Uses IntersectionObserver — no scroll listeners
═══════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '-40px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    revealObs.observe(el);
  });
}
observeReveals();

/* ── Hero PCB: Three.js (see pcb3d.js) ── */

/* ═══════════════════════════════════════════
   STATS COUNTER (Jhey: duration-based, eased)
═══════════════════════════════════════════ */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateCounter(el, target, prefix, suffix, duration) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const pct = Math.min((ts - start) / duration, 1);
    const val = Math.round(easeOut(pct) * target);
    el.textContent = (prefix || '') + val + (suffix || '');
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target   = parseInt(el.dataset.count, 10);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    animateCounter(el, target, prefix, suffix, 1200);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statObs.observe(el));

/* ═══════════════════════════════════════════
   PROCESS TIMELINE DRAW
   Draws the vertical accent line as section loads
═══════════════════════════════════════════ */
// Timeline draw is triggered in showSection('process')
// Also trigger if process is the first section (unlikely but safe)
if (document.getElementById('process')?.classList.contains('active')) {
  setTimeout(() => {
    const line = document.getElementById('timelineLine');
    if (line) line.classList.add('drawn');
  }, 600);
}

/* ═══════════════════════════════════════════
   TICKER PAUSE ON HOVER (accessibility)
═══════════════════════════════════════════ */
const ticker = document.querySelector('.ticker-track');
if (ticker) {
  const parent = ticker.parentElement;
  parent.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  parent.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}

/* ═══════════════════════════════════════════
   NAV SCROLL SHADOW
═══════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10
    ? '0 1px 24px rgba(0,0,0,0.4)'
    : '';
}, { passive: true });

/* ═══════════════════════════════════════════
   AMBIENT ORB — subtle mouse parallax
   Jhey: ambient background life
═══════════════════════════════════════════ */
const orbs = document.querySelectorAll('.amb-orb');
if (orbs.length) {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.4;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

/* ═══════════════════════════════════════════
   DOC FILE CARDS — stagger on process enter
═══════════════════════════════════════════ */
const docFileObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const files = entry.target.querySelectorAll('.doc-file');
    files.forEach((f, i) => {
      f.style.opacity = '0';
      f.style.transform = 'translateY(8px)';
      f.style.transition = `opacity 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s, transform 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s`;
      setTimeout(() => {
        f.style.opacity = '1';
        f.style.transform = 'translateY(0)';
      }, 50 + i * 70);
    });
    docFileObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.docs-files').forEach(el => docFileObs.observe(el));

/* ═══════════════════════════════════════════
   DELIVERABLES GRID — cascade stagger
═══════════════════════════════════════════ */
const delivObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const items = entry.target.querySelectorAll('.deliv');
    items.forEach((item, i) => {
      // Items already have --d CSS variable, just trigger the in class
      setTimeout(() => item.classList.add('in'), i * 45);
    });
    delivObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.deliverables-grid').forEach(el => delivObs.observe(el));

/* ═══════════════════════════════════════════
   GALLERY CARD IMAGE PARALLAX
═══════════════════════════════════════════ */
document.querySelectorAll('.gallery-card').forEach(card => {
  const img = card.querySelector('.gallery-img img');
  if (!img) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) / rect.width  * 8;
    const y = (e.clientY - rect.top  - rect.height / 2) / rect.height * 8;
    img.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
  });

  card.addEventListener('mouseleave', () => {
    img.style.transform = '';
  });
});

/* ═══════════════════════════════════════════
   KEYBOARD NAV (Emil: never animate keyboard-initiated)
   Arrow keys jump sections, no transition animation
═══════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const cur = document.querySelector('.section.active');
  if (!cur) return;
  const idx = SECTIONS.indexOf(cur.id);
  if (e.key === 'ArrowRight' && idx < SECTIONS.length - 1) {
    // Instant switch — Emil: keyboard = no animation
    const next = document.getElementById(SECTIONS[idx + 1]);
    cur.classList.remove('active');
    next.classList.add('active');
    const isLight = next.id !== 'home' && next.id !== 'kicuddy';
    document.getElementById('nav').classList.toggle('light-nav', isLight);
    window.scrollTo(0, 0);
  }
  if (e.key === 'ArrowLeft' && idx > 0) {
    const prev = document.getElementById(SECTIONS[idx - 1]);
    cur.classList.remove('active');
    prev.classList.add('active');
    const isLight = prev.id !== 'home' && prev.id !== 'kicuddy';
    document.getElementById('nav').classList.toggle('light-nav', isLight);
    window.scrollTo(0, 0);
  }
});

/* ═══════════════════════════════════════════
   FORM SUBMIT — inline feedback (no page reload)
═══════════════════════════════════════════ */
document.querySelectorAll('.cta-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('.cta-input');
    const btn   = form.querySelector('.btn-primary');
    if (!input?.value.trim()) return;
    const original = btn.textContent;
    btn.textContent = 'Sent ✓';
    btn.style.background = 'var(--green-dark)';
    btn.disabled = true;
    input.value = '';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });
});

/* ═══════════════════════════════════════════
   PRIVACY POLICY MODAL
═══════════════════════════════════════════ */
const privacyOverlay = document.getElementById('privacyOverlay');
const openPrivacyBtn = document.getElementById('openPrivacy');
const closePrivacyBtn = document.getElementById('closePrivacy');

function openPrivacy() {
  privacyOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePrivacy() {
  privacyOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (openPrivacyBtn)  openPrivacyBtn.addEventListener('click', openPrivacy);
if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacy);
if (privacyOverlay)  privacyOverlay.addEventListener('click', e => {
  if (e.target === privacyOverlay) closePrivacy();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && privacyOverlay?.classList.contains('open')) closePrivacy();
});

/* ═══════════════════════════════════════════
   TRACEWORKS LIVE ROUTING CANVAS
   Lightweight native canvas — no animation library
═══════════════════════════════════════════ */
const routeCanvas = document.getElementById('routeCanvas');
const netCountEl = document.getElementById('routeNetCount');
const viaCountEl = document.getElementById('routeViaCount');
const drcStateEl = document.getElementById('routeDrcState');

if (routeCanvas) {
  const ctx = routeCanvas.getContext('2d', { alpha: true });
  const routeState = {
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    mouseX: 0,
    mouseY: 0,
    lastMetricTick: 0,
    frame: 0
  };

  const components = [
    { x: 0.18, y: 0.26, w: 0.14, h: 0.10, label: 'USB' },
    { x: 0.43, y: 0.42, w: 0.19, h: 0.16, label: 'MCU' },
    { x: 0.74, y: 0.29, w: 0.14, h: 0.13, label: 'DRV' },
    { x: 0.74, y: 0.68, w: 0.16, h: 0.11, label: 'OUT' },
    { x: 0.28, y: 0.72, w: 0.12, h: 0.08, label: 'PWR' }
  ];

  const routes = [
    { color: '#5CC8FF', pts: [[0.18,0.26],[0.32,0.26],[0.32,0.42],[0.43,0.42],[0.61,0.42],[0.61,0.29],[0.74,0.29]], speed: 1.0 },
    { color: '#F59E42', pts: [[0.28,0.72],[0.43,0.72],[0.43,0.58],[0.54,0.58],[0.54,0.68],[0.74,0.68]], speed: 0.82 },
    { color: '#36F097', pts: [[0.50,0.42],[0.50,0.22],[0.76,0.22],[0.76,0.29]], speed: 1.22 },
    { color: '#D9E6F2', pts: [[0.23,0.31],[0.23,0.50],[0.43,0.50],[0.62,0.50],[0.62,0.74],[0.82,0.74]], speed: 0.68 },
    { color: '#5CC8FF', pts: [[0.36,0.72],[0.36,0.62],[0.43,0.62],[0.43,0.46]], speed: 1.36 }
  ];

  function resizeRouteCanvas() {
    const rect = routeCanvas.getBoundingClientRect();
    routeState.w = Math.max(1, rect.width);
    routeState.h = Math.max(1, rect.height);
    routeState.dpr = Math.min(window.devicePixelRatio || 1, 2);
    routeCanvas.width = Math.floor(routeState.w * routeState.dpr);
    routeCanvas.height = Math.floor(routeState.h * routeState.dpr);
    ctx.setTransform(routeState.dpr, 0, 0, routeState.dpr, 0, 0);
  }

  function routeLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const ax = points[i - 1][0] * routeState.w;
      const ay = points[i - 1][1] * routeState.h;
      const bx = points[i][0] * routeState.w;
      const by = points[i][1] * routeState.h;
      len += Math.hypot(bx - ax, by - ay);
    }
    return len;
  }

  function drawPartialRoute(points, progress, color) {
    const total = routeLength(points);
    let remaining = total * progress;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.moveTo(points[0][0] * routeState.w, points[0][1] * routeState.h);
    for (let i = 1; i < points.length; i++) {
      const ax = points[i - 1][0] * routeState.w;
      const ay = points[i - 1][1] * routeState.h;
      const bx = points[i][0] * routeState.w;
      const by = points[i][1] * routeState.h;
      const seg = Math.hypot(bx - ax, by - ay);
      if (remaining >= seg) {
        ctx.lineTo(bx, by);
        remaining -= seg;
      } else {
        const t = Math.max(0, remaining / seg);
        ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t);
        break;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawRouteCanvas(time) {
    const t = time * 0.001;
    routeState.frame = requestAnimationFrame(drawRouteCanvas);
    ctx.clearRect(0, 0, routeState.w, routeState.h);

    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, routeState.w, routeState.h);

    const grid = 28;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.075)';
    ctx.lineWidth = 1;
    for (let x = (routeState.mouseX * 8) % grid; x < routeState.w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, routeState.h);
      ctx.stroke();
    }
    for (let y = (routeState.mouseY * 8) % grid; y < routeState.h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(routeState.w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(54, 240, 151, 0.34)';
    ctx.fillStyle = 'rgba(13, 42, 32, 0.72)';
    roundRect(ctx, routeState.w * 0.07, routeState.h * 0.08, routeState.w * 0.86, routeState.h * 0.78, 18);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(217,230,242,0.24)';
    ctx.fillStyle = 'rgba(16,22,35,0.92)';
    components.forEach((c) => {
      const x = c.x * routeState.w - c.w * routeState.w / 2;
      const y = c.y * routeState.h - c.h * routeState.h / 2;
      const w = c.w * routeState.w;
      const h = c.h * routeState.h;
      roundRect(ctx, x, y, w, h, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(217,230,242,0.72)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(c.label, x + 10, y + 18);
      ctx.fillStyle = 'rgba(16,22,35,0.92)';
    });

    routes.forEach((route, i) => {
      const phase = ((t * route.speed) + i * 0.18) % 1.35;
      const progress = Math.min(1, phase / 1.0);
      drawPartialRoute(route.pts, progress, route.color);
      route.pts.forEach((p, idx) => {
        if (idx % 2 === 0) {
          ctx.beginPath();
          ctx.fillStyle = route.color;
          ctx.globalAlpha = 0.82;
          ctx.arc(p[0] * routeState.w, p[1] * routeState.h, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    });

    if (time - routeState.lastMetricTick > 900) {
      routeState.lastMetricTick = time;
      if (netCountEl) netCountEl.textContent = String(82 + Math.floor((Math.sin(t) + 1) * 3)).padStart(3, '0');
      if (viaCountEl) viaCountEl.textContent = String(17 + Math.floor((Math.cos(t * 0.8) + 1) * 2)).padStart(3, '0');
      if (drcStateEl) drcStateEl.textContent = Math.sin(t * 0.7) > -0.88 ? 'PASS' : 'SCAN';
    }
  }

  function roundRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  routeCanvas.addEventListener('pointermove', (e) => {
    const rect = routeCanvas.getBoundingClientRect();
    routeState.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    routeState.mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  });
  window.addEventListener('resize', resizeRouteCanvas, { passive: true });
  resizeRouteCanvas();
  routeState.frame = requestAnimationFrame(drawRouteCanvas);
}

/* ═══════════════════════════════════════════
   INTERACTIVE EDA VIEWER
═══════════════════════════════════════════ */
const viewerShell = document.querySelector('.viewer-shell');
const viewerTabs = document.querySelectorAll('[data-viewer-mode]');
if (viewerShell && viewerTabs.length) {
  viewerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.viewerMode;
      viewerShell.dataset.currentView = mode;
      viewerTabs.forEach(other => {
        const isActive = other === tab;
        other.classList.toggle('active', isActive);
        other.setAttribute('aria-selected', String(isActive));
      });
    });
  });
}

console.log('%cTraceWorks Alpha — PCB Design Studio', 'font-family:monospace;color:#7c3aed;font-size:13px');
