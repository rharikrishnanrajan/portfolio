import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ScrollProgressAndBackToTop } from '../App'
import { ContentProvider } from '../context/ContentProvider'
import { useContent } from '../context/contentContext'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { cleanupRevealObserver, useReveal } from '../hooks/useReveal'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import { BACK_TO_TOP_THRESHOLD, scrollToSection } from '../lib/scroll'

interface MockIOInstance {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  trigger: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void
}

function createMatchMediaMock(initialMatches = false) {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const mql = {
    get matches() {
      return matches
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
      if (event === 'change' && typeof cb === 'function') {
        listeners.add(cb as (event: MediaQueryListEvent) => void)
      }
    }),
    removeEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
      if (event === 'change' && typeof cb === 'function') {
        listeners.delete(cb as (event: MediaQueryListEvent) => void)
      }
    }),
    dispatchEvent: vi.fn(),
  }

  const setMatches = (next: boolean) => {
    matches = next
    const event = { matches: next, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent
    for (const listener of listeners) {
      listener(event)
    }
  }

  return { mql, setMatches, listeners }
}

describe('Motion system (PART A13)', () => {
  const originalMatchMedia = window.matchMedia
  const originalIntersectionObserver = window.IntersectionObserver

  beforeEach(() => {
    vi.useFakeTimers()
    document.documentElement.className = ''
  })

  afterEach(() => {
    cleanup()
    cleanupRevealObserver()
    vi.useRealTimers()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: originalIntersectionObserver,
    })
  })

  describe('useReducedMotion', () => {
    it('reflects initial matchMedia state and updates on change events', () => {
      const { mql, setMatches, listeners } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn(() => mql),
      })

      const { result, unmount } = renderHook(() => useReducedMotion())
      expect(result.current).toBe(false)
      expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

      act(() => {
        setMatches(true)
      })
      expect(result.current).toBe(true)

      act(() => {
        setMatches(false)
      })
      expect(result.current).toBe(false)

      unmount()
      expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      expect(listeners.size).toBe(0)
    })
  })

  describe('useReveal', () => {
    function installMockIO() {
      const instances: MockIOInstance[] = []

      class TestIntersectionObserver {
        root = null
        rootMargin = ''
        thresholds: number[] = []
        callback: IntersectionObserverCallback
        options?: IntersectionObserverInit
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])

        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          this.callback = callback
          this.options = options
          const instance: MockIOInstance = {
            callback,
            options,
            observe: this.observe,
            unobserve: this.unobserve,
            disconnect: this.disconnect,
            trigger: (entries) => {
              this.callback(
                entries.map(
                  (e) =>
                    ({
                      target: e.target,
                      isIntersecting: e.isIntersecting,
                      intersectionRatio: e.isIntersecting ? 1 : 0,
                    }) as IntersectionObserverEntry,
                ),
                this as unknown as IntersectionObserver,
              )
            },
          }
          instances.push(instance)
        }
      }

      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: TestIntersectionObserver,
      })

      return instances
    }

    function RevealBox({ id, stagger }: { id: string; stagger?: number }) {
      const { ref, isVisible } = useReveal<HTMLDivElement>()
      return (
        <div
          ref={ref}
          data-testid={id}
          style={stagger !== undefined ? ({ '--reveal-i': String(stagger) } as React.CSSProperties) : undefined}
          className={`reveal ${isVisible ? 'is-visible' : ''}`}
        >
          {id}
        </div>
      )
    }

    it('observes element and reveals once when intersecting', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      const instances = installMockIO()

      render(<RevealBox id="box-1" stagger={2} />)
      const el = screen.getByTestId('box-1')

      expect(el.classList.contains('is-visible')).toBe(false)
      expect(instances).toHaveLength(1)
      expect(instances[0].observe).toHaveBeenCalledWith(el)

      act(() => {
        instances[0].trigger([{ target: el, isIntersecting: true }])
      })

      expect(el.classList.contains('is-visible')).toBe(true)
      expect(el.dataset.revealed).toBe('true')
      expect(el.style.transitionDelay).toBe('120ms')
      expect(instances[0].unobserve).toHaveBeenCalledWith(el)
    })

    it('shows elements immediately when prefers-reduced-motion is enabled', () => {
      const { mql } = createMatchMediaMock(true)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      const instances = installMockIO()

      render(<RevealBox id="reduced-box" />)
      const el = screen.getByTestId('reduced-box')

      expect(el.classList.contains('is-visible')).toBe(true)
      expect(instances).toHaveLength(0)
    })

    it('reveals elements added later once and never re-animates unchanged ones', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      const instances = installMockIO()

      function DynamicList({ items }: { items: string[] }) {
        return (
          <div>
            {items.map((item) => (
              <RevealBox key={item} id={item} />
            ))}
          </div>
        )
      }

      const { rerender } = render(<DynamicList items={['item-a']} />)
      const itemA = screen.getByTestId('item-a')
      expect(instances[0].observe).toHaveBeenCalledTimes(1)
      expect(instances[0].observe).toHaveBeenCalledWith(itemA)

      act(() => {
        instances[0].trigger([{ target: itemA, isIntersecting: true }])
      })
      expect(itemA.classList.contains('is-visible')).toBe(true)
      expect(itemA.dataset.revealed).toBe('true')

      const observeCallsBeforeAdd = instances[0].observe.mock.calls.length

      // Add a second item while keeping item-a unchanged
      rerender(<DynamicList items={['item-a', 'item-b']} />)
      const itemB = screen.getByTestId('item-b')

      // Only item-b should be newly observed; item-a must not be re-observed
      expect(instances[0].observe).toHaveBeenCalledTimes(observeCallsBeforeAdd + 1)
      expect(instances[0].observe).toHaveBeenLastCalledWith(itemB)
      expect(itemA.classList.contains('is-visible')).toBe(true)
      expect(itemB.classList.contains('is-visible')).toBe(false)

      act(() => {
        instances[0].trigger([{ target: itemB, isIntersecting: true }])
      })
      expect(itemB.classList.contains('is-visible')).toBe(true)
      expect(instances[0].unobserve).toHaveBeenCalledWith(itemB)
    })

    it('keeps no content hidden when IntersectionObserver is missing', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: undefined,
      })

      render(<RevealBox id="no-io-box" />)
      const el = screen.getByTestId('no-io-box')
      expect(el.classList.contains('is-visible')).toBe(true)
    })
  })

  describe('scrollToSection', () => {
    it('updates hash with replaceState and moves focus to heading with tabindex -1 and preventScroll', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })

      const section = document.createElement('section')
      section.id = 'projects'
      const heading = document.createElement('h2')
      heading.textContent = 'Selected Systems'
      section.appendChild(heading)
      document.body.appendChild(section)

      const scrollIntoViewMock = vi.fn()
      section.scrollIntoView = scrollIntoViewMock
      const focusSpy = vi.spyOn(heading, 'focus')
      const replaceStateSpy = vi.spyOn(history, 'replaceState')

      scrollToSection('projects')

      expect(replaceStateSpy).toHaveBeenCalledTimes(1)
      expect(replaceStateSpy.mock.calls[0]?.[2]).toContain('#projects')
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(heading.getAttribute('tabindex')).toBe('-1')
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
      expect(document.activeElement).toBe(heading)

      section.remove()
    })
  })

  describe('Back-to-top visibility threshold and scroll progress bar', () => {
    it('toggles back-to-top visibility around BACK_TO_TOP_THRESHOLD', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      window.scrollTo = vi.fn()

      Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 })

      render(
        <MemoryRouter>
          <ScrollProgressAndBackToTop />
        </MemoryRouter>,
      )

      const backToTop = screen.getByRole('button', { name: 'Back to top' })
      expect(backToTop.classList.contains('is-visible')).toBe(false)

      // At exact threshold (600), still hidden (> BACK_TO_TOP_THRESHOLD required)
      act(() => {
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: BACK_TO_TOP_THRESHOLD })
        fireEvent.scroll(window)
      })
      expect(backToTop.classList.contains('is-visible')).toBe(false)

      // Above threshold (601), becomes visible
      act(() => {
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: BACK_TO_TOP_THRESHOLD + 1 })
        fireEvent.scroll(window)
      })
      expect(backToTop.classList.contains('is-visible')).toBe(true)

      // Below threshold again, hides
      act(() => {
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 100 })
        fireEvent.scroll(window)
      })
      expect(backToTop.classList.contains('is-visible')).toBe(false)
    })

    it('updates scroll progress CSS variable via ref with no React re-renders per scroll event', () => {
      const { mql } = createMatchMediaMock(false)
      Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => mql) })
      window.scrollTo = vi.fn()

      // Mock document height: scrollHeight = 2000, innerHeight = 1000 => docHeight = 1000
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 2000,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0,
      })

      // Spy on requestAnimationFrame so it runs synchronously in test
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
        cb(0)
        return 1
      })

      render(
        <MemoryRouter>
          <ScrollProgressAndBackToTop />
        </MemoryRouter>,
      )

      const progressBar = screen.getByRole('progressbar', { name: 'Page scroll progress' })
      const setPropertySpy = vi.spyOn(progressBar.style, 'setProperty')

      act(() => {
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 250 })
        fireEvent.scroll(window)
      })
      expect(setPropertySpy).toHaveBeenCalledWith('--scroll-progress', '0.25')
      expect(progressBar.style.getPropertyValue('--scroll-progress')).toBe('0.25')
      expect(progressBar.getAttribute('aria-valuenow')).toBe('25')

      act(() => {
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 500 })
        fireEvent.scroll(window)
      })
      expect(setPropertySpy).toHaveBeenCalledWith('--scroll-progress', '0.5')
      expect(progressBar.style.getPropertyValue('--scroll-progress')).toBe('0.5')
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50')
    })
  })

  describe('Theme transition class lifecycle', () => {
    function ThemeToggleProbe() {
      const { themeMode, toggleThemeMode } = useContent()
      return (
        <button type="button" onClick={toggleThemeMode}>
          {themeMode}
        </button>
      )
    }

    it('never adds theme-transition on first load, adds on toggle, and removes after ~350ms', () => {
      render(
        <ContentProvider disableLiveUpdates snapshotOverride={EMPTY_SITE_CONTENT}>
          <ThemeToggleProbe />
        </ContentProvider>,
      )

      expect(document.documentElement.classList.contains('theme-transition')).toBe(false)

      const toggleBtn = screen.getByRole('button')
      fireEvent.click(toggleBtn)

      expect(document.documentElement.classList.contains('theme-transition')).toBe(true)

      act(() => {
        vi.advanceTimersByTime(349)
      })
      expect(document.documentElement.classList.contains('theme-transition')).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(document.documentElement.classList.contains('theme-transition')).toBe(false)
    })
  })
})
