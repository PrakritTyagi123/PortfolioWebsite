// =========================================================
// Shared Utilities Module
// =========================================================
window.utils = (function() {
  'use strict';

  // Query selector helpers (standardized naming)
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Header height helper (reads CSS var set by hero.js)
  function getHeaderHeight() {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
    return Number.isFinite(value) && value > 0 ? value : 56;
  }

  // Smooth scroll helper (uses headerModule's implementation)
  function smoothScrollTo(target) {
    if (window._smoothScroll) {
      window._smoothScroll(target);
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Centralized image error handler
  function setupImageErrorHandling() {
    // Attach error handlers to all images
    function handleImageError(img) {
      if (img.closest('.review') || img.closest('.rev-avatar')) {
        img.remove();
      } else {
        img.style.display = 'none';
      }
    }

    // Handle images that are already in the DOM
    function attachHandlers() {
      document.querySelectorAll('img').forEach(img => {
        // Skip if already has handler or already handled
        if (img.dataset.errorHandled) return;
        
        img.addEventListener('error', function() {
          handleImageError(this);
          this.dataset.errorHandled = 'true';
        }, { once: true });
      });
    }

    // Handle dynamically added images via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG') {
              node.addEventListener('error', function() {
                handleImageError(this);
                this.dataset.errorHandled = 'true';
              }, { once: true });
            }
            // Also check for images within added nodes
            node.querySelectorAll?.('img').forEach(img => {
              if (!img.dataset.errorHandled) {
                img.addEventListener('error', function() {
                  handleImageError(this);
                  this.dataset.errorHandled = 'true';
                }, { once: true });
              }
            });
          }
        });
      });
    });

    // Initial setup
    attachHandlers();

    // Watch for new images
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageErrorHandling, { once: true });
  } else {
    setupImageErrorHandling();
  }

  return {
    $,
    $$,
    getHeaderHeight,
    smoothScrollTo
  };
})();
