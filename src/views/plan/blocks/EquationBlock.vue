<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">equation</div>
    <input
      :value="model.latex"
      data-ai-field="latex"
      class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 font-mono text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
      placeholder="输入 LaTeX 公式"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @input="onInput"
      @keydown="onKeydown"
    />
    <div v-if="model.latex" class="mt-3 rounded-xl bg-zinc-50 px-3 py-3 font-mono text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      {{ model.latex }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ latex: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const model = computed(() => props.modelValue || { latex: '' })

const onInput = (event) => {
  emit('update:modelValue', { ...model.value, latex: event.target.value })
}

const onKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
  }
  if (event.key === 'Backspace' && !model.value.latex) {
    event.preventDefault()
    emit('delete-block')
  }
}
</script>
