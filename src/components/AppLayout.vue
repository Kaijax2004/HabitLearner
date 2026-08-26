<template>
  <div
    class="app-shell min-h-screen surface-page relative overflow-hidden"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
    :style="layoutVars"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 opacity-[0.012] dark:opacity-[0.025]">
        <div class="grid-pattern"></div>
      </div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-radial from-zinc-200/12 to-transparent dark:from-white/4 dark:to-transparent blur-3xl"></div>
    </div>

    <aside class="app-sidebar hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
      <div class="flex h-full flex-col border-r border-zinc-200 bg-white/90 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/90">
        <div class="sidebar-brand-row flex items-center gap-4 border-b border-zinc-200 px-6 py-6 dark:border-zinc-800">
          <div class="sidebar-logo flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-zinc-950 p-1 text-white shadow-sm dark:bg-zinc-950 dark:text-white">
            <Logo :size="isSidebarCollapsed ? 'default' : 'xl'" />
          </div>
          <div class="sidebar-brand-copy min-w-0">
            <h1 class="title-primary">{{ BRAND_NAME }}</h1>
            <p class="text-body-small">HabitLearner</p>
          </div>
          <button
            type="button"
            class="sidebar-collapse-button"
            :aria-label="sidebarToggleLabel"
            :title="sidebarToggleLabel"
            @click="toggleSidebar"
          >
            <svg class="h-4 w-4" :class="{ 'rotate-180': isSidebarCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav flex-1 px-4 py-6">
          <div v-for="group in navigationGroups" :key="group.label" class="sidebar-nav-group">
            <p class="sidebar-nav-group-label">{{ group.label }}</p>
            <router-link
              v-for="item in group.items"
              :key="item.name"
              :to="item.to"
              class="sidebar-nav-link flex items-center rounded-apple px-4 py-3 text-sm font-medium transition-all duration-200"
              :title="isSidebarCollapsed ? item.label : ''"
              :class="isActive(item.to)
                ? 'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'"
            >
              <component
                :is="item.icon"
                class="mr-3 h-5 w-5"
                :class="isActive(item.to) ? 'text-zinc-950 dark:text-white' : 'text-current'"
              />
              <span class="sidebar-nav-label">{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
      </div>
    </aside>

    <nav class="mobile-brand-nav lg:hidden sticky top-0 z-50">
      <div class="mx-auto max-w-screen-sm px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex min-w-0 items-center">
            <button
              v-if="showBackButton"
              @click="handleBack"
              class="mobile-icon-button"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div v-if="title === 'HabitLearner'" class="mobile-brand-mark ml-2">
              <Logo show-text show-subtitle size="default" :brand-name="BRAND_NAME" subtitle="HabitLearner" />
            </div>
            <div v-else class="ml-2 min-w-0">
              <p class="mobile-brand-eyebrow">HabitLearner</p>
              <h1 class="mobile-page-title">{{ title }}</h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="themeStore.toggleTheme()"
              class="mobile-icon-button"
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

    <header class="app-content-offset hidden lg:block">
      <div class="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/90">
        <div class="app-topbar-container px-6 py-4 lg:px-8">
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

    <main class="app-content-offset app-main">
      <div class="app-main-container">
        <div class="pb-24 lg:pb-0">
          <slot></slot>
        </div>
      </div>
    </main>

    <nav class="mobile-bottom-nav lg:hidden">
      <div class="mx-auto max-w-screen-sm px-3">
        <div class="mobile-bottom-nav-inner">
          <router-link
            v-for="item in mobilePrimaryNavigationItems"
            :key="item.name"
            :to="item.to"
            class="mobile-nav-item"
            :class="{ 'is-active': isActive(item.to) }"
          >
            <component :is="item.icon" class="mb-1 h-6 w-6" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </router-link>
          <button
            type="button"
            class="mobile-nav-item mobile-workspace-trigger"
            :class="{ 'is-active': isMobileWorkspaceActive || showMobileWorkspace }"
            @click="showMobileWorkspace = true"
          >
            <GridIcon class="mb-1 h-6 w-6" />
            <span class="text-xs font-medium">工作区</span>
          </button>
        </div>
      </div>
    </nav>

    <Transition name="mobile-workspace">
      <div v-if="showMobileWorkspace" class="mobile-workspace-layer lg:hidden" @click.self="closeMobileWorkspace">
        <section class="mobile-workspace-drawer" aria-label="移动端工作区导航">
          <div class="mobile-workspace-handle"></div>
          <header class="mobile-workspace-head">
            <div>
              <p class="mobile-brand-eyebrow">Workspace</p>
              <h2>所有工作区</h2>
              <span>保持手机端完整能力，不再把功能藏在桌面侧栏里。</span>
            </div>
            <button type="button" class="mobile-icon-button" aria-label="关闭工作区" @click="closeMobileWorkspace">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="mobile-workspace-groups">
            <div v-for="group in mobileWorkspaceGroups" :key="group.label" class="mobile-workspace-group">
              <p>{{ group.label }}</p>
              <div class="mobile-workspace-grid">
                <router-link
                  v-for="item in group.items"
                  :key="item.name"
                  :to="item.to"
                  class="mobile-workspace-link"
                  :class="{ 'is-active': isMobileWorkspaceItemActive(item) }"
                  @click="closeMobileWorkspace"
                >
                  <component :is="item.icon" class="h-5 w-5" />
                  <span>{{ item.label }}</span>
                  <small>{{ item.description }}</small>
                </router-link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>

    <WorkspacePet />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useSidebarState } from '@/composables/useSidebarState'
