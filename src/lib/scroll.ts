/**
 * Scroll utilities for smooth scrolling, focus management, and scroll progress.
 * A3, A4 - No dependencies, uses native APIs only.
 */

// Scroll progress state (A4)
let scrollProgressRAF: number | null = null
let scrollProgressCallback: ((progress: number) => void) | null = null

/**
 * Initialize scroll progress tracking.
 * Call once on app mount. Updates CSS variable --scroll-progress via callback.
 */
export function initScrollProgress(callback: (progress: number) => void): () => void {
  scrollProgressCallback = callback

  const handleScroll = () => {
    if (scrollProgressRAF !== null) return

    scrollProgressRAF = requestAnimationFrame(() => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0

      // Update CSS variable for progress bar
      document.documentElement.style.setProperty('--scroll-progress', String(progress))

      // Call React callback if provided (for back-to-top visibility)
      scrollProgressCallback?.(progress)

      scrollProgressRAF = null
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  // Initial calculation
  handleScroll()

  return () => {
    window.removeEventListener('scroll', handleScroll)
    if (scrollProgressRAF !== null) {
      cancelAnimationFrame(scrollProgressRAF)
      scrollProgressRAF = null
    }
    scrollProgressCallback = null
  }
}

/**
 * Smooth scroll to section with focus management (A3).
 * - Updates URL hash with history.replaceState
 * - Honours scroll-margin-top
 * - Moves focus to section heading (tabindex=-1, preventScroll)
 */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id)
  if (!element) return

  // Update URL hash without scrolling (we'll scroll manually)
  const url = new URL(window.location.href)
  url.hash = id
  history.replaceState(null, '', url.toString())

  // Scroll to element (respecting reduced motion)
  element.scrollIntoView({
    behavior: shouldUseSmoothScroll() ? 'smooth' : 'auto',
    block: 'start',
  })

  // Focus the section heading for accessibility
  setTimeout(() => {
    const heading = element.querySelector('h1, h2, h3, [role="heading"]')
    const target = heading instanceof HTMLElement ? heading : element
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })
  }, 100) // Wait for scroll to complete
}

/**
 * Check if we should use smooth scroll (respects reduced motion)
 */
export function shouldUseSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Back-to-top visibility threshold (A3)
 */
export const BACK_TO_TOP_THRESHOLD = 600