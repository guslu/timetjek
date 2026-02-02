<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
        <h1 class="text-lg font-semibold text-gray-900">Timetjek</h1>
        <nav class="flex gap-4">
          <router-link :to="{ name: 'dashboard' }" class="text-sm text-indigo-600 hover:text-indigo-800">Dashboard</router-link>
          <router-link :to="{ name: 'entries' }" class="text-sm text-indigo-600 hover:text-indigo-800">Entries</router-link>
          <router-link :to="{ name: 'profile' }" class="text-sm text-gray-600 hover:text-gray-800">Profile</router-link>
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="handleLogout">Log out</button>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-6 sm:px-6">
      <div class="mb-4">
        <router-link :to="{ name: 'entries' }" class="text-sm text-indigo-600 hover:text-indigo-800">← Back to entries</router-link>
      </div>
      <div v-if="loading" class="text-gray-500">Loading…</div>
      <form v-else class="space-y-4 bg-white shadow rounded-lg p-6" @submit.prevent="submit">
        <h2 class="text-lg font-medium text-gray-900">Edit time entry</h2>
        <div>
          <label for="started_at" class="block text-sm font-medium text-gray-700">Start</label>
          <input
            id="started_at"
            v-model="form.started_at"
            type="datetime-local"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p v-if="errors.started_at" class="mt-1 text-sm text-red-600">{{ errors.started_at }}</p>
        </div>
        <div>
          <label for="ended_at" class="block text-sm font-medium text-gray-700">End (leave empty for open entry)</label>
          <input
            id="ended_at"
            v-model="form.ended_at"
            type="datetime-local"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p v-if="errors.ended_at" class="mt-1 text-sm text-red-600">{{ errors.ended_at }}</p>
        </div>
        <p v-if="errors.general" class="text-sm text-red-600">{{ errors.general }}</p>
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <router-link :to="{ name: 'entries' }" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </router-link>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { toLocalInputValue, fromLocalInputValue } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const { fetchOne, updateEntry } = useTimeEntries()

const loading = ref(true)
const saving = ref(false)
const form = reactive({ started_at: '', ended_at: '' })
const errors = reactive<Record<string, string>>({})

onMounted(async () => {
  const entry = await fetchOne(id.value)
  form.started_at = toLocalInputValue(entry.started_at)
  form.ended_at = entry.ended_at ? toLocalInputValue(entry.ended_at) : ''
  loading.value = false
})

async function submit() {
  errors.started_at = ''
  errors.ended_at = ''
  errors.general = ''
  saving.value = true
  try {
    await updateEntry(id.value, {
      started_at: fromLocalInputValue(form.started_at),
      ended_at: form.ended_at ? fromLocalInputValue(form.ended_at) : null,
    })
    router.push({ name: 'entries' })
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { errors?: Record<string, string[]> } } }
    const data = ax.response?.data?.errors
    if (data) {
      for (const [key, msgs] of Object.entries(data)) {
        if (msgs?.length) (errors as Record<string, string>)[key] = msgs[0]
      }
    } else {
      errors.general = 'Update failed.'
    }
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  await logout()
  router.replace({ name: 'login' })
}
</script>
