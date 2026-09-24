# Fieldcraft — Build Decisions & Reference Document

> Last updated: September 2026  
> Branch: `feature/sample-cvs-portfolios`  
> Authors: Nikhil Shivpuriya, Prateek

---

## 1. What Is Fieldcraft

Fieldcraft is a professional CV, resume, and portfolio preparation service. We write documents tailored to the specific field the client works in — not generic templates. A finance analyst and a healthcare doctor need completely different documents in structure, language, and what appears first.

The site is the storefront. Clients browse by field, see a real sample of what they'd receive, and submit a brief. We prepare the documents. They get hired.

---

## 2. Why We Are Building Sample CVs and Portfolios

### The problem we are solving
Clients won't pay for something they can't see. The existing site had zero samples — every field linked to "Enquire →". That means a visitor lands, reads copy about how great the service is, but has no proof. Conversion rate would be near zero.

### The goal
Every field page shows:
1. A real, complete sample CV for a fictional but realistic person in that field
2. A portfolio preview showing what a portfolio site looks like for that industry
3. A toggle between dark (site theme) and paper/print view so they can see the actual document
4. A downloadable standalone HTML page they can print to PDF

This is the single most important thing we can do to make the site credible before launch.

### Why we chose this over alternatives
| Option | Why we rejected it |
|---|---|
| Link to external templates (Canva, Novorésumé) | Sends users away from our site, not our brand |
| Show screenshots of CVs | Not interactive, can't print, looks low effort |
| Only show one sample for all fields | Completely misses our core value prop — field-specific work |
| Wait until we have real client samples | Can't launch without proof of quality |
| Use a PDF embed | Requires a server or third-party viewer, breaks our zero-dependency rule |

**We chose: hand-crafted HTML samples** because the site is already zero-dependency static HTML. The same approach (HTML + CSS tokens) gives us full control, looks great in both dark and print mode, and doesn't require any infrastructure.

---

## 3. How We Are Building It

### Tech approach
- Zero new dependencies — pure HTML, CSS, vanilla JS. Same stack as the rest of the site.
- Each field gets its own detail page (e.g. `engineering.html`, `healthcare.html`)
- Each field has a standalone printable CV at `samples/{field}-cv.html`
- The detail page embeds a CV preview with a dark/paper toggle
- Paper mode applies `@media print` styles — visitors click "Download sample" → it opens the standalone page → they print to PDF

### ATS compliance rules (applied to every sample)
Based on 2026 research (Forbes, Jobscan, hireflow.net, resumeoptimizerpro.com):
- Single column layout only — no tables, no text boxes, no columns
- Standard section headers: Contact → Summary → Experience → Skills → Education → Certifications
- Real `<li>` bullet points, not dashes or custom characters
- System-safe fonts in print mode (no Google Fonts in the printable version)
- Dates in consistent `MMM YYYY` format throughout
- No images, icons, or graphics in the printable CV
- ATS target score: 85%+ (industry benchmark rose from 75% in 2023 to 85% in 2026)

### Portfolio approach per industry type
Research source: UX Folio, Envato Portfolio Trends 2026, Scaler, refontelearning.com

| Type | Fields | Portfolio style |
|---|---|---|
| A — Corporate | Finance, Law, Consulting, Sales | Deal/matter/engagement strip, quantified outcomes |
| B — Technical | Engineering, Data & Analytics | GitHub projects, system diagrams, model cards |
| C — Creative | Art & Design, Film, Writing | Images first, case studies, process shots |
| D — Service & Care | Healthcare, Academia, Teaching, Trades | Credentials block first, compliance facts before narrative |

---

## 4. The 13 Fields and Fictional Candidates

Every candidate is fictional but realistic. Diverse names and backgrounds — the service works globally.

