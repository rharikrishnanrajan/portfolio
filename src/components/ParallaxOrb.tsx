/**
 * ParallaxOrb (S4) — Decorative, aria-hidden, pointer-events-none blurred accent orb
 * driven by the spiral engine's parallax layer system.
 */

import { useSpiral } from '../hooks/useSpiral'

export interface ParallaxOrbProps {
  depth?: number
  size?: 'sm' | 'md' | 'lg'
  positionClass?: string
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-[280px] h-[280px]',
  md: 'w-[380px] h-[380px]',
  lg: 'w-[500px] h-[500px]',
}

export function ParallaxOrb({
  depth = 0.18,
  size = 'md',
  positionClass = 'top-24 -right-32',
}: ParallaxOrbProps) {
  const ref = useSpiral<HTMLDivElement>({ kind: 'layer', depth })

  return (
    <div
      ref={ref}
      data-spiral="layer"
      data-depth={String(depth)}
      aria-hidden="true"
      className={`parallax-orb pointer-events-none select-none absolute rounded-full bg-accent/[0.08] blur-3xl ${SIZE_CLASSES[size]} ${positionClass}`}
    />
  )
}
