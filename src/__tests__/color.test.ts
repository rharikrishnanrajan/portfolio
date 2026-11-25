import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToRgbString, isValidRgbString, rgbStringToHex, safeRgbString } from '../lib/color'

describe('color validation and utilities', () => {
  it('accepts valid "R G B" strings within 0-255', () => {
    expect(isValidRgbString('0 0 0')).toBe(true)
    expect(isValidRgbString('255 255 255')).toBe(true)
    expect(isValidRgbString('79 126 255')).toBe(true)
    expect(safeRgbString('79 126 255', '0 0 0')).toBe('79 126 255')
  })

  it('rejects out-of-range channels, named colors, and CSS injection payloads', () => {
    expect(isValidRgbString('999 0 0')).toBe(false)
    expect(isValidRgbString('256 10 10')).toBe(false)
    expect(isValidRgbString('-1 0 0')).toBe(false)
    expect(isValidRgbString('red')).toBe(false)
    expect(isValidRgbString('#4f7eff')).toBe(false)
    expect(isValidRgbString('1 2 3; background:url(x)')).toBe(false)
    expect(isValidRgbString('1 2 3; --evil: 1')).toBe(false)
    expect(isValidRgbString(' 1 2 3')).toBe(false)
    expect(isValidRgbString('1  2 3')).toBe(false)
    expect(isValidRgbString('1 2')).toBe(false)
    expect(isValidRgbString(123)).toBe(false)
    expect(safeRgbString('1 2 3; background:url(x)', '6 9 18')).toBe('6 9 18')
    expect(safeRgbString('999 0 0', '6 9 18')).toBe('6 9 18')
  })

  it('converts between RGB strings and hex and computes contrast', () => {
    expect(rgbStringToHex('79 126 255')).toBe('#4f7eff')
    expect(hexToRgbString('#4f7eff')).toBe('79 126 255')
    expect(hexToRgbString('#fff')).toBe('255 255 255')
    expect(contrastRatio('255 255 255', '0 0 0')).toBeCloseTo(21, 1)
  })
})
