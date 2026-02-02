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

// CSRF helper (Sanctum requirement)
export async function ensureCsrf(): Promise<void> {
  const base = apiOrigin ? apiOrigin.replace(/\/$/, '') : ''
  await axios.get(`${base}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}
