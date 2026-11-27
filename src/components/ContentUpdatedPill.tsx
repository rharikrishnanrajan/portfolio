import { useEffect, useRef, useState } from 'react'
import { useContent } from '../context/contentContext'
import { CONTENT_UPDATED_DISPLAY_MS } from '../context/ContentProvider'

export function ContentUpdatedPill() {
  const { contentUpdateTrigger } = useContent()
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const triggerRef = useRef<number>(contentUpdateTrigger)

  useEffect(() => {
    if (contentUpdateTrigger !== triggerRef.current) {
      triggerRef.current = contentUpdateTrigger
      setIsVisible(true)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false)
        timeoutRef.current = null
      }, CONTENT_UPDATED_DISPLAY_MS)
    }
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [contentUpdateTrigger])

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 border border-line bg-surface text-sm font-mono text-ink uppercase tracking-[0.18em] shadow-lg animate-fade-in"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Content updated
    </div>
  )
}