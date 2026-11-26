import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import { parseAboutContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'

export interface AboutSectionProps {
  section: SectionItem
}

export function AboutSection({ section }: AboutSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const aboutContent = parseAboutContent(section.content)
  const titleId = `section-title-${section.id}`

  const overviewTitle = aboutContent.overview_title || 'OVERVIEW AT A GLANCE'
  const competenciesTitle =
    aboutContent.competencies_title || 'CORE COMPETENCIES & TECHNICAL FOCUS'

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              <h2
                id={titleId}
                className="mt-3 text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-[1.06] text-ink"
              >
                {section.title || 'About'}
              </h2>
              {section.subtitle ? (
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted leading-relaxed">
                  {section.subtitle}
                </p>
              ) : null}
            </div>

            {content.overview_rows.length > 0 ? (
              <div className="card p-6">
                <p className="eyebrow mb-4">{overviewTitle}</p>
                <dl className="divide-y divide-line">
                  {content.overview_rows.map((row) => (
                    <div
                      key={row.id}
                      className="py-3.5 first:pt-1 last:pb-1 flex items-baseline justify-between gap-4"
                    >
                      <dt className="text-sm text-muted">{row.label}</dt>
                      <dd className="font-mono text-xs sm:text-sm font-semibold text-ink text-right">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7 space-y-10">
            {content.profile?.summary ? (
              <div className="border-l-2 border-line pl-6">
                <p className="text-base sm:text-lg text-ink/90 leading-relaxed whitespace-pre-line">
                  {content.profile.summary}
                </p>
              </div>
            ) : null}

            {content.competencies.length > 0 ? (
              <div className="pt-8 border-t border-line/60 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-ink">
                    {competenciesTitle}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted shrink-0">
                    {String(content.competencies.length).padStart(2, '0')} DOMAINS
                  </span>
                </div>

                <ol className="grid gap-3 sm:grid-cols-2">
                  {content.competencies.map((item, idx) => (
                    <li
                      key={item.id}
                      className="card p-4 sm:p-5 flex items-start gap-4 transition-colors hover:border-accent/50"
                    >
                      <span className="font-mono text-xs text-muted pt-0.5 shrink-0 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-ink leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {aboutContent.highlights.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {aboutContent.highlights.map((tile, idx) => (
                  <div key={`${tile.label}-${idx}`} className="card p-4 sm:p-5 space-y-1.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      {tile.label}
                    </p>
                    <p className="font-mono text-xs sm:text-sm font-semibold text-ink">
                      {tile.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
