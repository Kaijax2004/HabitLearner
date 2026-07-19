<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
    <div class="flex flex-wrap items-center gap-2">
      <input
        :value="model.rootLabel"
        data-ai-field="rootLabel"
        class="w-24 bg-transparent outline-none"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="(event) => patch({ rootLabel: event.target.value })"
      />
      <span>/</span>
      <span class="font-medium text-zinc-950 dark:text-white">{{ planTitle || model.currentLabel || '当前页面' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ rootLabel: '首页', currentLabel: '' })
  },
  planTitle: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])
const model = computed(() => props.modelValue || { rootLabel: '首页', currentLabel: '' })
const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })
</script>
