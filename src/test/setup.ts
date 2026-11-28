// Vitest test setup - runs before all tests
import { vi } from 'vitest'

// Mock window.matchMedia for jsdom (not implemented by default)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver for jsdom (basic implementation)
class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback
    this.options = options
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

if (typeof window.requestAnimationFrame === 'undefined') {
  window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 16)
  })
  window.cancelAnimationFrame = vi.fn((id: number) => {
    window.clearTimeout(id)
  })
}