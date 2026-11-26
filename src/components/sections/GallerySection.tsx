import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { safeImageUrl } from '../../lib/safeUrl'
import { parseGalleryContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'

export interface GallerySectionProps {
  section: SectionItem
}

function GalleryCard({
  url,
  caption,
  fallbackAlt,
}: {
  url: string
  caption?: string
  fallbackAlt: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <figure className="card overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-bg/60 overflow-hidden">
        <img
          src={url}
          alt={caption || fallbackAlt}
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="px-4 py-3 border-t border-line font-mono text-xs text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function GallerySection({ section }: GallerySectionProps) {
  const { ref, isVisible } = useReveal<HTMLElement>()
  const parsed = parseGalleryContent(section.content)
  const titleId = `section-title-${section.id}`

  const safeImages = parsed.images
    .map((img) => {
      const url = safeImageUrl(img.url)
      return url ? { ...img, url } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (safeImages.length === 0) {
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safeImages.map((img, idx) => (
            <GalleryCard
              key={`${img.url}-${idx}`}
              url={img.url}
              caption={img.caption}
              fallbackAlt={section.title || 'Portfolio gallery image'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
