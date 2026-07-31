import { ref } from 'vue'

const STORAGE_KEY = 'habitLearner.sidebarCollapsed'

const readInitialState = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

const isSidebarCollapsed = ref(readInitialState())

export const useSidebarState = () => {
  const setSidebarCollapsed = (value) => {
    isSidebarCollapsed.value = Boolean(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(isSidebarCollapsed.value))
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed.value)
  }

  return {
    isSidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar
  }
}
