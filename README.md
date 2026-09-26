# Fieldcraft — static site

> *Every field reads a page differently.* — formerly the working name CV Forge. The repository and the live URL keep
> `cv-forge`; renaming the repo would change the GitHub Pages address.

Static site: home, a fields index, fourteen field pages with sample CVs, pricing and the
intake form. No build step, no dependencies, no framework.

```
docs/                   The website — everything GitHub Pages serves
  index.html            Home
  fields.html           All fields, with a working filter
  sample-cvs.html       Every sample CV, grouped by field, with a field filter
                        (sample-cvs.html#finance opens on one field)
  pricing.html          Prices and bundles
  start.html            Start page, with the brief form
  academia.html …       Fourteen field pages, one per profession — each shows its
  writing.html          sample CVs directly under the intro
  samples/              The sample CVs themselves, named {field}-cv.html
                        (consulting, data, engineering, finance and healthcare also
                        have -cv-2 … -cv-7 variants)
  samples/cv.css        One shared stylesheet for every sample CV
  styles.css            All styling — design tokens are at the top
  site.js               Field filter, tabs, CV toggle, motion, form submission
  stars.js              Starfield canvas
  .nojekyll             Serves files as-is on GitHub Pages

apps-script/Code.gs     The Google Apps Script backend for the form
DECISIONS.md            Why the samples are built the way they are
README.md               This file
```

GitHub Pages is set to serve from the `docs/` folder of `main` (Settings → Pages), so
`docs/finance.html` is live at `/finance.html` — the same URLs as before the site moved
into the folder. Every file named below lives in `docs/` unless the path says otherwise.

Live at https://fieldcraft.co.in/ (the old https://prateek-32.github.io/cv-forge/ address
redirects there).

### The domain

`fieldcraft.co.in` is registered at Hostinger. `docs/CNAME` tells GitHub Pages to serve the
site on it; the DNS at Hostinger points the domain at GitHub:

| Type | Name | Points to |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | prateek-32.github.io |

Every absolute address in the pages (canonical links, share previews, `sitemap.xml`,
`robots.txt`) uses `https://fieldcraft.co.in/`. If the domain ever changes, change those
and `docs/CNAME` together.

## Positioning — read before editing the copy

The site is written for a **₹99 launch price**. That constrains what the pages may
claim, and the copy was deliberately rewritten to stay inside it:

- No promise of an interview or a call. The pages say we build from the submitted brief.
- No claim of a specialist writer who has worked in the reader's field. The claim is
  field-specific *structure*, which is true.
- **One** revision round, not two.
- `pricing.html` carries a "What ₹99 does not buy" section stating the limits plainly.

If prices go up later, that copy can and should become more ambitious again. If you edit
the copy before then, keep it inside what ₹99 can actually deliver — a page that
over-promises costs more in refunds and reviews than it wins in orders.

## Pricing

Launch rates, with the list price struck through:

| Product | List | Launch |
|---|---|---|
| Resume health check | ₹99 | ₹49 |
| Resume | ₹299 | ₹99 |
| Curriculum vitae | ₹499 | ₹199 |
| LinkedIn rewrite | ₹449 | ₹149 |
| Portfolio site | ₹2,499 | ₹699 |
| Custom domain setup (add-on) | — | ₹349 |

**Portfolio hosting model.** The ₹699 portfolio is built and put live on a free static
host (Netlify, Cloudflare Pages or similar) in an account **in the client's name**, so the
client owns it and owes us nothing after handover. We do not host client sites ourselves:
a one-off fee for open-ended hosting is a liability, and GitHub's terms discourage using
Pages as a commercial hosting service. A custom domain is optional: the client buys it in
their own name and renews it with the registrar; the ₹349 add-on covers connecting it.
This is stated on the home page, pricing (card and FAQ), the finance page, the portfolio
gallery and the start form, which has a "Custom domain" checkbox.

