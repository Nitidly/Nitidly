/* =============================================
   NÍTIDLY — main.js v2
   Sin dependencias externas.
   ============================================= */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Nav scroll effect ──────────────────────
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Mobile nav toggle ──────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

if (navToggle && navMobile) {
  const closeMenu = () => {
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navMobile.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

// ─── Firma: el titular "enfoca" palabra a palabra ───
const heroWords = document.querySelectorAll('.hero__title .hw');
if (heroWords.length) {
  if (reducedMotion) {
    heroWords.forEach(w => w.classList.add('visible'));
  } else {
    heroWords.forEach((word, i) => {
      setTimeout(() => word.classList.add('visible'), 250 + i * 110);
    });
  }
}

// ─── Scroll reveal (IntersectionObserver) ───
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }
}

// ─── Smooth anchor scrolling ────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  });
});

// ─── Formulario de contacto ─────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.form-submit');
    const originalText = btn.textContent;

    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    let firstInvalid = null;

    required.forEach(field => {
      if (field.type === 'checkbox') {
        field.closest('.form-checkbox')?.classList.remove('invalid');
        if (!field.checked) {
          field.closest('.form-checkbox')?.classList.add('invalid');
          valid = false;
          firstInvalid = firstInvalid || field;
        }
        return;
      }
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255, 80, 80, 0.5)';
        valid = false;
        firstInvalid = firstInvalid || field;
      }
    });

    if (!valid) { firstInvalid?.focus(); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    btn.style.opacity = '0.7';

    try {
      const response = await fetch('https://formspree.io/f/xvzwvylp', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
        formSuccess.focus?.();
      } else {
        throw new Error('server');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.opacity = '';
      alert('No se ha podido enviar el mensaje. Inténtalo de nuevo o escribe directamente a ana@nitidly.com');
    }
  });

  contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
  contactForm.querySelectorAll('input[type="checkbox"]').forEach(field => {
    field.addEventListener('change', () => {
      field.closest('.form-checkbox')?.classList.remove('invalid');
    });
  });
}

// ─── Fondo de partículas (implementación propia, sin CDN) ───
(function () {
  if (reducedMotion) return;

  const PRESETS = {
    hero:   { density: 22000, dist: 150, lineOp: 0.18, op: 0.35, sz: 2.5, speed: 0.55, grab: 160, grabOp: 0.35 },
    medium: { density: 34000, dist: 140, lineOp: 0.13, op: 0.22, sz: 2.0, speed: 0.40, grab: 140, grabOp: 0.28 },
  };
  const G = { r: 29, g: 158, b: 117 };

  function mountParticles(el, preset) {
    const p = PRESETS[preset] || PRESETS.medium;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots = [];
    const mouse = { x: null, y: null };
    let raf = null;

    function resize() {
      const rect = el.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.max(12, Math.round((W * H) / p.density));
      while (dots.length < target) dots.push(newDot());
      dots.length = target;
    }

    function newDot() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * p.speed, vy: (Math.random() - 0.5) * p.speed,
        r: 0.8 + Math.random() * p.sz,
        o: p.op * (0.4 + Math.random() * 0.6),
      };
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = W + 10; else if (d.x > W + 10) d.x = -10;
        if (d.y < -10) d.y = H + 10; else if (d.y > H + 10) d.y = -10;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${G.r},${G.g},${G.b},${d.o})`;
        ctx.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < p.dist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${G.r},${G.g},${G.b},${p.lineOp * (1 - dist / p.dist)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          const a = dots[i];
          const dist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dist < p.grab) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${G.r},${G.g},${G.b},${p.grabOp * (1 - dist / p.grab)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    window.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        mouse.x = x; mouse.y = y;
      } else {
        mouse.x = null; mouse.y = null;
      }
    }, { passive: true });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    window.addEventListener('resize', resize, { passive: true });

    resize();
    start();
  }

  // Canvas global fijo (index) — el ratón se sigue en window
  const globalEl = document.getElementById('global-particles');
  if (globalEl) mountParticles(globalEl, 'hero');

  // Partículas por sección (cabeceras de subpáginas), solo en pantallas grandes
  if (window.innerWidth > 768) {
    document.querySelectorAll('.section-particles').forEach(el => mountParticles(el, 'medium'));
  }
})();
