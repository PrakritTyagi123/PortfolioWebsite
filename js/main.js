// Main application initialization
(function() {
  'use strict';

  // Wait for DOM to be ready
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  // Initialize all modules
  function initializeApp() {
    try {
      if (window.headerModule) {
        window.headerModule.init();
      }

      if (window.projectsModule) {
        window.projectsModule.init();
      }

      if (window.aboutModule) {
        window.aboutModule.init();
      }

      if (window.contactModule) {
        window.contactModule.init();
      }

      if (window.reviewsModule) {
        window.reviewsModule.init();
      }

      console.log('Portfolio application initialized successfully');
    } catch (error) {
      console.error('Error initializing portfolio application:', error);
    }
  }

  // Start the application
  ready(initializeApp);
})();