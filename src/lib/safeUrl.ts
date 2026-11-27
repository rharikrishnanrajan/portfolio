/**
 * Safe URL validation and sanitization.
 *
 * - safeUrl(): permits only http:, https:, mailto:, and tel:.
 * - safeImageUrl(): permits ONLY https: URLs on the configured Supabase host
 *   under /storage/v1/object/public/.
 * - safeHeroTarget(): permits internal section anchors (#slug) or safeUrl().
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const HTTP_PROTOCOLS = new Set(['http:', 'https:'])
const HERO_ANCHOR_RE = /^#[a-z0-9-]{1,60}$/
const PUBLIC_STORAGE_PREFIX = '/storage/v1/object/public/'
const ALLOWED_STORAGE_PREFIXES = [
  '/storage/v1/object/public/project-documents/',
  '/storage/v1/object/public/portfolio/',
] as const

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true
  }
  return false
}

export interface SafeUrlOptions {
  /**
   * If false, only http: and https: are permitted.
   * Default: true
   */
  allowMailtoTel?: boolean
}

/**
 * Validates a URL and returns a sanitized string or null if unsafe/invalid.
 */
export function safeUrl(
  value: string | null | undefined,
  options: SafeUrlOptions = {},
): string | null {
  if (!value || typeof value !== 'string') return null
  if (hasControlChars(value)) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    const allowMailtoTel = options.allowMailtoTel !== false

    if (HTTP_PROTOCOLS.has(protocol)) {
      if (!parsed.hostname) return null
      return trimmed
    }

    if (allowMailtoTel && ALLOWED_PROTOCOLS.has(protocol)) {
      if (!parsed.pathname && !parsed.search) return null
      return trimmed
    }

    return null
  } catch {
    return null
  }
}

function getAllowedStorageHostname(supabaseUrlOverride?: string): string | null {
  const raw =
    supabaseUrlOverride !== undefined
      ? supabaseUrlOverride
      : typeof import.meta !== 'undefined' && import.meta.env
        ? import.meta.env.VITE_SUPABASE_URL
        : ''

  if (!raw || typeof raw !== 'string') return null
  try {
    const parsed = new URL(raw.trim())
    if (parsed.protocol.toLowerCase() !== 'https:') return null
    return parsed.hostname.toLowerCase() || null
  } catch {
    return null
  }
}

/**
 * Validates a stored image or public storage file URL:
 * - https: only
 * - hostname must equal the hostname of VITE_SUPABASE_URL
 * - normalized pathname must start with /storage/v1/object/public/
 */
export function safeImageUrl(
  value: string | null | undefined,
  supabaseUrlOverride?: string,
): string | null {
  if (!value || typeof value !== 'string') return null
  if (hasControlChars(value)) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const allowedHost = getAllowedStorageHostname(supabaseUrlOverride)
  if (!allowedHost) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol.toLowerCase() !== 'https:') return null
    if (parsed.hostname.toLowerCase() !== allowedHost) return null
    if (!parsed.pathname.startsWith(PUBLIC_STORAGE_PREFIX)) return null
    if (parsed.pathname.length <= PUBLIC_STORAGE_PREFIX.length) return null
    return trimmed
  } catch {
    return null
  }
}

/**
 * Validates hero CTA targets: internal #section-slug anchors or safe external/mailto/tel URLs.
 */
export function safeHeroTarget(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null
  if (hasControlChars(value)) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  if (HERO_ANCHOR_RE.test(trimmed)) return trimmed
  return safeUrl(trimmed)
}

/**
 * Validates a stored document/file URL from Supabase storage:
 * - https: only
 * - hostname must equal the hostname of VITE_SUPABASE_URL
 * - normalized pathname must start with /storage/v1/object/public/project-documents/ OR /storage/v1/object/public/portfolio/
 */
export function safeStorageUrl(
  value: string | null | undefined,
  supabaseUrlOverride?: string,
): string | null {
  if (!value || typeof value !== 'string') return null
  if (hasControlChars(value)) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const allowedHost = getAllowedStorageHostname(supabaseUrlOverride)
  if (!allowedHost) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol.toLowerCase() !== 'https:') return null
    if (parsed.hostname.toLowerCase() !== allowedHost) return null
    const isAllowedPrefix = ALLOWED_STORAGE_PREFIXES.some((prefix) =>
      parsed.pathname.startsWith(prefix),
    )
    if (!isAllowedPrefix) return null
    if (parsed.pathname.length <= PUBLIC_STORAGE_PREFIX.length) return null
    return trimmed
  } catch {
    return null
  }
}
