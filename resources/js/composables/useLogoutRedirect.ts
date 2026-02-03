import { useRouter } from 'vue-router'
import { logout } from '@/composables/useAuth'

/**
 * Helper composable for pages that need to log out
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

