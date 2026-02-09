// =========================================================
/* HERO module
   - Sync --header-h to fixed header height
   - Force autoplay LOOP (muted, inline, no controls)
   - Scroll hint click => scrolls to the NEXT section
*/
// =========================================================
(function () {
  const root = document.documentElement;

  // ----- Header sync -----
  function getHeader() {
    return (
      document.querySelector('[data-fixed-header]') ||
      document.querySelector('header[role="banner"]') ||
      document.querySelector('header.site-header') ||
      document.querySelector('header')
    );
  }
  function headerHeight() {
    const h = getHeader();
    if (!h) return 56;
    const r = h.getBoundingClientRect();
    const cs = getComputedStyle(h);
    const mt = parseFloat(cs.marginTop) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;
    return Math.max(0, Math.round(r.height + mt + mb)) || 56;
  }
  function syncHeaderVar() {
    root.style.setProperty('--header-h', headerHeight() + 'px');
  }
  addEventListener('DOMContentLoaded', syncHeaderVar, { once: true });
  addEventListener('load', syncHeaderVar, { once: true });
  addEventListener('resize', syncHeaderVar);
  addEventListener('orientationchange', syncHeaderVar);

  // ----- Video: autoplay loop, no UI -----
  function ensureTrailerPlays() {
    const video = document.getElementById('trailer');
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.removeAttribute('controls');

    const tryPlay = () => {
      if (!video.hasAttribute('muted')) video.setAttribute('muted', '');
      if (!video.hasAttribute('playsinline')) video.setAttribute('playsinline', '');
      if (!video.hasAttribute('autoplay')) video.setAttribute('autoplay', '');
      video.play().catch(() => {});
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      setTimeout(tryPlay, 250);
    }
  }

  // ----- Find next <section> after hero -----
  function findNextSection(hero) {
    let el = hero.nextElementSibling;
    while (el) {
      if (el.tagName === 'SECTION') return el;
      el = el.nextElementSibling;
    }
    return null;
  }

  function smoothScrollTo(yTarget, duration = 650) {
    const rootEl = document.scrollingElement || document.documentElement;
    const startY = rootEl.scrollTop;
    const deltaY = yTarget - startY;
    const startT = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - startT) / duration);
      rootEl.scrollTop = startY + deltaY * ease(t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ----- Scroll hint => next section -----
  function bindScrollHint() {
    const hero = document.getElementById('home');
    const btn = hero && hero.querySelector('.hero-scroll-hint');
    if (!hero || !btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const next = findNextSection(hero) || document.querySelector('section[id]:not(#home)');
      if (!next) return;
      const top = next.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
      const y = Math.max(0, top - headerHeight());
      smoothScrollTo(y, 700);
      if (next.id) history.pushState(null, '', '#' + next.id);
    });
  }

  // ----- Smooth scroll for in-hero nav links -----
  function bindHeroLinks() {
    const hero = document.getElementById('home');
    if (!hero) return;

    hero.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || !hero.contains(a)) return;

      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
      const y = Math.max(0, top - headerHeight());
      smoothScrollTo(y, 700);
      if (target.id) history.pushState(null, '', '#' + target.id);
    }, { passive: false });
  }

  // ----- Init -----
  function init() {
    ensureTrailerPlays();
    bindScrollHint();
    bindHeroLinks();

    // Pause/Play toggle
    const video = document.getElementById('trailer');
    const toggle = document.getElementById('trailer-toggle');
    if (video && toggle) {
      function syncBtn() {
        if (video.paused) {
          toggle.textContent = '▶';
          toggle.setAttribute('aria-label', 'Play video');
          toggle.setAttribute('aria-pressed', 'true');
        } else {
          toggle.textContent = '⏸';
          toggle.setAttribute('aria-label', 'Pause video');
          toggle.setAttribute('aria-pressed', 'false');
        }
      }
      toggle.addEventListener('click', () => {
        if (video.paused) { video.play().catch(() => {}); } else { video.pause(); }
        syncBtn();
      });
      video.addEventListener('play', syncBtn);
      video.addEventListener('pause', syncBtn);
      syncBtn();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();