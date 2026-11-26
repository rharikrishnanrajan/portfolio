import { useEffect } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '../components/SectionHeader'
import { CertificationRow } from '../components/sections/CertificationRow'
import { useContent } from '../context/contentContext'

export function CertificationsArchivePage() {
  const { content } = useContent()

  useEffect(() => {
    window.scrollTo({ top: 0 })
    const brand = content.settings.brand_name.trim() || 'Portfolio'
    document.title = `Certifications Archive — ${brand}`
  }, [content.settings.brand_name])

  return (
    <section aria-labelledby="certifications-archive-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 space-y-10">
        <div>
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to portfolio</span>
          </Link>
        </div>

        <SectionHeader
          as="h1"
          eyebrow="COMPLETE CREDENTIALS"
          title="Certifications & Training Archive"
          titleId="certifications-archive-title"
          showDivider
          rightMeta={
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{content.certifications.length} ACCREDITED CREDENTIALS</span>
            </p>
          }
        />

        {content.certifications.length > 0 ? (
          <div className="divide-y border-b border-line">
            {content.certifications.map((cert, idx) => (
              <CertificationRow key={cert.id} certification={cert} index={idx} />
            ))}
          </div>
        ) : (
          <div className="card p-8">
            <p className="text-sm text-muted">No certifications have been published yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CertificationsArchivePage
