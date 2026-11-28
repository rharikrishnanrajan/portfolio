import { describe, expect, it } from 'vitest'
import { HEADING_ALIASES, MONO_ALIASES, HEADING_FONT_MAP, MONO_FONT_MAP } from '../lib/theme'

describe('Typography & Open-Source Font Allow-list (F5)', () => {
  it('aliases Georgia and Courier New to open-source fonts', () => {
    expect(HEADING_ALIASES['Georgia']).toBe('Merriweather')
    expect(MONO_ALIASES['Courier New']).toBe('Source Code Pro')
  })

  it('excludes proprietary fonts from heading and mono font maps and fallback stacks', () => {
    const banned = ['Georgia', 'Courier New', 'Segoe UI', 'Menlo', 'Consolas', 'Helvetica', 'Arial']
    const allStacks = [...Object.values(HEADING_FONT_MAP), ...Object.values(MONO_FONT_MAP)]
    const allKeys = [...Object.keys(HEADING_FONT_MAP), ...Object.keys(MONO_FONT_MAP)]

    for (const family of banned) {
      expect(allKeys).not.toContain(family)
      for (const stack of allStacks) {
        expect(stack).not.toContain(family)
      }
    }
  })
})
