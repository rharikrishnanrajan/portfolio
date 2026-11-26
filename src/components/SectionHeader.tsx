import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  eyebrow?: string | null
  title: string
  titleId: string
  as?: 'h1' | 'h2'
  prefixNumber?: string
  rightMeta?: ReactNode
  belowMeta?: ReactNode
  showDivider?: boolean
}

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  as = 'h2',
  prefixNumber,
  rightMeta,
  belowMeta,
  showDivider = false,
}: SectionHeaderProps) {
  const HeadingTag = as
  return (
    <div className={showDivider ? 'pb-8 border-b border-line' : undefined}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="eyebrow flex items-center gap-3">
              {prefixNumber ? (
                <>
                  <span>{prefixNumber}</span>
<<<<<<< HEAD
                  <span className="inline-block h-px w-8 bg-line" aria-hidden="true" />
=======
                  <span className="inline-block h-px w-12 bg-line" aria-hidden="true" />
>>>>>>> 1e876a4f27dc58068327e632155b462e8b036899
                </>
              ) : null}
              <span>{eyebrow}</span>
            </p>
          ) : null}
          <HeadingTag
            id={titleId}
            className="mt-3 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.06] text-ink"
          >
            {title}
          </HeadingTag>
        </div>

        {rightMeta ? <div className="lg:pb-1">{rightMeta}</div> : null}
      </div>

      {belowMeta ? <div className="mt-4">{belowMeta}</div> : null}
    </div>
  )
}
