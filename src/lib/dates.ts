/**
 * String-based "YYYY-MM-DD" date formatting.
 * Never uses `new Date()` to avoid timezone day-shifts.
 */

const MONTHS_UPPER = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function formatMonthYear(dateStr: string | null | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const match = DATE_RE.exec(dateStr.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isInteger(year) || year < 1000 || year > 9999) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  if (!Number.isInteger(day) || day < 1 || day > 31) return null

  return `${MONTHS_UPPER[month - 1]} ${match[1]}`
}

export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const start = formatMonthYear(startDate)
  const end = formatMonthYear(endDate)

  if (!start && !end) return ''
  if (start && end) return `${start} - ${end}`
  return start ?? end ?? ''
}
