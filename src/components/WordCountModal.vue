<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- 字数统计面板 -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- 标题 -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  字数统计
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

              <!-- 总体统计 -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-zinc-950 dark:text-white">
                    {{ formatNumber(stats.total.words) }}
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">字数</div>
                </div>
                
                <div class="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-zinc-950 dark:text-white">
                    {{ formatNumber(stats.total.characters) }}
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">字符数</div>
                </div>
                
                <div class="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-zinc-950 dark:text-white">
                    {{ formatNumber(stats.total.blocks) }}
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">块数</div>
                </div>
              </div>

              <!-- 详细信息 -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ formatNumber(stats.total.charactersNoSpaces) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">字符数（不含空格）</div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ formatNumber(stats.total.paragraphs) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">段落数</div>
                </div>
              </div>

              <!-- 阅读时间 -->
                <div class="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-lg font-semibold text-zinc-950 dark:text-white">
                    {{ getReadingTime(stats.total.words) }}
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">预计阅读时间</div>
                </div>
              </div>

              <!-- 按块统计 -->
              <div v-if="stats.byBlock.length > 0">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                  按块统计
                </h4>
                <div class="max-h-64 overflow-y-auto">
                  <div class="space-y-2">
                    <div
                      v-for="(blockStat, index) in stats.byBlock"
                      :key="index"
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                          <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {{ getBlockTypeIcon(blockStat.blockType) }}
                          </span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ getBlockTypeName(blockStat.blockType) }} #{{ blockStat.blockIndex + 1 }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ blockStat.words }} 字 · {{ blockStat.characters }} 字符
                          </div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ blockStat.words }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">字</div>
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
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: () => ({
      total: {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        lines: 0,
        blocks: 0
      },
      byBlock: []
    })
  }
})

const emit = defineEmits(['close'])

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 获取阅读时间估算
const getReadingTime = (wordCount) => {
  const minutes = Math.ceil(wordCount / 200)
  if (minutes < 1) return '不到1分钟'
  if (minutes === 1) return '约1分钟'
  return `约${minutes}分钟`
}

// 获取块类型的中文名称
const getBlockTypeName = (type) => {
  const names = {
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
  return names[type] || '未知'
}

// 获取块类型图标
const getBlockTypeIcon = (type) => {
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
  return icons[type] || '?'
}
</script>

<style scoped>
/* 滚动条样式 */
.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色模式滚动条 */
.dark .max-h-64::-webkit-scrollbar-track {
  background: #374151;
}

.dark .max-h-64::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .max-h-64::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
