<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- 模板选择器 -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- 标题 -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  选择模板
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- 搜索框 -->
              <div class="relative mb-6">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索模板..."
                  class="w-full px-4 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- 分类标签 -->
              <div class="flex flex-wrap gap-2 mb-6">
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="selectedCategory = selectedCategory === category ? null : category"
                  class="px-3 py-1 text-sm rounded-full border transition-colors"
                  :class="selectedCategory === category 
                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'"
                >
                  {{ category }}
                </button>
              </div>

              <!-- 模板列表 -->
              <div class="max-h-96 overflow-y-auto">
                <div v-if="filteredTemplates.length === 0" class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">未找到模板</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">尝试使用不同的关键词搜索</p>
                </div>
                
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="template in filteredTemplates"
                    :key="template.id"
                    class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors group"
                    @click="selectTemplate(template)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {{ template.name }}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {{ template.description }}
                        </p>
                        <div class="flex items-center gap-2 mt-2">
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {{ template.category }}
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ template.blocks.length }} 个块
                          </span>
                        </div>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <!-- 模板预览 -->
                    <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(block, index) in template.blocks.slice(0, 3)"
                          :key="index"
                          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {{ getBlockTypeLabel(block.type) }}
                        </span>
                        <span v-if="template.blocks.length > 3" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          +{{ template.blocks.length - 3 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            @click="$emit('close')"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  templates: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select-template'])

const searchQuery = ref('')
const selectedCategory = ref(null)

// 过滤后的模板
const filteredTemplates = computed(() => {
  let filtered = props.templates

  // 按分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(template => template.category === selectedCategory.value)
  }

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

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

// 选择模板
const selectTemplate = (template) => {
  emit('select-template', template)
  emit('close')
}
</script>

<style scoped>
/* 模板卡片悬停效果 */
.group:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* 滚动条样式 */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色模式滚动条 */
.dark .max-h-96::-webkit-scrollbar-track {
  background: #374151;
}

.dark .max-h-96::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .max-h-96::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
