<template>
  <div>
    <button
      type="button"
      class="quick-capture-trigger"
      title="快速收集 Ctrl + Shift + C"
      @click="openPanel"
    >
      <span class="quick-capture-trigger-dot"></span>
      <span>收集</span>
    </button>

    <div v-if="isOpen" class="quick-capture-backdrop" @click.self="closePanel">
      <section class="quick-capture-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">Quick Capture</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">先收进来</h2>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">不急着整理完美，先把想法、任务或学习收获放入收集箱。</p>
          </div>
          <button class="quick-capture-close" type="button" @click="closePanel">关闭</button>
        </div>

        <div class="mt-5 grid gap-3">
          <select v-model="draft.type" class="quick-capture-field">
            <option value="idea">想法</option>
            <option value="task">任务</option>
            <option value="learning">学习</option>
            <option value="plan">计划</option>
            <option value="habit">习惯</option>
          </select>
          <textarea
            ref="textareaRef"
            v-model="draft.content"
            class="quick-capture-textarea"
            maxlength="1200"
            rows="5"
            placeholder="例如：把今天的学习收获转成一个 20 分钟行动"
            @keydown.ctrl.enter.prevent="submit"
            @keydown.meta.enter.prevent="submit"
          ></textarea>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-zinc-500 dark:text-zinc-400">快捷键：Ctrl + Shift + C 打开，Ctrl/⌘ + Enter 保存。</p>
          <div class="flex gap-2">
            <button class="quick-capture-secondary" type="button" @click="goToCaptures">打开收集箱</button>
            <button class="quick-capture-primary" type="button" :disabled="isSubmitting" @click="submit">
              {{ isSubmitting ? '收集中' : '加入收集箱' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createQuickCapture } from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error } = useToast()
const isOpen = ref(false)
const isSubmitting = ref(false)
const textareaRef = ref(null)
const draft = reactive({
  type: 'idea',
  content: ''
})

const openPanel = async () => {
  isOpen.value = true
  await nextTick()
  textareaRef.value?.focus()
  window.dispatchEvent(new CustomEvent('workspace-pet-state', {
    detail: { state: 'waiting', duration: 1200, text: '收下' }
  }))
}

const closePanel = () => {
  isOpen.value = false
}

const submit = async () => {
  const content = draft.content.trim()
  if (!content) {
    error('请先写下要收集的内容')
    return
  }
  isSubmitting.value = true
  window.dispatchEvent(new CustomEvent('workspace-pet-state', {
    detail: { state: 'running', duration: 900, text: '整理中' }
  }))
  const response = await createQuickCapture({
    type: draft.type,
    content,
    clientMutationId: `capture_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  })
  isSubmitting.value = false
  if (!response.success) {
    error('加入收集箱失败', { description: response.error || '请稍后重试' })
    window.dispatchEvent(new CustomEvent('workspace-pet-state', {
      detail: { state: 'failed', duration: 1200, text: '失败' }
    }))
    return
  }
  draft.content = ''
  draft.type = 'idea'
  closePanel()
  window.dispatchEvent(new CustomEvent('workspace-pet-state', {
    detail: { state: 'jumping', duration: 1100, text: '已收下' }
  }))
  success('已加入收集箱', { description: '稍后可以转计划、复盘、学习笔记或轨道沉淀。' })
}

const goToCaptures = () => {
  closePanel()
  router.push('/captures')
}

const handleShortcut = (event) => {
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
    event.preventDefault()
    openPanel()
  }
  if (event.key === 'Escape' && isOpen.value) closePanel()
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onMounted(() => window.addEventListener('workspace-quick-capture-open', openPanel))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
  window.removeEventListener('workspace-quick-capture-open', openPanel)
})
</script>

<style scoped>
.quick-capture-trigger {
  position: fixed;
  right: 1.25rem;
  bottom: 6.2rem;
  z-index: 55;
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.86);
  padding: 0 1rem;
  color: rgb(24, 24, 27);
  font-size: 0.8125rem;
  font-weight: 800;
  box-shadow: 0 16px 40px rgba(24, 24, 27, 0.1);
  backdrop-filter: blur(18px);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.quick-capture-trigger:hover {
  transform: translateY(-2px);
  border-color: rgba(24, 24, 27, 0.5);
}

.quick-capture-trigger-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background: rgb(24, 24, 27);
}

.quick-capture-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(9, 9, 11, 0.28);
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.quick-capture-panel {
  width: min(100%, 42rem);
  border: 1px solid rgba(228, 228, 231, 0.86);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.5rem;
  box-shadow: 0 30px 90px rgba(24, 24, 27, 0.18);
}

.quick-capture-field,
.quick-capture-textarea {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(250, 250, 250, 0.9);
  color: rgb(24, 24, 27);
  font-size: 0.9rem;
  outline: none;
}

.quick-capture-field {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.quick-capture-textarea {
  min-height: 8rem;
  resize: vertical;
  padding: 0.9rem 1rem;
  line-height: 1.7;
}

.quick-capture-primary,
.quick-capture-secondary,
.quick-capture-close {
  min-height: 2.5rem;
  border-radius: 9999px;
  padding: 0 1rem;
  font-size: 0.8125rem;
  font-weight: 800;
}

.quick-capture-primary {
  background: rgb(24, 24, 27);
  color: white;
}

.quick-capture-secondary,
.quick-capture-close {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: white;
  color: rgb(63, 63, 70);
}

.dark .quick-capture-trigger,
.dark .quick-capture-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(9, 9, 11, 0.92);
  color: white;
}

.dark .quick-capture-trigger-dot {
  background: white;
}

.dark .quick-capture-field,
.dark .quick-capture-textarea {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.86);
  color: white;
}

.dark .quick-capture-secondary,
.dark .quick-capture-close {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.86);
  color: white;
}

.dark .quick-capture-primary {
  background: white;
  color: rgb(24, 24, 27);
}
</style>
