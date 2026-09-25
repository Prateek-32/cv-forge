/* Payment page (pay.html): a UPI QR code and app link for the amount in the URL.

   Send clients a link like
     https://fieldcraft.co.in/pay.html?amount=199&for=Resume&ref=Priya%20Sharma
   amount  the agreed price in rupees (the client can also type it)
   for     what it is for, shown on the page and in the payment note
   ref     the client's name or an order reference, carried into the note

   The UPI ID and display name come from CV_FORGE_CONTACT in site.js.
   Loaded after vendor/qrcode.js and site.js. */

(function () {
  'use strict';

  var c = window.CV_FORGE_CONTACT || {};
  var box = document.getElementById('pay-qr');
  if (!box || !c.upi || !window.qrcode) return;

  var input = document.getElementById('pay-amount');
  var open = document.getElementById('pay-open');
  var wa = document.getElementById('pay-wa');
  var forEl = document.getElementById('pay-for');
  var params = new URLSearchParams(location.search);
  var clean = function (s, n) { return String(s || '').replace(/[^\w .,&()\-ऀ-ॿ]/g, '').trim().slice(0, n); };
  var what = clean(params.get('for'), 40);
  var ref = clean(params.get('ref'), 40);

  document.getElementById('pay-upi').textContent = c.upi;
  if (what || ref) {
    forEl.textContent = [what, ref].filter(Boolean).join(' · ');
    forEl.hidden = false;
  }
  var start = parseInt(params.get('amount'), 10);
  if (start > 0 && start <= 100000) input.value = start;

  var note = ['Fieldcraft', what, ref].filter(Boolean).join(' ');
  var link = function (amount) {
    var q = 'pa=' + encodeURIComponent(c.upi).replace('%40', '@') + '&pn=' +   // apps expect a plain @ encodeURIComponent(c.upiName || 'Fieldcraft') +
            '&cu=INR&tn=' + encodeURIComponent(note);
    return 'upi://pay?' + q + (amount ? '&am=' + amount.toFixed(2) : '');
  };

  var render = function () {
    var amount = parseInt(input.value, 10);
    if (!(amount > 0 && amount <= 100000)) amount = 0;
    var url = link(amount);
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    open.href = url;
    if (c.whatsapp) {
      wa.href = 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(
        'Hi Fieldcraft, I have paid ' + (amount ? '₹' + amount : '') + (what ? ' for ' + what : '') +
        (ref ? ' (' + ref + ')' : '') + '. Sending the payment screenshot / UPI reference here.');
      wa.hidden = false;
    }
  };
  input.addEventListener('input', render);
  render();

  // the app button only makes sense on a phone; on a computer, scan the code
  if (!window.matchMedia('(max-width: 760px), (hover: none)').matches) open.hidden = true;

  document.getElementById('pay-copy').addEventListener('click', function () {
    var btn = this;
    var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(c.upi).then(done, function () {});
  });
})();
