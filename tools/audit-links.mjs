#!/usr/bin/env node
/**
 * audit-links.mjs
 * Resolves every internal href to the URL Vercel would serve and reports:
 *  - REDIRECT: hrefs that hit a 308/301 (trailing ".html", "/index.html", trailing slash)
 *  - 404: hrefs whose target file does not exist in the repo
 * Usage: node tools/audit-links.mjs [--fix]
 *   --fix rewrites internal .html hrefs to their clean equivalent in place.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, posix } from 'node:path';

const ROOT = process.cwd();
const ORIGIN = 'https://glq-api.asia';
const FIX = process.argv.includes('--fix');
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', '.wrangler', '__pycache__', 'database', 'tools']);

function walk(dir, filter, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, filter, out);
    else if (filter(entry)) out.push(full);
  }
  return out;
}

const htmlFiles = walk(ROOT, (n) => n.toLowerCase().endsWith('.html'));

function fileForPath(urlPath) {
  let p = urlPath.replace(/^\/+/, '');
  if (p === '') p = 'index.html';
  const candidates = [];
  if (p.endsWith('/')) candidates.push(p + 'index.html');
  candidates.push(p, p + '.html', p + '/index.html');
  for (const c of candidates) {
    const abs = join(ROOT, c.split('/').join(sep));
    if (existsSync(abs) && statSync(abs).isFile()) return abs;
  }
  return null;
}

function cleanPath(urlPath) {
  let p = urlPath.replace(/\/index\.html?$/i, '').replace(/\.html?$/i, '');
  p = p.replace(/\/index$/i, '');
  p = p.replace(/\/+$/, '');
  if (p === '') p = '/';
  return p;
}

const problems = [];
const rewrites = new Map();
// Saved third-party snapshot: its links intentionally point at another site's root.
const EXTERNAL_SNAPSHOTS = new Set(['advancedgsc_mcp.html']);

for (const file of htmlFiles) {
  const src = readFileSync(file, 'utf8');
  const relFile = relative(ROOT, file).split(sep).join('/');
  if (EXTERNAL_SNAPSHOTS.has(relFile)) continue;
  const dirRel = posix.dirname(relFile) === '.' ? '' : posix.dirname(relFile);
  const baseUrl = ORIGIN + '/' + (dirRel ? dirRel + '/' : '');
  const selfPath = cleanPath('/' + relFile);
  const hrefRe = /href\s*=\s*(["'])([^"']+)\1/gi;
  let m;

  while ((m = hrefRe.exec(src)) !== null) {
    const raw = m[2];
    if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript|data):/i.test(raw)) continue;

    let url;
    try {
      url = new URL(raw, baseUrl);
    } catch { continue; }
    if (url.host !== 'glq-api.asia') continue;

    const path = url.pathname;
    const target = fileForPath(path);
    const clean = cleanPath(path);

    if (!target) {
      problems.push([relFile, raw, '404: no file serves this URL']);
      continue;
    }

    const needsRedirect =
      /\.html?$/i.test(path) || /\/index(\.html)?$/i.test(path) || (path.endsWith('/') && path !== '/');

    if (needsRedirect) {
      problems.push([relFile, raw, `REDIRECT -> ${clean}`]);
      // Placeholders such as "[merchant-slug]" live in the article template only.
      if (!FIX || raw.includes('[')) continue;
      const suffix = (url.search || '') + (url.hash || '');
      let replacement;
      if (clean === selfPath) {
        // Same page: drop the redundant filename, keep the fragment.
        replacement = clean + suffix;
      } else if (/^https?:/i.test(raw)) {
        // Keep canonical/absolute URLs absolute.
        replacement = ORIGIN + clean + suffix;
      } else {
        replacement = clean + suffix;
      }
      if (!rewrites.has(file)) rewrites.set(file, new Map());
      rewrites.get(file).set(raw, replacement);
    }
  }
}

if (FIX) {
  for (const [file, map] of rewrites) {
    let src = readFileSync(file, 'utf8');
    for (const [oldHref, newHref] of map) {
      const esc = oldHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      src = src.replace(new RegExp(`href\\s*=\\s*(["'])${esc}\\1`, 'gi'), (full, q) => `href=${q}${newHref}${q}`);
    }
    writeFileSync(file, src, 'utf8');
  }
  console.log(`Rewrote hrefs in ${rewrites.size} file(s).`);
}

const group = new Map();
for (const [f, href, msg] of problems) {
  if (!group.has(msg)) group.set(msg, []);
  group.get(msg).push(`${f}: ${href}`);
}
for (const [msg, list] of [...group.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${msg} (${list.length})`);
  const uniq = [...new Set(list)];
  for (const l of uniq.slice(0, 30)) console.log('  ' + l);
  if (uniq.length > 30) console.log(`  ... and ${uniq.length - 30} more unique`);
}
console.log(`\nTotal internal link problems: ${problems.length}`);
