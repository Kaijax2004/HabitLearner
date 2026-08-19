<template>
  <div id="app" class="min-h-screen surface-page" @pointerover="prefetchRouteFromEvent" @focusin="prefetchRouteFromEvent">
    <router-view v-slot="{ Component, route }">
      <Transition name="route-page">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </router-view>
    <RouteLoadingIndicator />
    <ToastContainer />
    <GlobalDialogHost />
    <ReminderNotification
      v-if="activeReminder"
      :reminder="activeReminder"
      @complete="handleReminderComplete"
      @snooze="handleReminderSnooze"
      @dismiss="handleReminderDismiss"
    />
    <OnboardingAnimation
      :show="showOnboarding"
      @completed="handleOnboardingComplete"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import GlobalDialogHost from '@/components/GlobalDialogHost.vue'
import RouteLoadingIndicator from '@/components/RouteLoadingIndicator.vue'
import { useReminder } from '@/composables/useReminder'
import OnboardingAnimation from '@/components/OnboardingAnimation.vue'
import ReminderNotification from '@/components/ReminderNotification.vue'
import { getIsNewUser, hasCompletedOnboarding, markOnboardingComplete } from '@/api/index.js'

const authStore = useAuthStore()
const {
  activeReminder,
  startReminderCheck,
  stopReminderCheck,
  handleReminderComplete,
  handleReminderSnooze,
  handleReminderDismiss
} = useReminder()
const showOnboarding = ref(false)
let onboardingTimer = null
const prefetchedRoutes = new Set()

const checkAndShowOnboarding = () => {
  const isNew = getIsNewUser()
  const hasCompleted = hasCompletedOnboarding()

  if (isNew && !hasCompleted) {
    onboardingTimer = window.setTimeout(() => {
      showOnboarding.value = true
    }, 800)
  }
}

const handleOnboardingComplete = () => {
  showOnboarding.value = false
  markOnboardingComplete()
}

const prefetchRouteFromEvent = (event) => {
  const anchor = event.target?.closest?.('a[href]')
  if (!anchor) return

  const href = anchor.getAttribute('href') || ''
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return

  const resolved = router.resolve(href)
  if (!resolved?.matched?.length || prefetchedRoutes.has(resolved.fullPath)) return

  prefetchedRoutes.add(resolved.fullPath)
  resolved.matched.forEach((record) => {
    Object.values(record.components || {}).forEach((component) => {
      if (typeof component === 'function') {
        component().catch(() => {})
      }
    })
  })
}

onMounted(async () => {
  await authStore.bootstrapAuth()
  if (authStore.isAuthenticated) {
    startReminderCheck()
    checkAndShowOnboarding()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startReminderCheck()
      checkAndShowOnboarding()
      return
    }

    stopReminderCheck()
  }
)

onUnmounted(() => {
  if (onboardingTimer) {
    window.clearTimeout(onboardingTimer)
  }
  stopReminderCheck()
})
</script>

<style>
.route-page-enter-active {
  transition: opacity 120ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.route-page-leave-active {
  display: none;
}

.route-page-enter-from {
  opacity: 0.96;
  transform: translateY(3px);
}

@media (prefers-reduced-motion: reduce) {
  .route-page-enter-active {
    transition: none;
  }

  .route-page-enter-from {
    transform: none;
  }
}
</style>

