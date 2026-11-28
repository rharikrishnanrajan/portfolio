/**
 * motionGate.ts — Lightweight, zero-dependency gate for 3D spiral & tilt motion.
 *
 * Kept separate from spiralEngine.ts and spiral.ts so the main bundle can check
 * whether motion is enabled before dynamically importing the spiral engine,
 * SpiralBackground, and hover-tilt modules.
 */

const MIN_VIEWPORT_WIDTH = 768

/**
 * Returns true when 3D spiral motion is allowed:
 * - browser environment with requestAnimationFrame and IntersectionObserver
 * - prefers-reduced-motion is not "reduce"
 * - html[data-motion] is not "reduced"
 * - navigator.connection?.saveData is not true
 * - viewport width >= 768px
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
  if (window.innerWidth < MIN_VIEWPORT_WIDTH) return false
  if (typeof IntersectionObserver === 'undefined') return false
  if (typeof requestAnimationFrame === 'undefined') return false
  return true
}
