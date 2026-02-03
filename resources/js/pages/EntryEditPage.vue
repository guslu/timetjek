<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <h1 class="page-header-title">Timetjek</h1>
        <nav class="nav">
          <router-link :to="{ name: 'dashboard' }" class="nav-link">Dashboard</router-link>
          <router-link :to="{ name: 'entries' }" class="nav-link">Entries</router-link>
          <router-link :to="{ name: 'profile' }" class="nav-link nav-link--muted">Profile</router-link>
          <button type="button" class="nav-link nav-link--muted nav-link--button" @click="handleLogout">
            Log out
          </button>
        </nav>
      </div>
    </header>
    <main class="page-main">
      <div>
        <router-link :to="{ name: 'entries' }" class="page-back-link">← Back to entries</router-link>
      </div>
      <div v-if="isLoadingEntry" class="loading-text">Loading…</div>
      <form v-else class="card card--shadow edit-form" @submit.prevent="handleSubmitEntryEdit">
        <h2 class="page-section-title">Edit time entry</h2>
        <div class="form-field">
          <label for="started_at" class="form-label">Start</label>
          <input
            id="started_at"
            v-model="form.started_at"
            type="datetime-local"
            required
            class="form-input"
          />
          <p v-if="errors.started_at" class="form-error">{{ errors.started_at }}</p>
        </div>
        <div class="form-field">
          <label for="ended_at" class="form-label">End (leave empty for open entry)</label>
          <input
            id="ended_at"
            v-model="form.ended_at"
            type="datetime-local"
            class="form-input"
          />
          <p v-if="errors.ended_at" class="form-error">{{ errors.ended_at }}</p>
        </div>
        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>
        <div class="edit-actions">
          <button
            type="submit"
            :disabled="isSavingEntry"
            class="btn btn-primary"
          >
            {{ isSavingEntry ? 'Saving…' : 'Save' }}
          </button>
          <router-link :to="{ name: 'entries' }" class="btn btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useLogoutRedirect } from '@/composables/useLogoutRedirect'
import type { FormErrorBag } from '@/utils/forms'
import { applyAxiosFormErrors, resetFormErrors } from '@/utils/forms'
import { fromLocalInputValue, toLocalInputValue } from '@/utils/date'

// External dependencies
const route = useRoute()
const router = useRouter()
const { logoutAndRedirectToLogin } = useLogoutRedirect()
const { fetchOne, updateEntry } = useTimeEntries()

// Derived data
const entryId = computed(() => Number(route.params.id))

// Local state
const isLoadingEntry = ref(true)
const isSavingEntry = ref(false)
const form = reactive({
  started_at: '',
  ended_at: '',
})
const errors = reactive<FormErrorBag>({})

// Actions
async function loadEntryForEditing() {
  isLoadingEntry.value = true

  try {
    const entry = await fetchOne(entryId.value)
    form.started_at = toLocalInputValue(entry.started_at)
    form.ended_at = entry.ended_at ? toLocalInputValue(entry.ended_at) : ''
  } finally {
    isLoadingEntry.value = false
  }
}

async function handleSubmitEntryEdit() {
  resetFormErrors(errors, ['started_at', 'ended_at'])
  isSavingEntry.value = true

  try {
    await updateEntry(entryId.value, {
      started_at: fromLocalInputValue(form.started_at),
      ended_at: form.ended_at ? fromLocalInputValue(form.ended_at) : null,
    })

    router.push({ name: 'entries' })
  } catch (error: unknown) {
    applyAxiosFormErrors(errors, error, {
      defaultMessage: 'Update failed.',
    })
  } finally {
    isSavingEntry.value = false
  }
}

async function handleLogout() {
  await logoutAndRedirectToLogin()
}

// Initialization
onMounted(async () => {
  await loadEntryForEditing()
})
</script>

<style scoped>
.edit-form {
  max-width: 32rem;
}

.edit-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}
</style>
