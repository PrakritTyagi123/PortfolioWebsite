// Hear From Clients — CSS-animated marquee
// 1. Mark broken avatar images as fallback (show initials)
// 2. Duplicate .group children until group is wider than viewport
// 3. Clone the group once → two identical groups = seamless -50% loop
// 4. Compute duration from group width for constant px/sec speed
// 5. Add .marquee-ready to start the CSS animation

window.reviewsModule = (function () {
  'use strict';

  const SPEED = 45; // px per second
  let initialized = false;

  // Use shared utilities (utils.js is guaranteed loaded first)
  const q = window.utils.$;
  const qq = window.utils.$$;

  // --- Avatar fallbacks ---
  function setupAvatars(scope) {
    qq('.rev-avatar', scope).forEach(function (av) {
      const img = av.querySelector('img');
      if (!img) { av.classList.add('fallback'); return; }

      av.classList.add('fallback');
      if (img.complete) {
        if (img.naturalWidth > 0) av.classList.remove('fallback');
      } else {
        img.addEventListener('load', function () {
          if (img.naturalWidth > 0) av.classList.remove('fallback');
        }, { once: true });
        img.addEventListener('error', function () {
          av.classList.add('fallback');
        }, { once: true });
      }
    });
  }

  // --- Ensure group fills at least the viewport width ---
  function expandGroup(rowEl) {
    const marquee = q('.marquee', rowEl);
    if (!marquee) return;
    const group = q('.group', marquee);
    if (!group) return;

    const origCards = qq('.review', group);
    if (!origCards.length) return;

    let guard = 0;
    while (group.scrollWidth < rowEl.clientWidth + 100 && guard < 8) {
      guard++;
      origCards.forEach(function (c) { group.appendChild(c.cloneNode(true)); });
    }
  }

  // --- Clone the group to create A|B pair for seamless loop ---
  function cloneGroup(rowEl) {
    const marquee = q('.marquee', rowEl);
    if (!marquee) return;
    const group = q('.group', marquee);
    if (!group) return;

    // Remove any previous clones
    qq('.group', marquee).slice(1).forEach(function (g) { g.remove(); });

    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.appendChild(clone);
  }

  // --- Set animation duration based on group width ---
  function setDuration(rowEl) {
    const marquee = q('.marquee', rowEl);
    if (!marquee) return;
    const group = q('.group', marquee);
    if (!group) return;

    const w = group.scrollWidth;
    const sec = Math.max(10, Math.round(w / SPEED));
    marquee.style.setProperty('--marquee-duration', sec + 's');
  }

  // --- Prepare one row ---
  function prepareRow(rowEl) {
    expandGroup(rowEl);
    cloneGroup(rowEl);
    setDuration(rowEl);
    setupAvatars(rowEl);
  }

  // --- Init ---
  function init() {
    if (initialized) return;

    const section = q('.clients');
    if (!section) return;

    const rows = qq('.marquee-row', section);
    if (!rows.length) return;

    // Double rAF to let DOM settle before measuring
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        rows.forEach(prepareRow);

        // Start the CSS animation
        section.classList.add('marquee-ready');

        // Recalculate on resize (debounced)
        let timer = null;
        window.addEventListener('resize', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            for (const row of rows) {
              expandGroup(row);
              cloneGroup(row);
              setDuration(row);
              setupAvatars(row);
            }
          }, 200);
        });

        initialized = true;
      });
    });
  }

  // Boot sequence guarantees DOM is ready
  init();

  return { init: init };
})();