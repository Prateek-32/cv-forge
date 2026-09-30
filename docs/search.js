/* Site search: a magnifier in the header that opens into a search box.

   On phones the button sits beside the ☰ menu; tapped, the box grows across
   the header (as on Google) and results appear below it. "/" opens it on a
   computer, Esc closes it.

   It finds professions (with the words people actually type: "B Tech" leads
   to Engineering, "R" to Data, "CA" to Finance, "nurse" to Healthcare), every
   sample CV and portfolio, and the guides and key pages. The CVs and
   portfolios are read from sample-cvs.html and sample-portfolios.html the
   first time the box opens, so new samples are found without editing this
   file. Anything with no match is pointed at the brief — we write for every
   field. */

(function () {
  'use strict';

  var bar = document.querySelector('.site-header .bar');
  if (!bar) return;

  // links and the sample pages resolve from this script's own folder (the 404 page can sit at any path)
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/search\.js(\?.*)?$/, '') : '';

  // ---- what people type, per profession --------------------------------------
  var FIELDS = [
    ['finance', 'Finance & banking', 'finance banking bank banker accountant accounting accounts ca chartered cfa cma acca cpa frm audit auditor tax gst tally fico investment ibanking fp&a credit risk bcom commerce treasury wealth insurance loan'],
    ['sales', 'Sales & marketing', 'sales salesman marketing marketer business development bde bdm account executive digital seo sem brand growth crm salesforce hubspot retail ecommerce advertising social media'],
    ['law', 'Law & compliance', 'law legal lawyer advocate attorney llb llm counsel compliance company secretary cs paralegal litigation corporate judiciary'],
    ['consulting', 'Consulting & operations', 'consulting consultant operations ops business analyst ba strategy project manager pm product manager hr human resources recruiter talent supply chain procurement logistics mba pgdm'],
    ['engineering', 'Engineering & technology', 'engineering engineer software developer programmer coder it tech technology btech b tech be b e mtech bca mca computer science cse ece java javascript react web frontend backend fullstack devops cloud aws sde swe mechanical civil electrical electronics'],
    ['data', 'Data & analytics', 'data analyst analytics scientist science machine learning ml ai artificial intelligence r python sql power bi powerbi tableau statistics bi excel'],
    ['trades', 'Skilled trades', 'trades trade technician electrician plumber welder mechanic fitter hvac iti diploma supervisor site foreman driver maintenance'],
    ['creative', 'Design & creative', 'design designer ux ui graphic brand product designer figma art director interior fashion architect bdes b des nid nift'],
    ['art', 'Art & photography', 'art artist painter painting photographer photography photo resin fabric textile saree canvas sculptor craft handmade bfa illustrator illustration tattoo mehendi'],
    ['film', 'Film, music & performance', 'film video editor music musician producer actor acting director cinematographer sound singer dancer animator animation vfx youtuber content creator theatre'],
    ['writing', 'Writing & media', 'writing writer content copywriter journalist journalism editor author blogger translator pr communications media'],
    ['healthcare', 'Healthcare & medicine', 'healthcare health doctor nurse nursing mbbs md pharmacist pharmacy bpharm b pharm physiotherapist physio dentist bds hospital medical clinical lab technician dietitian psychologist'],
    ['teaching', 'Teaching & public service', 'teaching teacher tutor educator education school bed b ed principal trainer coaching government civil servant ngo'],
    ['academia', 'Academia & research', 'academia academic research researcher phd professor lecturer scientist postdoc jrf net fellowship thesis']
  ];
  var LEVELS = { fresher: /entry|early|graduate|trainee|junior/i, freshers: /entry|early|graduate|trainee|junior/i,
    student: /entry|early|graduate|trainee/i, graduate: /entry|early|graduate|trainee/i, entry: /entry|early|graduate|trainee|junior/i,
    intern: /entry|early|graduate|trainee/i, senior: /senior|head|director|vp|partner|staff|manager/i, manager: /manager|head|director/i,
    executive: /executive|director|vp|head|founder|partner/i };
  var PAGES = [
    ['Websites & QR menus for businesses', 'Cafés, salons, clinics, gyms, coaching, bakeries', 'business.html', 'business website shop restaurant cafe hotel salon clinic doctor dentist gym coaching tuition class bakery store local google qr menu'],
    ['QR menu for restaurants', 'Scan-to-open menu in English, Hindi and Marathi', 'business.html#qr-menu', 'qr menu restaurant cafe table scan digital menu card hotel dhaba food'],
    ['Demo QR menu', 'Monsoon Café — try it on your phone', 'menu/monsoon-cafe/', 'demo menu qr sample cafe restaurant'],
    ['Sample restaurant menus', 'Restro-bar, Irani café, thali, South Indian tiffin', 'business.html#menus', 'bar pub restro rooftop lounge irani cafe thali maharashtrian misal south indian dosa udupi tiffin menu'],
    ['Sample business websites', 'Café, bakery, salon, dental clinic, gym, coaching', 'business.html#samples', 'sample business site website example restaurant salon clinic gym coaching bakery'],
    ['Free ATS resume checker', 'Your score and top fixes in seconds', 'ats-checker.html', 'ats checker check score free resume review scan'],
    ['Pricing', 'Resume ₹99 · CV ₹199 · LinkedIn ₹149 · Portfolio ₹699', 'pricing.html', 'price prices pricing cost fees rupees bundle offer'],
    ['Resume templates', '17 ATS-safe templates to choose from', 'templates.html', 'template templates format design layout'],
    ['Start a build', 'Send us your brief — no payment yet', 'start.html', 'start order buy brief form begin'],
    ['Pay for an order', 'UPI — choose your service', 'pay.html', 'pay payment upi qr gpay phonepe paytm'],
    ['All professions', 'How resumes differ by field', 'fields.html', 'professions fields careers jobs'],
    ['Sample CVs', 'Every finished sample CV, by field', 'sample-cvs.html', 'samples sample cv cvs resume resumes examples'],
    ['Portfolio websites', 'Sample sites and twelve themes', 'sample-portfolios.html', 'portfolio portfolios website websites site themes'],
    ['Guides', 'Free guides for job seekers', 'guides.html', 'guides guide help tips advice'],
    ['Resume format for freshers in India', 'Guide', 'resume-format-for-freshers.html', 'fresher freshers student graduate format first job'],
    ['How to write an ATS-friendly resume', 'Guide', 'ats-friendly-resume.html', 'ats friendly applicant tracking keywords'],
    ['Resume vs CV: which one do you need?', 'Guide', 'resume-vs-cv.html', 'resume vs cv difference'],
    ['Do you need a portfolio website?', 'Guide', 'portfolio-website-guide.html', 'portfolio website need guide'],
    ['How to write a CV for jobs abroad', 'Guide', 'cv-for-jobs-abroad.html', 'abroad overseas gulf dubai uk usa canada germany australia foreign'],
    ['Privacy policy', '', 'privacy.html', 'privacy data'],
    ['Terms', 'Refunds, revisions and more', 'terms.html', 'terms refund refunds revision cancel']
  ];
  var FIELD_BY_LABEL = { finance: 'finance', sales: 'sales', law: 'law', consulting: 'consulting', engineering: 'engineering',
    data: 'data', trades: 'trades', design: 'creative', creative: 'creative', art: 'art', photography: 'art', film: 'film',
    music: 'film', writing: 'writing', healthcare: 'healthcare', teaching: 'teaching', academia: 'academia', technical: 'engineering' };

  var norm = function (s) { return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9+#]+/g, ' ').trim(); };
  var tight = function (s) { return norm(s).replace(/ /g, ''); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fieldName = {};
  FIELDS.forEach(function (f) { fieldName[f[0]] = f[1]; });

  // ---- the box --------------------------------------------------------------
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'search-btn';
  btn.setAttribute('aria-label', 'Search the site'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>';
  var toggle = bar.querySelector('.nav-toggle');
  bar.insertBefore(btn, toggle || bar.querySelector('.site-nav'));

  var form = document.createElement('form');
  form.className = 'site-search'; form.setAttribute('role', 'search'); form.hidden = true;
  form.innerHTML =
    '<svg class="ss-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>' +
    '<label class="sr-only" for="ss-input">Search Fieldcraft</label>' +
    '<input id="ss-input" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="Search a profession, degree or skill — e.g. B Tech, nurse, CA">' +
    '<button type="button" class="ss-close" aria-label="Close search">&times;</button>';
  bar.appendChild(form);
  var input = form.querySelector('input');

  var panel = document.createElement('div');
  panel.className = 'search-panel'; panel.hidden = true;
  panel.setAttribute('aria-live', 'polite');
  document.body.appendChild(panel);

  // ---- the samples, read once from the two pages that list them ---------------
  var DATA = null, loading = null;
  var load = function (url) {
    return new Promise(function (resolve) {
      var x = new XMLHttpRequest();
      x.open('GET', url);
      x.onload = function () { resolve(x.status < 400 || x.status === 0 ? new DOMParser().parseFromString(x.responseText, 'text/html') : null); };
      x.onerror = function () { resolve(null); };
      x.send();
    });
  };
  var text = function (el, sel) { var n = el.querySelector(sel); return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; };
  var getData = function () {
    if (DATA) return Promise.resolve(DATA);
    if (loading) return loading;
    loading = Promise.all([load(BASE + 'sample-cvs.html'), load(BASE + 'sample-portfolios.html')]).then(function (docs) {
      var cvs = [], pfs = [], seen = {};
      if (docs[0]) Array.prototype.forEach.call(docs[0].querySelectorAll('section.cv-field'), function (sec) {
        var f = sec.getAttribute('data-field') || sec.id;
        Array.prototype.forEach.call(sec.querySelectorAll('a.cv-card'), function (a) {
          var href = a.getAttribute('href');
          if (seen[href]) return; seen[href] = 1;
          cvs.push({ href: href, name: text(a, '.s-name'), title: text(a, '.t-title'), role: text(a, '.s-role'),
                     level: text(a, '.s-level'), field: f });
        });
      });
      if (docs[1]) Array.prototype.forEach.call(docs[1].querySelectorAll('article.pkx, article.pf'), function (art) {
        var a = art.querySelector('a[href^="portfolios/"]');
        if (!a || seen[a.getAttribute('href')]) return;
        seen[a.getAttribute('href')] = 1;
        var eyebrow = text(art, '.eyebrow'), name = text(art, 'h3') ||
          (a.getAttribute('aria-label') || '').replace(/^Open /, '').replace(/'s? sample portfolio$/, '');
        var bits = eyebrow.split('·').map(function (s) { return s.trim(); });
        var f = '';
        bits.concat([art.getAttribute('data-tone') || '']).some(function (b) { return (f = FIELD_BY_LABEL[norm(b).split(' ')[0]] || ''); });
        pfs.push({ href: a.getAttribute('href'), name: name, role: text(art, 'p'), tag: eyebrow, field: f });
      });
      DATA = { cvs: cvs, pfs: pfs };
      return DATA;
    });
    return loading;
  };

  // ---- matching ---------------------------------------------------------------
  // every word typed must start a word in the item (or, for longer words, appear in it)
  var hits = function (hay, words) {
    var h = ' ' + norm(hay) + ' ', t = tight(hay);
    return words.every(function (w) {
      if (w.length <= 2) return h.indexOf(' ' + w + ' ') > -1;                     // "r", "ca": whole words only
      return h.indexOf(' ' + w) > -1 || t.indexOf(w) > -1;
    });
  };
  var fieldsFor = function (q) {
    var words = norm(q).split(' ').filter(Boolean), qt = tight(q), out = [];
    FIELDS.forEach(function (f) {
      var keys = ' ' + f[2] + ' ' + norm(f[1]) + ' ', score = 0;
      if (keys.indexOf(' ' + norm(q) + ' ') > -1 || keys.replace(/ /g, '|').indexOf('|' + qt + '|') > -1) score = 3;       // a whole keyword
      else if (qt.length >= 3 && words.every(function (w) { return keys.indexOf(' ' + w) > -1; })) score = 2;             // keyword starts
      if (score) out.push({ key: f[0], name: f[1], score: score });
    });
    if (out.some(function (x) { return x.score === 3; })) out = out.filter(function (x) { return x.score === 3; });   // an exact keyword beats partial ones
    return out.sort(function (a, b) { return b.score - a.score; });
  };
  var search = function (q, data) {
    var words = norm(q).split(' ').filter(Boolean);
    if (!words.length) return null;
    var fields = fieldsFor(q), fset = {};
    fields.forEach(function (f) { fset[f.key] = f.score; });
    var level = LEVELS[norm(q)];
    var wantsSites = /^(portfolio|portfolios|website|websites|site|sites|portfolio website|portfolio site)$/.test(norm(q));
    var score = function (item, hay) {
      var s = 0;
      if (hits(hay, words)) s += 10;
      if (fset[item.field]) s += 4 + fset[item.field];
      if (wantsSites && item.tag !== undefined) s += 5;
      if (level && item.level && level.test(item.level)) s += 8;
      return s;
    };
    var rank = function (list, hayOf) {
      return list.map(function (it) { return { it: it, s: score(it, hayOf(it)) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.it; });
    };
    return {
      fields: fields.slice(0, 3),
      cvs: rank(data.cvs, function (c) { return [c.name, c.title, c.role, c.level, fieldName[c.field]].join(' '); }),
      pfs: rank(data.pfs, function (p) { return [p.name, p.role, p.tag, fieldName[p.field]].join(' '); }),
      pages: PAGES.filter(function (p) { return hits(p[0] + ' ' + p[3], words) || words.some(function (w) { return (' ' + p[3] + ' ').indexOf(' ' + w + ' ') > -1; }); })
    };
  };

  // ---- results ----------------------------------------------------------------
  var row = function (href, title, sub, tag) {
    return '<a class="sr-item" href="' + esc(BASE + href) + '"><span class="sr-title">' + esc(title) + '</span>' +
      (sub ? '<span class="sr-sub">' + esc(sub) + '</span>' : '') + (tag ? '<span class="sr-tag">' + esc(tag) + '</span>' : '') + '</a>';
  };
  var group = function (title, html, more) {
    return html ? '<section class="sr-group"><h2 class="sr-head">' + title + '</h2>' + html + (more || '') + '</section>' : '';
  };
  var render = function () {
    var q = input.value.trim();
    if (!q) {
      panel.innerHTML = '<p class="sr-hint">Try <button type="button" data-q="B Tech">B Tech</button> <button type="button" data-q="nurse">nurse</button> ' +
        '<button type="button" data-q="CA">CA</button> <button type="button" data-q="fresher">fresher</button> <button type="button" data-q="photographer">photographer</button> ' +
        '<button type="button" data-q="portfolio">portfolio</button></p>';
      return;
    }
    if (!DATA) { panel.innerHTML = '<p class="sr-hint">Searching…</p>'; getData().then(render); return; }
    var r = search(q, DATA), html = '';
    var top = r.fields[0] && r.fields[0].key;
    html += group('Professions', r.fields.map(function (f) { return row(f.key + '.html', f.name, 'Samples, format and what we change for this field', 'Profession'); }).join(''));
    html += group('Sample CVs', r.cvs.slice(0, 6).map(function (c) {
      return row(c.href, c.name, (c.title || c.role) + (c.level ? ' · ' + c.level : ''), fieldName[c.field] || '');
    }).join(''), r.cvs.length > 6 ? '<a class="sr-more" href="' + BASE + 'sample-cvs.html' + (top ? '#' + top : '') + '">See all ' + r.cvs.length + ' matching CVs &rarr;</a>' : '');
    html += group('Portfolio websites', r.pfs.slice(0, 4).map(function (p) {
      return row(p.href, p.name, p.role, p.tag);
    }).join(''), r.pfs.length > 4 ? '<a class="sr-more" href="' + BASE + 'sample-portfolios.html#examples">See all ' + r.pfs.length + ' matching portfolios &rarr;</a>' : '');
    html += group('Guides & pages', r.pages.slice(0, 5).map(function (p) { return row(p[2], p[0], p[1], ''); }).join(''));
    var none = !r.fields.length && !r.cvs.length && !r.pfs.length && !r.pages.length;
    html += '<div class="sr-foot">' + (none ? '<strong>No exact match for “' + esc(q) + '”.</strong> ' : '<strong>Not quite your field?</strong> ') +
      'We write for every profession — send us what you have and choose “Another field”.' +
      '<span class="sr-foot-links"><a class="btn btn-sm" href="' + BASE + 'start.html">Start a build</a><a href="' + BASE + 'fields.html">All professions</a></span></div>';
    panel.innerHTML = html;
  };

  // ---- open and close -----------------------------------------------------------
  var header = bar.closest('.site-header');
  var place = function () {
    var r = header.getBoundingClientRect();
    panel.style.top = Math.max(0, r.bottom) + 'px';
  };
  var open = function () {
    if (header.classList.contains('searching')) { input.focus(); return; }
    header.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    form.hidden = false; panel.hidden = false;
    header.classList.add('searching');
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('search-open');
    place(); render();
    void form.offsetWidth;                                   // lay the box out small first, so it grows
    window.requestAnimationFrame(function () { form.classList.add('open'); input.focus(); });
    getData();
  };
  var close = function () {
    form.classList.remove('open');
    header.classList.remove('searching');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('search-open');
    panel.hidden = true;
    window.setTimeout(function () { if (!form.classList.contains('open')) form.hidden = true; }, 220);
    btn.focus();
  };

  btn.addEventListener('click', open);
  form.querySelector('.ss-close').addEventListener('click', close);
  input.addEventListener('input', render);
  form.addEventListener('submit', function (e) {           // Enter: the first result
    e.preventDefault();
    var first = panel.querySelector('a.sr-item');
    if (first) window.location.href = first.getAttribute('href');
  });
  panel.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-q]') : null;
    if (b) { input.value = b.getAttribute('data-q'); render(); input.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('searching')) { e.preventDefault(); close(); }
    else if (e.key === '/' && !header.classList.contains('searching') && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) && !e.target.isContentEditable) {
      e.preventDefault(); open();
    }
  });
  document.addEventListener('pointerdown', function (e) {     // a tap outside closes it
    if (!header.classList.contains('searching')) return;
    if (form.contains(e.target) || panel.contains(e.target) || btn.contains(e.target)) return;
    close();
  });
  window.addEventListener('resize', function () { if (!panel.hidden) place(); });
  window.addEventListener('scroll', function () { if (!panel.hidden) place(); }, { passive: true });
})();
