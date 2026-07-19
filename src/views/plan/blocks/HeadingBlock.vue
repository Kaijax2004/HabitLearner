<template>
  <div class="relative heading-block">
    <div
      v-if="showLevelSelector"
      class="absolute -top-10 left-0 z-30 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">级别</span>
      <select
        v-model="levelModel"
        class="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:text-zinc-100"
      >
        <option :value="1">H1</option>
        <option :value="2">H2</option>
        <option :value="3">H3</option>
      </select>
    </div>

    <div
      class="rounded-md px-3 py-2 transition-colors duration-150"
      :class="isFocused ? 'bg-zinc-50 shadow-sm dark:bg-zinc-800/50' : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30'"
      @click="focusInput"
    >
      <input
        ref="inputRef"
        :value="model.text"
        data-ai-field="text"
        :class="inputClass"
        class="w-full bg-transparent font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
        :placeholder="placeholder"
        style="line-height: 1.2; font-family: inherit;"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '', level: 1 }) },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const inputRef = ref(null)
const isFocused = ref(false)
const showLevelSelector = ref(false)

const model = computed(() => props.modelValue || { text: '', level: 1 })
const levelModel = computed({
  get: () => model.value.level || 1,
  set: (value) => emit('update:modelValue', { ...model.value, level: Number(value) })
})

const inputClass = computed(() => ({
  1: 'text-3xl font-bold tracking-tight sm:text-4xl',
  2: 'text-2xl font-bold tracking-tight sm:text-3xl',
  3: 'text-xl font-semibold sm:text-2xl',
  4: 'text-lg font-semibold sm:text-xl',
  5: 'text-base font-medium sm:text-lg',
  6: 'text-sm font-medium sm:text-base'
}[model.value.level || 1]))

const placeholder = computed(() => {
  if (props.placeholder) return props.placeholder
  return {
    1: '一级标题',
    2: '二级标题',
    3: '三级标题',
    4: '四级标题',
    5: '五级标题',
    6: '六级标题'
  }[model.value.level || 1]
})

const focusInput = () => {
  inputRef.value?.focus()
}

const onInput = (event) => {
  emit('update:modelValue', { ...model.value, text: event.target.value })
}

const onFocus = () => {
  isFocused.value = true
  showLevelSelector.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  window.setTimeout(() => {
    showLevelSelector.value = false
  }, 120)
  emit('blur')
}

const onKeydown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (['1', '2', '3'].includes(event.key)) {
      event.preventDefault()
      emit('update:modelValue', { ...model.value, level: Number(event.key) })
      return
    }
    if (event.key === 'Backspace') {
      event.preventDefault()
      emit('delete-block')
      return
    }
  }

  if (event.altKey && event.key === 'ArrowUp' && model.value.level > 1) {
    event.preventDefault()
    emit('update:modelValue', { ...model.value, level: model.value.level - 1 })
    return
  }

  if (event.altKey && event.key === 'ArrowDown' && model.value.level < 6) {
    event.preventDefault()
    emit('update:modelValue', { ...model.value, level: model.value.level + 1 })
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
    return
  }

  if (event.key === 'Backspace' && !model.value.text) {
    event.preventDefault()
    emit('delete-block')
  }
}
</script>

<style scoped>
</style>
