# Fieldcraft — static site

> *Every field reads a page differently.* — formerly the working name CV Forge. The repository and the live URL keep
> `cv-forge`; renaming the repo would change the GitHub Pages address.

Static site: home, a fields index, thirteen field pages with sample CVs, pricing and the
intake form. No build step, no dependencies, no framework.

```
docs/                   The website — everything GitHub Pages serves
  index.html            Home
  fields.html           All fields, with a working filter
  sample-cvs.html       Every sample CV, grouped by field, with a field filter
                        (sample-cvs.html#finance opens on one field)
  pricing.html          Prices and bundles
  start.html            Start page, with the brief form
  academia.html …       Thirteen field pages, one per profession — each shows its
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

Live at https://prateek-32.github.io/cv-forge/

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
- **Illustrations:** thirteen isometric scenes, one per profession, drawn inline as SVG
  on a single 2:1 projection with one light source. They inherit CSS custom properties,
  so they recolour with the theme — the dark section applies a cooler variant
  automatically. No image files, nothing to load.
- **3D motion:** each field page shows its scene large on a glowing stage — layers drop
  in, float, and shift by depth with the pointer. The Professions page spins all thirteen
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

## Sample portfolios

`sample-portfolios.html` has three parts: a **theme studio** (pick one of the fourteen kit
examples and any of the ten themes; the preview is the real page), the **fourteen kit
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
- `kit/themes/*.css` — ten themes: Paper, Clinic, Sidebar, Swiss (clean & professional),
  Brutal, Pastel, Gallery (bold & expressive), Aurora, Noir, Console (dark & dramatic).
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