| # | Field | Candidate | Background |
|---|---|---|---|
| 1 | Finance & Banking | Arjun Mehta | VP M&A Advisory, Mumbai → London, 8 yrs |
| 2 | Engineering & Tech | Lena Kowalski | Senior SRE, Berlin, Go/Kubernetes, 6 yrs |
| 3 | Data & Analytics | Tariq Osei | Senior Data Scientist, Nairobi → Amsterdam, 5 yrs |
| 4 | Healthcare & Medicine | Dr. Priya Nair | Hospitalist Physician, Singapore, 7 yrs |
| 5 | Law & Compliance | Marcus Webb | Senior Associate, Corporate M&A, London, 6 yrs |
| 6 | Academia & Research | Prof. Sofía Reyes | Associate Professor, Computational Biology, Madrid, 12 yrs |
| 7 | Art, Design & Creative | Yuki Tanaka | Senior UX/Brand Designer, Tokyo → NYC, 8 yrs |
| 8 | Film, Music & Performance | Chiara Rossini | Film Editor / Post-Production, Rome → LA, 7 yrs |
| 9 | Writing & Media | Kwame Asante | Investigative Journalist, Accra → London, 9 yrs |
| 10 | Consulting & Operations | Isabelle Fontaine | Senior Manager, McKinsey Paris, 7 yrs |
| 11 | Sales & Marketing | Ryan O'Brien | VP Sales EMEA, Dublin, SaaS, 10 yrs |
| 12 | Teaching & Public Service | Amira Hassan | Secondary STEM Teacher, Cairo → Birmingham, 6 yrs |
| 13 | Skilled Trades | Jake Tran | Master Electrician, Vancouver, Red Seal, 11 yrs |

---

## 5. File Structure

```
cv-forge/
│
├── DECISIONS.md                  ← this file
│
├── samples/                      ← standalone printable CV pages
│   ├── finance-cv.html           ← Arjun Mehta
│   ├── engineering-cv.html       ← Lena Kowalski
│   ├── data-cv.html              ← Tariq Osei
│   ├── healthcare-cv.html        ← Dr. Priya Nair
│   ├── law-cv.html               ← Marcus Webb
│   ├── academia-cv.html          ← Prof. Sofía Reyes
│   ├── creative-cv.html          ← Yuki Tanaka
│   ├── film-cv.html              ← Chiara Rossini
│   ├── writing-cv.html           ← Kwame Asante
│   ├── consulting-cv.html        ← Isabelle Fontaine
│   ├── sales-cv.html             ← Ryan O'Brien
│   ├── teaching-cv.html          ← Amira Hassan
│   └── trades-cv.html            ← Jake Tran
│
├── finance.html                  ← updated with CV preview + portfolio section
├── engineering.html              ← new
├── data.html                     ← new
├── healthcare.html               ← new
├── law.html                      ← new
├── academia.html                 ← new
├── creative.html                 ← new
├── film.html                     ← new
├── writing.html                  ← new
├── consulting.html               ← new
├── sales.html                    ← new
├── teaching.html                 ← new
├── trades.html                   ← new
│
├── index.html                    ← home (existing)
├── fields.html                   ← all fields with filter (existing, links updated)
├── start.html                    ← intake form (existing)
├── styles.css                    ← all styling (existing + paper mode additions)
├── site.js                       ← interactions (existing + CV toggle)
└── stars.js                      ← starfield canvas (existing)
```

---

## 6. Build Order

1. `DECISIONS.md` — this file ✅
2. `samples/finance-cv.html` — Arjun Mehta, Finance (first complete sample)
3. `finance.html` — updated with CV preview toggle + portfolio section
4. `samples/engineering-cv.html` + `engineering.html`
5. `samples/data-cv.html` + `data.html`
6. `samples/healthcare-cv.html` + `healthcare.html`
7. `samples/law-cv.html` + `law.html`
8. `samples/consulting-cv.html` + `consulting.html`
9. `samples/sales-cv.html` + `sales.html`
10. `samples/creative-cv.html` + `creative.html`
11. `samples/film-cv.html` + `film.html`
12. `samples/writing-cv.html` + `writing.html`
13. `samples/academia-cv.html` + `academia.html`
14. `samples/teaching-cv.html` + `teaching.html`
15. `samples/trades-cv.html` + `trades.html`
16. `fields.html` — update all "Enquire →" links to real field pages
17. `styles.css` — add `.cv-paper` print styles + preview toggle styles
18. `site.js` — add CV preview dark/paper toggle logic

