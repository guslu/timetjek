<template>
  <AppLayout>
    <div class="page-content dashboard">
      <p v-if="geoError" class="alert">{{ geoError }}</p>

      <div class="card reveal" v-reveal>
        <div v-if="isLoadingStatus" class="muted">Loading…</div>

        <template v-else>
          <!-- Active session: circular timer, progress ring, End session button -->
          <section v-if="isClockedIn && openEntry" class="active-session" aria-live="polite" aria-atomic="true">
            <div class="active-session__badge">
              <span class="active-session__badge-dot" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="active-session__badge-text">ACTIVE SESSION</span>
            </div>

            <div class="timer-ring-wrap">
              <svg class="timer-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  class="timer-ring__track"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke-width="8"
                />
                <circle
                  class="timer-ring__progress"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke-width="8"
                  stroke-dasharray="70 213"
                />
              </svg>
              <div class="timer-ring__inner">
                <span class="timer-ring__time">{{ elapsedDisplay }}</span>
                <span class="timer-ring__label">elapsed</span>
              </div>
            </div>

            <p class="active-session__started">
              Started {{ formatStartedAt(openEntry.started_at) }}
            </p>

            <button
              type="button"
              class="btn btn-end-session"
              :disabled="isClockOutInProgress"
              @click="handleClockOut"
            >
              {{ isClockOutInProgress ? 'Ending…' : 'End session' }}
              <span class="btn-end-session__arrow" aria-hidden="true">→</span>
            </button>
          </section>

          <!-- Idle: Clock in -->
          <section v-else class="status status--idle">
            <p class="muted">Not clocked in</p>
            <button
              type="button"
              :disabled="isClockInInProgress"
              class="btn btn-primary btn--large"
              @click="handleClockIn"
            >
              {{ isClockInInProgress ? 'Clocking in…' : 'Clock in' }}
            </button>
          </section>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useGeolocation } from '@/composables/useGeolocation'
import {
  elapsedSecondsSince,
  formatElapsedSeconds,
  formatStartedAt,
} from '@/utils/date'
import { getFirstValidationMessage } from '@/utils/forms'

const { openEntry, isClockedIn, fetchOpenEntry, clockIn, clockOut } = useTimeEntries()
const { getPosition, error: geoError } = useGeolocation()

const isLoadingStatus = ref(true)
const isClockInInProgress = ref(false)
const isClockOutInProgress = ref(false)
const tick = ref(0)

const elapsedDisplay = computed(() => {
  if (!openEntry.value?.started_at) return '00:00'
  tick.value
  return formatElapsedSeconds(elapsedSecondsSince(openEntry.value.started_at))
})

let timerId: ReturnType<typeof setInterval> | null = null

function startTimer() {
  if (timerId) return
  timerId = setInterval(() => {
    tick.value = Date.now()
  }, 1000)
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

watch(
  () => isClockedIn.value && !!openEntry.value,
  (running) => {
    if (running) startTimer()
    else stopTimer()
  },
  { immediate: true }
)

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
  } catch (err: unknown) {
    alert(getFirstValidationMessage(err, 'clock', 'Clock-in failed.'))
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
  } catch (err: unknown) {
    alert(getFirstValidationMessage(err, 'clock', 'Clock-out failed.'))
  } finally {
    isClockOutInProgress.value = false
  }
}

onMounted(() => loadCurrentStatus())
onUnmounted(() => stopTimer())
</script>

<style scoped>
.dashboard {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse 80% 70% at 50% 40%, rgba(224, 245, 243, 0.6) 0%, rgba(232, 245, 253, 0.4) 40%, transparent 70%);
}

.dashboard .card {
  max-width: 28rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: var(--space-8);
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03);
}

/* Active session block */
.active-session {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.active-session__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--space-6);
  align-self: flex-start;
}

.active-session__badge-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #71d3c6;
  color: #fff;
}

.active-session__badge-text {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #78909c;
  text-transform: uppercase;
}

/* Circular progress ring */
.timer-ring-wrap {
  position: relative;
  width: 11rem;
  height: 11rem;
  margin-bottom: var(--space-6);
}

.timer-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-ring__track {
  stroke: #e0f5f3;
}

.timer-ring__progress {
  stroke: #4ac9b2;
  stroke-linecap: round;
  transform-origin: center;
  animation: timer-spin 3.75s linear infinite;
}

@keyframes timer-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .timer-ring__progress {
    animation: none;
  }
}

.timer-ring__inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.timer-ring__time {
  font-variant-numeric: tabular-nums;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #325055;
}

.timer-ring__label {
  font-size: 0.875rem;
  color: #a7a7a7;
}

.active-session__started {
  font-size: 0.875rem;
  color: #a7a7a7;
  margin: 0 0 var(--space-6);
}

.btn-end-session {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #dc4646;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(220, 70, 70, 0.35);
  transition: background-color 0.15s, transform 0.05s;
}

.btn-end-session:hover:not(:disabled) {
  background-color: #c73d3d;
}

.btn-end-session:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-end-session:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-end-session__arrow {
  font-size: 1.125rem;
  line-height: 1;
}

/* Idle state */
.status {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.status .btn {
  margin-top: 1rem;
}

.status--idle .btn--large {
  margin-top: 0.5rem;
}
</style>
