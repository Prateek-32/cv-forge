# Builds docs/<slug>.html for each guide in content/guides, plus docs/guides.html.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools/build-guides.ps1
# To add a guide: write content/guides/<slug>.html in the same shape (comment block with
# title, h1, description and summary, then the article), add the slug to $ORDER below,
# run this, then add the page to docs/sitemap.xml and docs/llms.txt.
# ASCII only; content comes from the UTF-8 files in content/guides.
$docs = Join-Path $PSScriptRoot '..\docs'
$src = Join-Path $PSScriptRoot '..\content\guides'
$enc = New-Object Text.UTF8Encoding($false)
$SITE = 'https://fieldcraft.co.in/'
$DATE = '2026-09-25'; $DATE_TEXT = '25 September 2026'
$ORDER = @('resume-format-for-freshers','ats-friendly-resume','resume-vs-cv','portfolio-website-guide','cv-for-jobs-abroad')

$pricing = [IO.File]::ReadAllText("$docs\pricing.html")
$headTpl = $pricing.Substring(0, $pricing.IndexOf('<main>') + '<main>'.Length)
$headTpl = [regex]::Replace($headTpl, '\s*<script type="application/ld\+json">[\s\S]*?</script>', '')
$headTpl = $headTpl.Replace('<a href="pricing.html" aria-current="page">Pricing</a>', '<a href="pricing.html">Pricing</a>')
$footTpl = $pricing.Substring($pricing.IndexOf('<footer class="site-footer">'))

