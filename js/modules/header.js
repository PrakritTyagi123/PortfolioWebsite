// =========================================================
// HEADER — Navigation + Theme Toggle
// Simple is-active class on links. No glass element.
// =========================================================

window.headerModule = (function () {
  'use strict';

  var initialized = false;
  var navLinks = [];
  var sections = [];
  var activeIndex = -1;
  var clickLock = 0;
  var scrollRafId = null;

  function getHeaderH() {
    if (window.utils && window.utils.getHeaderHeight) return window.utils.getHeaderHeight();
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;
  }

  // ---- Smooth scroll ----
  function smoothScroll(el) {
    if (scrollRafId) { cancelAnimationFrame(scrollRafId); scrollRafId = null; }
    window._smoothScrolling = true;

    var hh = getHeaderH();
    var start = window.pageYOffset;
    var end;

    if (el.id === 'contact' || el.classList.contains('contact')) {
      var footer = document.querySelector('.site-footer');
      end = footer
        ? Math.max(0, footer.getBoundingClientRect().bottom + start - window.innerHeight)
        : Math.max(0, el.getBoundingClientRect().top + start - hh - 12);
    } else {
      end = Math.max(0, el.getBoundingClientRect().top + start - hh - 12);
    }

    var dist = end - start;
    if (Math.abs(dist) < 2) { window._smoothScrolling = false; return; }

    var dur = Math.min(1400, Math.max(400, Math.abs(dist) * 0.5));
    var t0 = 0;

    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      // Smooth ease-in-out cubic for a more natural feel
      var ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, start + dist * ease);
      if (p < 1) {
        scrollRafId = requestAnimationFrame(step);
      } else {
        scrollRafId = null;
        window._smoothScrolling = false;
        // Release click lock shortly after scroll finishes so detectSection
        // doesn't override the active link during the scroll animation
        clickLock = Date.now() + 150;
      }
    }

    scrollRafId = requestAnimationFrame(step);
  }

  // ---- Active link ----
  function setActive(idx) {
    if (idx === activeIndex) return;
    navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    if (idx >= 0 && idx < navLinks.length) {
      navLinks[idx].classList.add('is-active');
    }
    activeIndex = idx;
  }

  // ---- Scroll detection ----
  function detectSection() {
    if (!sections.length) return;
    if (Date.now() < clickLock) return;

    var hh = getHeaderH();
    var trigger = hh + 100;
    var vh = window.innerHeight;
    var best = -1;
    var bestScore = -Infinity;

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (!sec) continue;
      var r = sec.getBoundingClientRect();
      if (r.bottom <= hh || r.top >= vh) continue;

      var score = (r.top <= trigger && r.bottom > trigger)
        ? 3000 - Math.abs(r.top - trigger)
        : 1000 - Math.abs(r.top - trigger);

      if (score > bestScore) { bestScore = score; best = i; }
    }

    if (best !== activeIndex) setActive(best);
  }

  // ---- Init ----
  function init() {
    if (initialized) return;
    var header = document.querySelector('.site-header');
    if (!header) return;

    var container = header.querySelector('.nav-links');
    if (!container) return;

    navLinks = Array.from(container.querySelectorAll('a[href^="#"]'));
    sections = navLinks.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);

    // Click handler
    navLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();

        // Set active immediately
        var idx = navLinks.indexOf(a);
        if (idx >= 0) {
          setActive(idx);
          clickLock = Date.now() + 1000;
        }

        // Scroll
        smoothScroll(target);
        if (history.pushState && location.hash !== hash) history.pushState(null, '', hash);
      });
    });

    // Brand
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

    // Initial detection
    requestAnimationFrame(detectSection);

    // Scroll listener
    var tick = false;
    window.addEventListener('scroll', function () {
      if (window._smoothScrolling || Date.now() < clickLock) return;
      if (!tick) {
        requestAnimationFrame(function () { detectSection(); tick = false; });
        tick = true;
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
    if (btn) btn.setAttribute('aria-label', 'Switch to ' + (theme === DARK ? LIGHT : DARK) + ' mode');
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
        var prevBg = getComputedStyle(HTML).getPropertyValue('--bg-primary').trim() ||
                     getComputedStyle(document.body).backgroundColor || '#000';
        apply(next);

        try {
          var r = btn.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          document.querySelectorAll('.theme-ring').forEach(function (el) { el.remove(); });
          var ring = document.createElement('div');
          ring.className = 'theme-ring';
          ring.style.setProperty('--cxpx', cx + 'px');
          ring.style.setProperty('--cypx', cy + 'px');
          ring.style.setProperty('--prev-bg', prevBg);
          ring.style.setProperty('--ring-color', getComputedStyle(HTML).getPropertyValue('--accent').trim() || '#ff0000');
          ring.style.willChange = 'width';
          document.body.appendChild(ring);
          var dx = Math.max(cx, innerWidth - cx), dy = Math.max(cy, innerHeight - cy);
          var dia = Math.ceil(Math.hypot(dx, dy)) * 2;
          requestAnimationFrame(function () {
            ring.style.transition = 'width 1800ms cubic-bezier(.2,.7,.1,1)';
            ring.style.width = dia + 'px';
            function cleanup() { window.removeEventListener('resize', cleanup); ring.remove(); }
            window.addEventListener('resize', cleanup, { passive: true });
            ring.addEventListener('transitionend', cleanup, { once: true });
            setTimeout(function () { if (document.body.contains(ring)) cleanup(); }, 2200);
          });
        } catch (e) {}
        try { localStorage.setItem(KEY, next); } catch (e) {}
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

// =========================================================
// PALETTE SWITCHER — Cycle through palettes
// =========================================================
window.paletteModule = (function () {
  'use strict';
  var HTML = document.documentElement;

  function switchPalette(newPalette) {
    // Update data attribute
    HTML.setAttribute('data-palette', newPalette.id);

    // Swap CSS <link> tags
    var darkLink = document.getElementById('palette-dark');
    var lightLink = document.getElementById('palette-light');
    var base = 'css/themes/' + newPalette.id + '/';

    if (darkLink) darkLink.href = base + 'dark.css?v=1';
    if (lightLink) lightLink.href = base + 'light.css?v=1';

    // Update global reference
    window.__palette = newPalette;
  }

  function getNextPalette() {
    var palettes = window.__palettes || [];
    if (!palettes.length) return null;
    var currentId = HTML.getAttribute('data-palette') || '';
    var currentIdx = -1;
    for (var i = 0; i < palettes.length; i++) {
      if (palettes[i].id === currentId) { currentIdx = i; break; }
    }
    var nextIdx = (currentIdx + 1) % palettes.length;
    return palettes[nextIdx];
  }

  function init() {
    var btn = document.getElementById('palette-toggle');
    if (!btn || btn._bound) return;

    btn.addEventListener('click', function () {
      var next = getNextPalette();
      if (!next) return;
      switchPalette(next);
    });

    btn._bound = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { init: init, switchPalette: switchPalette, getNextPalette: getNextPalette };
})();
