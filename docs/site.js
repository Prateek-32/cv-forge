/* Fieldcraft — interactions.
   Field filter, deliverable tabs, scroll reveals, pointer tilt.
   Everything degrades: if this file fails to run, the page is still
   complete and readable. */

/* ---------------------------------------------------------------
   Contact details — the one place to set them.
   Every contact link on the site (footer, start page, the WhatsApp
   button) stays hidden until its value here is filled in, so an
   empty field never shows up as a placeholder.
   --------------------------------------------------------------- */
var CV_FORGE_CONTACT = {
  email:    'prateek.32gupta@gmail.com',
  phone:    '+91 96364 79447',      // as it should be shown
  whatsapp: '919636479447',         // digits only, country code first
  city:     'Pune, Maharashtra',
  hours:    '10 AM – 10 PM IST',
  replyHoursIST: [10, 22],          // 24-hour clock; drives the "Replying now" badge
  // The Apps Script web app (apps-script/Code.gs). The chat assistant sends
  // issues here; keep it the same as data-endpoint on start.html.
  formEndpoint: 'https://script.google.com/macros/s/AKfycbwggldqgpNJMffp56ZQqU0idMmG1ILO1r9s5KsumvbjmQbmGsyhPF7FPszSb_Iz37yB/exec'
};

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
  // Sample CV filter (sample-cvs.html) — also follows #field links,
  // so a sample's "All sample CVs" link lands on its own profession.
  // ---------------------------------------------------------------
  var cvPills = document.querySelectorAll('.pill[data-field]');
  var cvFields = document.querySelectorAll('.cv-field[data-field]');

  if (cvPills.length && cvFields.length) {
    var showField = function (field) {
      var known = false;
      cvFields.forEach(function (sec) { if (sec.dataset.field === field) known = true; });
      if (!known) field = 'all';
      cvPills.forEach(function (p) { p.setAttribute('aria-pressed', String(p.dataset.field === field)); });
      cvFields.forEach(function (sec) {
        sec.hidden = !(field === 'all' || sec.dataset.field === field);
      });
      return field;
    };
    cvPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var field = showField(pill.dataset.field);
        if (window.history && history.replaceState) {
          history.replaceState(null, '', field === 'all' ? location.pathname : '#' + field);
        }
      });
    });
    showField(location.hash.slice(1));
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

  // Arriving from "Use this template": start.html?template=classic&field=law
  // pre-selects both, so the visitor only has to confirm them.
  var FIELD_ORDER = ['finance', 'sales', 'law', 'consulting', 'engineering', 'data', 'trades',
                     'creative', 'film', 'writing', 'healthcare', 'teaching', 'academia'];
  try {
    var params = new URLSearchParams(location.search);
    var tpl = (params.get('template') || '').toLowerCase();
    var tplSelect = form.querySelector('select[name="template"]');
    if (tpl && tplSelect) {
      Array.prototype.forEach.call(tplSelect.options, function (o) {
        if (o.value.toLowerCase() === tpl) tplSelect.value = o.value;
      });
    }
    var fi = FIELD_ORDER.indexOf((params.get('field') || '').toLowerCase());
    var fieldSelect = form.querySelector('select[name="field"]');
    if (fi > -1 && fieldSelect && fieldSelect.options[fi]) fieldSelect.selectedIndex = fi;
  } catch (err) { /* no URLSearchParams: the form simply starts blank */ }

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
    // The template rides along in "needs" too, so a script that predates the
    // Template column still records it.
    var chosen = form.querySelector('select[name="template"]');
    var template = (chosen && chosen.value) || 'Our choice for the field';
    needs.push('Template: ' + template);
    data.append('needs', needs.join(', '));
    data.append('template', template);

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
          '<p>We read every brief ourselves. Expect a fixed quotation and timeline by ' +
          'email, to the address you gave us.</p>' +
          '<p class="hint">Nothing is charged until you approve it.</p></div>';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function (err) {
        button.disabled = false;
        var email = CV_FORGE_CONTACT.email;
        say((email
          ? 'Something went wrong sending that — please email your brief to ' + email +
            ' and we will pick it up from there.'
          : 'Something went wrong sending that. Your answers are still here — please try again in a minute.') +
          ' (' + err.message + ')', 'error');
      });
  });
})();

