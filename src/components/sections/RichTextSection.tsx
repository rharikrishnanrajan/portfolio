import { useReveal } from '../../hooks/useReveal'
import { parseRichTextContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface RichTextSectionProps {
  section: SectionItem
}

export function RichTextSection({ section }: RichTextSectionProps) {
  const { ref, isVisible } = useReveal<HTMLElement>()
  const parsed = parseRichTextContent(section.content)
  const titleId = `section-title-${section.id}`

  if (!parsed.body.trim()) {
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

        <div className="border-l-2 border-line pl-6 max-w-3xl">
          <p className="text-base sm:text-lg text-ink/90 leading-relaxed whitespace-pre-line">
            {parsed.body}
          </p>
        </div>
      </div>
    </section>
  )
}
