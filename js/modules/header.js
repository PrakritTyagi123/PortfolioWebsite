// =========================================================
// HEADER — Navigation + Glass Indicator + Theme Toggle
// =========================================================

window.headerModule = (function () {
  'use strict';

  let initialized = false;
  let glass = null;
  let navLinksContainer = null;
  let navLinks = [];
  let sections = [];
  let activeIndex = -1;
  let clickLock = 0; // timestamp — block scroll updates until this

  // ---- Helpers ----
  function getHeaderH() {
    return (window.utils && window.utils.getHeaderHeight)
      ? window.utils.getHeaderHeight()
      : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;
  }

  // ---- Smooth scroll ----
  function smoothScroll(el) {
    window._smoothScrolling = true;
    const hh = getHeaderH();
    const start = window.pageYOffset;
    const isContact = el.id === 'contact' || el.classList.contains('contact');
    let end;

    if (isContact) {
      const footer = document.querySelector('.site-footer');
      if (footer) {
        end = Math.max(0, footer.getBoundingClientRect().bottom + start - window.innerHeight);
      } else {
        end = Math.max(0, el.getBoundingClientRect().top + start - hh - 12);
      }
    } else {
      end = Math.max(0, el.getBoundingClientRect().top + start - hh - 12);
    }

    const dist = end - start;
    const dur = Math.min(1200, Math.max(400, Math.abs(dist) * 0.5));
    let t0 = null;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    (function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) requestAnimationFrame(step);
      else window._smoothScrolling = false;
    })(performance.now());
  }

  // ---- Glass indicator ----
  function positionGlass(idx, instant) {
    if (!glass || idx < 0 || idx >= navLinks.length) return;
    const link = navLinks[idx];
    const lr = link.getBoundingClientRect();
    const pr = navLinksContainer.getBoundingClientRect();
    const x = lr.left - pr.left;
    const w = lr.width;

    if (instant) {
      glass.classList.remove('is-ready');
      glass.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
      glass.style.width = w + 'px';
      void glass.offsetWidth; // force reflow
      glass.classList.add('is-ready');
    } else {
      glass.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
      glass.style.width = w + 'px';
    }
    glass.classList.add('is-visible');
  }

  function setActive(idx) {
    if (idx === activeIndex) return;
    // Remove old
    navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    // Set new
    if (idx >= 0 && idx < navLinks.length) {
      navLinks[idx].classList.add('is-active');
      positionGlass(idx, false);
    } else {
      glass && glass.classList.remove('is-visible');
    }
    activeIndex = idx;
  }

  // ---- Scroll-based section detection ----
  function detectSection() {
    if (!glass || !sections.length) return;
    if (Date.now() < clickLock) return;

    const hh = getHeaderH();
    const trigger = hh + 100;
    const vh = window.innerHeight;
    let best = -1;
    let bestScore = -Infinity;

    sections.forEach(function (sec, i) {
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (r.bottom <= hh || r.top >= vh) return; // off screen

      let score = 0;
      // Inside section (top above trigger, bottom below)
      if (r.top <= trigger && r.bottom > trigger) score = 3000 - Math.abs(r.top - trigger);
      else score = 1000 - Math.abs(r.top - trigger);

      if (score > bestScore) { bestScore = score; best = i; }
    });

    if (best !== activeIndex) setActive(best);
  }

  // ---- Init ----
  function init() {
    if (initialized) return;
    const header = document.querySelector('.site-header');
    if (!header) return;

    navLinksContainer = header.querySelector('.nav-links');
    if (!navLinksContainer) return;

    const allAs = navLinksContainer.querySelectorAll('a[href^="#"]');
    navLinks = Array.from(allAs);

    sections = navLinks.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);

    // Build glass element inside .nav-links
    glass = document.createElement('div');
    glass.className = 'nav-glass-indicator';
    navLinksContainer.style.position = 'relative';
    navLinksContainer.appendChild(glass);

    // ---- Click handler ----
    navLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();

        var idx = navLinks.indexOf(a);
        if (idx >= 0) {
          // Snap glass instantly + lock out scroll updates
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          a.classList.add('is-active');
          positionGlass(idx, true);
          activeIndex = idx;
          clickLock = Date.now() + 1400;
        }

        smoothScroll(target);
        if (history.pushState && location.hash !== hash) history.pushState(null, '', hash);
      });
    });

    // Brand link
    var brand = header.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        var hash = brand.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        smoothScroll(target);
        if (history.pushState && location.hash !== hash) history.pushState(null, '', hash);
      });
    }

    window._smoothScroll = smoothScroll;

    // Initial position
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        detectSection();
        setTimeout(function () { glass.classList.add('is-ready'); }, 80);
      });
    });

    // Scroll listener
    var scrollTick = false;
    window.addEventListener('scroll', function () {
      if (window._smoothScrolling) return;
      if (Date.now() < clickLock) return;
      if (!scrollTick) {
        requestAnimationFrame(function () { detectSection(); scrollTick = false; });
        scrollTick = true;
      }
    }, { passive: true });

    // Resize
    window.addEventListener('resize', function () {
      clickLock = 0;
      activeIndex = -1;
      requestAnimationFrame(detectSection);
    }, { passive: true });

    initialized = true;
  }

  return { init: init, get _initialized() { return initialized; } };
})();

