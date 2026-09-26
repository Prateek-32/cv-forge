/* Free ATS resume checker (ats-checker.html).

   Reads a PDF, Word (.docx) or pasted resume in the browser, runs the checks
   an applicant tracking system cares about, and scores it. The free result
   shows the score, the categories and the top FREE_SHOWN fixes in full. Every
   other fix is shown only as a locked row: its text is never put on the page.
   The full report (all fixes, plus a person's notes) is the ₹49 review: the
   visitor sends the resume and report to the brief endpoint, pays on pay.html,
   and gets the report by email.

   Nothing leaves the browser unless the visitor asks for the full report.
   pdf.js and JSZip load from cdnjs only when a file of that type is checked. */

(function () {
  'use strict';

  var root = document.getElementById('ats');
  if (!root) return;

  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var JSZIP = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  var FREE_SHOWN = 3;
  var MAX_BYTES = 8 * 1024 * 1024;
  var PRICE = 49;
  var WEIGHT = { critical: 20, major: 9, minor: 3 };
  var SEV_RANK = { critical: 0, major: 1, minor: 2 };
  var CATS = ['Readability', 'Contact', 'Sections', 'Content', 'Keywords', 'Length & file'];

  var $ = function (id) { return document.getElementById(id); };
  var fileInput = $('ats-file'), drop = $('ats-drop'), pasteBox = $('ats-text'), jdBox = $('ats-jd');
  var goBtn = $('ats-go'), statusEl = $('ats-status'), results = $('ats-results');
  var chosen = null;           // the File being checked
  var last = null;             // the last analysis, for the full report

  var say = function (msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
  };

  // ---- loading the readers ---------------------------------------------------------
  var loaded = {};
  var loadScript = function (src) {
    if (!loaded[src]) loaded[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load the file reader. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return loaded[src];
  };
  var readBuffer = function (file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('Could not read that file.')); };
      r.readAsArrayBuffer(file);
    });
  };

  // ---- PDF: text by line, and a two-column guess --------------------------------------
  var readPdf = function (file) {
    // The worker code is loaded as a plain script, so pdf.js parses in the page
    // instead of starting a cross-origin worker — one or two pages is quick either way.
    return loadScript(PDFJS).then(function () { return loadScript(PDFJS_WORKER); }).then(function () {
      var lib = window.pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return readBuffer(file).then(function (buf) { return lib.getDocument({ data: buf }).promise; });
    }).then(function (pdf) {
      var pages = [];
      for (var i = 1; i <= pdf.numPages; i++) pages.push(i);
      var twoColRows = 0, allRows = 0;
      return pages.reduce(function (chain, n) {
        return chain.then(function (acc) {
          return pdf.getPage(n).then(function (page) {
            var width = page.getViewport({ scale: 1 }).width;
            return page.getTextContent().then(function (tc) {
              var rows = {};
              tc.items.forEach(function (it) {
                if (!it.str || !it.str.trim()) return;
                var y = Math.round(it.transform[5] / 3);
                (rows[y] = rows[y] || []).push({ x: it.transform[4], w: it.width || 0, s: it.str });
              });
              Object.keys(rows).sort(function (a, b) { return b - a; }).forEach(function (y) {
                var r = rows[y].sort(function (a, b) { return a.x - b.x; });
                allRows++;
                var line = '';
                for (var k = 0; k < r.length; k++) {
                  if (k) {
                    var gap = r[k].x - (r[k - 1].x + r[k - 1].w);
                    // a wide gap with the right-hand run starting mid-page, and not just a date
                    if (gap > width * 0.12 && r[k].x > width * 0.3 && r[k].x < width * 0.62 &&
                        !/^\s*(\w{3,9}\.? )?\d{4}|present|current/i.test(r[k].s)) twoColRows++;
                    line += gap > 3 ? ' ' : '';
                  }
                  line += r[k].s;
                }
                acc.lines.push(line);
              });
              return acc;
            });
          });
        });
      }, Promise.resolve({ lines: [] })).then(function (acc) {
        return {
          kind: 'pdf', pages: pdf.numPages, text: acc.lines.join('\n'),
          twoColumns: allRows >= 12 && twoColRows / allRows > 0.25,
          tables: 0, textBoxes: 0, images: 0, contactInHeader: false, bullets: null
        };
      });
    });
  };

  // ---- Word (.docx): text, plus what an ATS trips over ------------------------------
  var xmlText = function (xml) {
    return xml.replace(/<w:tab\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  };
  var readDocx = function (file) {
    return loadScript(JSZIP).then(function () { return readBuffer(file); })
      .then(function (buf) { return window.JSZip.loadAsync(buf); })
      .then(function (zip) {
        var main = zip.file('word/document.xml');
        if (!main) throw new Error('That does not look like a Word .docx file.');
        var extras = Object.keys(zip.files).filter(function (n) { return /^word\/(header|footer)\d*\.xml$/.test(n); });
        return Promise.all([main.async('string')].concat(extras.map(function (n) { return zip.file(n).async('string'); })));
      })
      .then(function (parts) {
        var xml = parts[0];
        var hf = parts.slice(1).map(xmlText).join('\n');
        var cols = /<w:cols\b[^>]*w:num="([2-9])"/.exec(xml);
        return {
          kind: 'docx', pages: null, text: xmlText(xml),
          twoColumns: !!cols,
          tables: (xml.match(/<w:tbl>/g) || []).length,
          textBoxes: (xml.match(/<w:txbxContent/g) || []).length,
          images: (xml.match(/<w:drawing>/g) || []).length,
          contactInHeader: /@[\w-]+\.[\w.]+|(\+?\d[\d\s-]{8,}\d)/.test(hf),
          bullets: (xml.match(/<w:numPr>/g) || []).length
        };
      });
  };

  var readPasted = function (text) {
    return Promise.resolve({ kind: 'text', pages: null, text: text, twoColumns: false, tables: 0, textBoxes: 0,
                             images: 0, contactInHeader: false, bullets: null });
  };

  // ---- the checks --------------------------------------------------------------------
  var STOP = ('a an and are as at be by for from has have in into is it its of on or our that the their them they this to was were will with you your we us who what which when where how all any can may must should would about across also more most other such than then these those not only very well work working job role team teams using use used including include years year experience strong ability able good new within per etc plus preferred required requirements responsibilities responsible candidate candidates looking join company company\'s based skills knowledge understanding').split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  var stem = function (w) { return w.replace(/(ing|ed|es|s)$/, ''); };
  var keywordsOf = function (jd) {
    var words = (jd.toLowerCase().match(/[a-z][a-z0-9+#.\-]{1,}/g) || [])
      .map(function (w) { return w.replace(/[.\-]+$/, ''); })
      .filter(function (w) { return w.length > 2 && !STOPSET[w]; });
    var count = {}, first = {};
    words.forEach(function (w, i) { count[w] = (count[w] || 0) + 1; if (!(w in first)) first[w] = i; });
    // two-word terms that appear more than once ("financial modelling", "machine learning")
    for (var i = 0; i < words.length - 1; i++) {
      var bi = words[i] + ' ' + words[i + 1];
      if ((jd.toLowerCase().split(bi).length - 1) > 1) { count[bi] = (count[bi] || 0) + 2; if (!(bi in first)) first[bi] = i; }
    }
    return Object.keys(count).sort(function (a, b) { return count[b] - count[a] || first[a] - first[b]; }).slice(0, 25);
  };

  // matched against the heading with everything but letters removed, so
  // "Work Experience", "WORK EXPERIENCE:" and "W O R K  E X P E R I E N C E" all match
  var HEAD = {
    experience: /^(professional|work|relevant|employment)?(experience|employmenthistory|workhistory)|^internships?$|^careerhistory|^employment$/,
    education: /^(education|educational|academicqualifications|academicbackground|academics$|qualifications)/,
    skills: /^(key|technical|core|professional)?(skills|competencies|expertise)|^tools|^technologies|^techstack/,
    summary: /^(professional|career|executive)?(summary|profile)$|^about$/,
    objective: /^(career)?objective/,
    projects: /^(academic|personal|key|selected)?projects?$/
  };
  var headKey = function (h) { return h.toLowerCase().replace(/[^a-z]/g, ''); };
  // letter-spaced headings come out of PDFs as "E D U C AT I O N": close them up
  var closeUp = function (l) { return /^([A-Za-z&]{1,2} ){3,}[A-Za-z&]{1,2}$/.test(l) ? l.replace(/ /g, '') : l; };
  var ODD_HEADINGS = /^(my journey|where i('| ha)ve worked|what i (know|do)|about me|toolbox|my toolkit|my story|things i('| a)m good at|who i am|my skills)/i;

  var analyse = function (doc, jd, meta) {
    var text = doc.text || '';
    var lines = text.split(/\n+/).map(function (l) { return closeUp(l.trim()); }).filter(Boolean);
    var words = (text.match(/\S+/g) || []).length;
    var lower = text.toLowerCase();
    var issues = [], passes = [];
    var add = function (id, sev, cat, title, fix) { issues.push({ id: id, sev: sev, cat: cat, title: title, fix: fix }); };
    var pass = function (cat, title) { passes.push({ cat: cat, title: title }); };

    // readability
    if (words < 40) {
      add('noText', 'critical', 'Readability', 'An ATS can barely read any text in this file',
        'It looks like a scanned image or a picture of your resume. Export it from Word or Google Docs as a text PDF or a .docx, so every word can be selected and copied.');
    } else pass('Readability', 'The text can be read by a machine');
    if (doc.twoColumns) add('columns', 'major', 'Readability', 'Two-column layout',
      'Many applicant tracking systems read straight across the page, mixing your two columns together. Move to a single column: sidebars for skills and contact details are the usual culprits.');
    else if (words >= 40) pass('Readability', 'Single-column reading order');
    if (doc.tables) add('tables', 'major', 'Readability', 'Content inside tables (' + doc.tables + ')',
      'Some systems skip or scramble text inside tables. Put your jobs, skills and education in ordinary paragraphs and bullet points instead.');
    if (doc.textBoxes) add('textboxes', 'major', 'Readability', 'Text boxes (' + doc.textBoxes + ')',
      'Text in text boxes is often skipped entirely. Move it into the body of the document.');
    if (doc.images) add('images', 'minor', 'Readability', 'Pictures or graphics in the file (' + doc.images + ')',
      'Graphics carry no readable text. Make sure nothing important is an image (name, skills, logos with text), and leave out a photo unless the employer or country expects one.');
    var glyphs = (text.match(/[-]/g) || []).length;
    if (glyphs > 3) add('glyphs', 'minor', 'Readability', 'Icon symbols that may show up as boxes',
      'Icon fonts for phone, email and location often come out as empty boxes or odd characters. Use plain words ("Phone:", "Email:") or nothing at all.');

    // contact
    var email = /[\w.+-]+@[\w-]+\.[\w.]+/.exec(text);
    if (!email && doc.contactInHeader) add('noEmail', 'critical', 'Contact', 'Email and phone only in the page header or footer',
      'Many systems ignore the Word header and footer, so your contact details may never be read. Move your name, phone and email into the first lines of the page itself.');
    else if (!email) add('noEmail', 'critical', 'Contact', 'No email address found',
      'Recruiters need an email to reach you. Put a professional address (ideally firstname.lastname@...) at the top of the page.');
    else {
      pass('Contact', 'Email address found');
      if (/(cool|cute|sexy|king|queen|rockstar|babe|hot|angel|devil|lover|sweet)/i.test(email[0].split('@')[0]))
        add('email', 'minor', 'Contact', 'Email address may look unprofessional',
          'Use a plain address built from your name, such as firstname.lastname@gmail.com.');
    }
    // any run of digits, spaces, dashes and brackets holding 10–13 digits, e.g.
    // 9876543210, +91 98765 43210, +44 7911 223 445, (022) 2345-6789 — but not "2019 – 2022"
    var phone = null;
    (text.match(/\+?\(?\d[\d\s().\-]{7,18}\d/g) || []).some(function (m) {
      var digits = m.replace(/\D/g, '').length;
      if (digits >= 10 && digits <= 13 && !/^(19|20)\d{2}\D+(19|20)\d{2}$/.test(m.trim())) { phone = [m.trim()]; return true; }
      return false;
    });
    if (!phone && doc.contactInHeader && !email) { /* covered by the header fix above */ }
    else if (!phone) add('noPhone', 'major', 'Contact', 'No phone number found',
      'Add a mobile number with the country code, for example +91 98765 43210.');
    else {
      pass('Contact', 'Phone number found');
      if (!/\+\d/.test(phone[0])) add('phoneCode', 'minor', 'Contact', 'Phone number without a country code',
        'Write it as +91 98765 43210. It costs nothing and matters as soon as you apply to an employer outside India or through a global system.');
    }
    if (!/linkedin\.com\/in\//i.test(text)) add('linkedin', 'minor', 'Contact', 'No LinkedIn profile link',
      'Add your LinkedIn URL (linkedin.com/in/your-name) next to your email. Recruiters check it, and it shows your profile is kept up to date.');
    else pass('Contact', 'LinkedIn profile linked');

    // sections
    var heads = lines.filter(function (l) { return l.length <= 45 && l.split(/\s+/).length <= 5; });
    var has = function (k) { return heads.some(function (h) { return HEAD[k].test(headKey(h)); }); };
    var hasExp = has('experience'), hasProj = has('projects');
    if (!hasExp && !hasProj) add('noExperience', 'major', 'Sections', 'No clear Experience section',
      'Give your work (or internships) a standard heading such as "Experience" or "Work Experience", so the system files your jobs in the right place.');
    else if (!hasExp && hasProj) add('noExperienceFresher', 'minor', 'Sections', 'No "Experience" heading (projects only)',
      'If you have internships, training or part-time work, list them under "Experience" or "Internships"; many systems look for that heading first.');
    else pass('Sections', 'Experience section found');
    if (!has('education')) add('noEducation', 'major', 'Sections', 'No clear Education section',
      'Add an "Education" heading with your degree, institution and year.');
    else pass('Sections', 'Education section found');
    if (!has('skills')) add('noSkills', 'major', 'Sections', 'No Skills section',
      'Add a "Skills" section listing your main tools and skills in plain words. Recruiters search for these terms.');
    else pass('Sections', 'Skills section found');
    if (has('objective')) add('objective', 'minor', 'Sections', 'A "Career objective" instead of a summary',
      'Objectives say what you want; recruiters want to know what you offer. Replace it with a 2–3 line summary: who you are, your strongest skills and one result.');
    else if (!has('summary')) add('noSummary', 'minor', 'Sections', 'No summary at the top',
      'A 2–3 line summary under your name tells the reader in seconds what you do and at what level.');
    else pass('Sections', 'Summary at the top');
    var odd = heads.filter(function (h) { return ODD_HEADINGS.test(h); });
    if (odd.length) add('oddHeadings', 'minor', 'Sections', 'Headings a system may not recognise ("' + odd[0] + '")',
      'Use standard names such as Summary, Experience, Education, Skills and Projects so each section is filed correctly.');

    // content
    var bulletLines = lines.filter(function (l) { return /^[•●▪◦\-–*·]\s*/.test(l) || (l.split(/\s+/).length >= 6 && /^[A-Z][a-z]+ed\b|^(Led|Built|Managed|Created|Designed|Developed|Improved|Reduced|Increased|Launched|Delivered)\b/.test(l)); });
    var pool = bulletLines.length >= 3 ? bulletLines : lines.filter(function (l) { return l.split(/\s+/).length >= 8; });
    var withNumbers = pool.filter(function (l) { return /\d|₹|%|\blakh|\bcrore/i.test(l.replace(/\b(19|20)\d{2}\b/g, '')); }).length;
    if (pool.length >= 3 && withNumbers / pool.length < 0.3) add('numbers', 'major', 'Content',
      'Few results with numbers (' + withNumbers + ' of ' + pool.length + ' points)',
      'Numbers make a point believable: team size, targets, time or money saved, customers served, marks, rankings. Aim for a figure in at least a third of your points, even an approximate one.');
    else if (pool.length >= 3) pass('Content', 'Results backed by numbers');
    var weak = (lower.match(/responsible for|duties included|worked on|helped (with|in)|involved in|tasked with|in charge of/g) || []);
    if (weak.length) add('weak', weak.length >= 3 ? 'major' : 'minor', 'Content',
      'Weak phrases such as "' + weak[0] + '" (' + weak.length + ')',
      'Start each point with an action verb and the result: "Cut invoice processing time from 5 days to 2" instead of "Responsible for invoice processing".');
    var buzz = (lower.match(/hard[- ]?working|team player|go[- ]getter|result[- ]oriented|self[- ]motivated|dynamic|synergy|detail[- ]oriented|passionate|out of the box|quick learner/g) || []);
    if (buzz.length >= 2) add('buzz', 'minor', 'Content', 'Clichés such as "' + buzz[0] + '"',
      'Every resume claims these. Cut them and show the quality through a result instead.');
    // "I led", "my team", "gave me" — not "CFA Level I" or a letter-spaced heading
    var firstPerson = (lines.join('\n').match(/\bI\s+[a-z]|\b[Mm]y\b|\bme\b/g) || []).length;
    if (firstPerson > 4) add('firstPerson', 'minor', 'Content', 'Written in the first person (' + firstPerson + ' times)',
      'Drop "I" and "my": "Led a team of 6" reads faster than "I led my team of 6".');
    var long = pool.filter(function (l) { return l.split(/\s+/).length > 35; }).length;
    if (long >= 2) add('longBullets', 'minor', 'Content', long + ' points longer than 35 words',
      'Keep each point to one or two lines: the action, how, and the result.');
    var personal = lower.match(/date of birth|\bd\.?o\.?b\b|father'?s name|mother'?s name|marital status|religion|\bcaste\b|\bgender\b|\bsex\s*:|nationality/);
    if (personal) add('personal', 'major', 'Content', 'Personal details such as "' + personal[0] + '"',
      'Date of birth, parents\' names, marital status and religion are not needed for most private-sector jobs, and can invite bias. Leave them out (a few Gulf and government applications are the exception).');
    if (/\bdeclaration\b|i hereby declare/i.test(text)) add('declaration', 'minor', 'Content', 'A "Declaration" at the end',
      'The "I hereby declare that the above information is true" line is not needed on a resume. Use the space for another result.');
    if (/references (are )?available (up)?on request/i.test(text)) add('references', 'minor', 'Content', '"References available on request"',
      'Employers assume this. Remove the line.');
    var formats = 0;
    if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? '?\d{2,4}\b/i.test(text)) formats++;
    if (/\b\d{1,2}\/\d{2,4}\b/.test(text)) formats++;
    if (/\b\d{1,2}[-.]\d{1,2}[-.]\d{2,4}\b/.test(text)) formats++;
    if (formats >= 2) add('dates', 'minor', 'Content', 'Dates written in more than one format',
      'Pick one style, such as "Jan 2023 – Mar 2025", and use it everywhere so the system reads your timeline correctly.');
    if (!/\b(19|20)\d{2}\b/.test(text) && words >= 40) add('noDates', 'minor', 'Content', 'No dates found',
      'Give each job and qualification a start and end year (and month for jobs).');

    // keywords
    var kw = null;
    if (jd && jd.trim().split(/\s+/).length >= 25) {
      var terms = keywordsOf(jd);
      var found = terms.filter(function (t) {
        return new RegExp('\\b' + t.split(' ').map(function (p) { return stem(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('\\w*\\s+') + '\\w*', 'i').test(text);
      });
      var missing = terms.filter(function (t) { return found.indexOf(t) < 0; });
      kw = { pct: Math.round(found.length / terms.length * 100), missing: missing };
      if (kw.pct < 70) add('keywords', kw.pct < 50 ? 'major' : 'minor', 'Keywords',
        'Only ' + kw.pct + '% of the job description\'s key terms appear in your resume',
        'Terms the posting uses that your resume does not: ' + missing.slice(0, 15).join(', ') +
        '. Add the ones that are true for you, in the words the posting uses — in your skills and in the points that prove them.');
      else pass('Keywords', kw.pct + '% of the job description\'s key terms are in your resume');
    }

    // length and file
    if (doc.pages && doc.pages > 2) add('long', 'major', 'Length & file', doc.pages + ' pages long',
      'Most resumes should be one page (early career) or two (experienced). Longer is right only for an academic or medical CV.');
    else if (words > 1100) add('long', 'major', 'Length & file', 'About ' + words + ' words — likely more than two pages',
      'Cut older and less relevant points. One page for early career, two at most for experienced roles.');
    else if (words >= 40) pass('Length & file', 'A sensible length');
    if (words >= 40 && words < 200) add('short', 'major', 'Length & file', 'Very little content (' + words + ' words)',
      'Add your main responsibilities and results for each role, your projects and your skills. Aim for a full page.');
    if (meta.name && /^(resume|cv|my ?resume|document|untitled|scan|img|new|final)[\s_\-\d().]*\.(pdf|docx)$/i.test(meta.name) || /final|v\d\b|copy/i.test(meta.name || ''))
      add('fileName', 'minor', 'Length & file', 'File name "' + meta.name + '"',
        'Name the file after yourself, for example Priya-Sharma-Resume.pdf, so it is easy to find in a recruiter\'s downloads.');

    // score
    issues.sort(function (a, b) { return SEV_RANK[a.sev] - SEV_RANK[b.sev]; });
    var score = 100;
    issues.forEach(function (i) { score -= WEIGHT[i.sev]; });
    score = Math.max(5, Math.min(100, score));
    var cats = CATS.map(function (c) {
      var pen = 0, n = 0;
      issues.forEach(function (i) { if (i.cat === c) { pen += WEIGHT[i.sev]; n++; } });
      return { name: c, value: Math.max(5, 100 - pen * 3), issues: n, skipped: c === 'Keywords' && !kw };
    });
    return { score: score, issues: issues, passes: passes, cats: cats, words: words, pages: doc.pages, kind: doc.kind, keywords: kw };
  };

  // ---- showing the result ---------------------------------------------------------
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var SEV_LABEL = { critical: 'Critical', major: 'Important', minor: 'Small' };

  var show = function (r) {
    last = r;
    var ring = $('ats-ring');
    ring.style.setProperty('--p', r.score);
    ring.setAttribute('data-band', r.score >= 80 ? 'good' : r.score >= 60 ? 'ok' : 'low');
    $('ats-score').textContent = r.score;
    $('ats-verdict').textContent = r.score >= 80 ? 'Strong — a few refinements left' : r.score >= 60 ? 'Readable, but costing you matches' : 'At risk of being filtered out';
    $('ats-count').textContent = r.issues.length ? r.issues.length + (r.issues.length === 1 ? ' fix' : ' fixes') + ' found' : 'No fixes found';

    $('ats-cats').innerHTML = r.cats.map(function (c) {
      return '<div class="ats-cat' + (c.skipped ? ' is-skipped' : '') + '"><span>' + esc(c.name) + '</span>' +
        '<span class="ats-bar"><i style="width:' + (c.skipped ? 0 : c.value) + '%"></i></span>' +
        '<small>' + (c.skipped ? 'Add a job description' : c.issues ? c.issues + ' to fix' : 'Good') + '</small></div>';
    }).join('');

    var free = r.issues.slice(0, FREE_SHOWN), locked = r.issues.slice(FREE_SHOWN);
    $('ats-free').innerHTML = free.length ? free.map(function (i) {
      return '<li class="ats-fix sev-' + i.sev + '"><span class="ats-tag">' + SEV_LABEL[i.sev] + ' · ' + esc(i.cat) + '</span>' +
        '<strong>' + esc(i.title) + '</strong><p>' + esc(i.fix) + '</p></li>';
    }).join('') : '<li class="ats-fix"><strong>Nothing to fix on the checks we ran.</strong><p>Nice work. A person can still catch what software can\'t — wording, order and what to cut.</p></li>';

    // locked fixes: category and severity only — the text never reaches the page
    $('ats-locked-title').textContent = locked.length + ' more ' + (locked.length === 1 ? 'fix' : 'fixes') + ' found';
    var SHOW_LOCKED = 6;
    $('ats-locked').innerHTML = locked.slice(0, SHOW_LOCKED).map(function (i, n) {
      return '<li class="sev-' + i.sev + '"><span class="ats-lock" aria-hidden="true">&#128274;</span><span class="ats-tag">' +
        SEV_LABEL[i.sev] + ' · ' + esc(i.cat) + '</span><span class="ats-blur" aria-hidden="true"></span>' +
        '<span class="sr-only">Fix ' + (n + FREE_SHOWN + 1) + ' is in the full report</span></li>';
    }).join('') + (locked.length > SHOW_LOCKED
      ? '<li class="ats-locked-more"><span class="ats-lock" aria-hidden="true">&#128274;</span><span>+ ' +
        (locked.length - SHOW_LOCKED) + ' more in the full report</span></li>' : '');
    $('ats-locked-wrap').hidden = !locked.length;
    $('ats-unlock-count').textContent = locked.length ? 'all ' + r.issues.length + ' fixes' : 'a full review';

    $('ats-passes').innerHTML = r.passes.slice(0, 8).map(function (p) { return '<li>' + esc(p.title) + '</li>'; }).join('');
    $('ats-passes-wrap').hidden = !r.passes.length;

    $('ats-tool').hidden = true;
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- the full report, as sent with an unlock request ------------------------------
  var reportText = function (r) {
    var out = ['== Free ATS check (from the website) ==',
      'File: ' + (chosen ? chosen.name : 'pasted text') + (r.pages ? ' (' + r.pages + ' pages)' : '') + ', about ' + r.words + ' words',
      'Score: ' + r.score + '/100',
      'Job description: ' + (r.keywords ? 'given, ' + r.keywords.pct + '% keyword match' : 'not given'),
      '', '-- All ' + r.issues.length + ' fixes (the visitor saw the first ' + Math.min(FREE_SHOWN, r.issues.length) + ') --'];
    r.issues.forEach(function (i, n) {
      out.push((n + 1) + '. [' + SEV_LABEL[i.sev] + ' · ' + i.cat + '] ' + i.title, '   ' + i.fix);
    });
    out.push('', '-- Working well --');
    r.passes.forEach(function (p) { out.push('- ' + p.title); });
    return out.join('\n');
  };

  // ---- wiring ---------------------------------------------------------------------
  var pick = function (f) {
    chosen = f || null;
    $('ats-file-name').textContent = f ? f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB' : '';
    drop.classList.toggle('has-file', !!f);
    say('');
  };
  fileInput.addEventListener('change', function () { pick(fileInput.files[0]); });
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) pick(e.dataTransfer.files[0]); });

  goBtn.addEventListener('click', function () {
    var f = chosen, pasted = pasteBox.value.trim();
    if (!f && pasted.split(/\s+/).length < 30) { say('Choose your resume file, or paste its text, first.', 'error'); return; }
    if (f && f.size > MAX_BYTES) { say('That file is over 8 MB. Save a smaller PDF and try again.', 'error'); return; }
    var name = f ? f.name.toLowerCase() : '';
    var read;
    if (!f) read = readPasted(pasted);
    else if (/\.pdf$/.test(name)) read = readPdf(f);
    else if (/\.docx$/.test(name)) read = readDocx(f);
    else if (/\.txt$/.test(name)) read = f.text().then(readPasted);
    else if (/\.doc$/.test(name)) { say('Old .doc files cannot be read here. Open it in Word and save as .docx or PDF, then try again.', 'error'); return; }
    else if (/\.(png|jpe?g|webp|heic)$/.test(name)) {
      read = Promise.resolve({ kind: 'image', pages: 1, text: '', twoColumns: false, tables: 0, textBoxes: 0, images: 1, contactInHeader: false });
    } else { say('Choose a PDF or Word (.docx) file.', 'error'); return; }
    goBtn.disabled = true;
    say('Reading your resume…');
    read.then(function (doc) {
      show(analyse(doc, jdBox.value, { name: f ? f.name : '' }));
      say('');
    }).catch(function (err) {
      say((err && err.message) || 'Something went wrong reading that file.', 'error');
    }).then(function () { goBtn.disabled = false; });
  });

  $('ats-again').addEventListener('click', function () {
    results.hidden = true;
    $('ats-tool').hidden = false;
    $('ats-unlock-form').hidden = false;
    $('ats-sent').hidden = true;
    pick(null); fileInput.value = '';
    $('ats-tool').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- unlock: send the resume and the full report, then pay ----------------------
  var form = $('ats-unlock-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var c = window.CV_FORGE_CONTACT || {};
    var url = c.formEndpoint;
    var st = $('ats-unlock-status');
    var btn = form.querySelector('button[type="submit"]');
    if (!url || !last) { st.textContent = 'This form is not connected yet — please email us.'; return; }
    var name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
    var report = reportText(last);
    var pasted = !chosen ? '\n\n-- Resume text (pasted) --\n' + pasteBox.value.trim().slice(0, 20000) : '';
    var data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('phone', form.elements.phone.value.trim());
    data.append('field', 'Resume review (ATS checker)');
    data.append('stage', 'Resume review ₹' + PRICE + ' — ATS checker');
    data.append('needs', 'Resume review ₹' + PRICE + ' — full ATS report + a person\'s notes');
    data.append('target', jdBox.value.trim().slice(0, 5000));
    data.append('summary', report + pasted);
    data.append('notes', report + pasted);
    data.append('userNotes', '');
    data.append('consent', 'Agreed to the terms and privacy policy');
    data.append('website', form.elements.website.value);
    btn.disabled = true;
    st.textContent = 'Sending…';
    var withFile = chosen ? readBuffer(chosen).then(function (buf) {
      var bytes = new Uint8Array(buf), bin = '';
      for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      data.append('fileData', btoa(bin));
      data.append('fileName', chosen.name);
      data.append('fileType', chosen.type || 'application/octet-stream');
    }) : Promise.resolve();
    withFile.then(function () { return fetch(url, { method: 'POST', body: data }); })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (out) {
        if (!out || out.ok === false) throw new Error((out && out.error) || 'Rejected');
        form.hidden = true;
        $('ats-pay').href = 'pay.html?service=review&ref=' + encodeURIComponent(name);
        $('ats-sent').hidden = false;
        st.textContent = '';
      })
      .catch(function (err) {
        btn.disabled = false;
        st.textContent = 'Something went wrong sending that. Please try again' + (c.email ? ', or email your resume to ' + c.email : '') + '. (' + err.message + ')';
      });
  });
})();
