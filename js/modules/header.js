// Header navigation + Theme toggle + Glass indicator

window.headerModule = (function() {
  let initialized = false;
  let glassIndicator = null;
  let navLinks = [];
  let sections = [];
  let currentActiveIndex = -1;

  function init() {
    if (initialized) return;

    const header = document.querySelector('.site-header');
    if (!header) return;

    const links = header.querySelectorAll('.nav a[href^="#"]');
    
    // Filter to only section links (exclude github, etc)
    navLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') && href.length > 1 && !link.classList.contains('nav-github');
    });

    function headerHeight() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim();
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 56;
    }

    function goToHash(hash) {
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (!el) { console.warn('[header] Section not found:', hash); return; }

      // Calculate target position accounting for fixed header
      const hh = headerHeight();
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      const target = Math.max(0, elTop - hh - 12);

      // Use scrollTo with smooth behavior
      try {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } catch (e) {
        // Fallback for older browsers
        window.scrollTo(0, target);
      }

      // Update URL hash without triggering scroll
      if (history && history.replaceState) {
        history.replaceState(null, '', hash);
      }
    }

    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        e.preventDefault();
        
        // Find which nav link was clicked and move glass there first
        const clickedIndex = navLinks.indexOf(a);
        if (clickedIndex >= 0 && glassIndicator) {
          const linkRect = a.getBoundingClientRect();
          const headerRect = header.getBoundingClientRect();
          const x = linkRect.left - headerRect.left - 2;
          const width = linkRect.width + 4;
          
          glassIndicator.style.transform = `translateY(-50%) translateX(${x}px)`;
          glassIndicator.style.width = `${width}px`;
          currentActiveIndex = clickedIndex;
        }
        
        // Then scroll to section
        goToHash(hash);
      });
    });

    // Create glass indicator - append to header so it shares stacking context
    if (navLinks.length > 0) {
      // Remove any existing indicator first
      const existing = document.querySelector('.nav-glass-indicator');
      if (existing) existing.remove();
      
      glassIndicator = document.createElement('div');
      glassIndicator.className = 'nav-glass-indicator';
      header.appendChild(glassIndicator);

      // Collect sections
      sections = navLinks.map(link => {
        const href = link.getAttribute('href');
        return document.querySelector(href);
      }).filter(Boolean);

      // Initial update after layout settles - no animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateGlassIndicator();
          // Add transition class AFTER first position is set (with delay)
          setTimeout(() => {
            glassIndicator.classList.add('is-ready');
          }, 100);
        });
      });

      // Scroll listener with throttle
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateGlassIndicator();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Resize listener - recalc immediately so indicator doesn't lag/misalign
      window.addEventListener('resize', () => {
        currentActiveIndex = -1;
        requestAnimationFrame(updateGlassIndicator);
      }, { passive: true });
    }

    initialized = true;
  }

  function updateGlassIndicator() {
    if (!glassIndicator || navLinks.length === 0 || sections.length === 0) return;

    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;
    const viewportHeight = window.innerHeight;
    
    // Find which section is most visible
    let activeIndex = -1;
    let bestScore = -Infinity;

    sections.forEach((section, index) => {
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      
      // Calculate visibility score
      // Prefer sections that are near the top of the viewport (just below header)
      const triggerLine = headerH + 100; // 100px below header
      const distanceFromTrigger = Math.abs(rect.top - triggerLine);
      
      // Section must be at least partially visible
      const isVisible = rect.bottom > headerH && rect.top < viewportHeight;
      
      if (isVisible) {
        // Score based on proximity to trigger line (closer = higher score)
        // Also bonus if section top is at or above trigger line
        let score = 1000 - distanceFromTrigger;
        
        // Big bonus if we're inside this section (top is above trigger, bottom is below)
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          score += 2000;
        }
        
        if (score > bestScore) {
          bestScore = score;
          activeIndex = index;
        }
      }
    });

    // Update indicator position
    if (activeIndex >= 0 && activeIndex < navLinks.length) {
      // Only update position if section changed
      if (activeIndex !== currentActiveIndex) {
        const activeLink = navLinks[activeIndex];
        const linkRect = activeLink.getBoundingClientRect();
        const headerRect = document.querySelector('.site-header').getBoundingClientRect();
        
        // Position relative to header using transform (GPU accelerated)
        const x = linkRect.left - headerRect.left - 2;
        const width = linkRect.width + 4;
        
        glassIndicator.style.transform = `translateY(-50%) translateX(${x}px)`;
        glassIndicator.style.width = `${width}px`;
        glassIndicator.classList.add('is-visible');
        
        currentActiveIndex = activeIndex;
      }
    } else {
      if (currentActiveIndex !== -1) {
        glassIndicator.classList.remove('is-visible');
        currentActiveIndex = -1;
      }
    }
  }

  return { init, updateGlassIndicator, get _initialized() { return initialized; } };
})();

