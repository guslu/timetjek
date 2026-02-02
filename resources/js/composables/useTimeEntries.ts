//useTimeEntries.ts
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { TimeEntry, TimeEntryListResponse } from '@/types'

const openEntry = ref<TimeEntry | null>(null)
const listCache = ref<TimeEntryListResponse | null>(null)

export function useTimeEntries() {
  async function fetchOpenEntry() {
    try {
      const { data } = await api.get<{ data: TimeEntry | null }>('/time-entries/current')
      openEntry.value = data.data ?? null
    } catch {
      openEntry.value = null
    }
  }

  const isClockedIn = computed(() => openEntry.value !== null)

  async function clockIn(lat?: number, lng?: number) {
    const payload = lat != null && lng != null ? { lat, lng } : {}
    const { data } = await api.post<{ data: TimeEntry }>('/time-entries/clock-in', payload)
    openEntry.value = data.data
    return data.data
  }

  async function clockOut(lat?: number, lng?: number) {
    const payload = lat != null && lng != null ? { lat, lng } : {}
    const { data } = await api.post<{ data: TimeEntry }>('/time-entries/clock-out', payload)
    openEntry.value = null
    return data.data
  }

  async function fetchList(page = 1) {
    const { data } = await api.get<TimeEntryListResponse>('/time-entries', { params: { page } })
    listCache.value = data
    return data
  }

  async function fetchOne(id: number) {
    const { data } = await api.get<{ data: TimeEntry }>(`/time-entries/${id}`)
    return data.data
  }

  async function updateEntry(id: number, payload: Partial<TimeEntry>) {
    const { data } = await api.put<{ data: TimeEntry }>(`/time-entries/${id}`, payload)
    if (openEntry.value?.id === id) {
      openEntry.value = data.data.ended_at == null ? data.data : null
    }
    return data.data
  }

  return {
    openEntry,
    isClockedIn,
    fetchOpenEntry,
    clockIn,
    clockOut,
    fetchList,
    fetchOne,
    updateEntry,
    listCache,
  }
}
