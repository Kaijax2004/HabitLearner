<template>
  <AppLayout title="外观与主题" show-back-button>
    <main class="appearance-page workspace-page">
      <section class="appearance-hero workbench-panel">
        <div>
          <p class="workbench-eyebrow">Appearance</p>
          <h1 class="workbench-heading">把工作台调成你的节奏</h1>
          <p class="workbench-copy">保留 HabitLearner 的简约骨架，只调整背景、强调色、透明度和密度。编辑器和 Mentor-X 工作区会继续保持可读。</p>
        </div>
        <div class="appearance-actions">
          <button type="button" class="workbench-secondary" :disabled="isSaving" @click="handleReset">恢复默认</button>
          <button type="button" class="workbench-primary" :disabled="isSaving" @click="handleSave">{{ isSaving ? '保存中' : '保存主题' }}</button>
        </div>
      </section>

      <section class="appearance-layout">
        <form class="appearance-form workbench-panel" @submit.prevent="handleSave">
          <div class="appearance-section-head">
            <span>01</span>
            <div>
              <h2>基础风格</h2>
              <p>黑白工作台配一个温和强调色。</p>
            </div>
          </div>

          <label class="appearance-field">
            <span>显示模式</span>
            <select v-model="draft.mode" @change="preview">
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>

          <div class="appearance-preset-grid">
            <button
              v-for="preset in brandPresets"
              :key="preset.name"
              type="button"
              class="appearance-preset"
              @click="applyPreset(preset)"
            >
              <span :style="{ background: preset.accentColor }"></span>
              <strong>{{ preset.name }}</strong>
              <small>{{ preset.description }}</small>
            </button>
          </div>

          <label class="appearance-field">
            <span>强调色</span>
            <div class="appearance-color-row">
              <input v-model="draft.accentColor" type="color" @input="preview">
              <input v-model="draft.accentColor" type="text" maxlength="7" @input="preview">
            </div>
          </label>

          <div class="appearance-section-head">
            <span>02</span>
            <div>
              <h2>背景与材质</h2>
              <p>背景图会被压暗和模糊，避免影响文字。</p>
            </div>
          </div>

          <label class="appearance-field">
            <span>背景图</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="handleBackgroundUpload">
          </label>
          <button v-if="draft.backgroundImage" type="button" class="appearance-link-button" @click="clearBackground">移除背景图</button>

          <label class="appearance-range">
            <span>背景模糊 {{ draft.backgroundBlur }}px</span>
            <input v-model.number="draft.backgroundBlur" type="range" min="0" max="28" @input="preview">
          </label>

          <label class="appearance-range">
            <span>背景遮罩 {{ draft.backgroundDim }}%</span>
            <input v-model.number="draft.backgroundDim" type="range" min="0" max="60" @input="preview">
          </label>

          <label class="appearance-range">
            <span>表面透明度 {{ draft.surfaceOpacity }}%</span>
            <input v-model.number="draft.surfaceOpacity" type="range" min="72" max="98" @input="preview">
          </label>

          <div class="appearance-section-head">
            <span>03</span>
            <div>
              <h2>布局手感</h2>
              <p>控制圆角和页面密度，适配桌面与手机。</p>
            </div>
          </div>

          <label class="appearance-range">
            <span>圆角比例 {{ draft.radiusScale }}%</span>
            <input v-model.number="draft.radiusScale" type="range" min="75" max="130" @input="preview">
          </label>

          <label class="appearance-field">
            <span>布局密度</span>
            <select v-model="draft.density" @change="preview">
              <option value="compact">紧凑</option>
              <option value="comfortable">舒适</option>
              <option value="roomy">宽松</option>
            </select>
          </label>

          <label class="appearance-field">
            <span>动效强度</span>
            <select v-model="draft.motionLevel" @change="preview">
              <option value="quiet">安静</option>
              <option value="balanced">均衡</option>
              <option value="expressive">表达</option>
            </select>
          </label>

          <p v-if="themeStore.appearanceError" class="appearance-error">{{ themeStore.appearanceError }}</p>
        </form>

        <aside class="appearance-preview-shell">
          <div class="appearance-preview workbench-panel">
            <div class="appearance-preview-topline">
              <span></span><span></span><span></span>
            </div>
            <div class="appearance-preview-hero">
              <p>Today</p>
              <h3>先确认今天最重要的一步</h3>
              <button type="button">开始专注</button>
            </div>
            <div class="appearance-preview-grid">
              <article>
                <span>习惯</span>
                <strong>3 / 5</strong>
              </article>
              <article>
                <span>计划</span>
                <strong>4</strong>
              </article>
            </div>
            <div class="appearance-preview-list">
              <div v-for="item in previewItems" :key="item">
                <span></span>
                <p>{{ item }}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { uploadImage } from '@/api/uploads'

