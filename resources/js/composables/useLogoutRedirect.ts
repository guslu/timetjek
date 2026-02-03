import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'

/**
 * Shared helper for pages that need to log out
 * and always send the user back to the login page.
 */
export function useLogoutRedirect() {
  const router = useRouter()

  async function logoutAndRedirectToLogin() {
    await logout()
    router.replace({ name: 'login' })
  }

  return {
    logoutAndRedirectToLogin,
  }
}

import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'

/**
 * Small helper composable for pages that need to log out
 * and always return the user to the login page afterwards.
 */
export function useLogoutRedirect() {
  const router = useRouter()

  async function logoutAndRedirectToLogin() {
    await logout()
    router.replace({ name: 'login' })
  }

  return {
    logoutAndRedirectToLogin,
  }
}

