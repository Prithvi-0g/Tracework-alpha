/* ═══════════════════════════════════════════
   TraceWorks Alpha — Motion & Interactions
   Jakub primary · Jhey secondary · Emil selective
═══════════════════════════════════════════ */

'use strict';

/* ── Section Navigation ── */
const SECTIONS = ['home','services','process','pricing','gallery','preview'];

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
  const isLight = name !== 'home' && name !== 'gallery' && name !== 'preview';
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

/* ═══════════════════════════════════════════
   HERO PCB PARALLAX (Jhey: mouse-reactive)
   Emil: only responds to pointer, never animates keyboard
═══════════════════════════════════════════ */
const heroVisual = document.getElementById('heroVisual');
const pcbWrap    = document.getElementById('pcbWrap');

if (heroVisual && pcbWrap) {
  let rafId;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    const rect = heroVisual.getBoundingClientRect();
    if (rect.width === 0) return;
    // Map mouse to -1..1 relative to visual center
    targetX = ((e.clientX - rect.left - rect.width  / 2) / rect.width)  * 12;
    targetY = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * 8;
  });

  function animatePCB() {
    // Spring interpolation (damping ≈ 0.08 → sluggish, natural)
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    const tiltX = (-currentY).toFixed(2);
    const tiltY = (currentX).toFixed(2);
    pcbWrap.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;

    rafId = requestAnimationFrame(animatePCB);
  }
  animatePCB();

  // Pause when mouse leaves viewport
  document.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
  });
}

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
    window.scrollTo(0, 0);
  }
  if (e.key === 'ArrowLeft' && idx > 0) {
    const prev = document.getElementById(SECTIONS[idx - 1]);
    cur.classList.remove('active');
    prev.classList.add('active');
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

console.log('%cTraceWorks Alpha — PCB Design Studio', 'font-family:monospace;color:#7c3aed;font-size:13px');
