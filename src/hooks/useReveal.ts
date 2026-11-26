import { useEffect, useRef, useState } from 'react'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    if (typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    }
    if (typeof IntersectionObserver === 'undefined') return true
    return false
  })

  useEffect(() => {
    if (isVisible) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [isVisible])

  return { ref, isVisible }
}
