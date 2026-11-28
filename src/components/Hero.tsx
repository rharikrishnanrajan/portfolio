import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { useContent } from '../context/contentContext'
import { safeHeroTarget, safeImageUrl } from '../lib/safeUrl'
import { useSpiral } from '../hooks/useSpiral'

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
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  const displayName = profile?.full_name || settings.brand_name
  const safeAvatar = safeImageUrl(profile?.avatar_url)
  const showAvatarImg = Boolean(safeAvatar) && !imgFailed

  const primaryTarget = safeHeroTarget(hero.cta_primary?.target)
  const secondaryTarget = safeHeroTarget(hero.cta_secondary?.target)

  // Parallax layers via spiral engine (S4)
  const ghostParallaxRef = useSpiral<HTMLDivElement>({ kind: 'layer', depth: 0.18 })
  const glowParallaxRef = useSpiral<HTMLDivElement>({ kind: 'layer', depth: 0.24 })
  const leftChipsParallaxRef = useSpiral<HTMLUListElement>({ kind: 'layer', depth: 0.09 })
  const rightChipsParallaxRef = useSpiral<HTMLUListElement>({ kind: 'layer', depth: 0.12 })

  return (
    <section id="top" aria-labelledby="hero-heading" className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-4xl border border-line bg-surface/35 px-6 py-12 sm:px-12 sm:py-16"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 24%, rgb(var(--accent) / 0.14), transparent 58%)',
          }}
        >
          {/* Avatar radial glow parallax layer (S4) */}
          <div
            ref={glowParallaxRef}
            data-spiral="layer"
            data-depth="0.24"
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 top-16 -translate-x-1/2 w-64 h-64 rounded-full bg-accent/12 blur-3xl"
          />

          {hero.ghost_word ? (
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-x-0 top-[52%] -translate-y-1/2"
            >
              <div
                ref={ghostParallaxRef}
                data-spiral="layer"
                data-depth="0.18"
                className="text-center font-bold uppercase tracking-[0.06em] text-[clamp(4.5rem,15vw,12.5rem)] leading-none text-ink/2.5 whitespace-nowrap"
              >
                {hero.ghost_word}
              </div>
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar with staggered entrance and glow pulse (A6) */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-[3px] border-accent/70 shadow-[0_0_60px_rgb(var(--accent)/0.45),0_0_120px_rgb(var(--accent)/0.18)] bg-surface flex items-center justify-center animate-fade-up reveal-stagger-1" style={{ '--reveal-i': 0 }}>
              {showAvatarImg && safeAvatar ? (
                <img
                  src={safeAvatar}
                  alt={displayName}
                  width={176}
                  height={176}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onLoad={() => setAvatarLoaded(true)}
                  onError={() => setImgFailed(true)}
                  className={`h-full w-full object-cover transition-opacity duration-500 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : (
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-ink animate-fade-up reveal-stagger-1" style={{ '--reveal-i': 0 }}>
                  {getInitials(displayName)}
                </span>
              )}
              {/* Avatar ring glow pulse (pseudo-element opacity) (A6) */}
              <div className="absolute inset-0 border-[3px] border-accent/70 rounded-full animate-glow-pulse" aria-hidden="true" />
            </div>

            <div className="relative mt-8 w-full flex items-center justify-center">
              {/* Left chips with staggered float (A6) + parallax (S4) */}
              {hero.chips_left.length > 0 ? (
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2">
                  <ul
                    ref={leftChipsParallaxRef}
                    data-spiral="layer"
                    data-depth="0.09"
                    aria-label="Core specialties"
                    className="flex flex-col items-start gap-3"
                  >
                  {hero.chips_left.map((chip, idx) => (
                    <li
                      key={`${chip}-${idx}`}
                      className={`rounded-full border border-line bg-surface/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted whitespace-nowrap animate-float ${idx % 2 === 1 ? 'ml-4' : ''}`}
                      style={{
                        animationDelay: `${idx * 200}ms`,
                        '--reveal-i': 1 + idx,
                      }}
                    >
                      {chip}
                    </li>
                  ))}
                  </ul>
                </div>
              ) : null}

              <div className="max-w-3xl mx-auto">
                {/* Name - staggered entrance (A6) */}
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-bold tracking-[-0.04em] leading-[1.03] text-ink animate-fade-up reveal-stagger-2"
                  style={{ '--reveal-i': 1 }}
                >
                  {displayName}
                </h1>

                {/* Roles - staggered entrance (A6) */}
                {hero.roles.length > 0 ? (
                  <p className="mt-4 font-mono text-xs sm:text-sm uppercase tracking-[0.28em] text-muted animate-fade-up reveal-stagger-3" style={{ '--reveal-i': 2 }}>
                    {hero.roles.join('  ·  ')}
                  </p>
                ) : null}

                {/* Tagline - staggered entrance (A6) */}
                {hero.tagline ? (
                  <p className="mt-5 text-base sm:text-lg text-muted/95 max-w-2xl mx-auto leading-relaxed animate-fade-up reveal-stagger-4" style={{ '--reveal-i': 3 }}>
                    {hero.tagline}
                  </p>
                ) : null}

                {/* CTAs - staggered entrance (A6) */}
                {(hero.cta_primary && primaryTarget) || (hero.cta_secondary && secondaryTarget) ? (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up reveal-stagger-5" style={{ '--reveal-i': 4 }}>
                    {hero.cta_primary && primaryTarget ? (
                      <a
                        href={primaryTarget}
                        target={isExternalHttpUrl(primaryTarget) ? '_blank' : undefined}
                        rel={isExternalHttpUrl(primaryTarget) ? 'noopener noreferrer' : undefined}
                        className="btn-primary rounded-full px-7 py-3.5 btn-press"
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
                        className="btn-secondary rounded-full px-7 py-3.5 btn-press"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span>{hero.cta_secondary.label}</span>
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Right chips with staggered float (A6) + parallax (S4) */}
              {hero.chips_right.length > 0 ? (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2">
                  <ul
                    ref={rightChipsParallaxRef}
                    data-spiral="layer"
                    data-depth="0.12"
                    aria-label="Engineering practices"
                    className="flex flex-col items-end gap-3"
                  >
                  {hero.chips_right.map((chip, idx) => (
                    <li
                      key={`${chip}-${idx}`}
                      className={`rounded-full border border-line bg-surface/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted whitespace-nowrap animate-float ${idx % 2 === 1 ? 'mr-4' : ''}`}
                      style={{
                        animationDelay: `${idx * 200}ms`,
                        '--reveal-i': 5 + idx,
                      }}
                    >
                      {chip}
                    </li>
                  ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Stats strip - staggered entrance (A6) */}
            {hero.stats.length > 0 ? (
              <dl className="mt-12 pt-8 border-t border-line/60 w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-up reveal-stagger-6" style={{ '--reveal-i': 6 }}>
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