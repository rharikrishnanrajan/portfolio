import { useState, useEffect, useRef } from 'react'
import { safeImageUrl } from '../lib/safeUrl'
import type { ProjectItem } from '../types/content'

interface ProjectCoverProps {
  project: ProjectItem
}

/**
 * Shared ProjectCover component used by home page case studies and archive cards.
 * - 16:9 aspect ratio, 1px border, sharp corners, overflow hidden
 * - object-fit cover, explicit width/height (1280x720) for no layout shift
 * - loading="lazy", decoding="async"
 * - alt text "<project title> preview"
 * - Shimmer placeholder while loading, fade-in on load
 * - Handles already-cached images (checks img.complete on mount)
 * - OnError: whole box disappears gracefully
 * - src must pass safeImageUrl
 */
export function ProjectCover({ project }: ProjectCoverProps) {
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
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    setShowShimmer(false)
  }

  const handleError = () => {
    setCoverFailed(true)
  }

  if (!safeCover || coverFailed) {
    return null
  }

  return (
    <div className="relative overflow-hidden border border-line bg-surface aspect-[16/9]">
      {/* Shimmer placeholder */}
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
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          h-full w-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  )
}