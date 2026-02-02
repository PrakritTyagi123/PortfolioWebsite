/* =========================================================
   Projects — Paged buttons, centered active card + IG-style dots
   - Shows up to 5 dots; track slides/animates when more exist
   - Dots clickable; sync with autoplay & keys
   - Page scroll allowed while hovering projects
   - Auto-advance every 10s; pause on hover (resumes where left)
========================================================= */
(function () {
  const section =
    document.querySelector('#projects.paged') ||
    document.querySelector('#projects.projects.paged') ||
    document.querySelector('#projects');

  if (!section) return;

  const viewport = section.querySelector('.proj-viewport');
  const strip = section.querySelector('.proj-strip');
  const pages = strip ? Array.from(strip.querySelectorAll('.proj-page')) : [];
  const controls = section.querySelector('.proj-controls');
  const dotsWrap = section.querySelector('.proj-dots');
  const prevBtn = section.querySelector('#proj-prev');
  const nextBtn = section.querySelector('#proj-next');
  const pauseBtn = section.querySelector('#proj-pause');
  const counterEl = section.querySelector('#proj-counter');

  if (!viewport || !strip || pages.length === 0 || !prevBtn || !nextBtn || !controls || !dotsWrap) return;

  /* ------------------------------
     Helpers
  ------------------------------ */
  function cssNum(el, prop, fallback = 0) {
    const v = getComputedStyle(el).getPropertyValue(prop).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function getGapPx() {
    const v = getComputedStyle(strip).gap || '0';
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  // Width of each page "slot" (flex-basis) from the CSS custom prop
  function getPageWidth() {
    return cssNum(section, '--card-w', 800);
  }

  function centerTranslateForIndex(i) {
    const padLeft = cssNum(viewport, 'padding-left', 0);
    const viewportCenter = viewport.clientWidth / 2;
    const pageW = getPageWidth();
    const gap = getGapPx();
    const pageCenterX = i * (pageW + gap) + (pageW / 2);
    return viewportCenter - padLeft - pageCenterX;
  }

  let index = 0;

  /* ------------------------------
     Dots (IG-style sliding window)
  ------------------------------ */
  const MAX_VISIBLE_DOTS = 5;
  const DOT_HIT = cssNum(section, '--dot-hit', 24);
  const DOT_GAP = cssNum(section, '--dot-gap', 10);
  const DOT_SLOT = DOT_HIT + DOT_GAP;

  let dotButtons = [];
  let dotsTrack = null;
  let visibleDots = Math.min(MAX_VISIBLE_DOTS, pages.length);
  dotsWrap.style.setProperty('--dots-visible', String(visibleDots));

  function buildDots() {
    dotsWrap.innerHTML = '';
    dotsTrack = document.createElement('div');
    dotsTrack.className = 'proj-dots-track';
    dotsWrap.appendChild(dotsTrack);

    dotButtons = pages.map((page, i) => {
      if (!page.id) page.id = `proj-slide-${i + 1}`;

      const li = document.createElement('li');
      li.className = 'proj-dotitem';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'proj-dot';
      btn.setAttribute('aria-label', `Go to project ${i + 1}`);
      btn.setAttribute('aria-controls', page.id);

      btn.addEventListener('click', () => {
        goto(i);
        restartAutoplayFull();
      });

      li.appendChild(btn);
      dotsTrack.appendChild(li);
      return btn;
    });
  }

  function computeWindowStart(activeIdx) {
    // Keep active centered when possible; clamp to bounds
    const total = dotButtons.length;
    const half = Math.floor(visibleDots / 2);
    const maxStart = Math.max(0, total - visibleDots);
    let start = activeIdx - half;
    if (start < 0) start = 0;
    if (start > maxStart) start = maxStart;
    return start;
  }

  function slideDotsWindow(activeIdx) {
    const winStart = computeWindowStart(activeIdx);
    const tx = -(winStart * DOT_SLOT);
    if (dotsTrack) dotsTrack.style.transform = `translateX(${tx}px)`;
  }

  function updateDotsActive() {
    dotButtons.forEach((b, i) => {
      if (i === index) {
        b.classList.add('is-active');
        b.setAttribute('aria-current', 'true');
      } else {
        b.classList.remove('is-active');
        b.removeAttribute('aria-current');
      }
    });
    slideDotsWindow(index);
  }

  /* ------------------------------
     ARIA & page translate
  ------------------------------ */
  function updateAria() {
    pages.forEach((p, i) => {
      p.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      if (i === index) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
    });
    updateDotsActive();
    if (counterEl) {
      counterEl.textContent = `${index + 1} / ${pages.length}`;
    }
  }

  function goto(i, { instant = false } = {}) {
    index = (i + pages.length) % pages.length;
    const tx = centerTranslateForIndex(index);

    if (instant) {
      const prevTransition = strip.style.transition;
      strip.style.transition = 'none';
      strip.style.transform = `translateX(${tx}px)`;
      requestAnimationFrame(() => (strip.style.transition = prevTransition || ''));
    } else {
      strip.style.transform = `translateX(${tx}px)`;
    }
    updateAria();
  }

  /* ------------------------------
     Controls
  ------------------------------ */
  function onPrev() { goto(index - 1); restartAutoplayFull(); }
  function onNext() { goto(index + 1); restartAutoplayFull(); }

  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  // Optional: keyboard left/right when viewport is focused
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
  });

  // Arrow keys on dots container too
  dotsWrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
  });

  /* ------------------------------
     Autoplay (10s), pause on hover, resume with remaining time
  ------------------------------ */
  const AUTOPLAY_MS = 10000;
  let timerId = null;
  let remainingMs = AUTOPLAY_MS;
  let lastStart = 0;
  let paused = false;

  function scheduleAutoplay() {
    clearTimeout(timerId);
    lastStart = performance.now();
    timerId = setTimeout(() => {
      goto(index + 1);
      remainingMs = AUTOPLAY_MS;
      scheduleAutoplay();
    }, remainingMs);
  }

  function pauseAutoplay() {
    if (paused) return;
    paused = true;
    if (timerId !== null) {
      const elapsed = performance.now() - lastStart;
      remainingMs = Math.max(0, remainingMs - elapsed);
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function resumeAutoplay() {
    if (!paused) return;
    paused = false;
    if (remainingMs <= 10) remainingMs = AUTOPLAY_MS;
    scheduleAutoplay();
  }

  function restartAutoplayFull() {
    paused = false;
    remainingMs = AUTOPLAY_MS;
    scheduleAutoplay();
  }

  // Pause when hovering the viewport/strip/controls
  [viewport, strip, controls].forEach(t => {
    t.addEventListener('mouseenter', pauseAutoplay);
    t.addEventListener('mouseleave', resumeAutoplay);
  });

  // Pause/play toggle button
  if (pauseBtn) {
    const updatePauseUi = () => {
      if (paused) {
        pauseBtn.textContent = 'Play';
        pauseBtn.setAttribute('aria-label', 'Resume autoplay');
        pauseBtn.setAttribute('aria-pressed', 'true');
      } else {
        pauseBtn.textContent = 'Pause';
        pauseBtn.setAttribute('aria-label', 'Pause autoplay');
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
    };
    pauseBtn.addEventListener('click', () => {
      if (paused) {
        resumeAutoplay();
      } else {
        pauseAutoplay();
      }
      updatePauseUi();
    });
    updatePauseUi();
  }

  // Also pause while focusing interactive content inside
  viewport.addEventListener('focusin', pauseAutoplay);
  viewport.addEventListener('focusout', resumeAutoplay);
  controls.addEventListener('focusin', pauseAutoplay);
  controls.addEventListener('focusout', resumeAutoplay);

  /* ------------------------------
     Keep alignment on resize
  ------------------------------ */
  let rAF = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      visibleDots = Math.min(MAX_VISIBLE_DOTS, pages.length);
      dotsWrap.style.setProperty('--dots-visible', String(visibleDots));
      goto(index, { instant: true });
      slideDotsWindow(index);
    });
  });

  /* ------------------------------
     Init
  ------------------------------ */
  buildDots();
  visibleDots = Math.min(MAX_VISIBLE_DOTS, pages.length);
  dotsWrap.style.setProperty('--dots-visible', String(visibleDots));
  goto(0, { instant: true });
  scheduleAutoplay();

  /* ------------------------------
     Instant tooltips for tech icons
     - Move native title -> data-title to suppress browser delay
     - Show custom tooltip on hover immediately
  ------------------------------ */
  (function setupInstantTechTooltips(){
    const techImgs = section.querySelectorAll('.proj-tech img');
    techImgs.forEach(img => {
      const t = img.getAttribute('title') || img.getAttribute('alt') || '';
      if (t) {
        img.dataset.title = t;
        img.removeAttribute('title');
      }
    });

    let tip = null;
    function ensureTip(){
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'proj-tooltip';
        // Append inside the projects section so CSS vars (panel fg/bg) apply
        section.appendChild(tip);
      }
      return tip;
    }

    function showTip(text, x, y){
      const el = ensureTip();
      el.textContent = text;
      const pad = 8;
      el.style.left = Math.round(x + pad) + 'px';
      el.style.top  = Math.round(y + pad) + 'px';
      el.style.display = 'block';
    }

    function hideTip(){ if (tip) tip.style.display = 'none'; }

    section.addEventListener('mousemove', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const img = target.closest('.proj-tech img');
      if (img && img.dataset && img.dataset.title) {
        showTip(img.dataset.title, e.clientX, e.clientY);
      } else {
        hideTip();
      }
    });

    section.addEventListener('mouseleave', hideTip);
  })();
})();