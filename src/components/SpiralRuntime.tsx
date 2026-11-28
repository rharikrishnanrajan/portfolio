import { lazy, Suspense, useEffect, useState } from 'react'
import { motionEnabled } from '../lib/motionGate'

const SpiralBackground = lazy(() =>
  import('./SpiralBackground').then((m) => ({ default: m.SpiralBackground })),
)

/**
 * Lazily initializes the 3D spiral engine and renders SpiralBackground
 * only after first render and only when motionEnabled() is true.
 */
export function SpiralRuntime() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!motionEnabled()) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    void import('../lib/spiralEngine').then(({ spiralEngine }) => {
      if (cancelled) return
      spiralEngine.init()
      cleanup = () => spiralEngine.destroy()
      setReady(true)
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  if (!ready) return null

  return (
    <Suspense fallback={null}>
      <SpiralBackground />
    </Suspense>
  )
}
