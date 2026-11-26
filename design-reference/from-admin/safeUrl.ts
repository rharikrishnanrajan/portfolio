/**
 * Safe URL validation and sanitization.
 *
 * Restricts URLs to safe protocols: http:, https:, mailto:, and tel:.
 * Rejects javascript:, data:, vbscript:, control characters, and obfuscation tricks.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

export interface SafeUrlOptions {
  /**
   * If false, only http: and https: are permitted (e.g. for images/previews).
   * Default: true
   */
  allowMailtoTel?: boolean
}

/**
 * Validates a URL and returns a sanitized string or null if unsafe/invalid.
 */
export function safeUrl(
  value: string | null | undefined,
  options: SafeUrlOptions = {}
): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  // Reject ASCII / Unicode control characters (0x00-0x1F, 0x7F-0x9F)
  // This blocks embedded null bytes (\0), tabs, newlines, and escape sequences
  if (/[\u0000-\u001F\u007F-\u009F]/.test(value)) return null

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    const allowMailtoTel = options.allowMailtoTel !== false

    if (HTTP_PROTOCOLS.has(protocol)) {
      // Must have a non-empty hostname
      if (!parsed.hostname) return null
      return trimmed
    }

    if (allowMailtoTel && ALLOWED_PROTOCOLS.has(protocol)) {
      // For mailto: and tel:, must contain an address/number
      if (!parsed.pathname && !parsed.search) return null
      return trimmed
    }

    return null
  } catch {
    return null
  }
}

/**
 * Helper for image, media, or download source URLs where only http: and https: are safe.
 */
export function safeImageUrl(value: string | null | undefined): string | null {
  return safeUrl(value, { allowMailtoTel: false })
}
