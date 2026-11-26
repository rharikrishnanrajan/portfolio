import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_PATH = resolve(ROOT, 'src', 'generated', 'content.snapshot.json')

const EMPTY_SNAPSHOT = {
  version: 0,
  settings: {
    logo_text: 'HK',
    brand_name: 'Portfolio',
    nav_cta_label: "Let's Connect",
    hero: {
      roles: [],
      chips_left: [],
      chips_right: [],
      stats: [],
    },
    footer: {},
    theme: {
      default_mode: 'dark',
      fonts: {
        heading: 'Inter Variable',
        mono: 'JetBrains Mono Variable',
      },
    },
    seo: {},
  },
  profile: null,
  sections: [],
  social_links: [],
  overview_rows: [],
  competencies: [],
  skill_domains: [],
  projects: [],
  education: [],
  certifications: [],
  publications: [],
}

function loadEnvFallback() {
  const candidates = ['.env.local', '.env']
  for (const filename of candidates) {
    const filePath = resolve(ROOT, filename)
    if (!existsSync(filePath)) continue
    try {
      const text = readFileSync(filePath, 'utf8')
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        const eqIdx = line.indexOf('=')
        if (eqIdx <= 0) continue
        const key = line.slice(0, eqIdx).trim()
        let val = line.slice(eqIdx + 1).trim()
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1)
        }
        if (!(key in process.env) || !process.env[key]) {
          process.env[key] = val
        }
      }
    } catch {
      // Ignore unreadable env files; build must remain non-fatal
    }
  }
}

function writeSnapshot(data) {
  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function isValidSnapshotShape(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const requiredArrays = [
    'sections',
    'social_links',
    'overview_rows',
    'competencies',
    'skill_domains',
    'projects',
    'education',
    'certifications',
    'publications',
  ]
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) return false
  }
  if (!data.settings || typeof data.settings !== 'object') return false
  return true
}

async function main() {
  loadEnvFallback()

  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !anonKey) {
    process.stdout.write(
      '[snapshot] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (check .env.local or build env vars); writing empty snapshot.\n',
    )
    writeSnapshot(EMPTY_SNAPSHOT)
    return
  }

  let parsed
  let endpoint
  try {
    parsed = new URL(supabaseUrl)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Invalid protocol')
    }
    const base = parsed.toString().replace(/\/+$/, '')
    endpoint = `${base}/rest/v1/rpc/get_site_content`
  } catch {
    process.stdout.write('[snapshot] Invalid VITE_SUPABASE_URL; writing empty snapshot.\n')
    writeSnapshot(EMPTY_SNAPSHOT)
    return
  }

  const host = parsed.host
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: anonKey,
      },
      body: '{}',
      signal: controller.signal,
    })

    if (!response.ok) {
      process.stdout.write(
        `[snapshot] ${host} returned HTTP ${response.status} — check that supabase/05_public_api.sql was run and that env vars are set; writing empty snapshot.\n`,
      )
      writeSnapshot(EMPTY_SNAPSHOT)
      return
    }

    const payload = await response.json()
    if (!isValidSnapshotShape(payload)) {
      process.stdout.write('[snapshot] Unexpected RPC payload shape; writing empty snapshot.\n')
      writeSnapshot(EMPTY_SNAPSHOT)
      return
    }

    writeSnapshot(payload)
    process.stdout.write(
      `[snapshot] Wrote snapshot (version ${typeof payload.version === 'number' ? payload.version : 0}).\n`,
    )
  } catch (err) {
    const reason =
      err instanceof Error && err.name === 'AbortError'
        ? 'request timed out after 10s'
        : err instanceof Error
          ? err.message
          : 'network or fetch error'
    process.stdout.write(
      `[snapshot] Request to ${host} failed (${reason}) — check that supabase/05_public_api.sql was run and that env vars are set; writing empty snapshot.\n`,
    )
    writeSnapshot(EMPTY_SNAPSHOT)
  } finally {
    clearTimeout(timer)
  }
}

await main()
