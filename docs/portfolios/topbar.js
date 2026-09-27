/* The sample bar on every portfolio page: a way back to wherever the visitor
   came from, the theme picker (kit pages), the CV, and "Get this look".

   "Back" remembers the page that led here for this tab (sessionStorage), so
   switching themes — which reloads the page — never loses it. Opened
   directly, it goes to the portfolio gallery. It rebuilds the existing
   .cvf-banner in place, keeping the theme slot that kit.js fills, and brings
   its own styles so the four hand-built showcases match the kit pages. */

(function () {
  'use strict';

  var bar = document.querySelector('.cvf-banner');
  if (!bar || window.self !== window.top) return;               // previews hide the bar anyway

  // ---- where "Back" goes ------------------------------------------------------
  var KEY = 'fc-portfolio-back';
  var LABELS = {
    '': 'Home', 'index.html': 'Home', 'sample-portfolios.html': 'All portfolios', 'sample-cvs.html': 'Sample CVs',
    'fields.html': 'Professions', 'templates.html': 'Templates', 'pricing.html': 'Pricing', 'guides.html': 'Guides',
    'start.html': 'your brief', 'art.html': 'Art & Photography', 'creative.html': 'Design', 'engineering.html': 'Engineering',
    'data.html': 'Data & Analytics', 'finance.html': 'Finance', 'sales.html': 'Sales & Marketing', 'law.html': 'Law',
    'consulting.html': 'Consulting', 'trades.html': 'Skilled Trades', 'film.html': 'Film & Music', 'writing.html': 'Writing',
    'healthcare.html': 'Healthcare', 'teaching.html': 'Teaching', 'academia.html': 'Academia',
    'portfolio-website-guide.html': 'the guide'
  };
  var here = location.pathname;
  var from = null;
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin && ref.pathname !== here) {
      var file = ref.pathname.split('/').pop();
      var label = /\/samples\//.test(ref.pathname) ? 'the CV' :
                  /\/portfolios\//.test(ref.pathname) ? 'the last portfolio' :
                  (LABELS[file] || (document.referrer && 'previous page'));
      from = { href: ref.href, label: label };
      sessionStorage.setItem(KEY + here, JSON.stringify(from));
    } else {
      from = JSON.parse(sessionStorage.getItem(KEY + here) || 'null');   // a theme switch: keep the original
    }
  } catch (e) { from = null; }
  var gallery = '../sample-portfolios.html';
  if (!from) from = { href: gallery + '#examples', label: 'All portfolios' };

  // ---- the pieces already in the bar --------------------------------------------
  var links = bar.querySelector('.cvf-links') || bar;
  var slot = bar.querySelector('.pk-theme-slot');
  var anchors = Array.prototype.slice.call(links.querySelectorAll('a'));
  var cv = anchors.filter(function (a) { return /samples\//.test(a.getAttribute('href')); })[0];
  var use = anchors.filter(function (a) { return /start\.html/.test(a.getAttribute('href')); })[0];
  var note = bar.querySelector(':scope > span:not(.cvf-links)');
  var noteText = note ? note.textContent.replace(/\s*·\s*built by Fieldcraft\s*$/, '').trim() : 'Sample portfolio';

  var el = function (tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; };
  var left = el('div', 'fc-left');
  var back = el('a', 'fc-back', '<span aria-hidden="true">&larr;</span><span class="fc-back-long">Back to ' +
    from.label.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</span><span class="fc-back-short">Back</span>');
  back.href = from.href;
  left.appendChild(back);
  left.appendChild(el('span', 'fc-note', '<strong>' + noteText.split('·')[0].trim() + '</strong>' +
    (noteText.indexOf('·') > -1 ? '<span> · ' + noteText.split('·').slice(1).join('·').trim() + '</span>' : '')));

  var right = el('div', 'fc-right');
  if (slot) right.appendChild(slot);
  if (from.label !== 'All portfolios') {
    var all = el('a', 'fc-link fc-all', 'All portfolios'); all.href = gallery; right.appendChild(all);
  }
  if (cv) { cv.className = 'fc-link fc-cv'; cv.textContent = 'View the CV'; right.appendChild(cv); }
  if (use) { use.classList.add('fc-get'); use.innerHTML = '<span class="fc-get-long">Get this look</span><span class="fc-get-short">Get yours</span> <span aria-hidden="true">&rarr;</span>'; right.appendChild(use); }

  bar.textContent = '';
  bar.classList.add('fc-bar');
  bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', 'Sample portfolio');
  bar.appendChild(left); bar.appendChild(right);

  // ---- styles (strong enough to beat the kit's and the showcases' own) ------------
  var css = [
    'html .cvf-banner.fc-bar{position:sticky;top:0;z-index:100;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;min-height:54px;margin:0;padding:8px clamp(12px,3vw,36px);',
    'background:linear-gradient(180deg,#0B1126,#080C1C);border-bottom:1px solid rgba(94,234,212,.22);box-shadow:0 8px 24px -16px rgba(0,0,0,.7);',
    "color:#DDE3F3;font:400 13.5px/1.3 'Inter','Segoe UI',system-ui,Arial,sans-serif;letter-spacing:0;text-transform:none}",
    '.fc-bar .fc-left,.fc-bar .fc-right{display:flex;align-items:center;gap:8px 14px;min-width:0}',
    '.fc-bar .fc-right{flex-wrap:wrap;justify-content:flex-end}',
    '.fc-bar a{text-decoration:none}',
    '.fc-bar .fc-back{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 15px 0 12px;border-radius:999px;',
    'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);color:#F4F6FD;font-weight:600;white-space:nowrap;transition:border-color .15s,background .15s}',
    '.fc-bar .fc-back:hover{border-color:#5EEAD4;background:rgba(94,234,212,.1);color:#fff}',
    '.fc-bar .fc-back span[aria-hidden]{font-size:16px;line-height:1}',
    '.fc-bar .fc-back-short{display:none}',
    '.fc-bar .fc-note{color:#9AA4C4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fc-bar .fc-note strong{color:#F4F6FD;font-weight:600}',
    '.fc-bar .fc-link{color:#C7D0EA;font-weight:500;white-space:nowrap}',
    '.fc-bar .fc-link:hover{color:#5EEAD4}',
    '.fc-bar .fc-get{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border-radius:999px;background:#5EEAD4;color:#04221E!important;font-weight:600;white-space:nowrap;box-shadow:0 0 22px -6px rgba(94,234,212,.7)}',
    '.fc-bar .fc-get:hover{background:#7FF3E0;text-decoration:none}',
    '.fc-bar .pk-theme-slot{display:inline-flex;align-items:center;gap:8px;color:#9AA4C4}',
    '.fc-bar .pk-theme-slot label{font-weight:500}',
    '.fc-bar select{height:36px;border-radius:999px}',
    '@media (min-width:761px){html .cvf-banner.fc-bar{height:54px;flex-wrap:nowrap}}',
    '@media (max-width:1180px){.fc-bar .fc-all{display:none}}',
    '@media (max-width:1040px){.fc-bar .fc-note span{display:none}}',
    '@media (max-width:900px){.fc-bar .fc-note{display:none}}',
    '@media (max-width:760px){html .cvf-banner.fc-bar{position:relative;flex-wrap:nowrap;gap:8px;padding:8px 12px}',
    '.fc-bar .fc-back-long,.fc-bar .fc-note,.fc-bar .fc-all,.fc-bar .pk-theme-slot label{display:none}',
    '.fc-bar .fc-back-short{display:inline}.fc-bar .fc-right{flex-wrap:nowrap;gap:8px}',
    '.fc-bar .fc-back,.fc-bar .fc-get,.fc-bar select{height:34px}.fc-bar .fc-get{padding:0 13px}}',
    '.fc-bar .fc-get-short{display:none}',
    '@media (max-width:560px){.fc-bar .fc-cv{display:none}.fc-bar .fc-get-long{display:none}.fc-bar .fc-get-short{display:inline}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
