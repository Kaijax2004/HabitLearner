import audioManager, { DEFAULT_EVENT_SOUNDS } from '@/utils/audioManager.js'
import * as settingsAPI from '@/api/settings.js'
import { useAuthStore } from '@/stores/auth'
import {
  cacheNotificationSettings,
  isWithinQuietHours,
  normalizeNotificationSettings,
  readNotificationSettings
} from '@/utils/notificationSettings.js'

const normalizeVolume = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0.36
  return Math.max(0, Math.min(1, parsed / 100))
}

const getUserId = () => {
  try {
    return useAuthStore().user?.id
  } catch (_error) {
    return null
  }
}

const getSettings = () => normalizeNotificationSettings(readNotificationSettings(getUserId()))

export function useWorkbenchSound() {
  const playWorkbenchSound = async (eventKey, options = {}) => {
    const settings = normalizeNotificationSettings(options.settings || getSettings())
    const focusSoundEnabled = options.focusSoundEnabled

    if (!settings.soundEnabled || focusSoundEnabled === false) return false
    if (!options.ignoreQuietHours && isWithinQuietHours(settings)) return false

    const soundId = options.soundId || settings.soundEvents?.[eventKey] || DEFAULT_EVENT_SOUNDS[eventKey]
    if (!soundId || soundId === 'none') return false

    return audioManager.playEventSound(eventKey, soundId, {
      enabled: true,
      volume: normalizeVolume(options.volume ?? settings.soundVolume)
    })
  }

  const previewWorkbenchSound = async (eventKey, soundId, settingsPatch = {}) => {
    const settings = normalizeNotificationSettings({ ...getSettings(), ...settingsPatch })
    return audioManager.playEventSound(eventKey, soundId || settings.soundEvents?.[eventKey], {
      enabled: true,
      volume: normalizeVolume(settings.soundVolume),
      ignoreQuietHours: true
    })
  }

  const loadSoundSettings = async () => {
    const response = await settingsAPI.getNotificationSettings()
    if (response?.success) {
      const settings = normalizeNotificationSettings(response.data || {})
      cacheNotificationSettings(getUserId(), settings)
      return settings
    }
    throw new Error(response?.error || '声音设置加载失败')
  }

  const saveSoundSettings = async (settings) => {
    const normalized = normalizeNotificationSettings(settings)
    const response = await settingsAPI.updateNotificationSettings(normalized)
    if (response?.success) {
      const saved = normalizeNotificationSettings(response.data || normalized)
      cacheNotificationSettings(getUserId(), saved)
      return saved
    }
    throw new Error(response?.error || '声音设置保存失败')
  }

  return {
    playWorkbenchSound,
    previewWorkbenchSound,
    loadSoundSettings,
    saveSoundSettings
  }
}
