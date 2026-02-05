<template>
  <div class="page page--centered login">
    <div class="auth-page">
      <header class="auth-card auth-card--header" v-reveal>
        <span class="auth-card__icon auth-card__icon--sm" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </span>
        <h1 class="auth-card__title auth-card__title--lg">Timetjek</h1>
        <p class="login-subtitle">Sign in with your personal number</p>
      </header>

      <form class="auth-card form-stack" v-reveal @submit.prevent="handleSubmit">
        <div>
          <label for="personal_number">Personal number</label>
          <input
            id="personal_number"
            v-model="form.personal_number"
            type="text"
            inputmode="numeric"
            autocomplete="username"
            required
            :class="{ invalid: errors.personal_number }"
          />
          <p v-if="errors.personal_number" class="error">{{ errors.personal_number }}</p>
        </div>

        <div>
          <label for="password">Password</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :class="{ invalid: errors.password }"
            />
            <button
              type="button"
              class="toggle-visibility"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="error">{{ errors.password }}</p>
        </div>

        <p v-if="errors.general" class="error">{{ errors.general }}</p>

        <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/useAuth'
import { submitWithFormErrors } from '@/utils/forms'
import type { FormErrorBag } from '@/utils/forms'

const router = useRouter()
const form = reactive({ personal_number: '', password: '' })
const errors = reactive<FormErrorBag>({})
const isSubmitting = ref(false)
const showPassword = ref(false)

function handleSubmit() {
  submitWithFormErrors(
    errors,
    { fieldKeys: ['personal_number', 'password'], defaultMessage: 'Login failed.' },
    isSubmitting,
    async () => {
      await login(form.personal_number, form.password)
      router.replace({ name: 'dashboard' })
    }
  )
}
</script>

<style scoped>
.login .auth-page {
  gap: 1.5rem;
}

.auth-card--header {
  text-align: center;
  padding: 1.75rem 1.5rem;
}

.auth-card__icon--sm {
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: 0.75rem;
}

.auth-card__title--lg {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.login-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}
</style>
