import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTimeEntries, resetTimeEntriesState } from './useTimeEntries'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()

vi.mock('@/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}))

const entry = {
  id: 1,
  user_id: 1,
  started_at: '2026-02-01T10:00:00.000000Z',
  ended_at: null,
  start_lat: null,
  start_lng: null,
  end_lat: null,
  end_lng: null,
  created_at: '2026-02-01T10:00:00.000000Z',
  updated_at: '2026-02-01T10:00:00.000000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  resetTimeEntriesState()
})

describe('useTimeEntries', () => {
  it('returns openEntry, isClockedIn, fetchOpenEntry, clockIn, clockOut, fetchList, fetchOne, updateEntry, listCache', () => {
    const te = useTimeEntries()
    expect(te.openEntry.value).toBeNull()
    expect(te.isClockedIn.value).toBe(false)
    expect(te.fetchOpenEntry).toBeTypeOf('function')
    expect(te.clockIn).toBeTypeOf('function')
    expect(te.clockOut).toBeTypeOf('function')
    expect(te.fetchList).toBeTypeOf('function')
    expect(te.fetchOne).toBeTypeOf('function')
    expect(te.updateEntry).toBeTypeOf('function')
  })

  it('fetchOpenEntry sets openEntry from current endpoint', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: entry } })
    const te = useTimeEntries()
    await te.fetchOpenEntry()
    expect(te.openEntry.value).toEqual(entry)
    expect(te.isClockedIn.value).toBe(true)
  })

  it('fetchOpenEntry sets openEntry to null on error', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'))
    const te = useTimeEntries()
    await te.fetchOpenEntry()
    expect(te.openEntry.value).toBeNull()
  })

  it('clockIn posts and sets openEntry', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: entry } })
    const te = useTimeEntries()
    const result = await te.clockIn(55.6, 12.5)
    expect(result).toEqual(entry)
    expect(te.openEntry.value).toEqual(entry)
    expect(mockPost).toHaveBeenCalledWith('/api/time-entries/clock-in', { lat: 55.6, lng: 12.5 })
  })

  it('clockIn sends empty payload without coords', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: entry } })
    const te = useTimeEntries()
    await te.clockIn()
    expect(mockPost).toHaveBeenCalledWith('/api/time-entries/clock-in', {})
  })

  it('clockOut posts and clears openEntry', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { ...entry, ended_at: '2026-02-01T12:00:00.000000Z' } } })
    const te = useTimeEntries()
    te.openEntry.value = entry
    await te.clockOut(55.6, 12.5)
    expect(te.openEntry.value).toBeNull()
    expect(mockPost).toHaveBeenCalledWith('/api/time-entries/clock-out', { lat: 55.6, lng: 12.5 })
  })

  it('fetchList stores result in listCache', async () => {
    const list = {
      data: [entry],
      links: { first: 'x', last: 'x', prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    }
    mockGet.mockResolvedValueOnce({ data: list })
    const te = useTimeEntries()
    const result = await te.fetchList(2)
    expect(result).toEqual(list)
    expect(te.listCache.value).toEqual(list)
    expect(mockGet).toHaveBeenCalledWith('/api/time-entries', { params: { page: 2 } })
  })

  it('fetchOne returns entry', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: entry } })
    const te = useTimeEntries()
    const result = await te.fetchOne(1)
    expect(result).toEqual(entry)
    expect(mockGet).toHaveBeenCalledWith('/api/time-entries/1')
  })

  it('updateEntry updates openEntry when it is the same entry and still open', async () => {
    const updated = { ...entry, started_at: '2026-02-01T11:00:00.000000Z' }
    mockPut.mockResolvedValueOnce({ data: { data: updated } })
    const te = useTimeEntries()
    te.openEntry.value = entry
    const result = await te.updateEntry(1, { started_at: '2026-02-01T11:00:00.000000Z' })
    expect(result).toEqual(updated)
    expect(te.openEntry.value).toEqual(updated)
  })

  it('updateEntry clears openEntry when updated entry has ended_at', async () => {
    const closed = { ...entry, ended_at: '2026-02-01T12:00:00.000000Z' }
    mockPut.mockResolvedValueOnce({ data: { data: closed } })
    const te = useTimeEntries()
    te.openEntry.value = entry
    await te.updateEntry(1, { ended_at: '2026-02-01T12:00:00.000000Z' })
    expect(te.openEntry.value).toBeNull()
  })

  it('updateEntry does not modify openEntry when updating a different entry', async () => {
    const otherEntry = { ...entry, id: 2, started_at: '2026-02-01T14:00:00.000000Z' }
    mockPut.mockResolvedValueOnce({ data: { data: otherEntry } })
    const te = useTimeEntries()
    te.openEntry.value = entry // openEntry is id=1
    await te.updateEntry(2, { started_at: '2026-02-01T14:00:00.000000Z' }) // updating id=2
    expect(te.openEntry.value).toEqual(entry) // openEntry should remain unchanged
  })

  it('clockIn throws and does not modify openEntry on error', async () => {
    const error = { response: { status: 422, data: { errors: { clock: ['Already clocked in'] } } } }
    mockPost.mockRejectedValueOnce(error)
    const te = useTimeEntries()
    te.openEntry.value = null

    await expect(te.clockIn()).rejects.toEqual(error)
    expect(te.openEntry.value).toBeNull()
  })

  it('clockOut throws and does not modify openEntry on error', async () => {
    const error = { response: { status: 422, data: { errors: { clock: ['No open entry'] } } } }
    mockPost.mockRejectedValueOnce(error)
    const te = useTimeEntries()
    te.openEntry.value = entry

    await expect(te.clockOut()).rejects.toEqual(error)
    expect(te.openEntry.value).toEqual(entry) // Should remain unchanged on error
  })

  it('fetchOne throws on error', async () => {
    const error = new Error('Not found')
    mockGet.mockRejectedValueOnce(error)
    const te = useTimeEntries()

    await expect(te.fetchOne(999)).rejects.toThrow('Not found')
  })
})
