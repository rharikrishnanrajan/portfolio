import { ExternalLink, FileText } from 'lucide-react'
import { safeUrl, safeStorageUrl } from '../../lib/safeUrl'
import { GithubMark } from '../GithubMark'
import { ProjectCover } from '../ProjectCover'
import type { ProjectItem } from '../../types/content'

export interface ProjectCaseStudyProps {
  project: ProjectItem
  index: number
  showCover?: boolean
}

const MAX_DOCUMENT_BUTTONS = 3

const ICON_BUTTON_CLASS =
  'inline-flex h-10 w-10 max-sm:h-11 max-sm:w-11 items-center justify-center border border-line bg-surface text-muted transition-[border-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-accent hover:text-ink hover:-translate-y-px focus-visible:border-accent focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

export function ProjectCaseStudy({ project, index, showCover = false }: ProjectCaseStudyProps) {
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
    <article className="py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
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
                  <a
                    href={safeGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub repository for ${project.title} (opens in a new tab)`}
                    title={`GitHub repository for ${project.title} (opens in a new tab)`}
                    className={ICON_BUTTON_CLASS}
                  >
                    <GithubMark className="h-5 w-5" />
                  </a>
                ) : null}
                {safeLive ? (
                  <a
                    href={safeLive}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Live demo of ${project.title} (opens in a new tab)`}
                    title={`Live demo of ${project.title} (opens in a new tab)`}
                    className={ICON_BUTTON_CLASS}
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  </a>
                ) : null}
                {visibleFiles.map((file, fileIdx) => {
                  const docLabel = `Open document ${file.name} for ${project.title} (opens in a new tab)`
                  return (
                    <a
                      key={`${file.url}-${fileIdx}`}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={docLabel}
                      title={docLabel}
                      className={ICON_BUTTON_CLASS}
                    >
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </a>
                  )
                })}
                {overflowCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 max-sm:h-11 max-sm:w-11 items-center justify-center border border-line bg-surface font-mono text-xs text-muted select-none"
                  >
                    +{overflowCount}
                  </span>
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