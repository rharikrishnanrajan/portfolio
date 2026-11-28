import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ContentUpdatedPill } from './components/ContentUpdatedPill'
import { SpiralRuntime } from './components/SpiralRuntime'
import { EmptyView, LoadingView, UnavailableView } from './components/StatusViews'
import { ContentProvider } from './context/ContentProvider'
import { useContent } from './context/contentContext'
import { NotFoundPage } from './pages/NotFoundPage'
import { PortfolioHomePage } from './pages/PortfolioHomePage'
import { initScrollProgress, BACK_TO_TOP_THRESHOLD } from './lib/scroll'

const ProjectsArchivePage = lazy(() => import('./pages/ProjectsArchivePage'))
const CertificationsArchivePage = lazy(() => import('./pages/CertificationsArchivePage'))

function shouldUseSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ScrollProgressAndBackToTop() {
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const location = useLocation()

  // Initialize scroll progress on mount (A4) — updates CSS variable via ref without React state per scroll
  useEffect(() => {
    const el = progressBarRef.current
    const cleanup = initScrollProgress((progress) => {
      if (el) {
        el.style.setProperty('--scroll-progress', String(progress))
        el.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
      }
    })
    return cleanup
  }, [])

  // Show/hide back-to-top button based on scroll position (A3)
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > BACK_TO_TOP_THRESHOLD)
    }
    handleScroll() // initial check
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top on route change unless hash is present (A8)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: shouldUseSmoothScroll() ? 'smooth' : 'auto' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash])

  // F6: Smooth scroll to top on button click

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldUseSmoothScroll() ? 'smooth' : 'auto' })
  }

  return (
    <>
      {/* Scroll progress bar (A4) */}
      <div
        ref={progressBarRef}
        className="scroll-progress-bar"
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />

      {/* Back to top button (A3) */}
      <button
        type="button"
        className={`back-to-top btn-secondary rounded-full p-3 ${showBackToTop ? 'is-visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  )
}

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

      {/* S5: Decorative spiral background — aria-hidden, fixed, below content, engine-driven */}
      <SpiralRuntime />

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none relative z-10">
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
      <ScrollProgressAndBackToTop />
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