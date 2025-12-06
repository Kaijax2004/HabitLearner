<template>
  <div class="relative group code-block">
    <div class="min-h-[2rem] p-4 rounded-md transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
      <!-- Notion-style language selector -->
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">代码块</span>
        </div>
        <select 
          v-model="model.lang" 
          class="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
        </select>
      </div>
      
      <!-- Notion-style code editor -->
      <div class="space-y-3">
        <textarea 
          v-model="model.code" 
          class="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md outline-none dark:text-white font-mono text-sm resize-none transition-all duration-150 focus:ring-2 focus:ring-blue-500/20" 
          rows="6" 
          placeholder="输入代码..." 
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
          @keydown="onKeydown"
          style="line-height: 1.5; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;"
        />
        
        <!-- Notion-style code preview -->
        <div v-if="model.code" class="rounded-md bg-gray-900 dark:bg-gray-950 overflow-auto max-h-64 border border-gray-700 dark:border-gray-800">
          <pre class="p-3 text-sm text-gray-100"><code ref="codeEl" :class="`language-${model.lang||'javascript'}`"></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({ 
  modelValue: { type: Object, default: () => ({ lang: 'javascript', code: '' }) } 
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const codeEl = ref(null)

const highlight = () => {
  if (!codeEl.value) return
  codeEl.value.textContent = model.value.code || ''
}

const onFocus = () => {
  emit('focus')
}

const onBlur = () => {
  emit('blur')
}

const onInput = () => {
  // 延迟高亮，避免频繁更新
  setTimeout(highlight, 100)
}

const onKeydown = (e) => {
  // Handle Tab key for indentation
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const value = e.target.value
    e.target.value = value.substring(0, start) + '  ' + value.substring(end)
    e.target.selectionStart = e.target.selectionEnd = start + 2
    onInput()
  }
  
  // Handle Enter key to create new block (only if at end of textarea)
  if (e.key === 'Enter' && !e.shiftKey && e.target.selectionStart === e.target.value.length) {
    e.preventDefault()
    emit('create-new-block')
  }
}

onMounted(() => {
  // 简化版本：不使用prismjs，直接显示代码
  highlight()
})

watch(() => [model.value.code, model.value.lang], () => {
  highlight()
})
</script>

<style scoped>
</style>


