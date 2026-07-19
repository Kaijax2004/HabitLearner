import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/plan', name: 'PlanList', component: () => import('@/views/PlanListView.vue'), meta: { requiresAuth: true } },
  { path: '/plan/:id', name: 'PlanEditor', component: () => import('@/views/PlanEditorView.vue'), meta: { requiresAuth: true } },
  { path: '/auth', name: 'Auth', component: () => import('@/views/AuthView.vue'), meta: { requiresGuest: true } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/create', name: 'HabitCreate', component: () => import('@/views/HabitFormView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/:id', name: 'HabitDetail', component: () => import('@/views/HabitDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/:id/edit', name: 'HabitEdit', component: () => import('@/views/HabitFormView.vue'), meta: { requiresAuth: true } },
  { path: '/learning', name: 'LearningContent', component: () => import('@/views/LearningContentView.vue'), meta: { requiresAuth: true } },
  { path: '/learning/course/:id', alias: '/learning/video/:id', name: 'LearningCourse', component: () => import('@/views/VideoDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/reminder-test', name: 'ReminderTest', component: () => import('@/views/ReminderTestView.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.bootstrapComplete) {
    await authStore.bootstrapAuth()
  }

  if (to.path === '/') {
    return authStore.isAuthenticated ? { path: '/dashboard' } : { path: '/auth' }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/auth', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
