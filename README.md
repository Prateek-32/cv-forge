# CV Forge — static site

Four-page static site: home, fields, a field detail page (finance) and the intake form.
No build step, no dependencies, no framework.

```
index.html     Home
fields.html    All fields, with a working filter
finance.html   Field detail page, with tabs
start.html     Intake form
styles.css     All styling — design tokens are at the top
site.js        Field filter + deliverable tabs
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

## Making the form send

GitHub Pages is static hosting and cannot receive a form submission. Create a free
endpoint at [Formspree](https://formspree.io) (or Getform, Web3Forms, Basin) and paste it
into the `action` attribute of the form in `start.html`:

```html
<form class="brief" action="https://formspree.io/f/YOUR-FORM-ID" method="POST">
```

Until then the Send button does nothing. The `mailto:` and `tel:` links work as soon as
you fill in your details.

## Accessibility

Headings and small text were checked against their actual backgrounds and clear WCAG AA
(4.5:1 for body text, 3:1 for large). Controls use real `<button>`, `<a href>` and
`<label>`-paired inputs; the tab set supports arrow-key navigation. Decorative
illustrations carry `aria-hidden`.

## Updating

Edit a file and commit — GitHub Pages redeploys in under a minute. It caches hard, so
check in a private window before assuming a change did not land.
