import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/plan',
    name: 'PlanList',
    component: () => import('@/views/PlanListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plan/:id',
    name: 'PlanEditor',
    component: () => import('@/views/PlanEditorView.vue'),
    meta: { requiresAuth: true }
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
  },
  {
    path: '/reminder-test',
    name: 'ReminderTest',
    component: () => import('@/views/ReminderTestView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回时使用浏览器保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 跳转锚点
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    // 默认回到顶部，并平滑滚动
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果访问根路径，根据认证状态重定向
  if (to.path === '/') {
    if (authStore.isAuthenticated) {
      next('/dashboard')
    } else {
      next('/auth')
    }
    return
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
