/* Fieldcraft — site assistant.

   A rule-based helper, not an AI model: it matches the visitor's words to a
   fixed set of topics and answers only with what the site already states.
   That keeps it free, instant and honest — it cannot invent a policy. Anything
   it cannot answer goes to a person (WhatsApp or email).

   Prices live in PRICES below; keep them in step with pricing.html.
   On the business page (html.biz) it answers from BIZ_TOPICS instead, with
   BIZ_PRICES; keep those in step with the Prices section of business.html.
   Contact details come from CV_FORGE_CONTACT in site.js, which loads first. */

(function () {
  'use strict';

  var C = window.CV_FORGE_CONTACT || {};
  var R = '&#8377;';
  var PRICES = {
    health: 49, resume: 99, cv: 199, linkedin: 149, portfolio: 699, domain: 349,
    jobReady: 199, fullRecord: 249, complete: 999
  };

  var wa = (C.whatsapp || '').replace(/\D/g, '');
  var waHref = wa ? 'https://wa.me/' + wa + '?text=' +
    encodeURIComponent('Hi Fieldcraft, I have a question.') : '';

  // ------------------------------------------------------------------
  // What it knows. keys: words or phrases that point at the topic.
  // Phrases (with a space) score higher than single words, so
  // "career change" beats "change" and "first job" beats "job".
  // ------------------------------------------------------------------

  var fieldLinks =
    '<a href="finance.html">Finance</a>, <a href="sales.html">Sales &amp; marketing</a>, ' +
    '<a href="law.html">Law</a>, <a href="consulting.html">Consulting</a>, ' +
    '<a href="engineering.html">Engineering</a>, <a href="data.html">Data &amp; analytics</a>, ' +
    '<a href="trades.html">Skilled trades</a>, <a href="creative.html">Design</a>, <a href="art.html">Art &amp; photography</a>, ' +
    '<a href="film.html">Film &amp; performance</a>, <a href="writing.html">Writing &amp; media</a>, ' +
    '<a href="healthcare.html">Healthcare</a>, <a href="teaching.html">Teaching</a> and ' +
    '<a href="academia.html">Academia</a>';

  var TOPICS = [
    { id: 'greet', keys: ['hi', 'hello', 'hey', 'hii', 'namaste', 'good morning', 'good evening', 'good afternoon'],
      answer: function () { return 'Hi! I can help with prices, turnaround, how it works, portfolios, or raising an issue. What would you like to know?'; },
      chips: ['prices', 'process', 'turnaround', 'issue'] },

    { id: 'thanks', keys: ['thanks', 'thank', 'thx', 'ty', 'dhanyavad', 'shukriya', 'great', 'awesome', 'perfect', 'ok thanks'],
      answer: function () { return 'Happy to help. When you are ready, the brief takes about ten minutes and nothing is charged until you agree the price.'; },
      chips: ['start', 'contact'] },

    { id: 'resume', keys: ['resume', 'one page', 'one-page'],
      answer: function () {
        return 'The <strong>resume</strong> is ' + R + PRICES.resume + ' at launch: your one-page resume rebuilt on the structure your field uses — reordered, tightened and ATS-safe, as a PDF and an editable DOCX, with one revision round included.';
      },
      chips: ['cvvs', 'turnaround', 'start'] },

    { id: 'cvvs', keys: ['cv', 'difference', 'resume or cv', 'cv or resume', 'resume vs cv', 'cv vs resume', 'curriculum vitae', 'which one', 'long form'],
      answer: function () {
        return 'A <strong>resume</strong> (' + R + PRICES.resume + ') is one page, built for a recruiter who reads it in seconds. A <strong>CV</strong> (' + R + PRICES.cv + ') is the long-form record — publications, grants, clinical hours, licences — for academic, medical and legal applications. Not sure? The <a href="sample-cvs.html">sample CVs</a> show both, or the Full Record bundle gives you both for ' + R + PRICES.fullRecord + '.';
      },
      chips: ['samples', 'bundles'] },

    { id: 'artists', keys: ['artist', 'painter', 'painting', 'paintings', 'resin', 'photographer', 'photography', 'textile', 'fabric painting', 'saree', 'illustrator', 'handmade', 'artwork', 'my art'],
      answer: function () {
        return 'Yes — we build for <strong>artists and photographers</strong>: painters, resin artists, fabric and textile artists, photographers and makers. The <strong>portfolio site</strong> (' + R + PRICES.portfolio + ') shows your work large in a gallery that opens full screen, grouped into series with title, medium, size and Sold / Available; the artist CV (' + R + PRICES.cv + ') lists shows, commissions and sales. See <a href="art.html">Art &amp; Photography</a> for four sample portfolios — a painter, a resin artist, a fabric painter and a photographer.';
      },
      chips: ['pfthemes', 'portfolio', 'start'] },

    { id: 'portfolio', keys: ['portfolio', 'website', 'personal site', 'webpage', 'web page', 'my site'],
      answer: function () {
        return 'The <strong>portfolio site</strong> is ' + R + PRICES.portfolio + ' at launch: a one-page site for your work, built from the material you send, fast on a phone, and put live on free hosting in your name within 3–5 days. There are <strong>twelve themes</strong> plus four showcase designs — <a href="sample-portfolios.html#themes">try any theme on thirty-one sample portfolios</a>, then send the <a href="start.html?type=portfolio">portfolio brief</a>. It asks for your projects, links, files and the theme you like, so we rarely need to come back with questions.';
      },
      chips: ['pfthemes', 'hosting', 'domain', 'start'] },

    { id: 'pfthemes', keys: ['portfolio theme', 'portfolio themes', 'portfolio template', 'portfolio templates', 'portfolio design', 'portfolio designs',
                             'portfolio look', 'portfolio style', 'website theme', 'website template', 'website design', 'site design', 'site theme',
                             'theme for my portfolio', 'themes for portfolio'],
      answer: function () {
        return 'Portfolio sites come in <strong>twelve themes</strong>: clean and professional (Paper, Clinic, Sidebar, Swiss), bold and expressive (Brutal, Pastel, Gallery, Atelier) and dark and dramatic (Aurora, Noir, Console, Darkroom) — or one of four showcase designs. All are the same price, and any theme can take your own colours. <a href="sample-portfolios.html#themes">Try every theme on a real sample</a>, then pick one on the <a href="start.html?type=portfolio">portfolio brief</a> — or let us choose for your field.';
      },
      chips: ['portfolio', 'start'] },

    { id: 'hosting', keys: ['host', 'hosting', 'hosted', 'server', 'netlify', 'github', 'put live', 'go live', 'yearly fee', 'maintenance'],
      answer: function () {
        return 'We build your portfolio and put it live on a <strong>free hosting account in your name</strong>, so you own it and there is no yearly fee to us. It gets a free web address straight away. We deliberately do not host sites ourselves, so yours never depends on us.';
      },
      chips: ['domain', 'portfolio'] },

    { id: 'domain', keys: ['domain', 'custom url', 'own url', 'web address', 'dot com', '.com', 'yourname com'],
      answer: function () {
        return 'A custom domain (like yourname.com) is optional. You buy it in your own name and renew it with the registrar directly; we connect it to your portfolio for <strong>' + R + PRICES.domain + '</strong>. Choose "My own domain" in the last step of the <a href="start.html?type=portfolio">portfolio brief</a>.';
      },
      chips: ['hosting', 'prices'] },

    { id: 'linkedin', keys: ['linkedin', 'linked in', 'profile rewrite', 'headline', 'about section'],
      answer: function () {
        return 'The <strong>LinkedIn rewrite</strong> is ' + R + PRICES.linkedin + ' at launch: headline, About and role summaries rewritten to match your resume, written to be searched as well as read, delivered as text you paste in. With a resume it is the Job Ready bundle, ' + R + PRICES.jobReady + '.';
      },
      chips: ['bundles', 'start'] },

    { id: 'health', keys: ['health check', 'review my resume', 'check my resume', 'feedback', 'audit', 'critique', 'just review', 'ats check', 'ats checker', 'ats score', 'resume score', 'resume checker', 'expert review'],
      answer: function () {
        return 'Start with the <a href="ats-checker.html">free ATS resume checker</a>: upload your resume and get a score and your top fixes in seconds, in your browser. The <strong>expert resume review</strong> (' + R + PRICES.health + ') unlocks every fix plus notes from a person on structure, ordering and wording, emailed within 24 hours. No rewriting — you make the changes.';
      },
      chips: ['resume', 'prices'] },

    { id: 'bundles', keys: ['bundle', 'bundles', 'combo', 'package', 'together', 'complete set', 'job ready', 'full record', 'everything'],
      answer: function () {
        return 'Bundles, at launch:<br>• <strong>Job Ready</strong> — resume + LinkedIn, ' + R + PRICES.jobReady + ' (saves ' + R + '49)<br>• <strong>Full Record</strong> — resume + CV, ' + R + PRICES.fullRecord + ' (saves ' + R + '49)<br>• <strong>Complete</strong> — resume, CV, LinkedIn and portfolio, ' + R + PRICES.complete + ' (saves ' + R + '147)';
      },
      chips: ['prices', 'start'] },

    { id: 'discount', keys: ['discount', 'coupon', 'offer', 'promo', 'promo code', 'cheaper', 'negotiate', 'less price', 'student discount', 'launch'],
      answer: function () {
        return 'The launch prices <em>are</em> the discount — they apply to the first 25 clients, and the struck-through figures on the <a href="pricing.html">pricing page</a> are what they go back to afterwards. Ordering several things? A bundle saves up to ' + R + '147.';
      },
      chips: ['bundles', 'prices'] },

    { id: 'prices', keys: ['price', 'prices', 'pricing', 'cost', 'costs', 'charge', 'charges', 'fee', 'fees', 'rate', 'rates', 'how much', 'kitna', 'kitne', 'paisa', 'paise', 'rupees', 'budget', 'expensive', 'afford'],
      answer: function () {
        return 'Launch prices (first 25 clients):<br>• Expert resume review — ' + R + PRICES.health + ' (the ATS checker is free)' +
          '<br>• Resume — ' + R + PRICES.resume + '<br>• CV — ' + R + PRICES.cv +
          '<br>• LinkedIn rewrite — ' + R + PRICES.linkedin + '<br>• Portfolio site — ' + R + PRICES.portfolio +
          '<br>• Custom domain setup — +' + R + PRICES.domain +
          '<br>Bundles from ' + R + PRICES.jobReady + '. One revision is included in each. <a href="pricing.html">Full pricing</a>';
      },
      chips: ['bundles', 'turnaround', 'payment'] },

    { id: 'deadline', keys: ['deadline', 'urgent', 'asap', 'rush', 'emergency', 'interview tomorrow', 'need it today',
                             'need it tomorrow', 'by tomorrow', 'by today', 'same day', 'kal tak'],
      answer: function () {
        return 'Pick "When do you need it?" on the <a href="start.html">brief</a> and add the date. We confirm the price and deadline by email before anything starts, and files normally come back within 24 hours of payment.';
      },
      chips: ['start', 'contact'] },

    { id: 'turnaround', keys: ['how long', 'turnaround', 'time', 'fast', 'quick', 'when', 'deliver', 'delivery', 'days', 'hours', '24', 'kab', 'jaldi', 'kitne din', 'ready',
                               'milega', 'milegi', 'kab tak', 'how soon', 'get it'],
      answer: function () {
        return 'Your files come back <strong>within 24 hours of payment</strong>. The order is: you send the brief → we confirm price and deadline by email → you pay → files within 24 hours. <strong>Portfolio sites</strong> go live within 3–5 days of payment and your material.';
      },
      chips: ['process', 'revisions', 'payment'] },

    { id: 'revisions', keys: ['revision', 'change', 'edit', 'modify', 'correction', 'correct', 'redo', 'not happy', 'unhappy', 'dont like', "don't like", 'mistake'],
      answer: function () {
        return '<strong>One revision round is included</strong> with every document: tell us what is wrong and we correct what we misread. Further rounds are charged. Need to request a revision now? I can help you <strong>raise it by email</strong>.';
      },
      chips: ['issue', 'contact'] },

    { id: 'payment', keys: ['pay', 'payment', 'upi', 'card', 'paytm', 'gpay', 'google pay', 'phonepe', 'bank', 'advance', 'pay first', 'invoice', 'when do i pay'],
      answer: function () {
        return 'You pay <strong>after we reply</strong>, not before. We read your brief and confirm the price, the deadline and how to pay by email — nothing is charged until you agree.';
      },
      chips: ['process', 'start'] },

    { id: 'refund', keys: ['refund', 'money back', 'cancel', 'cancellation', 'return'],
      answer: function () {
        return 'Cancel before we start work and you get a <strong>full refund</strong>; the same if we do not deliver what we agreed. Once your files or site are delivered, your included revision is how we put things right. The <a href="terms.html">terms</a> have the details. To ask for a refund or cancel, email us with your name and order details — I can raise it for you now.';
      },
      chips: ['issue', 'contact'] },

    { id: 'privacy', keys: ['privacy', 'my data', 'personal data', 'delete my data', 'delete my details', 'data safe', 'is my cv safe', 'who sees my cv', 'confidential', 'gdpr', 'dpdp'],
      answer: function () {
        return 'Your brief and files go only to Fieldcraft\'s own Google Sheet, Drive and inbox, and are used only for your order — never sold, published or shared with employers. We keep them for up to 12 months after delivery, and you can ask us to delete them at any time. The <a href="privacy.html">privacy policy</a> has everything.';
      },
      chips: ['issue', 'contact'] },

    { id: 'process', keys: ['how does it work', 'how it works', 'process', 'steps', 'procedure', 'what happens', 'next steps', 'kaise', 'how do you work'],
      answer: function () {
        return 'Three steps:<br>1. <strong>You send the brief</strong> — about ten minutes, upload what you have.<br>2. <strong>We confirm by email</strong> — price and deadline, no call.<br>3. <strong>You pay, we rebuild it</strong> — files within 24 hours, PDF and editable DOCX, one revision included.';
      },
      chips: ['send', 'start'] },

    { id: 'send', keys: ['what do i send', 'what to send', 'need from me', 'documents', 'upload', 'file size', 'attach', 'old resume', 'no resume', 'dont have a resume', "don't have a resume"],
      answer: function () {
        return 'Send whatever you already have — an old resume, rough notes, certificates or a profile export (PDF, Word or even a photo of a printout; up to 5 files, 10 MB in total). Rough notes are enough to begin. The brief then asks for the roles you are targeting, links to two or three job postings, and a few achievements with numbers — the more you add, the fewer questions we send later.';
      },
      chips: ['process', 'start'] },

    { id: 'templates', keys: ['template', 'templates', 'layout', 'style', 'theme', 'colour', 'color', 'font', 'cv design',
                              'resume design', 'choose a design', 'different design', 'how it looks', 'what it looks like'],
      answer: function () {
        return 'There are <strong>seventeen templates</strong> in four styles — traditional (Classic, Legal, Banker, Academic, Executive), contemporary (Modern, Minimal, Slate, Tech, Clinical), expressive (Creative, Studio, Editorial, Typewriter, Warm) and practical (Compact, Workwear). All are single-column, ATS-safe and included in the price. <a href="templates.html">See them on a sample from your field</a>, then pick one on the brief — or leave it on "Let us choose" and we use the one your field expects. Portfolio sites have <a href="sample-portfolios.html#themes">twelve themes</a> of their own.';
      },
      chips: ['samples', 'start'] },

    { id: 'formats', keys: ['format', 'formats', 'docx', 'word file', 'editable', 'pdf', 'deliverables', 'what do i get', 'receive', 'final files'],
      answer: function () {
        return 'Resumes and CVs come as a <strong>PDF and an editable DOCX</strong> in the same layout. The LinkedIn rewrite comes as text you paste in; the portfolio is a live site you own.';
      },
      chips: ['ats', 'revisions'] },

    { id: 'call', keys: ['call', 'phone call', 'interview me', 'meeting', 'zoom', 'google meet', 'video call', 'speak to', 'talk'],
      answer: function () {
        return 'No call or interview is needed — we work from the brief you send. If you would rather talk something through, WhatsApp is the quickest way to reach us.';
      },
      chips: ['contact', 'process'] },

    { id: 'student', keys: ['student', 'fresher', 'freshers', 'graduate', 'first job', 'internship', 'no experience', 'college', 'campus'],
      answer: function () {
        return 'Yes — choose "Student or first appointment" on the brief. For a first job we build on education, projects, internships and anything with a result. The <a href="sample-cvs.html">samples</a> include graduate and entry-level CVs.';
      },
      chips: ['samples', 'prices'] },

    { id: 'gaps', keys: ['gap', 'gaps', 'career change', 'change field', 'changing field', 'switch career', 'career break', 'break in career', 'switching'],
      answer: function () {
        return 'That is common. Mention the gap or the change of field in the "Anything we should know" box on the brief, and choose "Changing fields" as your career stage. Tell us early and we structure the page around it.';
      },
      chips: ['start', 'process'] },

    { id: 'fields', keys: ['field', 'fields', 'profession', 'professions', 'industry', 'industries', 'engineer', 'doctor', 'nurse', 'teacher', 'lawyer', 'designer', 'banker', 'analyst', 'developer', 'marketing', 'my field', 'do you do'],
      answer: function () {
        return 'We build for fourteen professions: ' + fieldLinks + '. Not listed? Choose "Another field" on the brief and describe what you do.';
      },
      chips: ['samples', 'start'] },

    { id: 'samples', keys: ['sample', 'samples', 'example', 'examples', 'your work', 'demo', 'template', 'templates', 'show me'],
      answer: function () {
        return 'There are <a href="sample-cvs.html">55 sample CVs</a> across 14 professions and <a href="sample-portfolios.html">4 sample portfolio sites</a>. All the candidates are fictional; each is built to the standard you receive.';
      },
      chips: ['portfolio', 'prices'] },

    { id: 'ats', keys: ['ats', 'applicant tracking', 'tracking system', 'parse', 'parsing', 'robot', 'shortlisting software', 'keywords'],
      answer: function () {
        return 'Every resume is single-column with standard headings and real text, so it parses cleanly in applicant tracking systems — nothing is lost on upload. The health check (' + R + PRICES.health + ') includes an ATS parse test of your current resume.';
      },
      chips: ['health', 'formats'] },

    { id: 'guarantee', keys: ['guarantee', 'guaranteed', 'get a job', 'get hired', 'placement', 'selected', 'shortlist', 'interview call', 'success rate'],
      answer: function () {
        return 'We do not guarantee interviews — anyone who promises that is selling something else. What you get is a document structured the way readers in your field expect, that parses cleanly in applicant tracking systems.';
      },
      chips: ['samples', 'ats'] },

    { id: 'invent', keys: ['invent', 'fake', 'lie', 'make up', 'exaggerate', 'add achievements', 'fake experience'],
      answer: function () {
        return 'Never. Everything on the page comes from what you send. If a line has no figure, we flag it so you can supply one.';
      },
      chips: ['send', 'process'] },

    { id: 'privacy', keys: ['privacy', 'private', 'safe', 'secure', 'confidential', 'my data', 'share my', 'delete my', 'personal information'],
      answer: function () {
        return 'Your brief is saved to a private Google Sheet and any upload to a private Google Drive folder, both in our own account — not a third-party form service. Mention anything your employer will not let you publish and we keep it out.';
      },
      chips: ['send', 'contact'] },

    { id: 'hours', keys: ['working hours', 'timing', 'timings', 'open', 'available', 'online now', 'reply time', 'response time'],
      answer: function () {
        return C.hours ? 'We reply between <strong>' + C.hours + '</strong>. WhatsApp is usually the quickest.' : 'Message us any time and we will reply as soon as we can.';
      },
      chips: ['contact'] },

    { id: 'location', keys: ['where are you', 'location', 'based', 'city', 'pune', 'india', 'abroad', 'international', 'outside india', 'country', 'uk', 'usa'],
      answer: function () {
        return 'We are based in ' + (C.city || 'India') + ' and work entirely online — you send the brief, we reply by email — so it does not matter where you are.';
      },
      chips: ['process', 'contact'] },

    { id: 'who', keys: ['who are you', 'about you', 'who writes', 'writer', 'legit', 'genuine', 'trust', 'scam', 'real company', 'reviews'],
      answer: function () {
        return 'Fieldcraft restructures resumes, CVs and portfolios on the rules of your field. We are at launch, so there are no reviews yet — instead you can read <a href="sample-cvs.html">55 complete sample CVs</a> before ordering, and nothing is charged until you agree the price by email.';
      },
      chips: ['samples', 'process'] },

    { id: 'contact', keys: ['contact', 'email', 'mail', 'whatsapp', 'phone number', 'number', 'reach you', 'talk to a person', 'human', 'person', 'agent', 'support', 'customer care', 'helpline'],
      answer: function () {
        var out = [];
        if (waHref) out.push('<a href="' + waHref + '" target="_blank" rel="noopener">WhatsApp us</a> (quickest)');
        if (C.email) out.push('email <a href="mailto:' + C.email + '">' + C.email + '</a>');
        if (C.phone) out.push('call ' + C.phone);
        return 'You can ' + (out.length ? out.join(', or ') : 'reach us from the contact details in the footer') + '.' +
          (C.hours ? ' We reply ' + C.hours + '.' : '');
      },
      chips: ['issue', 'hours'] },

    { id: 'issue', keys: ['issue', 'problem', 'complaint', 'complain', 'not received', 'didnt receive', "didn't receive", 'havent received', "haven't received",
                          'not arrived', 'have not arrived', 'not got', 'havent got', "haven't got", 'didnt get', "didn't get", 'still waiting', 'where are my files',
                          'missing', 'wrong', 'error', 'bug', 'broken', 'not working', 'raise', 'report', 'nahi mila', 'nahi aaya'],
      answer: 'ISSUE_FORM' },

    { id: 'start', keys: ['order', 'start', 'begin', 'book', 'buy', 'get started', 'place order', 'sign up', 'how do i order', 'i want', 'interested'],
      answer: function () {
        return 'Great — the <a href="start.html">brief</a> takes about ten minutes. Upload what you have, tell us the roles you are after, and we confirm price and deadline by email. Nothing is charged before you agree.';
      },
      chips: ['send', 'prices'] }
  ];

  var CHIP_LABELS = {
    prices: 'Prices', bundles: 'Bundles', turnaround: 'Turnaround', process: 'How it works',
    revisions: 'Revisions', payment: 'When do I pay?', portfolio: 'Portfolio sites', hosting: 'Hosting',
    domain: 'Custom domain', samples: 'See samples', issue: 'Raise an issue', contact: 'Talk to a person',
    start: 'Start a brief', send: 'What do I send?', cvvs: 'Resume or CV?', ats: 'ATS-safe?',
    resume: 'The resume', health: 'Free ATS check', formats: 'File formats', hours: 'Reply hours',
    templates: 'Templates', pfthemes: 'Portfolio themes'
  };

  // ------------------------------------------------------------------
  // The business side: websites and QR menus for local businesses.
  // Shares greetings, contact, hours and issues with the list above.
  // ------------------------------------------------------------------

  var BIZ = document.documentElement.classList.contains('biz');
  var BIZ_PRICES = {
    qr: 1499, qrLarge: 2499, onePage: 3999, fullSite: 6999,
    onePageQr: 4999, fullSiteQr: 7999, yearly: 799,
    founding: 999   // QR menu, for the first 5 restaurants who keep their free trial
  };
  var rs = function (n) { return R + String(n).replace(/(\d)(\d{3})$/, '$1,$2'); };

  var BIZ_TOPICS = [
    { id: 'greet', keys: ['hi', 'hello', 'hey', 'hii', 'namaste', 'namaskar', 'good morning', 'good evening', 'good afternoon'],
      answer: function () { return 'Hi! I can help with prices for QR menus and websites, the free 7-day QR menu trial, how long things take, or what happens after the first year. What would you like to know?'; },
      chips: ['bprices', 'btrial', 'bqr', 'bsite'] },

    { id: 'btrial', keys: ['trial', 'free trial', 'try', 'try it', 'try first', 'test', 'testing', 'try for free', 'free week', 'free for a week', 'before paying', 'before i pay', 'risk', 'not sure',
                           'founding', 'founding offer', '999'],
      answer: function () {
        return 'QR menus come with a <strong>free 7-day trial</strong> for the first 10 restaurants. Send your menu, we set it up in 2–3 days, and you use it on your tables for a week — no payment and no card details. ' +
          'If you keep it, the first 5 pay a founding price of <strong>' + rs(BIZ_PRICES.founding) + '</strong> instead of ' + rs(BIZ_PRICES.qr) + '. If not, you pay nothing and we take it down. ' +
          'Websites are not part of the trial, but you see a full preview before you pay. <a href="#trial">How the trial works</a>';
      },
      chips: ['bsend', 'bqr', 'bstart'] },

    { id: 'thanks', keys: ['thanks', 'thank', 'thx', 'ty', 'dhanyavad', 'shukriya', 'great', 'awesome', 'perfect', 'ok thanks'],
      answer: function () { return 'Happy to help. The <a href="#enquire">quote form</a> takes two minutes, or just WhatsApp us a photo of your menu — nothing is charged until you approve what we build.'; },
      chips: ['bstart', 'contact'] },

    { id: 'bqr', keys: ['qr', 'qr menu', 'qr code', 'digital menu', 'menu card', 'e menu', 'scan', 'scanner', 'restaurant', 'restaurants', 'cafe', 'hotel', 'dhaba', 'bar', 'pub', 'food menu'],
      answer: function () {
        return 'A <strong>QR menu</strong> is <strong>' + rs(BIZ_PRICES.qr) + ' one-time</strong> for up to about 60 dishes, or <strong>' + rs(BIZ_PRICES.qrLarge) + '</strong> for 60–150 dishes or separate food and bar menus. ' +
          'That includes English, Hindi and Marathi, veg / non-veg / egg marks, search, a table card design, and a year of updates. It is live in 2–3 days, and you can <a href="#trial">try it free for 7 days</a> first. <a href="menu/monsoon-cafe/">Try the demo menu</a>';
      },
      chips: ['btrial', 'brenew', 'bupdates', 'bstart'] },

    { id: 'bsite', keys: ['website', 'site', 'web', 'webpage', 'web page', 'online presence', 'landing page', 'business page', 'one page', 'pages'],
      answer: function () {
        return 'A <strong>one-page website</strong> is <strong>' + rs(BIZ_PRICES.onePage) + '</strong>: Call, WhatsApp and Directions buttons, your services or menu with prices, photos, hours and a map. ' +
          'A <strong>full website</strong> with up to 5 sections or pages is <strong>' + rs(BIZ_PRICES.fullSite) + '</strong>. Both are one-time and live in 5–7 days. <a href="#samples">See the sample sites</a>';
      },
      chips: ['bboth', 'bdomain', 'brenew', 'bstart'] },

    { id: 'bboth', keys: ['both', 'combo', 'bundle', 'package', 'together', 'website and menu', 'menu and website', 'site and menu', 'everything'],
      answer: function () {
        return 'Website + QR menu, one-time:<br>• One-page website + QR menu — <strong>' + rs(BIZ_PRICES.onePageQr) + '</strong><br>• Full website + QR menu — <strong>' + rs(BIZ_PRICES.fullSiteQr) + '</strong><br>' +
          'The menu lives inside your site, so one link works on the table, in your Instagram bio and on Google.';
      },
      chips: ['brenew', 'bturnaround', 'bstart'] },

    { id: 'brenew', keys: ['monthly', 'per month', 'every month', 'subscription', 'yearly', 'per year', 'annual', 'every year', 'renew', 'renewal', 'next year', 'second year',
                           'after one year', 'after a year', 'maintenance', 'hosting', 'hidden', 'extra charges', 'recurring', 'ongoing'],
      answer: function () {
        return '<strong>No monthly fee.</strong> The first year of hosting and menu updates is included. From the second year it is <strong>' + rs(BIZ_PRICES.yearly) + ' a year</strong> — not a month — for hosting and your menu and price updates on WhatsApp. ' +
          'The only other costs are optional: your own domain (about ' + R + '600–900 a year, paid to the registrar) and printing table cards (at cost).';
      },
      chips: ['bupdates', 'bdomain', 'bprices'] },

    { id: 'bprices', keys: ['price', 'prices', 'pricing', 'cost', 'costs', 'charge', 'charges', 'fee', 'fees', 'rate', 'rates', 'how much', 'kitna', 'kitne', 'kiti', 'paisa', 'paise', 'rupees', 'budget', 'expensive', 'afford'],
      answer: function () {
        return 'Launch prices, all one-time:<br>• QR menu — ' + rs(BIZ_PRICES.qr) + ' (large menus ' + rs(BIZ_PRICES.qrLarge) + ')' +
          '<br>• One-page website — ' + rs(BIZ_PRICES.onePage) + '<br>• Full website — ' + rs(BIZ_PRICES.fullSite) +
          '<br>• Website + QR menu — from ' + rs(BIZ_PRICES.onePageQr) +
          '<br>No monthly fee: the first year is included, then ' + rs(BIZ_PRICES.yearly) + ' a year.' +
          '<br>QR menus: a free 7-day trial for the first 10 restaurants. <a href="#prices">All prices</a>';
      },
      chips: ['btrial', 'brenew', 'bpayment'] },

    { id: 'bupdates', keys: ['update', 'updates', 'change price', 'change prices', 'price change', 'new dish', 'new item', 'sold out', 'edit menu', 'change menu', 'reprint', 'change', 'edit', 'modify'],
      answer: function () {
        return 'Send the change on WhatsApp — a new price, a sold-out dish, a few new items — and we update the live menu. <strong>The QR on your tables stays the same</strong>, so you never reprint. Updates are included in the first year and in the ' + rs(BIZ_PRICES.yearly) + '-a-year plan after that.';
      },
      chips: ['brenew', 'contact'] },

    { id: 'bdomain', keys: ['domain', 'dot com', '.com', '.in', 'own url', 'custom url', 'web address', 'my own address'],
      answer: function () {
        return 'Your own domain is <strong>optional</strong>. Without one, your site or menu goes on a free Fieldcraft address, like fieldcraft.co.in/menu/your-cafe. If you want yourbusiness.in or .com, you buy it in your own name — usually ' + R + '600–900 a year — and we connect it at no extra charge.';
      },
      chips: ['brenew', 'bsite'] },

    { id: 'bprint', keys: ['print', 'printing', 'table card', 'table cards', 'sticker', 'stickers', 'standee', 'tent card', 'acrylic'],
      answer: function () {
        return 'We design the <strong>table cards and stickers</strong> in your colours — that is included. Printing is at cost, or you can print them at any shop near you. <a href="menu/monsoon-cafe/table-card.html">See the sample table cards</a>';
      },
      chips: ['bqr', 'bprices'] },

    { id: 'bturnaround', keys: ['how long', 'turnaround', 'how soon', 'how fast', 'when', 'days', 'time', 'kab', 'kitne din', 'jaldi', 'urgent', 'asap', 'ready'],
      answer: function () {
        return 'A <strong>QR menu</strong> is usually live within <strong>2–3 days</strong> of getting your menu. A <strong>website</strong> takes <strong>5–7 days</strong>, depending on how quickly we get your photos and details.';
      },
      chips: ['bprocess', 'bsend', 'bstart'] },

    { id: 'bprocess', keys: ['how does it work', 'how it works', 'process', 'steps', 'procedure', 'what happens', 'next steps', 'kaise'],
      answer: function () {
        return 'Three steps:<br>1. <strong>Tell us about your business</strong> — the form or a WhatsApp with your menu or services.<br>2. <strong>We confirm the price, then send a preview</strong> to check on your own phone. Changes are included.<br>3. <strong>You approve, pay and go live</strong> — table cards included for QR menus.';
      },
      chips: ['bsend', 'bpayment', 'bstart'] },

    { id: 'bsend', keys: ['what do i send', 'what to send', 'need from me', 'photos', 'photo', 'logo', 'details needed', 'information needed', 'what do you need'],
      answer: function () {
        return 'Send your menu or list of services with prices (a photo of the printed menu is fine), your timings, address, phone and WhatsApp number, and a few photos — phone photos work. A logo helps but is not needed.';
      },
      chips: ['bprocess', 'bstart'] },

    { id: 'bpayment', keys: ['pay', 'payment', 'upi', 'gpay', 'google pay', 'phonepe', 'paytm', 'advance', 'pay first', 'when do i pay', 'invoice'],
      answer: function () {
        return 'You pay <strong>after you approve</strong>. We confirm the price first, build it, and send a preview to check on your phone. Once you are happy, you pay and we put it live. ' +
          'QR menus can go one step further: <a href="#trial">use it free on your tables for 7 days</a>, then decide.';
      },
      chips: ['btrial', 'bprocess', 'bprices'] },

    { id: 'blangs', keys: ['hindi', 'marathi', 'language', 'languages', 'english', 'bhasha', 'translate', 'translation'],
      answer: function () {
        return 'QR menus come in <strong>English, हिन्दी and मराठी</strong>. Guests switch with one tap, and a menu can open in Marathi first if your guests prefer it — like the <a href="menu/swaad-wada/">Swaad Wada sample</a>.';
      },
      chips: ['bqr', 'bsamples'] },

    { id: 'bapp', keys: ['app', 'download', 'install', 'play store', 'android', 'iphone'],
      answer: function () {
        return 'No app. Any phone camera opens the QR menu — it is a web page, so it works on Android and iPhone without installing anything.';
      },
      chips: ['bqr', 'bsamples'] },

    { id: 'border', keys: ['online order', 'online ordering', 'order online', 'delivery', 'zomato', 'swiggy', 'payment gateway', 'table booking', 'booking', 'reservation', 'reservations'],
      answer: function () {
        return 'Orders and bookings go through <strong>WhatsApp</strong>: a button opens a chat with your number and a ready-made message, such as a table booking or a cake order. Online payments and delivery apps are not part of the site.';
      },
      chips: ['bsite', 'bboth'] },

    { id: 'bgoogle', keys: ['google', 'google listing', 'google business', 'gmb', 'google maps', 'maps', 'seo', 'search results', 'instagram'],
      answer: function () {
        return 'We link your website to your existing <strong>Google listing and Instagram</strong>, and the site is built to load fast and be read by search engines. We do not set up or manage Google Business Profiles.';
      },
      chips: ['bsite', 'bprices'] },

    { id: 'bsamples', keys: ['sample', 'samples', 'example', 'examples', 'demo', 'your work', 'show me', 'portfolio'],
      answer: function () {
        return 'There are <a href="#samples">eight sample websites</a> — a café, a rooftop bar, an Irani café, a bakery, a salon, a dental clinic, a gym and a coaching class — and <a href="#menus">five sample QR menus</a>. All the businesses are made up; yours is built around your own name, photos and prices.';
      },
      chips: ['bprices', 'bstart'] },

    { id: 'bdiscount', keys: ['discount', 'coupon', 'offer', 'cheaper', 'negotiate', 'less price', 'kam', 'best price', 'reduce'],
      answer: function () {
        return '<strong>Founding offer:</strong> the first 10 restaurants get a free 7-day QR menu trial, and the first 5 who keep it pay ' + rs(BIZ_PRICES.founding) + ' instead of ' + rs(BIZ_PRICES.qr) + '. ' +
          'Beyond that, these are launch prices, already well below what menu apps (' + R + '499 or more every month) and most website designers charge — with no monthly fee. Getting a website and a QR menu together saves the most.';
      },
      chips: ['btrial', 'bboth', 'bprices'] },

    { id: 'bwho', keys: ['who are you', 'about you', 'legit', 'genuine', 'trust', 'scam', 'real company', 'reviews', 'clients', 'references'],
      answer: function () {
        return 'Fieldcraft is based in Pune and has just started building for businesses, so there are no client reviews yet. What you can do instead: open the <a href="#samples">sample sites</a> and <a href="#menus">menus</a> on your phone, see your own preview before you pay anything, or <a href="#trial">try a QR menu free for 7 days</a>.';
      },
      chips: ['bsamples', 'bpayment'] },

    { id: 'bstudent', keys: ['resume', 'cv', 'linkedin', 'job', 'jobs', 'career', 'student', 'fresher', 'my portfolio', 'personal website', 'ats'],
      answer: function () {
        return 'Resumes, CVs, LinkedIn rewrites and personal portfolio sites are on the <a href="index.html">students &amp; professionals side</a> — resumes from ' + R + PRICES.resume + ', see the <a href="pricing.html">pricing page</a>. Here it is websites and QR menus for businesses.';
      },
      chips: ['bprices', 'contact'] },

    { id: 'bstart', keys: ['order', 'start', 'begin', 'buy', 'get started', 'sign up', 'i want', 'interested', 'quote', 'lets do it', 'book'],
      answer: function () {
        return 'Great — fill the <a href="#enquire">quote form</a> (two minutes) or WhatsApp us a photo of your menu or list of services. We reply with your exact price, usually the same day.';
      },
      chips: ['bsend', 'contact'] }
  ];

  // shared with the student side
  ['hours', 'location', 'contact', 'issue'].forEach(function (id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) BIZ_TOPICS.push(TOPICS[i]);
  });

  var BIZ_LABELS = {
    bprices: 'Prices', bqr: 'QR menu', bsite: 'Website', bboth: 'Website + menu', brenew: 'Any yearly fee?',
    bupdates: 'Changing prices', bdomain: 'Own domain', bprint: 'Table cards', bturnaround: 'How long?',
    bprocess: 'How it works', bsend: 'What do I send?', bpayment: 'When do I pay?', bsamples: 'See samples',
    bstart: 'Get a quote', btrial: 'Free 7-day trial'
  };
  Object.keys(BIZ_LABELS).forEach(function (k) { CHIP_LABELS[k] = BIZ_LABELS[k]; });

  var ACTIVE = BIZ ? BIZ_TOPICS : TOPICS;
  if (BIZ) {
    // "location" on the student side talks about briefs by email
    ACTIVE = ACTIVE.map(function (t) {
      if (t.id !== 'location') return t;
      return { id: 'location', keys: t.keys, chips: ['bprocess', 'contact'], answer: function () {
        return 'We are based in ' + (C.city || 'Pune') + '. Most of it happens on WhatsApp, so you do not need to meet us — just send your menu or details.';
      } };
    });
  }

  // ------------------------------------------------------------------
  // Matching
  // ------------------------------------------------------------------

  var normalise = function (s) {
    return ' ' + String(s).toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9.\s]/g, ' ')
      .replace(/\s+/g, ' ').trim() + ' ';
  };

  // Products are what a question is about; the other topics are what it asks.
  // "When will I get my resume?" names a product but asks about turnaround,
  // so the question wins; "how much is the portfolio?" asks the price of one
  // product, so that product's own answer (which carries its price) wins.
  var PRODUCTS = BIZ ? ['bqr', 'bsite', 'bboth', 'bdomain', 'bprint', 'bstudent'] : ['resume', 'cvvs', 'portfolio', 'linkedin', 'health', 'bundles', 'domain'];
  var PRICES_ID = BIZ ? 'bprices' : 'prices';
  var SOFT = ['greet', 'thanks', PRICES_ID];

  var match = function (text) {
    var t = normalise(text);
    var words = t.trim().split(' ');
    var scored = [];
    ACTIVE.forEach(function (topic) {
      var score = 0;
      topic.keys.forEach(function (key) {
        var k = normalise(key).trim();
        if (k.indexOf(' ') > -1) {
          if (t.indexOf(' ' + k + ' ') > -1) score += 3;
        } else {
          for (var i = 0; i < words.length; i++) {
            var w = words[i];
            if (w === k || w === k + 's' || (k.length >= 5 && w.indexOf(k) === 0)) { score += 2; break; }
          }
        }
      });
      if (score >= 2) scored.push({ topic: topic, score: score });
    });
    if (!scored.length) return null;
    scored.sort(function (a, b) { return b.score - a.score; });   // stable: ties keep list order

    var top = scored[0].topic;
    var first = function (test) {
      for (var i = 0; i < scored.length; i++) if (test(scored[i].topic.id)) return scored[i].topic;
      return null;
    };
    if (PRODUCTS.indexOf(top.id) > -1) {
      return first(function (id) { return PRODUCTS.indexOf(id) < 0 && SOFT.indexOf(id) < 0; }) || top;
    }
    if (top.id === PRICES_ID) {
      return first(function (id) { return PRODUCTS.indexOf(id) > -1; }) || top;
    }
    return top;
  };

  var byId = function (id) {
    for (var i = 0; i < ACTIVE.length; i++) if (ACTIVE[i].id === id) return ACTIVE[i];
    return null;
  };

  // ------------------------------------------------------------------
  // Interface
  // ------------------------------------------------------------------

  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  var ICON_CHAT = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 3 13.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" transform="translate(.5 0)"/><circle cx="9" cy="9.6" r="1.2" fill="currentColor"/><circle cx="12.5" cy="9.6" r="1.2" fill="currentColor"/><circle cx="16" cy="9.6" r="1.2" fill="currentColor"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 12 20 4l-6 16-3-7z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>';

  document.documentElement.classList.add('has-assistant');

  var launcher = el('button', 'cfa-launch', ICON_CHAT);
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open the Fieldcraft assistant');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'cfa-panel');

  var panel = el('div', 'cfa-panel');
  panel.id = 'cfa-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Fieldcraft assistant');
  panel.innerHTML =
    '<div class="cfa-head">' +
      '<span class="cfa-avatar" aria-hidden="true">Fc</span>' +
      '<span class="cfa-title"><strong>Fieldcraft assistant</strong><span class="cfa-sub">Answers from this site · a person on WhatsApp</span></span>' +
      '<button type="button" class="cfa-close" aria-label="Close the assistant">' + ICON_CLOSE + '</button>' +
    '</div>' +
    '<div class="cfa-log" aria-live="polite"></div>' +
    '<form class="cfa-input" autocomplete="off">' +
      '<label class="sr-only" for="cfa-q">Ask a question</label>' +
      '<input id="cfa-q" type="text" placeholder="Ask about prices, turnaround…" maxlength="300">' +
      '<button type="submit" aria-label="Send">' + ICON_SEND + '</button>' +
    '</form>';

  document.body.appendChild(panel);
  document.body.appendChild(launcher);

  var log = panel.querySelector('.cfa-log');
  var form = panel.querySelector('.cfa-input');
  var input = panel.querySelector('#cfa-q');
  var started = false;
  var lastQuestion = '';

  var scrollDown = function () { log.scrollTop = log.scrollHeight; };

  var addUser = function (text) {
    var b = el('div', 'cfa-msg cfa-user');
    b.textContent = text;
    log.appendChild(b);
    scrollDown();
  };

  var addChips = function (ids) {
    if (!ids || !ids.length) return;
    var row = el('div', 'cfa-chips');
    ids.forEach(function (id) {
      if (!CHIP_LABELS[id]) return;
      var c = el('button', 'cfa-chip', CHIP_LABELS[id]);
      c.type = 'button';
      c.addEventListener('click', function () {
        row.remove();
        addUser(CHIP_LABELS[id]);
        reply(byId(id), lastQuestion);   // "Raise an issue" after "I want a refund" pre-picks refund
      });
      row.appendChild(c);
    });
    if (waHref && ids.indexOf('contact') > -1) {
      var a = el('a', 'cfa-chip cfa-chip-wa', 'WhatsApp now');
      a.href = waHref; a.target = '_blank'; a.rel = 'noopener';
      row.appendChild(a);
    }
    log.appendChild(row);
    scrollDown();
  };

  var addBot = function (html, chips) {
    var typing = el('div', 'cfa-msg cfa-bot cfa-typing', '<i></i><i></i><i></i>');
    typing.setAttribute('aria-hidden', 'true');
    log.appendChild(typing);
    scrollDown();
    window.setTimeout(function () {
      typing.remove();
      var b = el('div', 'cfa-msg cfa-bot', html);
      log.appendChild(b);
      addChips(chips);
      scrollDown();
    }, 420);
  };

  // raise an issue: a small form in the chat, sent straight to our endpoint.
  // Pre-pick the issue type from what the visitor typed.
  var guessIssue = function (q) {
    q = String(q || '').toLowerCase();
    if (/arriv|receiv|got|get|waiting|missing|mila|aaya/.test(q)) return 1;
    if (/pay|refund|money|charge|cancel/.test(q)) return 2;
    if (/site|website|page|bug|error|broken|not working|button|form/.test(q)) return 3;
    if (/revis|change|edit|wrong|mistake|correct/.test(q)) return 0;
    return 4;
  };

  var issueForm = function (q) {
    var typing = el('div', 'cfa-msg cfa-bot cfa-typing', '<i></i><i></i><i></i>');
    log.appendChild(typing);
    scrollDown();
    window.setTimeout(function () {
      typing.remove();
      log.appendChild(el('div', 'cfa-msg cfa-bot',
        'Sorry something needs sorting. Fill this in and I will send it straight to us — no email app needed.'));
      var f = el('form', 'cfa-form');
      f.innerHTML =
        '<label>Your name<input name="name" type="text" required autocomplete="name"></label>' +
        '<label>Your email<input name="email" type="email" required autocomplete="email"></label>' +
        '<label>What is it about?<select name="type">' +
          (BIZ ? '<option>A change to my site or menu</option><option>My site or menu is not live yet</option>'
               : '<option>A revision to my document</option><option>My files have not arrived</option>') +
          '<option>Payment or refund</option>' +
          '<option>Something on the website is not working</option>' +
          '<option>Something else</option></select></label>' +
        '<label>Details<textarea name="details" rows="3" required placeholder="' + (BIZ ? 'What happened, and your business name' : 'What happened, and your order or brief name if you have one') + '"></textarea></label>' +
        '<button type="submit">Send to Fieldcraft</button>' +
        '<p class="cfa-form-note" role="status" aria-live="polite"></p>';
      f.elements.type.selectedIndex = guessIssue(q);

      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        var v = function (n) { return f.elements[n].value.trim(); };
        var button = f.querySelector('button');
        var note = f.querySelector('.cfa-form-note');
        var subject = 'Issue: ' + v('type') + ' — ' + v('name');
        var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nAbout: ' + v('type') +
                   '\nPage: ' + location.href + '\n\n' + v('details') + '\n';

        // Sent straight to the Apps Script endpoint (the same one as the brief
        // form), so it reaches us without the visitor's email app. Fields are
        // mapped onto the brief's columns so it also lands with an older script.
        var data = new FormData();
        data.append('kind', 'issue');
        data.append('name', v('name'));
        data.append('email', v('email'));
        data.append('issueType', v('type'));
        data.append('details', v('details'));
        data.append('page', location.href);
        data.append('field', 'ISSUE: ' + v('type'));
        data.append('stage', 'Issue from the site assistant');
        data.append('needs', v('type'));
        data.append('target', location.href);
        data.append('notes', v('details'));
        data.append('website', '');   // honeypot, left empty

        button.disabled = true;
        button.textContent = 'Sending…';
        note.textContent = '';

        var fail = function () {
          button.disabled = false;
          button.textContent = 'Send to Fieldcraft';
          // The fallbacks carry everything, pre-filled: Gmail in the browser
          // (no mail app needed) or the default email app.
          var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(C.email || '') +
                      '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          var mailto = 'mailto:' + (C.email || '') + '?subject=' + encodeURIComponent(subject) +
                       '&body=' + encodeURIComponent(body);
          note.innerHTML = 'That did not go through. Your message is still here — send it pre-filled with ' +
            '<a href="' + gmail + '" target="_blank" rel="noopener">Gmail</a> or ' +
            '<a href="' + mailto + '">your email app</a>' +
            (waHref ? ', or <a href="' + waHref + '" target="_blank" rel="noopener">WhatsApp us</a>' : '') + '.';
          scrollDown();
        };

        if (!C.formEndpoint || !window.fetch) { fail(); return; }

        fetch(C.formEndpoint, { method: 'POST', body: data })
          .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
          .then(function (out) {
            if (!out || out.ok === false) throw new Error('rejected');
            f.remove();
            addBot('<strong>Sent ✓</strong> We have your message about "' + escapeHtml(v('type').toLowerCase()) +
                   '" and will reply to <strong>' + escapeHtml(v('email')) + '</strong>' +
                   (C.hours ? ' between ' + C.hours : ' as soon as we can') + '. Need it sooner? WhatsApp is quickest.',
                   ['contact']);
          })
          .catch(fail);
      });
      log.appendChild(f);
      scrollDown();
      f.elements.name.focus();
    }, 420);
  };

  var reply = function (topic, q) {
    if (!topic) {
      addBot('I am not sure about that one — I only answer from what is on this site. Try one of these, or ask a person:',
             BIZ ? ['bprices', 'brenew', 'bturnaround', 'contact'] : ['prices', 'turnaround', 'process', 'contact']);
      return;
    }
    if (topic.answer === 'ISSUE_FORM') { issueForm(q); return; }
    addBot(topic.answer(), topic.chips);
  };

  var open = function () {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.classList.add('is-open');
    launcher.innerHTML = ICON_CLOSE;
    launcher.setAttribute('aria-label', 'Close the assistant');
    hideTeaser();
    if (!started) {
      started = true;
      if (BIZ) {
        addBot('Hi, I am the Fieldcraft assistant. Ask me about QR menu and website prices, the free 7-day QR menu trial, how long it takes or how updates work. What can I help with?',
               ['bprices', 'btrial', 'bqr', 'bsite', 'brenew', 'bturnaround', 'contact']);
      } else {
        addBot('Hi, I am the Fieldcraft assistant. Ask me about prices, turnaround, portfolios or how it works — or raise an issue. What can I help with?',
               ['prices', 'templates', 'turnaround', 'process', 'portfolio', 'issue', 'contact']);
      }
    }
    window.setTimeout(function () { input.focus(); }, 60);
  };
  var close = function () {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.classList.remove('is-open');
    launcher.innerHTML = ICON_CHAT;
    launcher.setAttribute('aria-label', 'Open the Fieldcraft assistant');
    launcher.focus();
  };

  launcher.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
  panel.querySelector('.cfa-close').addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';
    addUser(q);
    lastQuestion = q;
    reply(match(q), q);
  });

  // a one-time nudge per visit, after the visitor has had a look around
  var teaser = null;
  var hideTeaser = function () { if (teaser) { teaser.remove(); teaser = null; } };
  var seen = false;
  try { seen = window.sessionStorage.getItem('cfa-teaser') === '1'; } catch (err) { seen = false; }
  if (!seen) {
    window.setTimeout(function () {
      if (!panel.hidden) return;
      teaser = el('div', 'cfa-teaser');
      teaser.innerHTML = '<button type="button" class="cfa-teaser-open">Questions about prices or turnaround? <strong>Ask me.</strong></button>' +
                         '<button type="button" class="cfa-teaser-x" aria-label="Dismiss">' + ICON_CLOSE + '</button>';
      teaser.querySelector('.cfa-teaser-open').addEventListener('click', open);
      teaser.querySelector('.cfa-teaser-x').addEventListener('click', hideTeaser);
      document.body.appendChild(teaser);
      try { window.sessionStorage.setItem('cfa-teaser', '1'); } catch (err) { /* private mode */ }
    }, 7000);
  }
})();
