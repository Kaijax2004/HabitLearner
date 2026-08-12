import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const storage = typeof window !== 'undefined'
  ? window.localStorage
  : {
      _data: {},
      getItem(key) { return this._data[key] || null },
      setItem(key, value) { this._data[key] = String(value) },
      removeItem(key) { delete this._data[key] }
    }

const STORAGE_KEY = 'workspaceAiProviderId'

const readSelectedProviderId = () => storage.getItem(STORAGE_KEY) || ''

export const useWorkspaceAiStore = defineStore('workspaceAi', () => {
  const selectedProviderId = ref(readSelectedProviderId())
  const hasExplicitSelection = computed(() => Boolean(selectedProviderId.value))
  const normalizedSelectedProviderId = computed(() => selectedProviderId.value || '')

  const setSelectedProviderId = (providerId) => {
    selectedProviderId.value = String(providerId || '')
    if (selectedProviderId.value) storage.setItem(STORAGE_KEY, selectedProviderId.value)
    else storage.removeItem(STORAGE_KEY)
  }

  const clearSelectedProviderId = () => {
    selectedProviderId.value = ''
    storage.removeItem(STORAGE_KEY)
  }

  return {
    selectedProviderId,
    hasExplicitSelection,
    normalizedSelectedProviderId,
    setSelectedProviderId,
    clearSelectedProviderId
  }
})
