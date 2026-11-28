/**
 * SpiralBlock (S2) — Lightweight wrapper that registers an inner element with the spiral engine.
 * Never use as the outer <section id="..."> carrying scroll-margin-top.
 */

import type { ReactNode } from 'react'
import { useSpiral, type SpiralKind } from '../hooks/useSpiral'

export interface SpiralBlockProps {
  as?: 'div' | 'article' | 'aside' | 'header' | 'footer'
  kind?: SpiralKind
  dir?: 1 | -1
  depth?: number
  className?: string
  children: ReactNode
}

export function SpiralBlock({
  as: Tag = 'div',
  kind = 'block',
  dir,
  depth,
  className,
  children,
}: SpiralBlockProps) {
  const ref = useSpiral<HTMLDivElement>({ kind, dir, depth })

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      data-spiral={kind}
      className={className}
    >
      {children}
    </Tag>
  )
}
