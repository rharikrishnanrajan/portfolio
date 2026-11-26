export type ThemeMode = 'dark' | 'light'

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
  roles: string[]
  tagline?: string
  cta_primary?: SiteHeroCta
  cta_secondary?: SiteHeroCta
  chips_left: string[]
  chips_right: string[]
  stats: SiteHeroStat[]
}

export interface SiteFooterJson {
  blurb?: string
  index_title?: string
  direct_title?: string
  status_label?: string
  copyright?: string
}

export interface SiteSeoJson {
  title?: string
  description?: string
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
  default_mode: ThemeMode
  fonts: {
    heading: string
    mono: string
  }
  dark?: Partial<ThemePalette>
  light?: Partial<ThemePalette>
}

export interface SiteSettings {
  logo_text: string
  brand_name: string
  nav_cta_label: string
  hero: SiteHeroJson
  footer: SiteFooterJson
  theme: SiteThemeJson
  seo: SiteSeoJson
}

export interface PublicProfile {
  full_name: string
  headline: string | null
  summary: string | null
  email: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  resume_url: string | null
}

export interface SocialLinkItem {
  id: string
  label: string
  url: string
  icon: string | null
}

export interface OverviewRowItem {
  id: string
  label: string
  value: string
}

export interface CompetencyItem {
  id: string
  text: string
}

export interface SkillDomainItem {
  id: string
  title: string
  tools: string[]
  status: string
}

export interface ProjectFile {
  name: string
  url: string
  path: string
  type: string
}

export interface ProjectItem {
  id: string
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
  featured: boolean
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  score_label: string
  score: string | null
  note: string | null
}

export interface CertificationItem {
  id: string
  title: string
  issuer: string
  start_date: string | null
  end_date: string | null
  credential_url: string | null
  featured: boolean
}

export interface PublicationItem {
  id: string
  title: string
  venue: string | null
  published_on: string | null
  summary: string | null
  reference: string | null
  url: string | null
}

export interface SectionItem {
  id: string
  slug: string
  type: string
  nav_label: string | null
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  content: Record<string, unknown>
  position: number
  show_in_nav: boolean
}

export interface AboutSectionContent {
  overview_title?: string
  competencies_title?: string
  highlights: { label: string; value: string }[]
}

export interface ArchiveSectionContent {
  archive_button?: string
}

export interface RichTextSectionContent {
  body: string
}

export interface CardsSectionItem {
  title: string
  text: string
  url?: string
}

export interface CardsSectionContent {
  items: CardsSectionItem[]
}

export interface GallerySectionImage {
  url: string
  path?: string
  caption?: string
}

export interface GallerySectionContent {
  images: GallerySectionImage[]
}

export interface SiteContent {
  version: number
  settings: SiteSettings
  profile: PublicProfile | null
  sections: SectionItem[]
  social_links: SocialLinkItem[]
  overview_rows: OverviewRowItem[]
  competencies: CompetencyItem[]
  skill_domains: SkillDomainItem[]
  projects: ProjectItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  publications: PublicationItem[]
}
