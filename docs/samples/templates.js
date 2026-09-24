/* Fieldcraft — template switcher for the sample CVs.

   Every sample is written once and styled by cv.css (the Modern template).
   ?t=classic, ?t=executive, ?t=compact or ?t=creative adds that template's
   stylesheet from templates/ on top, so one document can be shown in all
   five looks. Loaded in <head>, before first paint, so there is no flash of
   the wrong template. Outside the site's preview frames it also adds a
   switcher above the page. */

(function () {
  'use strict';

  var TEMPLATES = ['modern', 'classic', 'executive', 'compact', 'creative'];
  var NAMES = { modern: 'Modern', classic: 'Classic', executive: 'Executive', compact: 'Compact', creative: 'Creative' };

  var t = 'modern';
  try { t = (new URLSearchParams(location.search).get('t') || 'modern').toLowerCase(); } catch (e) { t = 'modern'; }
  if (TEMPLATES.indexOf(t) < 0) t = 'modern';

  if (t !== 'modern') {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'templates/' + t + '.css';
    document.head.appendChild(link);
  }
  document.documentElement.setAttribute('data-template', t);

  if (window.self !== window.top) return;   // inside a preview frame: no switcher

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.back-bar');
    if (!bar) return;
    var field = location.pathname.split('/').pop().replace(/-cv(-\d+)?\.html$/, '');
    var nav = document.createElement('nav');
    nav.className = 'tpl-switch';
    nav.setAttribute('aria-label', 'Template');
    nav.innerHTML = '<span class="tpl-switch-label">Template</span>' +
      TEMPLATES.map(function (k) {
        return '<a href="?t=' + k + '"' + (k === t ? ' aria-current="true"' : '') + '>' + NAMES[k] + '</a>';
      }).join('') +
      '<a class="tpl-use" href="../start.html?template=' + t + '&amp;field=' + encodeURIComponent(field) + '">Use ' + NAMES[t] + ' &rarr;</a>';
    bar.parentNode.insertBefore(nav, bar.nextSibling);
  });
})();