| Bundle | Separately | Bundle |
|---|---|---|
| Job Ready (Resume + LinkedIn) | ₹248 | ₹199 |
| Full Record (Resume + CV) | ₹298 | ₹249 |
| Complete (all four) | ₹1,146 | ₹999 |

The struck-through figures are presented as a real launch offer capped at the first 25
clients, not a permanent fake discount. India's CCPA dark-pattern guidance treats a
"was" price that was never charged as misleading — so when the 25 are done, raise the
prices and say so on the page.

Prices are plain text in `pricing.html`, including each bundle's "separately" figure and
saving — change a product price and recompute the bundles that contain it by hand.

Prices are also quoted on the home page cards, the finance page fact card, the footer
tagline and the `pricing.html` meta description; those need editing by hand too.

## Design

- **Type:** Newsreader (headings) over IBM Plex Sans (body), IBM Plex Mono for labels.
  Loaded from Google Fonts; each has a system fallback.
- **Palette:** warm paper ground, pine green accent, brass secondary, charcoal panels.
- **Illustrations:** fourteen isometric scenes, one per profession, drawn inline as SVG
  on a single 2:1 projection with one light source. They inherit CSS custom properties,
  so they recolour with the theme — the dark section applies a cooler variant
  automatically. No image files, nothing to load.
- **3D motion:** each field page shows its scene large on a glowing stage — layers drop
  in, float, and shift by depth with the pointer. The Professions page spins all fourteen
  on a 3D carousel (pauses on hover). The "3D PROFESSION SCENES" block at the end of
  `styles.css` explains how the three motions share each layer. All of it stops under
  `prefers-reduced-motion`.

Retheme the whole site from the `:root` block at the top of `styles.css`:

```css
--paper:  #F5F3EE;   /* page ground     */
--ink:    #17191C;   /* body text       */
--accent: #1D5C55;   /* pine — buttons, links */
--brass:  #A9762F;   /* secondary accent */
--slate:  #1E252E;   /* dark panels     */
```

The `--iso-*` tokens below those drive the isometric scenes.

## Templates

Seventeen CV templates, all single-column and ATS-safe. **Modern** is the default
(`samples/cv.css`); the rest are `samples/templates/<name>.css`, each layered on top of it.

| Style | Templates |
|---|---|
| Traditional | Classic, Legal, Banker, Academic, Executive |
| Contemporary | Modern, Minimal, Slate, Tech, Clinical |
| Expressive | Creative, Studio, Editorial, Typewriter, Warm |
| Practical | Compact, Workwear |

