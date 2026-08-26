import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { finishRouteLoading, startRouteLoading } from '@/composables/useRouteLoading'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/plan', name: 'PlanList', component: () => import('@/views/PlanListView.vue'), meta: { requiresAuth: true } },
  { path: '/plan/:id', name: 'PlanEditor', component: () => import('@/views/PlanEditorView.vue'), meta: { requiresAuth: true } },
  { path: '/workspace/pages/:id', name: 'WorkspacePage', component: () => import('@/views/WorkspacePageView.vue'), meta: { requiresAuth: true } },
  { path: '/auth', name: 'Auth', component: () => import('@/views/AuthView.vue'), meta: { requiresGuest: true } },
  { path: '/auth/social/callback', name: 'AuthSocialCallback', component: () => import('@/views/AuthSocialCallbackView.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/focus', name: 'Focus', component: () => import('@/views/FocusView.vue'), meta: { requiresAuth: true } },
  { path: '/captures', name: 'Captures', component: () => import('@/views/CapturesView.vue'), meta: { requiresAuth: true } },
  { path: '/review', name: 'Review', component: () => import('@/views/ReviewView.vue'), meta: { requiresAuth: true } },
  { path: '/insights', name: 'Insights', component: () => import('@/views/InsightsView.vue'), meta: { requiresAuth: true } },
  { path: '/tracks', name: 'Tracks', component: () => import('@/views/TracksView.vue'), meta: { requiresAuth: true } },
  { path: '/tracks/:id', name: 'TrackDetail', component: () => import('@/views/TrackDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/creator', name: 'CreatorWorkspace', component: () => import('@/views/CreatorWorkspaceView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/create', name: 'HabitCreate', component: () => import('@/views/HabitFormView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/:id', name: 'HabitDetail', component: () => import('@/views/HabitDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/habit/:id/edit', name: 'HabitEdit', component: () => import('@/views/HabitFormView.vue'), meta: { requiresAuth: true } },
  { path: '/learning', name: 'LearningContent', component: () => import('@/views/LearningContentView.vue'), meta: { requiresAuth: true } },
  { path: '/learning/course/:id', alias: '/learning/video/:id', name: 'LearningCourse', component: () => import('@/views/VideoDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/profile/appearance', name: 'AppearanceSettings', component: () => import('@/views/AppearanceSettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/profile/ai-providers', name: 'AiProviderSettings', component: () => import('@/views/AiProviderSettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/profile/ai-skills', name: 'AiSkillSettings', component: () => import('@/views/AiSkillSettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/profile/pet-settings', name: 'PetSettings', component: () => import('@/views/PetSettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'AdminUsers', component: () => import('@/views/AdminUsersView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/guide', name: 'UsageGuide', component: () => import('@/views/UsageGuideView.vue'), meta: { requiresAuth: true } },
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

router.beforeEach(async (to, from) => {
  if (to.fullPath !== from.fullPath) {
    startRouteLoading(to.meta.loadingText || '正在切换工作台')
  }

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

  const needsProfileCompletion = authStore.isAuthenticated
    && authStore.user
    && !authStore.user.profileComplete
    && !(authStore.user.profileCompletedAt && authStore.user.privacyPolicyAcceptedAt && authStore.user.username)

  if (needsProfileCompletion && to.path !== '/auth/social/callback') {
    return { path: '/auth/social/callback', query: { redirect: to.fullPath } }
  }

  if (to.path === '/auth/social/callback' && authStore.isAuthenticated && !needsProfileCompletion && !window.location.hash) {
    return { path: '/dashboard' }
  }

  if (to.meta.requiresAdmin && !(authStore.user?.isAdmin || authStore.user?.security?.isAdmin)) {
    return { path: '/dashboard' }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  return true
})

router.afterEach(() => {
  finishRouteLoading()
})

router.onError(() => {
  finishRouteLoading()
})

export default router