---

## 7. Key 2026 Research References

### Resume/CV trends
- Forbes (March 2026): 41% of recruiters look at skills section first; 76% use ATS filtering
- research.com (2026): Average ATS score rose from 30 to 52 between 2023–2026; target 85%+
- hireflow.net: Two pages normal for mid-career; one page for entry-level still dominant
- resumeoptimizerpro.com: 88% of employers believe they lose candidates to ATS parsing errors
- visualcv.com Q1 2026: 291 applications per hire on average — 20 seconds per CV

### Per-field specifics
- **Finance** (resumetemplates.com 2026): Deal tombstone block, figures on every line, one page
- **Engineering** (resumetemplates.com 2026): GitHub link visible in first 20 seconds, p99 metrics, AI tool proficiency now expected
- **Law** (resumetemplates.com 2026): Bar admissions + jurisdiction first, matter types, settlement values
- **Healthcare** (resumetemplates.com 2026): License block above experience, patient volume + outcomes, EHR systems named
- **Academia** (resumeoptimizerpro.com 2026): 5–8 pages, full publication list, h-index, grant totals in dollars
- **Consulting** (hackingthecaseinterview.com 2026): McKinsey format — problem/intervention/result, quantified impact only
- **Data** (scaler.com 2026): Business question → approach → outcome, reproducible notebooks, production-ready thinking
- **Trades** (kudoswall.com 2026): State residential/commercial/industrial explicitly, prevailing wage/union experience, OSHA

### Portfolio trends 2026
- Envato 2026: Dark mode, tactile textures, hybrid site+platform, gamified navigation
- colorlib.com 2026: Clear positioning in headline, 2–4 case studies not a grid of 10
- myuxacademy.com 2026: Research + process + outcome — not just final polished screens
- jobwizard.ai 2026: Portfolio must load fast, clear CTAs, frictionless contact

---

## 8. Things To Do After Samples Are Live

- [ ] Replace `[YOUR PRICE]`, `[TURNAROUND]`, `[RESPONSE TIME]` with real values
- [ ] Wire up Formspree on `start.html` form
- [ ] Add real testimonials (remove placeholder blockquotes until then)
- [ ] Add favicon
- [ ] Add OG/social meta tags to all pages
- [ ] Write Privacy Policy and Terms of Service
- [ ] Replace `[YOUR BUSINESS NAME]`, `[YOUR EMAIL]`, `[YOUR PHONE]`, `[YOUR CITY]`
- [ ] Rename "Sample field" nav link once more field pages are live
- [ ] Add `sitemap.xml`
- [ ] Consider mobile hamburger nav

---

## 9. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| Sep 2026 | Zero-dependency static HTML | No build step, no server, deploys instantly on GitHub Pages |
| Sep 2026 | Fictional diverse candidates | Shows global reach, avoids legal issues with real data |
| Sep 2026 | HTML printable CVs over PDF embeds | No server needed, full CSS control, print-to-PDF works natively |
| Sep 2026 | Feature branch `feature/sample-cvs-portfolios` | Keep main clean until all 13 fields are done |
| Sep 2026 | Dark + paper toggle on field pages | Clients see both the branded preview AND what the actual document looks like |
| Sep 2026 | 4 layout types (Corporate/Technical/Creative/Service) | Different industries have different hiring cultures — one layout doesn't fit all |
| Sep 2026 | ATS target 85%+ | Industry benchmark shifted up from 75% to 85% between 2023–2026 |

