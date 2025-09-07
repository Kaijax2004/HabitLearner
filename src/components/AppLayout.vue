<template>
  <div class="min-h-screen bg-white dark:bg-black relative overflow-hidden">
    <!-- 科技感背景装饰 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 网格背景 -->
      <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div class="grid-pattern"></div>
      </div>
      <!-- 渐变光效 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-gray-200/20 to-transparent dark:from-white/10 dark:to-transparent blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-gray-300/10 to-transparent dark:from-white/5 dark:to-transparent blur-2xl"></div>
    </div>

    <!-- 桌面端侧边栏 -->
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <!-- Logo区域 -->
        <div class="flex items-center px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div class="w-16 h-16 flex items-center justify-center mr-4">
            <Logo size="xl" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">习知</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">HabitLearner</p>
          </div>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="flex-1 px-4 py-6 space-y-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-apple transition-colors duration-150"
            :class="isActive(item.to) 
              ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-500 shadow-apple-glow' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" :class="isActive(item.to) ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'" />
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- 移动端顶部导航栏 -->
    <nav class="lg:hidden nav-apple sticky top-0 z-50">
      <div class="max-w-md mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- 左侧：标题或返回按钮 -->
          <div class="flex items-center">
            <button
              v-if="showBackButton"
              @click="handleBack"
              class="p-2 rounded-full hover:bg-white/10 transition-colors duration-150"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div v-if="title === 'HabitLearner'" class="ml-2">
              <Logo show-text show-subtitle size="default" brand-name="习知" subtitle="HabitLearner" :on-dark-background="true" />
            </div>
            <h1 v-else class="text-lg font-medium ml-2">{{ title }}</h1>
          </div>
          
          <!-- 右侧：操作按钮 -->
          <div class="flex items-center space-x-2">
            <!-- 移动端主题切换按钮 -->
            <button
              @click="themeStore.toggleTheme()"
              class="p-2 rounded-full hover:bg-white/10 transition-colors duration-150"
              :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
            >
              <svg v-if="themeStore.isDarkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </nav>

    <!-- 桌面端顶部导航栏 -->
    <header class="hidden lg:block lg:pl-64">
      <div class="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-apple border-b border-gray-200 dark:border-gray-800">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button
                v-if="showBackButton"
                @click="handleBack"
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 mr-3"
              >
                <svg class="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-2xl font-medium text-gray-900 dark:text-gray-100">{{ title }}</h1>
            </div>
            
            <!-- 右侧：操作按钮 -->
            <div class="flex items-center space-x-3">
              <!-- 主题切换按钮 -->
              <button
                @click="themeStore.toggleTheme()"
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
              >
                <svg v-if="themeStore.isDarkMode" class="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else class="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
                  <main class="lg:pl-64">
                <div class="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:px-10 lg:py-8">
        <div class="lg:pb-0 pb-20">
          <slot></slot>
        </div>
      </div>
    </main>

    <!-- 移动端底部导航栏 -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-apple border-t border-gray-200 dark:border-gray-800 z-40">
      <div class="max-w-md mx-auto">
        <div class="flex items-center justify-around py-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-150"
                          :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'"
          >
            <component :is="item.icon" class="w-6 h-6 mb-1" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import Logo from './Logo.vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'HabitLearner'
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// 导航项配置
const navigationItems = [
  {
    name: 'dashboard',
    label: '首页',
    to: '/dashboard',
    icon: 'HomeIcon'
  },
  {
    name: 'habits',
    label: '习惯',
    to: '/habit/create',
    icon: 'PlusIcon'
  },
  {
    name: 'learning',
    label: '学习',
    to: '/learning',
    icon: 'BookOpenIcon'
  },
  {
    name: 'profile',
    label: '我的',
    to: '/profile',
    icon: 'UserIcon'
  }
]

// 检查当前路由是否激活
const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

// 方法
const handleBack = () => {
  // 根据当前路由智能返回
  const currentPath = route.path
  
  if (currentPath.includes('/habit/') && currentPath.includes('/edit')) {
    // 从编辑页面返回到详情页
    const habitId = route.params.id
    router.replace(`/habit/${habitId}`)
  } else if (currentPath.includes('/habit/')) {
    // 从详情页返回到首页
    router.replace('/dashboard')
  } else if (currentPath.includes('/learning/video/')) {
    // 从视频详情页返回到学习列表
    router.replace('/learning')
  } else {
    // 默认返回到首页
    router.replace('/dashboard')
  }
}

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})
</script>

<script>
// 图标组件
const HomeIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `
}

const PlusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  `
}

const BookOpenIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  `
}

const UserIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `
}

export default {
  components: {
    HomeIcon,
    PlusIcon,
    BookOpenIcon,
    UserIcon
  }
}
</script>

<style scoped>
.grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dark .grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}
</style>
