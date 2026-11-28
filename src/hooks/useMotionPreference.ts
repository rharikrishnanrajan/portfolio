/**
 * useMotionPreference (F8)
 *
 * Reads and writes the owner's motion preference:
 *   localStorage key: "portfolio:motion"
 *   Values: "on" | "off" (validated on read; anything else is ignored)
 *
 * Sets data-motion="reduced" on <html> when off, removes it when on.
 * OS-level prefers-reduced-motion always wins (never overridden here).
 */

import { useCallback, useEffect, useState } from 'react'

export const MOTION_STORAGE_KEY = 'portfolio:motion'

type MotionPref = 'on' | 'off'

function readStoredMotion(): MotionPref | null {
  try {
    const val = window.localStorage.getItem(MOTION_STORAGE_KEY)
    if (val === 'on' || val === 'off') return val
    return null
  } catch {
    return null
  }
}

function writeStoredMotion(pref: MotionPref): void {
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, pref)
  } catch {
    // ignore storage errors
  }
}

function applyMotionPref(pref: MotionPref): void {
  if (pref === 'off') {
    document.documentElement.setAttribute('data-motion', 'reduced')
  } else {
    document.documentElement.removeAttribute('data-motion')
  }
}

export function useMotionPreference(): {
  motionEnabled: boolean
  toggle: () => void
} {
  const [pref, setPref] = useState<MotionPref>(() => {
    const stored = readStoredMotion()
    return stored ?? 'on'
  })

  // Apply on mount and whenever pref changes
  useEffect(() => {
    applyMotionPref(pref)
  }, [pref])

  const toggle = useCallback(() => {
    setPref((prev) => {
      const next: MotionPref = prev === 'on' ? 'off' : 'on'
      writeStoredMotion(next)
      return next
    })
  }, [])

  return { motionEnabled: pref === 'on', toggle }
}
