/**
 * spiral.ts (S1) — Configuration and pure math for the 3D spiral scroll & parallax system.
 *
 * All functions here are pure, deterministic, and DOM-free so they can be unit-tested
 * directly without a browser environment.
 */

export interface SpiralConfig {
  /** CSS perspective distance in px. */
  perspective: number
  /** Maximum Y-axis rotation on entry in degrees. */
  entryRotateY: number
  /** Maximum X-axis rotation on entry in degrees. */
  entryRotateX: number
  /** Z-axis translation offset on entry in px (negative = further back). */
  entryTranslateZ: number
  /** Horizontal translation offset on entry in px (multiplied by direction +1/-1). */
  entryTranslateX: number
  /** Vertical translation offset on entry in px. */
  entryTranslateY: number
  /** Starting scale on entry (interpolates up to 1). */
  entryScaleFrom: number
  /** Maximum Y-axis rotation on exit above viewport in degrees. */
  exitRotateY: number
  /** Minimum opacity on exit above viewport. */
  exitOpacityMin: number
  /** Viewport fraction where entry begins (1.0 = element top at viewport bottom). */
  entryStart: number
  /** Viewport fraction where entry settles (0.55 = element top at 55% of viewport height). */
  entryEnd: number
  /** Viewport fraction where exit tilt begins as element leaves the top. */
  exitStart: number
  /** Scroll smoothing lerp factor (0..1, higher = snappier). */
  lerp: number
  /** Minimum viewport width (px) required to enable 3D spiral motion. */
  minViewportWidth: number
  /** Maximum parallax translation in px. */
  parallaxMaxPx: number
  /** Maximum hover tilt in degrees. */
  tiltMaxDeg: number
  /** Background spiral rotation per px of smoothed scroll (degrees). */
  backgroundRotatePerPx: number
  /** Maximum additional scale applied to background spiral over full page scroll. */
  backgroundScaleMax: number
}

/**
 * Tuneable configuration for the 3D spiral scroll, parallax, hover tilt, and background spiral.
 */
export const SPIRAL_CONFIG: SpiralConfig = {
  perspective: 1200,
  entryRotateY: 18,
  entryRotateX: 10,
  entryTranslateZ: -120,
  entryTranslateX: 40,
  entryTranslateY: 60,
  entryScaleFrom: 0.94,
  exitRotateY: 6,
  exitOpacityMin: 0.7,
  entryStart: 1.0,
  entryEnd: 0.55,
  exitStart: 0.2,
  lerp: 0.12,
  minViewportWidth: 768,
  parallaxMaxPx: 120,
  tiltMaxDeg: 6,
  backgroundRotatePerPx: 0.04,
  backgroundScaleMax: 0.15,
}

export interface SpiralTransformValues {
  tx: number
  ty: number
  tz: number
  rx: number
  ry: number
  scale: number
  opacity: number
  e: number
  exitAmount: number
}

/** Clamps a number to [min, max]. Non-finite inputs return min. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  if (value <= min) return min
  if (value >= max) return max
  return value
}

/** Monotonic cubic ease-out curve on [0, 1]. */
export function easeOutCubic(t: number): number {
  const c = clamp(t, 0, 1)
  return 1 - Math.pow(1 - c, 3)
}

/**
 * Computes eased entry progress `e` in [0, 1] for an element whose top is `top` px
 * from the top of a viewport of height `vh` px.
 */
export function entryProgress(top: number, vh: number): number {
  if (!Number.isFinite(vh) || vh <= 0) return 1
  if (!Number.isFinite(top)) return 1
  const span = vh * (SPIRAL_CONFIG.entryStart - SPIRAL_CONFIG.entryEnd)
  if (span <= 0) return 1
  const raw = clamp((vh * SPIRAL_CONFIG.entryStart - top) / span, 0, 1)
  return easeOutCubic(raw)
}

/**
 * Computes 3D spiral transform components and opacity for entry progress `e` in [0, 1],
 * alternating direction `dir` (+1 or -1), and optional exit amount in [0, 1].
 */
