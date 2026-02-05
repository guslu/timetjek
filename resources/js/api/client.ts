import axios from 'axios'

const apiOrigin = import.meta.env.VITE_API_URL || ''

// Base axios instance WITHOUT forcing /api
export const api = axios.create({
  baseURL: apiOrigin ? apiOrigin.replace(/\/$/, '') : '',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

let onUnauthorized: (() => void) | null = null

/**
 * Register a handler to run when any API request returns 401 (e.g. session expired).
 * Called from app.ts after the router is available so we can redirect to login.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

// CSRF helper (Sanctum requirement)
export async function ensureCsrf(): Promise<void> {
  const base = apiOrigin ? apiOrigin.replace(/\/$/, '') : ''
  await axios.get(`${base}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}
