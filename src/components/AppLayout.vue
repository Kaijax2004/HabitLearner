<template>
  <div class="min-h-screen surface-page relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div class="grid-pattern"></div>
      </div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-zinc-200/25 to-transparent dark:from-white/8 dark:to-transparent blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-zinc-300/15 to-transparent dark:from-white/4 dark:to-transparent blur-2xl"></div>
    </div>

    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div class="flex h-full flex-col border-r border-zinc-200 bg-white/90 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/90">
        <div class="flex items-center gap-4 border-b border-zinc-200 px-6 py-6 dark:border-zinc-800">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Logo size="xl" />
          </div>
          <div>
            <h1 class="title-primary">习知</h1>
            <p class="text-body-small">HabitLearner</p>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="flex items-center rounded-apple px-4 py-3 text-sm font-medium transition-all duration-200"
            :class="isActive(item.to)
              ? 'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'"
          >
            <component
              :is="item.icon"
              class="mr-3 h-5 w-5"
              :class="isActive(item.to) ? 'text-zinc-950 dark:text-white' : 'text-current'"
            />
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </aside>

    <nav class="lg:hidden nav-apple sticky top-0 z-50">
      <div class="mx-auto max-w-md px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button
              v-if="showBackButton"
              @click="handleBack"
              class="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div v-if="title === 'HabitLearner'" class="ml-2">
              <Logo show-text show-subtitle size="default" brand-name="习知" subtitle="HabitLearner" :on-dark-background="true" />
            </div>
            <h1 v-else class="ml-2 text-lg font-medium text-white">{{ title }}</h1>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="themeStore.toggleTheme()"
              class="rounded-full p-2 transition-colors hover:bg-white/10"
              :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
            >
              <svg v-if="themeStore.isDarkMode" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </nav>

    <header class="hidden lg:block lg:pl-64">
      <div class="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/90">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center">
              <button
                v-if="showBackButton"
                @click="handleBack"
                class="mr-3 rounded-full p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
              >
                <svg class="h-5 w-5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ title }}</h1>
            </div>

            <div class="flex items-center gap-3">
              <button
                @click="themeStore.toggleTheme()"
                class="rounded-full p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
              >
                <svg v-if="themeStore.isDarkMode" class="h-5 w-5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else class="h-5 w-5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="lg:pl-64">
      <div class="mx-auto max-w-6xl px-4 py-6 lg:mx-0 lg:max-w-none lg:px-10 lg:py-8">
        <div class="pb-24 lg:pb-0">
          <slot></slot>
        </div>
      </div>
    </main>

    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-apple dark:border-zinc-800 dark:bg-black/95">
      <div class="mx-auto max-w-md">
        <div class="flex items-center justify-around py-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="flex flex-col items-center rounded-xl px-3 py-2 transition-colors"
            :class="isActive(item.to) ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'"
          >
            <component :is="item.icon" class="mb-1 h-6 w-6" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import Logo from './Logo.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'HabitLearner'
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  onBack: {
    type: Function,
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const navigationItems = [
  { name: 'dashboard', label: '首页', to: '/dashboard', icon: 'HomeIcon' },
  { name: 'plan', label: '计划', to: '/plan', icon: 'CalendarIcon' },
  { name: 'learning', label: '学习', to: '/learning', icon: 'BookOpenIcon' },
  { name: 'profile', label: '我的', to: '/profile', icon: 'UserIcon' }
]

const isActive = (path) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

const handleBack = () => {
  if (props.onBack) {
    props.onBack()
    return
  }

  const currentPath = route.path

  if (currentPath.includes('/habit/') && currentPath.includes('/edit')) {
    const habitId = route.params.id
    router.replace(`/habit/${habitId}`)
  } else if (currentPath.includes('/habit/')) {
    router.replace('/dashboard')
  } else if (currentPath.includes('/learning/video/') || currentPath.includes('/learning/course/')) {
    router.replace('/learning')
  } else if (currentPath.startsWith('/plan/')) {
    router.replace('/plan')
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/dashboard')
  }
}

onMounted(() => {
  themeStore.initTheme()
})
</script>

<script>
const HomeIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

const CalendarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3V3m-8 2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    CalendarIcon,
    BookOpenIcon,
    UserIcon
  }
}
</script>

<style scoped>
.grid-pattern {
  background-image:
    linear-gradient(rgba(9, 9, 11, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(9, 9, 11, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dark .grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}
</style>
