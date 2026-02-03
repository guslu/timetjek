<template>
  <div class="page page--centered">
    <div class="card card--narrow card--shadow login-header">
      <h1 class="page-title-main">Timetjek</h1>
      <p class="page-subtitle">Sign in with your personal number</p>
    </div>
    <div class="card card--narrow card--shadow login-card">
      <form class="form form--stacked" @submit.prevent="submit">
        <div class="form-field">
          <label for="personal_number" class="form-label">Personal number</label>
          <input
            id="personal_number"
            v-model="form.personal_number"
            type="text"
            inputmode="numeric"
            autocomplete="username"
            required
            class="form-input"
            :class="{ 'form-input--error': errors.personal_number }"
          />
          <p v-if="errors.personal_number" class="form-error">{{ errors.personal_number }}</p>
        </div>
        <div class="form-field">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="form-input"
            :class="{ 'form-input--error': errors.password }"
          />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>
        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary btn--full"
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

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-card {
  margin-top: 0;
}
</style>
