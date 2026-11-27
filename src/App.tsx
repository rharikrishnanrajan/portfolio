import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ContentUpdatedPill } from './components/ContentUpdatedPill'
import { EmptyView, LoadingView, UnavailableView } from './components/StatusViews'
import { ContentProvider } from './context/ContentProvider'
import { useContent } from './context/contentContext'
import { NotFoundPage } from './pages/NotFoundPage'
import { PortfolioHomePage } from './pages/PortfolioHomePage'

const ProjectsArchivePage = lazy(() => import('./pages/ProjectsArchivePage'))
const CertificationsArchivePage = lazy(() => import('./pages/CertificationsArchivePage'))

export function AppRoutes() {
  const { content, status, isRefreshing, retry } = useContent()

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

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<LoadingView />}>
          <Routes>
            <Route path="/" element={<PortfolioHomePage />} />
            <Route path="/projects" element={<ProjectsArchivePage />} />
            <Route path="/certifications" element={<CertificationsArchivePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <ContentUpdatedPill />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ContentProvider>
    </ErrorBoundary>
  )
}

export default App
