import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

const files = [
  'charge-decode/pages/bill-com.html',
  'charge-decode/pages/aplprinces.html',
  'charge-decode/pages/buy-guide.html',
  'charge-decode/pages/sq-charge.html',
  'charge-decode/pages/intuit-qb.html',
  'charge-decode/pages/amzn-mktp.html',
  'charge-decode/pages/apl-itunes-com-bill.html',
  'charge-decode/pages/msft-xbox-game-pass.html',
  'charge-decode/pages/linkedin-premium.html',
  'charge-decode/pages/paypal-netflix.html',
  'charge-decode/pages/pos-debit.html',
  'charge-decode/pages/msft-charge.html',
  'charge-decode/pages/youtube-premium.html',
  'charge-decode/pages/zoom-us.html',
  'charge-decode/pages/wp-wordpress-woocommerce.html',
  'charge-decode/pages/shutterstock.html',
  'charge-decode/pages/nytimes.html',
  'charge-decode/pages/fundstreet.html',
  'charge-decode/pages/dramabox.html',
  'charge-decode/pages/dri-pandasecurity.html',
  'charge-decode/pages/dri-avast.html',
  'charge-decode/pages/paddle-net-paddle-com.html',
  'charge-decode/pages/livepay1-com.html',
  'charge-decode/pages/join-ventures-pte-ltd.html',
  'charge-decode/pages/help-max-com.html',
  'charge-decode/pages/google-temp-hold.html',
  'charge-decode/pages/godaddy.html',
  'charge-decode/pages/foreign-transaction-fee.html',
  'charge-decode/pages/microsoft365.html',
  'charge-decode/pages/uber-trip.html',
  'charge-decode/pages/pypl.html',
  'charge-decode/pages/dri.html',
  'charge-decode/pages/spotify-usa.html',
  'charge-decode/pages/hulu.html',
];

// Canonical mapping: relative .html → absolute canonical URL (no .html)
const canon = {
  'spotify-usa.html': 'https://glq-api.asia/charge-decode/pages/spotify-usa',
  'hulu.html': 'https://glq-api.asia/charge-decode/pages/hulu',
  'youtube-premium.html': 'https://glq-api.asia/charge-decode/pages/youtube-premium',
  'paypal-netflix.html': 'https://glq-api.asia/charge-decode/pages/paypal-netflix',
  'nytimes.html': 'https://glq-api.asia/charge-decode/pages/nytimes',
  'intuit-qb.html': 'https://glq-api.asia/charge-decode/pages/intuit-qb',
  'google-temp-hold.html': 'https://glq-api.asia/charge-decode/pages/google-temp-hold',
  'linkedin-premium.html': 'https://glq-api.asia/charge-decode/pages/linkedin-premium',
  'uber-trip.html': 'https://glq-api.asia/charge-decode/pages/uber-trip',
};

let changed = 0;
for (const rel of files) {
  const content = readFileSync(rel, 'utf8');
  let newContent = content;

  // Replace in href="...html" pattern (9 merchant links)
  for (const [html, url] of Object.entries(canon)) {
    // Match href="<html>" exactly
    const re = new RegExp(`href="${html.replace('.', '\\.')}"`, 'g');
    newContent = newContent.replace(re, `href="${url}"`);
  }

  // Also fix JSON-LD BreadcrumbList absolute .html references
  // e.g. "item": "https://glq-api.asia/charge-decode/pages/dri.html" → strip .html
  newContent = newContent.replace(
    /(https:\/\/glq-api\.asia\/charge-decode\/pages\/[a-z0-9-]+)\.html/g,
    '$1'
  );

  if (newContent !== content) {
    writeFileSync(rel, newContent);
    console.log('updated:', rel);
    changed++;
  }
}
console.log(`total updated: ${changed}`);
