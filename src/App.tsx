import { Moon, RefreshCw, Sun } from 'lucide-react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { EmptyView, LoadingView, UnavailableView } from './components/StatusViews'
import { ContentProvider } from './context/ContentProvider'
import { useContent } from './context/contentContext'

function PortfolioPreviewShell() {
  const { content, status, source, isRefreshing, themeMode, toggleThemeMode, retry } =
    useContent()

  if (status === 'loading') {
    return <LoadingView />
  }

  if (status === 'unavailable') {
    return <UnavailableView onRetry={retry} isRetrying={isRefreshing} />
  }

  if (status === 'empty') {
    return (
      <EmptyView
        brandName={content.settings.brand_name}
        onRefresh={retry}
        isRefreshing={isRefreshing}
      />
    )
  }

  const orderedSections = [...content.sections].sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center border border-line bg-surface font-mono text-xs font-bold tracking-wider">
              {content.settings.logo_text}
            </span>
            <span className="font-bold tracking-tight text-base">
              {content.settings.brand_name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="eyebrow hidden sm:inline">
              v{content.version} · {source}
            </span>
            <button
              type="button"
              onClick={retry}
              disabled={isRefreshing}
              className="btn-secondary px-3 py-2"
              aria-label="Refresh portfolio content"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="btn-secondary px-3 py-2"
              aria-label={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {themeMode === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <section className="card p-8 space-y-3" aria-labelledby="phase1-heading">
          <p className="eyebrow">Data Pipeline Active</p>
          <h1 id="phase1-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
            {content.profile?.full_name || content.settings.brand_name}
          </h1>
          {content.profile?.headline ? (
            <p className="text-muted text-base">{content.profile.headline}</p>
          ) : null}
        </section>

        <section className="space-y-4" aria-labelledby="sections-heading">
          <div className="flex items-center justify-between">
            <h2 id="sections-heading" className="eyebrow">
              Published Sections ({orderedSections.length})
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {orderedSections.map((section, idx) => (
              <div key={section.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="eyebrow">
                    {String(idx + 1).padStart(2, '0')} // {section.type}
                  </span>
                  <span className="font-mono text-xs text-muted">#{section.slug}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">
                  {section.title || section.nav_label || section.slug}
                </h3>
                {section.subtitle ? (
                  <p className="text-xs text-muted">{section.subtitle}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <PortfolioPreviewShell />
      </ContentProvider>
    </ErrorBoundary>
  )
}

export default App
