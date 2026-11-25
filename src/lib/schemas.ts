import { z } from 'zod'
import type {
  AboutSectionContent,
  ArchiveSectionContent,
  CardsSectionContent,
  GallerySectionContent,
  RichTextSectionContent,
  SiteContent,
  SiteSettings,
} from '../types/content'

/**
 * Tolerant Zod helpers:
 * - Unknown keys are stripped by z.object() default behavior.
 * - Bad optional/nullable fields drop to undefined/null rather than failing the parent.
 * - Arrays skip individual malformed items instead of failing the whole list.
 */

const optString = z
  .unknown()
  .optional()
  .transform((v) => (typeof v === 'string' ? v : undefined))
const nullString = z
  .unknown()
  .optional()
  .transform((v) => (typeof v === 'string' ? v : null))
const boolWithDefault = (fallback: boolean) =>
  z
    .unknown()
    .optional()
    .transform((v) => (typeof v === 'boolean' ? v : fallback))
const numWithDefault = (fallback: number) =>
  z
    .unknown()
    .optional()
    .transform((v) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback))

function tolerantArray<T>(itemSchema: z.ZodType<T>) {
  return z
    .unknown()
    .optional()
    .transform((val): T[] => {
      if (!Array.isArray(val)) return []
      const out: T[] = []
      for (const item of val) {
        const parsed = itemSchema.safeParse(item)
        if (parsed.success) out.push(parsed.data)
      }
      return out
    })
}

const stringArray = z
  .unknown()
  .optional()
  .transform((val): string[] => {
    if (!Array.isArray(val)) return []
    return val.filter((item): item is string => typeof item === 'string')
  })

const heroCtaSchema = z.object({
  label: z.string().min(1),
  target: z.string().min(1),
})

const optHeroCta = z
  .unknown()
  .optional()
  .transform((val) => {
    const res = heroCtaSchema.safeParse(val)
    return res.success ? res.data : undefined
  })

const heroStatSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const heroSchema = z
  .object({
    ghost_word: optString,
    roles: stringArray.default([]),
    tagline: optString,
    cta_primary: optHeroCta,
    cta_secondary: optHeroCta,
    chips_left: stringArray.default([]),
    chips_right: stringArray.default([]),
    stats: tolerantArray(heroStatSchema).default([]),
  })
  .catch({
    ghost_word: undefined,
    roles: [],
    tagline: undefined,
    cta_primary: undefined,
    cta_secondary: undefined,
    chips_left: [],
    chips_right: [],
    stats: [],
  })

const footerSchema = z
  .object({
    blurb: optString,
    index_title: optString,
    direct_title: optString,
    status_label: optString,
    copyright: optString,
  })
  .catch(() => ({
    blurb: undefined,
    index_title: undefined,
    direct_title: undefined,
    status_label: undefined,
    copyright: undefined,
  }))

const seoSchema = z
  .object({
    title: optString,
    description: optString,
  })
  .catch(() => ({
    title: undefined,
    description: undefined,
  }))

const partialPaletteSchema = z
  .object({
    bg: optString,
    surface: optString,
    border: optString,
    text: optString,
    muted: optString,
    accent: optString,
    accent2: optString,
  })
  .optional()
  .catch(undefined)

const themeSchema = z
  .object({
    default_mode: z
      .unknown()
      .optional()
      .transform((v): 'dark' | 'light' => (v === 'light' ? 'light' : 'dark')),
    fonts: z
      .object({
        heading: z.string().catch('Inter Variable'),
        mono: z.string().catch('JetBrains Mono Variable'),
      })
      .optional()
      .catch({ heading: 'Inter Variable', mono: 'JetBrains Mono Variable' })
      .transform((v) => v ?? { heading: 'Inter Variable', mono: 'JetBrains Mono Variable' }),
    dark: partialPaletteSchema,
    light: partialPaletteSchema,
  })
  .optional()
  .catch({
    default_mode: 'dark',
    fonts: { heading: 'Inter Variable', mono: 'JetBrains Mono Variable' },
  })
  .transform(
    (v) =>
      v ?? {
        default_mode: 'dark' as const,
        fonts: { heading: 'Inter Variable', mono: 'JetBrains Mono Variable' },
      },
  )

export const DEFAULT_SETTINGS: SiteSettings = {
  logo_text: 'HK',
  brand_name: 'Portfolio',
  nav_cta_label: "Let's Connect",
  hero: {
    roles: [],
    chips_left: [],
    chips_right: [],
    stats: [],
  },
  footer: {},
  theme: {
    default_mode: 'dark',
    fonts: {
      heading: 'Inter Variable',
      mono: 'JetBrains Mono Variable',
    },
  },
  seo: {},
}