function Esc($s) { [Net.WebUtility]::HtmlEncode($s) }
function Head($file, $title, $desc) {
  $h = $headTpl
  $h = [regex]::Replace($h, '<title>[^<]*</title>', "<title>$(Esc $title)</title>")
  $h = [regex]::Replace($h, '<meta name="description" content="[^"]*">', "<meta name=`"description`" content=`"$(Esc $desc)`">")
  $h = [regex]::Replace($h, '<meta property="og:title" content="[^"]*">', "<meta property=`"og:title`" content=`"$(Esc $title)`">")
  $h = [regex]::Replace($h, '<meta property="og:description" content="[^"]*">', "<meta property=`"og:description`" content=`"$(Esc $desc)`">")
  $h = $h.Replace('https://fieldcraft.co.in/pricing.html', $SITE + $file)
  $h = $h.Replace('<meta property="og:type" content="website">', '<meta property="og:type" content="article">')
  return $h
}
function LD($o) { '<script type="application/ld+json">' + ($o | ConvertTo-Json -Depth 12 -Compress) + '</script>' }
function Plain($html) { [Net.WebUtility]::HtmlDecode(($html -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()) }

# ---- read every fragment ------------------------------------------------------------
$guides = [ordered]@{}
foreach ($slug in $ORDER) {
  $p = "$src\$slug.html"
  if (-not (Test-Path $p)) { "MISSING $slug"; continue }
  $raw = [IO.File]::ReadAllText($p)
  $m = [regex]::Match($raw, '<!--([\s\S]*?)-->')
  $meta = @{}
  foreach ($line in ($m.Groups[1].Value -split "`n")) { if ($line -match '^\s*(\w+):\s*(.+?)\s*$') { $meta[$matches[1]] = $matches[2] } }
  $body = $raw.Substring($m.Index + $m.Length).Trim()
  $words = ([regex]::Matches((Plain $body), '\S+')).Count
  $guides[$slug] = @{ slug = $slug; meta = $meta; body = $body; words = $words }
}

foreach ($g in $guides.Values) {
  $slug = $g.slug; $meta = $g.meta; $body = $g.body; $file = "$slug.html"
  $h1 = $meta.h1; $title = "$($meta.title) | Fieldcraft"
  $mins = [Math]::Max(3, [Math]::Round($g.words / 220))

  # contents list from the h2s (the FAQ included)
  $toc = ([regex]::Matches($body, '<h2 id="([^"]+)">([\s\S]*?)</h2>') | ForEach-Object { "<li><a href=`"#$($_.Groups[1].Value)`">$($_.Groups[2].Value)</a></li>" }) -join ''

  $faq = [regex]::Matches($body, '<summary>([\s\S]*?)</summary>\s*<p>([\s\S]*?)</p>') | ForEach-Object {
    @{ '@type' = 'Question'; name = (Plain $_.Groups[1].Value); acceptedAnswer = @{ '@type' = 'Answer'; text = (Plain $_.Groups[2].Value) } } }
  $graph = @(
    @{ '@type' = 'Article'; headline = (Plain $h1); description = $meta.description; abstract = $meta.summary
       url = $SITE + $file; mainEntityOfPage = $SITE + $file; inLanguage = 'en-IN'
       datePublished = $DATE; dateModified = $DATE; image = $SITE + 'og-image.png'; wordCount = $g.words
       author = @{ '@type' = 'Organization'; name = 'Fieldcraft'; url = $SITE }
       publisher = @{ '@type' = 'Organization'; '@id' = $SITE + '#org'; name = 'Fieldcraft'; logo = @{ '@type' = 'ImageObject'; url = $SITE + 'apple-touch-icon.png' } } },
    @{ '@type' = 'BreadcrumbList'; itemListElement = @(
       @{ '@type' = 'ListItem'; position = 1; name = 'Home'; item = $SITE },
       @{ '@type' = 'ListItem'; position = 2; name = 'Guides'; item = $SITE + 'guides.html' },
       @{ '@type' = 'ListItem'; position = 3; name = (Plain $h1); item = $SITE + $file }) })
  if ($faq) { $graph += @{ '@type' = 'FAQPage'; mainEntity = @($faq) } }

  $more = ($guides.Values | Where-Object { $_.slug -ne $slug } | ForEach-Object {
    "<a class=`"g-card`" href=`"$($_.slug).html`"><strong>$($_.meta.h1)</strong><span>$(Esc $_.meta.summary)</span></a>" }) -join "`n      "

  $html = (Head $file $title $meta.description).Replace('</head>', (LD @{ '@context' = 'https://schema.org'; '@graph' = $graph }) + "`n</head>") + @"

<article class="wrap guide">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="guides.html">Guides</a><span aria-hidden="true">/</span><span aria-current="page">$h1</span></nav>
  <span class="eyebrow">Guide</span>
  <h1>$h1</h1>
  <p class="g-meta">By Fieldcraft &middot; Updated $DATE_TEXT &middot; $mins min read</p>
  <p class="g-summary"><strong>In short:</strong> $($meta.summary)</p>
  <nav class="g-toc" aria-label="On this page"><strong>On this page</strong><ol>$toc</ol></nav>
  <div class="g-body">
$body
  </div>
  <aside class="g-cta">
    <div><span class="eyebrow">Want it done for you?</span>
    <h2>We rebuild resumes, CVs and portfolio sites for your field.</h2>
    <p>Resume &#8377;99 &middot; CV &#8377;199 &middot; LinkedIn &#8377;149 &middot; Portfolio website &#8377;699. Documents back within 24 hours; nothing charged until you agree the price.</p></div>
    <div class="g-cta-actions"><a class="btn" href="start.html">Start a build</a><a class="btn btn-outline" href="sample-cvs.html">See sample CVs</a></div>
  </aside>
  <nav class="g-more" aria-label="More guides"><h2>More guides</h2>
    <div class="g-cards">
      $more
    </div>
  </nav>
</article>

</main>

"@ + $footTpl
  [IO.File]::WriteAllText("$docs\$file", $html, $enc)
  "{0,-30} {1} words, {2} FAQ, toc {3}" -f $file, $g.words, @($faq).Count, ([regex]::Matches($toc, '<li>')).Count
}

# ---- the guides hub ------------------------------------------------------------------
$cards = ($guides.Values | ForEach-Object { "<a class=`"g-card`" href=`"$($_.slug).html`"><strong>$($_.meta.h1)</strong><span>$(Esc $_.meta.summary)</span></a>" }) -join "`n    "
$items = @(); $i = 0
foreach ($g in $guides.Values) { $i++; $items += @{ '@type' = 'ListItem'; position = $i; url = $SITE + "$($g.slug).html"; name = (Plain $g.meta.h1) } }
$hubLD = LD @{ '@context' = 'https://schema.org'; '@graph' = @(
  @{ '@type' = 'CollectionPage'; name = 'Resume, CV and portfolio guides'; url = $SITE + 'guides.html'; inLanguage = 'en-IN'; isPartOf = @{ '@id' = $SITE + '#site' } },
  @{ '@type' = 'ItemList'; itemListElement = $items },
  @{ '@type' = 'BreadcrumbList'; itemListElement = @(@{ '@type' = 'ListItem'; position = 1; name = 'Home'; item = $SITE }, @{ '@type' = 'ListItem'; position = 2; name = 'Guides'; item = $SITE + 'guides.html' }) }) }
$hub = (Head 'guides.html' 'Resume, CV & Portfolio Guides for India | Fieldcraft' 'Free, practical guides: resume format for freshers, ATS-friendly resumes, resume vs CV, portfolio websites and CVs for jobs abroad.').Replace('</head>', $hubLD + "`n</head>") + @"

<section class="wrap guide guides-hub">
  <span class="eyebrow">Guides</span>
  <h1>Resume, CV and portfolio guides</h1>
  <p class="lede">Free, practical answers to the questions people ask most &mdash; written for job
  seekers in India and Indians applying abroad.</p>
  <div class="g-cards g-cards-hub">
    $cards
  </div>
</section>

</main>

"@ + $footTpl
[IO.File]::WriteAllText("$docs\guides.html", $hub, $enc)
"guides.html built with $($guides.Count) guides"
