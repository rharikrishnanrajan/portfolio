/**
 * useSpiral (S2) — React hook to register an element with the spiral engine.
 */

import { useEffect, useRef } from 'react'
import { motionEnabled } from '../lib/motionGate'
import type { SpiralKind } from '../lib/spiralEngine'

export type { SpiralKind }

export interface UseSpiralOptions {
  kind?: SpiralKind
  dir?: 1 | -1
  depth?: number
}

export function useSpiral<T extends HTMLElement = HTMLElement>(
  options: UseSpiralOptions = {},
): React.RefObject<T | null> {
  const { kind = 'block', dir, depth } = options
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !motionEnabled()) return

    let cancelled = false
    let unregister: (() => void) | undefined

    void import('../lib/spiralEngine').then(({ registerSpiral }) => {
      if (cancelled) return
      unregister = registerSpiral(el, { kind, dir, depth })
    })

    return () => {
      cancelled = true
      unregister?.()
    }
  }, [depth, dir, kind])

  return ref
}
