import { ExternalLink } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'
import { safeUrl } from '../../lib/safeUrl'
import { parseCardsContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface CardsSectionProps {
  section: SectionItem
}

export function CardsSection({ section }: CardsSectionProps) {
  const { ref, isVisible } = useReveal<HTMLElement>()
  const parsed = parseCardsContent(section.content)
  const titleId = `section-title-${section.id}`

  if (parsed.items.length === 0) {
    return null
  }

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 scroll-mt-16 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6 space-y-10">
        <SectionHeader
          eyebrow={section.eyebrow}
          title={section.title || section.nav_label || section.slug}
          titleId={titleId}
          showDivider
          rightMeta={
            section.subtitle ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {section.subtitle}
              </p>
            ) : null
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parsed.items.map((item, idx) => {
            const safeLink = safeUrl(item.url, { allowMailtoTel: false })
            return (
              <article
                key={`${item.title}-${idx}`}
                className="card p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold tracking-tight text-ink">{item.title}</h3>
                    {safeLink ? (
                      <a
                        href={safeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.title}`}
                        className="h-9 w-9 border border-line bg-bg/60 flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                  {item.text ? (
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                      {item.text}
                    </p>
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
