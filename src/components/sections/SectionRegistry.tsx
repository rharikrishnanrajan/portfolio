import type { ComponentType } from 'react'
import type { SectionItem } from '../../types/content'
import { ErrorBoundary } from '../ErrorBoundary'
import { AboutSection } from './AboutSection'
import { CardsSection } from './CardsSection'
import { CertificationsSection } from './CertificationsSection'
import { ContactSection } from './ContactSection'
import { EducationSection } from './EducationSection'
import { GallerySection } from './GallerySection'
import { ProjectsSection } from './ProjectsSection'
import { PublicationsSection } from './PublicationsSection'
import { RichTextSection } from './RichTextSection'
import { SkillsSection } from './SkillsSection'

export interface SectionComponentProps {
  section: SectionItem
  displayNumber?: string
}

const SECTION_REGISTRY: Record<string, ComponentType<SectionComponentProps>> = {
  about: AboutSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  education: EducationSection,
  certifications: CertificationsSection,
  publications: PublicationsSection,
  contact: ContactSection,
  rich_text: RichTextSection,
  cards: CardsSection,
  gallery: GallerySection,
}

function SectionErrorFallback({ section }: { section: SectionItem }) {
  return (
    <section
      id={section.slug}
      className="py-12 border-t border-line/60"
      aria-label={section.title || section.slug}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="card p-6 space-y-2" role="alert">
          <p className="eyebrow">Notice</p>
          <p className="text-sm text-muted">This section could not be displayed right now.</p>
        </div>
      </div>
    </section>
  )
}

export function RegisteredSection({ section, displayNumber }: SectionComponentProps) {
  if (!Object.hasOwn(SECTION_REGISTRY, section.type)) {
    return null
  }
  const SectionComponent = SECTION_REGISTRY[section.type]
  return (
    <ErrorBoundary fallback={<SectionErrorFallback section={section} />}>
      <SectionComponent section={section} displayNumber={displayNumber} />
    </ErrorBoundary>
  )
}
