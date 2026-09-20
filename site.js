/* CV Forge — small interactions: field filter + deliverable tabs. */

(function () {
  'use strict';

  // --- Field filter (fields.html) -------------------------------------
  var pills = document.querySelectorAll('.pill[data-group]');
  var rows = document.querySelectorAll('.field-row[data-group]');

  if (pills.length && rows.length) {
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var group = pill.dataset.group;

        pills.forEach(function (p) {
          p.setAttribute('aria-pressed', String(p === pill));
        });

        var shown = 0;
        rows.forEach(function (row) {
          var match = group === 'All' || row.dataset.group === group;
          row.hidden = !match;
          if (match) {
            shown += 1;
            var idx = row.querySelector('.idx');
            if (idx) idx.textContent = (shown < 10 ? '0' : '') + shown;
          }
        });
      });
    });
  }

  // --- Deliverable tabs (finance.html) --------------------------------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));

  if (tabs.length) {
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) {
          e.preventDefault();
          select(next);
          next.focus();
        }
      });
    });
  }
})();
