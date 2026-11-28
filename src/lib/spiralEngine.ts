/**
 * spiralEngine.ts (S2) — Inertial scroll-driven 3D spiral, parallax, and background engine.
 *
 * Key properties:
 * - Caches document-space positions using offsetTop/offsetParent (never getBoundingClientRect per frame).
 * - One passive scroll listener + one IntersectionObserver (rootMargin 20%) + ResizeObserver.
 * - rAF loop runs only while |target - smooth| >= 0.1 px and stops immediately on convergence.
 * - Settled elements (e >= 0.999, exit === 0) have inline transform, opacity, and will-change removed.
 * - focusin inside a registered element immediately settles it.
 * - Excludes #contact form, nav, dialog, and form controls.
 */

import {
  SPIRAL_CONFIG,
  clamp,
  computeSpiral,
  entryProgress,
  parallaxOffset,
  toTransform,
} from './spiral'

export type SpiralKind = 'block' | 'card' | 'layer'

export interface RegisterSpiralOptions {
  kind?: SpiralKind
  dir?: 1 | -1
  depth?: number
}

export interface SpiralEntry {
  el: HTMLElement
  kind: SpiralKind
  dir: 1 | -1
  depth: number
  docTop: number
  height: number
  centerY: number
  settled: boolean
  forceSettled: boolean
}

const EXCLUDED_SELECTORS = [
  '[data-no-spiral]',
  '#contact form',
  'nav',
  'dialog',
  'input',
  'textarea',
  'select',
]

/**
 * Returns true when 3D spiral motion is allowed:
 * - browser environment with requestAnimationFrame and IntersectionObserver
 * - prefers-reduced-motion is not "reduce"
 * - html[data-motion] is not "reduced"
 * - navigator.connection?.saveData is not true
 * - viewport width >= SPIRAL_CONFIG.minViewportWidth (768px)
 */
export function motionEnabled(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  }
  if (document.documentElement.dataset.motion === 'reduced') return false
  if ('connection' in navigator) {
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return false
  }
  if (window.innerWidth < SPIRAL_CONFIG.minViewportWidth) return false
  if (typeof IntersectionObserver === 'undefined') return false
  if (typeof requestAnimationFrame === 'undefined') return false
  return true
}

function isExcluded(el: HTMLElement): boolean {
  if (el.tagName === 'SECTION' && el.id) return true
  return EXCLUDED_SELECTORS.some((sel) => {
    try {
      return el.closest(sel) !== null
    } catch {
      return false
    }
  })
}

function measureDocumentTop(el: HTMLElement): number {
  let top = 0
  let cur: HTMLElement | null = el
  while (cur) {
    top += cur.offsetTop
    cur = cur.offsetParent as HTMLElement | null
  }
  return top
}

function clearInlineMotion(el: HTMLElement): void {
  el.style.transform = ''
  el.style.opacity = ''
  el.style.willChange = ''
}

class SpiralEngine {
  private entries = new Map<HTMLElement, SpiralEntry>()
  private visible = new Set<SpiralEntry>()
  private io: IntersectionObserver | null = null
  private ro: ResizeObserver | null = null
  private mo: MutationObserver | null = null
  private mql: MediaQueryList | null = null
  private bgEl: HTMLElement | SVGSVGElement | null = null

  private initialized = false
  private active = false
  private dirCounter = 0

  private targetScrollY = 0
  private smoothScrollY = 0
  private viewportHeight = 0
  private docScrollHeight = 0
  private rafId: number | null = null
  private measureScheduled = false

