/**
 * BrandIcon – maps a brand/icon name to the real Font Awesome 6 brand logo
 * via react-icons/fa6, with lucide Globe and Link fallbacks.
 *
 * All icons: aria-hidden, currentColor, consistent size via className, shrink-0.
 */

import type { ComponentType } from 'react'
import {
  FaEnvelope,
  FaGithub,
  FaLinkedinIn,
  FaPhone,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import { Globe, Link } from 'lucide-react'

export type BrandIconName =
  | 'github'
  | 'linkedin'
  | 'mail'
  | 'phone'
  | 'twitter'
  | 'youtube'
  | 'globe'

export interface BrandIconProps {
  name: string
  className?: string
  size?: number
}

type IconComponent = ComponentType<{ className?: string; size?: number; 'aria-hidden'?: boolean }>

const BRAND_ICON_MAP: Record<string, IconComponent> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  mail: FaEnvelope,
  email: FaEnvelope,
  phone: FaPhone,
  twitter: FaXTwitter,
  x: FaXTwitter,
  youtube: FaYoutube,
  globe: Globe,
  web: Globe,
}

export function BrandIcon({ name, className = 'h-5 w-5', size }: BrandIconProps) {
  const key = (name ?? '').trim().toLowerCase()
  const Icon: IconComponent = BRAND_ICON_MAP[key] ?? Link

  const sizeProps = size !== undefined ? { size } : {}

  return (
    <Icon
      className={`${className} shrink-0`}
      aria-hidden={true}
      {...sizeProps}
    />
  )
}
