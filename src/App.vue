<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <router-view />
    <ToastContainer />
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
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
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
