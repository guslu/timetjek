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
      <form class="card card--shadow profile-form" @submit.prevent="handleChangePassword">
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
        <p v-if="hasPasswordJustChanged" class="text-success">Password updated.</p>
        <button
          type="submit"
          :disabled="isSubmittingPasswordChange"
          class="btn btn-primary"
        >
          {{ isSubmittingPasswordChange ? 'Updating…' : 'Update password' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/api/client'
import type { FormErrorBag } from '@/utils/forms'
import { applyAxiosFormErrors, resetFormErrors } from '@/utils/forms'
import { useLogoutRedirect } from '@/composables/useLogoutRedirect'

const { logoutAndRedirectToLogin } = useLogoutRedirect()

const isSubmittingPasswordChange = ref(false)
const hasPasswordJustChanged = ref(false)
const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const errors = reactive<FormErrorBag>({})

async function handleChangePassword() {
  resetFormErrors(errors, ['current_password', 'password'])
  hasPasswordJustChanged.value = false
  isSubmittingPasswordChange.value = true

  try {
    await api.put('/user/password', {
      current_password: form.current_password,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    hasPasswordJustChanged.value = true
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
  } catch (error: unknown) {
    applyAxiosFormErrors(errors, error, {
      defaultMessage: 'Update failed.',
    })
  } finally {
    isSubmittingPasswordChange.value = false
  }
}

async function handleLogout() {
  await logoutAndRedirectToLogin()
}
</script>

<style scoped>
.profile-form {
  max-width: 28rem;
}
</style>
