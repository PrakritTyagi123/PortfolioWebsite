(function () {
  const CONFIG = {
    handle: '@PrakritTyagi19',
    apiKey: 'AIzaSyCffLilUHmhLy7ri1V_Kd7fC4CnNJ_ibq0', // Note: Consider restricting this key by HTTP referrer in Google Cloud Console
    pageSize: 50,
    maxPages: 100,
    scrollSpeed: 0.25
  };

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ---------- Helpers
  async function fetchJSON(url) {
    const res = await fetch(url);
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = data?.error?.message || res.statusText || 'HTTP ' + res.status;
      throw new Error(msg);
    }
    // YouTube error payloads sometimes come with 200 but no items
    if (data?.error?.message) throw new Error(data.error.message);
    return data;
  }

  function setStatus(container, msg) {
    let s = container.querySelector('.yt-status');
    if (!s) {
      s = document.createElement('div');
      s.className = 'yt-status';
      container.appendChild(s);
    }
    s.textContent = msg;
  }

  // ---------- YouTube helpers (low-quota playlist method)
  async function getUploadsPlaylistIdByHandle(handle) {
    const tryHandles = [];
    // try with and without @
    tryHandles.push(handle);
    if (handle.startsWith('@')) tryHandles.push(handle.slice(1));

    for (const h of tryHandles) {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(h)}&key=${CONFIG.apiKey}`;
      const data = await fetchJSON(url);
      const item = data.items?.[0];
      const uploads = item?.contentDetails?.relatedPlaylists?.uploads;
      if (uploads) return uploads;
    }
    throw new Error('Channel not found for handle');
  }

  async function fetchAllPlaylistVideos(playlistId) {
    let pageToken = '';
    const videos = [];
    let pages = 0;

    while (pages < CONFIG.maxPages) {
      pages++;
      const url =
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet` +
        `&playlistId=${playlistId}` +
        `&maxResults=${CONFIG.pageSize}` +
        (pageToken ? `&pageToken=${pageToken}` : '') +
        `&key=${CONFIG.apiKey}`;

      const data = await fetchJSON(url);
      const items = data.items || [];
      for (const it of items) {
        const sn = it.snippet || {};
        const rid = sn.resourceId || {};
        const videoId = rid.videoId || '';
        if (!videoId) continue;

        const title = sn.title || '';
        const publishedAt = sn.publishedAt || null;
        const isLatest = publishedAt
          ? (Date.now() - new Date(publishedAt).getTime()) <= ONE_WEEK_MS
          : false;

        const thumb = (sn.thumbnails && (sn.thumbnails.maxres?.url ||
                                         sn.thumbnails.high?.url ||
                                         sn.thumbnails.medium?.url ||
                                         sn.thumbnails.default?.url)) ||
                      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        videos.push({ id: videoId, title, thumb, url: `https://www.youtube.com/watch?v=${videoId}`, isLatest });
      }

      pageToken = data.nextPageToken || '';
      if (!pageToken) break;
    }
    return videos;
  }

  function cardHTML(v) {
    const latestBadge = v.isLatest
      ? `<span class="yt-badge latest" aria-label="Latest video">Latest</span>`
      : '';
    return `
      <a class="yt-card" href="${v.url}" target="_blank" rel="noopener noreferrer" aria-label="${esc(v.title)}">
        <div class="yt-thumb">
          <img src="${v.thumb}" alt="${esc(v.title)}">
          ${latestBadge}
        </div>
        <div class="yt-title">${esc(v.title)}</div>
      </a>`;
  }

  // ---------- Auto & user scroll (same behavior)
  function enableAutoAndUserScroll(stripEl, rowEl) {
    const canSeamlessLoop = rowEl.scrollWidth < stripEl.clientWidth * 3;
    if (canSeamlessLoop && rowEl.children.length) {
      rowEl.innerHTML += rowEl.innerHTML;
    }

    let paused = false;
    function loop() {
      if (!paused) {
        stripEl.scrollLeft += CONFIG.scrollSpeed;
        if (canSeamlessLoop) {
          const half = rowEl.scrollWidth / 2;
          if (stripEl.scrollLeft >= half) stripEl.scrollLeft -= half;
        } else {
          if (stripEl.scrollLeft + stripEl.clientWidth >= rowEl.scrollWidth - 1) {
            stripEl.scrollLeft = 0;
          }
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    stripEl.addEventListener('mouseenter', () => paused = true);
    stripEl.addEventListener('mouseleave', () => paused = false);
    stripEl.addEventListener('focusin', () => paused = true);
    stripEl.addEventListener('focusout', () => paused = false);

    let userScrollTimer = null;
    stripEl.addEventListener('scroll', () => {
      paused = true;
      clearTimeout(userScrollTimer);
      userScrollTimer = setTimeout(() => (paused = false), 1200);
    });

    stripEl.addEventListener('wheel', (e) => {
      const vert = Math.abs(e.deltaY);
      const horiz = Math.abs(e.deltaX);
      if (vert > horiz) {
        stripEl.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    let isDown = false, startX = 0, startLeft = 0, moved = 0, suppressNextClick = false;

    function onMove(e) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 3) {
        stripEl.scrollLeft = startLeft - dx;
        suppressNextClick = true;
      }
    }
    function onUp() {
      if (!isDown) return;
      isDown = false;
      if (suppressNextClick) setTimeout(() => (suppressNextClick = false), 50);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setTimeout(() => (paused = false), 80);
      stripEl.classList.remove('is-dragging');
    }

    stripEl.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX;
      startLeft = stripEl.scrollLeft;
      moved = 0;
      suppressNextClick = false;
      paused = true;
      stripEl.classList.add('is-dragging');
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
    });

    stripEl.addEventListener('click', (e) => {
      if (suppressNextClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  // ---------- Robust init (works even if DOMContentLoaded already fired)
  async function initYouTubeStrip() {
    const section = document.querySelector('#extra .youtube-latest');
    if (!section) return;
    const strip = section.querySelector('.yt-strip');
    const row = strip.querySelector('.yt-row');

    try {
      setStatus(section, 'Loading videos…');

      const uploadsId = await getUploadsPlaylistIdByHandle(CONFIG.handle);
      const videos = await fetchAllPlaylistVideos(uploadsId);

      if (!videos.length) {
        setStatus(section, 'No videos found.');
        return;
      }

      row.innerHTML = videos.map(cardHTML).join('');
      const status = section.querySelector('.yt-status');
      if (status) status.remove();

      enableAutoAndUserScroll(strip, row);
    } catch (err) {
      console.error('YouTube load error →', err);
      setStatus(section, 'YouTube error: ' + (err?.message || String(err)));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYouTubeStrip, { once: true });
  } else {
    // already loaded (e.g., script injected late)
    initYouTubeStrip();
  }
})();