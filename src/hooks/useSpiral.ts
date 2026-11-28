/**
 * useSpiral (F6) — React hook to register an element with the spiral engine.
 *
 * Usage:
 *   const ref = useSpiral<HTMLDivElement>({ kind: 'block' })
 *   <div ref={ref} data-spiral="block">...</div>
 *
 * The hook handles registration on mount, cleanup on unmount, and direction
 * alternation via a module-level counter so the spiral staircase effect works.
 */

import { useEffect, useRef } from 'react'
import { spiralEngine } from '../lib/spiral'

export type SpiralKind = 'block' | 'card' | 'layer'

export interface UseSpiralOptions {
  kind?: SpiralKind
  depth?: number
}

// Module-level counter for direction alternation
let dirCounter = 0

export function useSpiral<T extends HTMLElement = HTMLElement>(
  options: UseSpiralOptions = {},
): React.RefObject<T | null> {
  const { kind = 'block', depth = 0.1 } = options
  const ref = useRef<T | null>(null)
  const dirRef = useRef<1 | -1 | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (dirRef.current === null) {
      dirRef.current = dirCounter % 2 === 0 ? 1 : -1
      dirCounter += 1
    }
    spiralEngine.register(el, dirRef.current, depth, kind)
    return () => {
      spiralEngine.unregister(el)
    }
  }, [depth, kind])

  return ref
}
