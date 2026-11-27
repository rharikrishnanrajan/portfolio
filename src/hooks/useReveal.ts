import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'

// Shared IntersectionObserver for all reveal elements (A2, A12)
let sharedObserver: IntersectionObserver | null = null
const observedElements = new Set<HTMLElement>()

function getSharedObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.dataset.revealed = 'true'
          el.classList.add('is-visible')
          // Stagger delay based on --reveal-i (set by parent)
          const staggerIndex = parseInt(el.style.getPropertyValue('--reveal-i') || '0', 10)
          const delay = Math.min(staggerIndex, 6) * 60
          if (delay > 0) {
            el.style.transitionDelay = `${delay}ms`
          }
          sharedObserver?.unobserve(el)
          observedElements.delete(el)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  )

  return sharedObserver
}

export function useReveal<T extends HTMLElement>(): { ref: React.RefObject<T>; isVisible: boolean } {
  const reducedMotion = useReducedMotion()
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    if (reducedMotion) return true
    if (typeof IntersectionObserver === 'undefined') return true
    return false
  })

  // Check if already revealed on mount (for elements added after realtime refetch)
  const checkAlreadyVisible = useCallback(() => {
    const node = ref.current
    if (!node) return
    if (node.dataset.revealed === 'true' || node.classList.contains('is-visible')) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    checkAlreadyVisible()
  }, [checkAlreadyVisible])

  useEffect(() => {
    if (isVisible || reducedMotion) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    observedElements.add(node)
    const observer = getSharedObserver()
    observer.observe(node)

    return () => {
      observer.unobserve(node)
      observedElements.delete(node)
    }
  }, [isVisible, reducedMotion])

  return { ref, isVisible }
}

// Export for cleanup on unmount (A12)
export function cleanupRevealObserver() {
  if (sharedObserver) {
    sharedObserver.disconnect()
    sharedObserver = null
    observedElements.clear()
  }
}