<template>
  <transition name="shortcuts-modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click="close">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- 头部 -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">键盘快捷键</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">提升编辑效率的快捷键指南</p>
          </div>
          <button @click="close" class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 快捷键分类 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 基础编辑 -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              基础编辑
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in basicShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 块操作 -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              块操作
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in blockShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 文本格式化 -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              文本格式化
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in formatShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 导航操作 -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              导航操作
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in navigationShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部提示 -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              💡 提示：按 <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd> 随时查看此帮助
            </div>
            <button @click="close" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// 快捷键定义
const basicShortcuts = [
  {
    action: '打开块类型选择器',
    description: '快速添加各种内容块',
    keys: ['/']
  },
  {
    action: '保存文档',
    description: '自动保存当前编辑内容',
    keys: ['Ctrl', 'S']
  },
  {
    action: '撤销操作',
    description: '撤销上一步操作',
    keys: ['Ctrl', 'Z']
  },
  {
    action: '重做操作',
    description: '重做被撤销的操作',
    keys: ['Ctrl', 'Y']
  },
  {
    action: '全选',
    description: '选中所有内容',
    keys: ['Ctrl', 'A']
  }
]

const blockShortcuts = [
  {
    action: '添加文本块',
    description: '快速插入文本内容',
    keys: ['Ctrl', 'Enter']
  },
  {
    action: '添加标题',
    description: '插入各级标题',
    keys: ['Ctrl', 'Shift', 'H']
  },
  {
    action: '添加待办',
    description: '插入任务清单',
    keys: ['Ctrl', 'T']
  },
  {
    action: '添加代码块',
    description: '插入代码内容',
    keys: ['Ctrl', 'Shift', 'C']
  },
  {
    action: '添加表格',
    description: '插入数据表格',
    keys: ['Ctrl', 'Shift', 'T']
  },
  {
    action: '添加列表',
    description: '插入有序或无序列表',
    keys: ['Ctrl', 'Shift', 'L']
  },
  {
    action: '删除当前块',
    description: '删除当前编辑的块',
    keys: ['Ctrl', 'Backspace']
  }
]

const formatShortcuts = [
  {
    action: '粗体',
    description: '将选中文本设为粗体',
    keys: ['Ctrl', 'B']
  },
  {
    action: '斜体',
    description: '将选中文本设为斜体',
    keys: ['Ctrl', 'I']
  },
  {
    action: '添加链接',
    description: '为选中文本添加链接',
    keys: ['Ctrl', 'K']
  },
  {
    action: '内联代码',
    description: '将选中文本设为代码格式',
    keys: ['Ctrl', '`']
  },
  {
    action: '删除线',
    description: '为选中文本添加删除线',
    keys: ['Ctrl', 'Shift', 'S']
  },
  {
    action: '高亮',
    description: '为选中文本添加高亮',
    keys: ['Ctrl', 'Shift', 'H']
  },
  {
    action: '待办切换',
    description: '切换待办项完成状态',
    keys: ['Space']
  }
]

const navigationShortcuts = [
  {
    action: '关闭弹窗',
    description: '关闭当前打开的弹窗',
    keys: ['Esc']
  },
  {
    action: '搜索内容',
    description: '在计划中搜索内容',
    keys: ['Ctrl', 'F']
  },
  {
    action: '显示快捷键',
    description: '显示此快捷键帮助',
    keys: ['?']
  },
  {
    action: '下一个块',
    description: '移动到下一个内容块',
    keys: ['Tab']
  },
  {
    action: '上一个块',
    description: '移动到上一个内容块',
    keys: ['Shift', 'Tab']
  },
  {
    action: '创建新块',
    description: '在当前块后创建新块',
    keys: ['Enter']
  }
]

// 键盘事件处理
const handleKeydown = (e) => {
  if (!props.show) return
  
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 快捷键模态框动画 */
.shortcuts-modal-enter-active, .shortcuts-modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcuts-modal-enter-from, .shortcuts-modal-leave-to {
  opacity: 0;
}

.shortcuts-modal-enter-from .bg-white,
.shortcuts-modal-leave-to .bg-white {
  transform: scale(0.95) translateY(20px);
}

/* 键盘快捷键样式 */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

/* 悬停效果 */
.hover\:bg-gray-100:hover {
  background-color: rgba(243, 244, 246, 0.8);
}

.dark .hover\:bg-gray-800:hover {
  background-color: rgba(31, 41, 55, 0.8);
}
</style>
