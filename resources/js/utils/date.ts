/**
 * Parse ISO 8601 from API (UTC) and format in local time for display.
 */
export function formatLocalDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatLocalTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString(undefined, { timeStyle: 'short' })
}

/**
 * For forms: local datetime to ISO 8601 UTC for API.
 */
export function toUTCISO(date: Date): string {
  return date.toISOString()
}

/**
 * Pre-fill datetime-local input: ISO from API (UTC) -> local YYYY-MM-DDTHH:mm
 */
export function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

/**
 * Parse datetime-local value (local time) to ISO 8601 UTC.
 */
export function fromLocalInputValue(value: string): string {
  if (!value) return ''
  return new Date(value).toISOString()
}
