#!/usr/bin/env node
/**
 * verify-live.mjs
 * Post-deploy check: crawls every URL in sitemap.xml and verifies
 *  - HTTP 200 (no redirect)
 *  - exactly one <link rel="canonical">, absolute, https, no www/.html/trailing slash
 *  - canonical equals the fetched URL
 *  - every JSON-LD block parses as strict JSON
 *  - no <div> inside <head>
 * Usage: node tools/verify-live.mjs
 */
import { readFileSync } from 'node:fs';

const ORIGIN = 'https://glq-api.asia';
const norm = (u) => u.replace(/\/+$/, '');
const urls = [...readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const failures = [];

for (const url of urls) {
  const res = await fetch(url, { redirect: 'manual' });
  const html = await res.text();
  const problems = [];

  if (res.status !== 200) problems.push(`status ${res.status}`);

  const canonicals = [...html.matchAll(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi)].map(
    (m) => (m[0].match(/href\s*=\s*["']([^"']+)["']/i) || [])[1]
  );
  if (canonicals.length !== 1) problems.push(`${canonicals.length} canonical tag(s)`);
  else {
    const c = canonicals[0];
    if (!c.startsWith('https://glq-api.asia')) problems.push(`canonical host/relative: ${c}`);
    if (/\/\/www\./.test(c)) problems.push(`canonical uses www: ${c}`);
    if (/\.html$/.test(c)) problems.push(`canonical keeps .html: ${c}`);
    if (norm(c) !== norm(url)) problems.push(`canonical mismatch: ${c} != ${url}`);
  }

  const ld = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)];
  for (const [i, m] of ld.entries()) {
    try {
      JSON.parse(m[1]);
    } catch (err) {
      problems.push(`JSON-LD block ${i + 1}: ${err.message}`);
    }
  }

  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  if (/<(div|p|span|h1|img|iframe)\b/i.test(head)) problems.push('block element inside <head>');
  if (/<meta\b[^>]*http-equiv\s*=\s*["']refresh["']/i.test(head)) problems.push('meta refresh present');

  if (problems.length) failures.push({ url, problems });
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${url} (${ld.length} JSON-LD)`);
}

console.log('\n--- legacy URL redirects ---');
for (const path of ['/charge-decode/pages/spotify-usa.html', '/charge-decode/', '/blog/index.html']) {
  const res = await fetch(ORIGIN + path, { redirect: 'manual' });
  console.log(`${path} -> ${res.status} ${res.headers.get('location') || ''}`);
}

console.log(`\n${failures.length} failing URL(s).`);
for (const f of failures) console.log(`- ${f.url}: ${f.problems.join('; ')}`);
process.exit(failures.length ? 1 : 0);
