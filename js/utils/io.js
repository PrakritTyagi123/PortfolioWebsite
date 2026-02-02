// Input/Output and event utility functions
window.ioUtils = {
  // Debounce function
  debounce: function(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },

  // Throttle function
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Safe event listener addition
  addEvent: function(element, event, handler, options = {}) {
    if (element && element.addEventListener) {
      element.addEventListener(event, handler, options);
      return true;
    }
    return false;
  },

  // Safe event listener removal
  removeEvent: function(element, event, handler, options = {}) {
    if (element && element.removeEventListener) {
      element.removeEventListener(event, handler, options);
      return true;
    }
    return false;
  },

  // Prevent default with safety check
  preventDefault: function(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
  },

  // Timer management
  createTimer: function() {
    let timerId = null;

    return {
      set: function(callback, delay) {
        this.clear();
        timerId = setTimeout(callback, delay);
      },
      clear: function() {
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      }
    };
  }
};
