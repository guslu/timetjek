<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
        <h1 class="text-lg font-semibold text-gray-900">Timetjek</h1>
        <nav class="flex gap-4">
          <router-link :to="{ name: 'dashboard' }" class="text-sm text-indigo-600 hover:text-indigo-800">Dashboard</router-link>
          <router-link :to="{ name: 'profile' }" class="text-sm text-gray-600 hover:text-gray-800">Profile</router-link>
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="handleLogout">Log out</button>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-6 sm:px-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Time entries</h2>
      <div v-if="loading" class="text-gray-500">Loading…</div>
      <template v-else>
        <ul v-if="entries.length" class="divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
          <li v-for="entry in entries" :key="entry.id" class="px-4 py-3 hover:bg-gray-50">
            <router-link :to="{ name: 'entry-edit', params: { id: String(entry.id) } }" class="block">
              <p class="text-sm font-medium text-gray-900">{{ formatLocalDateTime(entry.started_at) }}</p>
              <p class="text-sm text-gray-600">
                {{ entry.ended_at ? formatLocalDateTime(entry.ended_at) : 'Open' }}
              </p>
            </router-link>
          </li>
        </ul>
        <p v-else class="text-gray-500">No entries yet.</p>
        <div v-if="listCache?.meta" class="mt-4 flex gap-2 items-center">
          <button
            v-if="listCache.meta.current_page > 1"
            type="button"
            class="text-sm text-indigo-600 hover:text-indigo-800"
            @click="goPage(listCache.meta.current_page - 1)"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page {{ listCache.meta.current_page }} of {{ listCache.meta.last_page }}
          </span>
          <button
            v-if="listCache.meta.current_page < listCache.meta.last_page"
            type="button"
            class="text-sm text-indigo-600 hover:text-indigo-800"
            @click="goPage(listCache.meta.current_page + 1)"
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
import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { formatLocalDateTime } from '@/utils/date'

const router = useRouter()
const { fetchList, listCache } = useTimeEntries()
const entries = ref(listCache.value?.data ?? [])
const loading = ref(true)

onMounted(async () => {
  const res = await fetchList(1)
  entries.value = res?.data ?? []
  loading.value = false
})

async function goPage(page: number) {
  loading.value = true
  const res = await fetchList(page)
  entries.value = res?.data ?? []
  loading.value = false
}

async function handleLogout() {
  await logout()
  router.replace({ name: 'login' })
}
</script>
