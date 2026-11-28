import { ExternalLink, FileSpreadsheet, FileText, Image, Presentation } from 'lucide-react'
import { Link } from 'react-router-dom'
import { safeUrl, safeStorageUrl } from '../../lib/safeUrl'
import { useSpiral } from '../../hooks/useSpiral'
import { GithubMark } from '../GithubMark'
import { IconButton } from '../IconButton'
import { ProjectCover } from '../ProjectCover'
import type { ProjectItem } from '../../types/content'

export interface ProjectCaseStudyProps {
  project: ProjectItem
  index: number
  showCover?: boolean
}

const MAX_DOCUMENT_BUTTONS = 3

function getDocumentIcon(name: string, mimeType?: string) {
  const lowerName = name.toLowerCase()
  const lowerMime = (mimeType ?? '').toLowerCase()
  if (lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx') || lowerMime.includes('presentation')) {
    return <Presentation className="h-5 w-5" aria-hidden="true" />
  }
  if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerMime.includes('spreadsheet')) {
    return <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
  }
  if (
    /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(lowerName) ||
    lowerMime.startsWith('image/')
  ) {
    return <Image className="h-5 w-5" aria-hidden="true" />
  }
  return <FileText className="h-5 w-5" aria-hidden="true" />
}

export function ProjectCaseStudy({ project, index, showCover = false }: ProjectCaseStudyProps) {
  const spiralRef = useSpiral<HTMLDivElement>({ kind: 'block' })
  const safeGithub = safeUrl(project.github_url, { allowMailtoTel: false })
  const safeLive = safeUrl(project.live_url, { allowMailtoTel: false })

  const safeFiles = project.files
    .map((file) => {
      const url = safeStorageUrl(file.url)
      return url ? { ...file, url } : null
    })
    .filter((file): file is NonNullable<typeof file> => file !== null)

  const visibleFiles = safeFiles.slice(0, MAX_DOCUMENT_BUTTONS)
  const overflowCount = safeFiles.length - visibleFiles.length
  const hasActions = Boolean(safeGithub || safeLive || safeFiles.length > 0)
  const hasCover = showCover && project.cover_url

  return (
    <article id={`project-${project.id}`} className="py-12 sm:py-16 scroll-mt-20">
      <div ref={spiralRef} data-spiral="block" className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-baseline gap-4">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-ink tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            {project.kicker ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {project.kicker}
              </span>
            ) : null}
          </div>

          {project.outcome ? (
            <div className="card verified-outcome-shimmer w-full box-border p-5 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                VERIFIED OUTCOME
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-ink leading-snug">
                {project.outcome}
              </p>
            </div>
          ) : null}

          {project.tagline ? (
            <p className="flex items-start gap-2.5 font-mono text-xs text-muted leading-relaxed">
              <span
                className="mt-1.5 h-1.5 w-1.5 bg-muted shrink-0"
                aria-hidden="true"
              />
              <span>{project.tagline}</span>
            </p>
          ) : null}

          {/* Project cover image in left column, below tagline, same width as Verified outcome box */}
          {hasCover && (
            <ProjectCover project={project} variant="natural" className="mt-6" />
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight">
              {project.title}
            </h3>

            {hasActions ? (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {safeGithub ? (
                  <IconButton
                    href={safeGithub}
                    label={`GitHub repository for ${project.title} (opens in a new tab)`}
                    tip={`GitHub: ${project.title}`}
                    icon={<GithubMark className="h-5 w-5" />}
                  />
                ) : null}
                {visibleFiles.map((file, fileIdx) => {
                  const docLabel = `Open document ${file.name} for ${project.title} (opens in a new tab)`
                  return (
                    <IconButton
                      key={`${file.url}-${fileIdx}`}
                      href={file.url}
                      label={docLabel}
                      tip={file.name}
                      icon={getDocumentIcon(file.name, file.type)}
                    />
                  )
                })}
                {overflowCount > 0 ? (
                  <Link
                    to={`/projects#project-${project.id}`}
                    aria-label={`View ${overflowCount} more documents for ${project.title} in Projects Archive`}
                    title={`View ${overflowCount} more documents for ${project.title}`}
                    data-tip={`+${overflowCount} more in archive`}
                    className="icon-btn font-mono text-xs font-semibold"
                  >
                    +{overflowCount}
                  </Link>
                ) : null}
                {safeLive ? (
                  <IconButton
                    href={safeLive}
                    label={`Live demo of ${project.title} (opens in a new tab)`}
                    tip={`Live demo: ${project.title}`}
                    icon={<ExternalLink className="h-5 w-5" aria-hidden="true" />}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          {project.summary ? (
            <p className="text-base sm:text-lg text-muted leading-relaxed whitespace-pre-line">
              {project.summary}
            </p>
          ) : null}

          {project.bullets.length > 0 ? (
            <div className="border-l-2 border-line pl-5 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                ENGINEERING IMPLEMENTATION
              </p>
              <ul className="space-y-2.5">
                {project.bullets.map((bullet, bulletIdx) => (
                  <li
                    key={`${bullet}-${bulletIdx}`}
                    className="flex items-start gap-3 text-sm text-muted leading-relaxed"
                  >
                    <span className="text-muted/80 select-none shrink-0" aria-hidden="true">
                      —
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {project.tech.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((tag, tagIdx) => (
                <li
                  key={`${tag}-${tagIdx}`}
                  className="border border-line bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  )
}