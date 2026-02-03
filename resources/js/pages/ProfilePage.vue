<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <h1 class="page-header-title">Timetjek</h1>
        <nav class="nav">
          <router-link :to="{ name: 'dashboard' }" class="nav-link">Dashboard</router-link>
          <router-link :to="{ name: 'entries' }" class="nav-link nav-link--muted">Entries</router-link>
          <button type="button" class="nav-link nav-link--muted nav-link--button" @click="handleLogout">
            Log out
          </button>
        </nav>
      </div>
    </header>
    <main class="page-main">
      <h2 class="page-section-title">Change password</h2>
      <form class="card card--shadow profile-form" @submit.prevent="submit">
        <div class="form-field">
          <label for="current_password" class="form-label">Current password</label>
          <input
            id="current_password"
            v-model="form.current_password"
            type="password"
            required
            class="form-input"
          />
          <p v-if="errors.current_password" class="form-error">{{ errors.current_password }}</p>
        </div>
        <div class="form-field">
          <label for="password" class="form-label">New password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="form-input"
          />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>
        <div class="form-field">
          <label for="password_confirmation" class="form-label">Confirm new password</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            required
            class="form-input"
          />
        </div>
        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>
        <p v-if="success" class="text-success">Password updated.</p>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
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

<style scoped>
.profile-form {
  max-width: 28rem;
}
</style>
