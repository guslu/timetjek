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
        <ul v-if="entries.length" class="list list--divided">
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
        <div v-if="listCache?.meta" class="pagination">
          <button
            v-if="listCache.meta.current_page > 1"
            type="button"
            class="text-link"
            @click="goToPage(listCache.meta.current_page - 1)"
          >
            Previous
          </button>
          <span class="pagination-text">
            Page {{ listCache.meta.current_page }} of {{ listCache.meta.last_page }}
          </span>
          <button
            v-if="listCache.meta.current_page < listCache.meta.last_page"
            type="button"
            class="text-link"
            @click="goToPage(listCache.meta.current_page + 1)"
          >
            Next
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useLogoutRedirect } from '@/composables/useLogoutRedirect'
import { formatLocalDateTime } from '@/utils/date'

const { logoutAndRedirectToLogin } = useLogoutRedirect()
const { fetchList, listCache } = useTimeEntries()

const entries = ref(listCache.value?.data ?? [])
const isLoadingEntries = ref(true)

onMounted(async () => {
  const response = await fetchList(1)
  entries.value = response?.data ?? []
  isLoadingEntries.value = false
})

async function goToPage(page: number) {
  isLoadingEntries.value = true
  const response = await fetchList(page)
  entries.value = response?.data ?? []
  isLoadingEntries.value = false
}

async function handleLogout() {
  await logoutAndRedirectToLogin()
}
</script>

<style scoped>
.page-main {
  padding-top: 1.5rem;
}
</style>
