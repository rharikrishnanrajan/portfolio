#!/usr/bin/env node
/**
 * verify-dist.mjs — Post-build safety checks.
 * Run with: node scripts/verify-dist.mjs
 * Exit 1 if any check fails; exit 0 if all pass.
 * Prints only PASS/FAIL lines and file names — never file contents.
 *
 * Checks:
 *  1. No .map source-map files in dist/
 *  2. No forbidden secret strings (service_role, sb_secret_, SUPABASE_SERVICE)
 *  3. No inline <script> without src in index.html (CSP violation)
 *  4. No http:// Supabase URLs (must be https://)
 *  5. Main index-*.js bundle ≤ 150 kB gzipped
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR = join(__dirname, '..', 'dist')
const MAX_MAIN_GZIP_KB = 150
const FORBIDDEN_STRINGS = ['service_role', 'sb_secret_', 'SUPABASE_SERVICE']

let failures = 0

function pass(msg) { console.log(`PASS: ${msg}`) }
function fail(msg) { console.log(`FAIL: ${msg}`); failures++ }

function walkDir(dir, cb) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walkDir(full, cb)
    else cb(full)
  }
}

if (!existsSync(DIST_DIR)) {
  fail('dist/ directory does not exist — run npm run build first')
  process.exit(1)
}

const allFiles = []
walkDir(DIST_DIR, (f) => allFiles.push(f))

// 1. No .map files
const mapFiles = allFiles.filter((f) => f.endsWith('.map'))
if (mapFiles.length === 0) {
  pass('No .map source-map files in dist/')
} else {
  for (const f of mapFiles) fail(`Source map found: ${relative(DIST_DIR, f)}`)
}

// 2. No forbidden strings in text assets
const textFiles = allFiles.filter((f) => /\.(js|html|css|json)$/.test(f))
let secretFound = false
for (const f of textFiles) {
  const content = readFileSync(f, 'utf8')
  for (const s of FORBIDDEN_STRINGS) {
    if (content.includes(s)) {
      fail(`Forbidden string "${s}" in: ${relative(DIST_DIR, f)}`)
      secretFound = true
    }
  }
}
if (!secretFound) pass('No forbidden secret strings found in dist/')

// 3. No inline <script> in index.html
const indexHtml = join(DIST_DIR, 'index.html')
if (existsSync(indexHtml)) {
  const html = readFileSync(indexHtml, 'utf8')
  // A <script> tag is "inline" if it has no src attribute and contains code
  const inlineRe = /<script(?![^>]*\bsrc\s*=)[^>]*>\s*\S/gi
  if (inlineRe.test(html)) {
    fail('Inline <script> without src found in index.html — violates CSP')
  } else {
    pass('No inline <script> (without src) in index.html')
  }
} else {
  fail('dist/index.html not found')
}

// 4. No http:// Supabase URLs
const jsFiles = allFiles.filter((f) => f.endsWith('.js'))
let httpFound = false
for (const f of jsFiles) {
  const content = readFileSync(f, 'utf8')
  if (/http:\/\/[a-z0-9-]+\.supabase\.(co|io)/i.test(content)) {
    fail(`Non-https Supabase URL in: ${relative(DIST_DIR, f)}`)
    httpFound = true
  }
}
if (!httpFound) pass('All Supabase URLs use https://')

// 5. Main bundle size
const assetsDir = join(DIST_DIR, 'assets')
if (existsSync(assetsDir)) {
  const mainBundles = readdirSync(assetsDir).filter((f) => /^index-.*\.js$/.test(f))
  if (mainBundles.length === 0) {
    fail('No index-*.js main bundle found in dist/assets/')
  } else {
    for (const bundle of mainBundles) {
      const buf = readFileSync(join(assetsDir, bundle))
      const gzKb = (gzipSync(buf).length / 1024).toFixed(1)
      const rawKb = (buf.length / 1024).toFixed(1)
      if (Number(gzKb) > MAX_MAIN_GZIP_KB) {
        fail(`${bundle}: ${gzKb} kB gzipped > ${MAX_MAIN_GZIP_KB} kB limit (raw: ${rawKb} kB)`)
      } else {
        pass(`${bundle}: ${gzKb} kB gzipped, raw ${rawKb} kB — within ${MAX_MAIN_GZIP_KB} kB`)
      }
    }
  }
} else {
  fail('dist/assets/ not found')
}

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED.`)
  process.exit(1)
}
console.log('\nAll checks PASSED.')
