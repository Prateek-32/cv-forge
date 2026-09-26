/* Fieldcraft portfolio kit — theme loader, theme switcher, reveals and a few
   optional art hooks (hero data-mono, --i list indexes, pointer glow).

   Load this synchronously in <head>, after kit/portfolio.css. It reads ?t=,
   or the page's own data-theme-default, and adds kit/themes/<name>.css
   before first paint. Inside the site's preview frames (iframes) it marks
   the page .embedded so the sample banner hides.

   THEME_GROUPS is the master list: keep sample-portfolios.html, the
   portfolio brief on start.html and PF_REC in site.js in step with it. */

(function () {
  'use strict';

  var THEME_GROUPS = [
    ['Clean & professional', ['paper', 'clinic', 'sidebar', 'swiss']],
    ['Bold & expressive',    ['brutal', 'pastel', 'gallery', 'atelier']],
    ['Dark & dramatic',      ['aurora', 'noir', 'console', 'darkroom']]
  ];
  var THEMES = [];
  THEME_GROUPS.forEach(function (g) { THEMES = THEMES.concat(g[1]); });
  var title = function (k) { return k.charAt(0).toUpperCase() + k.slice(1); };

  var root = document.documentElement;
  if (window.self !== window.top) root.className += ' embedded';
  root.className += ' pk-js';

  var t = '';
  try { t = (new URLSearchParams(location.search).get('t') || '').toLowerCase(); } catch (e) { t = ''; }
  if (THEMES.indexOf(t) < 0) t = (root.getAttribute('data-theme-default') || 'paper').toLowerCase();
  if (THEMES.indexOf(t) < 0) t = 'paper';

  // the kit's folder, wherever this page sits relative to it
  var script = document.currentScript;
  var base = script ? script.src.replace(/kit\.js(\?.*)?$/, '') : 'kit/';
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base + 'themes/' + t + '.css';
  document.head.appendChild(link);
  root.setAttribute('data-theme', t);

  document.addEventListener('DOMContentLoaded', function () {
    // ---- theme switcher in the sample banner (not in preview frames)
    var slot = document.querySelector('.pk-theme-slot');
    var field = root.getAttribute('data-field') || '';
    var use = document.querySelector('.pk-use');
    if (use) use.href = '../start.html?type=portfolio&theme=' + t + (field ? '&field=' + encodeURIComponent(field) : '');
    if (slot && !/\bembedded\b/.test(root.className)) {
      slot.innerHTML =
        '<label for="pk-theme">Theme</label> <select id="pk-theme">' +
        THEME_GROUPS.map(function (g) {
          return '<optgroup label="' + g[0].replace(/&/g, '&amp;') + '">' + g[1].map(function (k) {
            return '<option value="' + k + '"' + (k === t ? ' selected' : '') + '>' + title(k) + '</option>';
          }).join('') + '</optgroup>';
        }).join('') + '</select>';
      slot.querySelector('select').addEventListener('change', function () {
        location.search = '?t=' + this.value;
      });
    }

    // ---- art hooks (all optional: the CSS reads fine without them)
    // the monogram, for themes that set it at display scale behind the hero
    var hero = document.querySelector('.pk-hero');
    var mono = document.querySelector('.pk-portrait span');
    if (hero && mono) hero.setAttribute('data-mono', mono.textContent.replace(/\s+/g, ' ').trim());
    // an index on every item of a list, for staggered entrances (--i)
    document.querySelectorAll('.pk-work, .pk-stats, .pk-tags, .pk-steps, .pk-list, .pk-timeline, .pk-facts, .pk-contact-list')
      .forEach(function (list) {
        Array.prototype.forEach.call(list.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 12)); });
      });

    var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
    var reduced = mq('(prefers-reduced-motion: reduce)');

    // a soft light that follows the pointer across project cards (desktop only)
    if (!reduced && mq('(hover: hover) and (pointer: fine)')) {
      root.classList.add('pk-glow');
      var last = null, raf = 0;
      document.addEventListener('pointermove', function (ev) {
        last = ev;
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = 0;
          var card = last && last.target && last.target.closest ? last.target.closest('.pk-project') : null;
          if (!card) return;
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', Math.round(last.clientX - r.left) + 'px');
          card.style.setProperty('--my', Math.round(last.clientY - r.top) + 'px');
        });
      }, { passive: true });
    }

    // ---- artworks: series filter and a lightbox (see .pk-gallery in portfolio.css)
    var arts = Array.prototype.slice.call(document.querySelectorAll('.pk-art'));
    var filter = document.querySelector('.pk-filter');
    if (filter) filter.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button[data-series]') : null;
      if (!b) return;
      var s = b.getAttribute('data-series');
      filter.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      arts.forEach(function (a) { a.hidden = s !== 'all' && (' ' + (a.getAttribute('data-series') || '') + ' ').indexOf(' ' + s + ' ') < 0; });
    });
    if (arts.length) lightbox(arts);

    // ---- reveal sections as they scroll in (items entering together stagger)
    var items = document.querySelectorAll('.pk-reveal');
    var showAll = function () { items.forEach(function (el) { el.classList.add('in'); }); };
    if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = Math.min(n++, 6) * 90;
        io.unobserve(el);
        if (d) window.setTimeout(function () { el.classList.add('in'); }, d);
        else el.classList.add('in');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
    window.setTimeout(showAll, 2500);   // nothing stays hidden, whatever happens
  });
})();

