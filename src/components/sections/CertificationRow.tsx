import { ExternalLink, FileText } from 'lucide-react'
import { formatDateRange } from '../../lib/dates'
import { safeUrl, safeStorageUrl } from '../../lib/safeUrl'
import type { CertificationItem } from '../../types/content'
import { IconButton } from '../IconButton'

export interface CertificationRowProps {
  certification: CertificationItem
  index: number
}

/** Returns true if the url is a Supabase storage doc or ends with .pdf */
function isPdfUrl(url: string): boolean {
  if (safeStorageUrl(url)) return true
  return url.toLowerCase().endsWith('.pdf')
}

export function CertificationRow({ certification, index }: CertificationRowProps) {
  const dateRange = formatDateRange(certification.start_date, certification.end_date)
  const safeCredUrl = safeUrl(certification.credential_url, { allowMailtoTel: false })
  const isPdf = safeCredUrl ? isPdfUrl(safeCredUrl) : false
  const credLabel = isPdf
    ? `Open certificate PDF for ${certification.title} (opens in a new tab)`
    : `Verify credential for ${certification.title} (opens in a new tab)`

  return (
    <article className="py-6 px-4 -mx-4 grid gap-4 md:grid-cols-12 md:items-center row-interactive">
      <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-muted tabular-nums">
        {String(index + 1).padStart(2, '0')} // CERT
      </div>

      <div className="md:col-span-6 space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-ink">{certification.title}</h3>
        {certification.issuer ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {certification.issuer}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-4 flex items-center md:justify-end gap-6">
        {dateRange ? (
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted tabular-nums">
            {dateRange}
          </span>
        ) : null}

        {safeCredUrl ? (
          <IconButton
            href={safeCredUrl}
            label={credLabel}
            tip={isPdf ? 'Open certificate PDF' : 'Verify credential'}
            icon={
              isPdf ? (
                <FileText className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              )
            }
          />
        ) : null}
      </div>
    </article>
  )
}
