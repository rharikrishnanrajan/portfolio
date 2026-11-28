/**
 * IconButton – a square, icon-only link button used for every icon-only action.
 *
 * Props:
 *   href    – already-validated URL (caller must pass safeUrl/safeStorageUrl result)
 *   icon    – ReactNode (any icon, aria-hidden on the icon itself)
 *   label   – aria-label text (plain text, includes target name and "(opens in a new tab)")
 *   tip     – short tooltip text (truncated to 60 chars)
 *
 * Features:
 *   - Min 44x44 px (w-11 h-11) for touch targets
 *   - 1px border, sharp corners, bg-surface
 *   - Hover/focus: border and icon move to accent color, lift 2px (transform only)
 *   - Visible focus ring (focus-visible)
 *   - Active scale 0.97
 *   - CSS-only tooltip via data-tip, shown on hover and focus-visible, hidden on touch
 *   - target="_blank" rel="noopener noreferrer"
 *   - Respects prefers-reduced-motion
 */

import type { ReactNode } from 'react'

export interface IconButtonProps {
  href: string
  icon: ReactNode
  label: string
  tip?: string
}

const MAX_TIP_LENGTH = 60

export function IconButton({ href, icon, label, tip }: IconButtonProps) {
  const truncatedTip = tip ? tip.slice(0, MAX_TIP_LENGTH) : label.slice(0, MAX_TIP_LENGTH)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={truncatedTip}
      data-tip={truncatedTip}
      className="icon-btn"
    >
      {icon}
    </a>
  )
}
