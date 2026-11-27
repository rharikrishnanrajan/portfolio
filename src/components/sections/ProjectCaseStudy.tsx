import { ExternalLink, FileText, GitBranch, File, FileCode, FileImage, FileSpreadsheet, FileType, FileVideo, FileAudio } from 'lucide-react'
import { safeUrl, safeStorageUrl } from '../../lib/safeUrl'
import { ProjectCover } from '../ProjectCover'
import type { ProjectItem, ProjectFile } from '../../types/content'

export interface ProjectCaseStudyProps {
  project: ProjectItem
  index: number
  showCover?: boolean
}

function getFileTypeIcon(file: ProjectFile): React.ReactElement {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type?.toLowerCase() ?? ''

  if (['pdf'].includes(ext) || mime.includes('pdf')) {
    return <FileText className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['doc', 'docx', 'rtf', 'txt', 'md'].includes(ext) || mime.includes('word') || mime.includes('text')) {
    return <FileType className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) {
    return <File className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) {
    return <FileSpreadsheet className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp'].includes(ext) || mime.startsWith('image/')) {
    return <FileImage className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || mime.startsWith('video/')) {
    return <FileVideo className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext) || mime.startsWith('audio/')) {
    return <FileAudio className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'swift', 'kt', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css', 'scss', 'sh', 'ps1', 'sql'].includes(ext) || mime.includes('code') || mime.includes('script')) {
    return <FileCode className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
  }
  return <File className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
}

function getFileExtensionBadge(file: ProjectFile): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext ? ext.toUpperCase() : 'FILE'
}

function truncateFileName(name: string, maxLength = 36): string {
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 1) + '…'
}

export function ProjectCaseStudy({ project, index, showCover = false }: ProjectCaseStudyProps) {
  const safeGithub = safeUrl(project.github_url, { allowMailtoTel: false })
  const safeLive = safeUrl(project.live_url, { allowMailtoTel: false })

  const safeFiles = project.files
    .map((file) => {
      const url = safeStorageUrl(file.url)
      return url ? { ...file, url } : null
    })
    .filter((file): file is NonNullable<typeof file> => file !== null)

  const hasActions = safeGithub || safeLive || safeFiles.length > 0
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
            <div className="card verified-outcome-shimmer p-5 space-y-2">
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
            <ProjectCover project={project} variant="natural" className="mt-6 w-full box-border" />
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight">
              {project.title}
            </h3>

            {hasActions ? (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {safeGithub ? (
                  <a
                    href={safeGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Repository for ${project.title} (opens in a new tab)`}
                    className="btn-secondary h-10 px-4 min-w-[120px] text-sm btn-press"
                  >
                    <GitBranch className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Repository</span>
                    <span className="sm:hidden" aria-hidden="true">Repo</span>
                  </a>
                ) : null}
                {safeLive ? (
                  <a
                    href={safeLive}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Live demo for ${project.title} (opens in a new tab)`}
                    className="btn-secondary h-10 px-4 min-w-[120px] text-sm btn-press"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Live demo</span>
                    <span className="sm:hidden" aria-hidden="true">Demo</span>
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
            <div className="pt-2 flex flex-wrap items-center gap-2 animate-fade-up" style={{ '--reveal-i': 6 }}>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Documents ({safeFiles.length}):
              </span>
              {safeFiles.map((file, fileIdx) => (
                <a
                  key={`${file.url}-${fileIdx}`}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${file.name} for ${project.title} (opens in a new tab)`}
                  title={file.name}
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 font-mono text-[10px] text-ink hover:border-accent transition-colors hover:shadow-[0_4px_12px_rgb(var(--accent)/0.15)] btn-press"
                >
                  {getFileTypeIcon(file)}
                  <span className="truncate max-w-[160px]">{truncateFileName(file.name)}</span>
                  <span className="px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-muted border border-line bg-surface/50 rounded">
                    {getFileExtensionBadge(file)}
                  </span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}