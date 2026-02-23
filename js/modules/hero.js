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
  let resizeTimer = null;
  addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncHeaderVar, 150);
  });
  // Note: orientationchange triggers resize on modern browsers, so no separate listener needed

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
      if (window._smoothScroll) {
        window._smoothScroll(target);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (target.id) history.pushState(null, '', '#' + target.id);
    }, { passive: false });
  }

  // ----- Watch Trailer button -----
  function bindWatchTrailer() {
    const btn = document.getElementById('watch-trailer-btn');
    const video = document.getElementById('trailer');
    if (!btn || !video) return;

    btn.addEventListener('click', function() {
      const frame = video.closest('.media-frame') || video;
      frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
      video.currentTime = 0;
      video.play().catch(function() {});
    });
  }

  // ----- Init -----
  function init() {
    ensureTrailerPlays();
    bindHeroLinks();
    bindWatchTrailer();

    // Pause/Play toggle
    const video = document.getElementById('trailer');
    const toggle = document.getElementById('trailer-toggle');
    if (video && toggle) {
      function syncBtn() {
        if (video.paused) {
          toggle.innerHTML = '&#9654;'; // Play symbol (▶)
          toggle.setAttribute('aria-label', 'Play video');
          toggle.setAttribute('aria-pressed', 'false');
        } else {
          toggle.innerHTML = '&#10074;&#10074;'; // Pause symbol (⏸)
          toggle.setAttribute('aria-label', 'Pause video');
          toggle.setAttribute('aria-pressed', 'true');
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
