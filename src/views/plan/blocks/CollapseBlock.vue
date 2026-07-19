<template>
  <div class="relative group collapse-block">
    <div class="flex items-start gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <!-- Toggle Button -->
      <button 
        @click="toggleOpen"
        class="w-6 h-6 mt-0.5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
      >
        <svg 
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-90': model.open }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div class="flex-1 min-w-0">
        <!-- Title Input -->
        <input 
          v-model="model.title" 
          class="w-full bg-transparent outline-none font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400"
          placeholder="折叠标题 (输入 /)" 
          @keydown="onTitleKeydown"
          @focus="onFocus"
          @blur="onBlur"
        />
        
        <!-- Content Area -->
        <div v-show="model.open" class="mt-2 pl-1">
          <textarea 
            v-model="model.text" 
            class="w-full bg-transparent outline-none resize-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400" 
            placeholder="折叠内容..."
            rows="1"
            @input="onContentInput"
            @keydown="onContentKeydown"
            @focus="onFocus"
            @blur="onBlur"
            ref="contentArea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ title: '', text: '', open: false }) } 
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const contentArea = ref(null)

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const toggleOpen = () => {
  model.value = { ...model.value, open: !model.value.open }
  if (model.value.open) {
    nextTick(() => {
      if (contentArea.value) {
        contentArea.value.style.height = 'auto'
        contentArea.value.style.height = contentArea.value.scrollHeight + 'px'
      }
    })
  }
}

const onFocus = () => emit('focus')
const onBlur = () => emit('blur')

const onTitleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (!model.value.open) {
      toggleOpen()
    }
    nextTick(() => contentArea.value?.focus())
  } else if (e.key === 'Backspace' && !model.value.title) {
    e.preventDefault()
    emit('delete-block')
  }
}

const onContentInput = (e) => {
  if (e.target) {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }
}

const onContentKeydown = (e) => {
  if (e.key === 'Backspace' && !model.value.text) {
    e.preventDefault()
    // Move focus back to title? Or just delete content?
    // Notion behavior: Backspace on empty content moves cursor to title end.
    // We can simulate this by focusing title.
    const titleInput = e.target.closest('.collapse-block').querySelector('input')
    titleInput?.focus()
  } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    emit('create-new-block')
  }
}

watch(() => model.value.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      if (contentArea.value) {
        contentArea.value.style.height = 'auto'
        contentArea.value.style.height = contentArea.value.scrollHeight + 'px'
      }
    })
  }
})
</script>

<style scoped>
</style>