/* ---------------------------------------------------------------
   Contact links and the WhatsApp button, from CV_FORGE_CONTACT.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var c = CV_FORGE_CONTACT;
  var wa = (c.whatsapp || '').replace(/\D/g, '');
  var waHref = wa ? 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Fieldcraft, I have a question about getting my CV rebuilt.') : '';
  var cityHours = [c.city, c.hours ? 'Replies ' + c.hours : ''].filter(Boolean).join(' · ');

  var values = {
    email:        c.email ? { href: 'mailto:' + c.email, text: c.email } : null,
    phone:        c.phone ? { href: 'tel:' + c.phone.replace(/[^\d+]/g, ''), text: c.phone } : null,
    whatsapp:     waHref ? { href: waHref, external: true } : null,
    city:         c.city ? { text: c.city } : null,
    hours:        c.hours ? { text: 'Replies ' + c.hours } : null,
    'city-hours': cityHours ? { text: cityHours } : null
  };

  document.querySelectorAll('[data-contact]').forEach(function (el) {
    var v = values[el.getAttribute('data-contact')];
    if (!v) return;
    if (v.href) el.setAttribute('href', v.href);
    // rows with an icon keep their markup and fill only their value slot
    if (v.text) (el.querySelector('[data-contact-value]') || el).textContent = v.text;
    if (v.external) { el.target = '_blank'; el.rel = 'noopener'; }
    el.hidden = false;
  });
  document.querySelectorAll('[data-contact-block]').forEach(function (block) {
    if (block.querySelector('[data-contact]:not([hidden])')) block.hidden = false;
  });

  // "Replying now" / "Back at 10 AM IST", from the reply window in India time
  var win = c.replyHoursIST;
  if (win && win.length === 2) {
    var ist = new Date(Date.now() + 5.5 * 3600 * 1000);
    var hour = ist.getUTCHours() + ist.getUTCMinutes() / 60;
    var open = hour >= win[0] && hour < win[1];
    var fmt = function (h) { return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); };
    document.querySelectorAll('[data-contact-status]').forEach(function (el) {
      el.classList.add(open ? 'is-open' : 'is-away');
      el.querySelector('span').textContent = open ? 'Replying now' : 'Back at ' + fmt(win[0]) + ' IST';
      el.hidden = false;
    });
  }

  if (waHref) {
    var btn = document.createElement('a');
    btn.className = 'wa-float';
    btn.href = waHref;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false">' +
      '<path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M8.6 7.4c.3-.3.8-.3 1 .1l1 1.6c.2.3.1.7-.1 1l-.6.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6' +
      'c.3-.3.7-.3 1-.1l1.6 1c.4.2.4.7.1 1l-.8.8c-.6.6-1.5.7-2.3.4-2.4-1-4.3-2.9-5.3-5.3' +
      '-.3-.8-.2-1.7.4-2.3z" fill="currentColor"/></svg>';
    document.body.appendChild(btn);
  }
})();

/* ---------------------------------------------------------------
   Pointer parallax for the 3D profession scenes on the field pages.
   Writes --px / --py (-1…1) on each visible .scene; the CSS turns
   that into a tilt of the whole scene and a per-layer shift, deeper
   layers moving further.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var scenes = document.querySelectorAll('.scene');
  if (!scenes.length || !window.matchMedia) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  var clamp = function (n) { return Math.max(-1, Math.min(1, n)); };
  var frame = null, last = null;

  var apply = function () {
    frame = null;
    scenes.forEach(function (scene) {
      var r = scene.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var px = last ? (last.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2) : 0;
      var py = last ? (last.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2) : 0;
      scene.style.setProperty('--px', clamp(px).toFixed(3));
      scene.style.setProperty('--py', clamp(py).toFixed(3));
    });
  };
  var queue = function () { if (!frame) frame = window.requestAnimationFrame(apply); };

  document.addEventListener('pointermove', function (e) { last = e; queue(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { last = null; queue(); });
})();

/* ---------------------------------------------------------------
   Mobile menu, before/after slider, counters and the sample quick
   view. Each guards itself, so a page without the element is a no-op.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- mobile menu ------------------------------------------------
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    var setOpen = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('nav-open'));
    });
    header.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  // ---- before / after: tabs between the three examples ---------------
  var baSection = document.querySelector('.ba-section');
  if (baSection) {
    var baTabs = Array.prototype.slice.call(baSection.querySelectorAll('.ba-tab'));
    var selectTab = function (tab) {
      baTabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    baTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = baTabs[(i + 1) % baTabs.length];
        if (e.key === 'ArrowLeft') next = baTabs[(i - 1 + baTabs.length) % baTabs.length];
        if (next) { e.preventDefault(); selectTab(next); next.focus(); }
      });
    });
  }

  // ---- spotlight that follows the pointer (home page) -------------
  var spot = document.querySelector('.spotlight');
  if (spot && !reduced && window.matchMedia('(hover: hover)').matches) {
    var spotFrame = null, spotEvt = null;
    document.addEventListener('pointermove', function (e) {
      spotEvt = e;
      if (spotFrame) return;
      spotFrame = window.requestAnimationFrame(function () {
        spotFrame = null;
        spot.style.setProperty('--sx', spotEvt.clientX + 'px');
        spot.style.setProperty('--sy', spotEvt.clientY + 'px');
        spot.classList.add('on');
      });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { spot.classList.remove('on'); });
  }

  // ---- counters: 0 → n when the stats scroll into view -------------
  var counters = document.querySelectorAll('.stat .figure[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 1200);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        seen.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { seen.observe(el); });
  }

  // ---- sample quick view ------------------------------------------
  // A card opens its CV in a dialog, with previous / next through the
  // cards currently visible. Modified clicks, and phones, still follow
  // the link to the full page.
  var cards = Array.prototype.slice.call(document.querySelectorAll('.cv-card'));
  if (!cards.length || typeof HTMLDialogElement !== 'function') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'qv';
  dlg.setAttribute('aria-labelledby', 'qv-name');
  dlg.innerHTML =
    '<div class="qv-bar">' +
      '<div class="qv-who"><span class="qv-name" id="qv-name"></span><span class="qv-role"></span></div>' +
      '<div class="qv-actions">' +
        '<button type="button" class="qv-btn qv-prev" aria-label="Previous sample">&larr;</button>' +
        '<span class="qv-count" aria-live="polite"></span>' +
        '<button type="button" class="qv-btn qv-next" aria-label="Next sample">&rarr;</button>' +
        '<a class="qv-btn qv-open" target="_blank" rel="noopener">Open full page</a>' +
        '<button type="button" class="qv-btn qv-close" aria-label="Close preview">&times;</button>' +
      '</div>' +
    '</div>' +
    '<iframe class="qv-frame" title="Sample CV"></iframe>';
  document.body.appendChild(dlg);

  var frame = dlg.querySelector('.qv-frame');
  var prev = dlg.querySelector('.qv-prev');
  var next = dlg.querySelector('.qv-next');
  var count = dlg.querySelector('.qv-count');
  var list = [];
  var index = 0;

  var show = function (i) {
    index = (i + list.length) % list.length;
    var card = list[index];
    dlg.querySelector('.qv-name').textContent = card.querySelector('.s-name').textContent;
    dlg.querySelector('.qv-role').textContent = card.querySelector('.s-role').textContent;
    dlg.querySelector('.qv-open').href = card.href;
    count.textContent = (index + 1) + ' / ' + list.length;
    prev.hidden = next.hidden = count.hidden = list.length < 2;
    frame.src = card.getAttribute('href');
  };

  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.innerWidth < 640) return;
      e.preventDefault();
      list = cards.filter(function (c) { return c.offsetParent !== null; });
      show(list.indexOf(card));
      dlg.showModal();
      document.documentElement.classList.add('qv-lock');
    });
  });

  prev.addEventListener('click', function () { show(index - 1); });
  next.addEventListener('click', function () { show(index + 1); });
  dlg.querySelector('.qv-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (list.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
  });
  dlg.addEventListener('close', function () {
    frame.src = 'about:blank';
    document.documentElement.classList.remove('qv-lock');
  });
})();

/* ---------------------------------------------------------------
   Portfolio previews (sample-portfolios.html): each iframe renders the
   site at 1280px wide; --s scales it to whatever width its frame has.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var screens = document.querySelectorAll('.pf-viewport');
  if (!screens.length) return;

  var fit = function (vp) {
    var w = vp.clientWidth;
    if (w) vp.parentNode.style.setProperty('--s', (w / 1280).toFixed(4));
  };
  screens.forEach(fit);

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { fit(entry.target); });
    });
    screens.forEach(function (vp) { ro.observe(vp); });
  } else {
    window.addEventListener('resize', function () { screens.forEach(fit); });
  }
})();

/* ---------------------------------------------------------------
   Templates page: pick a field and every preview switches to that
   field's sample, the templates recommended for it move first, and
   "Use this template" carries both into the brief. #law etc. works.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var grid = document.querySelector('.tpl-grid');
  if (!grid) return;

  // best fit first; keep in step with the "Suits …" lines on templates.html
  var REC = {
    finance:     ['banker', 'classic', 'executive', 'minimal'],
    sales:       ['executive', 'slate', 'modern', 'compact'],
    law:         ['legal', 'classic', 'executive'],
    consulting:  ['slate', 'executive', 'modern', 'minimal'],
    engineering: ['tech', 'modern', 'minimal', 'compact'],
    data:        ['tech', 'slate', 'modern', 'compact'],
    trades:      ['workwear', 'compact', 'modern'],
    creative:    ['studio', 'creative', 'editorial', 'minimal'],
    film:        ['studio', 'creative', 'typewriter'],
    writing:     ['editorial', 'typewriter', 'classic'],
    healthcare:  ['clinical', 'classic', 'executive', 'compact'],
    teaching:    ['warm', 'classic', 'compact'],
    academia:    ['academic', 'classic', 'minimal']
  };
  var pills = document.querySelectorAll('.pill[data-tfield]');
  var tonePills = document.querySelectorAll('.pill[data-tone]');
  var cards = grid.querySelectorAll('.tpl-card');
  var nameEl = document.querySelector('[data-tfield-name]');

  // style filter: All / Traditional / Contemporary / Expressive / Practical
  tonePills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var tone = pill.getAttribute('data-tone');
      tonePills.forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
      cards.forEach(function (card) {
        card.hidden = !(tone === 'all' || card.getAttribute('data-tone') === tone);
      });
    });
  });

  var show = function (field) {
    if (!REC[field]) field = 'finance';
    var sample = 'samples/' + field + '-cv.html';
    pills.forEach(function (p) {
      var on = p.getAttribute('data-tfield') === field;
      p.setAttribute('aria-pressed', String(on));
      if (on && nameEl) nameEl.textContent = p.textContent.toLowerCase();
      // on phones the pills are one scrolling row: bring the chosen one into it
      if (on && p.parentNode.scrollWidth > p.parentNode.clientWidth) {
        p.parentNode.scrollLeft = p.offsetLeft - p.parentNode.offsetLeft - 16;
      }
    });
    cards.forEach(function (card) {
      var t = card.getAttribute('data-template');
      var url = sample + '?t=' + t;
      var frame = card.querySelector('iframe');
      if (frame.getAttribute('src') !== url) frame.setAttribute('src', url);
      card.querySelector('.tpl-screen').setAttribute('href', url);
      card.querySelector('.tpl-open').setAttribute('href', url);
      card.querySelector('.tpl-use').setAttribute('href', 'start.html?template=' + t + '&field=' + field);
      var rank = REC[field].indexOf(t);
      var badge = card.querySelector('.tpl-rec');
      card.style.order = rank > -1 ? rank : 10;
      card.classList.toggle('is-rec', rank > -1);
      badge.hidden = rank < 0;
      badge.textContent = rank === 0 ? 'Best fit' : 'Recommended';
    });
  };

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var field = pill.getAttribute('data-tfield');
      show(field);
      if (window.history && history.replaceState) history.replaceState(null, '', '#' + field);
    });
  });
  show(location.hash.slice(1));

  // previews render the sample at 880px wide and scale to the card
  var fit = function (vp) {
    if (vp.clientWidth) vp.parentNode.style.setProperty('--s', (vp.clientWidth / 880).toFixed(4));
  };
  var viewports = grid.querySelectorAll('.tpl-viewport');
  viewports.forEach(fit);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
    viewports.forEach(function (vp) { ro.observe(vp); });
  } else {
    window.addEventListener('resize', function () { viewports.forEach(fit); });
  }
})();

/* ---------------------------------------------------------------
   Start page: documents or a portfolio site. Two forms behind one
   switch — start.html?type=portfolio (or #portfolio) opens the
   portfolio brief, and ?style=creative|technical|corporate|care
   pre-picks the look from a sample portfolio's "Get yours" link.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var pform = document.getElementById('portfolio-form');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.order-tab'));
  if (!pform || !tabs.length) return;

  // ---- the switch ------------------------------------------------
  var show = function (which) {
    tabs.forEach(function (t) {
      var on = (t.id === 'ot-' + which);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    document.querySelectorAll('[data-for-order]').forEach(function (el) {
      el.hidden = el.getAttribute('data-for-order') !== which;
    });
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { show(tab.id.replace('ot-', '')); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = tabs[(i + 1) % tabs.length];
      if (next) { e.preventDefault(); next.click(); next.focus(); }
    });
  });
  document.querySelectorAll('[data-open-order]').forEach(function (b) {
    b.addEventListener('click', function () {
      show(b.getAttribute('data-open-order'));
      document.querySelector('.order-type').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var params = null;
  try { params = new URLSearchParams(location.search); } catch (err) { params = null; }
  var type = (params && params.get('type')) || location.hash.slice(1);
  if (type === 'portfolio') show('portfolio');

  var STYLES = { creative: 'Creative', technical: 'Technical', corporate: 'Corporate', care: 'Clean' };
  var wanted = params && STYLES[(params.get('style') || '').toLowerCase()];
  if (wanted) {
    pform.querySelectorAll('input[name="style"]').forEach(function (r) {
      if (r.value.indexOf(wanted) === 0) r.checked = true;
    });
  }

  // ---- the domain box only when a domain is involved ------------
  var domainBox = pform.querySelector('.domain-name');
  pform.querySelectorAll('input[name="domain"]').forEach(function (r) {
    r.addEventListener('change', function () { domainBox.hidden = r.value === 'Free address' && r.checked; });
  });

  // ---- sending ----------------------------------------------------
  var statusEl = document.getElementById('portfolio-status');
  var button = document.getElementById('portfolio-submit');
  var MAX_BYTES = 8 * 1024 * 1024;
  var say = function (msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
  };
  var val = function (n) { var el = pform.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var picked = function (n) {
    return Array.prototype.map.call(pform.querySelectorAll('input[name="' + n + '"]:checked'),
      function (c) { return c.value; });
  };

  pform.addEventListener('submit', function (e) {
    e.preventDefault();
    var endpoint = (window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.formEndpoint) ||
                   (document.getElementById('brief-form') || {}).getAttribute('data-endpoint') || '';
    if (!pform.checkValidity()) { pform.reportValidity(); return; }

    var file = pform.elements.upload && pform.elements.upload.files && pform.elements.upload.files[0];
    if (file && file.size > MAX_BYTES) {
      say('That file is larger than 8 MB. Share it as a Drive or Dropbox link in "Links to your work" instead.', 'error');
      return;
    }

    var style = picked('style')[0] || 'Match my field';
    var sections = picked('sections').join(', ');
    var domain = picked('domain')[0] || 'Free address';
    var addons = picked('addons');
    var hosting = val('hostingEmail') || val('email');

    var data = new FormData();
    data.append('kind', 'portfolio');
    ['name', 'email', 'field', 'whatsapp', 'headline', 'links', 'projects', 'domainName', 'lookFeel', 'notes', 'website']
      .forEach(function (n) { data.append(n, val(n)); });
    data.append('style', style);
    data.append('sections', sections);
    data.append('domain', domain);
    data.append('hostingEmail', hosting);
    data.append('addons', addons.join(', '));
    data.append('ownNotes', val('notes'));

    // The same brief, folded into the document brief's columns, so a
    // script that predates the Portfolio tab still records all of it.
    data.set('field', 'PORTFOLIO: ' + val('field'));
    data.append('stage', 'Portfolio brief');
    data.append('needs', ['Portfolio'].concat(addons).join(', ') + ' | Style: ' + style +
      ' | Web address: ' + domain + (val('domainName') ? ' (' + val('domainName') + ')' : '') +
      ' | Sections: ' + sections);
    data.append('target', 'Headline: ' + val('headline') + '\n\nProjects:\n' + val('projects') +
      '\n\nLinks:\n' + val('links'));
    data.set('notes', 'Look and feel: ' + val('lookFeel') + '\nHosting account email: ' + hosting +
      '\nWhatsApp: ' + val('whatsapp') + '\n\n' + val('notes'));

    button.disabled = true;
    say('Sending your portfolio brief…');

    var prepared = file ? new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read that file')); };
      reader.onload = function () {
        var s = String(reader.result);
        data.append('fileData', s.slice(s.indexOf(',') + 1));
        data.append('fileName', file.name);
        data.append('fileType', file.type || 'application/octet-stream');
        resolve();
      };
      reader.readAsDataURL(file);
    }) : Promise.resolve();

    prepared
      .then(function () { return fetch(endpoint, { method: 'POST', body: data }); })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (out) {
        if (!out || out.ok === false) throw new Error(out && out.error ? out.error : 'Rejected');
        pform.innerHTML =
          '<div class="card card-raised" style="gap:14px;">' +
          '<span class="eyebrow">Received</span>' +
          '<h2 style="font-size:clamp(24px,2.6vw,32px);">Thank you — your portfolio brief is with us.</h2>' +
          '<p>We will look through your work and email a fixed quotation and timeline to the ' +
          'address you gave us.</p>' +
          '<p class="hint">Nothing is charged until you approve it.</p></div>';
        pform.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function (err) {
        button.disabled = false;
        var email = window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.email;
        say((email
          ? 'Something went wrong sending that — please email your brief and work links to ' + email + '.'
          : 'Something went wrong sending that. Your answers are still here — please try again in a minute.') +
          ' (' + err.message + ')', 'error');
      });
  });
})();
