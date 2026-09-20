# CV Forge — static site

Four-page static site: home, fields, a field detail page (finance) and the intake form.
No build step, no dependencies. Plain HTML, one CSS file, one small JS file.

```
index.html        Home
fields.html       All fields, with a working filter
finance.html      Field detail page, with tabs
start.html        Intake form
assets/styles.css All styling (colours are CSS variables at the top)
assets/site.js    Filter + tabs
.nojekyll         Tells GitHub Pages to serve the files as-is
```

## Publish it free on GitHub Pages

1. Create a GitHub account if you don't have one, then create a **public** repository.
   - Name it `yourusername.github.io` to get `https://yourusername.github.io`
   - Or name it anything (e.g. `cv-forge`) to get `https://yourusername.github.io/cv-forge`
2. On the new repo's page, click **uploading an existing file**, drag in everything from this
   folder (including the `assets` folder and `.nojekyll`), and commit.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**,
   **Branch: `main`**, **Folder: `/ (root)`**. Save.
4. Wait about a minute, then reload. The URL appears at the top of that same Pages screen.

Updating later: edit a file on GitHub (pencil icon) or drag in a replacement. Pages redeploys
in under a minute.

### Custom domain (optional)

Buy a domain, then in **Settings → Pages → Custom domain** enter it and save. At your registrar
add these DNS records:

- `A` records for the apex domain pointing to `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`
- a `CNAME` record for `www` pointing to `yourusername.github.io`

Then tick **Enforce HTTPS** once the certificate is issued.

## Before you publish — things to fill in

Search the files for `[` and replace every bracketed placeholder:

- `[YOUR BUSINESS NAME]` and the `CV FORGE` wordmark (it's a working name)
- `[YOUR PRICE]`, `[TURNAROUND]`, `[RESPONSE TIME]`
- `[YOUR EMAIL]`, `[YOUR PHONE]`, `[YOUR CITY]`, `[YOUR HOURS]`
- `[NUMBER]` stats and both client quotes on the home page — delete these blocks entirely
  rather than inventing figures
- `[PRIVACY POLICY]` / `[TERMS]` footer links

## Making the form actually send

GitHub Pages is static hosting: it cannot receive a form submission. Pick a free form
backend and paste its endpoint into the `action` attribute in `start.html`:

- **Formspree** (formspree.io) — free tier, works with the file upload field
- **Getform**, **Web3Forms**, **Basin** — similar

Until you do, the Send button will not deliver anything. The `mailto:` and `tel:` links
work as soon as you fill in your details.

## Changing the colours

Everything themes from the top of `assets/styles.css`:

```css
:root {
  --bone:   #F4F0E6;  /* page background */
  --ink:    #14110D;  /* text, borders    */
  --accent: #FF4A1C;  /* primary buttons  */
  --lime:   #CBEF3F;  /* highlight blocks */
}
```
