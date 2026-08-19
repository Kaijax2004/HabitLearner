<template>
  <RichTextBlock
    v-if="isActive"
    v-bind="attrs"
    :model-value="modelValue"
    :placeholder="placeholder"
    :auto-focus="shouldAutoFocus"
    @update:modelValue="emit('update:modelValue', $event)"
    @focus="emit('focus')"
    @blur="emit('blur')"
    @open-ai="emit('open-ai')"
    @create-new-block="emit('create-new-block')"
    @delete-block="emit('delete-block')"
    @change-type="emit('change-type', $event)"
    @open-slash-menu="emit('open-slash-menu', $event)"
  />

  <button
    v-else
    type="button"
    class="lazy-rich-preview"
    :class="{ 'lazy-rich-preview-empty': !previewText }"
    @pointerenter="prefetch"
    @focus="activate"
    @click="activate"
    @keydown="handlePreviewKeydown"
  >
    <span>{{ previewText || placeholder }}</span>
  </button>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, useAttrs } from 'vue'

let richTextPromise = null
const loadRichTextBlock = () => {
  richTextPromise ||= import('@/views/plan/blocks/RichTextBlock.vue')
  return richTextPromise
}

const RichTextBlock = defineAsyncComponent({
  loader: loadRichTextBlock,
  delay: 80
})

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '', html: '', document: null }) },
  placeholder: { type: String, default: "输入 '/' 打开命令菜单..." }
})

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'open-ai',
  'create-new-block',
  'delete-block',
  'change-type',
  'open-slash-menu'
])

const attrs = useAttrs()
const isActive = ref(false)
const shouldAutoFocus = ref(false)

const stripHtml = (html = '') => String(html)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .trim()

const previewText = computed(() => {
  const content = props.modelValue || {}
  return String(content.text || stripHtml(content.html || '') || '').trim()
})

const activate = async () => {
  if (isActive.value) return
  shouldAutoFocus.value = true
  await loadRichTextBlock()
  isActive.value = true
  await nextTick()
  emit('focus')
}

const prefetch = () => {
  void loadRichTextBlock()
}

const handlePreviewKeydown = (event) => {
  if (event.key === '/' && !previewText.value) {
    event.preventDefault()
    emit('open-slash-menu', event)
    return
  }
  if (event.key === 'Backspace' && !previewText.value) {
    event.preventDefault()
    emit('delete-block')
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('create-new-block')
    return
  }
  activate()
}
</script>

<style scoped>
.lazy-rich-preview {
  display: block;
  width: 100%;
  min-height: 2.9rem;
  border: 0;
  border-radius: 0.72rem;
  background: transparent;
  color: var(--workbench-text, #18181b);
  padding: 0.62rem 0.75rem;
  text-align: left;
  transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}

.lazy-rich-preview:hover,
.lazy-rich-preview:focus-visible {
  background: rgba(250, 250, 250, 0.72);
  box-shadow: 0 8px 24px rgba(24, 24, 27, 0.04);
  outline: none;
}

.lazy-rich-preview:active {
  transform: translateY(1px);
}

.lazy-rich-preview span {
  display: -webkit-box;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  font-size: 0.875rem;
  line-height: 1.65;
}

.lazy-rich-preview-empty {
  color: rgb(161 161 170);
}

.dark .lazy-rich-preview:hover,
.dark .lazy-rich-preview:focus-visible {
  background: rgba(39, 39, 42, 0.42);
}

@media (prefers-reduced-motion: reduce) {
  .lazy-rich-preview {
    transition: none;
  }
}
</style>
