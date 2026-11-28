#!/usr/bin/env node
/**
 * check-content.mjs
 *
 * Fetches site content from Supabase and prints a summary.
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from process.env,
 * then falls back to parsing .env.local (same logic as scripts/snapshot.mjs).
 * Exits 0 on success, 1 on failure with a clear one-line reason.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

function parseEnvFile(filePath) {
  const env = {}
  try {
    const content = readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  } catch {
    // Ignore missing/unreadable file
  }
  return env
}

function getConfig() {
  // Priority: process.env > .env.local > .env
  let url = process.env.VITE_SUPABASE_URL
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const envLocal = parseEnvFile(resolve('.env.local'))
    url = url ?? envLocal.VITE_SUPABASE_URL
    anonKey = anonKey ?? envLocal.VITE_SUPABASE_ANON_KEY
  }

  if (!url || !anonKey) {
    const env = parseEnvFile(resolve('.env'))
    url = url ?? env.VITE_SUPABASE_URL
    anonKey = anonKey ?? env.VITE_SUPABASE_ANON_KEY
  }

  return { url, anonKey }
}

function truncate(str, max = 60) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

async function main() {
  const { url, anonKey } = getConfig()

  if (!url || !anonKey) {
    console.error('FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    process.exitCode = 1
    return
  }

  let normalizedUrl
  try {
    normalizedUrl = new URL(url).toString()
  } catch {
    console.error('FAIL: Invalid VITE_SUPABASE_URL')
    process.exitCode = 1
    return
  }

  const rpcEndpoint = new URL('/rest/v1/rpc/get_site_content', normalizedUrl).toString()

  let response
  try {
    response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: anonKey,
      },
      body: '{}',
    })
  } catch (err) {
    console.error(`FAIL: Network error - ${err.message}`)
    process.exitCode = 1
    return
  }

  if (!response.ok) {
    console.error(`FAIL: RPC returned ${response.status} ${response.statusText}`)
    process.exitCode = 1
    return
  }

  let data
  try {
    data = await response.json()
  } catch {
    console.error('FAIL: Invalid JSON response')
    process.exitCode = 1
    return
  }

  if (!data || typeof data !== 'object') {
    console.error('FAIL: Unexpected response shape')
    process.exitCode = 1
    return
  }

  // Print summary - ONLY counts and titles, never keys
  const version = typeof data.version === 'number' ? data.version : 0

  const sections = Array.isArray(data.sections) ? data.sections : []
  const visibleSections = sections.filter((s) => s?.visible !== false)

  const projects = Array.isArray(data.projects) ? data.projects : []
  const projectSummaries = projects.map((p) => ({
    title: typeof p.title === 'string' ? p.title : 'Untitled',
    hasRepo: typeof p.github_url === 'string' && p.github_url.trim().length > 0,
    hasLiveDemo: typeof p.live_url === 'string' && p.live_url.trim().length > 0,
    docCount: Array.isArray(p.files) ? p.files.length : 0,
    hasCover: typeof p.cover_url === 'string' && p.cover_url.trim().length > 0,
  }))

  const skills = Array.isArray(data.skill_domains) ? data.skill_domains : []
  const education = Array.isArray(data.education) ? data.education : []
  const certifications = Array.isArray(data.certifications) ? data.certifications : []
  const publications = Array.isArray(data.publications) ? data.publications : []
  const socialLinks = Array.isArray(data.social_links) ? data.social_links : []

  const profile = data.profile || {}
  const hasAvatar = typeof profile.avatar_url === 'string' && profile.avatar_url.trim().length > 0
  const hasResume = typeof profile.resume_url === 'string' && profile.resume_url.trim().length > 0

  // --- helpers (F9) ---
  // Allowed Supabase storage prefixes (mirrors safeUrl.ts)
  const STORAGE_PREFIXES = ['project-documents/', 'portfolio/']
  function looksLikeStorageUrl(url) {
    if (typeof url !== 'string' || !url) return false
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:') return false
      const path = parsed.pathname
      return STORAGE_PREFIXES.some((prefix) => path.includes(`/object/public/${prefix}`))
    } catch {
      return false
    }
  }
  function isPdfUrl(url) {
    if (typeof url !== 'string' || !url) return false
    try {
      return new URL(url).pathname.toLowerCase().endsWith('.pdf')
    } catch {
      return url.toLowerCase().endsWith('.pdf')
    }
  }

  console.log(`version: ${version}`)
  console.log(`sections: ${visibleSections.length}`)
  for (const s of visibleSections) {
    const slug = typeof s.slug === 'string' ? s.slug : 'unknown'
    console.log(`  - ${slug} (visible)`)
  }
  console.log(`projects: ${projects.length}`)
  for (const p of projectSummaries) {
    const repo = p.hasRepo ? 'repo ✓' : 'repo ✗'
    const live = p.hasLiveDemo ? 'live ✓' : 'live ✗'
    const docs = p.docCount > 0 ? `docs ${p.docCount}` : 'docs 0'
    const cover = p.hasCover ? 'cover ✓' : 'cover ✗'
    console.log(`  - ${truncate(p.title)} [${repo}, ${live}, ${docs}, ${cover}]`)
  }
  console.log(`skills: ${skills.length}`)
  console.log(`education: ${education.length}`)

  // F9: Certifications — show pdf ✓/✗ per entry
  console.log(`certifications: ${certifications.length}`)
  for (const c of certifications) {
    const credUrl = c?.credential_url ?? ''
    const hasPdf = isPdfUrl(credUrl) || looksLikeStorageUrl(credUrl)
    const title = typeof c?.title === 'string' ? truncate(c.title, 50) : 'Untitled'
    console.log(`  - ${title} [pdf ${hasPdf ? '✓' : '✗'}]`)
  }

  // F9: Publications — show url set/unset and storage doc ✓/✗
  console.log(`publications: ${publications.length}`)
  for (const p of publications) {
    const pubTitle = typeof p?.title === 'string' ? truncate(p.title, 50) : 'Untitled'
    const hasUrl = typeof p?.url === 'string' && p.url.trim().length > 0
    const hasStorageDoc = Array.isArray(p?.files)
      ? p.files.some((f) => looksLikeStorageUrl(f?.url))
      : looksLikeStorageUrl(p?.document_url)
    console.log(`  - ${pubTitle} [url: ${hasUrl ? 'set' : 'unset'}, storage doc: ${hasStorageDoc ? '✓' : '✗'}]`)
  }

  // F9: Social links — icons list (counts only, no URLs or private keys)
  console.log(`social_links: ${socialLinks.length}`)
  const iconCounts = {}
  for (const link of socialLinks) {
    const icon = typeof link?.icon === 'string' ? link.icon.toLowerCase().trim() : 'unknown'
    iconCounts[icon] = (iconCounts[icon] ?? 0) + 1
  }
  for (const [icon, count] of Object.entries(iconCounts)) {
    console.log(`  - icon "${icon}": ${count}`)
  }

  console.log(`profile.avatar_url: ${hasAvatar ? 'set' : 'unset'}`)
  console.log(`profile.resume_url: ${hasResume ? 'set' : 'unset'}`)

  process.exitCode = 0
}

main()