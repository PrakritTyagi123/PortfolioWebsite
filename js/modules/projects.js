/* =========================================================
   PROJECTS — Scroll Carousel + Filter + Nav Buttons + Autoplay
   ========================================================= */
(function () {
  'use strict';

  function init() {
    const section = document.querySelector('#projects');
    if (!section) return;
  
    const track = section.querySelector('.proj-track');
    const cards = () => Array.from(track.querySelectorAll('.proj-card:not([data-hidden="true"])'));
    const prevBtn = section.querySelector('#proj-prev');
    const nextBtn = section.querySelector('#proj-next');
    const filterBtns = Array.from(section.querySelectorAll('.proj-filter-btn'));
    const allCards = Array.from(track.querySelectorAll('.proj-card'));
  
    if (!track || !prevBtn || !nextBtn) return;
  
    /* ---------- Helpers ---------- */
    function clamp(n, min, max) {
      return Math.max(min, Math.min(n, max));
    }
  
    function getActiveIndex() {
      const c = cards();
      if (c.length === 0) return 0;
  
      const trackRect = track.getBoundingClientRect();
      const targetX = trackRect.left + (trackRect.width / 2);
  
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < c.length; i++) {
        const r = c[i].getBoundingClientRect();
        const cx = r.left + (r.width / 2);
        const d = Math.abs(cx - targetX);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      return bestIdx;
    }
  
    let currentScrollAnimation = null;

    function scrollToIndex(i, smooth) {
      if (smooth === undefined) smooth = true;
      const c = cards();
      if (c.length === 0) return;

      // Cancel any existing animation
      if (currentScrollAnimation) {
        cancelAnimationFrame(currentScrollAnimation);
        currentScrollAnimation = null;
      }

      const idx = clamp(i, 0, c.length - 1);
      const card = c[idx];

      // Calculate target position once before animation
      const targetLeft = card.offsetLeft - ((track.clientWidth - card.clientWidth) / 2);
      const startLeft = track.scrollLeft;
      const distance = targetLeft - startLeft;
      
      if (Math.abs(distance) < 1) return; // Already at target
      
      if (smooth) {
        const duration = Math.min(600, Math.max(300, Math.abs(distance) * 0.4));
        let startTime = null;

        function ease(t) {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(now) {
          if (!startTime) startTime = now;
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          track.scrollLeft = startLeft + distance * ease(progress);
          
          if (progress < 1) {
            currentScrollAnimation = requestAnimationFrame(step);
          } else {
            track.scrollLeft = targetLeft;
            currentScrollAnimation = null;
          }
        }

        currentScrollAnimation = requestAnimationFrame(step);
      } else {
        track.scrollLeft = targetLeft;
      }
    }
  
    /* ---------- Dynamic card numbering ---------- */
    function numberCards() {
      const c = cards();
      c.forEach(function (card, i) {
        const existing = card.querySelector('.proj-card-number');
        if (existing) existing.remove();

        const badge = document.createElement('span');
        badge.className = 'proj-card-number';
        badge.textContent = '#' + (i + 1);

        const media = card.querySelector('.proj-card-media');
        if (media) {
          media.appendChild(badge);
        } else {
          card.insertBefore(badge, card.firstChild);
        }
      });
    }

    /* ---------- Nav buttons ---------- */
    prevBtn.addEventListener('click', function () {
      var c = cards();
      if (c.length === 0) return;
      var idx = getActiveIndex();
      scrollToIndex(idx <= 0 ? c.length - 1 : idx - 1);
      restartAutoplay();
    });

    nextBtn.addEventListener('click', function () {
      var c = cards();
      if (c.length === 0) return;
      var idx = getActiveIndex();
      scrollToIndex(idx >= c.length - 1 ? 0 : idx + 1);
      restartAutoplay();
    });
  
    /* ---------- Keyboard nav ---------- */
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBtn.click();
      }
    });
  
    /* ---------- Autoplay ---------- */
    var AUTOPLAY_MS = 8000;
    let autoTimer = null;
    let autoPaused = false;
  
    function scheduleAutoplay() {
      clearTimeout(autoTimer);
      if (autoPaused) return;
      autoTimer = setTimeout(function () {
        var c = cards();
        var idx = getActiveIndex();
        var nextIdx = idx + 1;
        scrollToIndex(nextIdx >= c.length ? 0 : nextIdx);
        scheduleAutoplay();
      }, AUTOPLAY_MS);
    }
  
    function restartAutoplay() {
      autoPaused = false;
      scheduleAutoplay();
    }
  
    track.addEventListener('mouseenter', function () { autoPaused = true; clearTimeout(autoTimer); });
    track.addEventListener('mouseleave', function () { autoPaused = false; scheduleAutoplay(); });
    track.addEventListener('touchstart', function () { autoPaused = true; clearTimeout(autoTimer); }, { passive: true });
    track.addEventListener('touchend', function () { setTimeout(function() { autoPaused = false; scheduleAutoplay(); }, 3000); }, { passive: true });
  
    /* ---------- Filter ---------- */
    function applyFilter(filter) {
      allCards.forEach(function (card) {
        var cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat === filter) {
          card.removeAttribute('data-hidden');
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
  
      track.scrollLeft = 0;
      requestAnimationFrame(function () {
        numberCards();
        restartAutoplay();
      });
    }
  
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        applyFilter(btn.dataset.filter);
      });
    });
  
    /* ---------- Init ---------- */
    numberCards();
    scheduleAutoplay();
  }

  // Boot sequence guarantees DOM is ready, but add guard for consistency
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.projectsModule = { init };
})();