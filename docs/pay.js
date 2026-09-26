/* Payment page (pay.html): choose the service, and the UPI QR code and app
   link carry that service's fixed price. There is no amount to type.

   Link straight to a service with ?service=<key>, e.g.
     https://fieldcraft.co.in/pay.html?service=cv&ref=Priya%20Sharma
   service  a key from SERVICES below (older ?amount= links pick the service
            with that exact price, if there is exactly one)
   ref      the client's name or an order reference, filled into the name box

   Prices: keep SERVICES in step with pricing.html and PRICES in assistant.js.
   The UPI ID and display name come from CV_FORGE_CONTACT in site.js.
   Loaded after vendor/qrcode.js and site.js. */

(function () {
  'use strict';

  var SERVICES = [
    ['Services', [
      ['review',    'Expert resume review',                   49],
      ['resume',    'Resume',                                 99],
      ['linkedin',  'LinkedIn rewrite',                       149],
      ['cv',        'CV (curriculum vitae)',                  199],
      ['portfolio', 'Portfolio website',                      699]
    ]],
    ['Bundles', [
      ['job-ready',   'Job Ready — resume + LinkedIn',             199],
      ['full-record', 'Full Record — resume + CV',                 249],
      ['complete',    'Complete — resume, CV, LinkedIn, portfolio', 999]
    ]],
    ['Add-ons', [
      ['domain',           'Own domain connected (add-on)',        349],
      ['portfolio-domain', 'Portfolio website + own domain',       1048],
      ['complete-domain',  'Complete bundle + own domain',         1348]
    ]]
  ];

  var c = window.CV_FORGE_CONTACT || {};
  var box = document.getElementById('pay-qr');
  var select = document.getElementById('pay-service');
  if (!box || !select || !c.upi || !window.qrcode) return;

  var byKey = {};
  SERVICES.forEach(function (g) {
    var og = document.createElement('optgroup');
    og.label = g[0];
    g[1].forEach(function (s) {
      byKey[s[0]] = { key: s[0], name: s[1], price: s[2] };
      var o = document.createElement('option');
      o.value = s[0];
      o.textContent = s[1] + ' — ₹' + s[2].toLocaleString('en-IN');
      og.appendChild(o);
    });
    select.appendChild(og);
  });

  var total = document.getElementById('pay-total');
  var nameIn = document.getElementById('pay-name');
  var choose = document.getElementById('pay-choose');
  var scan = document.querySelector('.pay-scan');
  var open = document.getElementById('pay-open');
  var wa = document.getElementById('pay-wa');
  var params = new URLSearchParams(location.search);
  var clean = function (s, n) { return String(s || '').replace(/[^\w .,&()\-ऀ-ॿ]/g, '').trim().slice(0, n); };
  var onPhone = window.matchMedia('(max-width: 760px), (hover: none)').matches;

  document.getElementById('pay-upi').textContent = c.upi;
  nameIn.value = clean(params.get('ref'), 40);

  // preselect from ?service=, or from an older ?amount= link if the price is unique
  var pick = String(params.get('service') || '').toLowerCase();
  if (!byKey[pick]) {
    var amt = parseInt(params.get('amount'), 10), hits = [];
    Object.keys(byKey).forEach(function (k) { if (byKey[k].price === amt) hits.push(k); });
    pick = hits.length === 1 ? hits[0] : '';
  }
  if (pick) select.value = pick;

  var link = function (s, ref) {
    var note = ['Fieldcraft', s.name.split(' — ')[0], ref].filter(Boolean).join(' ').slice(0, 60);
    return 'upi://pay?pa=' + encodeURIComponent(c.upi).replace('%40', '@') +   // apps expect a plain @
      '&pn=' + encodeURIComponent(c.upiName || 'Fieldcraft') +
      '&am=' + s.price.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(note);
  };

  var render = function () {
    var s = byKey[select.value];
    var ref = clean(nameIn.value, 40);
    box.hidden = scan.hidden = !s;
    choose.hidden = !!s;
    open.hidden = !s || !onPhone;       // the app button only makes sense on a phone
    if (!s) { total.textContent = '—'; wa.hidden = true; return; }

    total.textContent = s.price.toLocaleString('en-IN');
    var url = link(s, ref);
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    open.href = url;
    if (c.whatsapp) {
      wa.href = 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(
        'Hi Fieldcraft, I have paid ₹' + s.price.toLocaleString('en-IN') + ' for ' + s.name +
        (ref ? ' (' + ref + ')' : '') + '. Sending the payment screenshot / UPI reference here.');
      wa.hidden = false;
    }
    if (history.replaceState) {                   // a shareable link for this service
      var q = '?service=' + s.key + (ref ? '&ref=' + encodeURIComponent(ref) : '');
      history.replaceState(null, '', location.pathname + q);
    }
  };
  select.addEventListener('change', render);
  nameIn.addEventListener('input', render);
  render();

  document.getElementById('pay-copy').addEventListener('click', function () {
    var btn = this;
    var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(c.upi).then(done, function () {});
  });
})();
