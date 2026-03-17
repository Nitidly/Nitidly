/* =============================================
   NITIDLY — main.js
   ============================================= */

// ─── AOS — Animate On Scroll ────────────────
AOS.init({
  duration: 600,
  easing: 'ease-out',
  once: true,
  offset: 60,
});

// ─── Nav scroll effect ──────────────────────
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Mobile nav toggle ──────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);

    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navMobile.contains(e.target)) {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    }
  });
}

// ─── Particles system ───────────────────────
function buildParticlesConfig(variant) {
  const G = '#1D9E75';
  const presets = {
    hero:   { n: 55, dist: 150, lineOp: 0.18, lw: 0.6, op: 0.35, opMin: 0.15, sz: 2.5, speed: 1.1, grab: 160, grabOp: 0.35 },
    medium: { n: 32, dist: 140, lineOp: 0.13, lw: 0.5, op: 0.22, opMin: 0.08, sz: 2.0, speed: 0.8, grab: 140, grabOp: 0.28 },
    subtle: { n: 20, dist: 120, lineOp: 0.09, lw: 0.4, op: 0.15, opMin: 0.05, sz: 1.8, speed: 0.6, grab: 120, grabOp: 0.22 },
  };
  const p = presets[variant] || presets.subtle;
  return {
    particles: {
      number: { value: p.n, density: { enable: true, value_area: 900 } },
      color: { value: G },
      opacity: { value: p.op, random: true, anim: { enable: true, speed: 0.5, opacity_min: p.opMin, sync: false } },
      size: { value: p.sz, random: true },
      line_linked: { enable: true, distance: p.dist, color: G, opacity: p.lineOp, width: p.lw },
      move: { enable: true, speed: p.speed, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: false }, resize: true },
      modes: { grab: { distance: p.grab, line_linked: { opacity: p.grabOp } } }
    },
    retina_detect: true
  };
}

function initParticles(id, variant) {
  if (!document.getElementById(id)) return;
  particlesJS(id, buildParticlesConfig(variant));
}

// Hero — siempre activo
initParticles('hero-particles', 'hero');

// Resto de secciones — solo en pantallas > 768px (rendimiento)
if (window.innerWidth > 768) {
  // index.html
  initParticles('diagnostico-particles', 'medium');
  initParticles('pilares-particles',     'subtle');
  initParticles('cta-mid-particles',     'subtle');
  initParticles('cta-main-particles',    'medium');
  // servicios.html
  initParticles('header-serv-particles', 'medium');
  initParticles('cta-serv-particles',    'medium');
  // sobre-mi.html
  initParticles('header-sobre-particles','medium');
  initParticles('cta-sobre-particles',   'medium');
  // contacto.html
  initParticles('header-contact-particles', 'medium');
}

// ─── Contact form ───────────────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.form-submit');
    const originalText = btn.textContent;

    const required = contactForm.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255, 80, 80, 0.5)';
        valid = false;
      }
    });

    if (!valid) return;

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    btn.style.opacity = '0.7';

    await new Promise(resolve => setTimeout(resolve, 1200));

    contactForm.style.display = 'none';
    formSuccess.classList.add('show');

    btn.disabled = false;
    btn.textContent = originalText;
    btn.style.opacity = '';
  });

  contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
}

// ─── Hero title text reveal ──────────────────
const heroWords = document.querySelectorAll('.hero__title .hw');
if (heroWords.length) {
  heroWords.forEach((word, i) => {
    setTimeout(() => word.classList.add('visible'), 300 + i * 120);
  });
}

// ─── Smooth anchor scrolling ────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
