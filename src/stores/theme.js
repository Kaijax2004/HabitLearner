import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from './auth'
import { getWorkspaceAppearance, updateWorkspaceAppearance } from '../api/workspace.js'

const DEFAULT_APPEARANCE = {
  mode: 'system',
  accentColor: '#8f7350',
  backgroundImage: '',
  backgroundBlur: 10,
  backgroundDim: 18,
  surfaceOpacity: 92,
  radiusScale: 100,
  density: 'comfortable',
  motionLevel: 'balanced'
}

const hexToRgb = (hex) => {
  const value = String(hex || '').replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return { r: 143, g: 115, b: 80 }
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  }
}

const clamp = (value, min, max, fallback) => {
  const next = Number(value)
  return Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : fallback
}

const normalizeAppearance = (value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const density = ['compact', 'comfortable', 'roomy'].includes(source.density) ? source.density : DEFAULT_APPEARANCE.density
  const mode = ['light', 'dark', 'system'].includes(source.mode) ? source.mode : DEFAULT_APPEARANCE.mode
  const motionLevel = ['quiet', 'balanced', 'expressive'].includes(source.motionLevel) ? source.motionLevel : DEFAULT_APPEARANCE.motionLevel
  const accentColor = /^#[0-9a-f]{6}$/i.test(String(source.accentColor || '')) ? source.accentColor : DEFAULT_APPEARANCE.accentColor

  return {
    mode,
    accentColor,
    backgroundImage: String(source.backgroundImage || ''),
    backgroundBlur: clamp(source.backgroundBlur, 0, 28, DEFAULT_APPEARANCE.backgroundBlur),
    backgroundDim: clamp(source.backgroundDim, 0, 60, DEFAULT_APPEARANCE.backgroundDim),
    surfaceOpacity: clamp(source.surfaceOpacity, 72, 98, DEFAULT_APPEARANCE.surfaceOpacity),
    radiusScale: clamp(source.radiusScale, 75, 130, DEFAULT_APPEARANCE.radiusScale),
    density,
    motionLevel
  }
}

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore()
  const isDarkMode = ref(false)
  const isInitialized = ref(false)
  const appearance = ref({ ...DEFAULT_APPEARANCE })
  const isLoadingAppearance = ref(false)
  const appearanceError = ref('')
  const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

  const getThemeKey = () => {
    return authStore.user?.id ? `darkMode_${authStore.user.id}` : 'darkMode'
  }

  const readThemePreference = (mode = appearance.value.mode) => {
    if (typeof window === 'undefined') return false

    if (mode === 'dark') return true
    if (mode === 'light') return false

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

  const applyAppearance = (nextAppearance = appearance.value) => {
    if (typeof document === 'undefined') return

    const normalized = normalizeAppearance(nextAppearance)
    const { r, g, b } = hexToRgb(normalized.accentColor)
    const root = document.documentElement
    const surfaceAlpha = normalized.surfaceOpacity / 100
    const radius = 1.1 * (normalized.radiusScale / 100)
    const densityGap = normalized.density === 'compact' ? '0.85rem' : normalized.density === 'roomy' ? '1.55rem' : '1.15rem'
    const motionDuration = normalized.motionLevel === 'quiet' ? '120ms' : normalized.motionLevel === 'expressive' ? '420ms' : '240ms'
    const motionDistance = normalized.motionLevel === 'quiet' ? '2px' : normalized.motionLevel === 'expressive' ? '10px' : '5px'

    root.dataset.workbenchDensity = normalized.density
    root.dataset.workbenchMotion = normalized.motionLevel
    root.style.setProperty('--workbench-accent', normalized.accentColor)
    root.style.setProperty('--workbench-accent-rgb', `${r} ${g} ${b}`)
    root.style.setProperty('--workbench-surface-alpha', String(surfaceAlpha))
    root.style.setProperty('--workbench-radius', `${radius}rem`)
    root.style.setProperty('--workbench-content-gap', densityGap)
    root.style.setProperty('--workbench-backdrop-blur', `${normalized.backgroundBlur}px`)
    root.style.setProperty('--workbench-background-dim', `${normalized.backgroundDim / 100}`)
    root.style.setProperty('--workbench-motion-duration', motionDuration)
    root.style.setProperty('--workbench-motion-distance', motionDistance)
    root.style.setProperty('--workbench-custom-bg', normalized.backgroundImage ? `url("${normalized.backgroundImage}")` : 'none')
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
    applyAppearance()
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    appearance.value = {
      ...appearance.value,
      mode: isDarkMode.value ? 'dark' : 'light'
    }
    persistTheme()
    applyTheme()
    applyAppearance()
  }

  const setTheme = (value) => {
    appearance.value = {
      ...appearance.value,
      mode: ['light', 'dark', 'system'].includes(value) ? value : 'system'
    }
    isDarkMode.value = readThemePreference(appearance.value.mode)
    persistTheme()
    applyTheme()
    applyAppearance()
  }

  const previewAppearance = (patch = {}) => {
    appearance.value = normalizeAppearance({ ...appearance.value, ...patch })
    isDarkMode.value = readThemePreference(appearance.value.mode)
    applyTheme()
    applyAppearance()
  }

  const loadAppearance = async () => {
    if (!authStore.isAuthenticated) {
      previewAppearance(DEFAULT_APPEARANCE)
      return appearance.value
    }

    isLoadingAppearance.value = true
    appearanceError.value = ''
    const response = await getWorkspaceAppearance()
    isLoadingAppearance.value = false

    if (!response.success) {
      appearanceError.value = response.error || '外观设置加载失败'
      applyAppearance()
      return appearance.value
    }

    previewAppearance(response.data || DEFAULT_APPEARANCE)
    return appearance.value
  }

  const saveAppearance = async (patch = appearance.value) => {
    previewAppearance(patch)
    appearanceError.value = ''

    const response = await updateWorkspaceAppearance(appearance.value)
    if (!response.success) {
      appearanceError.value = response.error || '外观设置保存失败'
      return { success: false, error: appearanceError.value }
    }

    previewAppearance(response.data || appearance.value)
    return { success: true, data: appearance.value }
  }

  const resetAppearance = async () => saveAppearance(DEFAULT_APPEARANCE)

  const refreshSystemTheme = () => {
    if (appearance.value.mode !== 'system') return
    isDarkMode.value = readThemePreference('system')
    applyTheme()
  }

  const initTheme = () => {
    if (isInitialized.value) {
      syncTheme()
      return
    }

    syncTheme()
    isInitialized.value = true

    if (typeof window !== 'undefined') {
      window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', refreshSystemTheme)
    }

    watch(
      () => authStore.user?.id ?? 'guest',
      () => {
        syncTheme()
        loadAppearance()
      },
      { immediate: true }
    )
  }

  return {
    isDarkMode,
    theme,
    appearance,
    isLoadingAppearance,
    appearanceError,
    toggleTheme,
    setTheme,
    initTheme,
    loadAppearance,
    previewAppearance,
    saveAppearance,
    resetAppearance
  }
})
