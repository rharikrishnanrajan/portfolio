import { BookOpen, ExternalLink } from 'lucide-react'
import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import { formatMonthYear } from '../../lib/dates'
import { safeUrl } from '../../lib/safeUrl'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface PublicationsSectionProps {
  section: SectionItem
}

export function PublicationsSection({ section }: PublicationsSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const titleId = `section-title-${section.id}`

  if (content.publications.length === 0) {
    return null
  }

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
          eyebrow={section.eyebrow || 'RESEARCH'}
          title={section.title || 'Publications'}
          titleId={titleId}
          showDivider
          rightMeta={
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{content.publications.length} PUBLISHED ITEMS</span>
            </p>
          }
        />

        <div className="divide-y divide-line border-b border-line">
          {content.publications.map((pub, idx) => {
            const publishedDate = formatMonthYear(pub.published_on)
            const safePubUrl = safeUrl(pub.url, { allowMailtoTel: false })

            return (
              <article
                key={pub.id}
                className="py-6 px-4 -mx-4 grid gap-4 md:grid-cols-12 md:items-start transition-colors hover:bg-surface/75"
              >
                <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-muted pt-1 tabular-nums">
                  {String(idx + 1).padStart(2, '0')} // PUB
                </div>

                <div className="md:col-span-6 space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-ink">{pub.title}</h3>
                  {pub.venue ? (
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {pub.venue}
                    </p>
                  ) : null}
                  {pub.summary ? (
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                      {pub.summary}
                    </p>
                  ) : null}
                  {pub.reference ? (
                    <p className="font-mono text-xs text-muted/85">{pub.reference}</p>
                  ) : null}
                </div>

                <div className="md:col-span-4 flex items-center md:justify-end gap-6">
                  {publishedDate ? (
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted tabular-nums">
                      {publishedDate}
                    </span>
                  ) : null}

                  {safePubUrl ? (
                    <a
                      href={safePubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Read ${pub.title}`}
                      className="h-10 w-10 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
