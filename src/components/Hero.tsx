import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { useContent } from '../context/contentContext'
import { safeHeroTarget, safeImageUrl } from '../lib/safeUrl'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'HK'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function isExternalHttpUrl(target: string): boolean {
  return target.startsWith('http://') || target.startsWith('https://')
}

export function Hero() {
  const { content } = useContent()
  const { settings, profile } = content
  const { hero } = settings
  const [imgFailed, setImgFailed] = useState(false)

  const displayName = profile?.full_name || settings.brand_name
  const safeAvatar = safeImageUrl(profile?.avatar_url)
  const showAvatarImg = Boolean(safeAvatar) && !imgFailed

  const primaryTarget = safeHeroTarget(hero.cta_primary?.target)
  const secondaryTarget = safeHeroTarget(hero.cta_secondary?.target)

  return (
    <section id="top" aria-labelledby="hero-heading" className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/35 px-6 py-12 sm:px-12 sm:py-16"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 24%, rgb(var(--accent) / 0.14), transparent 58%)',
          }}
        >
          {hero.ghost_word ? (
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-x-0 top-[52%] -translate-y-1/2 text-center font-bold uppercase tracking-[0.06em] text-[clamp(4.5rem,15vw,12.5rem)] leading-none text-ink/[0.04] whitespace-nowrap"
            >
              {hero.ghost_word}
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-accent/60 shadow-[0_0_55px_rgb(var(--accent)/0.35)] bg-surface flex items-center justify-center">
              {showAvatarImg && safeAvatar ? (
                <img
                  src={safeAvatar}
                  alt={displayName}
                  width={176}
                  height={176}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-ink">
                  {getInitials(displayName)}
                </span>
              )}
            </div>

            <div className="relative mt-8 w-full flex items-center justify-center">
              {hero.chips_left.length > 0 ? (
                <ul
                  aria-label="Core specialties"
                  className="hidden lg:flex flex-col items-start gap-3 absolute left-0 top-1/2 -translate-y-1/2"
                >
                  {hero.chips_left.map((chip, idx) => (
                    <li
                      key={`${chip}-${idx}`}
                      className={`rounded-full border border-line bg-surface/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted whitespace-nowrap ${
                        idx % 2 === 1 ? 'ml-4' : ''
                      }`}
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="max-w-3xl mx-auto">
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-bold tracking-[-0.04em] leading-[1.03] text-ink"
                >
                  {displayName}
                </h1>

                {hero.roles.length > 0 ? (
                  <p className="mt-4 font-mono text-xs sm:text-sm uppercase tracking-[0.28em] text-muted">
                    {hero.roles.join('  ·  ')}
                  </p>
                ) : null}

                {hero.tagline ? (
                  <p className="mt-5 text-base sm:text-lg text-muted/95 max-w-2xl mx-auto leading-relaxed">
                    {hero.tagline}
                  </p>
                ) : null}

                {(hero.cta_primary && primaryTarget) || (hero.cta_secondary && secondaryTarget) ? (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {hero.cta_primary && primaryTarget ? (
                      <a
                        href={primaryTarget}
                        target={isExternalHttpUrl(primaryTarget) ? '_blank' : undefined}
                        rel={isExternalHttpUrl(primaryTarget) ? 'noopener noreferrer' : undefined}
                        className="btn-primary rounded-full px-7 py-3.5"
                      >
                        <span>{hero.cta_primary.label}</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null}

                    {hero.cta_secondary && secondaryTarget ? (
                      <a
                        href={secondaryTarget}
                        target={isExternalHttpUrl(secondaryTarget) ? '_blank' : undefined}
                        rel={isExternalHttpUrl(secondaryTarget) ? 'noopener noreferrer' : undefined}
                        className="btn-secondary rounded-full px-7 py-3.5"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span>{hero.cta_secondary.label}</span>
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {hero.chips_right.length > 0 ? (
                <ul
                  aria-label="Engineering practices"
                  className="hidden lg:flex flex-col items-end gap-3 absolute right-0 top-1/2 -translate-y-1/2"
                >
                  {hero.chips_right.map((chip, idx) => (
                    <li
                      key={`${chip}-${idx}`}
                      className={`rounded-full border border-line bg-surface/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted whitespace-nowrap ${
                        idx % 2 === 1 ? 'mr-4' : ''
                      }`}
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {hero.stats.length > 0 ? (
              <dl className="mt-12 pt-8 border-t border-line/60 w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {hero.stats.map((stat, idx) => (
                  <div key={`${stat.label}-${idx}`} className="flex items-center gap-2">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {stat.label}:
                    </dt>
                    <dd className="font-mono text-[11px] uppercase tracking-[0.2em] font-semibold text-ink">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
