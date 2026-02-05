import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { initAuth, useAuth } from '@/composables/useAuth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/entries',
    name: 'entries',
    component: () => import('@/pages/EntriesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/entries/:id',
    name: 'entry-edit',
    component: () => import('@/pages/EntryEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let authInitialized = false

router.beforeEach(async (to) => {
  const auth = useAuth()

  if (!authInitialized) {
    try {
      await initAuth()
    } catch {
      // 401 = unauthenticated (expected)
    } finally {
      authInitialized = true
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return { name: 'login' }
  }

  if (to.meta.guest && auth.isAuthenticated.value) {
    return { name: 'dashboard' }
  }
})

export default router
