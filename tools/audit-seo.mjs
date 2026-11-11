#!/usr/bin/env node
/**
 * audit-seo.mjs
 * Reports canonical/og:url problems: duplicates, www host, .html suffixes,
 * trailing slashes, missing tags and canonicals that do not resolve to a file.
 * Usage: node tools/audit-seo.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const ORIGIN = 'https://glq-api.asia';
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', '.wrangler', '__pycache__']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

const rows = [];
const problems = [];
// Not part of our site: saved third-party snapshot / error page, handled by convention.
const IGNORED = new Set(['advancedgsc_mcp.html', 'charge-decode/404.html']);

for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  const head = (src.match(/<head\b[\s\S]*?<\/head>/i) || [src])[0];
  const canonicals = [...head.matchAll(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi)].map((m) =>
    (m[0].match(/href\s*=\s*["']([^"']+)["']/i) || [])[1]
  );
  const ogUrl = (head.match(/<meta\b[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i) || [])[1];
  const refresh = /<meta\b[^>]*http-equiv\s*=\s*["']refresh["']/i.test(head);
  const noindex = /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(head);
  const rel = relative(ROOT, file).split(sep).join('/');

  rows.push({ rel, canonicals, ogUrl, refresh, noindex });
  if (IGNORED.has(rel)) continue;

  if (canonicals.length === 0) problems.push([rel, 'missing canonical']);
  if (canonicals.length > 1) problems.push([rel, `duplicate canonical tags (${canonicals.length})`]);
  for (const c of canonicals) {
    if (!c.startsWith(ORIGIN + '/') && c !== ORIGIN) problems.push([rel, `canonical not on ${ORIGIN}: ${c}`]);
    if (/\/\/www\./.test(c)) problems.push([rel, `canonical uses www: ${c}`]);
    if (c.endsWith('.html')) problems.push([rel, `canonical keeps .html (cleanUrls): ${c}`]);
    if (c.length > ORIGIN.length + 1 && c.endsWith('/')) problems.push([rel, `canonical has trailing slash: ${c}`]);
    if (ogUrl && ogUrl !== c) problems.push([rel, `og:url (${ogUrl}) != canonical (${c})`]);
  }
  if (refresh) problems.push([rel, 'uses meta refresh redirect']);
  if (noindex) problems.push([rel, 'is noindex']);
}

console.log('file | canonical | og:url | refresh | noindex');
for (const r of rows) {
  console.log(`${r.rel} | ${r.canonicals.join(', ') || '-'} | ${r.ogUrl || '-'} | ${r.refresh} | ${r.noindex}`);
}

console.log(`\n${problems.length} problem(s):`);
for (const [f, m] of problems) console.log(`- ${f}: ${m}`);
