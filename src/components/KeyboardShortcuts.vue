<template>
  <transition name="shortcuts-modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click="close">
      <div class="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800" @click.stop>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-zinc-950 dark:text-white">快捷键帮助</h2>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">提升编辑效率的快捷键指南</p>
          </div>
          <button @click="close" class="btn-control w-10 h-10 p-0 rounded-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              基础编辑
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in basicShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              块操作
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in blockShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              文本格式化
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in formatShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              导航操作
            </h3>
            <div class="space-y-3">
              <div v-for="shortcut in navigationShortcuts" :key="shortcut.action" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ shortcut.action }}</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ shortcut.description }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    {{ key }}
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center justify-between">
            <div class="text-sm text-zinc-500 dark:text-zinc-400">
              提示：按 <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-xs">?</kbd> 随时查看此帮助
            </div>
            <button @click="close" class="btn-primary px-4 py-2 text-sm">
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

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const close = () => emit('close')

const basicShortcuts = [
  { action: '打开块类型选择器', description: '快速添加各种内容块', keys: ['/'] },
  { action: '保存文档', description: '自动保存当前编辑内容', keys: ['Ctrl', 'S'] },
  { action: '撤销操作', description: '撤销上一条操作', keys: ['Ctrl', 'Z'] },
  { action: '重做操作', description: '重做被撤销的操作', keys: ['Ctrl', 'Y'] },
  { action: '全选', description: '选中所有内容', keys: ['Ctrl', 'A'] }
]

const blockShortcuts = [
  { action: '添加文本块', description: '快速插入文本内容', keys: ['Ctrl', 'Enter'] },
  { action: '添加标题块', description: '插入标题内容', keys: ['Ctrl', 'Alt', '1'] },
  { action: '添加待办块', description: '插入待办事项', keys: ['Ctrl', 'Alt', '2'] },
  { action: '添加分割线', description: '插入分割线', keys: ['Ctrl', 'Alt', '-'] }
]

const formatShortcuts = [
  { action: '加粗', description: '切换文本加粗', keys: ['Ctrl', 'B'] },
  { action: '斜体', description: '切换文本斜体', keys: ['Ctrl', 'I'] },
  { action: '引用', description: '切换引用样式', keys: ['Ctrl', 'Q'] },
  { action: '代码', description: '切换代码样式', keys: ['Ctrl', '`'] }
]

const navigationShortcuts = [
  { action: '搜索', description: '在当前计划中查找内容', keys: ['Ctrl', 'F'] },
  { action: '字数统计', description: '查看文档统计信息', keys: ['Ctrl', 'Shift', 'S'] },
  { action: '打开模板', description: '快速套用模板', keys: ['Ctrl', 'P'] }
]

onMounted(() => {
  const handleKeydown = (event) => {
    if (event.key === 'Escape') close()
  }
  document.addEventListener('keydown', handleKeydown)
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
})
</script>
