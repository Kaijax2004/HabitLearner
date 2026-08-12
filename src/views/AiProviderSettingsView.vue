<template>
  <AppLayout title="AI 供应商配置" show-back-button>
    <div class="ai-provider-page">
      <section class="provider-hero">
        <div class="hero-copy">
          <p class="eyebrow">AI Provider Console</p>
          <h1>把 AI 能力接到你自己的供应商</h1>
          <p>
            HabitLearner 默认不内置 AI Key。你可以接入官方 API，也可以接入 OpenAI 兼容的中转 API。
            Key 会加密存储在服务器，请确认你信任当前部署环境。
          </p>
        </div>
        <div class="hero-status-card">
          <span :class="['status-pill', aiProviderStatus === 'configured' ? 'success' : 'warning']">
            {{ aiProviderStatus === 'configured' ? '已配置' : '尚未配置' }}
          </span>
          <strong>{{ aiDefaultProvider?.name || '没有默认供应商' }}</strong>
          <small>
            {{ aiDefaultProvider ? `${getProtocolLabel(aiDefaultProvider.protocol)} · ${aiDefaultProvider.model}` : '配置默认供应商后，习知助手与计划页 AI 才会发起请求。' }}
          </small>
        </div>
      </section>

      <section class="provider-grid">
        <article class="provider-card form-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">01 Setup</p>
              <h2>{{ aiProviderForm.id ? '编辑供应商' : '新增供应商' }}</h2>
              <p>建议先选择协议，再填写 Base URL、Key 和模型名。多数中转 API 使用 Chat Completions。</p>
            </div>
            <button type="button" class="ghost-button" @click="resetAiProviderForm">新建配置</button>
          </div>

          <div class="form-section">
            <label class="field full">
              <span>配置名称</span>
              <input v-model.trim="aiProviderForm.name" class="input-apple" placeholder="例如：OpenAI 官方 / 我的中转 API" />
            </label>

            <label class="field">
              <span>接入方式</span>
              <select v-model="aiProviderForm.accessMode" class="input-apple" @change="applyAiAccessModeDefaults">
                <option value="official_api">官方 API</option>
                <option value="pure_api">纯 API / 中转 API</option>
              </select>
            </label>

            <label class="field">
              <span>上游协议</span>
              <select v-model="aiProviderForm.protocol" class="input-apple" @change="applyAiProtocolDefaults">
                <option value="openai_responses">Responses API</option>
                <option value="openai_chat">Chat Completions</option>
              </select>
            </label>

            <label class="field full">
              <span>Base URL</span>
              <input v-model.trim="aiProviderForm.base_url" class="input-apple" placeholder="https://api.openai.com/v1 或 https://你的中转域名/v1" />
              <small>只填到 `/v1` 最稳。如果填到 `/chat/completions` 或 `/responses`，后端会自动修正。</small>
            </label>

            <label class="field full">
              <span>API Key</span>
              <input
                v-model.trim="aiProviderForm.apiKey"
                type="password"
                class="input-apple"
                :placeholder="aiProviderForm.id ? '留空则沿用已保存 Key' : '请输入 API Key'"
              />
            </label>
          </div>

          <div class="form-section model-section">
            <div class="section-title">
              <div>
                <p class="eyebrow">02 Model</p>
                <h3>模型选择</h3>
              </div>
              <button type="button" class="ghost-button" :disabled="isLoadingAiModels" @click="refreshAiProviderModels">
                {{ isLoadingAiModels ? '读取中...' : '从上游读取模型' }}
              </button>
            </div>

            <label class="field full">
              <span>模型名</span>
              <input
                v-model.trim="aiProviderForm.model"
                class="input-apple"
                list="ai-provider-models"
                placeholder="可手动输入，例如 gpt-4o-mini / deepseek-chat / qwen-plus"
              />
              <datalist id="ai-provider-models">
                <option v-for="model in aiProviderModelOptions" :key="model.id" :value="model.id">
                  {{ model.name || model.id }}
                </option>
              </datalist>
              <small>{{ aiProviderModelHint }}</small>
            </label>

            <div class="model-meta">
              <div>
                <span>上游模型</span>
                <strong>{{ aiProviderModels.length }}</strong>
              </div>
              <div>
                <span>当前模型</span>
                <strong>{{ aiProviderForm.model || '未填写' }}</strong>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="field">
              <span>请求超时</span>
              <input v-model.number="aiProviderForm.timeoutMs" type="number" min="3000" step="1000" class="input-apple" />
              <small>单位毫秒，建议 15000 到 30000。</small>
            </label>

            <label class="check-card">
              <input v-model="aiProviderForm.is_default" type="checkbox" />
              <span>
                <strong>设为默认 AI 供应商</strong>
                <small>默认供应商会被计划页 AI、今日页 AI 和习知助手优先使用。</small>
              </span>
            </label>
          </div>

          <div class="action-row">
            <button type="button" class="primary-button" :disabled="isSavingAiProvider" @click="saveAiProviderConfig">
              {{ isSavingAiProvider ? '保存中...' : '保存供应商' }}
            </button>
            <button type="button" class="secondary-button" :disabled="!aiProviderForm.id || isTestingAiProvider" @click="testAiProviderConfig(aiProviderForm.id)">
              {{ isTestingAiProvider ? '测试中...' : '测试连接' }}
            </button>
          </div>
        </article>

        <aside class="provider-card list-card">
          <div class="card-head compact">
            <div>
              <p class="eyebrow">02 Providers</p>
              <h2>已保存供应商</h2>
              <p>连接失败时优先检查协议、Base URL、模型名和 Key 权限。</p>
            </div>
            <button type="button" class="ghost-button" :disabled="isLoadingAiProviders" @click="loadAiProviders">
              {{ isLoadingAiProviders ? '刷新中...' : '刷新' }}
            </button>
          </div>

          <div v-if="aiProviders.length" class="provider-list">
            <article
              v-for="provider in aiProviders"
              :key="provider.id"
              :class="['provider-item', { active: provider.is_default }]"
            >
              <div class="provider-info">
                <div class="provider-title">
                  <h3>{{ provider.name }}</h3>
                  <span v-if="provider.is_default" class="status-pill success">默认</span>
                  <span :class="['status-pill', provider.status === 'active' ? 'success' : 'muted']">
                    {{ provider.status === 'active' ? '启用' : '停用' }}
                  </span>
                </div>
                <p>{{ getAccessModeLabel(provider.accessMode) }} · {{ getProtocolLabel(provider.protocol) }}</p>
                <p class="mono-line">{{ provider.model }}</p>
                <p class="mono-line">{{ provider.base_url }}</p>
                <p v-if="provider.last_tested_at" class="test-line">
                  最近测试：{{ formatDateTime(provider.last_tested_at) }}
                  <span v-if="provider.last_error"> · {{ provider.last_error }}</span>
                </p>
              </div>
              <div class="provider-actions">
                <button type="button" class="ghost-button" @click="editAiProvider(provider)">编辑</button>
                <button type="button" class="ghost-button" :disabled="isTestingAiProvider" @click="testAiProviderConfig(provider.id)">测试</button>
                <button type="button" class="ghost-button danger" @click="disableAiProvider(provider)">停用</button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <strong>尚未配置 AI 能力</strong>
            <p>先新增一个供应商，保存为默认后再回到 AI 功能入口测试。</p>
          </div>

          <div v-if="lastDebugInfo" class="debug-card">
            <p class="eyebrow">Debug</p>
            <strong>最近一次请求路径</strong>
            <span>{{ lastDebugInfo }}</span>
          </div>
        </aside>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import {
  deleteAiProvider,
  listAiProviderModels,
  listAiProviders,
  saveAiProvider,
  testAiProvider,
  updateAiProvider
} from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'
import { useWorkspaceAiStore } from '@/stores/workspaceAi.js'