import Logo from './Logo.vue'
import WorkspacePet from './WorkspacePet.vue'

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
const authStore = useAuthStore()
const { isSidebarCollapsed, toggleSidebar } = useSidebarState()

const BRAND_NAME = '\u4e60\u77e5'
const DEFAULT_SIDEBAR_WIDTH = 256
const COLLAPSED_SIDEBAR_WIDTH = 84

const layoutVars = computed(() => ({
  '--app-sidebar-width': `${isSidebarCollapsed.value ? COLLAPSED_SIDEBAR_WIDTH : DEFAULT_SIDEBAR_WIDTH}px`
}))

const sidebarToggleLabel = computed(() => (
  isSidebarCollapsed.value ? '\u5c55\u5f00\u4fa7\u8fb9\u680f' : '\u6536\u8d77\u4fa7\u8fb9\u680f'
))

const isAdmin = computed(() => Boolean(authStore.user?.isAdmin || authStore.user?.security?.isAdmin))

const navigationGroups = [
  {
    label: '\u6838\u5fc3',
    items: [
      { name: 'dashboard', label: '\u4eca\u65e5', to: '/dashboard', icon: 'HomeIcon' },
      { name: 'plan', label: '\u8ba1\u5212', to: '/plan', icon: 'CalendarIcon' },
      { name: 'tracks', label: '\u8f68\u9053', to: '/tracks', icon: 'TrackIcon' },
      { name: 'profile', label: '\u6211\u7684', to: '/profile', icon: 'UserIcon' }
    ]
  },
  {
    label: '\u5de5\u4f5c\u533a',
    items: [
      { name: 'learning', label: '\u5b66\u4e60', to: '/learning', icon: 'BookOpenIcon' },
      { name: 'focus', label: '\u4e13\u6ce8', to: '/focus', icon: 'FocusIcon' },
      { name: 'captures', label: '\u6536\u96c6', to: '/captures', icon: 'InboxIcon' },
      { name: 'review', label: '\u590d\u76d8', to: '/review', icon: 'ReviewIcon' },
      { name: 'insights', label: '\u6d1e\u5bdf', to: '/insights', icon: 'InsightsIcon' },
      { name: 'creator', label: '\u5185\u5bb9\u521b\u4f5c', to: '/creator', icon: 'CreatorIcon' }
    ]
  }
]

