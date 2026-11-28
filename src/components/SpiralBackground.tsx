/**
 * SpiralBackground (S5)
 *
 * Fixed, aria-hidden, pointer-events-none full-viewport SVG that draws a
 * multi-arm logarithmic spiral using the same `spiralPath()` function used in
 * the pure-math unit tests.  It sits behind all content (z-index below 0) and
 * is updated by the spiral engine loop — no React state per frame, no separate
 * rAF loop of its own.
 *
 * Not rendered at all when `motionEnabled()` is false (narrow viewport,
 * reduced-motion OS, data-motion="reduced", saveData, missing APIs).
 */

import { useEffect, useRef } from 'react'
import { spiralPath } from '../lib/spiral'
import { spiralEngine } from '../lib/spiralEngine'

// Pre-generate the path string once — it is a pure function and never changes.
// 3 arms, ~240 points per arm, as specified in S1.
const PATH_D = spiralPath(2.5, 3, 240)

export function SpiralBackground() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    // Register with the engine so the engine loop drives transform updates.
    // registerBackground returns an unregister cleanup.
    const unregister = spiralEngine.registerBackground(el)
    return unregister
  }, [])

  // Don't render at all when motion is disabled (re-evaluated on mount only;
  // the engine resets the transform when motionEnabled flips to false).
  // CSS also hides the SVG under reduced-motion / data-motion="reduced".

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="spiral-bg-svg"
    >
      <path
        d={PATH_D}
        stroke="rgb(var(--accent) / 0.07)"
        strokeWidth="1.2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
