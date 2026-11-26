import { useMemo, useState } from 'react'
import { ArrowUpRight, FileDown, GitBranch, Globe, Mail, Phone } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../context/contentContext'
import { safeUrl } from '../lib/safeUrl'

function getDirectIcon(iconName: string | null) {
  const key = (iconName ?? '').trim().toLowerCase()
  if (key === 'github' || key === 'git') return GitBranch
  if (key === 'mail' || key === 'email') return Mail
  if (key === 'phone') return Phone
  if (key === 'linkedin') return ArrowUpRight
  return Globe
}

export function Footer() {
  const { content } = useContent()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { settings, profile, sections, social_links: socialLinks } = content
  const { footer, hero } = settings

  const navSections = useMemo(
    () =>
      [...sections]
        .filter((s) => s.show_in_nav)
        .sort((a, b) => a.position - b.position),
    [sections],
  )

  const safeEmailHref = profile?.email ? safeUrl(`mailto:${profile.email.trim()}`) : null
  const safePhoneHref = profile?.phone
    ? safeUrl(`tel:${profile.phone.replace(/\s+/g, '')}`)
    : null
  const safeResumeHref = safeUrl(profile?.resume_url, { allowMailtoTel: false })

  const safeSocials = socialLinks
    .map((link) => {
      const url = safeUrl(link.url, { allowMailtoTel: false })
      return url ? { ...link, url } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const [currentYear] = useState(() => String(new Date().getFullYear()))
  const rawCopyright =
    footer.copyright?.trim() || `© {year} ${settings.brand_name}. All rights reserved.`
  const copyrightText = rawCopyright.replaceAll('{year}', currentYear)

  return (
    <footer className="border-t border-line/60 bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-line bg-surface font-mono text-xs font-bold tracking-wider text-ink">
                {settings.logo_text}
              </span>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {settings.brand_name}
              </span>
            </div>

            {hero.roles.length > 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                {hero.roles.join('  ·  ')}
              </p>
            ) : null}

            {footer.blurb ? (
              <p className="text-sm text-muted leading-relaxed max-w-sm whitespace-pre-line">
                {footer.blurb}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <p className="eyebrow">{footer.index_title || 'INDEX'}</p>
            {navSections.length > 0 ? (
              <nav aria-label="Footer">
                <ul className="space-y-3">
                  {navSections.map((sec) => {
                    const label = sec.nav_label || sec.title || sec.slug
                    const href = isHome ? `#${sec.slug}` : `/#${sec.slug}`
                    return (
                      <li key={sec.id}>
                        {isHome ? (
                          <a
                            href={href}
                            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors"
                          >
                            {label}
                          </a>
                        ) : (
                          <Link
                            to={href}
                            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors"
                          >
                            {label}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>
            ) : null}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="eyebrow">{footer.direct_title || 'DIRECT'}</p>
            <ul className="space-y-3.5">
              {profile?.email && safeEmailHref ? (
                <li>
                  <a
                    href={safeEmailHref}
                    className="inline-flex items-center gap-3 text-sm text-muted hover:text-ink transition-colors"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{profile.email}</span>
                  </a>
                </li>
              ) : null}

              {safeSocials.map((link) => {
                const IconComponent = getDirectIcon(link.icon)
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-sm text-muted hover:text-ink transition-colors"
                    >
                      <IconComponent className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                )
              })}

              {profile?.phone && safePhoneHref ? (
                <li>
                  <a
                    href={safePhoneHref}
                    className="inline-flex items-center gap-3 text-sm text-muted hover:text-ink transition-colors"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{profile.phone}</span>
                  </a>
                </li>
              ) : null}

              {safeResumeHref ? (
                <li>
                  <a
                    href={safeResumeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-sm text-muted hover:text-ink transition-colors"
                  >
                    <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Resume</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted">{copyrightText}</p>

          <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            <span>{footer.status_label || 'SYSTEMS OPERATIONAL'}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