const navigationItems = navigationGroups.flatMap((group) => group.items)
const mobilePrimaryNavigationItems = navigationItems.filter((item) => ['dashboard', 'plan', 'tracks', 'profile'].includes(item.name))
const showMobileWorkspace = ref(false)

const mobileWorkspaceGroups = computed(() => [
  {
    label: '\u5de5\u4f5c\u533a',
    items: navigationGroups.find((group) => group.label === '\u5de5\u4f5c\u533a')?.items.map((item) => ({
      ...item,
      description: {
        learning: '\u5b66\u4e60\u5185\u5bb9\u4e0e\u7b14\u8bb0',
        focus: '\u756a\u8304\u949f\u4e0e\u6df1\u5ea6\u6267\u884c',
        captures: '\u5feb\u901f\u6536\u96c6\u548c\u8f6c\u5316',
        review: '\u4eca\u65e5\u590d\u76d8\u548c\u6c89\u6dc0',
        insights: '\u8f68\u9053\u8d8b\u52bf\u4e0e\u6d1e\u5bdf',
        creator: '\u70ed\u70b9\u3001\u9009\u9898\u4e0e\u53d1\u5e03'
      }[item.name] || ''
    })) || []
  },
  {
    label: '\u63a7\u5236\u4e2d\u5fc3',
    items: [
      { name: 'guide', label: '\u4f7f\u7528\u6559\u7a0b', to: '/guide', icon: 'GuideIcon', description: '\u529f\u80fd\u8bf4\u660e\u548c\u65e5\u5e38\u5de5\u4f5c\u6d41' },
      ...(isAdmin.value ? [{ name: 'admin-users', label: '\u7528\u6237\u7ba1\u7406', to: '/admin/users', icon: 'UserIcon', description: '\u589e\u957f\u3001\u6d3b\u8dc3\u548c\u7528\u6237\u753b\u50cf' }] : []),
      { name: 'ai-providers', label: 'AI \u8bbe\u7f6e', to: '/profile/ai-providers', icon: 'SparkIcon', description: '\u7edf\u4e00\u4f9b\u5e94\u5546\u548c\u6a21\u578b' },
      { name: 'ai-skills', label: 'AI \u6280\u80fd', to: '/profile/ai-skills', icon: 'SparkIcon', description: '\u7ba1\u7406\u5185\u7f6e\u4e0e\u81ea\u5b9a\u4e49 skills' },
      { name: 'appearance', label: '\u5916\u89c2\u4e3b\u9898', to: '/profile/appearance', icon: 'BrushIcon', description: '\u80cc\u666f\u3001\u914d\u8272\u548c\u5bc6\u5ea6' },
      { name: 'notifications', label: '\u901a\u77e5\u58f0\u97f3', to: { path: '/profile', query: { panel: 'notifications' } }, icon: 'BellIcon', description: '\u63d0\u9192\u3001\u97f3\u6548\u548c\u514d\u6253\u6270' }
    ]
  }
])

const getItemPath = (to) => (typeof to === 'string' ? to : to?.path || '')

const isMobileWorkspaceActive = computed(() => mobileWorkspaceGroups.value
  .flatMap((group) => group.items)
  .some((item) => isMobileWorkspaceItemActive(item)))

