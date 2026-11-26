import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../context/contentContext'
import type { SectionItem } from '../types/content'

function useScrollSpy(sections: SectionItem[], enabled: boolean): string | null {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || sections.length === 0) {
      return
    }

    const slugs = sections.map((s) => s.slug)
    const elements = slugs
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visibleMap = new Map<string, IntersectionObserverEntry>()

    const pickActive = () => {
      if (window.scrollY < 160) {
        setActiveSlug(null)
        return
      }
      let bestSlug: string | null = null
      let bestTop = Number.POSITIVE_INFINITY
      for (const [slug, entry] of visibleMap.entries()) {
        if (entry.isIntersecting) {
          const top = Math.abs(entry.boundingClientRect.top - 96)
          if (top < bestTop) {
            bestTop = top
            bestSlug = slug
          }
        }
      }
      if (bestSlug) {
        setActiveSlug(bestSlug)
      }
    }

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.getAttribute('id')
            if (id) visibleMap.set(id, entry)
          }
          pickActive()
        },
        { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
      )

      for (const el of elements) {
        observer.observe(el)
      }

      const onScroll = () => {
        if (window.scrollY < 160) {
          setActiveSlug(null)
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        observer.disconnect()
        window.removeEventListener('scroll', onScroll)
      }
    }

    return undefined
  }, [sections, enabled])

  return enabled && sections.length > 0 ? activeSlug : null
}

export function Navbar() {
  const { content, themeMode, toggleThemeMode } = useContent()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const drawerId = useId()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const wasDrawerOpenRef = useRef(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navSections = useMemo(
    () =>
      [...content.sections]
        .filter((s) => s.show_in_nav)
        .sort((a, b) => a.position - b.position),
    [content.sections],
  )

  const activeSlug = useScrollSpy(navSections, isHome)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (drawerOpen) {
      wasDrawerOpenRef.current = true
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    } else {
      if (typeof dialog.close === 'function') {
        if (dialog.open) dialog.close()
      } else {
        dialog.removeAttribute('open')
      }
      if (wasDrawerOpenRef.current) {
        wasDrawerOpenRef.current = false
        triggerRef.current?.focus()
      }
    }
  }, [drawerOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const onCancel = (e: Event) => {
      e.preventDefault()
      setDrawerOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (drawerOpen && e.key === 'Escape') {
        setDrawerOpen(false)
      }
    }

    dialog.addEventListener('cancel', onCancel)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  const closeDrawer = () => setDrawerOpen(false)
  const ctaLabel = content.settings.nav_cta_label || "Let's Connect"

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 group"
          onClick={() => {
            if (isHome) {
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center border border-line bg-surface font-mono text-xs font-bold tracking-wider text-ink transition-colors group-hover:border-accent">
            {content.settings.logo_text}
          </span>
          <span className="font-bold tracking-tight text-sm sm:text-base text-ink">
            {content.settings.brand_name}
          </span>
        </Link>

        {navSections.length > 0 ? (
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center rounded-full border border-line bg-surface/70 px-3 py-1.5 gap-1"
          >
            {navSections.map((section) => {
              const label = section.nav_label || section.title || section.slug
              const isActive = isHome && activeSlug === section.slug
              const href = isHome ? `#${section.slug}` : `/#${section.slug}`

              return isHome ? (
                <a
                  key={section.id}
                  href={href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative px-3.5 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? 'text-ink font-semibold bg-accent/15'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={section.id}
                  to={href}
                  className="px-3.5 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink transition-colors"
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        ) : null}

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleThemeMode}
            className="h-10 w-10 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors cursor-pointer"
            aria-label={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={themeMode === 'light'}
          >
            {themeMode === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {isHome ? (
            <a href="#contact" className="btn-primary hidden sm:inline-flex py-2.5 px-5">
              {ctaLabel}
            </a>
          ) : (
            <Link to="/#contact" className="btn-primary hidden sm:inline-flex py-2.5 px-5">
              {ctaLabel}
            </Link>
          )}

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden h-10 w-10 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors cursor-pointer"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id={drawerId}
        aria-label="Mobile navigation"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDrawer()
          }
        }}
        className="m-0 ml-auto h-full max-h-none w-80 max-w-[85vw] border-l border-line bg-bg text-ink p-0 backdrop:bg-black/70 backdrop:backdrop-blur-xs"
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center border border-line bg-surface font-mono text-xs font-bold tracking-wider">
                  {content.settings.logo_text}
                </span>
                <span className="font-bold tracking-tight text-sm">
                  {content.settings.brand_name}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                autoFocus
                aria-label="Close navigation menu"
                className="h-9 w-9 border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-accent transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {navSections.map((section) => {
                const label = section.nav_label || section.title || section.slug
                const isActive = isHome && activeSlug === section.slug
                const href = isHome ? `#${section.slug}` : `/#${section.slug}`

                return isHome ? (
                  <a
                    key={section.id}
                    href={href}
                    onClick={closeDrawer}
                    aria-current={isActive ? 'true' : undefined}
                    className={`px-3 py-3 font-mono text-xs uppercase tracking-[0.2em] border-l-2 transition-colors ${
                      isActive
                        ? 'border-accent text-ink font-semibold bg-surface/60'
                        : 'border-transparent text-muted hover:text-ink hover:border-line'
                    }`}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={section.id}
                    to={href}
                    onClick={closeDrawer}
                    className="px-3 py-3 font-mono text-xs uppercase tracking-[0.2em] border-l-2 border-transparent text-muted hover:text-ink hover:border-line transition-colors"
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-line">
            {isHome ? (
              <a href="#contact" onClick={closeDrawer} className="btn-primary w-full">
                {ctaLabel}
              </a>
            ) : (
              <Link to="/#contact" onClick={closeDrawer} className="btn-primary w-full">
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </dialog>
    </header>
  )
}
