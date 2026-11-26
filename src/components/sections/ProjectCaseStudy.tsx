import { useState } from 'react'
import { ExternalLink, FileText, GitBranch } from 'lucide-react'
import { safeImageUrl, safeUrl } from '../../lib/safeUrl'
import type { ProjectItem } from '../../types/content'

export interface ProjectCaseStudyProps {
  project: ProjectItem
  index: number
  showCover?: boolean
}

export function ProjectCaseStudy({ project, index, showCover = false }: ProjectCaseStudyProps) {
  const [coverFailed, setCoverFailed] = useState(false)

  const safeGithub = safeUrl(project.github_url, { allowMailtoTel: false })
  const safeLive = safeUrl(project.live_url, { allowMailtoTel: false })
  const safeCover = showCover ? safeImageUrl(project.cover_url) : null
  const safeFiles = project.files
    .map((file) => {
      const url = safeImageUrl(file.url)
      return url ? { ...file, url } : null
    })
    .filter((file): file is NonNullable<typeof file> => file !== null)

  return (
    <article className="py-12 sm:py-16">
      {safeCover && !coverFailed ? (
        <div className="mb-8 overflow-hidden border border-line bg-surface aspect-[16/9]">
          <img
            src={safeCover}
            alt={project.title}
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

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
            <div className="card p-5 space-y-2">
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
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight">
              {project.title}
            </h3>

            {safeGithub || safeLive ? (
              <div className="flex items-center gap-2 shrink-0">
                {safeGithub ? (
                  <a
                    href={safeGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.title} source repository`}
                    className="h-10 w-10 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors"
                  >
                    <GitBranch className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                {safeLive ? (
                  <a
                    href={safeLive}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} live site`}
                    className="h-10 w-10 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
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

          {safeFiles.length > 0 ? (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Documents:
              </span>
              {safeFiles.map((file, fileIdx) => (
                <a
                  key={`${file.url}-${fileIdx}`}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-ink hover:border-accent transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  <span>{file.name}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