const isActive = (path) => {
  path = getItemPath(path)
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

const isMobileWorkspaceItemActive = (item) => {
  if (item.name === 'notifications') {
    return route.path === '/profile' && route.query.panel === 'notifications'
  }
  return isActive(item.to)
}

const closeMobileWorkspace = () => {
  showMobileWorkspace.value = false
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

watch(() => route.fullPath, () => {
  closeMobileWorkspace()
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

const TrackIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h4m8 0h4M8 7a4 4 0 018 0M4 17h4m8 0h4M8 17a4 4 0 018 0" />
    </svg>
  `
}

const FocusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const InboxIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4l-2 3h-4l-2-3H4m16 0l-2-8H6l-2 8" />
    </svg>
  `
}

const ReviewIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h6m-7 9h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  `
}

const InsightsIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-7" />
    </svg>
  `
}

const CreatorIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19h16M6 16V8m4 8V5m4 11v-6m4 6V3" />
    </svg>
  `
}

const GridIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5.5A1.5 1.5 0 015.5 4h3A1.5 1.5 0 0110 5.5v3A1.5 1.5 0 018.5 10h-3A1.5 1.5 0 014 8.5v-3zm10 0A1.5 1.5 0 0115.5 4h3A1.5 1.5 0 0120 5.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 0114 8.5v-3zm-10 10A1.5 1.5 0 015.5 14h3a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 018.5 20h-3A1.5 1.5 0 014 18.5v-3zm10 0a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-3z" />
    </svg>
  `
}

const SparkIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zm6 10l.9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9L18 13z" />
    </svg>
  `
}

const BrushIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h7m7.5-13.5a2.1 2.1 0 010 3L11 17l-4 1 1-4 7.5-7.5a2.1 2.1 0 013 0z" />
    </svg>
  `
}

const BellIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-2 2h16l-2-2zm-5 5a2 2 0 01-4 0" />
    </svg>
  `
}

const GuideIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5v-16zM8 7h8M8 11h6M8 15h7" />
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
    TrackIcon,
    FocusIcon,
    InboxIcon,
    ReviewIcon,
    InsightsIcon,
    BookOpenIcon,
    UserIcon,
    CreatorIcon,
    GridIcon,
    SparkIcon,
    BrushIcon,
    BellIcon,
    GuideIcon
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

.app-sidebar {
  z-index: 30;
  width: var(--app-sidebar-width);
  transition: width 0.22s ease;
}

.app-content-offset {
  transition: padding-left 0.18s ease;
}

.app-main {
  position: relative;
  min-height: calc(100vh - 72px);
}

.app-main-container {
  width: min(calc(100% - clamp(1rem, 2.2vw, 2.5rem)), var(--workbench-content-width));
  margin-inline: auto;
  padding: clamp(0.85rem, 1.15vw, 1.35rem) 0;
}

.app-topbar-container {
  width: 100%;
}

.mobile-brand-nav {
  border-bottom: 1px solid var(--workbench-border);
  background: rgb(247 246 243 / 0.88);
  color: var(--workbench-text);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 30px rgba(32, 31, 29, 0.05);
}

.dark .mobile-brand-nav {
  background: rgb(16 16 15 / 0.9);
}

.mobile-brand-mark {
  overflow: hidden;
  border-radius: 1rem;
}

.mobile-brand-eyebrow {
  margin: 0;
  color: var(--workbench-text-muted);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
}

.mobile-page-title {
  max-width: 54vw;
  overflow: hidden;
  margin-top: 0.22rem;
  color: var(--workbench-text);
  font-size: 1.05rem;
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-icon-button {
  display: inline-flex;
  min-width: 2.35rem;
  height: 2.35rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--workbench-border);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.58);
  color: var(--workbench-text);
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), background var(--workbench-motion-duration) var(--workbench-ease);
}

.mobile-icon-button:active {
  transform: scale(0.96);
}

.dark .mobile-icon-button {
  background: rgb(24 24 27 / 0.68);
}

.mobile-bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 44;
  padding-bottom: max(0.55rem, env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.mobile-bottom-nav-inner {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.22rem;
  border: 1px solid var(--workbench-border);
  border-radius: 1.45rem;
  background: rgb(255 255 255 / 0.88);
  padding: 0.35rem;
  box-shadow: 0 18px 44px rgba(32, 31, 29, 0.16);
  backdrop-filter: blur(18px);
  pointer-events: auto;
}

.dark .mobile-bottom-nav-inner {
  background: rgb(16 16 15 / 0.9);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.36);
}

.mobile-nav-item {
  display: flex;
  min-width: 0;
  min-height: 3.3rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 1.05rem;
  background: transparent;
  color: var(--workbench-text-muted);
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), background var(--workbench-motion-duration) var(--workbench-ease), color var(--workbench-motion-duration) var(--workbench-ease);
}

.mobile-nav-item.is-active {
  background: var(--workbench-text);
  color: var(--workbench-page);
}

.mobile-nav-item:active {
  transform: scale(0.97);
}

.mobile-workspace-layer {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: flex-end;
  padding: 0.75rem;
  background: rgba(24, 24, 27, 0.26);
  backdrop-filter: blur(10px);
}

.mobile-workspace-drawer {
  width: min(100%, 44rem);
  max-height: min(82dvh, 46rem);
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid var(--workbench-border);
  border-radius: 1.65rem 1.65rem 1.25rem 1.25rem;
  background:
    radial-gradient(circle at 92% 0%, rgb(var(--workbench-accent-rgb) / 0.12), transparent 30%),
    var(--workbench-surface);
  box-shadow: 0 28px 78px rgba(32, 31, 29, 0.24);
}

.mobile-workspace-handle {
  width: 2.8rem;
  height: 0.24rem;
  margin: 0.7rem auto 0;
  border-radius: 999px;
  background: rgb(161 161 170 / 0.72);
}

.mobile-workspace-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.05rem 0.75rem;
}

.mobile-workspace-head h2 {
  margin-top: 0.3rem;
  color: var(--workbench-text);
  font-size: 1.35rem;
  font-weight: 760;
  letter-spacing: -0.045em;
}

.mobile-workspace-head span {
  display: block;
  max-width: 26rem;
  margin-top: 0.35rem;
  color: var(--workbench-text-muted);
  font-size: 0.78rem;
  line-height: 1.6;
}

.mobile-workspace-groups {
  display: grid;
  max-height: calc(min(82dvh, 46rem) - 7.6rem);
  gap: 1rem;
  overflow-y: auto;
  padding: 0 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
}

.mobile-workspace-group > p {
  margin: 0 0 0.55rem;
  color: var(--workbench-text-muted);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mobile-workspace-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.mobile-workspace-link {
  display: grid;
  min-height: 6rem;
  align-content: start;
  gap: 0.45rem;
  border: 1px solid var(--workbench-border);
  border-radius: 1.1rem;
  background: rgb(255 255 255 / 0.58);
  color: var(--workbench-text);
  padding: 0.9rem;
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease), background var(--workbench-motion-duration) var(--workbench-ease);
}

.dark .mobile-workspace-link {
  background: rgb(24 24 27 / 0.58);
}

.mobile-workspace-link.is-active,
.mobile-workspace-link:hover {
  border-color: rgb(var(--workbench-accent-rgb) / 0.32);
  background: var(--workbench-surface-muted);
  transform: translateY(-1px);
}

.mobile-workspace-link span {
  font-size: 0.86rem;
  font-weight: 760;
  letter-spacing: -0.02em;
}

.mobile-workspace-link small {
  color: var(--workbench-text-muted);
  font-size: 0.7rem;
  line-height: 1.45;
}

.mobile-workspace-enter-active,
.mobile-workspace-leave-active {
  transition: opacity 220ms var(--workbench-ease);
}

.mobile-workspace-enter-active .mobile-workspace-drawer,
.mobile-workspace-leave-active .mobile-workspace-drawer {
  transition: transform 260ms var(--workbench-ease), opacity 220ms var(--workbench-ease);
}

.mobile-workspace-enter-from,
.mobile-workspace-leave-to {
  opacity: 0;
}

.mobile-workspace-enter-from .mobile-workspace-drawer,
.mobile-workspace-leave-to .mobile-workspace-drawer {
  opacity: 0;
  transform: translateY(1.25rem) scale(0.985);
}

.sidebar-brand-row {
  min-height: 105px;
  transition: padding 0.22s ease, justify-content 0.22s ease;
}

.sidebar-brand-copy,
.sidebar-nav-label {
  overflow: hidden;
  white-space: nowrap;
  transition: max-width 0.18s ease, opacity 0.16s ease, transform 0.18s ease;
}

.sidebar-brand-copy {
  max-width: 140px;
}

.sidebar-nav-label {
  max-width: 120px;
}

.sidebar-nav-group {
  margin-bottom: 1.15rem;
}

.sidebar-nav-group:last-child {
  margin-bottom: 0;
}

.sidebar-nav-group-label {
  margin: 0 0 0.45rem;
  padding: 0 1rem;
  color: rgb(113, 113, 122);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  transition: max-height 0.16s ease, opacity 0.16s ease, transform 0.16s ease;
}

.sidebar-logo,
.sidebar-nav-link,
.sidebar-collapse-button svg {
  transition: all var(--workbench-motion-duration) var(--workbench-ease);
}

.sidebar-logo :deep(img),
.sidebar-logo :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border-radius: 1rem;
}

.sidebar-nav-link {
  position: relative;
  overflow: hidden;
}

.sidebar-nav-link::before {
  content: '';
  position: absolute;
  inset: 8px auto 8px 6px;
  width: 3px;
  border-radius: 999px;
  background: rgb(var(--workbench-accent-rgb));
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--workbench-motion-duration) var(--workbench-ease), transform var(--workbench-motion-duration) var(--workbench-ease);
}

.sidebar-nav-link[aria-current='page']::before {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-collapse-button {
  margin-left: auto;
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: rgb(82 82 91);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.sidebar-collapse-button:hover,
.sidebar-collapse-button:focus-visible {
  background: rgba(39, 39, 42, 0.08);
  color: rgb(24 24 27);
  outline: none;
}

.is-sidebar-collapsed .sidebar-brand-row {
  justify-content: center;
  gap: 0;
  padding-left: 14px;
  padding-right: 14px;
}

.is-sidebar-collapsed .sidebar-logo {
  height: 48px;
  width: 48px;
  border-radius: 16px;
}

.is-sidebar-collapsed .sidebar-brand-copy,
.is-sidebar-collapsed .sidebar-nav-label {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
}

.is-sidebar-collapsed .sidebar-nav-group {
  margin-bottom: 0.6rem;
}

.is-sidebar-collapsed .sidebar-nav-group-label {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  transform: translateX(-6px);
}

.is-sidebar-collapsed .sidebar-collapse-button {
  position: absolute;
  right: -16px;
  top: 70px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 24px rgba(24, 24, 27, 0.1);
}

.is-sidebar-collapsed .sidebar-nav {
  padding-left: 14px;
  padding-right: 14px;
}

.is-sidebar-collapsed .sidebar-nav-link {
  justify-content: center;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.is-sidebar-collapsed .sidebar-nav-link svg {
  margin-right: 0;
}

.dark .sidebar-collapse-button {
  color: rgb(212 212 216);
}

.dark .sidebar-collapse-button:hover,
.dark .sidebar-collapse-button:focus-visible {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dark .is-sidebar-collapsed .sidebar-collapse-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(9, 9, 11, 0.92);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

@media (min-width: 1024px) {
  .app-content-offset {
    padding-left: var(--app-sidebar-width);
  }

  .app-main-container {
    padding: clamp(1.15rem, 1.7vw, 1.9rem);
  }
}

@media (max-width: 1023px) {
  .app-main-container {
    width: min(calc(100% - 1rem), var(--workbench-content-width));
    padding-top: 0.8rem;
    padding-bottom: calc(6.25rem + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 380px) {
  .mobile-bottom-nav-inner {
    border-radius: 1.25rem;
    padding: 0.28rem;
  }

  .mobile-nav-item {
    min-height: 3rem;
  }

  .mobile-nav-item svg {
    height: 1.25rem;
    width: 1.25rem;
  }

  .mobile-nav-item span {
    font-size: 0.66rem;
  }

  .mobile-workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-nav-item,
  .mobile-icon-button,
  .mobile-workspace-link,
  .mobile-workspace-enter-active,
  .mobile-workspace-leave-active,
  .mobile-workspace-enter-active .mobile-workspace-drawer,
  .mobile-workspace-leave-active .mobile-workspace-drawer {
    transition: none;
  }
}
</style>
