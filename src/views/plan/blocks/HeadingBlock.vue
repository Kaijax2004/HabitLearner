<template>
  <div class="relative group heading-block">
    <!-- Notion-style level selector -->
    <div 
      v-if="showLevelSelector" 
      class="absolute -top-10 left-0 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-30 backdrop-blur-sm"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">级别</span>
      <select 
        v-model="model.level" 
        class="bg-transparent border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
      >
        <option :value="1">H1</option>
        <option :value="2">H2</option>
        <option :value="3">H3</option>
      </select>
    </div>
    
    <!-- Notion-style editable heading -->
    <div 
      class="min-h-[2rem] px-3 py-2 rounded-md transition-all duration-200 cursor-text group"
      :class="{ 
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 dark:bg-gray-800/50 shadow-sm': isFocused
      }"
      @click="focusInput"
    >
      <input 
        ref="inputRef"
        :class="inputClass" 
        v-model="model.text" 
        class="w-full bg-transparent outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-semibold" 
        :placeholder="placeholder"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        @input="onInput"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @selectstart="onSelectStart"
        style="line-height: 1.3; font-family: inherit;"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ text: '', level: 1 }) },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const inputRef = ref(null)
const isFocused = ref(false)
const showLevelSelector = ref(false)
const isLongPressing = ref(false)
const longPressTimer = ref(null)
const longPressThreshold = 500 // 长按阈值（毫秒）

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const inputClass = computed(() => ({
  1: 'text-3xl sm:text-4xl font-bold tracking-tight',
  2: 'text-2xl sm:text-3xl font-bold tracking-tight',
  3: 'text-xl sm:text-2xl font-semibold',
  4: 'text-lg sm:text-xl font-semibold',
  5: 'text-base sm:text-lg font-medium',
  6: 'text-sm sm:text-base font-medium'
}[model.value.level || 1]))

const placeholder = computed(() => {
  if (props.placeholder) return props.placeholder
  return {
    1: '一级标题 - 页面主标题',
    2: '二级标题 - 章节标题',
    3: '三级标题 - 小节标题',
    4: '四级标题',
    5: '五级标题',
    6: '六级标题'
  }[model.value.level || 1]
})

const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

const onFocus = () => {
  isFocused.value = true
  showLevelSelector.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  setTimeout(() => {
    showLevelSelector.value = false
  }, 200)
  emit('blur')
}

const onInput = () => {
  // 可以在这里添加输入验证或格式化逻辑
}

// 长按选择文字处理
const onMouseDown = (e) => {
  // 清除之前的定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
  
  // 设置长按定时器
  longPressTimer.value = setTimeout(() => {
    isLongPressing.value = true
    // 长按时选择当前单词
    selectCurrentWord()
  }, longPressThreshold)
}

const onMouseUp = () => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 延迟重置长按状态
  setTimeout(() => {
    isLongPressing.value = false
  }, 100)
}

const onSelectStart = (e) => {
  // 如果正在长按，允许选择
  if (isLongPressing.value) {
    return
  }
  
  // 短按时可以选择文字
  // 这里可以添加其他选择逻辑
}

// 选择当前单词
const selectCurrentWord = () => {
  const input = inputRef.value
  if (!input) return
  
  const text = input.value
  const cursorPos = input.selectionStart
  
  // 找到单词的开始和结束位置
  let start = cursorPos
  let end = cursorPos
  
  // 向前查找单词开始
  while (start > 0 && /\w/.test(text[start - 1])) {
    start--
  }
  
  // 向后查找单词结束
  while (end < text.length && /\w/.test(text[end])) {
    end++
  }
  
  // 选择单词
  if (start !== end) {
    input.setSelectionRange(start, end)
  }
}

const onKeydown = (e) => {
  // 处理快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case '1':
        e.preventDefault()
        model.value.level = 1
        return
      case '2':
        e.preventDefault()
        model.value.level = 2
        return
      case '3':
        e.preventDefault()
        model.value.level = 3
        return
    }
  }
  
  // 处理方向键切换级别
  if (e.altKey) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (model.value.level > 1) {
          model.value.level--
        }
        return
      case 'ArrowDown':
        e.preventDefault()
        if (model.value.level < 6) {
          model.value.level++
        }
        return
    }
  }
  
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('create-new-block')
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    emit('delete-block')
    return
  }
  
  // 处理退格键删除空标题
  if (e.key === 'Backspace' && !model.value.text) {
    e.preventDefault()
    emit('delete-block')
  }
}

// 监听级别变化，自动调整样式
watch(() => model.value.level, (newLevel) => {
  // 可以在这里添加级别变化时的逻辑
  console.log(`标题级别变更为: H${newLevel}`)
})
</script>

<style scoped>
</style>