// A lightbox for .pk-art figures: the full image (the link's href), its label,
// previous / next among the works on show, Esc, arrow keys and swipe.
function lightbox(arts) {
  'use strict';
  var box = null, img, cap, count, cur = -1, opener = null, x0 = null;
  var shown = function () { return arts.filter(function (a) { return !a.hidden; }); };
  var build = function () {
    box = document.createElement('div');
    box.className = 'pk-lightbox'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Artwork viewer');
    box.innerHTML = '<figure><img alt=""></figure><div class="pk-lb-cap" aria-live="polite"></div>' +
      '<span class="pk-lb-count"></span>' +
      '<button type="button" class="pk-lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="pk-lb-prev" aria-label="Previous work">&#8249;</button>' +
      '<button type="button" class="pk-lb-next" aria-label="Next work">&#8250;</button>';
    document.body.appendChild(box);
    img = box.querySelector('img'); cap = box.querySelector('.pk-lb-cap'); count = box.querySelector('.pk-lb-count');
    box.querySelector('.pk-lb-close').addEventListener('click', close);
    box.querySelector('.pk-lb-prev').addEventListener('click', function () { step(-1); });
    box.querySelector('.pk-lb-next').addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {                      // keep focus inside
        var f = box.querySelectorAll('button, a'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    });
  };
  var show = function (fig) {
    var list = shown(); cur = list.indexOf(fig);
    var a = fig.querySelector('.pk-art-link'), t = fig.querySelector('img');
    img.src = a.getAttribute('href'); img.alt = t ? t.alt : '';
    var c = fig.querySelector('figcaption');
    cap.innerHTML = c ? c.innerHTML : '';
    count.textContent = (cur + 1) + ' / ' + list.length;
    var next = list[(cur + 1) % list.length];                   // warm the next one
    if (next) { var p = new Image(); p.src = next.querySelector('.pk-art-link').getAttribute('href'); }
  };
  var step = function (d) { var list = shown(); if (list.length) show(list[(cur + d + list.length) % list.length]); };
  var close = function () {
    box.classList.remove('open'); document.documentElement.classList.remove('pk-lb-lock');
    window.setTimeout(function () { box.hidden = true; img.removeAttribute('src'); }, 200);
    if (opener) opener.focus();
  };
  arts.forEach(function (fig) {
    var a = fig.querySelector('.pk-art-link');
    if (!a) return;
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;        // let people open the file in a tab
      e.preventDefault();
      if (!box) build();
      opener = a; show(fig);
      box.hidden = false; document.documentElement.classList.add('pk-lb-lock');
      window.requestAnimationFrame(function () { box.classList.add('open'); });
      box.querySelector('.pk-lb-close').focus();
    });
  });
}
