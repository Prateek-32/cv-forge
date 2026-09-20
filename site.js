/* CV Forge — interactions.
   Field filter, deliverable tabs, scroll reveals, pointer tilt.
   Everything degrades: if this file fails to run, the page is still
   complete and readable. */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Field filter (fields.html)
  // ---------------------------------------------------------------
  var pills = document.querySelectorAll('.pill[data-group]');
  var rows = document.querySelectorAll('.field-row[data-group]');

  if (pills.length && rows.length) {
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var group = pill.dataset.group;
        pills.forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
        rows.forEach(function (row) {
          row.hidden = !(group === 'All' || row.dataset.group === group);
        });
      });
    });
  }

  // ---------------------------------------------------------------
  // Deliverable tabs (finance.html)
  // ---------------------------------------------------------------
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
        if (next) { e.preventDefault(); select(next); next.focus(); }
      });
    });
  }

  // ---------------------------------------------------------------
  // Scroll reveals
  // ---------------------------------------------------------------
  var STAGGER = '.grid-3, .grid-4, .steps, .stats, .field-list, .checklist';
  var SINGLE = '.head-2, .cta-band, .fact-card, .doc, .strip ul, .hero-copy, .form-grid, .aside-card';

  document.querySelectorAll(STAGGER).forEach(function (el) { el.classList.add('reveal-stagger'); });
  document.querySelectorAll(SINGLE).forEach(function (el) { el.classList.add('reveal'); });

  var watched = document.querySelectorAll('.reveal, .reveal-stagger, .tile');

  function revealAll() {
    watched.forEach(function (el) { el.classList.add('in'); });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    watched.forEach(function (el) { io.observe(el); });

    // Safety net: nothing stays invisible, whatever happens above.
    window.setTimeout(revealAll, 3000);
  }

  // ---------------------------------------------------------------
  // Pointer tilt on the hero artwork
  // ---------------------------------------------------------------
  var art = document.querySelector('.hero-art');

  if (art && !reduced && window.matchMedia('(hover: hover)').matches) {
    var MAX = 7; // degrees
    var frame = null;

    var apply = function (rx, ry) {
      art.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) +
                            'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    };

    art.addEventListener('pointermove', function (e) {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        var r = art.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        art.classList.add('tilting');
        apply(-py * MAX * 2, px * MAX * 2);
      });
    });

    art.addEventListener('pointerleave', function () {
      art.classList.remove('tilting');
      art.style.transform = '';
    });
  }
})();
