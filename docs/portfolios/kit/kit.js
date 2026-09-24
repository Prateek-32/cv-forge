/* Fieldcraft portfolio kit — theme loader, theme switcher and reveals.

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
    ['Bold & expressive',    ['brutal', 'pastel', 'gallery']],
    ['Dark & dramatic',      ['aurora', 'noir', 'console']]
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

    // ---- reveal sections as they scroll in
    var items = document.querySelectorAll('.pk-reveal');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var showAll = function () { items.forEach(function (el) { el.classList.add('in'); }); };
    if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
    window.setTimeout(showAll, 2500);   // nothing stays hidden, whatever happens
  });
})();
