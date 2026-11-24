/**
 * Color utilities for the Theme editor.
 * Colors are stored as "R G B" space-separated strings (e.g. "79 126 255").
 */

/** Convert "R G B" string to CSS hex (#RRGGBB) */
export function rgbStringToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/)
  if (parts.length !== 3) return '#000000'
  const [r, g, b] = parts.map((n) => Math.max(0, Math.min(255, parseInt(n, 10))))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Convert CSS hex (#RRGGBB or #RGB) to "R G B" string */
export function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '')
  let r: number, g: number, b: number
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '0 0 0'
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
  const parse = (rgb: string) => rgb.trim().split(/\s+/).map((n) => parseInt(n, 10))
  const [r1, g1, b1] = parse(rgb1)
  const [r2, g2, b2] = parse(rgb2)
  if ([r1, g1, b1, r2, g2, b2].some(isNaN)) return 1
  const l1 = relativeLuminance(r1, g1, b1)
  const l2 = relativeLuminance(r2, g2, b2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