const workspaceAiStore = useWorkspaceAiStore()
const { success, error: showError, warning } = useToast()

const isLoadingAiProviders = ref(false)
const isSavingAiProvider = ref(false)
const isTestingAiProvider = ref(false)
const isLoadingAiModels = ref(false)

const aiProviders = ref([])
const aiProviderCatalog = ref({})
const aiProviderStatus = ref('not_configured')
const aiProviderModels = ref([])
const lastDebugInfo = ref('')
const aiProviderForm = ref({
  id: null,
  name: '',
  accessMode: 'official_api',
  protocol: 'openai_responses',
  base_url: 'https://api.openai.com/v1',
  model: '',
  timeoutMs: 15000,
  apiKey: '',
  is_default: true
})

const aiDefaultProvider = computed(() => (
  aiProviders.value.find((provider) => provider.is_default && provider.status === 'active') || null
))

const aiProviderModelOptions = computed(() => {
  const map = new Map()
  const currentModel = String(aiProviderForm.value.model || '').trim()
  if (currentModel) map.set(currentModel, { id: currentModel, name: currentModel })

  aiProviderModels.value.forEach((model) => {
    const id = String(model?.id || '').trim()
    if (!id) return
    map.set(id, {
      id,
      name: model.name || id,
      owned_by: model.owned_by || ''
    })
  })

  return Array.from(map.values())
})

