<template>
  <div class="callout-block">
    <div :class="boxClass" class="flex items-start gap-3 rounded-2xl border px-3 py-3 transition-colors duration-150">
      <div class="mt-0.5 flex-shrink-0">
        <svg v-if="model.variant === 'warning'" class="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <svg v-else-if="model.variant === 'success'" class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="model.variant === 'error'" class="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="h-5 w-5 text-zinc-500 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <textarea
        ref="textareaRef"
        :value="model.text"
        data-ai-field="text"
        class="min-h-[1.25rem] w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
        placeholder="提示内容"
        rows="1"
        style="line-height: 1.65; font-family: inherit;"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="onInput"
        @keydown="onKeydown"
      />

      <select
        v-model="variantModel"
        class="rounded-md border border-zinc-200 bg-white/80 px-2 py-1 text-xs text-zinc-600 outline-none transition dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
      >
        <option value="info">默认</option>
        <option value="warning">提醒</option>
        <option value="success">完成</option>
        <option value="error">风险</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '', variant: 'info' }) }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const textareaRef = ref(null)

const model = computed(() => props.modelValue || { text: '', variant: 'info' })
const variantModel = computed({
  get: () => model.value.variant || 'info',
  set: (value) => emit('update:modelValue', { ...model.value, variant: value })
})

const boxClass = computed(() => ({
  info: 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-900/60',
  warning: 'border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20',
  success: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/20',
  error: 'border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/20'
}[model.value.variant || 'info']))

const resizeTextarea = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

const onInput = (event) => {
  emit('update:modelValue', { ...model.value, text: event.target.value })
  resizeTextarea()
}

watch(() => model.value.text, async () => {
  await nextTick()
  resizeTextarea()
}, { immediate: true })

const onKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Backspace' && !model.value.text) {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
  }
}

onMounted(() => {
  nextTick(() => {
    resizeTextarea()
  })
})
</script>

<style scoped>
</style>
