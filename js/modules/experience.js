/* =========================================================
   EXPERIENCE - Timeline scroll animations
   - Red progress bar fills down the spine as you scroll
   - Dots turn red ONLY when the progress bar reaches them
   ========================================================= */
(function () {
  'use strict';

  // Use shared utilities
  const $ = window.utils?.$ || ((sel, root = document) => root.querySelector(sel));
  const $$ = window.utils?.$$ || ((sel, root = document) => Array.from(root.querySelectorAll(sel)));

  let items = [];
  let dots = [];
  let section = null;
  let timeline = null;
  let initialized = false;

  /**
   * Update progress bar and dot states based on scroll
   */
  function updateProgress() {
    if (!timeline || dots.length === 0) return;

    const scrollTriggerY = window.innerHeight * 0.35;

    const timelineRect = timeline.getBoundingClientRect();

    const firstDot = dots[0];
    if (!firstDot) return;
    const firstDotRect = firstDot.getBoundingClientRect();
    const spineStartY = firstDotRect.top + (firstDotRect.height / 2);

    let progressHeight = scrollTriggerY - spineStartY;

    if (progressHeight < 0) progressHeight = 0;

    const spineFullHeight = timelineRect.bottom - spineStartY - 10;

    if (progressHeight > spineFullHeight) progressHeight = spineFullHeight;

    timeline.style.setProperty('--progress-height', progressHeight + 'px');

    const progressTipY = spineStartY + progressHeight;

    dots.forEach((dot, index) => {
      if (!dot) return;

      const item = items[index];
      const dotRect = dot.getBoundingClientRect();
      const dotCenterY = dotRect.top + (dotRect.height / 2);

      item.classList.remove('is-active', 'is-past', 'is-future');

      if (progressTipY >= dotCenterY + 5) {
        item.classList.add('is-past');
      }
      else if (progressTipY >= dotCenterY - 15) {
        item.classList.add('is-active');
      }
      else {
        item.classList.add('is-future');
      }
    });
  }

  /**
   * Throttled scroll handler
   */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Initialize
   */
  function init() {
    if (initialized) return;

    section = $('#work');
    if (!section) return;

    timeline = section.querySelector('.timeline');
    if (!timeline) return;

    items = $$('.t-item', section);
    if (items.length === 0) return;

    dots = items.map(item => item.querySelector('.t-dot'));

    initialized = true;

    updateProgress();

    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', () => {
      requestAnimationFrame(updateProgress);
    }, { passive: true });
  }

  // Boot sequence guarantees DOM is ready - no retries needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.experienceModule = { init };
})();