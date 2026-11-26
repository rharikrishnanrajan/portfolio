/**
 * Color utilities for theme validation and WCAG contrast calculation.
 * Colors are stored as "R G B" space-separated strings (e.g. "79 126 255").
 */

const RGB_STRING_RE = /^\d{1,3} \d{1,3} \d{1,3}$/

/**
 * Validates that a value is strictly "R G B" with each channel an integer 0-255.
 */
export function isValidRgbString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (!RGB_STRING_RE.test(value)) return false
  const parts = value.split(' ')
  if (parts.length !== 3) return false
  return parts.every((part) => {
    const n = Number(part)
    return Number.isInteger(n) && n >= 0 && n <= 255
  })
}

/**
 * Returns the validated "R G B" string or the provided fallback.
 */
export function safeRgbString(value: unknown, fallback: string): string {
  return isValidRgbString(value) ? value : fallback
}

/** Convert "R G B" string to CSS hex (#RRGGBB) */
export function rgbStringToHex(rgb: string): string {
  if (!isValidRgbString(rgb)) return '#000000'
  const [r, g, b] = rgb.split(' ').map((n) => Number(n))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Convert CSS hex (#RRGGBB or #RGB) to "R G B" string */
export function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '')
  let r: number
  let g: number
  let b: number
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  } else {
    return '0 0 0'
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '0 0 0'
  return `${r} ${g} ${b}`
}

/** Relative luminance per WCAG 2.1 */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** WCAG contrast ratio between two "R G B" strings */
export function contrastRatio(rgb1: string, rgb2: string): number {
  if (!isValidRgbString(rgb1) || !isValidRgbString(rgb2)) return 1
  const [r1, g1, b1] = rgb1.split(' ').map(Number)
  const [r2, g2, b2] = rgb2.split(' ').map(Number)
  const l1 = relativeLuminance(r1, g1, b1)
  const l2 = relativeLuminance(r2, g2, b2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
