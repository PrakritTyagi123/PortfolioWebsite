/* =========================================================
   EXPERIENCE - Timeline scroll animations
   - Red progress bar fills down the spine as you scroll
   - Dots turn red ONLY when the progress bar reaches them
========================================================= */
(function () {
    'use strict';
  
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  
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
  
      // The scroll trigger line - where the progress bar "tip" is
      const scrollTriggerY = window.innerHeight * 0.35;
      
      // Get the timeline's position
      const timelineRect = timeline.getBoundingClientRect();
      
      // Get the first dot's position (spine starts here)
      const firstDot = dots[0];
      if (!firstDot) return;
      const firstDotRect = firstDot.getBoundingClientRect();
      const spineStartY = firstDotRect.top + (firstDotRect.height / 2);
      
      // Calculate progress bar height in pixels
      // This is how far the red line extends from the first dot
      let progressHeight = scrollTriggerY - spineStartY;
      
      // Clamp minimum to 0
      if (progressHeight < 0) progressHeight = 0;
      
      // Get the spine's full length (from first dot to bottom of timeline)
      // We want the red line to be able to go past the last dot to the end
      const spineFullHeight = timelineRect.bottom - spineStartY - 10;
      
      // Clamp maximum to full spine length
      if (progressHeight > spineFullHeight) progressHeight = spineFullHeight;
      
      // Set the progress bar height
      timeline.style.setProperty('--progress-height', progressHeight + 'px');
      
      // Now update dots - they turn red ONLY when the progress bar has reached them
      // The progress bar tip is at: spineStartY + progressHeight
      const progressTipY = spineStartY + progressHeight;
      
      dots.forEach((dot, index) => {
        if (!dot) return;
        
        const item = items[index];
        const dotRect = dot.getBoundingClientRect();
        const dotCenterY = dotRect.top + (dotRect.height / 2);
        
        item.classList.remove('is-active', 'is-past', 'is-future');
        
        // Dot turns red when progress bar has passed it (with small buffer)
        if (progressTipY >= dotCenterY + 5) {
          // Progress bar has passed this dot
          item.classList.add('is-past');
        } 
        // Dot is active when progress bar is very close to it
        else if (progressTipY >= dotCenterY - 15) {
          // Progress bar is at this dot - make it pulse
          item.classList.add('is-active');
        } 
        else {
          // Progress bar hasn't reached this dot yet
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
      if (!section) {
        setTimeout(init, 100);
        return;
      }
  
      timeline = section.querySelector('.timeline');
      if (!timeline) {
        setTimeout(init, 100);
        return;
      }
  
      items = $$('.t-item', section);
      if (items.length === 0) {
        setTimeout(init, 100);
        return;
      }
  
      // Cache dot elements
      dots = items.map(item => item.querySelector('.t-dot'));
  
      initialized = true;
  
      // Initial update
      updateProgress();
  
      // Listen for scroll
      window.addEventListener('scroll', onScroll, { passive: true });
  
      // Update on resize
      window.addEventListener('resize', () => {
        requestAnimationFrame(updateProgress);
      }, { passive: true });
  
      console.log('Experience timeline initialized:', items.length, 'items');
    }
  
    function tryInit() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        init();
      }
    }
  
    tryInit();
    setTimeout(tryInit, 500);
    setTimeout(tryInit, 1000);
  
    window.experienceModule = { init };
  })();