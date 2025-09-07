import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habit/create',
    name: 'HabitCreate',
    component: () => import('@/views/HabitFormView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habit/:id',
    name: 'HabitDetail',
    component: () => import('@/views/HabitDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/habit/:id/edit',
    name: 'HabitEdit',
    component: () => import('@/views/HabitFormView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/learning',
    name: 'LearningContent',
    component: () => import('@/views/LearningContentView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/learning/video/:id',
    name: 'VideoDetail',
    component: () => import('@/views/VideoDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