const themeStore = useThemeStore()
const { success, error: showError } = useToast()
const isSaving = ref(false)
const draft = reactive({ ...themeStore.appearance })
const previewItems = ['写完脚本第一版', '整理热点来源', '晚上做 3 分钟复盘']
const brandPresets = [
  {
    name: 'Warm Desk',
    description: '温润纸感，适合长期写作。',
    accentColor: '#8f7350',
    surfaceOpacity: 92,
    radiusScale: 100,
    backgroundBlur: 10,
    backgroundDim: 18,
    density: 'comfortable',
    motionLevel: 'balanced'
  },
  {
    name: 'Ink Focus',
    description: '更黑白，更像专注文档。',
    accentColor: '#52525b',
    surfaceOpacity: 94,
    radiusScale: 88,
    backgroundBlur: 6,
    backgroundDim: 24,
    density: 'compact',
    motionLevel: 'quiet'
  },
  {
    name: 'Olive Studio',
    description: '低饱和绿色，适合创作者工作台。',
    accentColor: '#68745f',
    surfaceOpacity: 90,
    radiusScale: 112,
    backgroundBlur: 14,
    backgroundDim: 20,
    density: 'comfortable',
    motionLevel: 'balanced'
  },
  {
    name: 'Clay Motion',
    description: '暖土色和更柔和的动态反馈。',
    accentColor: '#9a6048',
    surfaceOpacity: 88,
    radiusScale: 122,
    backgroundBlur: 18,
    backgroundDim: 26,
    density: 'roomy',
    motionLevel: 'expressive'
  }
]

const syncDraft = () => Object.assign(draft, themeStore.appearance)
const preview = () => themeStore.previewAppearance({ ...draft })
const applyPreset = (preset) => {
  Object.assign(draft, {
    ...draft,
    accentColor: preset.accentColor,
    surfaceOpacity: preset.surfaceOpacity,
    radiusScale: preset.radiusScale,
    backgroundBlur: preset.backgroundBlur,
    backgroundDim: preset.backgroundDim,
    density: preset.density,
    motionLevel: preset.motionLevel
  })
  preview()
}

const handleBackgroundUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  let response
  try {
    response = await uploadImage(file)
  } catch (err) {
    showError(err?.message || '背景图上传失败')
    return
  }
  if (!response.success) {
    showError(response.error || '背景图上传失败')
    return
  }

  draft.backgroundImage = response.data?.url || response.url || ''
  preview()
}

const clearBackground = () => {
  draft.backgroundImage = ''
  preview()
}

const handleSave = async () => {
  isSaving.value = true
  const response = await themeStore.saveAppearance({ ...draft })
  isSaving.value = false

  if (!response.success) {
    showError(response.error || '外观设置保存失败')
    return
  }

  success('外观设置已保存')
  syncDraft()
}

const handleReset = async () => {
  isSaving.value = true
  const response = await themeStore.resetAppearance()
  isSaving.value = false

  if (!response.success) {
    showError(response.error || '恢复默认失败')
    return
  }

  syncDraft()
  success('已恢复默认主题')
}

onMounted(async () => {
  await themeStore.loadAppearance()
  syncDraft()
})
</script>

<style scoped>
.appearance-page {
  animation: workbenchFadeUp var(--workbench-motion-duration) var(--workbench-ease) both;
}

.appearance-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
  padding: clamp(1.4rem, 3vw, 2.4rem);
}

.appearance-hero .workbench-copy {
  max-width: 42rem;
  margin-top: 0.75rem;
}

.appearance-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.appearance-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(20rem, 0.85fr);
  gap: var(--workbench-content-gap);
  align-items: start;
}

.appearance-form,
.appearance-preview {
  padding: clamp(1.1rem, 2.4vw, 1.7rem);
}

.appearance-section-head {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding-top: 0.35rem;
}

.appearance-section-head + .appearance-field,
.appearance-section-head + .appearance-range {
  margin-top: 1rem;
}

.appearance-section-head:not(:first-child) {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--workbench-border);
}

.appearance-section-head span {
  color: rgb(var(--workbench-accent-rgb));
  font-family: 'Geist Mono', 'SF Mono', monospace;
  font-size: 0.72rem;
  font-weight: 800;
}

