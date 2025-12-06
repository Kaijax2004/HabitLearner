<template>
  <div class="relative group list-block">
    <!-- 列表工具栏 -->
    <div 
      v-if="showToolbar" 
      class="absolute -top-12 left-0 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 z-30 backdrop-blur-sm"
    >
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="addItem"
        title="添加项目"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="toggleListType"
        :title="model.listType === 'ordered' ? '切换为无序列表' : '切换为有序列表'"
      >
        <svg v-if="model.listType === 'ordered'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
    </div>
    
    <!-- 列表容器 -->
    <div 
      class="min-h-[2rem] px-3 py-2 rounded-md transition-all duration-200 cursor-text group"
      :class="{ 
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 dark:bg-gray-800/50 shadow-sm': isFocused
      }"
      @click="focusList"
    >
      <div class="space-y-1">
        <div 
          v-for="(item, index) in model.items" 
          :key="index"
          class="flex items-start gap-2 group/item"
        >
          <!-- 列表标记 -->
          <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            <span v-if="model.listType === 'ordered'">{{ index + 1 }}.</span>
            <span v-else class="w-1.5 h-1.5 bg-current rounded-full"></span>
          </div>
          
          <!-- 列表项内容 -->
          <div class="flex-1 min-w-0">
            <input 
              v-model="model.items[index]"
              class="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              :placeholder="`列表项 ${index + 1}`"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @keydown="(e) => onKeydown(e, index)"
            />
          </div>
          
          <!-- 删除按钮 -->
          <button 
            v-if="model.items.length > 1"
            @click="removeItem(index)"
            class="opacity-0 group-hover/item:opacity-100 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
            title="删除项目"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 空列表提示 -->
      <div v-if="model.items.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
        点击上方按钮添加列表项
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'

const props = defineProps({ 
  modelValue: { 
    type: Object, 
    default: () => ({ 
      listType: 'unordered', // 'ordered' | 'unordered'
      items: ['列表项 1', '列表项 2'] 
    }) 
  },
  placeholder: { type: String, default: '列表' }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const isFocused = ref(false)
const showToolbar = ref(false)

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const focusList = () => {
  const firstInput = document.querySelector('.list-block input')
  if (firstInput) {
    firstInput.focus()
  }
}

const onFocus = () => {
  isFocused.value = true
  showToolbar.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  setTimeout(() => {
    showToolbar.value = false
  }, 200)
  emit('blur')
}

const onInput = () => {
  // 触发更新
}

const onKeydown = (e, index) => {
  // 处理 Enter 键创建新项目
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addItemAt(index + 1)
    return
  }
  
  // 处理 Backspace 键删除空项目
  if (e.key === 'Backspace' && model.value.items[index] === '' && model.value.items.length > 1) {
    e.preventDefault()
    removeItem(index)
    return
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    emit('delete-block')
    return
  }
  
  // 处理上下箭头键在列表项间导航
  if (e.key === 'ArrowUp' && index > 0) {
    e.preventDefault()
    const inputs = document.querySelectorAll('.list-block input')
    inputs[index - 1]?.focus()
    return
  }
  
  if (e.key === 'ArrowDown' && index < model.value.items.length - 1) {
    e.preventDefault()
    const inputs = document.querySelectorAll('.list-block input')
    inputs[index + 1]?.focus()
    return
  }
}

// 添加列表项
const addItem = () => {
  const newItems = [...model.value.items, '']
  model.value = {
    ...model.value,
    items: newItems
  }
  
  // 聚焦到新项目
  nextTick(() => {
    const inputs = document.querySelectorAll('.list-block input')
    const lastInput = inputs[inputs.length - 1]
    lastInput?.focus()
  })
}

// 在指定位置添加列表项
const addItemAt = (index) => {
  const newItems = [...model.value.items]
  newItems.splice(index, 0, '')
  
  model.value = {
    ...model.value,
    items: newItems
  }
  
  // 聚焦到新项目
  nextTick(() => {
    const inputs = document.querySelectorAll('.list-block input')
    const newInput = inputs[index]
    newInput?.focus()
  })
}

// 删除列表项
const removeItem = (index) => {
  if (model.value.items.length > 1) {
    const newItems = model.value.items.filter((_, i) => i !== index)
    model.value = {
      ...model.value,
      items: newItems
    }
    
    // 聚焦到前一个项目或后一个项目
    nextTick(() => {
      const inputs = document.querySelectorAll('.list-block input')
      const targetIndex = Math.min(index, inputs.length - 1)
      inputs[targetIndex]?.focus()
    })
  }
}

// 切换列表类型
const toggleListType = () => {
  const newListType = model.value.listType === 'ordered' ? 'unordered' : 'ordered'
  model.value = {
    ...model.value,
    listType: newListType
  }
}
</script>

<style scoped>
/* 列表样式优化 */
.list-block:hover .absolute {
  opacity: 1;
}

/* 列表项悬停效果 */
.group\/item:hover .opacity-0 {
  opacity: 1;
}

/* 响应式列表 */
@media (max-width: 640px) {
  .list-block {
    font-size: 0.875rem;
  }
}
</style>