const settingsSchema = z
  .object({
    logo_text: z.string().catch(DEFAULT_SETTINGS.logo_text),
    brand_name: z.string().catch(DEFAULT_SETTINGS.brand_name),
    nav_cta_label: z.string().catch(DEFAULT_SETTINGS.nav_cta_label),
    hero: heroSchema,
    footer: footerSchema,
    theme: themeSchema,
    seo: seoSchema,
  })
  .catch(() => ({
    logo_text: DEFAULT_SETTINGS.logo_text,
    brand_name: DEFAULT_SETTINGS.brand_name,
    nav_cta_label: DEFAULT_SETTINGS.nav_cta_label,
    hero: {
      ghost_word: undefined,
      tagline: undefined,
      cta_primary: undefined,
      cta_secondary: undefined,
      roles: [],
      chips_left: [],
      chips_right: [],
      stats: [],
    },
    footer: {
      blurb: undefined,
      index_title: undefined,
      direct_title: undefined,
      status_label: undefined,
      copyright: undefined,
    },
    theme: {
      default_mode: 'dark' as const,
      fonts: {
        heading: 'Inter Variable',
        mono: 'JetBrains Mono Variable',
      },
      dark: undefined,
      light: undefined,
    },
    seo: {
      title: undefined,
      description: undefined,
    },
  }))

const profileSchema = z
  .object({
    full_name: z.string(),
    headline: nullString,
    summary: nullString,
    email: nullString,
    phone: nullString,
    location: nullString,
    avatar_url: nullString,
    resume_url: nullString,
  })
  .nullable()
  .catch(null)

const sectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  type: z.string().min(1),
  nav_label: nullString,
  eyebrow: nullString,
  title: nullString,
  subtitle: nullString,
  content: z
    .unknown()
    .optional()
    .transform((v): Record<string, unknown> =>
      v && typeof v === 'object' && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : {},
    ),
  position: numWithDefault(0),
  show_in_nav: boolWithDefault(false),
})

const socialLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().min(1),
  icon: nullString,
})

const overviewRowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string(),
})

const competencySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
})

const skillDomainSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tools: stringArray,
  status: z.string().catch(''),
})

const projectFileSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  path: z.string().catch(''),
  type: z.string().catch(''),
})

const projectSchema = z.object({
  id: z.string().min(1),
  kicker: nullString,
  title: z.string().min(1),
  summary: nullString,
  outcome: nullString,
  tagline: nullString,
  bullets: stringArray,
  tech: stringArray,
  github_url: nullString,
  live_url: nullString,
  cover_url: nullString,
  files: tolerantArray(projectFileSchema),
  featured: boolWithDefault(false),
})

const educationSchema = z.object({
  id: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  score_label: z.string().catch(''),
  score: nullString,
  note: nullString,
})

const certificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().catch(''),
  start_date: nullString,
  end_date: nullString,
  credential_url: nullString,
  featured: boolWithDefault(false),
})

const publicationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  venue: nullString,
  published_on: nullString,
  summary: nullString,
  reference: nullString,
  url: nullString,
})

export const siteContentSchema = z.object({
  version: numWithDefault(0),
  settings: settingsSchema,
  profile: profileSchema,
  sections: tolerantArray(sectionSchema),
  social_links: tolerantArray(socialLinkSchema),
  overview_rows: tolerantArray(overviewRowSchema),
  competencies: tolerantArray(competencySchema),
  skill_domains: tolerantArray(skillDomainSchema),
  projects: tolerantArray(projectSchema),
  education: tolerantArray(educationSchema),
  certifications: tolerantArray(certificationSchema),
  publications: tolerantArray(publicationSchema),
})

export const EMPTY_SITE_CONTENT: SiteContent = {
  version: 0,
  settings: DEFAULT_SETTINGS,
  profile: null,
  sections: [],
  social_links: [],
  overview_rows: [],
  competencies: [],
  skill_domains: [],
  projects: [],
  education: [],
  certifications: [],
  publications: [],
}

export function parseSiteContent(input: unknown): SiteContent | null {
  const result = siteContentSchema.safeParse(input)
  return result.success ? result.data : null
}

// Section content sub-schemas

const highlightItemSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const aboutContentSchema = z
  .object({
    overview_title: optString,
    competencies_title: optString,
    highlights: tolerantArray(highlightItemSchema),
  })
  .catch(() => ({
    overview_title: undefined,
    competencies_title: undefined,
    highlights: [],
  }))

export function parseAboutContent(raw: Record<string, unknown>): AboutSectionContent {
  return aboutContentSchema.parse(raw)
}

const archiveContentSchema = z
  .object({
    archive_button: optString,
  })
  .catch(() => ({
    archive_button: undefined,
  }))

export function parseArchiveContent(raw: Record<string, unknown>): ArchiveSectionContent {
  return archiveContentSchema.parse(raw)
}

const richTextContentSchema = z
  .object({
    body: z.string().catch(''),
  })
  .catch({ body: '' })

export function parseRichTextContent(raw: Record<string, unknown>): RichTextSectionContent {
  return richTextContentSchema.parse(raw)
}

const cardsItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().catch(''),
  url: optString,
})

const cardsContentSchema = z
  .object({
    items: tolerantArray(cardsItemSchema),
  })
  .catch({ items: [] })

export function parseCardsContent(raw: Record<string, unknown>): CardsSectionContent {
  return cardsContentSchema.parse(raw)
}

const galleryImageSchema = z.object({
  url: z.string().min(1),
  path: optString,
  caption: optString,
})

const galleryContentSchema = z
  .object({
    images: tolerantArray(galleryImageSchema),
  })
  .catch({ images: [] })

export function parseGalleryContent(raw: Record<string, unknown>): GallerySectionContent {
  return galleryContentSchema.parse(raw)
}
