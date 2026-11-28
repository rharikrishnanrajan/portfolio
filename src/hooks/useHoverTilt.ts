/**
 * useHoverTilt (S6)
 *
 * Applies a pointer-driven tilt transform (up to `tiltMaxDeg` degrees) to a
 * card or cover element on hover-capable fine-pointer devices.  On touch
 * devices, narrow viewports, or when motion is disabled this hook is a no-op.
 *
 * The tilt is applied to the element itself (a DESCENDANT of the spiral
 * wrapper — never to the spiral wrapper itself) using perspective(900px)
 * rotateX / rotateY.  On pointerleave the element's transform is cleared and
 * a short CSS transition handles the return.
 *
 * Usage:
 *   const tiltRef = useHoverTilt<HTMLDivElement>()
 *   <div ref={tiltRef} className="hover-tilt-card">...</div>
 *
 * Add `.hover-tilt-card` to index.css to supply the CSS transition on leave.
 */

import { useCallback, useEffect, useRef } from 'react'
import { motionEnabled } from '../lib/motionGate'

/** True only when the device has a fine pointer and supports hover. */
function isHoverFine(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function useHoverTilt<T extends HTMLElement = HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const rafId = useRef<number | null>(null)
  const pending = useRef<{ rx: number; ry: number } | null>(null)

  const writeFrame = useCallback(() => {
    rafId.current = null
    const p = pending.current
    pending.current = null
    const el = ref.current
    if (!el || !p) return
    el.style.transform = `perspective(900px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg)`
  }, [])

  const tiltMaxDegRef = useRef(6)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!motionEnabled()) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)   // [-1, 1]
    const dy = (e.clientY - cy) / (rect.height / 2)  // [-1, 1]
    const max = tiltMaxDegRef.current
    // rotateX: tilt "up" when cursor is below centre (positive dy → negative rx)
    // rotateY: tilt "right" when cursor is to the right (positive dx → positive ry)
    pending.current = { rx: -dy * max, ry: dx * max }
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(writeFrame)
    }
  }, [writeFrame])

  const onPointerLeave = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    pending.current = null
    const el = ref.current
    if (!el) return
    el.style.transform = ''
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !isHoverFine() || !motionEnabled()) return

    let cancelled = false
    let attached = false

    void import('../lib/spiral').then(({ SPIRAL_CONFIG }) => {
      if (cancelled) return
      tiltMaxDegRef.current = SPIRAL_CONFIG.tiltMaxDeg
      attached = true
      el.addEventListener('pointermove', onPointerMove, { passive: true })
      el.addEventListener('pointerleave', onPointerLeave, { passive: true })
    })

    return () => {
      cancelled = true
      if (attached) {
        el.removeEventListener('pointermove', onPointerMove)
        el.removeEventListener('pointerleave', onPointerLeave)
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      el.style.transform = ''
    }
  }, [onPointerMove, onPointerLeave])

  return ref
}
