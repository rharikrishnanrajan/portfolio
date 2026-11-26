import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../lib/color'
import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../lib/theme'

/**
 * WCAG AA requires ≥ 4.5:1 for normal text.
 * We test the default dark and light palettes: text and muted colours
 * against their background (bg) and surface colours.
 *
 * accent is used for interactive highlights / focus rings, not body text,
 * so it is not tested here.
 */

const MIN_CONTRAST = 4.5

describe('WCAG contrast — default dark palette', () => {
  const p = DEFAULT_DARK_PALETTE

  it('text on bg meets AA', () => {
    expect(contrastRatio(p.text, p.bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('text on surface meets AA', () => {
    expect(contrastRatio(p.text, p.surface)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('muted on bg meets AA', () => {
    expect(contrastRatio(p.muted, p.bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('muted on surface meets AA', () => {
    expect(contrastRatio(p.muted, p.surface)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})

describe('WCAG contrast — default light palette', () => {
  const p = DEFAULT_LIGHT_PALETTE

  it('text on bg meets AA', () => {
    expect(contrastRatio(p.text, p.bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('text on surface meets AA', () => {
    expect(contrastRatio(p.text, p.surface)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('muted on bg meets AA', () => {
    expect(contrastRatio(p.muted, p.bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('muted on surface meets AA', () => {
    expect(contrastRatio(p.muted, p.surface)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
