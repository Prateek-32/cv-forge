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

/* ---------------------------------------------------------------
   Extra life: scroll progress, card tilt with a light sheen,
   magnetic buttons, and a word-by-word hero entrance.
   Appended as its own IIFE so a failure here cannot take out the
   filter or the tabs above.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- scroll progress ------------------------------------------
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY || window.pageYOffset) / h : 0;
    bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  if (reduced) return;

  // ---- 3D tilt + sheen on panels --------------------------------
  // One delegated listener rather than one per card.
  var TILTABLE = '.tile, .card, .fact-card, .aside-card, blockquote';
  document.querySelectorAll(TILTABLE).forEach(function (el) { el.classList.add('tilt'); });

  var activeTilt = null, tiltFrame = null, lastEvt = null;

  function runTilt() {
    tiltFrame = null;
    if (!activeTilt || !lastEvt) return;
    var r = activeTilt.getBoundingClientRect();
    var cx = (lastEvt.clientX - r.left) / r.width;
    var cy = (lastEvt.clientY - r.top) / r.height;
    activeTilt.style.setProperty('--rx', ((0.5 - cy) * 7).toFixed(2) + 'deg');
    activeTilt.style.setProperty('--ry', ((cx - 0.5) * 9).toFixed(2) + 'deg');
    activeTilt.style.setProperty('--mx', (cx * 100).toFixed(1) + '%');
    activeTilt.style.setProperty('--my', (cy * 100).toFixed(1) + '%');
  }

  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest ? e.target.closest(TILTABLE) : null;
    if (el !== activeTilt) {
      if (activeTilt) {
        activeTilt.classList.remove('tilted');
        activeTilt.style.removeProperty('--rx');
        activeTilt.style.removeProperty('--ry');
      }
      activeTilt = el;
      if (activeTilt) activeTilt.classList.add('tilted');
    }
    if (!activeTilt) return;
    lastEvt = e;
    if (!tiltFrame) tiltFrame = window.requestAnimationFrame(runTilt);
  }, { passive: true });

  // ---- magnetic buttons -----------------------------------------
  var MAG = 9;
  document.querySelectorAll('.btn').forEach(function (btn) {
    var frame = null, ev = null;
    btn.addEventListener('pointermove', function (e) {
      ev = e;
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        var r = btn.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = 'translate(' + (dx * MAG).toFixed(1) + 'px,' +
                              (dy * MAG * 0.6).toFixed(1) + 'px)';
      });
    }, { passive: true });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  });

  // ---- hero headline, word by word ------------------------------
  var h1 = document.querySelector('.hero-copy h1');
  if (h1 && !h1.querySelector('.w')) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--wi', i);
      span.textContent = w;
      h1.appendChild(span);
      if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    h1.classList.add('words-in');
  }
})();

/* ---------------------------------------------------------------
   Brief form → your own Apps Script endpoint.

   Posted as FormData with no custom headers, which keeps it a
   "simple" CORS request and avoids the preflight that Apps Script
   cannot answer. Any failure falls back to an email address rather
   than swallowing the enquiry.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var form = document.getElementById('brief-form');
  if (!form) return;

  var statusEl = document.getElementById('brief-status');
  var button = document.getElementById('brief-submit');
  var fileInput = document.getElementById('upload');
  var MAX_BYTES = 8 * 1024 * 1024;

  function say(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read that file')); };
      reader.onload = function () {
        // strip the "data:<type>;base64," prefix
        var result = String(reader.result);
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var endpoint = form.getAttribute('data-endpoint') || '';
    if (!endpoint || endpoint.charAt(0) === '[') {
      say('This form is not connected yet. Please email us instead.', 'error');
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var file = fileInput && fileInput.files && fileInput.files[0];
    if (file && file.size > MAX_BYTES) {
      say('That file is larger than 8 MB. Send the brief without it and email the document separately.', 'error');
      return;
    }

    button.disabled = true;
    say('Sending your brief…');

    var data = new FormData();
    data.append('name', form.name.value.trim());
    data.append('email', form.email.value.trim());
    data.append('field', form.field.value);
    data.append('stage', form.stage.value);
    data.append('target', form.target.value.trim());
    data.append('notes', form.notes.value.trim());
    data.append('website', form.website.value);   // honeypot

    var needs = [];
    form.querySelectorAll('input[name="needs"]:checked')
        .forEach(function (c) { needs.push(c.value); });
    data.append('needs', needs.join(', '));

    var prepared = file
      ? readFileAsBase64(file).then(function (b64) {
          data.append('fileData', b64);
          data.append('fileName', file.name);
          data.append('fileType', file.type || 'application/octet-stream');
        })
      : Promise.resolve();

    prepared
      .then(function () {
        return fetch(endpoint, { method: 'POST', body: data });
      })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (out) {
        if (!out || out.ok === false) throw new Error(out && out.error ? out.error : 'Rejected');
        form.innerHTML =
          '<div class="card card-raised" style="gap:14px;">' +
          '<span class="eyebrow">Received</span>' +
          '<h2 style="font-size:clamp(24px,2.6vw,32px);">Thank you — your brief is with us.</h2>' +
          '<p>We read every brief ourselves. Expect a fixed quotation and timeline within ' +
          '[RESPONSE TIME], to the address you gave us.</p>' +
          '<p class="hint">Nothing is charged until you approve it.</p></div>';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function (err) {
        button.disabled = false;
        say('Something went wrong sending that — please email your brief to [YOUR EMAIL] and we will pick it up from there. (' + err.message + ')', 'error');
      });
  });
})();
