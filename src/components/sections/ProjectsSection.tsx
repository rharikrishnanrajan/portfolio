import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import { parseArchiveContent } from '../../lib/schemas'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'
import { ProjectCaseStudy } from './ProjectCaseStudy'

export interface ProjectsSectionProps {
  section: SectionItem
}

export function ProjectsSection({ section }: ProjectsSectionProps) {
  const { content } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const archiveContent = parseArchiveContent(section.content)
  const titleId = `section-title-${section.id}`

  const totalCount = content.projects.length
  const featuredProjects = content.projects.filter((project) => project.featured)
  const hasArchive = totalCount > featuredProjects.length
  const archiveLabel = archiveContent.archive_button || 'View All Projects & Architecture Archive'

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 scroll-mt-16 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={section.eyebrow || 'ARCHITECTURE'}
          title={section.title || 'Selected Systems & Deployments'}
          titleId={titleId}
          showDivider
          belowMeta={
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {featuredProjects.length} OF {totalCount} FEATURED CASE STUDIES
              {section.subtitle ? `  ·  ${section.subtitle}` : ''}
            </p>
          }
        />

        {featuredProjects.length > 0 ? (
          <div className="divide-y divide-line">
            {featuredProjects.map((project, idx) => (
              <ProjectCaseStudy key={project.id} project={project} index={idx} />
            ))}
          </div>
        ) : null}

        {hasArchive ? (
          <div className="pt-10 border-t border-line flex justify-center">
            <Link to="/projects" className="btn-primary px-8 py-4">
              <span>
                {archiveLabel} ({totalCount})
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
