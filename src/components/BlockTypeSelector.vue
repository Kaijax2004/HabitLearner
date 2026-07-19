<template>
  <transition name="block-selector">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto transform transition-all border border-gray-100 dark:border-gray-700" @click.stop>
        <!-- 头部 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">选择内容类型</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 搜索框 -->
        <div class="mb-4">
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索..."
              class="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-zinc-600/40 focus:border-zinc-400 text-sm transition-shadow"
              autofocus
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <!-- 内容类型列表 -->
        <div class="space-y-1">
          <button 
            v-for="blockType in filteredBlockTypes" 
            :key="blockType.type"
            @click="selectBlock(blockType.type)"
            class="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3 group text-left"
          >
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm group-hover:shadow transition-all"
            >
              <component :is="blockType.icon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ blockType.name }}</span>
                <span v-if="blockType.shortcut" class="text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">{{ blockType.shortcut }}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {{ blockType.description }}
              </div>
            </div>
          </button>
        </div>
        
        <!-- 底部提示 -->
        <div v-if="filteredBlockTypes.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          未找到相关内容类型
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')

// 块类型定义
const blockTypes = [
  {
    type: 'text',
    name: '文本',
    description: '添加普通文本内容',
    shortcut: 'Ctrl+Enter',
    colorClass: 'bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/50',
    iconClass: 'text-green-600 dark:text-green-400',
    icon: 'TextIcon'
  },
  {
    type: 'heading',
    name: '标题',
    description: '添加各级标题',
    shortcut: 'Ctrl+Shift+H',
    colorClass: 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700',
    iconClass: 'text-zinc-700 dark:text-zinc-300',
    icon: 'HeadingIcon'
  },
  {
    type: 'todo',
    name: '待办',
    description: '添加任务清单',
    shortcut: 'Ctrl+T',
    colorClass: 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50',
    iconClass: 'text-purple-600 dark:text-purple-400',
    icon: 'TodoIcon'
  },
  {
    type: 'image',
    name: '图片',
    description: '添加图片内容',
    shortcut: 'Ctrl+I',
    colorClass: 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50',
    iconClass: 'text-orange-600 dark:text-orange-400',
    icon: 'ImageIcon'
  },
  {
    type: 'code',
    name: '代码',
    description: '添加代码块',
    shortcut: 'Ctrl+Shift+C',
    colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    icon: 'CodeIcon'
  },
  {
    type: 'quote',
    name: '引用',
    description: '添加引用内容',
    shortcut: 'Ctrl+Shift+Q',
    colorClass: 'bg-pink-100 dark:bg-pink-900/30 group-hover:bg-pink-200 dark:group-hover:bg-pink-800/50',
    iconClass: 'text-pink-600 dark:text-pink-400',
    icon: 'QuoteIcon'
  },
  {
    type: 'video',
    name: '视频',
    description: '添加视频内容',
    shortcut: 'Ctrl+Shift+V',
    colorClass: 'bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50',
    iconClass: 'text-red-600 dark:text-red-400',
    icon: 'VideoIcon'
  },
  {
    type: 'audio',
    name: '音频',
    description: '添加音频内容',
    shortcut: 'Ctrl+Shift+A',
    colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/50',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    icon: 'AudioIcon'
  },
  {
    type: 'callout',
    name: '标注',
    description: '添加重要标注',
    shortcut: 'Ctrl+Shift+!',
    colorClass: 'bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50',
    iconClass: 'text-cyan-600 dark:text-cyan-400',
    icon: 'CalloutIcon'
  },
  {
    type: 'formula',
    name: '公式',
    description: '添加数学公式',
    shortcut: 'Ctrl+Shift+F',
    colorClass: 'bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50',
    iconClass: 'text-teal-600 dark:text-teal-400',
    icon: 'FormulaIcon'
  },
  {
    type: 'collapse',
    name: '折叠',
    description: '添加可折叠内容',
    shortcut: 'Ctrl+Shift+>',
    colorClass: 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700',
    iconClass: 'text-gray-600 dark:text-gray-400',
    icon: 'CollapseIcon'
  },
  {
    type: 'columns',
    name: '多列',
    description: '添加多列布局',
    shortcut: 'Ctrl+Shift+Col',
    colorClass: 'bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50',
    iconClass: 'text-violet-600 dark:text-violet-400',
    icon: 'ColumnsIcon'
  },
  {
    type: 'table',
    name: '表格',
    description: '添加数据表格',
    shortcut: 'Ctrl+Shift+T',
    colorClass: 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    icon: 'TableIcon'
  },
  {
    type: 'list',
    name: '列表',
    description: '添加有序或无序列表',
    shortcut: 'Ctrl+Shift+L',
    colorClass: 'bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50',
    iconClass: 'text-amber-600 dark:text-amber-400',
    icon: 'ListIcon'
  }
]

// 过滤后的块类型
const filteredBlockTypes = computed(() => {
  if (!searchQuery.value) return blockTypes
  
  const query = searchQuery.value.toLowerCase()
  return blockTypes.filter(block => 
    block.name.toLowerCase().includes(query) ||
    block.description.toLowerCase().includes(query) ||
    block.type.toLowerCase().includes(query)
  )
})

const selectBlock = (type) => {
  emit('select', type)
  close()
}

const close = () => {
  emit('close')
  searchQuery.value = ''
}

// 键盘事件处理
const handleKeydown = (e) => {
  if (!props.show) return
  
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

// 图标组件
const TextIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }
const HeadingIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>' }
const TodoIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' }
const ImageIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' }
const CodeIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>' }
const QuoteIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>' }
const VideoIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>' }
const AudioIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>' }
const CalloutIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8" /></svg>' }
const FormulaIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>' }
const CollapseIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>' }
const ColumnsIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>' }
const TableIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>' }
const ListIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 监听显示状态，自动聚焦搜索框
watch(() => props.show, (newShow) => {
  if (newShow) {
    nextTick(() => {
      const searchInput = document.querySelector('input[placeholder="搜索内容类型..."]')
      if (searchInput) {
        searchInput.focus()
      }
    })
  }
})
</script>

<style scoped>
/* 块选择器动画 */
.block-selector-enter-active, .block-selector-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.block-selector-enter-from, .block-selector-leave-to {
  opacity: 0;
}

.block-selector-enter-from .bg-white,
.block-selector-leave-to .bg-white {
  transform: scale(0.95) translateY(20px);
}

/* 键盘快捷键样式 */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.3);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.5);
}
</style>
