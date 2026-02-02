<template>
  <div class="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 class="text-2xl font-semibold text-center text-gray-900">Timetjek</h1>
      <p class="mt-1 text-center text-sm text-gray-600">Sign in with your personal number</p>
    </div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label for="personal_number" class="block text-sm font-medium text-gray-700">Personal number</label>
          <input
            id="personal_number"
            v-model="form.personal_number"
            type="text"
            inputmode="numeric"
            autocomplete="username"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            :class="{ 'border-red-500': errors.personal_number }"
          />
          <p v-if="errors.personal_number" class="mt-1 text-sm text-red-600">{{ errors.personal_number }}</p>
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>
        <p v-if="errors.general" class="text-sm text-red-600">{{ errors.general }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/useAuth'

const router = useRouter()
const loading = ref(false)
const form = reactive({ personal_number: '', password: '' })
const errors = reactive<Record<string, string>>({})

async function submit() {
  errors.personal_number = ''
  errors.password = ''
  errors.general = ''
  loading.value = true
  try {
    await login(form.personal_number, form.password)
    router.replace({ name: 'dashboard' })
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }
    const data = ax.response?.data
    if (data?.errors) {
      for (const [key, msgs] of Object.entries(data.errors)) {
        if (msgs?.length) (errors as Record<string, string>)[key] = msgs[0]
      }
    } else {
      errors.general = data?.message || 'Login failed.'
    }
  } finally {
    loading.value = false
  }
}
</script>
