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
  reminderDays: [1, 2, 3, 4, 5, 6, 7]
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
    : DEFAULT_NOTIFICATION_SETTINGS.reminderDays
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
