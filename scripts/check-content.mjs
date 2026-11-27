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
    process.exit(1)
  }

  let normalizedUrl
  try {
    normalizedUrl = new URL(url).toString()
  } catch {
    console.error('FAIL: Invalid VITE_SUPABASE_URL')
    process.exit(1)
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
    process.exit(1)
  }

  if (!response.ok) {
    console.error(`FAIL: RPC returned ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  let data
  try {
    data = await response.json()
  } catch {
    console.error('FAIL: Invalid JSON response')
    process.exit(1)
  }

  if (!data || typeof data !== 'object') {
    console.error('FAIL: Unexpected response shape')
    process.exit(1)
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
  }))

  const skills = Array.isArray(data.skill_domains) ? data.skill_domains : []
  const education = Array.isArray(data.education) ? data.education : []
  const certifications = Array.isArray(data.certifications) ? data.certifications : []
  const publications = Array.isArray(data.publications) ? data.publications : []

  const profile = data.profile || {}
  const hasAvatar = typeof profile.avatar_url === 'string' && profile.avatar_url.trim().length > 0
  const hasResume = typeof profile.resume_url === 'string' && profile.resume_url.trim().length > 0

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
    console.log(`  - ${truncate(p.title)} [${repo}, ${live}, ${docs}]`)
  }
  console.log(`skills: ${skills.length}`)
  console.log(`education: ${education.length}`)
  console.log(`certifications: ${certifications.length}`)
  console.log(`publications: ${publications.length}`)
  console.log(`profile.avatar_url: ${hasAvatar ? 'set' : 'unset'}`)
  console.log(`profile.resume_url: ${hasResume ? 'set' : 'unset'}`)

  process.exit(0)
}

main()