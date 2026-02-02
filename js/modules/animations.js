// Reveal-on-scroll and subtle polish
(function(){
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function markReveal(targets, baseClass){
    targets.forEach(el => {
      if (!el.classList.contains('is-visible')) {
        el.classList.add(baseClass || 'reveal');
      }
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  function setupReveals(){
    // Exclude .clients (reviews.js owns it) and .about (about.js controls it)
    const sectionShells = document.querySelectorAll('.hero, .work, .projects, .extra, .contact');
    markReveal(Array.from(sectionShells), 'reveal-up');

    // Projects cards
    markReveal(Array.from(document.querySelectorAll('#projects .proj-card')),'reveal-scale');

    // Extra activity groups
    markReveal(Array.from(document.querySelectorAll('.extra .activity-group, .extra .journey-card')),'reveal');

    // Observe all reveals
    document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-scale').forEach(el => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReveals, { once: true });
  } else {
    setupReveals();
  }
})();


