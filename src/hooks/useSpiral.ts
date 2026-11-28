/**
 * useSpiral (S2) — React hook to register an element with the spiral engine.
 */

import { useEffect, useRef } from 'react'
import { registerSpiral, type SpiralKind } from '../lib/spiralEngine'

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
    if (!el) return
    return registerSpiral(el, { kind, dir, depth })
  }, [depth, dir, kind])

  return ref
}
