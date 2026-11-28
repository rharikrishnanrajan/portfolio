import { BookOpen } from 'lucide-react'
import { FaArrowUpRightFromSquare, FaFilePdf } from 'react-icons/fa6'
import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import { formatDayMonthYear } from '../../lib/dates'
import { safeUrl, safeStorageUrl } from '../../lib/safeUrl'
import type { SectionItem } from '../../types/content'
import { IconButton } from '../IconButton'
import { SectionHeader } from '../SectionHeader'
import { SpiralBlock } from '../SpiralBlock'

export interface PublicationsSectionProps {
  section: SectionItem
}

/** Returns true if the url is a Supabase storage doc or ends with .pdf */
function isPdfUrl(url: string): boolean {
  if (safeStorageUrl(url)) return true
  return url.toLowerCase().endsWith('.pdf')
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
      className={`py-20 sm:py-24 border-t border-line/60 scroll-mt-16 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={section.eyebrow || 'RESEARCH'}
          title={section.title || 'Publications'}
          titleId={titleId}
          showDivider
          rightMeta={
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted animate-fade-up" style={{ '--reveal-i': 0 }}>
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{content.publications.length} PUBLISHED ITEM{content.publications.length !== 1 ? 'S' : ''}</span>
            </p>
          }
        />

        <div className="divide-y border-b border-line">
          {content.publications.map((pub, idx) => {
            const publishedDate = formatDayMonthYear(pub.published_on)
            const safePubUrl = safeUrl(pub.url, { allowMailtoTel: false })
            const isPdf = safePubUrl ? isPdfUrl(safePubUrl) : false
            const docLabel = isPdf
              ? `Open paper document for ${pub.title} (opens in a new tab)`
              : `Open paper for ${pub.title} (opens in a new tab)`

            return (
              <SpiralBlock
                key={pub.id}
                as="article"
                kind="block"
                className="py-6 px-4 -mx-4 grid gap-4 md:grid-cols-12 md:items-start row-interactive"
              >
                <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-muted pt-1 tabular-nums">
                  {String(idx + 1).padStart(2, '0')} // PAPER
                </div>

                <div className="md:col-span-7 space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-ink leading-tight">
                    {pub.title}
                  </h3>
                  {pub.venue ? (
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {pub.venue}
                    </p>
                  ) : null}
                  <span className="inline-block font-mono text-[9px] uppercase tracking-[0.18em] text-muted border border-line px-2 py-0.5">
                    PRESENTED &amp; PUBLISHED
                  </span>
                  {pub.summary ? (
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-line max-w-prose">
                      {pub.summary}
                    </p>
                  ) : null}
                  {pub.reference ? (
                    <p className="font-mono text-xs text-muted/80 wrap-break-word">{pub.reference}</p>
                  ) : null}
                </div>

                <div className="md:col-span-3 flex flex-wrap items-center md:justify-end gap-4">
                  {publishedDate ? (
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted tabular-nums">
                      {publishedDate}
                    </span>
                  ) : null}

                  {safePubUrl ? (
                    <IconButton
                      href={safePubUrl}
                      label={docLabel}
                      tip={isPdf ? 'Open paper PDF' : 'Open paper link'}
                      icon={
                        isPdf ? (
                          <FaFilePdf className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <FaArrowUpRightFromSquare className="h-4 w-4" aria-hidden="true" />
                        )
                      }
                    />
                  ) : null}
                </div>
              </SpiralBlock>
            )
          })}
        </div>
      </div>
    </section>
  )
}
