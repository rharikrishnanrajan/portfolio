import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spiralEngine } from '../lib/spiral'

describe('spiralEngine (F6)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('data-motion')
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 })
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    spiralEngine.destroy()
    vi.unstubAllGlobals()
  })

  it('leaves elements visible and untransformed when data-motion="reduced" is set', () => {
    document.documentElement.setAttribute('data-motion', 'reduced')
    const el = document.createElement('div')
    el.setAttribute('data-spiral', 'block')
    document.body.appendChild(el)

    spiralEngine.register(el, 1, 0.1, 'block')
    spiralEngine.init()

    expect(el.style.opacity).toBe('1')
    expect(el.style.transform).toBe('none')
  })

  it('leaves elements visible and untransformed on narrow viewports (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
    const el = document.createElement('div')
    el.setAttribute('data-spiral', 'block')
    document.body.appendChild(el)

    spiralEngine.register(el, -1, 0.1, 'block')
    spiralEngine.init()

    expect(el.style.opacity).toBe('1')
    expect(el.style.transform).toBe('none')
  })

  it('excludes elements inside #contact, nav, and dialog', () => {
    const contact = document.createElement('section')
    contact.id = 'contact'
    const inner = document.createElement('div')
    contact.appendChild(inner)
    document.body.appendChild(contact)

    spiralEngine.register(inner, 1, 0.1, 'block')
    expect(inner.style.opacity).toBe('1')
    expect(inner.style.transform).toBe('none')
  })

  it('cleans up scroll listeners on destroy', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    spiralEngine.init()
    spiralEngine.destroy()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
