/* =========================================================
   NETWORK BACKGROUND — Red lines, white dots, mouse reactive
   Particles bounce off edges, always on screen, always moving
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
  var isVisible = true;

  var CFG = {
    density: 0.00012,
    minParticles: 80,
    maxDist: 250,
    mouseRadius: 300,
    mouseRepel: 0.03,
    speed: 0.3,
    minSpeed: 0.15,
    damping: 0.993,
    dotRadius: 2,
    dotGlow: 5,
    lineWidth: 0.7,
    lineR: 255,
    lineG: 0,
    lineB: 0,
    lineAlpha: 0.55,
    mouseLineAlpha: 0.5,
    dotColor: '#ffffff',
    dotGlowNear: 'rgba(255,255,255,0.7)',
    dotGlowFar: 'rgba(255,255,255,0.25)',
  };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    particles = [];
    var count = Math.max(Math.floor(W * H * CFG.density), CFG.minParticles);
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * CFG.speed * 2,
        vy: (Math.random() - 0.5) * CFG.speed * 2,
        r: CFG.dotRadius + Math.random() * 1.2
      });
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

    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          var dist = Math.sqrt(d2);
          var opacity = 1 - dist / CFG.maxDist;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(' + CFG.lineR + ',' + CFG.lineG + ',' + CFG.lineB + ',' + (opacity * CFG.lineAlpha).toFixed(3) + ')';
          ctx.lineWidth = CFG.lineWidth * opacity;
          ctx.stroke();
        }
      }
    }

    if (mouse.x > -999) {
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        var mdx = mouse.x - p.x;
        var mdy = mouse.y - p.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < mouseR2) {
          var mdist = Math.sqrt(md2);
          var mop = 1 - mdist / CFG.mouseRadius;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(' + CFG.lineR + ',' + CFG.lineG + ',' + CFG.lineB + ',' + (mop * CFG.mouseLineAlpha).toFixed(3) + ')';
          ctx.lineWidth = CFG.lineWidth * mop * 1.2;
          ctx.stroke();
        }
      }
    }

    for (var d = 0; d < particles.length; d++) {
      var pt = particles[d];
      var ddx = mouse.x - pt.x;
      var ddy = mouse.y - pt.y;
      var near = (ddx * ddx + ddy * ddy) < mouseR2;

      var glowR = pt.r + CFG.dotGlow + (near ? 5 : 0);
      var grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
      grad.addColorStop(0, near ? CFG.dotGlowNear : CFG.dotGlowFar);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, near ? pt.r + 1 : pt.r, 0, Math.PI * 2);
      ctx.fillStyle = CFG.dotColor;
      ctx.fill();
    }
  }

  function loop() {
    if (!isVisible) { raf = requestAnimationFrame(loop); return; }
    update();
    render();
    raf = requestAnimationFrame(loop);
  }

  function onResize() { resize(); init(); }
  function onMouse(e) { mouse.x = e.clientX; mouse.y = e.clientY; }
  function onMouseOut() { mouse.x = -9999; mouse.y = -9999; }
  function onTouch(e) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  function onTouchEnd() { mouse.x = -9999; mouse.y = -9999; }
  function onVisibility() { isVisible = !document.hidden; }

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    resize(); init(); render();
    return;
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouse);
  window.addEventListener('mouseout', onMouseOut);
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchend', onTouchEnd);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  init();
  loop();

  window.networkBg = {
    canvas: canvas,
    config: CFG,
    reinit: function () { resize(); init(); }
  };
})();