.appearance-section-head h2 {
  margin: 0;
  color: var(--workbench-text);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.appearance-section-head p {
  margin: 0.25rem 0 0;
  color: var(--workbench-text-muted);
  font-size: 0.8rem;
  line-height: 1.6;
}

.appearance-field,
.appearance-range {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.9rem;
  color: var(--workbench-text);
  font-size: 0.82rem;
  font-weight: 750;
}

.appearance-field input[type='text'],
.appearance-field input[type='file'],
.appearance-field select {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.7);
  background: var(--workbench-surface-muted);
  color: var(--workbench-text);
  padding: 0 0.85rem;
  outline: none;
}

.appearance-field input:focus,
.appearance-field select:focus,
.appearance-range input:focus-visible {
  border-color: rgb(var(--workbench-accent-rgb) / 0.45);
  box-shadow: 0 0 0 3px rgb(var(--workbench-accent-rgb) / 0.12);
}

.appearance-color-row {
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  gap: 0.65rem;
}

.appearance-preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.appearance-preset {
  display: grid;
  gap: 0.35rem;
  min-height: 6.8rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.85);
  background: var(--workbench-surface-muted);
  padding: 0.9rem;
  text-align: left;
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease), background var(--workbench-motion-duration) var(--workbench-ease);
}

.appearance-preset:hover {
  border-color: rgb(var(--workbench-accent-rgb) / 0.26);
  background: var(--workbench-surface);
  transform: translateY(calc(var(--workbench-motion-distance) * -0.35));
}

.appearance-preset span {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.32);
}

.appearance-preset strong {
  color: var(--workbench-text);
  font-size: 0.86rem;
  font-weight: 820;
}

.appearance-preset small {
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
  line-height: 1.55;
}

.appearance-color-row input[type='color'] {
  width: 3.4rem;
  height: 2.75rem;
  padding: 0.25rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.7);
  background: var(--workbench-surface-muted);
}

.appearance-range input {
  accent-color: var(--workbench-accent);
}

.appearance-link-button {
  margin-top: 0.7rem;
  border: 0;
  background: transparent;
  color: rgb(var(--workbench-accent-rgb));
  font-size: 0.8rem;
  font-weight: 800;
}

.appearance-error {
  margin: 1rem 0 0;
  color: #b91c1c;
  font-size: 0.82rem;
}

.appearance-preview-shell {
  position: sticky;
  top: 6rem;
}

.appearance-preview {
  overflow: hidden;
  min-height: 32rem;
}

.appearance-preview-topline {
  display: flex;
  gap: 0.4rem;
}

.appearance-preview-topline span {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  background: rgb(var(--workbench-accent-rgb) / 0.34);
}

.appearance-preview-hero {
  margin-top: 2rem;
  padding: 1.3rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.9);
  background: var(--workbench-surface-muted);
}

.appearance-preview-hero p,
.appearance-preview-grid span {
  margin: 0;
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.appearance-preview-hero h3 {
  max-width: 18rem;
  margin: 0.75rem 0 1.25rem;
  color: var(--workbench-text);
  font-size: clamp(1.65rem, 4vw, 2.4rem);
  line-height: 1.05;
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.appearance-preview-hero button {
  min-height: 2.45rem;
  border: 0;
  border-radius: calc(var(--workbench-radius) * 0.65);
  background: var(--workbench-text);
  color: var(--workbench-page);
  padding: 0 0.95rem;
  font-weight: 850;
}

.appearance-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.appearance-preview-grid article,
.appearance-preview-list div {
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.75);
  background: var(--workbench-surface-muted);
}

.appearance-preview-grid article {
  padding: 1rem;
}

.appearance-preview-grid strong {
  display: block;
  margin-top: 0.45rem;
  color: var(--workbench-text);
  font-size: 1.8rem;
  letter-spacing: -0.05em;
}

.appearance-preview-list {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.appearance-preview-list div {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem;
}

.appearance-preview-list span {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: var(--workbench-accent);
}

.appearance-preview-list p {
  margin: 0;
  color: var(--workbench-text);
  font-size: 0.82rem;
  font-weight: 700;
}

@keyframes workbenchFadeUp {
  from { opacity: 0; transform: translateY(var(--workbench-motion-distance)); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .appearance-hero,
  .appearance-layout {
    grid-template-columns: 1fr;
  }

  .appearance-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .appearance-preview-shell {
    position: static;
  }

  .appearance-preset-grid {
    grid-template-columns: 1fr;
  }
}
</style>
