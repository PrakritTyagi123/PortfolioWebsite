// Hear From Clients — JS-only marquee
// - HTML holds ONE .group per row; JS clones it once (A|B) for seamless loop
// - If the group is narrower than the viewport, JS duplicates its CHILDREN
//   until it fills the width (then clones the expanded group).
// - Sets a constant speed (px/sec) by computing duration from group width.
// - Always rotating; only pauses on hover (handled in CSS).
// - Avatar fallback: always show initials (images are hidden).

window.reviewsModule = (function () {
  const SPEED_PX_PER_SEC = 45; // adjust to taste
  let initialized = false;

  const q  = (sel, root = document) => root.querySelector(sel);
  const qq = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Wait for all images in a scope to settle (loaded or errored)
  function waitForImages(scope) {
    const imgs = qq('img', scope);
    if (!imgs.length) return Promise.resolve();
    const promises = imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        const done = () => res();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    });
    return Promise.all(promises);
  }

  // If the first .group is too narrow, duplicate its children until it fills viewport
  function ensureGroupWideEnough(rowEl) {
    const marquee = q('.marquee', rowEl);
    const group = q('.group', marquee);
    if (!group) return;

    let guard = 0;
    // Measure until group width >= row width + small buffer
    while (group.getBoundingClientRect().width < rowEl.clientWidth + 48 && guard < 6) {
      guard++;
      const children = qq('.review', group);
      if (!children.length) break;
      // Duplicate children once per loop
      children.forEach(child => group.appendChild(child.cloneNode(true)));
    }
  }

  function cloneGroup(rowEl) {
    const marquee = q('.marquee', rowEl);
    const group = q('.group', marquee);
    if (!group) return;

    // Remove any existing extra groups first (idempotent init)
    qq('.group', marquee).slice(1).forEach(g => g.remove());

    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.appendChild(clone);
  }

  function setDurationFromWidth(rowEl) {
    const marquee = q('.marquee', rowEl);
    const firstGroup = q('.group', marquee);
    if (!firstGroup) return;

    const groupWidth = firstGroup.getBoundingClientRect().width;
    const durationSec = Math.max(10, Math.round(groupWidth / SPEED_PX_PER_SEC));
    marquee.style.setProperty('--marquee-duration', `${durationSec}s`);
  }

  // Setup avatar fallbacks - always show initials
  function setupAvatarFallbacks(scope) {
    qq('.rev-avatar', scope).forEach(avatar => {
      const img = avatar.querySelector('img');
      if (!img) {
        // No image at all, just show initials
        avatar.classList.add('fallback');
        return;
      }
      
      // Always add fallback class to show initials
      // The image will overlay if it loads successfully
      avatar.classList.add('fallback');
      
      // If image loads successfully, remove fallback to show the image
      if (img.complete && img.naturalWidth > 0) {
        avatar.classList.remove('fallback');
      } else {
        img.addEventListener('load', () => {
          if (img.naturalWidth > 0) {
            avatar.classList.remove('fallback');
          }
        }, { once: true });
        
        img.addEventListener('error', () => {
          // Keep fallback class - initials will show
          avatar.classList.add('fallback');
        }, { once: true });
      }
    });
  }

  async function prepareRow(rowEl) {
    // 1) Setup avatar fallbacks first (show initials immediately)
    setupAvatarFallbacks(rowEl);
    
    // 2) Wait for images so measurements are accurate
    await waitForImages(rowEl);

    // 3) Make sure one group is wide enough to fill the viewport
    ensureGroupWideEnough(rowEl);

    // 4) Clone that group once to create A|B for seamless loop
    cloneGroup(rowEl);

    // 5) Compute duration based on group width (constant px/sec)
    setDurationFromWidth(rowEl);

    // 6) Re-setup fallbacks for cloned elements
    setupAvatarFallbacks(rowEl);
  }

  function markReady() {
    const section = q('.clients');
    if (section) section.classList.add('marquee-ready');
  }

  function onResize() {
    // Recompute duration and expand if the viewport grew
    qq('.clients .marquee-row').forEach(async row => {
      ensureGroupWideEnough(row);
      cloneGroup(row);
      setDurationFromWidth(row);
      setupAvatarFallbacks(row);
    });
  }

  async function init() {
    if (initialized) return;
    const section = q('.clients');
    if (!section) return;

    const rows = qq('.marquee-row', section);
    if (!rows.length) return;

    // Prepare each row then start animation
    for (const row of rows) {
      await prepareRow(row);
    }
    markReady();

    // Recalculate on resize (debounced)
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(onResize, 150);
    });

    initialized = true;
  }

  return { init };
})();