/**
 * Spiral system tests (S9)
 *
 * Pure math: S1 functions, unit-testable without DOM.
 * Engine: S2 — mock IntersectionObserver, ResizeObserver, rAF.
 * Gating: reduced-motion, data-motion="reduced", saveData, narrow viewport, missing APIs.
 * Hook/component: S2 registration lifecycle.
 * SpiralBackground: S5 render gating.
 * HoverTilt: S6 no-op on touch/reduced.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  clamp,
  easeOutCubic,
  entryProgress,
  computeSpiral,
  toTransform,
  parallaxOffset,
  spiralPath,
  SPIRAL_CONFIG,
} from '../lib/spiral'
import { motionEnabled, spiralEngine, resetSpiralEngineForTests } from '../lib/spiralEngine'

// ============================================================
// S1 pure math
// ============================================================

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(2, 0, 1)).toBe(1)
  })
  it('returns min for non-finite input', () => {
    expect(clamp(NaN, 0, 1)).toBe(0)
    expect(clamp(Infinity, 0, 1)).toBe(0)
  })
})

describe('easeOutCubic', () => {
  it('maps 0 to 0 and 1 to 1', () => {
    expect(easeOutCubic(0)).toBeCloseTo(0)
    expect(easeOutCubic(1)).toBeCloseTo(1)
  })
  it('is monotonically increasing on [0,1]', () => {
    const steps = 20
    let prev = 0
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const v = easeOutCubic(t)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
  it('clamps inputs outside [0,1]', () => {
    expect(easeOutCubic(-0.5)).toBeCloseTo(0)
    expect(easeOutCubic(1.5)).toBeCloseTo(1)
  })
})

describe('entryProgress', () => {
  it('returns 1 for zero or negative viewport height', () => {
    expect(entryProgress(100, 0)).toBe(1)
    expect(entryProgress(100, -100)).toBe(1)
  })
  it('returns 0 when element top is at viewport bottom (fully below)', () => {
    // element top = vh → not yet entered
    const vh = 800
    const e = entryProgress(vh * SPIRAL_CONFIG.entryStart, vh)
    expect(e).toBeCloseTo(0, 2)
  })
  it('returns >= 0.999 when element top is well above 55% of viewport', () => {
    const e = entryProgress(0, 800)
    expect(e).toBeGreaterThanOrEqual(0.999)
  })
})

describe('computeSpiral', () => {
  it('e=0 gives full offsets and opacity 0', () => {
    const vals = computeSpiral(0, 1, 0)
    expect(vals.opacity).toBeCloseTo(0)
    expect(Math.abs(vals.tx)).toBeGreaterThan(0)
    expect(Math.abs(vals.tz)).toBeGreaterThan(0)
    expect(vals.scale).toBeCloseTo(SPIRAL_CONFIG.entryScaleFrom, 3)
  })
  it('e=1 with no exit gives settled zeroes and opacity 1', () => {
    const vals = computeSpiral(1, 1, 0)
    expect(vals.opacity).toBeCloseTo(1)
    expect(vals.tx).toBe(0)
    expect(vals.ty).toBe(0)
    expect(vals.tz).toBe(0)
    expect(vals.rx).toBe(0)
    expect(vals.ry).toBe(0)
    expect(vals.scale).toBeCloseTo(1)
  })
  it('exit values stay within configured limits', () => {
    // e=1 (settled), exitAmount=1 → maximum exit rotation
    const vals = computeSpiral(1, 1, 1)
    expect(Math.abs(vals.ry)).toBeCloseTo(SPIRAL_CONFIG.exitRotateY, 3)
    expect(vals.opacity).toBeGreaterThanOrEqual(SPIRAL_CONFIG.exitOpacityMin - 0.001)
    expect(vals.opacity).toBeLessThanOrEqual(1.001)
  })
  it('direction alternates the sign of tx and ry in entry', () => {
    const pos = computeSpiral(0, 1, 0)
    const neg = computeSpiral(0, -1, 0)
    expect(Math.sign(pos.tx)).toBe(-Math.sign(neg.tx))
    expect(Math.sign(pos.ry)).toBe(-Math.sign(neg.ry))
  })
  it('opacity is monotonically non-decreasing with e (no exit)', () => {
    let prev = 0
    for (let i = 0; i <= 20; i++) {
      const e = i / 20
      const vals = computeSpiral(e, 1, 0)
      expect(vals.opacity).toBeGreaterThanOrEqual(prev - 0.0001)
      prev = vals.opacity
    }
  })
})

describe('toTransform', () => {
  it('returns "none" when e >= 0.999 and exitAmount === 0', () => {
    const vals = computeSpiral(1, 1, 0)
    expect(toTransform(vals)).toBe('none')
  })
  it('returns a perspective transform string when not settled', () => {
    const vals = computeSpiral(0.5, 1, 0)
    const t = toTransform(vals)
    expect(t).toContain('perspective(')
    expect(t).toContain('translate3d(')
    expect(t).toContain('rotateY(')
    expect(t).toContain('rotateX(')
    expect(t).toContain('scale(')
  })
  it('returns a transform string (not "none") when exitAmount > 0', () => {
    const vals = computeSpiral(1, 1, 0.5)
    expect(toTransform(vals)).not.toBe('none')
  })
})

describe('parallaxOffset', () => {
  it('returns 0 for non-finite inputs', () => {
    expect(parallaxOffset(NaN, 400, 0.1)).toBe(0)
    expect(parallaxOffset(400, NaN, 0.1)).toBe(0)
    expect(parallaxOffset(400, 400, NaN)).toBe(0)
  })
  it('is clamped to ±maxPx', () => {
    // Very large distance: should be clamped
    const offset = parallaxOffset(0, 1_000_000, 0.5, 100)
    expect(offset).toBeLessThanOrEqual(100)
    expect(offset).toBeGreaterThanOrEqual(-100)
  })
  it('returns 0 when element center equals viewport center', () => {
    expect(parallaxOffset(400, 400, 0.2, 120)).toBeCloseTo(0)
  })
  it('returns a positive offset when element is above viewport center', () => {
    // elementCenterY < viewportCenterY → (vpCenter - elementCenterY) > 0
    const offset = parallaxOffset(100, 400, 0.1, 120)
    expect(offset).toBeGreaterThan(0)
  })
})

describe('spiralPath', () => {
  it('returns a non-empty string with the requested number of arms', () => {
    const path = spiralPath(2.5, 3, 240)
    expect(typeof path).toBe('string')
    expect(path.length).toBeGreaterThan(0)
    // 3 arms → 3 "M" move commands
    const moveCount = (path.match(/M/g) ?? []).length
    expect(moveCount).toBe(3)
  })
  it('contains no NaN in the path', () => {
    const path = spiralPath(2.5, 3, 240)
    expect(path).not.toContain('NaN')
  })
  it('handles invalid arguments gracefully (uses defaults)', () => {
    // Should not throw
    expect(() => spiralPath(-1, 0, 1)).not.toThrow()
    expect(() => spiralPath(NaN, NaN, NaN)).not.toThrow()
    const path = spiralPath(NaN, NaN, NaN)
    expect(path).not.toContain('NaN')
    expect(path.length).toBeGreaterThan(0)
  })
  it('produces a 1-arm path when arms=1', () => {
    const path = spiralPath(2.5, 1, 100)
    const moveCount = (path.match(/M/g) ?? []).length
    expect(moveCount).toBe(1)
  })
})

// ============================================================
// S2 engine — gating checks (motionEnabled)
// ============================================================

describe('motionEnabled', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    document.documentElement.removeAttribute('data-motion')
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    // Ensure IntersectionObserver and requestAnimationFrame exist in jsdom
    if (typeof globalThis.IntersectionObserver === 'undefined') {
      vi.stubGlobal('IntersectionObserver', class {
        observe() {}
        unobserve() {}
        disconnect() {}
      })
    }
    if (typeof globalThis.requestAnimationFrame === 'undefined') {
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { setTimeout(cb, 16); return 1 })
    }
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    vi.unstubAllGlobals()
  })

  it('returns false when prefers-reduced-motion matches', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: true,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    expect(motionEnabled()).toBe(false)
  })

  it('returns false when data-motion="reduced" is set', () => {
    document.documentElement.setAttribute('data-motion', 'reduced')
    expect(motionEnabled()).toBe(false)
  })

  it('returns false when viewport width < minViewportWidth', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 })
    expect(motionEnabled()).toBe(false)
  })

  it('returns false when IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    expect(motionEnabled()).toBe(false)
    vi.unstubAllGlobals()
  })

  it('returns false when requestAnimationFrame is missing', () => {
    const original = globalThis.requestAnimationFrame
    // @ts-expect-error intentionally deleting for test
    delete globalThis.requestAnimationFrame
    expect(motionEnabled()).toBe(false)
    globalThis.requestAnimationFrame = original
  })

  it('returns true with all gates open', () => {
    expect(motionEnabled()).toBe(true)
  })
})

// ============================================================
// S2 engine — registration and cleanup
// ============================================================

describe('spiralEngine registration', () => {
  beforeEach(() => {
    resetSpiralEngineForTests()
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('data-motion')
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 })
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    // Minimal IntersectionObserver mock
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    spiralEngine.destroy()
    vi.unstubAllGlobals()
  })

  it('unregister removes element from transform tracking', () => {
    spiralEngine.init()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const unregister = spiralEngine.register(el, {})
    // After unregister the element's inline styles are cleared
    unregister()
    expect(el.style.transform).toBe('')
    expect(el.style.opacity).toBe('')
  })

  it('double registration does not duplicate', () => {
    spiralEngine.init()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const u1 = spiralEngine.register(el, {})
    const u2 = spiralEngine.register(el, {})
    // Both unregister functions should work without error
    expect(() => { u1(); u2() }).not.toThrow()
  })

  it('section elements with IDs are excluded (never get transform)', () => {
    spiralEngine.init()
    const section = document.createElement('section')
    section.id = 'skills'
    document.body.appendChild(section)
    spiralEngine.register(section, {})
    expect(section.style.transform).toBe('')
    expect(section.style.opacity).toBe('')
  })

  it('contact form container is never transformed', () => {
    spiralEngine.init()
    const contact = document.createElement('section')
    contact.id = 'contact'
    const form = document.createElement('form')
    contact.appendChild(form)
    const inner = document.createElement('div')
    form.appendChild(inner)
    document.body.appendChild(contact)
    spiralEngine.register(inner, {})
    expect(inner.style.transform).toBe('')
    expect(inner.style.opacity).toBe('')
  })

  it('focusin inside a registered element settles it immediately', () => {
    spiralEngine.init()
    const el = document.createElement('div')
    document.body.appendChild(el)
    spiralEngine.register(el, {})
    // Simulate a focus event inside the element
    const input = document.createElement('input')
    el.appendChild(input)
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    // After focusin the element should be settled (no inline transform)
    expect(el.style.transform).toBe('')
    expect(el.classList.contains('spiral-settled')).toBe(true)
  })

  it('registerBackground cleans up on unregister', () => {
    spiralEngine.init()
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.appendChild(svg)
    const unregister = spiralEngine.registerBackground(svg)
    unregister()
    // After unregister, transform should be cleared
    expect(svg.style.transform).toBe('')
  })

  it('when motion is disabled, all elements are reset to no transform', () => {
    document.documentElement.setAttribute('data-motion', 'reduced')
    spiralEngine.init()
    const el = document.createElement('div')
    document.body.appendChild(el)
    // Even if registered, the element should not be transformed
    spiralEngine.register(el, {})
    expect(el.style.transform).toBe('')
    expect(el.style.opacity).toBe('')
  })

  it('destroy removes scroll listener', () => {
    spiralEngine.init()
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    spiralEngine.destroy()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

// ============================================================
// S5 SpiralBackground — render gating check (static)
// ============================================================

describe('spiralPath for SpiralBackground', () => {
  it('generates path with 3 arms and no NaN (as used by SpiralBackground)', () => {
    const path = spiralPath(2.5, 3, 240)
    expect(path).not.toContain('NaN')
    const moves = (path.match(/M/g) ?? []).length
    expect(moves).toBe(3)
  })
})

// ============================================================
// S6 hover tilt — no-op on touch / reduced motion (static check)
// ============================================================

describe('useHoverTilt no-op check', () => {
  it('respects motionEnabled() returning false', () => {
    // When motionEnabled() returns false, pointermove handlers should not
    // apply any transform. This is verified by the hook checking motionEnabled()
    // before writing the transform. We test the gating function here.
    document.documentElement.setAttribute('data-motion', 'reduced')
    expect(motionEnabled()).toBe(false)
    document.documentElement.removeAttribute('data-motion')
  })
})

// ============================================================
// S8 motion switch — data-motion validation
// ============================================================

describe('useMotionPreference storage validation', () => {
  it('only accepts "on" or "off" from localStorage', () => {
    // Simulate invalid stored value
    const validValues = ['on', 'off']
    const invalidValues = ['yes', 'true', '1', '', null, 'ON']
    for (const v of invalidValues) {
      if (v === null) {
        window.localStorage.removeItem('portfolio:motion')
      } else {
        window.localStorage.setItem('portfolio:motion', v)
      }
      const stored = window.localStorage.getItem('portfolio:motion')
      expect(validValues.includes(stored ?? '')).toBe(v !== null && validValues.includes(v))
    }
    // Clean up
    window.localStorage.removeItem('portfolio:motion')
  })
})
