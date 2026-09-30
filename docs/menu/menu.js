/* Fieldcraft QR menu — one engine for every restaurant.

   A restaurant's page (docs/menu/<slug>/index.html) sets window.MENU and
   loads this file. Everything the guest sees is built from that data:
   languages, categories, dishes, veg / non-veg / egg marks, tags and prices.
   Changing a price means editing the data; the QR on the tables never changes.

   MENU = {
     name, tagline, theme: { brand, ink, paper, card },
     languages: ['en','hi','mr'],            // first is the default
     info: { hours, address, phone, wifi },  // all optional
     demo: true,                             // shows the "sample menu" strip
     categories: [{ id, name: {en,hi,mr}, note: {…}, group: 'food', items: [
       { name: {en,hi,mr} | 'text', desc: {…} | 'text', price: 180 | '180 / 240',
         sizes: ['30 ml', '60 ml'],            // optional: one label per price
         type: 'veg' | 'nonveg' | 'egg' | 'none', // 'none' = no mark (drinks)
         tags: ['best','spicy','new','chef','jain','signature','zero'],
         img: 'img/dish.jpg' }                 // optional square-ish thumbnail
     ]}],
     // optional extras
     groups: [{ id: 'food', name: {…} }, { id: 'bar', name: {…} }],  // top-level switch
     notice: {…},        // a strip under the header (happy hours, "kitchen closes at…")
     cover: 'photo.jpg', // a photo behind the header
     footerNote: {…},    // e.g. responsible drinking
     photoCredits: 'img/credits.html' // link to photo attributions
   }
*/
(function () {
  'use strict';
  var M = window.MENU;
  if (!M) return;

  var UI = {
    en: { search: 'Search the menu', veg: 'Veg only', none: 'No dishes match. Try another word.',
          best: 'Bestseller', spicy: 'Spicy', new: 'New', chef: "Chef's pick", jain: 'Jain available',
          signature: 'Signature', zero: 'Zero-proof', search_all: 'Searching the whole menu',
          prices: 'Prices in ₹. Taxes as applicable.', allergy: 'Please tell our staff about any allergies.',
          call: 'Call', hours: 'Open', wifi: 'Wi-Fi', by: 'Menu by Fieldcraft', items: 'dishes', photos: 'Dish photo credits',
          vegMark: 'Vegetarian', nonvegMark: 'Non-vegetarian', eggMark: 'Contains egg', clear: 'Clear',
          demo: 'Sample menu for a made-up restaurant', demoCta: 'Get one for your restaurant', lang: 'Language' },
    hi: { search: 'मेन्यू में खोजें', veg: 'केवल शाकाहारी', none: 'कोई डिश नहीं मिली। कोई और शब्द आज़माएँ।',
          best: 'बेस्टसेलर', spicy: 'तीखा', new: 'नया', chef: 'शेफ़ की पसंद', jain: 'जैन उपलब्ध',
          signature: 'सिग्नेचर', zero: 'बिना अल्कोहल', search_all: 'पूरे मेन्यू में खोज',
          prices: 'कीमतें ₹ में। कर लागू।', allergy: 'किसी भी एलर्जी के बारे में हमारे स्टाफ़ को बताएँ।',
          call: 'कॉल करें', hours: 'खुला', wifi: 'वाई-फ़ाई', by: 'मेन्यू: Fieldcraft', items: 'डिश', photos: 'डिश फ़ोटो क्रेडिट',
          vegMark: 'शाकाहारी', nonvegMark: 'मांसाहारी', eggMark: 'अंडा युक्त', clear: 'हटाएँ',
          demo: 'एक काल्पनिक रेस्टोरेंट का सैंपल मेन्यू', demoCta: 'अपने रेस्टोरेंट के लिए बनवाएँ', lang: 'भाषा' },
    mr: { search: 'मेनूमध्ये शोधा', veg: 'फक्त शाकाहारी', none: 'एकही पदार्थ सापडला नाही. दुसरा शब्द वापरून पाहा.',
          best: 'बेस्टसेलर', spicy: 'तिखट', new: 'नवीन', chef: 'शेफची निवड', jain: 'जैन उपलब्ध',
          signature: 'सिग्नेचर', zero: 'अल्कोहोलशिवाय', search_all: 'संपूर्ण मेनूमध्ये शोध',
          prices: 'किमती ₹ मध्ये. कर लागू.', allergy: 'कोणत्याही ॲलर्जीबद्दल आमच्या कर्मचाऱ्यांना सांगा.',
          call: 'कॉल करा', hours: 'सुरू', wifi: 'वाय-फाय', by: 'मेनू: Fieldcraft', items: 'पदार्थ', photos: 'फोटो श्रेय',
          vegMark: 'शाकाहारी', nonvegMark: 'मांसाहारी', eggMark: 'अंडे असलेले', clear: 'काढा',
          demo: 'एका काल्पनिक रेस्टॉरंटचा नमुना मेनू', demoCta: 'तुमच्या रेस्टॉरंटसाठी बनवा', lang: 'भाषा' }
  };
  var LANG_LABEL = { en: 'EN', hi: 'हिं', mr: 'मरा' };
  var LANG_NAME = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };

  var langs = (M.languages || ['en']).filter(function (l) { return UI[l]; });
  var KEY = 'fc-menu-lang:' + location.pathname;
  var groups = M.groups && M.groups.length > 1 ? M.groups : null;
  var state = { lang: langs[0], veg: false, q: '', group: groups ? groups[0].id : null };
  try {
    var g = (location.hash.match(/^#(?:g-)?(\w+)$/) || [])[1];
    if (groups && groups.some(function (x) { return x.id === g; })) state.group = g;
  } catch (e) { /* default group */ }
  try {
    var asked = new URLSearchParams(location.search).get('lang');
    var saved = localStorage.getItem(KEY);
    if (langs.indexOf(asked) > -1) state.lang = asked;
    else if (langs.indexOf(saved) > -1) state.lang = saved;
  } catch (e) { /* storage blocked: default language */ }

  // ---- helpers -------------------------------------------------------------
  var t = function (v) {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return v[state.lang] || v.en || '';
  };
  var u = function (k) { return (UI[state.lang] || UI.en)[k]; };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var price = function (p, sizes) {
    // "480 / kg" keeps its unit; only the numbers get a rupee sign
    var list = String(p).split('/').map(function (x) { x = x.trim(); return /^\d/.test(x) ? '₹' + x : x; });
    if (sizes && sizes.length === list.length && list.length > 1) {
      return list.map(function (x, i) { return '<span class="mn-size"><small>' + esc(t(sizes[i])) + '</small>' + x + '</span>'; }).join('');
    }
    return esc(list.join(' / '));
  };
  // Every language of a dish, so "paneer" finds पनीर and the other way round.
  var haystack = function (it) {
    var parts = [];
    [it.name, it.desc].forEach(function (v) {
      if (!v) return;
      if (typeof v === 'string') parts.push(v); else Object.keys(v).forEach(function (k) { parts.push(v[k]); });
    });
    return parts.join(' ').toLowerCase();
  };

  // ---- theme -----------------------------------------------------------------
  var th = M.theme || {};
  var root = document.documentElement.style;
  if (th.brand) root.setProperty('--brand', th.brand);
  if (th.ink) root.setProperty('--ink', th.ink);
  if (th.paper) root.setProperty('--paper', th.paper);
  if (th.card) root.setProperty('--card', th.card);
  if (th.accent) root.setProperty('--accent', th.accent);
  if (th.muted) root.setProperty('--muted', th.muted);
  if (th.line) root.setProperty('--line', th.line);
  if (th.dark) document.documentElement.classList.add('mn-dark');

  // ---- skeleton -----------------------------------------------------------------
  var app = document.getElementById('menu') || document.body.appendChild(el('div'));
  app.className = 'mn';
  app.innerHTML = '';

  var demo = null;
  if (M.demo) {
    demo = el('a', 'mn-demo');
    demo.href = M.demoLink || '../../business.html#qr-menu';
    app.appendChild(demo);
  }

  var head = el('header', 'mn-head');
  var brand = el('div', 'mn-brand');
  var langBox = el('div', 'mn-langs');
  langBox.setAttribute('role', 'group');
  var meta = el('div', 'mn-meta');
  head.appendChild(brand);
  head.appendChild(meta);
  app.appendChild(head);
  if (M.cover) {
    head.classList.add('has-cover');
    var coverUrl = String(M.cover);
    try { coverUrl = new URL(coverUrl, location.href).href; } catch (e) { /* keep as given */ }
    head.style.setProperty('--cover', 'url("' + coverUrl.replace(/["\\]/g, '') + '")');
  }
  var notice = el('p', 'mn-notice');
  notice.hidden = !M.notice;
  app.appendChild(notice);

  var tools = el('div', 'mn-tools');
  var searchWrap = el('label', 'mn-search');
  searchWrap.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var search = el('input');
  search.type = 'search';
  search.autocomplete = 'off';
  var clear = el('button', 'mn-clear');
  clear.type = 'button';
  clear.hidden = true;
  searchWrap.appendChild(search);
  searchWrap.appendChild(clear);
  var vegBtn = el('button', 'mn-vegbtn');
  vegBtn.type = 'button';
  vegBtn.setAttribute('aria-pressed', 'false');
  tools.appendChild(searchWrap);
  tools.appendChild(vegBtn);

  var tabs = el('nav', 'mn-tabs');
  var bar = el('div', 'mn-bar');   // tools + tabs stick together
  var groupBox = null;
  if (groups) {
    groupBox = el('div', 'mn-groups');
    groupBox.setAttribute('role', 'tablist');
    bar.appendChild(groupBox);
  }
  bar.appendChild(tools);
  bar.appendChild(tabs);
  app.appendChild(bar);

  var list = el('main', 'mn-list');
  app.appendChild(list);
  var empty = el('p', 'mn-empty');
  empty.hidden = true;
  app.appendChild(empty);
  var foot = el('footer', 'mn-foot');
  app.appendChild(foot);

  // ---- rendering ----------------------------------------------------------------
  function mark(type) {
    if (type === 'none') return '';
    var ty = type === 'nonveg' || type === 'egg' ? type : 'veg';
    var label = u(ty + 'Mark');
    return '<span class="mn-mark mn-' + ty + '" role="img" aria-label="' + esc(label) + '" title="' + esc(label) + '"></span>';
  }

  function renderStatic() {
    document.documentElement.lang = state.lang === 'en' ? 'en-IN' : state.lang;
    if (demo) demo.innerHTML = '<span>' + esc(u('demo')) + '</span><strong>' + esc(u('demoCta')) + ' &rarr;</strong>';

    brand.innerHTML = (M.logo ? '<span class="mn-logo" aria-hidden="true">' + M.logo + '</span>' : '') +
      '<div><h1>' + esc(t(M.name)) + '</h1>' + (M.tagline ? '<p>' + esc(t(M.tagline)) + '</p>' : '') + '</div>';

    langBox.setAttribute('aria-label', u('lang'));
    langBox.innerHTML = langs.length > 1 ? langs.map(function (l) {
      return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === state.lang) + '" title="' + LANG_NAME[l] + '" lang="' + l + '">' + LANG_LABEL[l] + '</button>';
    }).join('') : '';
    brand.appendChild(langBox);

    var info = M.info || {}, bits = [];
    if (info.hours) bits.push('<span><b>' + esc(u('hours')) + '</b> ' + esc(t(info.hours)) + '</span>');
    if (info.address) bits.push('<span>' + esc(t(info.address)) + '</span>');
    if (info.wifi) bits.push('<span><b>' + esc(u('wifi')) + '</b> ' + esc(t(info.wifi)) + '</span>');
    meta.innerHTML = bits.join('<i aria-hidden="true">·</i>') +
      (info.phone ? '<a class="mn-call" href="tel:' + esc(info.phone.replace(/\s+/g, '')) + '">' + esc(u('call')) + '</a>' : '');
    meta.hidden = !meta.innerHTML;

    notice.textContent = M.notice ? t(M.notice) : '';
    if (groupBox) {
      groupBox.innerHTML = groups.map(function (g) {
        return '<button type="button" role="tab" data-group="' + esc(g.id) + '" aria-selected="' + (g.id === state.group) + '">' +
          (g.icon || '') + '<span>' + esc(t(g.name)) + '</span></button>';
      }).join('');
    }

    search.placeholder = u('search');
    search.setAttribute('aria-label', u('search'));
    clear.setAttribute('aria-label', u('clear'));
    clear.innerHTML = '&times;';
    vegBtn.innerHTML = '<span class="mn-mark mn-veg" aria-hidden="true"></span>' + esc(u('veg'));
    empty.textContent = u('none');

    foot.innerHTML =
      '<div class="mn-legend">' + mark('veg') + ' ' + esc(u('vegMark')) + '<span>' + mark('egg') + ' ' + esc(u('eggMark')) +
        '</span><span>' + mark('nonveg') + ' ' + esc(u('nonvegMark')) + '</span></div>' +
      '<p>' + esc(u('prices')) + ' ' + esc(u('allergy')) + '</p>' +
      (M.footerNote ? '<p class="mn-footnote">' + esc(t(M.footerNote)) + '</p>' : '') +
      (M.photoCredits ? '<p class="mn-footnote"><a href="' + esc(M.photoCredits) + '">' + esc(u('photos')) + '</a></p>' : '') +
      (M.hideCredit ? '' : '<a class="mn-by" href="https://fieldcraft.co.in/business.html#qr-menu" target="_blank" rel="noopener">' + esc(u('by')) + '</a>');
  }

  function renderList() {
    var q = state.q.trim().toLowerCase();
    var shown = 0;
    list.innerHTML = '';
    tabs.innerHTML = '';

    // While searching, look through every group so "beer" finds the bar from the food side.
    var inGroup = function (cat) { return !groups || q || (cat.group || groups[0].id) === state.group; };
    (M.categories || []).filter(inGroup).forEach(function (cat) {
      var items = (cat.items || []).filter(function (it) {
        if (state.veg && (it.type === 'nonveg' || it.type === 'egg')) return false;
        return !q || haystack(it).indexOf(q) > -1;
      });
      if (!items.length) return;
      shown += items.length;

      var sec = el('section', 'mn-cat');
      sec.id = 'c-' + cat.id;
      sec.innerHTML = '<h2>' + esc(t(cat.name)) + ' <small>' + items.length + '</small></h2>' +
        (cat.note ? '<p class="mn-note">' + esc(t(cat.note)) + '</p>' : '');
      var ul = el('ul', 'mn-items');
      items.forEach(function (it) {
        var tags = (it.tags || []).filter(function (x) { return u(x); }).map(function (x) {
          return '<span class="mn-tag mn-tag-' + x + '">' + esc(u(x)) + '</span>';
        }).join('');
        var li = el('li', 'mn-item' + (it.img ? ' has-img' : ''));
        li.innerHTML =
          (it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy" width="96" height="96">' : '') +
          '<div class="mn-item-main"><h3>' + mark(it.type) + '<span>' + esc(t(it.name)) + '</span></h3>' +
          (tags ? '<div class="mn-tags">' + tags + '</div>' : '') +
          (it.desc ? '<p>' + esc(t(it.desc)) + '</p>' : '') + '</div>' +
          '<span class="mn-price' + (it.sizes ? ' has-sizes' : '') + '">' + price(it.price, it.sizes) + '</span>';
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      list.appendChild(sec);

      var a = el('a', null, esc(t(cat.name)));
      a.href = '#c-' + cat.id;
      a.setAttribute('data-cat', cat.id);
      tabs.appendChild(a);
    });

    empty.hidden = shown > 0;
    // no veg filter where nothing has a veg / non-veg mark (the bar)
    var marked = (M.categories || []).filter(inGroup).some(function (cat) {
      return (cat.items || []).some(function (it) { return it.type && it.type !== 'none'; });
    });
    vegBtn.hidden = !marked;
    if (!marked && state.veg) { state.veg = false; vegBtn.setAttribute('aria-pressed', 'false'); }
    watchSections();
  }

  // ---- the category bar follows the reader ------------------------------------------
  var io = null;
  function setActive(id) {
    Array.prototype.forEach.call(tabs.children, function (a) {
      var on = a.getAttribute('data-cat') === id;
      a.classList.toggle('is-on', on);
      if (on) {
        var left = a.offsetLeft - (tabs.clientWidth - a.offsetWidth) / 2;
        tabs.scrollTo ? tabs.scrollTo({ left: left, behavior: 'smooth' }) : (tabs.scrollLeft = left);
      }
    });
  }
  function watchSections() {
    if (io) io.disconnect();
    var secs = list.querySelectorAll('.mn-cat');
    if (!secs.length) return;
    setActive(secs[0].id.slice(2));
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id.slice(2)); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(secs, function (s) { io.observe(s); });
  }
  tabs.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.pageYOffset - bar.offsetHeight - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(a.getAttribute('data-cat'));
  });

  // ---- controls --------------------------------------------------------------------
  if (groupBox) groupBox.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-group]');
    if (!b || b.getAttribute('data-group') === state.group) return;
    state.group = b.getAttribute('data-group');
    try { history.replaceState(null, '', '#' + state.group); } catch (err) { /* fine */ }
    renderStatic();
    renderList();
    // back to the top of the new list if the reader was deep in the old one
    var top = list.getBoundingClientRect().top + window.pageYOffset - bar.offsetHeight;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
  });

  langBox.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]');
    if (!b) return;
    state.lang = b.getAttribute('data-lang');
    try { localStorage.setItem(KEY, state.lang); } catch (err) { /* fine */ }
    renderStatic();
    renderList();
  });
  var timer = null;
  search.addEventListener('input', function () {
    clear.hidden = !search.value;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { state.q = search.value; renderList(); }, 120);
  });
  clear.addEventListener('click', function () {
    search.value = ''; state.q = ''; clear.hidden = true; renderList(); search.focus();
  });
  vegBtn.addEventListener('click', function () {
    state.veg = !state.veg;
    vegBtn.setAttribute('aria-pressed', String(state.veg));
    renderList();
  });

  renderStatic();
  renderList();
})();
