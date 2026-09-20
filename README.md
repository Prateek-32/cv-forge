# CV Forge — static site

Four-page static site: home, fields, a field detail page (finance) and the intake form.
No build step, no dependencies, no framework.

```
index.html     Home
fields.html    All fields, with a working filter
finance.html   Field detail page, with tabs
start.html     Intake form
styles.css     All styling — design tokens are at the top
site.js        Field filter, tabs, motion, form submission
.nojekyll      Serves files as-is on GitHub Pages
```

Live at https://prateek-32.github.io/cv-forge/

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
