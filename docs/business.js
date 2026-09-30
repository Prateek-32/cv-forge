/* Fieldcraft for business (business.html): QR codes drawn in the page, the
   live demo menu in the hero phone, and the quote form.

   The form posts to the same Apps Script as the student briefs (no redeploy
   needed): it lands in the main sheet with Field "BUSINESS: <type>" and
   Career stage "Business enquiry", and arrives by email like any brief. */
(function () {
  'use strict';

  // ---- QR codes -----------------------------------------------------------------
  if (window.qrcode) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-qr]'), function (box) {
      var qr = window.qrcode(0, 'M');
      qr.addData(box.getAttribute('data-qr'));
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    });
  }

  // ---- the hero phone: the real menu on computers, a picture on phones ------------
  var live = document.querySelector('iframe[data-live-src]');
  if (live && !window.matchMedia('(max-width: 900px), (hover: none)').matches) {
    live.addEventListener('load', function () { live.previousElementSibling && (live.previousElementSibling.hidden = true); });
    live.setAttribute('src', live.getAttribute('data-live-src'));
  }

  // ---- the quote form ---------------------------------------------------------------
  var form = document.getElementById('biz-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var params = new URLSearchParams(location.search);

  // Arriving from a sample site ("Get a site like this") or a service card.
  var TYPE_FROM = {
    'café': 'Café / restaurant', 'cafe': 'Café / restaurant', 'restaurant': 'Café / restaurant',
    'home bakery': 'Bakery / home kitchen', 'bakery': 'Bakery / home kitchen',
    'salon': 'Salon / beauty', 'dental clinic': 'Clinic / doctor', 'clinic': 'Clinic / doctor',
    'gym': 'Gym / fitness', 'coaching institute': 'Coaching / tuition', 'coaching': 'Coaching / tuition'
  };
  var wantType = TYPE_FROM[(params.get('type') || '').toLowerCase()];
  if (wantType) form.elements.type.value = wantType;
  var need = params.get('need');
  var ticks = { website: ['Website'], qr: ['QR menu'], both: ['Website', 'QR menu'] }[need] ||
              (params.get('type') ? ['Website'] : []);
  Array.prototype.forEach.call(form.querySelectorAll('input[name="need"]'), function (b) {
    if (ticks.indexOf(b.value) > -1) b.checked = true;
  });

  var val = function (n) { return String((form.elements[n] && form.elements[n].value) || '').trim(); };
  var needs = function () {
    return Array.prototype.filter.call(form.querySelectorAll('input[name="need"]'), function (b) { return b.checked; })
      .map(function (b) { return b.value; });
  };
  var say = function (msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  };

  // Keep the WhatsApp button's message in step with what they have typed.
  var wa = document.getElementById('bz-wa');
  var waNumber = (window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.whatsapp) || '919636479447';
  var syncWa = function () {
    if (!wa) return;
    var bits = ['Hi Fieldcraft, I would like a quote'];
    var what = needs().filter(function (n) { return n !== 'Not sure yet'; })
      .map(function (n) { return n === 'Website' ? 'website' : n; });
    if (what.length) bits[0] += ' for a ' + what.join(' and a ');
    if (val('business')) bits.push('Business: ' + val('business') + ' (' + val('type') + (val('area') ? ', ' + val('area') : '') + ')');
    wa.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(bits.join('\n'));
  };
  form.addEventListener('input', syncWa);
  form.addEventListener('change', syncWa);
  syncWa();

  var SENT_KEY = 'fc-biz-sent';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var missing = ['name', 'business', 'phone'].filter(function (n) { return !val(n); });
    if (missing.length) {
      say('Please fill in your name, business name and WhatsApp number.', 'error');
      form.elements[missing[0]].focus();
      return;
    }
    if (val('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('email'))) {
      say('That email address does not look right — or leave it empty.', 'error');
      form.elements.email.focus();
      return;
    }
    var url = window.CV_FORGE_CONTACT && CV_FORGE_CONTACT.formEndpoint;
    if (!url) { say('This form is not connected. Please WhatsApp us instead.', 'error'); return; }

    var what = needs();
    var summary = [
      'BUSINESS ENQUIRY',
      'Business: ' + val('business'),
      'Type:     ' + val('type'),
      'Area:     ' + (val('area') || '—'),
      'Needs:    ' + (what.join(', ') || 'Not said'),
      'WhatsApp: ' + val('phone'),
      'Email:    ' + (val('email') || '—'),
      '',
      'Notes:',
      val('notes') || '—'
    ].join('\n');

    var print = [val('business'), val('phone'), what.join(','), val('notes')].join('|');
    try {
      if (localStorage.getItem(SENT_KEY) === print) {
        say('We already have this — we will WhatsApp you soon. Changed something? Edit it and send again.', 'ok');
        return;
      }
    } catch (err) { /* storage blocked */ }

    var data = new FormData();
    data.append('name', val('name'));
    data.append('email', val('email'));
    data.append('phone', val('phone'));
    data.append('contactBy', 'WhatsApp');
    data.append('location', val('area'));
    data.append('field', 'BUSINESS: ' + val('type'));
    data.append('stage', 'Business enquiry');
    data.append('needs', (what.join(', ') || 'Not said') + ' | ' + val('business'));
    data.append('target', val('business') + ' — ' + val('type') + (val('area') ? ', ' + val('area') : ''));
    data.append('userNotes', val('notes'));
    data.append('summary', summary);
    data.append('notes', summary);
    data.append('website', val('website'));   // honeypot

    button.disabled = true;
    say('Sending…');
    fetch(url, { method: 'POST', body: data })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (out) {
        if (!out || out.ok === false) throw new Error(out && out.error ? out.error : 'Rejected');
        try { localStorage.setItem(SENT_KEY, print); } catch (err) { /* fine */ }
        form.innerHTML =
          '<span class="eyebrow">Received</span>' +
          '<h3 style="font-size:clamp(22px,2.4vw,28px);margin:0;">Thank you — we have your details.</h3>' +
          '<p>We will WhatsApp you on ' + val('phone').replace(/[<>&]/g, '') + ' with a fixed price, usually the same day.</p>' +
          '<p class="hint">Nothing is charged until you approve it.</p>';
      })
      .catch(function (err) {
        button.disabled = false;
        say('Something went wrong sending that — your answers are still here. Try again, or tap “WhatsApp us”. (' + err.message + ')', 'error');
      });
  });
})();
