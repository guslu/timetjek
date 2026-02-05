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

export function toUTCISO(date: Date): string {
  return date.toISOString()
}

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

export function fromLocalInputValue(value: string): string {
  if (!value) return ''
  return new Date(value).toISOString()
}

export function formatElapsedSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export function elapsedSecondsSince(isoStarted: string): number {
  const start = new Date(isoStarted).getTime()
  return Math.max(0, Math.floor((Date.now() - start) / 1000))
}

/** Seconds within the current minute (0–59); used for circular progress ring. */
export function secondsInCurrentMinute(isoStarted: string): number {
  const total = elapsedSecondsSince(isoStarted)
  return total % 60
}

/** Fraction of current minute elapsed (0–1) for progress ring. */
export function minuteProgressFraction(isoStarted: string): number {
  const s = secondsInCurrentMinute(isoStarted)
  return s / 60
}

/** Format for "Started" line: YYYY-MM-DD HH:mm. */
export function formatStartedAt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}
