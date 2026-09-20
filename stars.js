/* CV Forge — starfield.
   A parallax star canvas behind the whole site: three depth layers that
   drift and twinkle, respond to scroll and pointer, and throw the
   occasional shooting star.

   Costs are kept honest: star count scales with viewport area and is
   capped, the loop stops when the tab is hidden, and the whole thing
   renders one static frame under prefers-reduced-motion. */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var host = document.querySelector('[data-stars-host]') || document.body;
  var canvas = document.createElement('canvas');
  canvas.className = 'starfield';
  canvas.setAttribute('aria-hidden', 'true');
  if (host !== document.body) canvas.classList.add('starfield-contained');
  host.insertBefore(canvas, host.firstChild);

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var W = 0, H = 0, DPR = 1;
  var layers = [];
  var shooting = [];
  var pointer = { x: 0, y: 0, active: false };
  var scrollY = 0;
  var t = 0;
  var raf = null;

  // Layer spec: [relative count, radius range, parallax factor, base alpha]
  var SPEC = [
    { density: 1.0, rMin: 0.4, rMax: 0.9, par: 0.06, alpha: 0.55, drift: 0.008 },
    { density: 0.55, rMin: 0.8, rMax: 1.5, par: 0.14, alpha: 0.75, drift: 0.016 },
    { density: 0.22, rMin: 1.3, rMax: 2.3, par: 0.26, alpha: 0.95, drift: 0.028 }
  ];

  var TINTS = ['255,255,255', '206,222,255', '255,236,204', '178,240,230'];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    var rect = host === document.body
      ? { width: window.innerWidth, height: window.innerHeight }
      : host.getBoundingClientRect();

    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // one star per ~2600 css px², capped so a huge monitor does not melt
    var base = Math.min(Math.round((W * H) / 2600), 420);
    if (window.innerWidth < 700) base = Math.round(base * 0.55);

    layers = SPEC.map(function (s) {
      var n = Math.round(base * s.density);
      var stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * (H * 1.6),
          r: rand(s.rMin, s.rMax),
          a: s.alpha * rand(0.45, 1),
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
          phase: Math.random() * Math.PI * 2,
          tw: rand(0.6, 2.0)
        });
      }
      return { spec: s, stars: stars };
    });
  }

  function spawnShootingStar() {
    var fromLeft = Math.random() > 0.35;
    shooting.push({
      x: fromLeft ? rand(-60, W * 0.4) : rand(W * 0.6, W + 60),
      y: rand(-40, H * 0.45),
      vx: (fromLeft ? 1 : -1) * rand(5.5, 9),
      vy: rand(2.2, 4),
      life: 0,
      max: rand(55, 90)
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (var li = 0; li < layers.length; li++) {
      var layer = layers[li];
      var s = layer.spec;
      var offY = -(scrollY * s.par) % (H * 1.6);
      var offX = pointer.active ? (pointer.x - 0.5) * -26 * s.par * 4 : 0;
      var offYp = pointer.active ? (pointer.y - 0.5) * -18 * s.par * 4 : 0;

      for (var i = 0; i < layer.stars.length; i++) {
        var st = layer.stars[i];
        var y = st.y + offY + offYp;
        y = ((y % (H * 1.6)) + H * 1.6) % (H * 1.6);
        if (y > H + 4) continue;
        var x = st.x + offX;
        if (x < -4 || x > W + 4) continue;

        var tw = reduced ? 1 : 0.68 + 0.32 * Math.sin(t * 0.0016 * st.tw + st.phase);
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = 'rgb(' + st.tint + ')';
        ctx.beginPath();
        ctx.arc(x, y, st.r, 0, Math.PI * 2);
        ctx.fill();

        // the biggest stars get a soft bloom
        if (st.r > 1.7) {
          ctx.globalAlpha = st.a * tw * 0.16;
          ctx.beginPath();
          ctx.arc(x, y, st.r * 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // shooting stars
    for (var k = shooting.length - 1; k >= 0; k--) {
      var sh = shooting[k];
      sh.life++;
      sh.x += sh.vx;
      sh.y += sh.vy;
      if (sh.life > sh.max || sh.x < -120 || sh.x > W + 120 || sh.y > H + 120) {
        shooting.splice(k, 1);
        continue;
      }
      var fade = 1 - sh.life / sh.max;
      var len = 90;
      var g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * (len / 8), sh.y - sh.vy * (len / 8));
      g.addColorStop(0, 'rgba(255,255,255,' + (0.85 * fade).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * (len / 8), sh.y - sh.vy * (len / 8));
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  var lastShot = 0;

  function loop(now) {
    t = now;
    if (now - lastShot > rand(6000, 15000)) {
      lastShot = now;
      if (Math.random() > 0.25) spawnShootingStar();
    }
    draw();
    raf = window.requestAnimationFrame(loop);
  }

  function start() {
    if (raf || reduced) return;
    lastShot = performance.now();
    raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
  }

  // ---- wiring -----------------------------------------------------

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { build(); draw(); }, 180);
  });

  if (!reduced) {
    window.addEventListener('scroll', function () {
      scrollY = window.scrollY || window.pageYOffset || 0;
    }, { passive: true });

    window.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
      pointer.active = true;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  build();
  draw();
  start();
})();
