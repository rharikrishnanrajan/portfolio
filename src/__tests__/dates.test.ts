import { describe, expect, it } from 'vitest'
import { formatDateRange, formatMonthYear } from '../lib/dates'

describe('dates', () => {
  it('formats YYYY-MM-DD strings without timezone shift', () => {
    expect(formatMonthYear('2023-08-01')).toBe('AUG 2023')
    expect(formatMonthYear('2024-01-31')).toBe('JAN 2024')
    expect(formatMonthYear('2024-12-01')).toBe('DEC 2024')
  })

  it('formats ranges, handling null end_date or both null', () => {
    expect(formatDateRange('2023-08-01', '2023-11-30')).toBe('AUG 2023 - NOV 2023')
    expect(formatDateRange('2024-06-01', null)).toBe('JUN 2024')
    expect(formatDateRange(null, null)).toBe('')
    expect(formatDateRange(undefined, undefined)).toBe('')
  })

  it('rejects malformed dates', () => {
    expect(formatMonthYear('2023-13-01')).toBeNull()
    expect(formatMonthYear('2023-00-01')).toBeNull()
    expect(formatMonthYear('not-a-date')).toBeNull()
    expect(formatDateRange('invalid', '2023-11-01')).toBe('NOV 2023')
  })
})
