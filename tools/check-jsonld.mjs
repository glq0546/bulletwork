#!/usr/bin/env node
/**
 * check-jsonld.mjs
 * Strictly validates every <script type="application/ld+json"> block in the repo.
 * Usage: node tools/check-jsonld.mjs
 * Exit code 1 when any block fails to parse.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', '.wrangler', '__pycache__']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

const LD_RE = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;

let files = 0;
let blocks = 0;
const failures = [];

// Optional: validate explicit files instead of walking the repo.
const targets = process.argv.slice(2).length ? process.argv.slice(2) : walk(ROOT);

for (const file of targets) {
  files += 1;
  const src = readFileSync(file, 'utf8');
  let match;
  let index = 0;
  while ((match = LD_RE.exec(src)) !== null) {
    index += 1;
    blocks += 1;
    const body = match[1];
    const startLine = src.slice(0, match.index).split('\n').length;
    try {
      JSON.parse(body);
    } catch (err) {
      failures.push({
        file: relative(ROOT, file),
        block: index,
        startLine,
        message: err.message,
        snippet: body.trim().slice(0, 220).replace(/\s+/g, ' '),
      });
    }
  }

  // Detect an unclosed JSON-LD block (missing </script>, usually a broken brace run).
  const openCount = (src.match(/<script\b[^>]*application\/ld\+json/gi) || []).length;
  if (openCount !== index) {
    failures.push({
      file: relative(ROOT, file),
      block: '?',
      startLine: '-',
      message: `unterminated JSON-LD block (${openCount} opening tags vs ${index} closed)`,
      snippet: '',
    });
  }
}

console.log(`Scanned ${files} HTML files, found ${blocks} JSON-LD blocks.`);
if (failures.length === 0) {
  console.log('OK: every JSON-LD block parses as strict JSON.');
  process.exit(0);
}

console.log(`\nFAIL: ${failures.length} invalid block(s):\n`);
for (const f of failures) {
  console.log(`- ${f.file} (block #${f.block}, script starts line ${f.startLine})`);
  console.log(`  ${f.message}`);
  if (f.snippet) console.log(`  > ${f.snippet}`);
}
process.exit(1);
