import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '../components/SectionHeader'
import { ProjectCaseStudy } from '../components/sections/ProjectCaseStudy'
import { useContent } from '../context/contentContext'

export function ProjectsArchivePage() {
  const { content } = useContent()

  useEffect(() => {
    window.scrollTo({ top: 0 })
    const brand = content.settings.brand_name.trim() || 'Portfolio'
    document.title = `Projects Archive — ${brand}`
  }, [content.settings.brand_name])

  return (
    <section aria-labelledby="projects-archive-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 space-y-10">
        <div>
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to portfolio</span>
          </Link>
        </div>

        <SectionHeader
          as="h1"
          eyebrow="COMPLETE ARCHIVE"
          title="Projects & Architecture Archive"
          titleId="projects-archive-title"
          showDivider
          rightMeta={
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {content.projects.length} TOTAL CASE{' '}
              {content.projects.length === 1 ? 'STUDY' : 'STUDIES'}
            </p>
          }
        />

        {content.projects.length > 0 ? (
          <div className="divide-y divide-line">
            {content.projects.map((project, idx) => (
              <ProjectCaseStudy
                key={project.id}
                project={project}
                index={idx}
                showCover
              />
            ))}
          </div>
        ) : (
          <div className="card p-8">
            <p className="text-sm text-muted">No projects have been published yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectsArchivePage
