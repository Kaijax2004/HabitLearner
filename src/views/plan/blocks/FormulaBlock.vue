<template>
  <div class="relative group formula-block">
    <div class="min-h-[2.5rem] p-2 rounded-lg hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-all duration-200">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="text-xs text-gray-500 dark:text-gray-400">数学公式</span>
      </div>
      <input 
        v-model="model.latex" 
        class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent outline-none dark:text-white text-sm" 
        placeholder="输入LaTeX公式 (输入 /)" 
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div v-if="model.latex" class="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-400">
        {{ model.latex }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ latex: '' }) } 
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const onFocus = () => emit('focus')
const onBlur = () => emit('blur')

const onKeydown = (e) => {
  if (e.key === 'Backspace' && !model.value.latex) {
    e.preventDefault()
    emit('delete-block')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    emit('create-new-block')
  }
}
</script>

<style scoped>
</style>
