/* CV Forge — interactions.
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
  replyHoursIST: [10, 22]           // 24-hour clock; drives the "Replying now" badge
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
    encodeURIComponent('Hi CV Forge, I have a question about getting my CV rebuilt.') : '';
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

  // ---- before / after showcase -------------------------------------
  // Three examples behind tabs. Dragging reveals the rebuild; each of the
  // six changes ticks off once enough of the "after" page is showing, and
  // its numbered marker on the page lights up with it.
  var baSection = document.querySelector('.ba-section');
  if (baSection) {
    var THRESHOLDS = [10, 26, 42, 58, 74, 90];   // % of the rebuild revealed for change 1…6
    var panels = Array.prototype.slice.call(baSection.querySelectorAll('.ba'));
    var baTabs = Array.prototype.slice.call(baSection.querySelectorAll('.ba-tab'));
    var checks = baSection.querySelectorAll('.ba-checks li[data-n]');
    var meter = baSection.querySelector('.ba-meter-bar i');
    var status = baSection.querySelector('.ba-status');
    var active = panels.filter(function (p) { return !p.hidden; })[0] || panels[0];
    var lastDone = -1;
    var sweepFrame = null;

    var render = function (ba) {
      var pos = Number(ba.querySelector('.ba-range').value);
      var revealed = 100 - pos;
      ba.style.setProperty('--pos', pos + '%');
      if (ba !== active) return;
      var done = 0;
      checks.forEach(function (li) {
        var on = revealed >= THRESHOLDS[Number(li.getAttribute('data-n')) - 1];
        li.classList.toggle('done', on);
        if (on) done++;
      });
      ba.querySelectorAll('.ba-after .pin').forEach(function (pin) {
        pin.classList.toggle('on', revealed >= THRESHOLDS[Number(pin.getAttribute('data-n')) - 1]);
      });
      if (meter) meter.style.width = revealed + '%';
      if (status && done !== lastDone) {
        lastDone = done;
        status.textContent = done === checks.length ? 'All six fixed' : done + ' of ' + checks.length + ' fixed';
      }
    };

    var cancelSweep = function () {
      if (sweepFrame) { window.cancelAnimationFrame(sweepFrame); sweepFrame = null; }
    };

    // Moves the handle through a few stops so it is obvious it can be dragged.
    var sweep = function (stops) {
      if (reduced) return;
      cancelSweep();
      var ba = active;
      var range = ba.querySelector('.ba-range');
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var e = t - start;
        var v = stops[stops.length - 1][1];
        for (var k = 1; k < stops.length; k++) {
          if (e <= stops[k][0]) {
            var a = stops[k - 1], b = stops[k];
            var p = (e - a[0]) / (b[0] - a[0]);
            p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            v = a[1] + (b[1] - a[1]) * p;
            break;
          }
        }
        range.value = v;
        render(ba);
        sweepFrame = e < stops[stops.length - 1][0] ? window.requestAnimationFrame(step) : null;
      };
      sweepFrame = window.requestAnimationFrame(step);
    };

    panels.forEach(function (ba) {
      ba.querySelector('.ba-range').addEventListener('input', function (e) {
        if (!e.isTrusted) return;
        ba.classList.add('touched');
        cancelSweep();
        render(ba);
      });
      render(ba);
    });

    var selectTab = function (tab) {
      baTabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on) { active = panel; lastDone = -1; render(panel); }
      });
    };
    baTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        selectTab(tab);
        sweep([[0, 50], [700, 12], [1300, 50]]);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = baTabs[(i + 1) % baTabs.length];
        if (e.key === 'ArrowLeft') next = baTabs[(i - 1 + baTabs.length) % baTabs.length];
        if (next) { e.preventDefault(); selectTab(next); next.focus(); }
      });
    });

    if ('IntersectionObserver' in window) {
      var firstLook = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        firstLook.disconnect();
        if (!active.classList.contains('touched')) {
          sweep([[0, 50], [700, 90], [1900, 6], [2600, 50]]);
        }
      }, { threshold: 0.5 });
      firstLook.observe(active);
    }
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
