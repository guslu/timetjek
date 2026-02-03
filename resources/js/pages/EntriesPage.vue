<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <h1 class="page-header-title">Timetjek</h1>
        <nav class="nav">
          <router-link :to="{ name: 'dashboard' }" class="nav-link">Dashboard</router-link>
          <router-link :to="{ name: 'profile' }" class="nav-link nav-link--muted">Profile</router-link>
          <button type="button" class="nav-link nav-link--muted nav-link--button" @click="handleLogout">
            Log out
          </button>
        </nav>
      </div>
    </header>
    <main class="page-main">
      <h2 class="page-section-title">Time entries</h2>
      <div v-if="isLoadingEntries" class="loading-text">Loading…</div>
      <template v-else>
        <ul v-if="hasEntries" class="list list--divided">
          <li v-for="entry in entries" :key="entry.id" class="list-item">
            <router-link :to="{ name: 'entry-edit', params: { id: String(entry.id) } }" class="list-item-link">
              <p class="list-item-title">{{ formatLocalDateTime(entry.started_at) }}</p>
              <p class="list-item-subtitle">
                {{ entry.ended_at ? formatLocalDateTime(entry.ended_at) : 'Open' }}
              </p>
            </router-link>
          </li>
        </ul>
        <p v-else class="text-muted">No entries yet.</p>
        <div v-if="hasPagination" class="pagination">
          <button
            v-if="canGoToPreviousPage"
            type="button"
            class="text-link"
            @click="goToPreviousPage"
          >
            Previous
          </button>
          <span class="pagination-text">
            Page {{ currentPage }} of {{ lastPage }}
          </span>
          <button
            v-if="canGoToNextPage"
            type="button"
            class="text-link"
            @click="goToNextPage"
          >
            Next
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useLogoutRedirect } from '@/composables/useLogoutRedirect'
import { formatLocalDateTime } from '@/utils/date'

// External dependencies
const { logoutAndRedirectToLogin } = useLogoutRedirect()
const { fetchList, listCache } = useTimeEntries()

// Local state
const entries = ref(listCache.value?.data ?? [])
const isLoadingEntries = ref(true)

// Derived data
const hasEntries = computed(() => entries.value.length > 0)

const pagination = computed(() => listCache.value?.meta ?? null)
const hasPagination = computed(() => pagination.value !== null)
const currentPage = computed(() => pagination.value?.current_page ?? 1)
const lastPage = computed(() => pagination.value?.last_page ?? 1)

const canGoToPreviousPage = computed(() => currentPage.value > 1)
const canGoToNextPage = computed(() => currentPage.value < lastPage.value)

// Actions
async function loadPage(page: number) {
  isLoadingEntries.value = true

  try {
    const response = await fetchList(page)
    entries.value = response?.data ?? []
  } finally {
    isLoadingEntries.value = false
  }
}

function goToPreviousPage() {
  if (!canGoToPreviousPage.value) return
  loadPage(currentPage.value - 1)
}

function goToNextPage() {
  if (!canGoToNextPage.value) return
  loadPage(currentPage.value + 1)
}

async function handleLogout() {
  await logoutAndRedirectToLogin()
}

// Initialization
onMounted(async () => {
  await loadPage(1)
})
</script>

<style scoped>
.page-main {
  padding-top: 1.5rem;
}
</style>
