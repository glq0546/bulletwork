// Injects BreadcrumbList JSON-LD into every page in ./pages/*.html
// Idempotent: skips files that already contain "BreadcrumbList".
const fs = require('fs');
const path = require('path');

const PAGES = path.join(__dirname, 'pages');
const BASE = 'https://glq-api.asia/charge-decode';

// Merchant name comes from the <title> tag: "What is <NAME> on my credit card statement?"
function extractMerchant(html, file) {
  const m = html.match(/<title>What is ([^<]+?) on my credit card statement\?/i);
  if (m) return m[1].trim();
  // Fallback: derive from filename for non-merchant pages (e.g. buy-guide)
  return file.replace(/\.html$/, '').replace(/-/g, ' ').toUpperCase();
}

function breadcrumbJsonLd(name, fileUrl) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/index.html` },
      { '@type': 'ListItem', position: 2, name: name, item: fileUrl }
    ]
  };
  return `\n    <script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n    </script>\n`;
}

const files = fs.readdirSync(PAGES).filter(f => f.endsWith('.html'));
const modified = [];
const skipped = [];

for (const file of files) {
  const full = path.join(PAGES, file);
  let html = fs.readFileSync(full, 'utf8');
  if (html.includes('"BreadcrumbList"')) {
    skipped.push(file);
    continue;
  }
  const merchant = extractMerchant(html, file);
  const fileUrl = `${BASE}/pages/${file}`;
  const snippet = breadcrumbJsonLd(merchant, fileUrl);

  // Prefer to inject right after the existing FAQPage JSON-LD closing </script>.
  const faqCloseRe = /(<script[^>]*application\/ld\+json[^>]*>[\s\S]*?"FAQPage"[\s\S]*?<\/script>)/i;
  if (faqCloseRe.test(html)) {
    html = html.replace(faqCloseRe, `$1${snippet}`);
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `${snippet}</head>`);
  } else {
    skipped.push(`${file} (no </head>)`);
    continue;
  }

  fs.writeFileSync(full, html, 'utf8');
  modified.push(file);
}

console.log('Modified files:', modified.length);
modified.forEach(f => console.log('  -', f));
console.log('Skipped (already had BreadcrumbList):', skipped.length);
skipped.forEach(f => console.log('  -', f));
