// useAuth.ts
import { ref, computed } from 'vue'
import { api, ensureCsrf } from '@/api/client'
import type { User } from '@/types'

const user = ref<User | null>(null)
const loading = ref(false)
const initialized = ref(false)

async function fetchUser() {
  loading.value = true
  try {
    const { data } = await api.get<User>('/api/user')
    user.value = data
  } catch (e: any) {
    // 401 = not logged in (expected)
    user.value = null
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useAuth() {
  const isAuthenticated = computed(
    () => user.value !== null && typeof user.value === 'object' && 'id' in user.value
  )

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    fetchUser,
  }
}

export async function initAuth() {
  if (!initialized.value) {
    await fetchUser()
  }
}

export async function login(personalNumber: string, password: string) {
  await ensureCsrf()
  await api.post('/login', {
    personal_number: personalNumber,
    password,
  })

  // Fetch fresh user from backend
  await fetchUser()
}

export async function logout() {
  await api.post('/logout')
  user.value = null
  initialized.value = true
}

/**
 * Clear auth state without calling the logout API (e.g. when the server returns 401).
 * Next route guard will treat the user as unauthenticated and redirect to login.
 */
export function clearAuthState(): void {
  user.value = null
  initialized.value = true
}

/** Reset module state for test isolation. Not used in production. */
export function resetAuthState(): void {
  user.value = null
  loading.value = false
  initialized.value = false
}