const aiProviderModelHint = computed(() => {
  if (isLoadingAiModels.value) return '正在向上游 /models 接口读取模型。'
  if (aiProviderModels.value.length) return `已读取 ${aiProviderModels.value.length} 个模型，也可以继续手动输入模型名。`
  return '如果上游不支持 /models，可以直接手动填写模型名后保存并测试。'
})

const getProtocolLabel = (protocol) => (
  protocol === 'openai_responses' ? 'Responses API' : 'Chat Completions'
)

const getAccessModeLabel = (accessMode) => (
  accessMode === 'official_api' ? '官方 API' : '纯 API / 中转 API'
)

const formatDateTime = (value) => {
  if (!value) return '未记录'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '未记录' : date.toLocaleString('zh-CN')
}

const resetAiProviderForm = () => {
  aiProviderModels.value = []
  lastDebugInfo.value = ''
  aiProviderForm.value = {
    id: null,
    name: '',
    accessMode: 'official_api',
    protocol: 'openai_responses',
    base_url: aiProviderCatalog.value.defaults?.officialBaseUrl || 'https://api.openai.com/v1',
    model: '',
    timeoutMs: 15000,
    apiKey: '',
    is_default: aiProviders.value.length === 0
  }
}

const applyAiAccessModeDefaults = () => {
  aiProviderModels.value = []
  aiProviderForm.value.model = ''

  if (aiProviderForm.value.accessMode === 'official_api') {
    aiProviderForm.value.base_url = aiProviderCatalog.value.defaults?.officialBaseUrl || 'https://api.openai.com/v1'
    return
  }

  if (!aiProviderForm.value.id && aiProviderForm.value.base_url === 'https://api.openai.com/v1') {
    aiProviderForm.value.base_url = ''
  }
}

const applyAiProtocolDefaults = () => {
  aiProviderModels.value = []
  if (!aiProviderForm.value.id) aiProviderForm.value.model = ''
}

const buildAiProviderDraftPayload = () => ({
  id: aiProviderForm.value.id || undefined,
  name: aiProviderForm.value.name || undefined,
  accessMode: aiProviderForm.value.accessMode,
  protocol: aiProviderForm.value.protocol,
  base_url: aiProviderForm.value.base_url,
  model: aiProviderForm.value.model || undefined,
  apiKey: aiProviderForm.value.apiKey || undefined,
  config: {
    timeoutMs: Number(aiProviderForm.value.timeoutMs || 15000)
  }
})

const getErrorDescription = (err, fallback) => {
  const debug = err?.details?.data
  if (debug?.requestUrl) {
    lastDebugInfo.value = `${debug.protocol || ''} · ${debug.requestUrl} · ${debug.model || ''}`
  }
  return err?.error || err?.message || fallback
}

const loadAiProviders = async () => {
  isLoadingAiProviders.value = true
  try {
    const response = await listAiProviders()
    const payload = response?.data || {}
    aiProviders.value = Array.isArray(payload.providers) ? payload.providers : []
    aiProviderCatalog.value = payload.catalog || {}
    aiProviderStatus.value = payload.status || (aiProviders.value.some((provider) => provider.is_default) ? 'configured' : 'not_configured')

    const defaultProvider = aiProviders.value.find((provider) => provider.is_default && provider.status === 'active')
    if (defaultProvider?.id) workspaceAiStore.setSelectedProviderId(defaultProvider.id)
    else workspaceAiStore.clearSelectedProviderId()
  } catch (err) {
    showError('读取 AI 配置失败', {
      description: getErrorDescription(err, '请稍后重试。')
    })
  } finally {
    isLoadingAiProviders.value = false
  }
}

