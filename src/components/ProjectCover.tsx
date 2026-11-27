import { useState, useEffect, useRef } from 'react'
import { safeImageUrl } from '../lib/safeUrl'
import type { ProjectItem } from '../types/content'

type CoverVariant = 'natural' | 'cropped'

interface ProjectCoverProps {
  project: ProjectItem
  variant?: CoverVariant
  className?: string
}

/**
 * Shared ProjectCover component used by home page case studies and archive cards.
 *
 * Variants:
 * - "cropped" (default): 16:9 aspect ratio, object-fit cover, fixed dimensions (1280x720)
 * - "natural": full column width, height follows image proportions (height: auto),
 *              no object-fit cover, no forced aspect ratio crop.
 *              Shows 16:9 shimmer placeholder until loaded, then switches to natural aspect-ratio
 *              via style.setProperty. Safety cap: max-height 32rem; if exceeded, uses
 *              object-fit: contain with bg-surface background, centered.
 *              Optional anchor wrapper with zoom-in cursor and hover border color change.
 */
export function ProjectCover({ project, variant = 'cropped', className }: ProjectCoverProps) {
  const [coverFailed, setCoverFailed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showShimmer, setShowShimmer] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)

  const safeCover = safeImageUrl(project.cover_url)

  // Handle already-cached images
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete) {
      setIsLoaded(true)
      setShowShimmer(false)
      if (variant === 'natural' && img.naturalWidth > 0 && img.naturalHeight > 0) {
        const aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
        img.style.setProperty('aspect-ratio', aspectRatio)
      }
    }
  }, [variant])

  const handleLoad = () => {
    setIsLoaded(true)
    setShowShimmer(false)
    if (variant === 'natural') {
      const img = imgRef.current
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        const aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
        img.style.setProperty('aspect-ratio', aspectRatio)
      }
    }
  }

  const handleError = () => {
    setCoverFailed(true)
  }

  if (!safeCover || coverFailed) {
    return null
  }

  const isNatural = variant === 'natural'

  const imageContent = (
    <>
      {/* Shimmer placeholder - always 16:9 for natural variant until loaded */}
      {showShimmer && (
        <div
          className="absolute inset-0 animate-shimmer bg-gradient-to-r from-surface via-line/20 to-surface"
          aria-hidden="true"
        />
      )}

      <img
        ref={imgRef}
        src={safeCover}
        alt={`${project.title} preview`}
        width={isNatural ? undefined : 1280}
        height={isNatural ? undefined : 720}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isNatural
            ? 'w-full h-auto block max-h-[32rem] object-contain bg-surface mx-auto'
            : 'h-full w-full object-cover transition-transform duration-700 ease-out'
          }
        `}
        style={isNatural ? { aspectRatio: '16 / 9' } : undefined}
      />
    </>
  )

  const wrapperClasses = `
    relative overflow-hidden border border-line bg-surface
    ${isNatural ? 'w-full box-border' : 'aspect-[16/9]'}
    ${className ? ` ${className}` : ''}
  `

  if (isNatural) {
    return (
      <a
        href={safeCover}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View full-size preview of ${project.title} (opens in a new tab)`}
        className="cover-wrapper block cursor-zoom-in hover:border-accent transition-colors duration-200"
      >
        <div className={wrapperClasses}>{imageContent}</div>
      </a>
    )
  }

  return (
    <div className={wrapperClasses}>{imageContent}</div>
  )
}