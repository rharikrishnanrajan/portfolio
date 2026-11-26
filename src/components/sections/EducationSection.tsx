import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface EducationSectionProps {
  section: SectionItem
}

export function EducationSection({ section }: EducationSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const titleId = `section-title-${section.id}`

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
          eyebrow={section.eyebrow || 'ACADEMICS'}
          title={section.title || 'Education'}
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

        {content.education.length > 0 ? (
          <div className="divide-y divide-line border-b border-line">
            {content.education.map((edu, idx) => (
              <article
                key={edu.id}
                className="py-8 grid gap-4 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-3 font-mono text-xs uppercase tracking-[0.2em] text-muted tabular-nums">
                  {String(idx + 1).padStart(2, '0')} // DEGREE
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-ink">{edu.degree}</h3>
                  <p className="text-sm text-muted">{edu.institution}</p>
                  {edu.note ? (
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/85 pt-1">
                      {edu.note}
                    </p>
                  ) : null}
                </div>

                <div className="md:col-span-3 flex items-center md:justify-end gap-3">
                  {edu.score_label ? (
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {edu.score_label}
                    </span>
                  ) : null}
                  {edu.score ? (
                    <span className="border border-line bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink tabular-nums">
                      {edu.score}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
