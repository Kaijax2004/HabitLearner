<template>
  <div class="relative group quote-block">
    <div class="min-h-[2rem] px-4 py-3 rounded-md transition-all duration-200 cursor-text border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
        <div class="flex-1">
          <textarea 
            v-model="model.text" 
            class="w-full bg-transparent outline-none resize-none dark:text-white text-sm leading-relaxed placeholder-gray-400 dark:placeholder-gray-500 min-h-[1.25rem] font-normal" 
            placeholder="输入引用内容..." 
            rows="1"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @keydown="onKeydown"
            style="line-height: 1.6; font-family: inherit;"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ text: '' }) }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const onFocus = () => {
  emit('focus')
}

const onBlur = () => {
  emit('blur')
}

const onInput = (e) => {
  // Auto-resize textarea
  e.target.style.height = 'auto'
  e.target.style.height = e.target.scrollHeight + 'px'
}

const onKeydown = (e) => {
  // Handle Enter key to create new line or block
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('create-new-block')
  }
}
</script>

<style scoped>
</style>