const refreshAiProviderModels = async () => {
  const form = aiProviderForm.value
  if (!form.base_url) {
    warning('请先填写 Base URL')
    return
  }
  if (!form.id && !form.apiKey) {
    warning('请先填写 API Key，再读取上游模型。')
    return
  }

  isLoadingAiModels.value = true
  try {
    const response = await listAiProviderModels(buildAiProviderDraftPayload())
    if (!response?.success) {
      throw response
    }

    aiProviderModels.value = Array.isArray(response.data?.models) ? response.data.models : []
    if (!aiProviderModels.value.length) {
      warning('上游没有返回模型列表', {
        description: '这不影响使用。可以直接手动填写模型名后保存并测试。'
      })
      return
    }

    const current = String(form.model || '').trim()
    const hasCurrent = aiProviderModels.value.some((model) => model.id === current)
    if (!current || !hasCurrent) aiProviderForm.value.model = aiProviderModels.value[0].id

    success('模型列表已更新', {
      description: `已读取 ${aiProviderModels.value.length} 个模型。`
    })
  } catch (err) {
    showError('读取模型列表失败', {
      description: getErrorDescription(err, '如果供应商不支持 /models，请手动填写模型名后直接测试连接。')
    })
  } finally {
    isLoadingAiModels.value = false
  }
}

const editAiProvider = (provider) => {
  aiProviderModels.value = provider.model
    ? [{ id: provider.model, name: provider.model }]
    : []
  lastDebugInfo.value = ''
  aiProviderForm.value = {
    id: provider.id,
    name: provider.name || '',
    accessMode: provider.accessMode || 'pure_api',
    protocol: provider.protocol || 'openai_chat',
    base_url: provider.base_url || '',
    model: provider.model || '',
    timeoutMs: Number(provider.config?.timeoutMs || provider.config?.timeout_ms || 15000),
    apiKey: '',
    is_default: Boolean(provider.is_default)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const saveAiProviderConfig = async () => {
  const form = aiProviderForm.value
  if (!form.name) {
    warning('请先填写供应商名称')
    return
  }
  if (!form.base_url) {
    warning('请填写 Base URL')
    return
  }
  if (!form.model) {
    warning('请填写模型名')
    return
  }
  if (!form.id && !form.apiKey) {
    warning('新建供应商时必须填写 API Key')
    return
  }

  isSavingAiProvider.value = true
  try {
    const payload = {
      ...buildAiProviderDraftPayload(),
      name: form.name,
      model: form.model,
      is_default: Boolean(form.is_default)
    }
    const response = form.id
      ? await updateAiProvider(form.id, payload)
      : await saveAiProvider(payload)

    if (!response?.success) {
      throw response
    }

    success(form.id ? '供应商配置已更新' : '供应商配置已创建')
    await loadAiProviders()
    if (response.data?.id) editAiProvider(response.data)
    else resetAiProviderForm()
  } catch (err) {
    showError('保存 AI 供应商失败', {
      description: getErrorDescription(err, '请稍后重试。')
    })
  } finally {
    isSavingAiProvider.value = false
  }
}

const testAiProviderConfig = async (providerId) => {
  if (!providerId) {
    warning('请先保存供应商配置，再测试连接。')
    return
  }

  isTestingAiProvider.value = true
  try {
    const response = await testAiProvider(providerId)
    if (!response?.success) {
      throw response
    }
    lastDebugInfo.value = ''
    success('供应商连接正常', {
      description: response.data?.sample || '模型已返回测试内容。'
    })
    await loadAiProviders()
  } catch (err) {
    showError('供应商连接失败', {
      description: getErrorDescription(err, '请检查协议、Base URL、模型名、Key 权限和服务器网络。')
    })
  } finally {
    isTestingAiProvider.value = false
  }
}

const disableAiProvider = async (provider) => {
  if (!provider?.id || !window.confirm(`确定停用“${provider.name || '该供应商'}”吗？`)) return

  try {
    const response = await deleteAiProvider(provider.id)
    if (!response?.success) {
      throw response
    }
    success('供应商已停用')
    await loadAiProviders()
    resetAiProviderForm()
  } catch (err) {
    showError('停用 AI 供应商失败', {
      description: getErrorDescription(err, '请稍后重试。')
    })
  }
}

onMounted(async () => {
  await loadAiProviders()
  resetAiProviderForm()
})
</script>

<style scoped>
.ai-provider-page {
  display: grid;
  gap: 22px;
  padding: 2px 0 32px;
}

.provider-hero,
.provider-card {
  border: 1px solid rgba(228, 228, 231, 0.9);
  background:
    radial-gradient(circle at 86% 12%, rgba(181, 151, 88, 0.14), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(244, 244, 245, 0.84));
  box-shadow: 0 22px 70px rgba(24, 24, 27, 0.08);
}

.dark .provider-hero,
.dark .provider-card {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at 86% 12%, rgba(181, 151, 88, 0.13), transparent 30%),
    linear-gradient(135deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 0.94));
}

