import { ref } from 'vue'

export function useEditorPersistence() {
  const pending = ref(new Set())
  const timers = new Map()

  const clearTimer = (key) => {
    const timer = timers.get(key)
    if (timer) window.clearTimeout(timer)
    timers.delete(key)
  }

  const schedule = (key, save, delay = 350) => {
    clearTimer(key)
    pending.value = new Set(pending.value).add(key)
    const timer = window.setTimeout(async () => {
      timers.delete(key)
      try {
        await save()
        const next = new Set(pending.value)
        next.delete(key)
        pending.value = next
      } catch (_error) {
        // Caller owns the visible error state; the key stays pending for retry.
      }
    }, delay)
    timers.set(key, timer)
  }

  const clear = (key) => {
    clearTimer(key)
    const next = new Set(pending.value)
    next.delete(key)
    pending.value = next
  }

  const clearAll = () => {
    timers.forEach((timer) => window.clearTimeout(timer))
    timers.clear()
    pending.value = new Set()
  }

  return {
    pending,
    schedule,
    clear,
    clearAll
  }
}