  init(): void {
    if (this.initialized) return
    this.initialized = true

    if (typeof window === 'undefined' || typeof document === 'undefined') return

    this.targetScrollY = window.scrollY
    this.smoothScrollY = window.scrollY
    this.viewportHeight = window.innerHeight
    this.docScrollHeight = document.documentElement.scrollHeight

    window.addEventListener('resize', this.onResize, { passive: true })
    document.addEventListener('focusin', this.onFocusIn, { passive: true })
    document.addEventListener('load', this.onResourceLoad, true)

    if (typeof window.matchMedia === 'function') {
      this.mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.mql.addEventListener?.('change', this.onGateChange)
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mo = new MutationObserver(this.onGateChange)
      this.mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-motion'],
      })
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(this.scheduleMeasure)
      if (document.body) {
        this.ro.observe(document.body)
      }
    }

    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (this.initialized) this.scheduleMeasure()
      })
    }

    this.evaluateGate()
  }

  destroy(): void {
    if (!this.initialized) return
    this.initialized = false
    this.teardownActive()

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('focusin', this.onFocusIn)
      document.removeEventListener('load', this.onResourceLoad, true)
    }
    this.mql?.removeEventListener?.('change', this.onGateChange)
    this.mql = null
    this.mo?.disconnect()
    this.mo = null
    this.ro?.disconnect()
    this.ro = null

    for (const entry of this.entries.values()) {
      clearInlineMotion(entry.el)
      entry.el.classList.remove('spiral-settled')
    }
    if (this.bgEl) {
      this.bgEl.style.transform = ''
    }
    this.entries.clear()
    this.visible.clear()
    this.bgEl = null
    this.dirCounter = 0
  }

  register(el: HTMLElement, options: RegisterSpiralOptions = {}): () => void {
    if (!this.initialized && typeof window !== 'undefined') {
      this.init()
    }

    if (isExcluded(el)) {
      clearInlineMotion(el)
      return () => {}
    }

    const existing = this.entries.get(el)
    if (existing) {
      return () => this.unregister(el)
    }

    const kind: SpiralKind = options.kind ?? 'block'
    const dir: 1 | -1 = options.dir ?? (this.dirCounter++ % 2 === 0 ? 1 : -1)
    const depth = options.depth ?? 0.12

    const docTop = measureDocumentTop(el)
    const height = el.offsetHeight
    const entry: SpiralEntry = {
      el,
      kind,
      dir,
      depth,
      docTop,
      height,
      centerY: docTop + height * 0.5,
      settled: false,
      forceSettled: false,
    }

    this.entries.set(el, entry)

    if (this.active) {
      this.ro?.observe(el)
      this.io?.observe(el)
      this.applyInitialState(entry)
    } else {
      clearInlineMotion(el)
      entry.settled = true
    }

    return () => this.unregister(el)
  }

  unregister(el: HTMLElement): void {
    const entry = this.entries.get(el)
    if (!entry) return
    this.io?.unobserve(el)
    this.ro?.unobserve(el)
    this.visible.delete(entry)
    this.entries.delete(el)
    clearInlineMotion(el)
    el.classList.remove('spiral-settled')
  }

  registerBackground(el: HTMLElement | SVGSVGElement | null): () => void {
    this.bgEl = el
    if (this.active && el) {
      this.updateBackground()
    } else if (el) {
      el.style.transform = ''
    }
    return () => {
      if (this.bgEl === el) {
        if (el) el.style.transform = ''
        this.bgEl = null
      }
    }
  }

  /** Re-evaluates motionEnabled() immediately (e.g., when motion switch toggles). */
  refresh(): void {
    if (!this.initialized) return
    this.evaluateGate()
  }

  private evaluateGate(): void {
    const enabled = motionEnabled()
    if (enabled && !this.active) {
      this.activate()
    } else if (!enabled && this.active) {
      this.teardownActive()
      this.resetAll()
    } else if (!enabled) {
      this.resetAll()
    }
  }

  private activate(): void {
    this.active = true
    this.targetScrollY = window.scrollY
    this.smoothScrollY = window.scrollY
    this.viewportHeight = window.innerHeight
    this.docScrollHeight = document.documentElement.scrollHeight

    this.io = new IntersectionObserver(this.onIntersect, {
      rootMargin: '20% 0px 20% 0px',
      threshold: 0,
    })

    window.addEventListener('scroll', this.onScroll, { passive: true })

    for (const entry of this.entries.values()) {
      this.ro?.observe(entry.el)
      this.io.observe(entry.el)
    }
    this.measureAll()
    for (const entry of this.entries.values()) {
      this.applyInitialState(entry)
    }
    this.updateBackground()
  }

  private teardownActive(): void {
    this.active = false
    this.stopLoop()
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll)
    }
    this.io?.disconnect()
    this.io = null
    this.visible.clear()
  }

  private resetAll(): void {
    for (const entry of this.entries.values()) {
      clearInlineMotion(entry.el)
      entry.el.classList.remove('spiral-settled')
      entry.settled = true
    }
    if (this.bgEl) {
      this.bgEl.style.transform = ''
    }
  }

  private applyInitialState(entry: SpiralEntry): void {
    if (!this.active) return
    const vh = this.viewportHeight
    const top = entry.docTop - this.smoothScrollY

    if (entry.kind === 'layer') {
      const vpCenter = this.smoothScrollY + vh * 0.5
      const offset = parallaxOffset(entry.centerY, vpCenter, entry.depth)
      entry.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
      entry.el.style.opacity = '1'
      return
    }

    // Elements already inside or above the viewport at initial load start settled
    if (top <= vh * SPIRAL_CONFIG.entryStart || entry.forceSettled) {
      const e = entryProgress(top, vh)
      if (top < vh * 0.95 || e >= 0.999) {
        clearInlineMotion(entry.el)
        entry.el.classList.add('spiral-settled')
        entry.settled = true
        return
      }
    }

    const e = entryProgress(top, vh)
    if (e >= 0.999) {
      clearInlineMotion(entry.el)
      entry.el.classList.add('spiral-settled')
      entry.settled = true
      return
    }

    const vals = computeSpiral(e, entry.dir, 0)
    entry.el.style.transform = toTransform(vals)
    entry.el.style.opacity = String(Number(vals.opacity.toFixed(3)))
    entry.el.style.willChange = 'transform, opacity'
    entry.el.classList.remove('spiral-settled')
    entry.settled = false
  }

  private onIntersect = (records: IntersectionObserverEntry[]): void => {
    for (const rec of records) {
      const entry = this.entries.get(rec.target as HTMLElement)
      if (!entry) continue
      if (rec.isIntersecting) {
        this.visible.add(entry)
      } else {
        this.visible.delete(entry)
      }
    }
    if (this.active && this.visible.size > 0) {
      this.updateFrame(true)
    }
  }

  private onScroll = (): void => {
    this.targetScrollY = window.scrollY
    this.scheduleLoop()
  }

  private onResize = (): void => {
    this.viewportHeight = window.innerHeight
    this.evaluateGate()
    if (this.active) {
      this.scheduleMeasure()
    }
  }

  private onGateChange = (): void => {
    this.evaluateGate()
  }

  private onResourceLoad = (e: Event): void => {
    if (e.target instanceof HTMLImageElement && this.active) {
      this.scheduleMeasure()
    }
  }

  private onFocusIn = (e: FocusEvent): void => {
    const target = e.target
    if (!(target instanceof HTMLElement)) return
    for (const entry of this.entries.values()) {
      if (entry.el.contains(target)) {
        entry.forceSettled = true
        entry.settled = true
        clearInlineMotion(entry.el)
        entry.el.classList.add('spiral-settled')
      }
    }
  }

  private scheduleMeasure = (): void => {
    if (this.measureScheduled) return
    this.measureScheduled = true
    requestAnimationFrame(() => {
      this.measureScheduled = false
      if (!this.active) return
      this.measureAll()
      this.updateFrame(true)
    })
  }

  private measureAll(): void {
    this.viewportHeight = window.innerHeight
    this.docScrollHeight = document.documentElement.scrollHeight
    for (const entry of this.entries.values()) {
      const docTop = measureDocumentTop(entry.el)
      const height = entry.el.offsetHeight
      entry.docTop = docTop
      entry.height = height
      entry.centerY = docTop + height * 0.5
    }
  }

  private scheduleLoop(): void {
    if (!this.active || this.rafId !== null) return
    this.rafId = requestAnimationFrame(this.loop)
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private loop = (): void => {
    this.rafId = null
    if (!this.active) return

    const delta = this.targetScrollY - this.smoothScrollY
    if (Math.abs(delta) < 0.1) {
      this.smoothScrollY = this.targetScrollY
      this.updateFrame(false)
      return
    }

    this.smoothScrollY += delta * SPIRAL_CONFIG.lerp
    this.updateFrame(false)
    this.rafId = requestAnimationFrame(this.loop)
  }

  private updateFrame(initialPass: boolean): void {
    const vh = this.viewportHeight
    const scrollY = this.smoothScrollY
    const vpCenter = scrollY + vh * 0.5
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null

    for (const entry of this.visible) {
      if (entry.kind === 'layer') {
        const offset = parallaxOffset(entry.centerY, vpCenter, entry.depth)
        entry.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
        entry.el.style.opacity = '1'
        continue
      }

      if (entry.forceSettled || (activeEl instanceof HTMLElement && entry.el.contains(activeEl))) {
        clearInlineMotion(entry.el)
        entry.el.classList.add('spiral-settled')
        entry.settled = true
        continue
      }

      const top = entry.docTop - scrollY
      const bottom = top + entry.height
      const e = initialPass && top < vh * 0.95 ? 1 : entryProgress(top, vh)

      let exitAmount = 0
      if (e >= 0.999 && bottom < vh * SPIRAL_CONFIG.exitStart && bottom > -vh) {
        const span = vh * (1 + SPIRAL_CONFIG.exitStart)
        exitAmount = clamp((vh * SPIRAL_CONFIG.exitStart - bottom) / span, 0, 1)
      }

      if (e >= 0.999 && exitAmount === 0) {
        if (!entry.settled) {
          clearInlineMotion(entry.el)
          entry.el.classList.add('spiral-settled')
          entry.settled = true
        }
        continue
      }

      entry.settled = false
      entry.el.classList.remove('spiral-settled')
      const vals = computeSpiral(e, entry.dir, exitAmount)
      entry.el.style.transform = toTransform(vals)
      entry.el.style.opacity = String(Number(vals.opacity.toFixed(3)))
      entry.el.style.willChange = 'transform, opacity'
    }

    this.updateBackground()
  }

  private updateBackground(): void {
    if (!this.bgEl || !this.active) return
    const maxScroll = Math.max(1, this.docScrollHeight - this.viewportHeight)
    const progress = clamp(this.smoothScrollY / maxScroll, 0, 1)
    const rot = this.smoothScrollY * SPIRAL_CONFIG.backgroundRotatePerPx
    const scale = 1 + progress * SPIRAL_CONFIG.backgroundScaleMax
    this.bgEl.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`
  }
}

export const spiralEngine = new SpiralEngine()

/**
 * Registers an element with the singleton spiral engine and returns an unregister cleanup function.
 */
export function registerSpiral(el: HTMLElement, options: RegisterSpiralOptions = {}): () => void {
  return spiralEngine.register(el, options)
}
