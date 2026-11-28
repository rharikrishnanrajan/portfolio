/**
 * spiral.ts (F6) — Self-contained 3D scroll spiral engine.
 *
 * Elements opt in with:
 *   data-spiral="block" | "card" | "layer"
 *   data-depth="0.15"   (optional, for parallax layers)
 *
 * Safety gates — does nothing (all elements visible) when:
 *   - prefers-reduced-motion: reduce
 *   - html[data-motion="reduced"]
 *   - navigator.connection.saveData === true
 *   - viewport width < 768 px
 *   - IntersectionObserver or requestAnimationFrame unavailable
 *   - element is inside or is #contact form, navbar, drawer dialog
 *
 * Transform applied to inner wrappers only (never to <section id="…">).
 * At progress e >= 0.999 the inline transform is set to "none" and
 * will-change is removed so settled text is crisp.
 */

export interface SpiralEntry {
  el: HTMLElement
  dir: 1 | -1
  depth: number
  kind: 'block' | 'card' | 'layer'
  settled: boolean
}

const ENTRY_PERSPECTIVE = 1200
const ENTRY_X = 40
const ENTRY_Y = 60
const ENTRY_Z = -120
const ENTRY_ROT_Y = -18
const ENTRY_ROT_X = 10
const ENTRY_SCALE_START = 0.94
const LERP_FACTOR = 0.12
const CONVERGE_THRESHOLD = 0.5 // px

const EXCLUDED_SELECTORS = [
  '[data-no-spiral]',
  '#contact',
  'nav',
  'dialog',
  'input',
  'textarea',
  'select',
]

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

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function getProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  // e = 0 when top of el is at bottom of viewport, e = 1 when top is at 40% vh
  const target = vh * 0.4
  const raw = (vh - rect.top) / (vh - target)
  return Math.max(0, Math.min(1, raw))
}

class SpiralEngine {
  private entries: SpiralEntry[] = []
  private observer: IntersectionObserver | null = null
  private visible = new Set<SpiralEntry>()
  private rafId: number | null = null
  private rawScrollY = 0
  private smoothScrollY = 0
  private scrollListenerAttached = false

  init() {
    if (!motionEnabled()) {
      this.showAll()
      return
    }

    this.observer = new IntersectionObserver(
      (records) => {
        for (const rec of records) {
          const entry = this.entries.find((e) => e.el === rec.target)
          if (!entry) continue
          if (rec.isIntersecting) {
            this.visible.add(entry)
          } else {
            this.visible.delete(entry)
          }
        }
        this.scheduleLoop()
      },
      { rootMargin: '20% 0px 20% 0px', threshold: 0 },
    )

    this.rawScrollY = window.scrollY
    this.smoothScrollY = window.scrollY

    if (!this.scrollListenerAttached) {
      window.addEventListener('scroll', this.onScroll, { passive: true })
      this.scrollListenerAttached = true
    }

    this.observe()
    this.scheduleLoop()
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
      return
    }
    this.observer?.observe(el)
  }

  unregister(el: HTMLElement) {
    this.observer?.unobserve(el)
    const idx = this.entries.findIndex((e) => e.el === el)
    if (idx !== -1) {
      const [entry] = this.entries.splice(idx, 1)
      this.visible.delete(entry)
    }
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  destroy() {
    this.stopLoop()
    this.observer?.disconnect()
    this.observer = null
    if (this.scrollListenerAttached) {
      window.removeEventListener('scroll', this.onScroll)
      this.scrollListenerAttached = false
    }
    this.entries = []
    this.visible.clear()
  }

  private observe() {
    for (const entry of this.entries) {
      this.observer?.observe(entry.el)
    }
  }

  private showAll() {
    for (const entry of this.entries) {
      entry.el.style.opacity = '1'
      entry.el.style.transform = 'none'
      entry.settled = true
    }
  }

  private onScroll = () => {
    this.rawScrollY = window.scrollY
    this.scheduleLoop()
  }

  private scheduleLoop() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.loop)
    }
  }

  private loop = () => {
    this.rafId = null

    const delta = this.rawScrollY - this.smoothScrollY
    this.smoothScrollY += delta * LERP_FACTOR

    const stillConverging = Math.abs(delta) > CONVERGE_THRESHOLD

    // Read all rects first (batch reads)
    const updates: { entry: SpiralEntry; e: number }[] = []
    for (const entry of this.visible) {
      if (entry.settled) continue
      const e = getProgress(entry.el)
      updates.push({ entry, e })
    }

    // Write all styles (batch writes)
    for (const { entry, e } of updates) {
      const { dir, depth, kind } = entry
      const easedE = easeInOut(e)

      if (kind === 'layer') {
        // Parallax layer: simple vertical translate3d
        entry.el.style.transform = `translate3d(0, ${this.smoothScrollY * depth}px, 0)`
        entry.el.style.opacity = '1'
        continue
      }

      if (easedE >= 0.999) {
        entry.el.style.transform = 'none'
        entry.el.style.opacity = '1'
        entry.el.style.willChange = 'auto'
        entry.el.classList.add('spiral-settled')
        entry.settled = true
        continue
      }

      const inv = 1 - easedE
      // 3D spiral entry
      const tx = dir * ENTRY_X * inv
      const ty = ENTRY_Y * inv
      const tz = ENTRY_Z * inv
      const ry = dir * ENTRY_ROT_Y * inv
      const rx = ENTRY_ROT_X * inv
      const scale = ENTRY_SCALE_START + (1 - ENTRY_SCALE_START) * easedE
      entry.el.style.transform = `perspective(${ENTRY_PERSPECTIVE}px) translate3d(${tx}px,${ty}px,${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`
      entry.el.style.opacity = String(easedE)
      entry.el.style.willChange = 'transform, opacity'
    }

    if (updates.length > 0 || stillConverging) {
      this.rafId = requestAnimationFrame(this.loop)
    }
  }
}

// Singleton engine
export const spiralEngine = new SpiralEngine()