// Self-init
(function () {
  if (window.headerModule && !window.headerModule._initialized) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.headerModule.init, { once: true });
    } else {
      window.headerModule.init();
    }
  }
})();


// =========================================================
// THEME TOGGLE
// =========================================================
window.themeModule = (function () {
  'use strict';
  var HTML = document.documentElement;
  var KEY = 'theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  function apply(theme) {
    HTML.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + (theme === DARK ? LIGHT : DARK) + ' mode');
    }
  }

  function init() {
    var existing = HTML.getAttribute('data-theme') || (window.__savedTheme || '').toString();
    var saved = localStorage.getItem(KEY);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var base =
      (existing === DARK || existing === LIGHT) ? existing :
      (saved === DARK || saved === LIGHT) ? saved :
      (prefersDark ? DARK : LIGHT);
    apply(base);

    var btn = document.getElementById('theme-toggle');
    if (btn && !btn._bound) {
      btn.addEventListener('click', function () {
        var cur = HTML.getAttribute('data-theme') === DARK ? DARK : LIGHT;
        var next = cur === DARK ? LIGHT : DARK;

        var prevBg = getComputedStyle(HTML).getPropertyValue('--bg-primary').trim();
        if (!prevBg) prevBg = getComputedStyle(document.body).backgroundColor || '#000';

        apply(next);

        // Expanding ring animation
        try {
          var r = btn.getBoundingClientRect();
          var cx = r.left + r.width / 2;
          var cy = r.top + r.height / 2;
          document.querySelectorAll('.theme-ring').forEach(function (el) { el.remove(); });

          var ring = document.createElement('div');
          ring.className = 'theme-ring';
          ring.style.setProperty('--cxpx', cx + 'px');
          ring.style.setProperty('--cypx', cy + 'px');
          ring.style.setProperty('--prev-bg', prevBg);
          var accent = getComputedStyle(HTML).getPropertyValue('--accent').trim() || '#ff0000';
          ring.style.setProperty('--ring-color', accent);
          ring.style.willChange = 'width';
          document.body.appendChild(ring);

          var vw = window.innerWidth, vh = window.innerHeight;
          var dx = Math.max(cx, vw - cx), dy = Math.max(cy, vh - cy);
          var dia = Math.ceil(Math.hypot(dx, dy)) * 2;

          requestAnimationFrame(function () {
            ring.style.transition = 'width 1800ms cubic-bezier(.2,.7,.1,1)';
            ring.style.width = dia + 'px';
            function cleanup() {
              window.removeEventListener('resize', cleanup);
              ring.remove();
            }
            window.addEventListener('resize', cleanup, { passive: true });
            ring.addEventListener('transitionend', cleanup, { once: true });
            setTimeout(function () { if (document.body.contains(ring)) cleanup(); }, 2200);
          });
        } catch (e) { /* ignore */ }

        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      });
      btn._bound = true;
    }

    if (!saved && window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function (e) { apply(e.matches ? DARK : LIGHT); });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { init: init, applyTheme: apply };
})();