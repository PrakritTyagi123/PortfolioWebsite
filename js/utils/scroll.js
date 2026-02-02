// Scroll utility functions
window.scrollUtils = {
  // Smooth scroll to target position
  smoothScrollTo: function(targetY, duration = 650) {
    const root = document.scrollingElement || document.documentElement;
    const startY = root.scrollTop;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      root.scrollTop = startY + deltaY * easeInOutCubic(progress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  },

  // Get header height from CSS variable
  getHeaderHeight: function() {
    const headerHeight = window.cssUtils.getCssVar('--header-h');
    const numericValue = window.cssUtils.parsePx(headerHeight);
    return Number.isFinite(numericValue) ? numericValue : 56;
  },

  // Scroll to element with offset
  scrollToElement: function(element, offset = null) {
    if (!element) return;
    
    const elementTop = element.getBoundingClientRect().top + 
                      (window.pageYOffset || document.documentElement.scrollTop);
    const headerOffset = offset !== null ? offset : this.getHeaderHeight();
    const targetY = elementTop - headerOffset;
    
    this.smoothScrollTo(targetY, 700);
  }
};