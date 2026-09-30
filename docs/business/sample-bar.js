/* The bar on every sample business site: a way back, what this page is, and
   "Get a site like this". Each sample page includes
     <script src="sample-bar.js" data-type="Café" defer></script>
   and the bar builds itself at the top of <body>. Hidden inside previews
   (iframes), so the thumbnails on business.html show only the site. */

(function () {
  'use strict';
  if (window.self !== window.top) return;

  var me = document.currentScript || document.querySelector('script[src$="sample-bar.js"]');
  var type = (me && me.getAttribute('data-type')) || 'Business';
  var home = '../business.html';

  // "Back" goes to the page that led here when it is on this site; otherwise the gallery.
  var back = { href: home + '#samples', label: 'All business samples' };
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin && ref.pathname !== location.pathname &&
        !/\/business\/[^/]+\.html$/.test(ref.pathname)) {
      back = { href: ref.href, label: /business\.html$/.test(ref.pathname) ? 'All business samples' : 'previous page' };
    }
  } catch (e) { /* keep the default */ }

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var bar = document.createElement('div');
  bar.className = 'fcb-bar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Sample website');
  bar.innerHTML =
    '<a class="fcb-back" href="' + esc(back.href) + '"><span aria-hidden="true">&larr;</span>' +
      '<span class="fcb-long"> ' + esc(back.label) + '</span><span class="fcb-short"> Back</span></a>' +
    '<span class="fcb-note"><strong>Sample website</strong><span class="fcb-long"> &middot; ' + esc(type) +
      ' &middot; a made-up business, built by Fieldcraft</span></span>' +
    '<a class="fcb-get" href="' + home + '?type=' + encodeURIComponent(type) + '#enquire">' +
      '<span class="fcb-long">Get a site like this</span><span class="fcb-short">Get yours</span> <span aria-hidden="true">&rarr;</span></a>';

  var css = document.createElement('style');
  css.textContent = [
    '.fcb-bar{position:sticky;top:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;gap:10px 16px;',
    'min-height:52px;padding:8px clamp(12px,3vw,32px);background:linear-gradient(180deg,#0B1126,#080C1C);',
    'border-bottom:1px solid rgba(94,234,212,.22);box-shadow:0 8px 24px -16px rgba(0,0,0,.7);color:#DDE3F3;',
    "font:400 13.5px/1.3 'Segoe UI',system-ui,-apple-system,Arial,sans-serif;letter-spacing:0;text-transform:none}",
    '.fcb-bar a{text-decoration:none}',
    '.fcb-back{display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:0 12px;border:1px solid rgba(221,227,243,.22);border-radius:999px;color:#fff}',
    '.fcb-back:hover{border-color:#5EEAD4}',
    '.fcb-note{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#AEB6CC}',
    '.fcb-note strong{color:#fff;font-weight:600}',
    '.fcb-get{display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:0 14px;border-radius:999px;background:#14B8A6;color:#04201D;font-weight:600}',
    '.fcb-get:hover{background:#2DD4BF}',
    '.fcb-short{display:none}',
    '@media (max-width:640px){.fcb-long{display:none}.fcb-short{display:inline}.fcb-note{font-size:12.5px}}'
  ].join('');

  document.head.appendChild(css);
  var put = function () { document.body.insertBefore(bar, document.body.firstChild); };
  if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
})();
