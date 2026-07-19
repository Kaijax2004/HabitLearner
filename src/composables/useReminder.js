import { computed, ref } from 'vue'
import { useHabitStore } from '@/stores/habit'
import { useAuthStore } from '@/stores/auth'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'
import { formatLocalDateKey } from '@/utils/date.js'
import audioManager from '@/utils/audioManager.js'
import {
  NOTIFICATION_SETTINGS_UPDATED_EVENT,
  readNotificationSettings,
  isWithinQuietHours,
  requestNotificationPermission
} from '@/utils/notificationSettings.js'

const deliveredReminderMap = ref(new Map())
const reminderQueue = ref([])
const activeReminder = ref(null)
const isReminderActive = ref(false)
const browserNotificationPermission = ref(
  typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported'
)

let reminderInterval = null
let settingsListenerBound = false
const preciseReminderTimeouts = new Map()
const snoozeTimeouts = new Map()

const getTodayKey = (date = new Date()) => formatLocalDateKey(date)
const getReminderKey = (habitId, reminderSlot = 'default', dateKey = getTodayKey()) => `${habitId}-${reminderSlot}-${dateKey}`

const normalizeHabitReminderTimes = (habit) => {
  let reminderTimes = []

  if (Array.isArray(habit?.reminderTimes)) {
    reminderTimes = habit.reminderTimes
  } else if (typeof habit?.reminderTimes === 'string' && habit.reminderTimes.trim()) {
    try {
      const parsed = JSON.parse(habit.reminderTimes)
      reminderTimes = Array.isArray(parsed) ? parsed : [habit.reminderTimes]
    } catch {
      reminderTimes = habit.reminderTimes.split(',')
    }
  } else if (typeof habit?.reminderTime === 'string' && habit.reminderTime.trim()) {
    reminderTimes = [habit.reminderTime]
  }

  return [...new Set(reminderTimes
    .map(time => (typeof time === 'string' ? time.trim() : ''))
    .filter(time => /^\d{2}:\d{2}$/.test(time))
  )].sort()
}

const normalizeHabitReminderTime = (habit) => normalizeHabitReminderTimes(habit)[0] || ''

const getTodayProgress = (habit) => {
  if (!habit?.checkIns || !Array.isArray(habit.checkIns)) return 0
  const today = getTodayKey()
  const todayCheckIn = habit.checkIns.find(checkIn => checkIn.date === today)
  return Number(todayCheckIn?.count || 0)
}

const getCurrentPeriodProgress = (habit) => {
  if (!habit) return 0
  if (habit.frequency === 'daily') return getTodayProgress(habit)

  if (!habit?.checkIns || !Array.isArray(habit.checkIns)) return 0
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() - now.getDay() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return habit.checkIns
    .filter(checkIn => {
      const checkInDate = new Date(checkIn.date)
      return checkInDate >= startOfWeek && checkInDate <= endOfWeek
    })
    .reduce((total, checkIn) => total + Number(checkIn.count || 0), 0)
}

const isHabitCompletedForPeriod = (habit) => {
  const target = Number(habit?.target) || 1
  return getCurrentPeriodProgress(habit) >= target
}

const createReminderPayload = (habit, options = {}) => ({
  id: `${habit.id}-${options.reminderSlot || 'default'}-${Date.now()}`,
  habit,
  reminderTime: options.reminderTime || normalizeHabitReminderTime(habit),
  reminderSlot: options.reminderSlot || options.reminderTime || 'default',
  source: options.source || 'schedule',
  createdAt: new Date().toISOString()
})

