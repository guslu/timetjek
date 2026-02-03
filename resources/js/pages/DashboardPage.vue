<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-inner">
        <h1 class="app-title">Timetjek</h1>

        <nav class="nav">
          <router-link :to="{ name: 'entries' }" class="nav-link">
            Entries
          </router-link>

          <router-link :to="{ name: 'profile' }" class="nav-link">
            Profile
          </router-link>

          <button type="button" class="nav-link button-link" @click="handleLogout">
            Log out
          </button>
        </nav>
      </div>
    </header>

    <main class="dashboard-main">
      <p v-if="geoError" class="alert">
        {{ geoError }}
      </p>

      <div class="card">
        <h2 class="card-title">Current status</h2>

        <div v-if="isLoadingStatus" class="muted">
          Loading…
        </div>

        <template v-else>
          <div v-if="isClockedIn && openEntry" class="status">
            <p class="status-in">Clocked in</p>
            <p class="muted">
              Started {{ formatLocalDateTime(openEntry.started_at) }}
            </p>

            <button
              type="button"
              :disabled="isClockOutInProgress"
              class="btn btn-danger"
              @click="handleClockOut"
            >
              {{ isClockOutInProgress ? 'Clocking out…' : 'Clock out' }}
            </button>
          </div>

          <div v-else class="status">
            <p class="muted">Clocked out</p>

            <button
              type="button"
              :disabled="isClockInInProgress"
              class="btn btn-primary"
              @click="handleClockIn"
            >
              {{ isClockInInProgress ? 'Clocking in…' : 'Clock in' }}
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useGeolocation } from '@/composables/useGeolocation'
import { formatLocalDateTime } from '@/utils/date'
import { useLogoutRedirect } from '@/composables/useLogoutRedirect'

// External dependencies
const { openEntry, isClockedIn, fetchOpenEntry, clockIn, clockOut } = useTimeEntries()
const { getPosition, error: geoError } = useGeolocation()
const { logoutAndRedirectToLogin } = useLogoutRedirect()

// Local state
const isLoadingStatus = ref(true)
const isClockInInProgress = ref(false)
const isClockOutInProgress = ref(false)

// Actions
async function loadCurrentStatus() {
  isLoadingStatus.value = true

  try {
    await fetchOpenEntry()
  } finally {
    isLoadingStatus.value = false
  }
}

async function handleClockIn() {
  isClockInInProgress.value = true

  try {
    const coords = await getPosition()
    await clockIn(coords?.lat, coords?.lng)
    await loadCurrentStatus()
  } catch (error: unknown) {
    const axiosLike = error as { response?: { data?: { errors?: Record<string, string[]> } } }
    const fieldErrors = axiosLike.response?.data?.errors

    if (fieldErrors?.clock?.length) {
      alert(fieldErrors.clock[0])
    } else {
      alert('Clock-in failed.')
    }
  } finally {
    isClockInInProgress.value = false
  }
}

async function handleClockOut() {
  isClockOutInProgress.value = true

  try {
    const coords = await getPosition()
    await clockOut(coords?.lat, coords?.lng)
    await loadCurrentStatus()
  } catch (error: unknown) {
    const axiosLike = error as { response?: { data?: { errors?: Record<string, string[]> } } }
    const fieldErrors = axiosLike.response?.data?.errors

    if (fieldErrors?.clock?.length) {
      alert(fieldErrors.clock[0])
    } else {
      alert('Clock-out failed.')
    }
  } finally {
    isClockOutInProgress.value = false
  }
}

async function handleLogout() {
  await logoutAndRedirectToLogin()
}

// Initialization
onMounted(async () => {
  await loadCurrentStatus()
})
</script>

<style scoped>
/* Root */
.dashboard {
  min-height: 100vh;
  background: #f9fafb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Navigation */
.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  font-size: 0.875rem;
  color: #4f46e5;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-link:hover {
  text-decoration: underline;
}

.button-link {
  padding: 0;
}

/* Main */
.dashboard-main {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Card */
.card {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

/* Status */
.status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-in {
  color: #15803d;
  font-weight: 500;
}

/* Text helpers */
.muted {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Alert */
.alert {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

/* Buttons */
.btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4f46e5;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-danger {
  background: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
}
</style>