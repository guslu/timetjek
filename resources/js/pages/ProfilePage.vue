<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
        <h1 class="text-lg font-semibold text-gray-900">Timetjek</h1>
        <nav class="flex gap-4">
          <router-link :to="{ name: 'dashboard' }" class="text-sm text-indigo-600 hover:text-indigo-800">Dashboard</router-link>
          <router-link :to="{ name: 'entries' }" class="text-sm text-gray-600 hover:text-gray-800">Entries</router-link>
          <button type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="handleLogout">Log out</button>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-6 sm:px-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Change password</h2>
      <form class="space-y-4 bg-white shadow rounded-lg p-6 max-w-md" @submit.prevent="submit">
        <div>
          <label for="current_password" class="block text-sm font-medium text-gray-700">Current password</label>
          <input
            id="current_password"
            v-model="form.current_password"
            type="password"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p v-if="errors.current_password" class="mt-1 text-sm text-red-600">{{ errors.current_password }}</p>
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">New password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>
        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm new password</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <p v-if="errors.general" class="text-sm text-red-600">{{ errors.general }}</p>
        <p v-if="success" class="text-sm text-green-600">Password updated.</p>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? 'Updating…' : 'Update password' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'
import { api } from '@/api/client'

const router = useRouter()
const loading = ref(false)
const success = ref(false)
const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const errors = reactive<Record<string, string>>({})

async function submit() {
  errors.current_password = ''
  errors.password = ''
  errors.general = ''
  success.value = false
  loading.value = true
  try {
    await api.put('/user/password', {
      current_password: form.current_password,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    success.value = true
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
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
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
  router.replace({ name: 'login' })
}
</script>