- Any sample shows in any template: `samples/finance-cv.html?t=legal`. The loader is
  `samples/templates.js` (in each sample's `<head>`); its `GROUPS` list is the master
  list, and it adds a grouped dropdown and a "Use this template" link above the page.
- `templates.html` previews every template on a real sample from the chosen field, with a
  style filter; the recommendations per field live in `REC` in `site.js` — keep them in
  step with the "Suits …" lines on the page. `templates.html#law` opens on a field.
- "Use this template" links to `start.html?template=classic&field=law`, which pre-selects
  both on the brief. The brief sends `template` (and also adds "Template: …" to Needs, so
  an older Apps Script still records it). `apps-script/Code.gs` writes it to a **Template**
  column, labels that column on an existing sheet, and includes it in the email.
- A new template = a new `samples/templates/<name>.css`, plus its name in `GROUPS` in
  `templates.js`, a card on `templates.html` (and the style counts), an option on the
  brief, `REC` entries and the list in the assistant's `templates` answer.
- The top menu no longer has "Home" (the wordmark links home; the footer keeps it), to
  make room for "Templates".

## Free ATS resume checker (ats-checker.html, ats.js)

Visitors upload a PDF or Word (.docx) resume, or paste the text, plus an optional job
description. `ats.js` reads it **in the browser** — pdf.js and JSZip load from cdnjs only
when needed — runs about 30 checks (readability, contact, sections, content, keywords,
length and file) and gives a score out of 100.

- **Free:** the score, the category bars, the **top 3 fixes** in full and what is already
  working.
- **Locked:** every other fix is shown only as a locked row (severity and category, a
  blurred line). The fix text is never written into the page.
- **Unlock = the ₹49 expert review.** The visitor sends their name, email and consent; the
  resume file and the full report (all fixes) go to the brief endpoint as a normal brief
  (Career stage "Resume review ₹49 — ATS checker"), then they pay on
  `pay.html?service=review`. You email the full report plus a person's notes
  within 24 hours of payment. It cannot unlock instantly: a static site cannot confirm a UPI
  payment (that would need a payment gateway with a server-side check).
- Tested on the site's own sample CVs (all score 100) and on deliberately bad PDFs and
  .docx files (two columns, tables, header-only contact details, personal details,
  "responsible for", declaration).
- The ₹49 product is called **Expert resume review** everywhere (pricing, home FAQ,
  assistant, llms.txt, structured data). The checker is linked from the home hero, the
  pricing page, the ATS guide, every footer and the ☰ menu (menu-only links use
  `.nav-extra`, hidden on wide screens).

## Taking payment (pay.html)

UPI, no fees. The customer chooses the service they ordered from a dropdown and the
price is fixed by the service — there is no amount to type. The list (services, bundles,
add-ons) is `SERVICES` in `pay.js`; keep it in step with `pricing.html` and `PRICES` in
`assistant.js`. To send a client straight to their service:

    https://fieldcraft.co.in/pay.html?service=cv&ref=Priya%20Sharma

(keys: review, resume, linkedin, cv, portfolio, job-ready, full-record, complete, domain,
portfolio-domain, complete-domain; older `?amount=` links pick the service with that price).
The page shows a UPI QR code for that price (any UPI app can scan it), an "Open my UPI
app" button on phones, the UPI ID to copy, and an "I've paid" button that opens WhatsApp
with the details filled in. The UPI ID lives in `CV_FORGE_CONTACT.upi` in `site.js`;
`pay.js` builds the `upi://pay` link and `vendor/qrcode.js` (qrcode-generator, MIT) draws
the code. The page is `noindex` and not in the sitemap; it is linked from every footer ("Pay for an
order"), the pricing page and the ATS checker.

## Guides (content for search engines and AI assistants)

Five free guides at the site root — `resume-format-for-freshers.html`,
`ats-friendly-resume.html`, `resume-vs-cv.html`, `portfolio-website-guide.html`,
`cv-for-jobs-abroad.html` — and a hub, `guides.html`, linked from every footer. Each has a
one-sentence "In short" answer (the line AI assistants quote), a contents list, an FAQ, a
call to action and Article + FAQPage + BreadcrumbList structured data.

Don't edit the guide pages by hand: edit `content/guides/<slug>.html` and run
`powershell -ExecutionPolicy Bypass -File tools/build-guides.ps1`. The guides contain no
statistics or quotes that can't be checked — keep it that way.

## Search engines and AI assistants

- **Titles and descriptions** lead with what people search for ("resume and CV writing",
  "ATS-friendly templates", "portfolio website examples"). Sample CVs and portfolios lead
  with the job ("Investment Banking Analyst CV Sample (Priya Sharma)").
- **Structured data** (JSON-LD in each page's `<head>`): the business, its services and
  prices and the home FAQ on `index.html`; services, prices and the FAQ on `pricing.html`;
  a service and breadcrumbs on each profession page; collections on the listing pages.
  The script that wrote it is idempotent — if prices change, change them there and here.
  Check a page with Google's Rich Results Test.
- **Common questions** on the home page answer, in plain words, what people ask search
  engines and AI assistants (cost in India, builder vs writing service, ATS, resume vs CV,
  portfolio websites, professions).
- `robots.txt` allows every crawler and names the AI ones; `llms.txt` is a plain summary of
  the business, prices and pages for AI tools. Update `llms.txt` when prices or pages change.
- **IndexNow**: `docs/9c32c2a1b206b0876d346f729e83a458.txt` is the key file. After a
  change, notify Bing (which feeds ChatGPT search and Copilot) and Yandex:
  `curl -X POST https://api.indexnow.org/indexnow -H "Content-Type: application/json"`
  with `{"host":"fieldcraft.co.in","key":"<key>","keyLocation":"https://fieldcraft.co.in/<key>.txt","urlList":[...]}`.
- **Google** needs Search Console (see the setup notes in the pull request): verify the
  domain with a TXT record at Hostinger, then submit `sitemap.xml`.

## Privacy, terms and promises

- `privacy.html` and `terms.html` describe how the service really works: the brief goes to
  your Google Sheet, Drive and Gmail; briefs are kept up to 12 months after delivery (3 if no
  order); one revision within 14 days; full refund if cancelled before work starts. Change
  the pages if the practice changes. They are linked from every footer, and both briefs end
  with a required "I agree" tick box (`name="consent"`, carried in the summary).
- Turnaround: resumes, CVs and LinkedIn in 24 hours; portfolio sites live in 3–5 days. The
  footer line, pricing card and FAQ, the start page and the assistant all say so — change
  them together.
- Samples name real employers for realism. Every sample CV's notice, every portfolio footer,
  both listing pages and the terms say the people and results are invented and no
  endorsement is implied.
- `404.html` uses `<base href="/">` so its links work at any depth. It only renders
  properly on the live domain, not opened as a local file.

## On phones

At 760px and below the site changes shape so everything we sell is easy to find, and it
scrolls smoothly. Computers see none of it. The pieces:

- **Tab bar** along the bottom of every page (Home, Samples, Templates, Portfolios, Start),
  added by `site.js`. The floating WhatsApp button and the chat teaser are hidden; WhatsApp
  and Call buttons sit at the end of the ☰ menu, and each menu link says what the page holds.
- **Home**: four offer cards with prices (`.offer-grid` in `index.html`) sit right under the
  headline; the decorative CV card and the third button are hidden. The cards open the
  brief with that item ticked (`start.html?need=resume|cv|linkedin`).
- **Short lists**: a list with `data-m-limit="4"` shows that many items and a "Show all"
  button (`data-m-label`, `data-m-items`, `data-m-free-when-alone` — see the comment in
  `site.js`). Used on sample CVs (2 per field), templates (6) and portfolios (4 examples,
  2 showcase designs). Sample CVs and templates go two to a row.
- **Speed**: portfolio previews are pictures (`portfolios/shots/*.jpg`, 640×400). Computers
  load the live site over the picture; phones never load it. The star sky draws one still
  frame, and the fixed, blurred and animated background layers are switched off.
  If a portfolio's top screen changes, retake its picture: a 1280×800 screenshot of the
  page inside an iframe (so the sample banner hides), saved as a 640×400 JPEG.
- **Theme studio**: the live preview moves above the controls and stays pinned while
  themes are tapped. In the order form, Back / Next stay pinned above the tab bar.

## Sample portfolios

`sample-portfolios.html` has three parts: a **theme studio** (pick one of the fourteen kit
examples and any of the twelve themes; the preview is the real page), the **fourteen kit
examples** in their own default themes with a filter by field group (`data-group` on each
card), and the **four showcase designs** built by hand. The examples grid and the studio's
person list carry the same people in the same order — add a new example to both.

### The portfolio kit (`portfolios/kit/`)

Fourteen examples share one markup and one stylesheet, so each can be shown in any theme:

- `kit/portfolio.css` — the base: the `pk-*` classes (hero, stats, work grid with drawn
  covers, case study, about and facts, timeline, tags, list, contact) and the custom
  properties a theme sets (`--bg`, `--ink`, `--accent`, `--display`…). Element defaults sit
  inside `:where(.pk)` so any class rule beats them.
- `kit/kit.js` — loaded in `<head>`: reads `?t=` (or the page's `data-theme-default`),
  adds `kit/themes/<name>.css` before first paint, fills the banner's theme switcher and
  points "Get yours" at `start.html?type=portfolio&theme=<t>&field=<data-field>`.
  `THEME_GROUPS` there is the master list of themes.
- `kit/themes/*.css` — twelve themes: Paper, Clinic, Sidebar, Swiss (clean & professional),
  Brutal, Pastel, Gallery, Atelier (bold & expressive), Aurora, Noir, Console, Darkroom
  (dark & dramatic). Atelier (warm linen, handwritten notes, taped-up work) is made for
  painters and makers; Darkroom (black, condensed type, edge-to-edge images) for photographers.
  Sidebar changes the layout (a sticky profile column from 1000px up); the rest restyle.

| File | Candidate | Default theme | Facts from |
|---|---|---|---|
| `portfolios/chiara-rossini.html` | Film editor | Noir | `samples/film-cv.html` |
| `portfolios/kwame-asante.html` | Investigative journalist | Paper | `samples/writing-cv.html` |
| `portfolios/marcus-webb.html` | M&A senior associate | Sidebar | `samples/law-cv.html` |
| `portfolios/jake-tran.html` | Master electrician | Brutal | `samples/trades-cv.html` |
| `portfolios/amira-hassan.html` | STEM teacher | Pastel | `samples/teaching-cv.html` |
| `portfolios/sofia-reyes.html` | Computational biologist | Clinic | `samples/academia-cv.html` |
| `portfolios/ryan-obrien.html` | VP Sales EMEA | Swiss | `samples/sales-cv.html` |
| `portfolios/isabelle-fontaine.html` | Strategy consultant | Aurora | `samples/consulting-cv.html` |
| `portfolios/tariq-osei.html` | Senior data scientist | Console | `samples/data-cv.html` |
| `portfolios/fatima-al-rashid.html` | Frontend lead, design systems | Gallery | `samples/engineering-cv-7.html` |
| `portfolios/diego-reyes.html` | Backend engineer, payments | Aurora | `samples/engineering-cv-2.html` |
| `portfolios/anika-patel.html` | Chief financial officer | Sidebar | `samples/finance-cv-6.html` |
| `portfolios/aisha-bello.html` | Senior clinical pharmacist | Clinic | `samples/healthcare-cv-6.html` |
| `portfolios/priya-singh.html` | Business analyst, early career | Paper | `samples/consulting-cv-3.html` |
| `portfolios/luke-zhang.html` | Machine learning engineer | Sidebar | `samples/data-cv-3.html` |
| `portfolios/karthik-raghavan.html` | Mid-market account executive, Bengaluru | Aurora | `samples/sales-cv-2.html` |
| `portfolios/ishita-deshpande.html` | Corporate & M&A associate, Mumbai | Noir | `samples/law-cv-2.html` |
| `portfolios/santosh-jadhav.html` | HVAC site supervisor, Pune | Swiss | `samples/trades-cv-2.html` |
| `portfolios/tanvi-sawant.html` | Graphic & brand designer, Mumbai | Gallery | `samples/creative-cv-2.html` |
| `portfolios/kabir-fernandes.html` | Music producer & sound designer, Mumbai | Brutal | `samples/film-cv-2.html` |
| `portfolios/mehak-bhatnagar.html` | Content writer, early career, Delhi | Pastel | `samples/writing-cv-2.html` |
| `portfolios/kavita-rathore.html` | Middle school science teacher, Jaipur | Clinic | `samples/teaching-cv-2.html` |
| `portfolios/shreya-hegde.html` | PhD researcher, materials, Bengaluru | Paper | `samples/academia-cv-2.html` |
| `portfolios/meera-iyer.html` | Painter, acrylic & oil, Chennai | Gallery | `samples/art-cv.html` |
| `portfolios/zoya-mirza.html` | Resin artist, Pune | Noir | `samples/art-cv-2.html` |
| `portfolios/lavanya-reddy.html` | Fabric painter / textile artist, Hyderabad | Atelier | `samples/art-cv-3.html` |
| `portfolios/vikram-sahni.html` | Wildlife & landscape photographer, Dehradun | Darkroom | `samples/art-cv-4.html` |

The eight `*-cv-2.html` samples above are new (India-based, fictional, with fictional or
generic employers). Every profession page now has a **Sample portfolios** section (`#portfolios`,
`.fpf-card`) listing that field's portfolios with their picture from `portfolios/shots/`. When
you add a portfolio, add it there, to the gallery grid and studio list on
`sample-portfolios.html`, to the sitemap, and take its picture (1280×800 in an iframe, saved
as a 640×400 JPEG).

The kit's art layer (hero decorations, drawn covers, per-theme ornaments, staggered motion)
lives in `kit/portfolio.css` and the themes; `kit/kit.js` adds only optional touches (the
display monogram, stagger indexes and a desktop pointer glow), plus the series filter and
lightbox for artwork galleries.

**Art portfolios** (`art.html`, the four `art-cv*` samples) are image-led: a signature piece in
`.pk-portrait > img`, a wide `.pk-feature` image, and a `.pk-gallery` of `.pk-art` figures (title,
medium, size, year, `.pk-status` Sold / Available / Commission) that open full screen in the
kit.js lightbox, filtered by `.pk-filter` series buttons. Their images live in
`portfolios/art/<person>/` as `name.jpg` (1400px, for the lightbox) and `name-s.jpg` (720px, for
the grid). The paintings, resin and textile pieces were generated for these samples (painterly
stroke rendering and per-pixel resin / cloth shading on canvas); the photographer's pictures are
Unsplash photos (via Lorem Picsum) used as credited placeholders under the Unsplash License.

To add a theme: write `kit/themes/<name>.css`, add it to `THEME_GROUPS` in `kit.js`, to
the studio and the brief's theme cards (`start.html`, with a `.tp-<name>` swatch in
`styles.css`), and to `CV_FORGE_PF_REC` in `site.js` if it suits a field.

### Showcase designs

The four hand-built sites, one per portfolio type in `DECISIONS.md`:

| File | Candidate | Type |
|---|---|---|
| `portfolios/yuki-tanaka.html` | Yuki Tanaka, UX & brand | Creative |
| `portfolios/lena-kowalski.html` | Lena Kowalski, SRE | Technical |
| `portfolios/arjun-mehta.html` | Arjun Mehta, M&A | Corporate |
| `portfolios/priya-nair.html` | Dr. Priya Nair, physician | Service & care |

Each is self-contained (its own inline CSS, no image files — every visual is CSS or SVG)
because a real client's portfolio is its own site with its own design. Every fact on each
comes from that candidate's sample CV; keep it that way. Each carries a "Sample portfolio"
banner, hidden when the page is shown inside the gallery's live previews (the
`embedded` class, set when the page is in an iframe).

The gallery shows each site live in an iframe rendered at 1280px and scaled to fit
(`--s`, set in `site.js`); hovering scrolls through it. The finance, engineering,
creative and healthcare field pages link to their portfolio under their sample CVs.

## Sample CVs

Every sample in `samples/` links `samples/cv.css` and nothing else, so restyling all of
them is one edit there. The documents stay single column with real `<li>` bullets, so they
still read like the ATS-safe CVs they demonstrate.

To add a sample:

1. Copy an existing sample in the same field to `samples/{field}-cv-N.html` and replace
   the content. Keep the `cv-*` class names; `cv.css` covers every block the existing
   samples use (metric strips, licence blocks, chips, credit tables, publications).
2. Copy one `<a class="cv-card">` block in `sample-cvs.html` into that field's grid and
   change the link, name, title, level and role. Update the counts in that field's pill
   and heading, and the total in the page intro and meta description.
3. Do the same in the field page's own sample section, and update the "Browse all N
   samples" total on every field page.

## The assistant (chat helper)

`assistant.js`, loaded on every page after `site.js`, adds the chat button in the
bottom-right corner. It is **rule-based, not an AI model**: it matches the visitor's
words to about 35 topics and answers only with what the site already states, so it is
free, instant, and cannot invent a policy. Anything it cannot place gets an honest "not
sure" and a route to a person.

- **Topics** live in `TOPICS` at the top of `assistant.js`: each has `keys` (words or
  phrases; phrases score higher) and an `answer`. Product topics (resume, CV, portfolio…)
  give way to the question being asked, so "when will I get my resume?" answers the
  turnaround, while "how much is the portfolio?" answers the portfolio.
- **Prices** are in `PRICES` in the same file — update them with `pricing.html`.
- **Raise an issue** is a small form in the chat that is **sent straight to the Apps
  Script endpoint** (`CV_FORGE_CONTACT.formEndpoint`, the same web app as the brief form)
  — no email app needed. The issue type is pre-picked from what the visitor typed. With
  the current `apps-script/Code.gs`, issues go to an **Issues** tab and email
  `NOTIFY_EMAIL` with reply-to set to the visitor, so you answer with Reply. (An older
  deployment still saves them, as rows on the Briefs tab marked "ISSUE: …".) If sending
  fails, the form keeps the text and offers a pre-filled Gmail compose link, the email
  app, and WhatsApp.
- Contact details, hours and WhatsApp come from `CV_FORGE_CONTACT` in `site.js`.

## Contact details — one place

There are no bracketed placeholders left on the site. Contact details live in one object
at the top of `site.js`:

```js
var CV_FORGE_CONTACT = {
  email:    '',   // e.g. 'hello@yourdomain.in'
  phone:    '',   // as it should be shown, e.g. '+91 98765 43210'
  whatsapp: '',   // digits only, country code first, e.g. '919876543210'
  city:     '',
  hours:    ''
};
```

Every contact link — the footer's Contact column, the "Prefer to talk?" card on
`start.html`, and the floating WhatsApp button — stays hidden until its value is set, so
an empty field never shows as a placeholder. The form's failure message also falls back
to `email` once it is set.

The turnaround is **24 hours from payment**, stated in plain text in every footer, every
field page's "At a glance" card, the home hero and stats, the start page and the pricing
FAQ — search for `24 hours` if it changes. There are no testimonials or order counts
yet; add real ones to the home page stats block (`.stats`) when you have them.

## Home page extras

- **Hero:** a CV that builds itself on load (Lena Kowalski's real sample figures), pure
  CSS in the "home: the CV that forges itself" block of `styles.css`.
- **Before / after:** three side-by-side comparisons behind tabs (Finance, Engineering,
  Healthcare) — the draft on the left, the rebuild on the right, nothing moving on its
  own. Soft amber numbers mark the draft's problems and teal numbers the matching fixes,
  keyed to the six changes listed underneath. It sits after "What we build"; the
  portfolio sites come first, straight after the professions strip. The "after" sides use
  only facts from `samples/finance-cv.html`, `engineering-cv.html` and
  `healthcare-cv.html`; keep it that way if you edit them.
- **Sample wall:** two rows of all 43 samples sliding on a tilted plane, generated from the
  cards on `sample-cvs.html` — regenerate it if samples are added.
- **Spotlight:** a soft glow that follows the pointer on the home page.
- **Quick view:** on `sample-cvs.html` and the field pages, a sample card opens its CV
  in a dialog with previous / next. Phones and modified clicks open the page itself.
- **Link previews:** `og-image.png` (1200×630), `favicon.svg`, `apple-touch-icon.png`,
  and `sitemap.xml` — submit the sitemap in Google Search Console.

## Two briefs: documents and portfolio sites

`start.html` has a switch at the top — **Resume, CV or LinkedIn** or **Portfolio site** —
with a separate form for each, because a portfolio needs different material.

Both are five-step forms (`form.wizard`, each step a `section.step`) with a progress bar,
Back/Next, a review of every answer before sending, and a draft kept in the visitor's own
browser (`localStorage`, never required) so a closed tab loses nothing. Without
JavaScript all steps show as one long form. The aim is to ask everything up front, so we
rarely need to come back with questions.

- **Document brief** (`#brief-form`): about you (phone/WhatsApp, city, LinkedIn, how to
  reach you) · career (field, stage, current role, employer, years, target country, roles,
  job-posting links) · what you need (documents incl. cover letter, template, length,
  photo, deadline) · material (up to 5 files, achievements with numbers, skills,
  certifications, education, languages) · notes and review.
- **Portfolio brief** (`#portfolio-form`): about you (city, headline, bio) · the look (ten
  kit themes, four showcase designs or "let us choose"; the two that suit the chosen field
  are marked; brand colours; photo or initials) · your work (repeatable projects — name,
  role, what you did, result, year, link — up to 8; sections; skills; awards; testimonials)
  · links and files (LinkedIn, GitHub, Behance, Instagram, website, other links, up to 5
  files; what to show on the site) · web address, hosting email, add-ons, deadline, notes
  and review.
- `start.html?type=portfolio` (or `#portfolio`) opens the portfolio brief. `&theme=<name>`
  pre-picks a kit theme (every kit example's "Get yours" sends it, with `&field=`), and the
  older `&style=creative|technical|corporate|care` pre-picks a showcase design.
- Files go as `fileData`/`fileName`/`fileType`, then `fileData1`… for the rest; the script
  saves each to Drive and lists every link in the Attachment column.
- Every answer also travels as one readable `summary`, which the script files in a
  **Full brief** column and uses as the email body. Older copies of the script receive the
  same summary in Notes, so nothing is lost before a redeploy.
- Portfolio briefs are sent with `kind=portfolio`. `apps-script/Code.gs` writes them to a
  **Portfolio briefs** tab (one column per answer) and emails them with reply-to set. The
  same answers are also folded into the document brief's columns, so a script deployed
  before the Portfolio tab existed still records them on the Briefs tab, marked
  "PORTFOLIO: …". New columns are only ever added at the end of a tab.

## The intake form (your own, via Google Apps Script)

The form lives on your site, in your design. When someone submits it, the browser posts
the answers to a small script you own, which writes one row into a Google Sheet in your
own Drive. No Google Form, no Formspree, no submission cap, nothing branded.

**Setup, about five minutes:**

1. Create a blank Google Sheet (name it anything).
2. **Extensions → Apps Script.** Delete the sample code and paste in `apps-script/Code.gs`
   from this folder.
3. Optional: set `NOTIFY_EMAIL` at the top to your address, to get an email per brief.
4. **Deploy → New deployment → gear → Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone** — this must be "Anyone", not "Anyone with a Google account",
     or visitors will hit a login wall.
5. Authorise. Google warns that the app is unverified because you wrote it yourself:
   **Advanced → Go to (project name) → Allow.**
6. Copy the **Web app URL** (it ends in `/exec`) and paste it into `start.html`, replacing
   `[YOUR APPS SCRIPT URL]`.

**Check it worked:** open the `/exec` URL in a browser. You should see
`{"ok":true,"message":"Fieldcraft endpoint is live"}`. Then send yourself a test brief and
confirm a row appears in the Sheet.

**If you edit `Code.gs` later**, you must redeploy: Deploy → Manage deployments → pencil →
Version: **New version** → Deploy. Otherwise the site keeps hitting the old code.

**What the form handles already:**

- Required name and email, validated before anything is sent
- File upload up to 8 MB, saved into a "Fieldcraft uploads" folder in your Drive, with the
  link recorded in the row
- A hidden honeypot field that silently drops bot submissions
- An inline thank-you on success, without a page reload
- On any failure: the form stays filled in and shows the contact email to fall back to
  (once `CV_FORGE_CONTACT.email` is set), so an enquiry is never silently lost

## Accessibility

Headings and small text were checked against their actual backgrounds and clear WCAG AA
(4.5:1 for body text, 3:1 for large). Controls use real `<button>`, `<a href>` and
`<label>`-paired inputs; the tab set supports arrow-key navigation. Decorative
illustrations carry `aria-hidden`.

## Updating

Edit a file and commit — GitHub Pages redeploys in under a minute. It caches hard, so
check in a private window before assuming a change did not land.
