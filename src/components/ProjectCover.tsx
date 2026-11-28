import { useState, useEffect, useRef } from 'react'
import { safeImageUrl } from '../lib/safeUrl'
import { useHoverTilt } from '../hooks/useHoverTilt'
import type { ProjectItem } from '../types/content'

export type CoverVariant = 'natural' | 'cropped'

export interface ProjectCoverProps {
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
 *              Shows 16:9 shimmer placeholder until loaded, then switches wrapper to natural
 *              aspect-ratio via style.setProperty. Safety cap: max-height 32rem; if exceeded,
 *              uses object-fit: contain with bg-surface background, centered.
 *              Wraps in an anchor with zoom-in cursor and hover border color change.
 *
 * S6: Hover tilt is applied to the cropped variant wrapper (a descendant of the spiral block).
 *     Natural variant is inside an <a> anchor so tilt is skipped there.
 */
function setWrapperNaturalAspectRatio(wrapper: HTMLDivElement | null, img: HTMLImageElement) {
  if (!wrapper) return
  const w = Math.trunc(img.naturalWidth)
  const h = Math.trunc(img.naturalHeight)
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
    wrapper.style.setProperty('aspect-ratio', `${w} / ${h}`)
  }
}

export function ProjectCover({ project, variant = 'cropped', className = '' }: ProjectCoverProps) {
  const [coverFailed, setCoverFailed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  // For the natural variant: separate ref to track wrapper for aspect-ratio update.
  const naturalWrapperRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  // S6: hover tilt on the cropped variant wrapper (a descendant of the spiral block)
  const croppedTiltRef = useHoverTilt<HTMLDivElement>()

  const safeCover = safeImageUrl(project.cover_url)

  // Handle already-cached images
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true)
      if (variant === 'natural') {
        setWrapperNaturalAspectRatio(naturalWrapperRef.current, img)
      }
    }
  }, [variant])

  const handleLoad = () => {
    setIsLoaded(true)
    if (variant === 'natural' && imgRef.current) {
      setWrapperNaturalAspectRatio(naturalWrapperRef.current, imgRef.current)
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
      {/* Shimmer placeholder - 16:9 for natural variant until loaded */}
      {!isLoaded && (
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
            ? 'block w-full h-auto max-h-[32rem] object-contain bg-surface mx-auto'
            : 'h-full w-full object-cover transition-transform duration-700 ease-out'
          }
        `}
      />
    </>
  )

  if (isNatural) {
    return (
      <a
        href={safeCover}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View full-size preview of ${project.title} (opens in a new tab)`}
        className={`group block w-full cursor-zoom-in hover:border-accent transition-colors duration-200 ${className}`.trim()}
      >
        <div
          ref={naturalWrapperRef}
          style={{ aspectRatio: '16 / 9' }}
          className="relative w-full box-border max-h-[32rem] overflow-hidden border border-line bg-surface transition-colors duration-200 group-hover:border-accent"
        >
          {imageContent}
        </div>
      </a>
    )
  }

  return (
    <div
      ref={croppedTiltRef}
      className={`cover-wrapper hover-tilt-card relative overflow-hidden border border-line bg-surface aspect-[16/9] ${className}`.trim()}
    >
      {imageContent}
    </div>
  )
}
