export const NOTIFICATION_SETTINGS_UPDATED_EVENT = 'habit-notification-settings-updated'

export const DEFAULT_NOTIFICATION_SETTINGS = {
  pushNotifications: true,
  emailNotifications: false,
  habitReminders: true,
  planReminders: true,
  learningReminders: true,
  weeklyReports: true,
  quietHours: false,
  quietStartTime: '22:00',
  quietEndTime: '08:00',
  reminderTime: '09:00',
  reminderDays: [1, 2, 3, 4, 5, 6, 7],
  soundEnabled: true,
  soundVolume: 36,
  soundTheme: 'atelier',
  soundEvents: {
    notification: 'atelier_chime',
    dismiss: 'soft_tap',
    complete: 'warm_resolve',
    focus_start: 'deep_start',
    error: 'low_notice',
    focus_end: 'clear_finish',
    snooze: 'quiet_snooze'
  }
}

export const SOUND_EVENT_OPTIONS = [
  { key: 'notification', label: '通知音效', description: '应用提醒弹出时播放。' },
  { key: 'dismiss', label: '忽略音效', description: '忽略提醒或取消轻操作时播放。' },
  { key: 'complete', label: '完成音效', description: '完成习惯、计划或提醒时播放。' },
  { key: 'focus_start', label: '专注开始', description: '番茄钟开始或继续专注时播放。' },
  { key: 'error', label: '错误音效', description: '保存失败或接口错误时播放。' },
  { key: 'focus_end', label: '专注结束', description: '番茄钟完成或阶段结束时播放。' },
  { key: 'snooze', label: '稍后提醒', description: '提醒被延后时播放。' }
]

export const SOUND_PRESET_OPTIONS = [
  { id: 'none', label: '关闭', description: '这个事件不播放声音。' },
  { id: 'atelier_chime', label: 'Atelier Chime', description: '温和三音提示，适合普通通知。' },
  { id: 'warm_resolve', label: 'Warm Resolve', description: '柔和完成音，适合打卡和完成。' },
  { id: 'deep_start', label: 'Deep Start', description: '低频进入感，适合专注开始。' },
  { id: 'clear_finish', label: 'Clear Finish', description: '清亮收尾，适合专注结束。' },
  { id: 'quiet_snooze', label: 'Quiet Snooze', description: '轻缓两音，适合稍后提醒。' },
  { id: 'soft_tap', label: 'Soft Tap', description: '很短的轻触反馈，适合忽略。' },
  { id: 'low_notice', label: 'Low Notice', description: '克制错误提示，不刺耳。' }
]

export const normalizeSoundEvents = (events = {}) => {
  const source = events && typeof events === 'object' && !Array.isArray(events) ? events : {}
  return Object.keys(DEFAULT_NOTIFICATION_SETTINGS.soundEvents).reduce((result, key) => {
    const value = typeof source[key] === 'string' && source[key].trim()
      ? source[key].trim()
      : DEFAULT_NOTIFICATION_SETTINGS.soundEvents[key]
    result[key] = value
    return result
  }, {})
}

const clampNumber = (value, min, max, fallback) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), min), max)
}

export const getNotificationSettingsStorageKey = (userId) => (
  userId ? `notificationSettings_${userId}` : 'notificationSettings'
)

export const normalizeNotificationSettings = (settings = {}) => ({
  ...DEFAULT_NOTIFICATION_SETTINGS,
  ...settings,
  pushNotifications: settings.pushNotifications ?? DEFAULT_NOTIFICATION_SETTINGS.pushNotifications,
  emailNotifications: settings.emailNotifications ?? DEFAULT_NOTIFICATION_SETTINGS.emailNotifications,
  habitReminders: settings.habitReminders ?? settings.habitsReminder ?? DEFAULT_NOTIFICATION_SETTINGS.habitReminders,
  planReminders: settings.planReminders ?? settings.plansReminder ?? DEFAULT_NOTIFICATION_SETTINGS.planReminders,
  learningReminders: settings.learningReminders ?? DEFAULT_NOTIFICATION_SETTINGS.learningReminders,
  weeklyReports: settings.weeklyReports ?? DEFAULT_NOTIFICATION_SETTINGS.weeklyReports,
  quietHours: settings.quietHours ?? DEFAULT_NOTIFICATION_SETTINGS.quietHours,
  quietStartTime: settings.quietStartTime || DEFAULT_NOTIFICATION_SETTINGS.quietStartTime,
  quietEndTime: settings.quietEndTime || DEFAULT_NOTIFICATION_SETTINGS.quietEndTime,
  reminderTime: settings.reminderTime || DEFAULT_NOTIFICATION_SETTINGS.reminderTime,
  reminderDays: Array.isArray(settings.reminderDays)
    ? settings.reminderDays
    : DEFAULT_NOTIFICATION_SETTINGS.reminderDays,
  soundEnabled: settings.soundEnabled ?? DEFAULT_NOTIFICATION_SETTINGS.soundEnabled,
  soundVolume: clampNumber(settings.soundVolume, 0, 100, DEFAULT_NOTIFICATION_SETTINGS.soundVolume),
  soundTheme: settings.soundTheme || DEFAULT_NOTIFICATION_SETTINGS.soundTheme,
  soundEvents: normalizeSoundEvents(settings.soundEvents)
})

export const readNotificationSettings = (userId) => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_NOTIFICATION_SETTINGS }
  }

  try {
    const raw = window.localStorage.getItem(getNotificationSettingsStorageKey(userId))
    if (!raw) return { ...DEFAULT_NOTIFICATION_SETTINGS }
    return normalizeNotificationSettings(JSON.parse(raw))
  } catch (error) {
    console.warn('Failed to read notification settings cache:', error)
    return { ...DEFAULT_NOTIFICATION_SETTINGS }
  }
}

export const cacheNotificationSettings = (userId, settings) => {
  if (typeof window === 'undefined') return normalizeNotificationSettings(settings)

  const normalized = normalizeNotificationSettings(settings)
  window.localStorage.setItem(
    getNotificationSettingsStorageKey(userId),
    JSON.stringify(normalized)
  )

  window.dispatchEvent(new CustomEvent(NOTIFICATION_SETTINGS_UPDATED_EVENT, {
    detail: { userId, settings: normalized }
  }))

  return normalized
}

const toMinutes = (time) => {
  if (typeof time !== 'string' || !time.includes(':')) return null
  const [hour, minute] = time.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  return hour * 60 + minute
}

export const isWithinQuietHours = (settings, date = new Date()) => {
  const normalized = normalizeNotificationSettings(settings)
  if (!normalized.quietHours) return false

  const startMinutes = toMinutes(normalized.quietStartTime)
  const endMinutes = toMinutes(normalized.quietEndTime)
  if (startMinutes === null || endMinutes === null) return false

  const nowMinutes = date.getHours() * 60 + date.getMinutes()
  if (startMinutes === endMinutes) return true

  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}
