/**
 * BrandIcon – maps a brand/icon name to the correct icon component.
 *
 * NOTE: react-icons (fa6) is not yet installed in this project.
 * When `npm install react-icons` is run, replace the lucide fallbacks below
 * with the proper fa6 imports:
 *   import { FaGithub, FaLinkedinIn, FaEnvelope, FaPhone,
 *            FaXTwitter, FaYoutube } from 'react-icons/fa6'
 * and wire them in the BRAND_ICON_MAP.
 *
 * All icons: aria-hidden, currentColor, consistent size via className, shrink-0.
 */

import { Github, Linkedin, Mail, Phone, Globe, Link, Twitter, Youtube } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

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

type IconComponent = ComponentType<LucideProps>

const BRAND_ICON_MAP: Record<string, IconComponent> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  email: Mail,
  phone: Phone,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
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
      aria-hidden="true"
      {...sizeProps}
    />
  )
}
