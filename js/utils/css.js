// CSS utility functions
window.cssUtils = {
  // Get computed CSS property value from document root
  getCssVar: function(varName) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || null;
  },

  // Set CSS custom property on element
  setCssVar: function(element, varName, value) {
    if (element && element.style) {
      element.style.setProperty(varName, value);
    }
  },

  // Parse pixels from CSS value
  parsePx: function(cssValue) {
    if (!cssValue) return 0;
    return parseFloat(cssValue) || 0;
  },

  // Get gap value in pixels
  getGap: function(element) {
    const gap = getComputedStyle(element).gap || '0px';
    return this.parsePx(gap);
  }
};
