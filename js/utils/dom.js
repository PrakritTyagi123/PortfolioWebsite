// DOM utility functions - Fixed to use window assignments instead of ESM exports

// Simple query selectors (exported to window for compatibility)
window.qs = (sel, el=document) => el.querySelector(sel);
window.qsa = (sel, el=document) => Array.from(el.querySelectorAll(sel));
window.on = (el, ev, fn, opts) => (el.addEventListener(ev, fn, opts), () => el.removeEventListener(ev, fn, opts));

window.cssVar = {
  get: (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim(),
  set: (name, val, el = document.documentElement) => el.style.setProperty(name, val)
};

// DOM utility functions
window.domUtils = {
  // Get transform matrix X value
  getMatrixX: function(element) {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 0;
    try {
      return new DOMMatrix(transform).m41;
    } catch(e) {}
    try {
      return new WebKitCSSMatrix(transform).m41;
    } catch(e) {}
    return 0;
  },

  // Wrap coordinate value within bounds
  wrapValue: function(value, min, max) {
    const range = max - min;
    if (!isFinite(value) || !isFinite(range) || range <= 0) return min;
    while (value < min) value += range;
    while (value > max) value -= range;
    return value;
  },

  // Add/remove class with toggle
  toggleClass: function(element, className, condition) {
    if (element && element.classList) {
      element.classList.toggle(className, condition);
    }
  },

  // Query selector with null check
  safeQuery: function(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch(e) {
      return null;
    }
  },

  // Query all selectors with null check
  safeQueryAll: function(selector, parent = document) {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch(e) {
      return [];
    }
  }
};
