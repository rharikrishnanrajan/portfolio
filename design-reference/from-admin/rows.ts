export interface SiteHeroCta {
  label: string
  target: string
}

export interface SiteHeroStat {
  label: string
  value: string
}

export interface SiteHeroJson {
  ghost_word?: string
  roles?: string[]
  tagline?: string
  cta_primary?: SiteHeroCta
  cta_secondary?: SiteHeroCta
  chips_left?: string[]
  chips_right?: string[]
  stats?: SiteHeroStat[]
  [key: string]: unknown
}

export interface SiteFooterJson {
  blurb?: string
  index_title?: string
  direct_title?: string
  status_label?: string
  copyright?: string
  [key: string]: unknown
}

export interface SiteSeoJson {
  title?: string
  description?: string
  [key: string]: unknown
}

export interface ThemePalette {
  bg: string
  surface: string
  border: string
  text: string
  muted: string
  accent: string
  accent2: string
}

export interface SiteThemeJson {
  default_mode?: 'dark' | 'light'
  fonts?: {
    heading: string
    mono: string
  }
  dark?: ThemePalette
  light?: ThemePalette
  [key: string]: unknown
}

export interface SiteSettingsRow {
  id: number
  brand_name: string
  logo_text: string
  nav_cta_label: string
  hero: SiteHeroJson
  footer: SiteFooterJson
  seo: SiteSeoJson
  theme: SiteThemeJson
  updated_at?: string
}

export interface ProfileRow {
  id: number
  full_name: string
  headline: string | null
  summary: string | null
  email: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  resume_url: string | null
  show_email: boolean
  show_phone: boolean
  updated_at?: string
}

export interface SocialLinkRow {
  id: string
  position: number
  visible: boolean
  label: string
  url: string
  icon: string | null
  updated_at?: string
}

export interface OverviewRow {
  id: string
  position: number
  visible: boolean
  label: string
  value: string
  updated_at?: string
}

export interface CompetencyRow {
  id: string
  position: number
  visible: boolean
  text: string
  updated_at?: string
}

export interface SkillDomainRow {
  id: string
  position: number
  visible: boolean
  title: string
  tools: string[]
  status: string
  updated_at?: string
}

export interface ProjectFile {
  name: string
  url: string
  path: string
  type: string
}

export interface ProjectRow {
  id: string
  position: number
  visible: boolean
  featured: boolean
  kicker: string | null
  title: string
  summary: string | null
  outcome: string | null
  tagline: string | null
  bullets: string[]
  tech: string[]
  github_url: string | null
  live_url: string | null
  cover_url: string | null
  files: ProjectFile[]
  updated_at?: string
}

export interface EducationRow {
  id: string
  position: number
  visible: boolean
  degree: string
  institution: string
  score_label: string
  score: string | null
  note: string | null
  updated_at?: string
}

export interface CertificationRow {
  id: string
  position: number
  visible: boolean
  title: string
  issuer: string
  start_date: string | null
  end_date: string | null
  credential_url: string | null
  featured: boolean
  updated_at?: string
}

export interface PublicationRow {
  id: string
  position: number
  visible: boolean
  title: string
  venue: string | null
  published_on: string | null
  summary: string | null
  reference: string | null
  url: string | null
  updated_at?: string
}

export interface SectionContentAbout {
  overview_title?: string
  competencies_title?: string
  highlights?: { label: string; value: string }[]
  [key: string]: unknown
}

export interface SectionContentRichText {
  body: string
  [key: string]: unknown
}

export interface SectionContentCardsItem {
  title: string
  text: string
  url?: string
}

export interface SectionContentCards {
  items: SectionContentCardsItem[]
  [key: string]: unknown
}

export interface SectionContentGalleryImage {
  url: string
  caption?: string
}

export interface SectionContentGallery {
  images: SectionContentGalleryImage[]
  [key: string]: unknown
}

export type SectionType =
  | 'about'
  | 'skills'
  | 'projects'
  | 'publications'
  | 'education'
  | 'certifications'
  | 'contact'
  | 'rich_text'
  | 'cards'
  | 'gallery'

export interface SectionRow {
  id: string
  slug: string
  type: SectionType | string
  nav_label: string | null
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  content: Record<string, unknown>
  position: number
  show_in_nav: boolean
  visible: boolean
  updated_at?: string
}

export interface MessageRow {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  is_read: boolean
  created_at: string
}

export interface ContentVersionRow {
  id: number
  version: number
  updated_at: string
}
