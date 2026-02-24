/* =========================================================
   NETWORK BACKGROUND — MONOCHROME
   Reads colors & config from :root[data-theme] CSS custom properties
   Uses spatial grid for O(n) neighbor lookups instead of O(n²)
   ========================================================= */

(function () {
  'use strict';

  var canvas = document.getElementById('network-bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = 0;
  var H = 0;
  var mouse = { x: -9999, y: -9999 };
  var particles = [];
  var raf = null;

  var CFG = {
    density: 0.00010,
    minParticles: 80,
    maxDist: 250,
    mouseRadius: 300,
    mouseRepel: 0.03,
    speed: 0.3,
    minSpeed: 0.15,
    damping: 0.993,
    dotRadius: 2,
    lineWidth: 0.7,
    lineAlpha: 0.25,
    mouseLineAlpha: 0.4,
    dotColor: 'rgba(0,0,0,1)',
    lineColor: 'rgba(0,0,0,1)'
  };

  // Cached parsed line color RGB to avoid string creation per-frame
  var lineR = 0, lineG = 0, lineB = 0;

  // Spatial grid
  var gridCells = {};
  var gridSize = 250;

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function getCSSVarFloat(name, fallback) {
    var val = parseFloat(getCSSVar(name));
    return isNaN(val) ? fallback : val;
  }

  function parseRGB(color) {
    if (color.startsWith('#')) {
      lineR = parseInt(color.slice(1, 3), 16);
      lineG = parseInt(color.slice(3, 5), 16);
      lineB = parseInt(color.slice(5, 7), 16);
      return;
    }
    var m = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) { lineR = +m[1]; lineG = +m[2]; lineB = +m[3]; }
  }

  function applyTheme() {
    CFG.dotColor = getCSSVar('--network-dot-color') || getCSSVar('--text-primary') || CFG.dotColor;
    CFG.lineColor = getCSSVar('--network-line-color') || getCSSVar('--text-primary') || CFG.lineColor;
    CFG.dotRadius = getCSSVarFloat('--network-dot-radius', CFG.dotRadius);
    CFG.lineAlpha = getCSSVarFloat('--network-line-alpha', CFG.lineAlpha);
    CFG.mouseLineAlpha = getCSSVarFloat('--network-mouse-line-alpha', CFG.mouseLineAlpha);
    CFG.lineWidth = getCSSVarFloat('--network-line-width', CFG.lineWidth);
    CFG.maxDist = getCSSVarFloat('--network-max-dist', CFG.maxDist);
    CFG.mouseRadius = getCSSVarFloat('--network-mouse-radius', CFG.mouseRadius);
    CFG.speed = getCSSVarFloat('--network-speed', CFG.speed);
    CFG.density = getCSSVarFloat('--network-density', CFG.density);
    parseRGB(CFG.lineColor);
    gridSize = CFG.maxDist;
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    particles = [];
    var isMobile = W < 768;
    var density = isMobile ? CFG.density * 0.5 : CFG.density;
    var minP = isMobile ? 40 : CFG.minParticles;
    var count = Math.max(Math.floor(W * H * density), minP);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * CFG.speed * 2,
        vy: (Math.random() - 0.5) * CFG.speed * 2,
        r: CFG.dotRadius + Math.random() * 1
      });
    }
  }

  function buildGrid() {
    gridCells = {};
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var key = ((p.x / gridSize) | 0) + ',' + ((p.y / gridSize) | 0);
      if (!gridCells[key]) gridCells[key] = [];
      gridCells[key].push(i);
    }
  }

  function update() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CFG.mouseRadius && dist > 0) {
        var force = (CFG.mouseRadius - dist) / CFG.mouseRadius;
        p.vx += (dx / dist) * force * CFG.mouseRepel;
        p.vy += (dy / dist) * force * CFG.mouseRepel;
      }

      p.vx *= CFG.damping;
      p.vy *= CFG.damping;

      var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd < CFG.minSpeed && spd > 0) {
        p.vx = (p.vx / spd) * CFG.minSpeed;
        p.vy = (p.vy / spd) * CFG.minSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      else if (p.x >= W) { p.x = W; p.vx = -Math.abs(p.vx); }
      if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      else if (p.y >= H) { p.y = H; p.vy = -Math.abs(p.vy); }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    var maxDist2 = CFG.maxDist * CFG.maxDist;
    var mouseR2 = CFG.mouseRadius * CFG.mouseRadius;

    buildGrid();

    // Draw connections using spatial grid — only check 3x3 neighborhood
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      var cx = (a.x / gridSize) | 0;
      var cy = (a.y / gridSize) | 0;

      for (var nx = cx - 1; nx <= cx + 1; nx++) {
        for (var ny = cy - 1; ny <= cy + 1; ny++) {
          var cell = gridCells[nx + ',' + ny];
          if (!cell) continue;
          for (var ci = 0; ci < cell.length; ci++) {
            var j = cell[ci];
            if (j <= i) continue;
            var b = particles[j];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < maxDist2) {
              var d = Math.sqrt(d2);
              var t = 1 - d / CFG.maxDist;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = 'rgba(' + lineR + ',' + lineG + ',' + lineB + ',' + (t * CFG.lineAlpha) + ')';
              ctx.lineWidth = CFG.lineWidth * t;
              ctx.stroke();
            }
          }
        }
      }
    }

    // Mouse connections
    if (mouse.x > -999) {
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        var mdx = mouse.x - p.x;
        var mdy = mouse.y - p.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < mouseR2) {
          var md = Math.sqrt(md2);
          var mop = (1 - md / CFG.mouseRadius) * CFG.mouseLineAlpha;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(' + lineR + ',' + lineG + ',' + lineB + ',' + mop + ')';
          ctx.lineWidth = CFG.lineWidth * (1 - md / CFG.mouseRadius) * 1.2;
          ctx.stroke();
        }
      }
    }

    // Draw dots — set fillStyle once
    ctx.fillStyle = CFG.dotColor;
    for (var d = 0; d < particles.length; d++) {
      var pt = particles[d];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    update();
    render();
    raf = requestAnimationFrame(loop);
  }

  // Fix #19: Properly stop/start rAF on visibility change
  function startLoop() { if (!raf) raf = requestAnimationFrame(loop); }
  function stopLoop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  function onResize() { resize(); init(); }
  function onMouse(e) { mouse.x = e.clientX; mouse.y = e.clientY; }
  function onMouseOut() { mouse.x = -9999; mouse.y = -9999; }
  function onVisibility() {
    if (document.hidden) stopLoop(); else startLoop();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('mouseout', onMouseOut);
  document.addEventListener('visibilitychange', onVisibility);

  // Observe theme + palette changes
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-palette']
  });

  applyTheme();
  resize();
  init();
  startLoop();

})();
