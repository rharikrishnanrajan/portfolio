import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface SkillsSectionProps {
  section: SectionItem
}

export function SkillsSection({ section }: SkillsSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const titleId = `section-title-${section.id}`

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 scroll-mt-16 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6 space-y-12">
        <SectionHeader
          eyebrow={section.eyebrow || 'CAPABILITIES'}
          title={section.title || 'Skills'}
          titleId={titleId}
          rightMeta={
            section.subtitle ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {section.subtitle}
              </p>
            ) : null
          }
        />

        {content.skill_domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
            {content.skill_domains.map((domain, idx) => (
              <article
                key={domain.id}
                className="bg-surface p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-line">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted tabular-nums">
                      {String(idx + 1).padStart(2, '0')} // DOMAIN
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink font-semibold tabular-nums">
                      {domain.tools.length} {domain.tools.length === 1 ? 'TOOL' : 'TOOLS'}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">
                    {domain.title}
                  </h3>

                  {domain.tools.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {domain.tools.map((tool, toolIdx) => (
                        <li
                          key={`${tool}-${toolIdx}`}
                          className="border border-line bg-bg/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {domain.status ? (
                  <div className="mt-8 pt-4 border-t border-line">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      STATUS: <span className="text-ink font-semibold">{domain.status}</span>
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
