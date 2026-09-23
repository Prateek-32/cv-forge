# CV Forge — static site

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

Retheme the whole site from the `:root` block at the top of `styles.css`:

```css
--paper:  #F5F3EE;   /* page ground     */
--ink:    #17191C;   /* body text       */
--accent: #1D5C55;   /* pine — buttons, links */
--brass:  #A9762F;   /* secondary accent */
--slate:  #1E252E;   /* dark panels     */
```

The `--iso-*` tokens below those drive the isometric scenes.

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

## Before going live — placeholders to replace

Search the files for `[` and replace each bracketed placeholder:

- `[YOUR BUSINESS NAME]` and the `CV Forge` wordmark (a working name)
- `[YOUR PRICE]`, `[TURNAROUND]`, `[RESPONSE TIME]`
- `[YOUR EMAIL]`, `[YOUR PHONE]`, `[YOUR CITY]`, `[YOUR HOURS]`
- The `[NUMBER]` statistics and both testimonials on the home page — delete these blocks
  rather than inventing figures
- `[PRIVACY POLICY]` / `[TERMS]` in the footer

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
`{"ok":true,"message":"CV Forge endpoint is live"}`. Then send yourself a test brief and
confirm a row appears in the Sheet.

**If you edit `Code.gs` later**, you must redeploy: Deploy → Manage deployments → pencil →
Version: **New version** → Deploy. Otherwise the site keeps hitting the old code.

**What the form handles already:**

- Required name and email, validated before anything is sent
- File upload up to 8 MB, saved into a "CV Forge uploads" folder in your Drive, with the
  link recorded in the row
- A hidden honeypot field that silently drops bot submissions
- An inline thank-you on success, without a page reload
- On any failure: the form stays filled in and shows an email address to fall back to,
  so an enquiry is never silently lost

## Placeholders in the JavaScript

Two placeholders live in `site.js`, not the HTML — easy to miss:

- `[YOUR EMAIL]` in the error message shown if a submission fails
- `[RESPONSE TIME]` in the on-screen thank-you

## Accessibility

Headings and small text were checked against their actual backgrounds and clear WCAG AA
(4.5:1 for body text, 3:1 for large). Controls use real `<button>`, `<a href>` and
`<label>`-paired inputs; the tab set supports arrow-key navigation. Decorative
illustrations carry `aria-hidden`.

## Updating

Edit a file and commit — GitHub Pages redeploys in under a minute. It caches hard, so
check in a private window before assuming a change did not land.
