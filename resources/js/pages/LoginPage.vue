<template>
  <div class="page page--centered">
    <div class="card card--narrow card--shadow login-header">
      <h1 class="page-title-main">Timetjek</h1>
      <p class="page-subtitle">Sign in with your personal number</p>
    </div>
    <div class="card card--narrow card--shadow login-card">
      <form class="form form--stacked" @submit.prevent="handleSubmitLogin">
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
        <button type="submit" :disabled="isSubmittingLogin" class="btn btn-primary btn--full">
          {{ isSubmittingLogin ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/useAuth'
import type { FormErrorBag } from '@/utils/forms'
import { applyAxiosFormErrors, resetFormErrors } from '@/utils/forms'

const router = useRouter()

const isSubmittingLogin = ref(false)
const form = reactive({
  personal_number: '',
  password: '',
})
const errors = reactive<FormErrorBag>({})

async function handleSubmitLogin() {
  resetFormErrors(errors, ['personal_number', 'password'])
  isSubmittingLogin.value = true

  try {
    await login(form.personal_number, form.password)
    router.replace({ name: 'dashboard' })
  } catch (error: unknown) {
    applyAxiosFormErrors(errors, error, {
      defaultMessage: 'Login failed.',
    })
  } finally {
    isSubmittingLogin.value = false
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