export function useReminder() {
  const habitStore = useHabitStore()
  const authStore = useAuthStore()

  const getCurrentSettings = () => readNotificationSettings(authStore.user?.id)

  const syncPermissionState = () => {
    browserNotificationPermission.value =
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported'
  }

  const shouldAllowReminderNow = () => {
    const settings = getCurrentSettings()
    if (!authStore.isAuthenticated) return false
    if (!settings.habitReminders) return false
    if (isWithinQuietHours(settings)) return false
    return true
  }

  const hasReminderBeenDeliveredToday = (habitId, reminderSlot = 'default') => (
    deliveredReminderMap.value.has(getReminderKey(habitId, reminderSlot))
  )

  const markReminderDelivered = (habitId, reminderSlot = 'default') => {
    deliveredReminderMap.value.set(getReminderKey(habitId, reminderSlot), true)
  }

  const getNotificationIcon = (icon) => {
    if (isRenderableMediaUrl(icon)) return resolveMediaUrl(icon)
    return '/favicon.ico'
  }

  const showBrowserNotification = async (payload) => {
    const settings = getCurrentSettings()
    if (!settings.pushNotifications) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (isWithinQuietHours(settings)) return

    let permission = Notification.permission
    if (permission === 'default') {
      permission = await requestNotificationPermission()
      syncPermissionState()
    }

    if (permission !== 'granted') return

    const notification = new Notification(`习惯提醒 - ${payload.habit.name}`, {
      body: payload.source === 'snooze'
        ? '稍后提醒时间到了，继续完成这个习惯。'
        : '到时间了，记得完成今天这一项。',
      icon: getNotificationIcon(payload.habit.icon),
      tag: `habit-${payload.habit.id}-${payload.reminderSlot || 'default'}`,
      requireInteraction: true
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  const openReminder = (payload) => {
    activeReminder.value = payload
    isReminderActive.value = true
    audioManager.playNotificationSound()
    void showBrowserNotification(payload)
  }

  const processNextReminder = () => {
    if (reminderQueue.value.length === 0) return
    const nextReminder = reminderQueue.value.shift()
    if (!nextReminder) return
    window.setTimeout(() => openReminder(nextReminder), 250)
  }

  const finishCurrentReminder = () => {
    activeReminder.value = null
    isReminderActive.value = false
    processNextReminder()
  }

  const queueReminder = (habit, options = {}) => {
    if (!habit || !shouldAllowReminderNow()) return

    const currentHabit = habitStore.getHabitById(habit.id) || habit
    if (isHabitCompletedForPeriod(currentHabit)) return

    const reminderSlot = options.reminderSlot || options.reminderTime || 'default'
    const reminderKey = getReminderKey(currentHabit.id, reminderSlot)
    const queuedAlready = reminderQueue.value.some(item => item.reminderKey === reminderKey)
    const activeSame = activeReminder.value?.reminderKey === reminderKey

    if (queuedAlready || activeSame) return

    const payload = createReminderPayload(currentHabit, { ...options, reminderSlot })
    payload.reminderKey = reminderKey
    markReminderDelivered(currentHabit.id, reminderSlot)

    if (isReminderActive.value) {
      reminderQueue.value.push(payload)
      return
    }

    openReminder(payload)
  }

  const handleReminderComplete = async (payload = activeReminder.value) => {
    if (!payload?.habit) {
      finishCurrentReminder()
      return
    }

    const currentHabit = habitStore.getHabitById(payload.habit.id) || payload.habit
    if (!currentHabit || isHabitCompletedForPeriod(currentHabit)) {
      finishCurrentReminder()
      return
    }

    audioManager.playSuccessSound()

    try {
      await habitStore.completeHabit(currentHabit.id, payload.comment || null)
    } catch (error) {
      console.error('Reminder completion failed:', error)
    } finally {
      finishCurrentReminder()
    }
  }

  const handleReminderSnooze = (payload = activeReminder.value) => {
    if (!payload?.habit) {
      finishCurrentReminder()
      return
    }

    audioManager.playSnoozeSound()

    const reminderSlot = payload.reminderSlot || payload.reminderTime || 'default'
    const reminderKey = getReminderKey(payload.habit.id, reminderSlot)

    if (snoozeTimeouts.has(reminderKey)) {
      clearTimeout(snoozeTimeouts.get(reminderKey))
    }

    const timeoutId = window.setTimeout(() => {
      snoozeTimeouts.delete(reminderKey)
      deliveredReminderMap.value.delete(reminderKey)
      queueReminder(payload.habit, {
        source: 'snooze',
        reminderTime: '稍后提醒',
        reminderSlot
      })
    }, 5 * 60 * 1000)

    snoozeTimeouts.set(reminderKey, timeoutId)
    finishCurrentReminder()
  }

  const handleReminderDismiss = () => {
    audioManager.playDismissSound()
    finishCurrentReminder()
  }

  const checkReminders = () => {
    if (!shouldAllowReminderNow()) return

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    habitStore.habits.forEach(habit => {
      if (!habit?.reminderEnabled) return
      if (isHabitCompletedForPeriod(habit)) return

      normalizeHabitReminderTimes(habit).forEach(reminderTime => {
        if (reminderTime !== currentTime) return
        if (hasReminderBeenDeliveredToday(habit.id, reminderTime)) return
        queueReminder(habit, { source: 'schedule', reminderTime, reminderSlot: reminderTime })
      })
    })
  }

  const clearTimeoutMap = (timeoutMap) => {
    timeoutMap.forEach(timeoutId => clearTimeout(timeoutId))
    timeoutMap.clear()
  }

  const schedulePreciseReminderForTime = (habit, reminderTime) => {
    if (!habit?.reminderEnabled || !reminderTime) return
    if (isHabitCompletedForPeriod(habit)) return

    const [hour, minute] = reminderTime.split(':').map(Number)
    const now = new Date()
    const targetTime = new Date(now)
    targetTime.setHours(hour, minute, 0, 0)

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1)
    }

    const timeoutKey = `${habit.id}-${reminderTime}`
    const delay = targetTime.getTime() - now.getTime()
    const timeoutId = window.setTimeout(() => {
      preciseReminderTimeouts.delete(timeoutKey)
      deliveredReminderMap.value.delete(getReminderKey(habit.id, reminderTime, getTodayKey(targetTime)))
      queueReminder(habit, { source: 'schedule', reminderTime, reminderSlot: reminderTime })
      schedulePreciseReminderForTime(habit, reminderTime)
    }, delay)

    preciseReminderTimeouts.set(timeoutKey, timeoutId)
  }

  const clearAllPreciseReminders = () => clearTimeoutMap(preciseReminderTimeouts)
  const clearAllSnoozes = () => clearTimeoutMap(snoozeTimeouts)

  const rescheduleReminders = () => {
    clearAllPreciseReminders()
    if (!authStore.isAuthenticated) return
    habitStore.habits.forEach(habit => {
      normalizeHabitReminderTimes(habit).forEach(reminderTime => {
        schedulePreciseReminderForTime(habit, reminderTime)
      })
    })
  }

  const handleSettingsChanged = () => {
    syncPermissionState()
    rescheduleReminders()
  }

  const bindSettingsListener = () => {
    if (settingsListenerBound || typeof window === 'undefined') return
    window.addEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, handleSettingsChanged)
    settingsListenerBound = true
  }

  const unbindSettingsListener = () => {
    if (!settingsListenerBound || typeof window === 'undefined') return
    window.removeEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, handleSettingsChanged)
    settingsListenerBound = false
  }

  const clearTodayReminders = () => {
    const today = getTodayKey()
    for (const key of deliveredReminderMap.value.keys()) {
      if (!key.endsWith(today)) {
        deliveredReminderMap.value.delete(key)
      }
    }
  }

  const startReminderCheck = async () => {
    syncPermissionState()

    if (reminderInterval) {
      clearInterval(reminderInterval)
      reminderInterval = null
    }

    clearTodayReminders()
    bindSettingsListener()

    if (!authStore.isAuthenticated) return

    rescheduleReminders()
    checkReminders()

    reminderInterval = window.setInterval(() => {
      clearTodayReminders()
      checkReminders()
    }, 30 * 1000)
  }

  const stopReminderCheck = () => {
    if (reminderInterval) {
      clearInterval(reminderInterval)
      reminderInterval = null
    }

    clearAllPreciseReminders()
    clearAllSnoozes()
    unbindSettingsListener()
    deliveredReminderMap.value.clear()
    reminderQueue.value = []
    activeReminder.value = null
    isReminderActive.value = false
  }

  const triggerReminder = (habit, options = {}) => {
    queueReminder(habit, { source: 'manual', ...options })
  }

  return {
    activeReminder: computed(() => activeReminder.value),
    activeReminders: computed(() => deliveredReminderMap.value),
    reminderQueue: computed(() => reminderQueue.value),
    isReminderActive: computed(() => isReminderActive.value),
    browserNotificationPermission: computed(() => browserNotificationPermission.value),
    checkReminders,
    showReminder: triggerReminder,
    startReminderCheck,
    stopReminderCheck,
    triggerReminder,
    clearTodayReminders,
    rescheduleReminders,
    handleReminderComplete,
    handleReminderSnooze,
    handleReminderDismiss,
    requestBrowserNotificationPermission: requestNotificationPermission
  }
}
