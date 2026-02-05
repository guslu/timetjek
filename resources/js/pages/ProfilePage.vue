<template>
  <AppLayout>
    <div class="page-content auth-page">
      <form class="auth-card form-stack" @submit.prevent="handleChangePassword">
        <span class="auth-card__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <h2 class="auth-card__title">Change Password</h2>

        <div>
          <label for="current_password">Current password</label>
          <div class="auth-input-wrap">
            <input
              id="current_password"
              v-model="form.current_password"
              :type="showCurrent ? 'text' : 'password'"
              required
              :class="{ invalid: errors.current_password }"
            />
            <button type="button" class="toggle-visibility" :aria-label="showCurrent ? 'Hide password' : 'Show password'" @click="showCurrent = !showCurrent">
              <svg v-if="showCurrent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <p v-if="errors.current_password" class="error">{{ errors.current_password }}</p>
        </div>

        <div>
          <label for="new_password">New password</label>
          <div class="auth-input-wrap">
            <input id="new_password" v-model="form.password" :type="showNew ? 'text' : 'password'" required :class="{ invalid: errors.password }" />
            <button type="button" class="toggle-visibility" :aria-label="showNew ? 'Hide password' : 'Show password'" @click="showNew = !showNew">
              <svg v-if="showNew" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <p v-if="errors.password" class="error">{{ errors.password }}</p>
        </div>

        <div>
          <label for="password_confirmation">Confirm new password</label>
          <div class="auth-input-wrap">
            <input id="password_confirmation" v-model="form.password_confirmation" :type="showConfirm ? 'text' : 'password'" required />
            <button type="button" class="toggle-visibility" :aria-label="showConfirm ? 'Hide password' : 'Show password'" @click="showConfirm = !showConfirm">
              <svg v-if="showConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <p v-if="errors.general" class="error">{{ errors.general }}</p>
        <p v-if="hasPasswordJustChanged" class="success">Password updated.</p>
        <button type="submit" :disabled="isSubmitting" class="btn btn-primary">{{ isSubmitting ? 'Updating…' : 'Update password' }}</button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { api } from '@/api/client'
import { submitWithFormErrors } from '@/utils/forms'
import type { FormErrorBag } from '@/utils/forms'

const hasPasswordJustChanged = ref(false)
const isSubmitting = ref(false)
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const errors = reactive<FormErrorBag>({})

function handleChangePassword() {
  hasPasswordJustChanged.value = false
  submitWithFormErrors(
    errors,
    { fieldKeys: ['current_password', 'password'], defaultMessage: 'Update failed.' },
    isSubmitting,
    async () => {
      await api.put('/api/user/password', {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      hasPasswordJustChanged.value = true
      form.current_password = ''
      form.password = ''
      form.password_confirmation = ''
    }
  )
}
</script>

