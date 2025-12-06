<template>
  <div class="relative group todo-block">
    <div class="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group">
      <!-- Notion-style checkbox -->
      <button 
        @click="toggleDone"
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0 group-hover:border-gray-400 dark:group-hover:border-gray-500"
        :class="model.done 
          ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'"
      >
        <svg v-if="model.done" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </button>
      
      <!-- Notion-style todo content -->
      <input 
        v-model="model.text" 
        class="flex-1 bg-transparent outline-none dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 font-normal"
        :class="{ 
          'line-through text-gray-500 dark:text-gray-400': model.done,
          'text-gray-900 dark:text-white': !model.done
        }"
        placeholder="输入待办事项..." 
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        style="line-height: 1.5; font-family: inherit;"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ 
  modelValue: { 
    type: Object, 
    default: () => ({ 
      text: '', 
      done: false
    }) 
  } 
})
const emit = defineEmits(['update:modelValue','toggle-complete', 'focus', 'blur', 'create-new-block', 'delete-block'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const toggleDone = () => {
  model.value.done = !model.value.done
  emit('toggle-complete')
}

const onFocus = () => {
  emit('focus')
}

const onBlur = () => {
  emit('blur')
}

const onKeydown = (e) => {
  // 处理空格键切换完成状态
  if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    toggleDone()
    return
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    emit('delete-block')
    return
  }
  
  // 处理回车键创建新待办
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('create-new-block')
    return
  }
}
</script>

<style scoped>
</style>


