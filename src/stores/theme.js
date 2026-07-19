import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from './auth'

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore()
  const isDarkMode = ref(false)
  const isInitialized = ref(false)
  const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

  const getThemeKey = () => {
    return authStore.user?.id ? `darkMode_${authStore.user.id}` : 'darkMode'
  }

  const readThemePreference = () => {
    if (typeof window === 'undefined') return false

    const userTheme = window.localStorage.getItem(getThemeKey())
    if (userTheme === 'true') return true
    if (userTheme === 'false') return false

    const legacyTheme = window.localStorage.getItem('darkMode')
    if (legacyTheme === 'true') return true
    if (legacyTheme === 'false') return false

    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  }

  const applyTheme = () => {
    if (typeof document === 'undefined') return

    document.documentElement.classList.toggle('dark', isDarkMode.value)
    document.documentElement.style.colorScheme = isDarkMode.value ? 'dark' : 'light'
  }

  const persistTheme = () => {
    if (typeof window === 'undefined') return

    const key = getThemeKey()
    window.localStorage.setItem(key, String(isDarkMode.value))
    window.localStorage.setItem('darkMode', String(isDarkMode.value))
  }

  const syncTheme = () => {
    isDarkMode.value = readThemePreference()
    applyTheme()
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    persistTheme()
    applyTheme()
  }

  const setTheme = (value) => {
    isDarkMode.value = value === 'dark'
    persistTheme()
    applyTheme()
  }

  const initTheme = () => {
    if (isInitialized.value) {
      syncTheme()
      return
    }

    syncTheme()
    isInitialized.value = true

    watch(
      () => authStore.user?.id ?? 'guest',
      () => {
        syncTheme()
      },
      { immediate: true }
    )
  }

  return {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    initTheme
  }
})
