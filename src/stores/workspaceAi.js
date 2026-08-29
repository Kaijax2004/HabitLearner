import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { listAiProviderModels, listAiProviders } from '@/api/workspace'

const storage = typeof window !== 'undefined'
  ? window.localStorage
  : {
      _data: {},
      getItem(key) { return this._data[key] || null },
      setItem(key, value) { this._data[key] = String(value) },
      removeItem(key) { delete this._data[key] }
    }

const PROVIDER_KEY = 'workspaceAiProviderId'
const MODEL_KEY = 'workspaceAiSelectedModel'
const MODEL_OPTIONS_KEY = 'workspaceAiModelOptions'
const MODEL_PROVIDER_KEY = 'workspaceAiModelProviderId'

const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(storage.getItem(key) || '')
    return value ?? fallback
  } catch {
    return fallback
  }
}

const normalizeOptions = (items = []) => items.map((item) => {
  const id = String(item?.id || item?.value || item?.name || '').trim()
  return id ? { id, value: id, label: String(item?.name || item?.label || id).trim() } : null
}).filter(Boolean)

export const useWorkspaceAiStore = defineStore('workspaceAi', () => {
  const selectedProviderId = ref(storage.getItem(PROVIDER_KEY) || '')
  const selectedModel = ref(storage.getItem(MODEL_KEY) || '')
  const modelOptions = ref(normalizeOptions(readJson(MODEL_OPTIONS_KEY, [])))
  const modelProviderId = ref(storage.getItem(MODEL_PROVIDER_KEY) || '')
  const modelsLoading = ref(false)
  const modelsError = ref('')

  const hasExplicitSelection = computed(() => Boolean(selectedProviderId.value))
  const normalizedSelectedProviderId = computed(() => selectedProviderId.value || '')
  const normalizedSelectedModel = computed(() => selectedModel.value || '')

  const setSelectedProviderId = (providerId) => {
    selectedProviderId.value = String(providerId || '')
    if (selectedProviderId.value) storage.setItem(PROVIDER_KEY, selectedProviderId.value)
    else storage.removeItem(PROVIDER_KEY)
  }

  const clearSelectedProviderId = () => setSelectedProviderId('')

  const setSelectedModel = (model) => {
    selectedModel.value = String(model || '')
    if (selectedModel.value) storage.setItem(MODEL_KEY, selectedModel.value)
    else storage.removeItem(MODEL_KEY)
  }

  const setModelOptions = (options = [], providerId = '') => {
    modelOptions.value = normalizeOptions(options)
    modelProviderId.value = String(providerId || '')
    storage.setItem(MODEL_OPTIONS_KEY, JSON.stringify(modelOptions.value))
    if (modelProviderId.value) storage.setItem(MODEL_PROVIDER_KEY, modelProviderId.value)
    else storage.removeItem(MODEL_PROVIDER_KEY)

    if (!modelOptions.value.some((item) => item.id === selectedModel.value)) {
      setSelectedModel(modelOptions.value[0]?.id || '')
    }
  }

  const loadModelOptions = async ({ force = false, providerId = null } = {}) => {
    const requestedProviderId = String(providerId || normalizedSelectedProviderId.value || '')
    if (
      !force
      && modelOptions.value.length
      && (!requestedProviderId || requestedProviderId === modelProviderId.value)
    ) {
      return modelOptions.value
    }
    if (modelsLoading.value) return modelOptions.value

    modelsLoading.value = true
    modelsError.value = ''
    try {
      const providersResponse = await listAiProviders()
      if (!providersResponse?.success) throw new Error(providersResponse?.error || 'Mentor-X 模型引擎配置读取失败')
      const providers = Array.isArray(providersResponse.data?.providers) ? providersResponse.data.providers : []
      const provider = requestedProviderId
        ? providers.find((item) => String(item.id) === requestedProviderId && item.status === 'active')
        : providers.find((item) => item.is_default && item.status === 'active')
          || providers.find((item) => item.status === 'active')
      if (!provider?.id) throw new Error('尚未配置 Mentor-X 的模型引擎')

      const response = await listAiProviderModels({ id: provider.id })
      if (!response?.success) throw new Error(response?.error || '模型列表获取失败')
      const options = normalizeOptions(response.data?.models)
      setModelOptions(options, provider.id)
      return options
    } catch (error) {
      modelsError.value = error.message || '模型列表获取失败'
      throw error
    } finally {
      modelsLoading.value = false
    }
  }

  return {
    selectedProviderId,
    hasExplicitSelection,
    normalizedSelectedProviderId,
    selectedModel,
    normalizedSelectedModel,
    modelOptions,
    modelProviderId,
    modelsLoading,
    modelsError,
    setSelectedProviderId,
    clearSelectedProviderId,
    setSelectedModel,
    setModelOptions,
    loadModelOptions
  }
})