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

/** Time only for list display, e.g. "01:07". */
export function formatTimeOnly(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Duration in minutes between start and end (or now if end is null). */
export function entryDurationMinutes(started_at: string, ended_at: string | null): number {
  const start = new Date(started_at).getTime()
  const end = ended_at ? new Date(ended_at).getTime() : Date.now()
  return Math.max(0, Math.floor((end - start) / 60000))
}

/** Format minutes as "19 min" or "1h 32m". */
export function formatDurationShort(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** "Today • Feb 5, 2026" for header. */
export function formatTodayLabel(): string {
  const d = new Date()
  const mon = d.toLocaleString(undefined, { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  return `Today • ${mon} ${day}, ${year}`
}
