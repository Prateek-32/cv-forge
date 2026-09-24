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
   Start page: two briefs — the documents, or a portfolio site —
   each a short run of steps, sent to your own Apps Script endpoint.

   start.html?type=portfolio (or #portfolio) opens the portfolio brief.
   ?template=classic&field=law pre-picks the CV template and the field;
   ?theme=noir (a sample portfolio's "Get yours") or the older
   ?style=creative|technical|corporate|care pre-picks the look.

   Answers are kept in this browser as a draft while you type, so a
   closed tab loses nothing. Every answer also travels as one readable
   "summary", which the endpoint files whole — and which older copies
   of the script keep in Notes, so nothing is lost before a redeploy.

   Posted as FormData with no custom headers, which keeps it a
   "simple" CORS request and avoids the preflight that Apps Script
   cannot answer. Any failure falls back to an email address rather
   than swallowing the enquiry.
   --------------------------------------------------------------- */

// Portfolio themes that suit each field, best first — used by the
// portfolio brief and the theme studio on sample-portfolios.html.
// Keep the theme names in step with portfolios/kit/kit.js.
var CV_FORGE_PF_REC = {
  finance: ['sidebar', 'noir', 'paper'],       sales: ['swiss', 'brutal', 'aurora'],
  law: ['paper', 'sidebar', 'noir'],           consulting: ['sidebar', 'swiss', 'paper'],
  engineering: ['console', 'aurora', 'swiss'], data: ['console', 'aurora', 'swiss'],
  trades: ['brutal', 'clinic', 'swiss'],       creative: ['gallery', 'brutal', 'pastel'],
  film: ['noir', 'gallery', 'aurora'],         writing: ['paper', 'swiss', 'noir'],
  healthcare: ['clinic', 'paper', 'sidebar'],  teaching: ['pastel', 'clinic', 'paper'],
  academia: ['sidebar', 'paper', 'clinic']
};

(function () {
  'use strict';

  var cvForm = document.getElementById('brief-form');
  var pfForm = document.getElementById('portfolio-form');
  if (!cvForm && !pfForm) return;

  var FIELD_ORDER = ['finance', 'sales', 'law', 'consulting', 'engineering', 'data', 'trades',
                     'creative', 'film', 'writing', 'healthcare', 'teaching', 'academia'];
  var PF_REC = CV_FORGE_PF_REC;
  var OLD_STYLES = { creative: 'yuki', technical: 'lena', corporate: 'arjun', care: 'nair' };
  var MAX_FILES = 5, MAX_TOTAL = 10 * 1024 * 1024, MAX_PROJECTS = 8;

  var params = null;
  try { params = new URLSearchParams(location.search); } catch (err) { params = null; }
  var param = function (k) { return params ? (params.get(k) || '').toLowerCase() : ''; };

  var all = function (root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  var title = function (k) { return k.charAt(0).toUpperCase() + k.slice(1); };
  var fieldKey = function (form) {
    var sel = form.elements.field;
    return sel ? FIELD_ORDER[sel.selectedIndex] || '' : '';
  };
  var picked = function (form, name) {
    return all(form, 'input[name="' + name + '"]:checked').map(function (c) { return c.value; });
  };
  var val = function (form, name) {
    var el = form.elements[name];   // a single control, not a group of radios
    return el && el.tagName ? String(el.value || '').trim() : '';
  };
  // the fields a draft remembers: everything typed, nothing uploaded
  var draftable = function (form) {
    return all(form, 'input, select, textarea').filter(function (el) {
      return el.name && el.type !== 'file' && el.name !== 'website';
    });
  };

  // ---- the switch between the two briefs --------------------------
  var tabs = all(document, '.order-tab');
  var show = function (which) {
    tabs.forEach(function (t) {
      var on = (t.id === 'ot-' + which);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    all(document, '[data-for-order]').forEach(function (el) {
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
  all(document, '[data-open-order]').forEach(function (b) {
    b.addEventListener('click', function () {
      show(b.getAttribute('data-open-order'));
      document.querySelector('.order-type').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  if (tabs.length && ((params && params.get('type')) || location.hash.slice(1)) === 'portfolio') show('portfolio');

  // ---- what the visitor has said, step by step ---------------------
  function labelFor(el) {
    if (el.type === 'radio' || el.type === 'checkbox') {
      var legend = el.closest('fieldset') && el.closest('fieldset').querySelector('legend');
      return legend ? clean(legend.textContent) : el.name;
    }
    var l = el.id && el.form.querySelector('label[for="' + el.id + '"]');
    return l ? clean(l.textContent).replace(/\s*\(optional\)$/i, '') : el.name;
  }

  function projectText(p) {
    var g = function (k) { var el = p.querySelector('[data-p="' + k + '"]'); return el ? el.value.trim() : ''; };
    var lines = [[g('title'), g('role'), g('year')].filter(Boolean).join(' · ')];
    if (g('what')) lines.push('What: ' + g('what'));
    if (g('result')) lines.push('Result: ' + g('result'));
    if (g('link')) lines.push('Link: ' + g('link'));
    return lines.filter(Boolean).join('\n');
  }

  function themeLabel(form) {
    var v = picked(form, 'theme')[0] || '';
    if (v !== 'Match my field') return v;
    var rec = PF_REC[fieldKey(form)];
    return rec ? 'Match my field (we suggest ' + title(rec[0]) + ')' : v;
  }

  function answers(form) {
    return all(form, '.step').map(function (step) {
      var rows = [], seen = {};
      all(step, 'input, select, textarea').forEach(function (el) {
        if (!el.name || el.name === 'website' || el.closest('.proj') || el.closest('[hidden]')) return;
        if (el.type === 'file') {
          var names = Array.prototype.map.call(el.files || [], function (f) { return f.name; });
          if (names.length) rows.push([labelFor(el), names.join(', ')]);
        } else if (el.type === 'radio' || el.type === 'checkbox') {
          if (seen[el.name]) return;
          seen[el.name] = true;
          var v = el.name === 'theme' ? themeLabel(form) : picked(form, el.name).join(', ');
          if (v) rows.push([labelFor(el), v]);
        } else if (el.tagName === 'SELECT') {
          rows.push([labelFor(el), el.options[el.selectedIndex] ? clean(el.options[el.selectedIndex].text) : '']);
        } else if (String(el.value).trim()) {
          rows.push([labelFor(el), String(el.value).trim()]);
        }
      });
      all(step, '.proj').forEach(function (p, n) {
        var t = projectText(p);
        if (t) rows.push(['Project ' + (n + 1), t]);
      });
      return { title: step.getAttribute('data-title'), rows: rows };
    });
  }

  function summaryText(form) {
    return answers(form).map(function (g) {
      return '== ' + g.title + ' ==\n' + (g.rows.length ? g.rows.map(function (r) {
        return r[1].indexOf('\n') > -1 ? r[0] + ':\n  ' + r[1].replace(/\n/g, '\n  ') : r[0] + ': ' + r[1];
      }).join('\n') : '(nothing given)');
    }).join('\n\n');
  }

  // ---- steps, progress and review ---------------------------------
  function wizard(form) {
    var steps = all(form, '.step');
    var last = steps.length - 1;
    var nav = form.querySelector('.wiz-nav');
    var back = nav.querySelector('[data-wiz="back"]');
    var next = nav.querySelector('[data-wiz="next"]');
    var current = 0, reached = 0;

    var head = document.createElement('div');
    head.className = 'wiz-progress';
    head.innerHTML = '<div class="wiz-count"><span class="wiz-where"></span>' +
      '<span class="wiz-saved" hidden>Draft saved on this device · <button type="button" class="linklike">Start over</button></span></div>' +
      '<div class="wiz-track" aria-hidden="true"><i></i></div><ol class="wiz-steps"></ol>';
    var list = head.querySelector('.wiz-steps');
    steps.forEach(function (s, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="wiz-n">' + (i + 1) + '</span> ';
      b.appendChild(document.createTextNode(s.getAttribute('data-title')));
      b.addEventListener('click', function () { jump(i); });
      li.appendChild(b);
      list.appendChild(li);
    });
    form.insertBefore(head, form.firstChild);

    // the first unanswered required field in a step, shown and flagged
    function valid(i) {
      var bad = all(steps[i], 'input, select, textarea').filter(function (el) {
        return el.willValidate && !el.checkValidity();
      })[0];
      if (!bad) return true;
      goTo(i, false);
      bad.reportValidity();
      return false;
    }
    function jump(i) {
      for (var n = current; n < i; n++) if (!valid(n)) return;
      goTo(i);
    }
    function goTo(i, focus) {
      current = Math.max(0, Math.min(last, i));
      reached = Math.max(reached, current);
      steps.forEach(function (s, n) { s.classList.toggle('is-current', n === current); });
      all(list, 'li').forEach(function (li, n) {
        li.className = n < current ? 'done' : '';
        if (n === current) li.firstChild.setAttribute('aria-current', 'step');
        else li.firstChild.removeAttribute('aria-current');
      });
      head.querySelector('.wiz-where').textContent =
        'Step ' + (current + 1) + ' of ' + steps.length + ' · ' + steps[current].getAttribute('data-title');
      head.querySelector('.wiz-track i').style.width = ((current + 1) / steps.length * 100) + '%';
      back.hidden = current === 0;
      next.hidden = current === last;
      if (current === last) renderReview();
      if (focus !== false) {
        var h = steps[current].querySelector('.step-title');
        if (h) h.focus({ preventScroll: true });
        if (head.getBoundingClientRect().top < 0) head.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function renderReview() {
      var box = form.querySelector('.wiz-review');
      if (!box) return;
      box.innerHTML = '<p class="rv-title">Your answers</p>';
      answers(form).slice(0, last).forEach(function (g, i) {
        var sec = document.createElement('div');
        sec.className = 'rv-group';
        sec.innerHTML = '<div class="rv-head"><strong></strong><button type="button" class="linklike">Edit</button></div><dl></dl>';
        sec.querySelector('strong').textContent = g.title;
        sec.querySelector('button').addEventListener('click', function () { goTo(i); });
        var dl = sec.querySelector('dl');
        if (!g.rows.length) {
          var none = document.createElement('dd');
          none.className = 'rv-empty';
          none.textContent = 'Nothing yet — that is fine, we can ask.';
          dl.appendChild(none);
        }
        g.rows.forEach(function (r) {
          var dt = document.createElement('dt'), dd = document.createElement('dd');
          dt.textContent = r[0];
          dd.textContent = r[1];
          dl.appendChild(dt);
          dl.appendChild(dd);
        });
        box.appendChild(sec);
      });
    }

    next.addEventListener('click', function () { if (valid(current)) goTo(current + 1); });
    back.addEventListener('click', function () { goTo(current - 1); });
    head.querySelector('.wiz-saved button').addEventListener('click', function () {
      clearDraft(form);
      form.reset();
      all(form, '.proj').slice(1).forEach(function (p) { p.parentNode.removeChild(p); });
      renumber(form);
      refresh(form);
      goTo(0);
    });

    form.addEventListener('keydown', function (e) {
      // Enter in a one-line box moves on rather than sending half a brief
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && current < last &&
          !/^(checkbox|radio|button|submit|file)$/.test(e.target.type)) {
        e.preventDefault();
        next.click();
      }
    });

    form._wiz = {
      isLast: function () { return current === last; },
      next: function () { next.click(); },
      validAll: function () { for (var i = 0; i <= last; i++) if (!valid(i)) return false; return true; },
      saved: function (on) { head.querySelector('.wiz-saved').hidden = !on; }
    };
    goTo(0, false);
  }

  // ---- repeatable projects -----------------------------------------
  function renumber(form) {
    var items = all(form, '.proj');
    items.forEach(function (p, i) {
      p.querySelector('legend').textContent = 'Project ' + (i + 1);
      all(p, '[id]').forEach(function (el) { el.id = el.id.replace(/-\d+$/, '-' + (i + 1)); });
      all(p, 'label[for]').forEach(function (l) { l.htmlFor = l.htmlFor.replace(/-\d+$/, '-' + (i + 1)); });
      p.querySelector('.proj-remove').hidden = i === 0;
    });
    var add = form.querySelector('.proj-add');
    if (add) add.hidden = items.length >= MAX_PROJECTS;
  }
  function addProject(form) {
    var items = all(form, '.proj');
    if (!items.length || items.length >= MAX_PROJECTS) return null;
    var copy = items[0].cloneNode(true);
    all(copy, 'input, textarea').forEach(function (el) { el.value = ''; });
    items[items.length - 1].parentNode.appendChild(copy);
    renumber(form);
    return copy;
  }

  // ---- drafts: this browser only, never required -------------------
  var draftKey = function (form) { return 'fc-draft-' + form.id; };
  function saveDraft(form) {
    try {
      var data = { projects: all(form, '.proj').length, v: draftable(form).map(function (el) {
        return (el.type === 'radio' || el.type === 'checkbox') ? el.checked : el.value;
      }) };
      localStorage.setItem(draftKey(form), JSON.stringify(data));
      if (form._wiz) form._wiz.saved(true);
    } catch (err) { /* private window or storage blocked: carry on without */ }
  }
  function loadDraft(form) {
    try {
      var d = JSON.parse(localStorage.getItem(draftKey(form)) || 'null');
      if (!d || !d.v) return false;
      while (all(form, '.proj').length < d.projects && addProject(form)) { /* grow to fit */ }
      var els = draftable(form);
      if (els.length !== d.v.length) return false;   // the form has changed since; start fresh
      els.forEach(function (el, i) {
        if (el.type === 'radio' || el.type === 'checkbox') el.checked = !!d.v[i];
        else el.value = d.v[i];
      });
      return true;
    } catch (err) { return false; }
  }
  function clearDraft(form) {
    try { localStorage.removeItem(draftKey(form)); } catch (err) { /* nothing to clear */ }
    if (form._wiz) form._wiz.saved(false);
  }

  // ---- files -------------------------------------------------------
  function filesOf(form) {
    var out = [];
    all(form, 'input[type="file"]').forEach(function (inp) {
      Array.prototype.forEach.call(inp.files || [], function (f) { out.push(f); });
    });
    return out;
  }
  function fileProblem(form) {
    var files = filesOf(form);
    var total = files.reduce(function (s, f) { return s + f.size; }, 0);
    if (files.length > MAX_FILES) return 'That is ' + files.length + ' files — please choose ' + MAX_FILES + ' at most, or share a Drive or Dropbox link instead.';
    if (total > MAX_TOTAL) return 'Those files come to ' + (total / 1048576).toFixed(1) + ' MB — the limit is 10 MB. Share the large ones as a Drive or Dropbox link instead.';
    return '';
  }
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
      reader.onload = function () {
        var s = String(reader.result);
        resolve(s.slice(s.indexOf(',') + 1));   // strip the "data:<type>;base64," prefix
      };
      reader.readAsDataURL(file);
    });
  }
  // the first file as fileData / fileName / fileType, the rest as fileData1, fileData2…
  function attachFiles(form, data) {
    return Promise.all(filesOf(form).map(function (f, i) {
      return readFile(f).then(function (b64) {
        var n = i ? String(i) : '';
        data.append('fileData' + n, b64);
        data.append('fileName' + n, f.name);
        data.append('fileType' + n, f.type || 'application/octet-stream');
      });
    }));
  }

  // ---- sending -----------------------------------------------------
  function endpoint() {
    return (window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.formEndpoint) ||
           (cvForm && cvForm.getAttribute('data-endpoint')) || '';
  }
  function everyField(form, data) {
    var seen = {};
    draftable(form).forEach(function (el) {
      if (el.closest('.proj') || seen[el.name]) return;
      seen[el.name] = true;
      data.append(el.name, (el.type === 'radio' || el.type === 'checkbox') ? picked(form, el.name).join(', ') : String(el.value).trim());
    });
    data.append('website', val(form, 'website'));   // honeypot
  }

  function cvPayload(form) {
    var data = new FormData();
    everyField(form, data);
    var summary = summaryText(form);
    // The template rides along in "needs" too, so a script that predates
    // the Template column still records it.
    var template = val(form, 'template') || 'Our choice for the field';
    data.set('template', template);
    data.set('needs', picked(form, 'needs').concat('Template: ' + template).join(', '));
    data.set('target', val(form, 'target') + (val(form, 'jobLinks') ? '\n\nJob postings:\n' + val(form, 'jobLinks') : ''));
    data.append('userNotes', val(form, 'notes'));
    data.append('summary', summary);
    data.set('notes', summary);        // older scripts keep the whole brief in Notes
    return data;
  }

  function pfPayload(form) {
    var data = new FormData();
    everyField(form, data);
    var summary = summaryText(form);
    var links = [['LinkedIn', 'lkLinkedin'], ['GitHub', 'lkGithub'], ['Behance / Dribbble', 'lkBehance'],
                 ['Instagram / X', 'lkInstagram'], ['Website', 'lkWebsite']]
      .filter(function (l) { return val(form, l[1]); })
      .map(function (l) { return l[0] + ': ' + val(form, l[1]); });
    if (val(form, 'links')) links.push(val(form, 'links'));
    var projects = all(form, '.proj').map(projectText).filter(Boolean)
      .map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n\n');
    var addons = picked(form, 'addons');
    var hosting = val(form, 'hostingEmail') || val(form, 'email');
    var domain = picked(form, 'domain')[0] || 'Free address';

    data.append('kind', 'portfolio');
    data.set('theme', themeLabel(form));
    data.append('style', themeLabel(form));   // the column older scripts call "Look"
    data.set('links', links.join('\n'));
    data.append('projects', projects);
    data.set('hostingEmail', hosting);
    data.append('userNotes', val(form, 'notes'));
    data.append('summary', summary);
    data.append('ownNotes', summary);         // older scripts keep the whole brief in Notes

    // The same brief, folded into the document brief's columns, for a
    // script that predates the Portfolio tab altogether.
    data.set('field', 'PORTFOLIO: ' + val(form, 'field'));
    data.append('stage', 'Portfolio brief');
    data.append('needs', ['Portfolio'].concat(addons).join(', ') + ' | Theme: ' + themeLabel(form) +
      ' | Web address: ' + domain + (val(form, 'domainName') ? ' (' + val(form, 'domainName') + ')' : ''));
    data.append('target', 'Headline: ' + val(form, 'headline') + '\n\nProjects:\n' + projects + '\n\nLinks:\n' + links.join('\n'));
    data.set('notes', summary);
    return data;
  }

  function setup(form, opts) {
    var statusEl = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var say = function (msg, kind) {
      statusEl.textContent = msg;
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    };

    wizard(form);
    var restored = loadDraft(form);
    if (opts.prefill) opts.prefill(form);
    if (opts.refresh) opts.refresh(form);
    if (restored) form._wiz.saved(true);

    var timer = null;
    var onEdit = function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { saveDraft(form); }, 400);
    };
    form.addEventListener('input', onEdit);
    form.addEventListener('change', function (e) {
      onEdit();
      if (opts.refresh) opts.refresh(form);
      if (e.target.type === 'file') {
        var out = e.target.parentNode.querySelector('.file-list');
        var files = Array.prototype.slice.call(e.target.files || []);
        if (out) out.textContent = files.length ? files.map(function (f) {
          return f.name + ' (' + (f.size / 1048576).toFixed(1) + ' MB)';
        }).join(' · ') : '';
        var problem = fileProblem(form);
        if (problem) say(problem, 'error'); else if (statusEl.className.indexOf('is-error') > -1) say('');
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form._wiz.isLast()) { form._wiz.next(); return; }
      var url = endpoint();
      if (!url || url.charAt(0) === '[') {
        say('This form is not connected yet. Please email us instead.', 'error');
        return;
      }
      if (!form._wiz.validAll()) return;
      var problem = fileProblem(form);
      if (problem) { say(problem, 'error'); return; }

      var data = opts.payload(form);
      button.disabled = true;
      say(filesOf(form).length ? 'Sending your brief and files…' : 'Sending your brief…');

      attachFiles(form, data)
        .then(function () { return fetch(url, { method: 'POST', body: data }); })
        .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
        .then(function (out) {
          if (!out || out.ok === false) throw new Error(out && out.error ? out.error : 'Rejected');
          clearDraft(form);
          form.innerHTML =
            '<div class="card card-raised" style="gap:14px;">' +
            '<span class="eyebrow">Received</span>' +
            '<h2 style="font-size:clamp(24px,2.6vw,32px);">' + opts.thanks + '</h2>' +
            '<p>We read every brief ourselves. Expect a fixed quotation and timeline by ' +
            'email, to the address you gave us.</p>' +
            '<p class="hint">Nothing is charged until you approve it.</p></div>';
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function (err) {
          button.disabled = false;
          var email = window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.email;
          say((email
            ? 'Something went wrong sending that — your answers are still here. Try again, or email your brief to ' + email + '.'
            : 'Something went wrong sending that. Your answers are still here — please try again in a minute.') +
            ' (' + err.message + ')', 'error');
        });
    });
  }

  function prefillField(form) {
    var fi = FIELD_ORDER.indexOf(param('field'));
    if (fi > -1 && form.elements.field && form.elements.field.options[fi]) form.elements.field.selectedIndex = fi;
  }

  if (cvForm) setup(cvForm, {
    payload: cvPayload,
    thanks: 'Thank you — your brief is with us.',
    prefill: function (form) {
      // Arriving from "Use this template": start.html?template=classic&field=law
      var tpl = param('template');
      if (tpl) Array.prototype.forEach.call(form.elements.template.options, function (o) {
        if (o.value.toLowerCase() === tpl) form.elements.template.value = o.value;
      });
      prefillField(form);
    }
  });

  if (pfForm) {
    pfForm.addEventListener('click', function (e) {
      if (e.target.closest('.proj-add')) {
        var p = addProject(pfForm);
        if (p) { p.querySelector('input').focus(); saveDraft(pfForm); }
      } else if (e.target.closest('.proj-remove')) {
        var gone = e.target.closest('.proj');
        gone.parentNode.removeChild(gone);
        renumber(pfForm);
        saveDraft(pfForm);
      }
    });
    renumber(pfForm);

    setup(pfForm, {
      payload: pfPayload,
      thanks: 'Thank you — your portfolio brief is with us.',
      prefill: function (form) {
        prefillField(form);
        var want = param('theme') || OLD_STYLES[param('style')] || '';
        all(form, 'input[name="theme"]').forEach(function (r) {
          if (want && r.getAttribute('data-key') === want) r.checked = true;
        });
      },
      refresh: function (form) {
        // mark the themes that suit the chosen field
        var rec = PF_REC[fieldKey(form)] || [];
        all(form, '.tp-card').forEach(function (card) {
          var key = card.querySelector('input').getAttribute('data-key');
          card.classList.toggle('is-rec', rec.slice(0, 2).indexOf(key) > -1);
        });
        var auto = form.querySelector('[data-auto-desc]');
        if (auto) auto.textContent = rec.length
          ? 'For your field we would start with ' + title(rec[0]) + ', or ' + title(rec[1]) + '.'
          : 'We pick the theme your field expects.';
        // the domain box only when a domain is involved
        var box = form.querySelector('.domain-name');
        if (box) box.hidden = (picked(form, 'domain')[0] || 'Free address') === 'Free address';
      }
    });
  }
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
   Theme studio (sample-portfolios.html#themes): any kit example in
   any of the ten themes. ?person=jake-tran&t=noir opens on that pair.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var studio = document.querySelector('.studio');
  if (!studio) return;

  var person = document.getElementById('st-person');
  var frame = studio.querySelector('iframe');
  var screen = document.getElementById('st-screen');
  var open = document.getElementById('st-open');
  var use = document.getElementById('st-use');
  var note = document.getElementById('st-note');
  var label = screen.querySelector('.pf-chrome span');
  var buttons = Array.prototype.slice.call(studio.querySelectorAll('.st-theme'));
  var title = function (k) { return k.charAt(0).toUpperCase() + k.slice(1); };
  var option = function () { return person.options[person.selectedIndex]; };
  var theme = option().getAttribute('data-theme');

  var render = function () {
    var opt = option();
    var field = opt.getAttribute('data-field');
    var rec = (window.CV_FORGE_PF_REC && CV_FORGE_PF_REC[field] || []).slice(0, 2);
    var url = 'portfolios/' + person.value + '.html?t=' + theme;
    if (frame.getAttribute('src') !== url) frame.setAttribute('src', url);
    screen.href = open.href = url;
    use.href = 'start.html?type=portfolio&theme=' + theme + '&field=' + field;
    label.textContent = opt.text.split(' — ')[0] + ' · ' + title(theme);
    buttons.forEach(function (b) {
      var key = b.getAttribute('data-theme');
      b.setAttribute('aria-pressed', String(key === theme));
      b.classList.toggle('is-rec', rec.indexOf(key) > -1);
    });
    note.textContent = rec.length
      ? 'Dots mark the themes we suggest for ' + opt.getAttribute('data-field-label') + ': ' +
        rec.map(title).join(' and ') + '.'
      : '';
  };

  person.addEventListener('change', function () {
    theme = option().getAttribute('data-theme');
    render();
  });
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { theme = b.getAttribute('data-theme'); render(); });
  });
  // "Try other themes" under each example card
  document.querySelectorAll('[data-studio-person]').forEach(function (a) {
    a.addEventListener('click', function () {
      person.value = a.getAttribute('data-studio-person');
      theme = option().getAttribute('data-theme');
      render();
    });
  });

  try {
    var q = new URLSearchParams(location.search);
    var who = q.get('person'), t = (q.get('t') || '').toLowerCase();
    if (who && person.querySelector('option[value="' + who.replace(/[^a-z-]/g, '') + '"]')) {
      person.value = who;
      theme = option().getAttribute('data-theme');
    }
    if (t && buttons.some(function (b) { return b.getAttribute('data-theme') === t; })) theme = t;
  } catch (err) { /* no URLSearchParams: start on the first person */ }
  render();
})();

/* ---------------------------------------------------------------
   Example filter (sample-portfolios.html#examples): one group at a time.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var bar = document.querySelector('.pkx-filter');
  if (!bar) return;
  var buttons = Array.prototype.slice.call(bar.querySelectorAll('button[data-group]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pkx[data-group]'));

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.getAttribute('data-group');
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      cards.forEach(function (c) { c.hidden = g !== 'all' && c.getAttribute('data-group') !== g; });
    });
  });
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