.provider-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: stretch;
  border-radius: 30px;
  padding: 30px;
}

.hero-copy h1,
.card-head h2,
.section-title h3 {
  margin: 6px 0 0;
  color: rgb(24, 24, 27);
  letter-spacing: -0.045em;
}

.hero-copy h1 {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 680;
}

.card-head h2 {
  font-size: 24px;
  font-weight: 680;
}

.section-title h3 {
  font-size: 17px;
  font-weight: 700;
}

.dark .hero-copy h1,
.dark .card-head h2,
.dark .section-title h3 {
  color: rgb(250, 250, 250);
}

.eyebrow {
  margin: 0;
  color: rgb(113, 113, 122);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.dark .eyebrow {
  color: rgb(161, 161, 170);
}

.hero-copy p:not(.eyebrow),
.card-head p {
  max-width: 720px;
  margin: 10px 0 0;
  color: rgb(82, 82, 91);
  font-size: 14px;
  line-height: 1.8;
}

.dark .hero-copy p:not(.eyebrow),
.dark .card-head p {
  color: rgb(212, 212, 216);
}

.hero-status-card {
  display: grid;
  align-content: center;
  gap: 9px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.58);
  padding: 22px;
}

.dark .hero-status-card {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.48);
}

.hero-status-card strong {
  color: rgb(24, 24, 27);
  font-size: 16px;
}

.hero-status-card small {
  color: rgb(113, 113, 122);
  line-height: 1.6;
}

.dark .hero-status-card strong {
  color: rgb(244, 244, 245);
}

.dark .hero-status-card small {
  color: rgb(161, 161, 170);
}

.provider-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 0.92fr);
  gap: 22px;
  align-items: start;
}

.provider-card {
  border-radius: 28px;
  padding: 26px;
}

.card-head,
.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.card-head {
  margin-bottom: 22px;
}

.card-head.compact {
  align-items: center;
}

.form-card {
  display: grid;
  gap: 18px;
}

.form-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 22px;
  background: rgba(250, 250, 250, 0.58);
  padding: 20px;
}

.dark .form-section {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.44);
}

.model-section {
  background:
    radial-gradient(circle at 92% 18%, rgba(181, 151, 88, 0.13), transparent 34%),
    rgba(250, 250, 250, 0.58);
}

.dark .model-section {
  background:
    radial-gradient(circle at 92% 18%, rgba(181, 151, 88, 0.12), transparent 34%),
    rgba(39, 39, 42, 0.44);
}

.section-title,
.field.full,
.model-meta {
  grid-column: 1 / -1;
}

.field {
  display: grid;
  gap: 8px;
  color: rgb(63, 63, 70);
  font-size: 12px;
  font-weight: 700;
}

.dark .field {
  color: rgb(228, 228, 231);
}

.field .input-apple {
  min-height: 50px;
}

.field small,
.check-card small,
.provider-info p,
.empty-state p,
.debug-card span {
  margin: 0;
  color: rgb(113, 113, 122);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.65;
}

.dark .field small,
.dark .check-card small,
.dark .provider-info p,
.dark .empty-state p,
.dark .debug-card span {
  color: rgb(161, 161, 170);
}

.check-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  padding: 14px 16px;
}

.dark .check-card {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(24, 24, 27, 0.5);
}

.check-card span {
  display: grid;
  gap: 2px;
}

.check-card strong {
  color: rgb(24, 24, 27);
  font-size: 13px;
}

.dark .check-card strong {
  color: rgb(244, 244, 245);
}

.model-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.model-meta > div {
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.76);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.56);
  padding: 14px 16px;
}

.dark .model-meta > div {
  border-color: rgba(63, 63, 70, 0.76);
  background: rgba(24, 24, 27, 0.45);
}

