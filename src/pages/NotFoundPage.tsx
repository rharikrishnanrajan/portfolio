import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/contentContext'

export function NotFoundPage() {
  const { content } = useContent()

  useEffect(() => {
    const brand = content.settings.brand_name.trim() || 'Portfolio'
    document.title = `Page Not Found — ${brand}`
  }, [content.settings.brand_name])

  return (
    <section aria-labelledby="not-found-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="card max-w-xl p-8 sm:p-10 space-y-6">
          <p className="eyebrow">404 // ROUTE NOT FOUND</p>
          <h1
            id="not-found-title"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-ink"
          >
            Page not found
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            The requested route does not exist on this portfolio. Return to the main overview to
            browse projects, skills, and credentials.
          </p>
          <div>
            <Link to="/" className="btn-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
