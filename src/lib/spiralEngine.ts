/**
 * spiralEngine.ts (S2 placeholder — full S2 implementation follows)
 */
export interface SpiralEntry {
  el: HTMLElement
  dir: 1 | -1
  depth: number
  kind: 'block' | 'card' | 'layer'
  settled: boolean
}

const EXCLUDED_SELECTORS = ['[data-no-spiral]', '#contact', 'nav', 'dialog', 'input', 'textarea', 'select']

function motionEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (document.documentElement.getAttribute('data-motion') === 'reduced') return false
  if ('connection' in navigator) {
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return false
  }
  if (window.innerWidth < 768) return false
  if (typeof IntersectionObserver === 'undefined') return false
  if (typeof requestAnimationFrame === 'undefined') return false
  return true
}

function isExcluded(el: HTMLElement): boolean {
  return EXCLUDED_SELECTORS.some((sel) => {
    try {
      return el.closest(sel) !== null
    } catch {
      return false
    }
  })
}

class SpiralEngine {
  private entries: SpiralEntry[] = []

  init() {
    if (!motionEnabled()) {
      for (const entry of this.entries) {
        entry.el.style.opacity = '1'
        entry.el.style.transform = 'none'
        entry.settled = true
      }
    }
  }

  register(el: HTMLElement, dir: 1 | -1, depth: number, kind: 'block' | 'card' | 'layer') {
    if (isExcluded(el)) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }
    if (this.entries.find((e) => e.el === el)) return
    const entry: SpiralEntry = { el, dir, depth, kind, settled: false }
    this.entries.push(entry)
    if (!motionEnabled()) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      entry.settled = true
    }
  }

  unregister(el: HTMLElement) {
    const idx = this.entries.findIndex((e) => e.el === el)
    if (idx !== -1) this.entries.splice(idx, 1)
  }

  destroy() {
    this.entries = []
  }
}

export const spiralEngine = new SpiralEngine()