// Self-init fallback
(function() {
  if (window.headerModule && !window.headerModule._initialized) {
    window.headerModule.init();
  }
})();

// === Theme toggle functionality ===
window.themeModule = (function() {
  const HTML = document.documentElement;
  const BTN_ID = 'theme-toggle';
  const STORAGE_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function applyTheme(theme) {
    HTML.setAttribute('data-theme', theme);

    const lightLink = document.querySelector('link[data-theme="light"]');
    const darkLink  = document.querySelector('link[data-theme="dark"]');
    if (lightLink && darkLink) {
      lightLink.disabled = (theme !== LIGHT);
      darkLink.disabled  = (theme !== DARK);
    }

    const btn = document.getElementById(BTN_ID);
    if (btn) {
      const to = theme === DARK ? LIGHT : DARK;
      btn.setAttribute('aria-label', `Switch to ${to} mode`);
      btn.title = 'Switch theme';
    }
  }

  function init() {
    const existing = HTML.getAttribute('data-theme') || (window.__savedTheme || '').toString();
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const base =
      (existing === DARK || existing === LIGHT) ? existing :
      (saved === DARK || saved === LIGHT) ? saved :
      (prefersDark ? DARK : LIGHT);
    applyTheme(base);

    const btn = document.getElementById(BTN_ID);
    if (btn && !btn._bound) {
      btn.addEventListener('click', () => {
        const current = HTML.getAttribute('data-theme') === DARK ? DARK : LIGHT;
        const next = current === DARK ? LIGHT : DARK;

        let prevBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
        if (!prevBg) prevBg = getComputedStyle(document.body).backgroundColor || '#000';

        applyTheme(next);

        try {
          const r = btn.getBoundingClientRect();
          const cxpx = (r.left + r.width / 2) + 'px';
          const cypx = (r.top + r.height / 2) + 'px';
          document.querySelectorAll('.theme-ring').forEach(el => el.remove());

          const ring = document.createElement('div');
          ring.className = 'theme-ring';
          ring.style.setProperty('--cxpx', cxpx);
          ring.style.setProperty('--cypx', cypx);
          ring.style.setProperty('--prev-bg', prevBg);
          const computedStyle = getComputedStyle(document.documentElement);
          const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#ff0000';
          ring.style.setProperty('--ring-color', accentColor);
          ring.style.willChange = 'width';
          document.body.appendChild(ring);
          
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const cxNum = r.left + r.width / 2;
          const cyNum = r.top + r.height / 2;
          const dx = Math.max(cxNum, vw - cxNum);
          const dy = Math.max(cyNum, vh - cyNum);
          const finalDiameter = Math.ceil(Math.hypot(dx, dy)) * 2;

          const expand = () => {
            ring.style.transition = 'width 1800ms cubic-bezier(.2,.7,.1,1)';
            ring.style.width = finalDiameter + 'px';
            const cleanup = () => {
              window.removeEventListener('resize', onResize, { passive: true });
              window.removeEventListener('orientationchange', onResize, { passive: true });
              ring.remove();
            };
            const onResize = () => { cleanup(); };
            window.addEventListener('resize', onResize, { passive: true });
            window.addEventListener('orientationchange', onResize, { passive: true });
            ring.addEventListener('transitionend', cleanup, { once: true });
            setTimeout(() => { if (document.body.contains(ring)) cleanup(); }, 2200);
          };
          requestAnimationFrame(expand);
        } catch(e) {}
        try { localStorage.setItem(STORAGE_KEY, next); } catch(e) {}
      });
      btn._bound = true;
    }

    if (!saved && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', (e) => applyTheme(e.matches ? DARK : LIGHT));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { init, applyTheme };
})();