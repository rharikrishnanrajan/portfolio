import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import { parseArchiveContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'
import { CertificationRow } from './CertificationRow'

export interface CertificationsSectionProps {
  section: SectionItem
}

export function CertificationsSection({ section }: CertificationsSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const archiveContent = parseArchiveContent(section.content)
  const titleId = `section-title-${section.id}`

  const totalCount = content.certifications.length
  const featuredCerts = content.certifications.filter((cert) => cert.featured)
  const hasArchive = totalCount > featuredCerts.length
  const archiveLabel =
    archiveContent.archive_button || 'View All Credentials & Certifications Archive'

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={section.eyebrow || 'CREDENTIALS'}
          title={section.title || 'Certifications & Training'}
          titleId={titleId}
          showDivider
          rightMeta={
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {featuredCerts.length} OF {totalCount} ACCREDITED CREDENTIALS
              </span>
            </p>
          }
        />

        {featuredCerts.length > 0 ? (
          <div className="divide-y divide-line">
            {featuredCerts.map((cert, idx) => (
              <CertificationRow key={cert.id} certification={cert} index={idx} />
            ))}
          </div>
        ) : null}

        {hasArchive ? (
          <div className="pt-10 border-t border-line flex justify-center">
            <Link to="/certifications" className="btn-primary px-8 py-4">
              <span>
                {archiveLabel} ({totalCount})
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