.model-meta span {
  display: block;
  color: rgb(113, 113, 122);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.model-meta strong {
  display: block;
  overflow: hidden;
  margin-top: 6px;
  color: rgb(24, 24, 27);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .model-meta strong {
  color: rgb(244, 244, 245);
}

.action-row,
.provider-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.provider-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.primary-button,
.secondary-button,
.ghost-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.primary-button {
  border: 1px solid rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
  box-shadow: 0 12px 26px rgba(24, 24, 27, 0.16);
}

.dark .primary-button {
  border-color: rgb(244, 244, 245);
  background: rgb(244, 244, 245);
  color: rgb(24, 24, 27);
}

.secondary-button,
.ghost-button {
  border: 1px solid rgba(161, 161, 170, 0.42);
  background: rgba(255, 255, 255, 0.58);
  color: rgb(63, 63, 70);
}

.dark .secondary-button,
.dark .ghost-button {
  border-color: rgba(113, 113, 122, 0.6);
  background: rgba(39, 39, 42, 0.62);
  color: rgb(244, 244, 245);
}

.ghost-button.danger {
  color: rgb(185, 28, 28);
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled,
.ghost-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.list-card {
  position: sticky;
  top: 88px;
}

.provider-list {
  display: grid;
  max-height: calc(100vh - 292px);
  overflow-y: auto;
  padding-right: 4px;
  gap: 14px;
}

.provider-item {
  display: grid;
  gap: 16px;
  border: 1px solid rgba(228, 228, 231, 0.82);
  border-radius: 22px;
  background: rgba(250, 250, 250, 0.72);
  padding: 18px;
}

.provider-item.active {
  border-color: rgba(161, 132, 65, 0.58);
  box-shadow: 0 0 0 3px rgba(180, 151, 85, 0.1);
}

.dark .provider-item {
  border-color: rgba(63, 63, 70, 0.82);
  background: rgba(39, 39, 42, 0.56);
}

.provider-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.provider-title h3 {
  margin: 0;
  color: rgb(24, 24, 27);
  font-size: 16px;
  font-weight: 750;
}

.dark .provider-title h3 {
  color: rgb(244, 244, 245);
}

.mono-line,
.test-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mono-line {
  color: rgb(24, 24, 27) !important;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-weight: 650 !important;
}

.dark .mono-line {
  color: rgb(244, 244, 245) !important;
}

.status-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.status-pill.success {
  background: rgba(16, 185, 129, 0.12);
  color: rgb(5, 150, 105);
}

.status-pill.warning {
  background: rgba(245, 158, 11, 0.14);
  color: rgb(180, 83, 9);
}

.status-pill.muted {
  background: rgba(113, 113, 122, 0.12);
  color: rgb(82, 82, 91);
}

.dark .status-pill.success {
  background: rgba(16, 185, 129, 0.16);
  color: rgb(110, 231, 183);
}

.dark .status-pill.warning {
  background: rgba(245, 158, 11, 0.16);
  color: rgb(253, 224, 71);
}

.dark .status-pill.muted {
  background: rgba(82, 82, 91, 0.4);
  color: rgb(228, 228, 231);
}

.empty-state,
.debug-card {
  border: 1px dashed rgba(161, 161, 170, 0.52);
  border-radius: 22px;
  background: rgba(250, 250, 250, 0.5);
  padding: 26px 22px;
  text-align: center;
}

.debug-card {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  text-align: left;
}

.debug-card strong,
.empty-state strong {
  color: rgb(24, 24, 27);
}

.dark .debug-card,
.dark .empty-state {
  border-color: rgba(113, 113, 122, 0.62);
  background: rgba(39, 39, 42, 0.44);
}

.dark .debug-card strong,
.dark .empty-state strong {
  color: rgb(244, 244, 245);
}

@media (max-width: 1180px) {
  .provider-hero,
  .provider-grid {
    grid-template-columns: 1fr;
  }

  .list-card {
    position: static;
  }
}

@media (max-width: 720px) {
  .provider-hero,
  .provider-card {
    padding: 20px;
  }

  .form-section,
  .model-meta,
  .action-row,
  .provider-actions {
    grid-template-columns: 1fr;
  }

  .hero-status-card {
    min-width: 0;
  }
}
</style>
