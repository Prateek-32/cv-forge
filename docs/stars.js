/* Fieldcraft — starfield.
   A parallax star canvas behind the whole site: three depth layers that
   drift and twinkle, respond to scroll and pointer, and throw the
   occasional shooting star.

   Costs are kept honest: star count scales with viewport area and is
   capped, the loop stops when the tab is hidden, and the whole thing
   renders one static frame under prefers-reduced-motion — and on phones,
   where a sky that never stops redrawing costs smooth scrolling and
   battery, and there is no pointer for it to follow anyway. */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px), (hover: none)').matches;

  // Modest machines get a lighter sky, and lose the aurora wash entirely.
  var lowPower = (navigator.hardwareConcurrency || 8) <= 2 ||
                 (navigator.deviceMemory || 8) <= 2;
  if (lowPower) {
    document.documentElement.classList.add('low-power');
  }

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
  var trail = [];        // comet dust following the pointer
  var sparks = [];       // burst thrown on click
  var near = [];         // stars close to the pointer, for constellation lines
  var px = -9999, py = -9999;   // pointer in canvas space
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
  var LEVELS = [0.42, 0.68, 0.95];   // quantised twinkle brightness

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    var rect = host === document.body
      ? { width: window.innerWidth, height: window.innerHeight }
      : host.getBoundingClientRect();

    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));

    // Measured: capping the backing store below the CSS size is a false
    // economy — the compositor then has to upscale the canvas every frame,
    // which costs more than the pixels saved. Match the display instead.
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // one star per ~3000 css px², capped so a large monitor does not melt
    var base = Math.min(Math.round((W * H) / 3000), 320);
    if (window.innerWidth < 700) base = Math.round(base * 0.55);
    if (lowPower) base = Math.round(base * 0.5);

    layers = SPEC.map(function (s, li) {
      var n = Math.round(base * s.density);
      var stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * (H * 1.6),
          r: rand(s.rMin, s.rMax),
          a: s.alpha * rand(0.45, 1),
          ti: Math.floor(Math.random() * TINTS.length),
          phase: Math.random() * Math.PI * 2,
          tw: rand(0.6, 2.0)
        });
      }
      var buckets = [];
      for (var bq = 0; bq < TINTS.length * 3; bq++) buckets.push([]);
      return { spec: s, stars: stars, buckets: buckets, bloom: [] };
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
    near.length = 0;

    // Every layer paints as a small set of batched paths. Twinkle is
    // quantised into three brightness levels, so a few hundred stars cost
    // roughly a dozen fills rather than one state change each.
    for (var li = 0; li < layers.length; li++) {
      var layer = layers[li];
      var s = layer.spec;
      var TH = H * 1.6;
      var offY = -(scrollY * s.par) % TH;
      var offX = pointer.active ? (pointer.x - 0.5) * -26 * s.par * 4 : 0;
      var offYp = pointer.active ? (pointer.y - 0.5) * -18 * s.par * 4 : 0;

      var buckets = layer.buckets;
      for (var bi = 0; bi < buckets.length; bi++) buckets[bi].length = 0;
      var bloom = layer.bloom; bloom.length = 0;

      for (var i = 0; i < layer.stars.length; i++) {
        var st = layer.stars[i];
        var y = st.y + offY + offYp;
        y = ((y % TH) + TH) % TH;
        if (y > H + 4) continue;
        var x = st.x + offX;
        if (x < -4 || x > W + 4) continue;

        if (!reduced && li > 0 && near.length < 18) {
          var dxp = x - px, dyp = y - py;
          if (dxp * dxp + dyp * dyp < 24000) near.push(x, y);
        }

        var tw = reduced ? 1 : 0.68 + 0.32 * Math.sin(t * 0.0016 * st.tw + st.phase);
        var lvl = tw < 0.80 ? 0 : (tw < 0.92 ? 1 : 2);
        var bucket = buckets[st.ti * 3 + lvl];
        bucket.push(x, y, st.r);
        if (st.r > 1.7) bloom.push(x, y, st.r * 3.6);
      }

      for (var bj = 0; bj < buckets.length; bj++) {
        var bk = buckets[bj];
        if (!bk.length) continue;
        ctx.globalAlpha = s.alpha * LEVELS[bj % 3];
        ctx.fillStyle = 'rgb(' + TINTS[(bj / 3) | 0] + ')';
        ctx.beginPath();
        if (li === 0) {
          for (var q1 = 0; q1 < bk.length; q1 += 3) {
            ctx.rect(bk[q1] - bk[q1 + 2], bk[q1 + 1] - bk[q1 + 2], bk[q1 + 2] * 2, bk[q1 + 2] * 2);
          }
        } else {
          for (var q2 = 0; q2 < bk.length; q2 += 3) {
            ctx.moveTo(bk[q2] + bk[q2 + 2], bk[q2 + 1]);
            ctx.arc(bk[q2], bk[q2 + 1], bk[q2 + 2], 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      if (bloom.length) {
        ctx.globalAlpha = s.alpha * 0.14;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        for (var q3 = 0; q3 < bloom.length; q3 += 3) {
          ctx.moveTo(bloom[q3] + bloom[q3 + 2], bloom[q3 + 1]);
          ctx.arc(bloom[q3], bloom[q3 + 1], bloom[q3 + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    // constellation: two batched paths rather than ~90 individual
    // strokes — each stroke() is a state change, and that was the cost.
    if (near.length && !reduced) {
      var maxA = Math.min(near.length / 2, 9);
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(94,234,212,1)';

      ctx.globalAlpha = 0.30;
      ctx.beginPath();
      for (var a = 0; a < maxA; a++) {
        ctx.moveTo(px, py);
        ctx.lineTo(near[a * 2], near[a * 2 + 1]);
      }
      ctx.stroke();

      ctx.globalAlpha = 0.14;
      ctx.beginPath();
      for (var a2 = 0; a2 < maxA; a2++) {
        var ax = near[a2 * 2], ay = near[a2 * 2 + 1];
        for (var c2 = a2 + 1; c2 < maxA; c2++) {
          var ex = ax - near[c2 * 2], ey = ay - near[c2 * 2 + 1];
          if (ex * ex + ey * ey < 8464) {
            ctx.moveTo(ax, ay);
            ctx.lineTo(near[c2 * 2], near[c2 * 2 + 1]);
          }
        }
      }
      ctx.stroke();
    }

    // pointer dust — one path, one fill
    if (trail.length) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = 'rgba(148,240,222,1)';
      ctx.beginPath();
      for (var d = trail.length - 1; d >= 0; d--) {
        var tp = trail[d];
        tp.life++;
        if (tp.life > tp.max) { trail.splice(d, 1); continue; }
        var tf = 1 - tp.life / tp.max;
        ctx.moveTo(tp.x + tp.r * tf, tp.y);
        ctx.arc(tp.x, tp.y, tp.r * tf, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // click sparks
    for (var q = sparks.length - 1; q >= 0; q--) {
      var sp = sparks[q];
      sp.life++;
      sp.x += sp.vx; sp.y += sp.vy;
      sp.vx *= 0.96; sp.vy *= 0.96;
      if (sp.life > sp.max) { sparks.splice(q, 1); continue; }
      var sf = 1 - sp.life / sp.max;
      ctx.globalAlpha = sf;
      ctx.fillStyle = sp.gold ? 'rgba(245,194,107,1)' : 'rgba(126,244,225,1)';
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * sf, 0, Math.PI * 2); ctx.fill();
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
      px = e.clientX; py = e.clientY;
      if (trail.length < 18 && Math.random() > 0.35) {
        trail.push({ x: px + rand(-3, 3), y: py + rand(-3, 3),
                     r: rand(0.8, 2.2), life: 0, max: rand(18, 34) });
      }
    }, { passive: true });

    window.addEventListener('pointerdown', function (e) {
      var n = 16;
      for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
        var sp = rand(1.4, 4.2);
        sparks.push({ x: e.clientX, y: e.clientY,
                      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                      r: rand(1, 2.6), life: 0, max: rand(26, 46),
                      gold: Math.random() > 0.65 });
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  build();
  draw();
  start();
})();
