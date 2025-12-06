<template>
  <div class="relative group table-block">
    <!-- 表格工具栏 -->
    <div 
      v-if="showToolbar" 
      class="absolute -top-12 left-0 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 z-30 backdrop-blur-sm"
    >
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="addColumn"
        title="添加列"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="addRow"
        title="添加行"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="deleteColumn"
        title="删除列"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="deleteRow"
        title="删除行"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
    
    <!-- 表格容器 -->
    <div 
      class="min-h-[2rem] px-3 py-2 rounded-md transition-all duration-200 cursor-text group overflow-x-auto"
      :class="{ 
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 dark:bg-gray-800/50 shadow-sm': isFocused
      }"
      @click="focusTable"
    >
      <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr>
            <th 
              v-for="(header, colIndex) in model.headers" 
              :key="colIndex"
              class="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-left text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              <input 
                v-model="model.headers[colIndex]"
                class="w-full bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-gray-100"
                @focus="onFocus"
                @blur="onBlur"
                @input="onInput"
                @keydown="onKeydown"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in model.rows" :key="rowIndex">
            <td 
              v-for="(cell, colIndex) in row" 
              :key="colIndex"
              class="border border-gray-300 dark:border-gray-600 px-2 py-1"
            >
              <input 
                v-model="model.rows[rowIndex][colIndex]"
                class="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                @focus="onFocus"
                @blur="onBlur"
                @input="onInput"
                @keydown="onKeydown"
              />
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 空表格提示 -->
      <div v-if="model.rows.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
        点击上方按钮添加行和列
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
      headers: ['列1', '列2'], 
      rows: [['', '']] 
    }) 
  },
  placeholder: { type: String, default: '表格' }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const isFocused = ref(false)
const showToolbar = ref(false)

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const focusTable = () => {
  const firstInput = document.querySelector('.table-block input')
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

const onKeydown = (e) => {
  // 处理 Tab 键在表格中导航
  if (e.key === 'Tab') {
    e.preventDefault()
    navigateTable(e.shiftKey)
    return
  }
  
  // 处理 Enter 键创建新行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addRow()
    return
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    emit('delete-block')
    return
  }
}

// 在表格中导航
const navigateTable = (reverse = false) => {
  const inputs = Array.from(document.querySelectorAll('.table-block input'))
  const currentInput = document.activeElement
  const currentIndex = inputs.indexOf(currentInput)
  
  if (currentIndex !== -1) {
    let nextIndex
    if (reverse) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : inputs.length - 1
    } else {
      nextIndex = currentIndex < inputs.length - 1 ? currentIndex + 1 : 0
    }
    
    inputs[nextIndex]?.focus()
  }
}

// 添加列
const addColumn = () => {
  const newHeaders = [...model.value.headers, `列${model.value.headers.length + 1}`]
  const newRows = model.value.rows.map(row => [...row, ''])
  
  model.value = {
    headers: newHeaders,
    rows: newRows
  }
}

// 添加行
const addRow = () => {
  const newRow = new Array(model.value.headers.length).fill('')
  const newRows = [...model.value.rows, newRow]
  
  model.value = {
    headers: model.value.headers,
    rows: newRows
  }
  
  // 聚焦到新行的第一个单元格
  nextTick(() => {
    const inputs = document.querySelectorAll('.table-block input')
    const lastRowFirstInput = inputs[inputs.length - model.value.headers.length]
    lastRowFirstInput?.focus()
  })
}

// 删除列
const deleteColumn = () => {
  if (model.value.headers.length > 1) {
    const newHeaders = model.value.headers.slice(0, -1)
    const newRows = model.value.rows.map(row => row.slice(0, -1))
    
    model.value = {
      headers: newHeaders,
      rows: newRows
    }
  }
}

// 删除行
const deleteRow = () => {
  if (model.value.rows.length > 1) {
    const newRows = model.value.rows.slice(0, -1)
    
    model.value = {
      headers: model.value.headers,
      rows: newRows
    }
  }
}
</script>

<style scoped>
/* 表格样式优化 */
table {
  min-width: 300px;
}

th, td {
  min-width: 100px;
}

input {
  min-width: 80px;
}

/* 表格工具栏动画 */
.table-block:hover .absolute {
  opacity: 1;
}

/* 响应式表格 */
@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.25rem;
    min-width: 80px;
  }
}
</style>
