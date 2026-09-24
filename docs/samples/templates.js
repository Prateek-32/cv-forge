/* Fieldcraft — template switcher for the sample CVs.

   Every sample is written once and styled by cv.css (the Modern template).
   ?t=<name> adds that template's stylesheet from templates/ on top, so one
   document can be shown in every look. Loaded in <head>, before first paint,
   so there is no flash of the wrong template. Outside the site's preview
   frames it also adds a switcher above the page.

   Keep GROUPS in step with templates.html, the brief form and REC in site.js. */

(function () {
  'use strict';

  var GROUPS = [
    ['Traditional',  ['classic', 'legal', 'banker', 'academic', 'executive']],
    ['Contemporary', ['modern', 'minimal', 'slate', 'tech', 'clinical']],
    ['Expressive',   ['creative', 'studio', 'editorial', 'typewriter', 'warm']],
    ['Practical',    ['compact', 'workwear']]
  ];
  var TEMPLATES = [];
  GROUPS.forEach(function (g) { TEMPLATES = TEMPLATES.concat(g[1]); });
  var title = function (k) { return k.charAt(0).toUpperCase() + k.slice(1); };

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
    nav.innerHTML =
      '<label class="tpl-switch-label" for="tpl-pick">Template</label>' +
      '<select id="tpl-pick">' + GROUPS.map(function (g) {
        return '<optgroup label="' + g[0] + '">' + g[1].map(function (k) {
          return '<option value="' + k + '"' + (k === t ? ' selected' : '') + '>' + title(k) + '</option>';
        }).join('') + '</optgroup>';
      }).join('') + '</select>' +
      '<a href="../templates.html#' + encodeURIComponent(field) + '">Compare all</a>' +
      '<a class="tpl-use" href="../start.html?template=' + t + '&amp;field=' + encodeURIComponent(field) + '">Use ' + title(t) + ' &rarr;</a>';
    nav.querySelector('select').addEventListener('change', function () {
      location.search = '?t=' + this.value;
    });
    bar.parentNode.insertBefore(nav, bar.nextSibling);
  });
})();
