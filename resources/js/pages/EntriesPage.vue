<template>
  <AppLayout>
    <div class="page-content entries-page" v-reveal>
      <p v-if="loadError" class="alert">{{ loadError }}</p>
      <div v-if="isLoading" class="muted">Loading…</div>

      <template v-else>
        <div v-if="entries.length > 0" class="entries-card">
          <header class="entries-card__header">
            <div class="entries-card__title-row">
              <span class="entries-card__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </span>
              <h2 class="entries-card__title">Time Entries</h2>
            </div>
            <p class="entries-card__date">{{ formatTodayLabel() }}</p>
            <div class="entries-card__total">
              <span>Total: {{ totalTimeLabel }}</span>
              <span class="entries-card__chevron" aria-hidden="true">›</span>
            </div>
          </header>

          <ul class="entries-list">
            <li
              v-for="(entry, index) in entries"
              :key="entry.id"
              class="entries-list__item"
              :class="{ 'entries-list__item--running': !entry.ended_at }"
            >
              <div class="entries-list__timeline">
                <span class="entries-list__dot" :class="{ 'entries-list__dot--active': !entry.ended_at }"></span>
                <span v-if="index < entries.length - 1" class="entries-list__line"></span>
              </div>
              <router-link :to="{ name: 'entry-edit', params: { id: String(entry.id) } }" class="entries-list__link">
                <div class="entries-list__time">
                  {{ formatTimeOnly(entry.started_at) }} – {{ entry.ended_at ? formatTimeOnly(entry.ended_at) : '…' }}
                </div>
                <div class="entries-list__duration">{{ entryDurationLabel(entry) }}</div>
              </router-link>
              <span
                class="entries-list__badge"
                :class="entry.ended_at ? 'entries-list__badge--completed' : 'entries-list__badge--running'"
              >
                <span class="entries-list__badge-dot"></span>
                {{ entry.ended_at ? 'Completed' : 'Running' }}
              </span>
            </li>
          </ul>
        </div>

        <p v-else class="muted entries-empty">No entries yet.</p>

        <nav v-if="pagination && entries.length > 0" class="pagination">
          <button
            v-if="pagination.current_page > 1"
            type="button"
            class="link"
            @click="goToPage(pagination.current_page - 1)"
          >
            Previous
          </button>
          <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
          <button
            v-if="pagination.current_page < pagination.last_page"
            type="button"
            class="link"
            @click="goToPage(pagination.current_page + 1)"
          >
            Next
          </button>
        </nav>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useTimeEntries } from '@/composables/useTimeEntries'
import {
  entryDurationMinutes,
  formatDurationShort,
  formatTimeOnly,
  formatTodayLabel,
} from '@/utils/date'

interface Entry {
  id: number
  started_at: string
  ended_at: string | null
}

const { fetchList, listCache } = useTimeEntries()

const entries = ref<Entry[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const pagination = computed(() => listCache.value?.meta ?? null)

const totalTimeLabel = computed(() => {
  let total = 0
  for (const e of entries.value) {
    total += entryDurationMinutes(e.started_at, e.ended_at)
  }
  return formatDurationShort(total)
})

function entryDurationLabel(entry: Entry): string {
  const min = entryDurationMinutes(entry.started_at, entry.ended_at)
  return formatDurationShort(min)
}

async function goToPage(page: number) {
  isLoading.value = true
  loadError.value = null
  try {
    const res = await fetchList(page)
    entries.value = res?.data ?? []
  } catch {
    entries.value = []
    loadError.value = 'Unable to load entries. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => goToPage(1))
</script>

<style scoped>
.entries-page {
  background: radial-gradient(ellipse 100% 80% at 50% 0%, rgba(224, 245, 243, 0.25) 0%, transparent 60%);
  min-height: 60vh;
}

.entries-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 252, 250, 0.9) 100%);
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.entries-card__header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.25rem 1.5rem;
  padding: 1.5rem 1.75rem 1rem;
  align-items: baseline;
}

.entries-card__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.entries-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(13, 148, 136, 0.12);
  color: #0d9488;
}

.entries-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.entries-card__date {
  grid-column: 1;
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.entries-card__total {
  grid-row: 1 / -1;
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.entries-card__chevron {
  color: #94a3b8;
  font-size: 1.25rem;
}

.entries-card__header::after {
  content: '';
  grid-column: 1 / -1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent);
  margin-top: 0.75rem;
}

.entries-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0 1rem;
}

.entries-list__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.75rem;
  min-height: 3.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.entries-list__item:last-child {
  border-bottom: none;
}

.entries-list__item--running {
  background: linear-gradient(90deg, rgba(13, 148, 136, 0.04) 0%, transparent 40%);
}

.entries-list__timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1rem;
  flex-shrink: 0;
}

.entries-list__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.entries-list__dot--active {
  background: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
}

.entries-list__line {
  width: 2px;
  flex: 1;
  min-height: 1.5rem;
  background: #e2e8f0;
  margin-top: 0.25rem;
}

.entries-list__link {
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.entries-list__time {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1e293b;
}

.entries-list__duration {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.entries-list__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.entries-list__badge-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: currentColor;
}

.entries-list__badge--running {
  background: rgba(13, 148, 136, 0.15);
  color: #0f766e;
}

.entries-list__badge--completed {
  background: rgba(255, 255, 255, 0.7);
  color: #0d9488;
  border: 1px solid rgba(13, 148, 136, 0.25);
}

.entries-empty {
  padding: 2rem;
  text-align: center;
}

.pagination {
  margin-top: 1.5rem;
}
</style>
