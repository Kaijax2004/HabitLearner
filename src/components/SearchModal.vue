<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- 搜索框 -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- 搜索输入框 -->
              <div class="relative">
                <input
                  ref="searchInput"
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索内容..."
                  class="w-full px-4 py-3 pl-10 pr-10 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-zinc-950/15 dark:focus:ring-white/15 focus:border-zinc-500"
                  @keydown="handleKeydown"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- 搜索结果 -->
              <div v-if="searchResults.length > 0" class="mt-4 max-h-64 overflow-y-auto">
                <div class="space-y-2">
                  <div
                    v-for="(result, index) in searchResults"
                    :key="index"
                    class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    @click="selectResult(result)"
                  >
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded">
                        {{ getBlockIcon(result.block.type) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ getBlockTypeLabel(result.block.type) }}
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {{ result.preview }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          块 {{ result.blockIndex + 1 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 无搜索结果 -->
              <div v-else-if="searchQuery && searchResults.length === 0" class="mt-4 text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">未找到结果</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">尝试使用不同的关键词搜索</p>
              </div>

              <!-- 搜索提示 -->
              <div v-else class="mt-4 text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">搜索内容</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">输入关键词搜索计划中的内容</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="bg-gray-50 dark:bg-zinc-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="btn-primary w-full sm:ml-3 sm:w-auto sm:text-sm"
            @click="$emit('close')"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  blocks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select-block'])

const searchInput = ref(null)
const searchQuery = ref('')

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase().trim()
  const results = []
  
  props.blocks.forEach((block, blockIndex) => {
    const content = extractBlockContent(block)
    if (content.toLowerCase().includes(query)) {
      const preview = generatePreview(content, query)
      results.push({
        block,
        blockIndex,
        preview,
        content
      })
    }
  })
  
  return results
})

// 提取块内容
const extractBlockContent = (block) => {
  switch (block.type) {
    case 'heading':
      return block.content.text || ''
    case 'text':
      return block.content.text || ''
    case 'todo':
      return block.content.text || ''
    case 'quote':
      return block.content.text || ''
    case 'code':
      return block.content.code || ''
    case 'list':
      return block.content.items ? block.content.items.join(' ') : ''
    case 'table':
      const headers = block.content.headers ? block.content.headers.join(' ') : ''
      const rows = block.content.rows ? block.content.rows.flat().join(' ') : ''
      return headers + ' ' + rows
    case 'callout':
      return block.content.text || ''
    case 'image':
      return (block.content.alt || '') + ' ' + (block.content.url || '')
    case 'video':
      return (block.content.title || '') + ' ' + (block.content.url || '')
    case 'audio':
      return (block.content.title || '') + ' ' + (block.content.url || '')
    case 'formula':
      return block.content.latex || ''
    case 'collapse':
      return (block.content.title || '') + ' ' + (block.content.text || '')
    case 'columns':
      return block.content.columns ? block.content.columns.join(' ') : ''
    default:
      return block.content.text || ''
  }
}

// 生成预览文本
const generatePreview = (content, query) => {
  const index = content.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return content.substring(0, 100) + '...'
  
  const start = Math.max(0, index - 30)
  const end = Math.min(content.length, index + query.length + 30)
  let preview = content.substring(start, end)
  
  if (start > 0) preview = '...' + preview
  if (end < content.length) preview = preview + '...'
  
  return preview
}

// 获取块类型标签
const getBlockTypeLabel = (type) => {
  const labels = {
    text: '文本',
    heading: '标题',
    todo: '待办',
    image: '图片',
    video: '视频',
    audio: '音频',
    quote: '引用',
    callout: '标注',
    formula: '公式',
    collapse: '折叠',
    code: '代码',
    columns: '多列',
    table: '表格',
    list: '列表'
  }
  return labels[type] || '文本'
}

// 获取块类型图标
const getBlockIcon = (type) => {
  const icons = {
    text: 'T',
    heading: 'H',
    todo: '✓',
    image: '🖼',
    video: '▶',
    audio: '♪',
    quote: '"',
    callout: '!',
    formula: '∑',
    collapse: '▼',
    code: '</>',
    columns: '||',
    table: '⊞',
    list: '•'
  }
  return icons[type] || 'T'
}

// 选择搜索结果
const selectResult = (result) => {
  emit('select-block', result.blockIndex)
  emit('close')
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'Enter' && searchResults.value.length > 0) {
    selectResult(searchResults.value[0])
  }
}

// 监听显示状态，自动聚焦
watch(() => props.show, (show) => {
  if (show) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchQuery.value = ''
  }
})
</script>

<style scoped>
/* 搜索框动画 */
.relative input:focus {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 搜索结果悬停效果 */
.space-y-2 > div:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>
