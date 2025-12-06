<template>
  <div class="relative group text-block">
    <!-- Notion-style formatting toolbar -->
    <div 
      v-if="showToolbar" 
      class="absolute -top-12 left-0 flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 z-30 backdrop-blur-sm"
    >
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="wrap('**','**')" 
        title="粗体 (Ctrl+B)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isBold,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isBold
        }"
      >
        <span class="font-bold text-sm">B</span>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="wrap('*','*')" 
        title="斜体 (Ctrl+I)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isItalic,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isItalic
        }"
      >
        <span class="italic text-sm">I</span>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="wrap('`','`')" 
        title="内联代码 (Ctrl+`)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isCode,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isCode
        }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="wrap('~~','~~')" 
        title="删除线 (Ctrl+Shift+S)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isStrikethrough,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isStrikethrough
        }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="wrap('==','==')" 
        title="高亮 (Ctrl+Shift+H)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isHighlight,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isHighlight
        }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </button>
      <button 
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 group" 
        @click="insertLink" 
        title="插入链接 (Ctrl+K)"
        :class="{ 
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': isLink,
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': !isLink
        }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
    </div>
    
    <!-- Notion-style editable text area -->
    <div 
      class="min-h-[1.5rem] px-3 py-2 rounded-md transition-all duration-200 cursor-text group"
      :class="{ 
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 dark:bg-gray-800/50 shadow-sm': isFocused
      }"
      @click="focusTextarea"
    >
      <textarea 
        ref="textareaRef"
        v-model="model.text" 
        class="w-full bg-transparent outline-none resize-none dark:text-white min-h-[1.25rem] text-sm leading-relaxed placeholder-gray-400 dark:placeholder-gray-500 font-normal" 
        :placeholder="placeholder"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @selectstart="onSelectStart"
        rows="1"
        style="line-height: 1.6; font-family: inherit;"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ text: '' }) },
  placeholder: { type: String, default: '输入文本...' },
  showCharCount: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const textareaRef = ref(null)
const isFocused = ref(false)
const showToolbar = ref(false)
const isBold = ref(false)
const isLongPressing = ref(false)
const longPressTimer = ref(null)
const longPressThreshold = 500 // 长按阈值（毫秒）
const isItalic = ref(false)
const isCode = ref(false)
const isStrikethrough = ref(false)
const isHighlight = ref(false)
const isLink = ref(false)

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// 检测文本格式状态
const checkFormatting = () => {
  const text = model.value.text || ''
  const textarea = textareaRef.value
  
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.slice(start, end)
    
    // 检测当前选中文本的格式
    isBold.value = selectedText.includes('**') && selectedText.includes('**')
    isItalic.value = selectedText.includes('*') && selectedText.includes('*')
    isCode.value = selectedText.includes('`') && selectedText.includes('`')
    isStrikethrough.value = selectedText.includes('~~') && selectedText.includes('~~')
    isHighlight.value = selectedText.includes('==') && selectedText.includes('==')
    isLink.value = selectedText.includes('[') && selectedText.includes('](') && selectedText.includes(')')
  } else {
    // 如果没有选中文本，检测整个文本的格式
    isBold.value = text.includes('**') && text.includes('**')
    isItalic.value = text.includes('*') && text.includes('*')
    isCode.value = text.includes('`') && text.includes('`')
    isStrikethrough.value = text.includes('~~') && text.includes('~~')
    isHighlight.value = text.includes('==') && text.includes('==')
    isLink.value = text.includes('[') && text.includes('](') && text.includes(')')
  }
}

// 监听文本变化
watch(() => model.value.text, checkFormatting, { immediate: true })

const insert = (s) => { 
  const currentText = model.value.text || ''
  const cursorPos = textareaRef.value?.selectionStart || currentText.length
  
  const newText = currentText.slice(0, cursorPos) + s + currentText.slice(cursorPos)
  model.value.text = newText
  
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      // 设置光标位置
      const newCursorPos = cursorPos + s.length
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
}

// 插入链接
const insertLink = () => {
  const currentText = model.value.text || ''
  const textarea = textareaRef.value
  
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentText.slice(start, end)
    
    let linkText = selectedText || '链接文本'
    let linkUrl = 'https://'
    
    // 如果选中的文本已经是链接格式，提取链接信息
    const linkMatch = selectedText.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      linkText = linkMatch[1]
      linkUrl = linkMatch[2]
    }
    
    // 创建链接格式
    const linkFormat = `[${linkText}](${linkUrl})`
    const newText = currentText.slice(0, start) + linkFormat + currentText.slice(end)
    model.value.text = newText
    
    nextTick(() => {
      textarea.focus()
      // 选中链接文本部分，方便用户编辑
      const newStart = start + 1 // 跳过 [
      const newEnd = newStart + linkText.length
      textarea.setSelectionRange(newStart, newEnd)
    })
  }
}

const wrap = (l, r) => {
  const currentText = model.value.text || ''
  const textarea = textareaRef.value
  
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentText.slice(start, end)
    
    if (selectedText) {
      // 如果有选中文本，包装选中的文本
      const newText = currentText.slice(0, start) + l + selectedText + r + currentText.slice(end)
      model.value.text = newText
      
      nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + l.length, end + l.length)
      })
    } else {
      // 如果没有选中文本，在光标位置插入格式标记
      const newText = currentText.slice(0, start) + l + r + currentText.slice(end)
      model.value.text = newText
      
      nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + l.length, start + l.length)
      })
    }
  } else {
    // 备用方案
    model.value.text = `${l}${currentText}${r}`
  }
}

const focusTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.focus()
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
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
  checkFormatting()
}

const onPaste = (e) => {
  // 处理粘贴事件，可以在这里添加格式化逻辑
  setTimeout(() => {
    onInput()
  }, 10)
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
  const textarea = textareaRef.value
  if (!textarea) return
  
  const text = textarea.value
  const cursorPos = textarea.selectionStart
  
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
    textarea.setSelectionRange(start, end)
  }
}

const onKeydown = (e) => {
  // 处理快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'b':
        e.preventDefault()
        wrap('**', '**')
        return
      case 'i':
        e.preventDefault()
        wrap('*', '*')
        return
      case 'k':
        e.preventDefault()
        insertLink()
        return
      case '`':
        e.preventDefault()
        wrap('`', '`')
        return
    }
    
    // 处理 Shift 组合键
    if (e.shiftKey) {
      switch (e.key) {
        case 'S':
          e.preventDefault()
          wrap('~~', '~~')
          return
        case 'H':
          e.preventDefault()
          wrap('==', '==')
          return
      }
    }
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    emit('delete-block')
    return
  }
  
  // Handle Enter key to create new line or block
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('create-new-block')
  }
  
  // Handle Tab key for indentation
  if (e.key === 'Tab') {
    e.preventDefault()
    insert('  ') // 插入两个空格作为缩进
  }
}
</script>

<style scoped>
</style>