export function computeSpiral(
  e: number,
  dir: 1 | -1,
  exitAmount = 0,
): SpiralTransformValues {
  const ce = clamp(e, 0, 1)
  const cExit = clamp(exitAmount, 0, 1)

  if (ce >= 0.999) {
    if (cExit <= 0) {
      return {
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        scale: 1,
        opacity: 1,
        e: ce,
        exitAmount: 0,
      }
    }
    return {
      tx: 0,
      ty: 0,
      tz: 0,
      rx: 0,
      ry: dir * SPIRAL_CONFIG.exitRotateY * cExit,
      scale: 1,
      opacity: 1 - (1 - SPIRAL_CONFIG.exitOpacityMin) * cExit,
      e: ce,
      exitAmount: cExit,
    }
  }

  const inv = 1 - ce
  return {
    tx: dir * SPIRAL_CONFIG.entryTranslateX * inv,
    ty: SPIRAL_CONFIG.entryTranslateY * inv,
    tz: SPIRAL_CONFIG.entryTranslateZ * inv,
    rx: SPIRAL_CONFIG.entryRotateX * inv,
    ry: -dir * SPIRAL_CONFIG.entryRotateY * inv,
    scale: SPIRAL_CONFIG.entryScaleFrom + (1 - SPIRAL_CONFIG.entryScaleFrom) * ce,
    opacity: ce,
    e: ce,
    exitAmount: cExit,
  }
}

/**
 * Formats computed spiral values into a CSS `transform` string.
 * Returns `"none"` when settled (`e >= 0.999` and `exitAmount === 0`).
 */
export function toTransform(values: SpiralTransformValues): string {
  if (values.e >= 0.999 && values.exitAmount === 0) {
    return 'none'
  }
  const tx = Number(values.tx.toFixed(2))
  const ty = Number(values.ty.toFixed(2))
  const tz = Number(values.tz.toFixed(2))
  const rx = Number(values.rx.toFixed(2))
  const ry = Number(values.ry.toFixed(2))
  const scale = Number(values.scale.toFixed(4))
  return `perspective(${SPIRAL_CONFIG.perspective}px) translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`
}

/**
 * Computes a clamped vertical parallax offset in px for a layer.
 */
export function parallaxOffset(
  elementCenterY: number,
  viewportCenterY: number,
  depth: number,
  maxPx = SPIRAL_CONFIG.parallaxMaxPx,
): number {
  if (
    !Number.isFinite(elementCenterY) ||
    !Number.isFinite(viewportCenterY) ||
    !Number.isFinite(depth) ||
    !Number.isFinite(maxPx)
  ) {
    return 0
  }
  const limit = Math.abs(maxPx)
  return clamp((viewportCenterY - elementCenterY) * depth, -limit, limit)
}

/**
 * Generates an SVG path string for multi-arm logarithmic spirals
 * (`r = a * e^(b * theta)`) centred at `(500, 500)` in a `1000x1000` viewBox.
 */
export function spiralPath(turns = 2.5, arms = 3, points = 240): string {
  const safeTurns = Number.isFinite(turns) && turns > 0 ? turns : 2.5
  const safeArms = Number.isFinite(arms) && arms >= 1 ? Math.floor(arms) : 3
  const safePoints = Number.isFinite(points) && points >= 2 ? Math.floor(points) : 240

  const a = 8
  const outerRadius = 700
  const maxTheta = safeTurns * 2 * Math.PI
  const b = Math.log(outerRadius / a) / maxTheta
  const cx = 500
  const cy = 500

  const segments: string[] = []
  for (let arm = 0; arm < safeArms; arm++) {
    const armOffset = (arm * 2 * Math.PI) / safeArms
    for (let i = 0; i <= safePoints; i++) {
      const theta = (i / safePoints) * maxTheta
      const r = a * Math.exp(b * theta)
      const angle = theta + armOffset
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      segments.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    }
  }
  return segments.join(' ')
}

export { spiralEngine } from './spiralEngine'
