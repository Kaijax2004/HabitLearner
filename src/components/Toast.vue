<template>
  <div
    data-toast
    class="w-full pointer-events-auto"
    @click="handleClick"
  >
        <div
          :class="[
            'relative overflow-hidden rounded-apple shadow-2xl backdrop-blur-sm border',
            'transform transition-all duration-300 ease-out',
            'ring-2 ring-opacity-50',
            typeClasses
          ]"
        >
          <!-- 背景渐变 -->
          <div
            :class="[
              'absolute inset-0 opacity-10',
              typeBackgroundGradient
            ]"
          ></div>
          
          <!-- 内容区域 -->
          <div class="relative flex items-start p-4">
            <!-- 图标 -->
            <div
              :class="[
                'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5',
                typeIconBg
              ]"
            >
              <svg
                v-if="type === 'success'"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else-if="type === 'error'"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <svg
                v-else-if="type === 'warning'"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <!-- 文本内容 -->
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-sm font-medium leading-5',
                  typeTextColor
                ]"
              >
                {{ message }}
              </p>
              <p
                v-if="description"
                :class="[
                  'mt-1 text-xs leading-4',
                  typeDescriptionColor
                ]"
              >
                {{ description }}
              </p>
            </div>
            
            <!-- 关闭按钮 -->
            <button
              @click.stop="close"
              :class="[
                'flex-shrink-0 ml-3 p-1 rounded-full transition-colors duration-200',
                'hover:bg-black/10 dark:hover:bg-white/10',
                typeCloseButton
              ]"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <!-- 进度条 -->
          <div
            v-if="duration > 0"
            :class="[
              'absolute bottom-0 left-0 h-1 bg-current opacity-30',
              typeProgressBar
            ]"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 4000
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// visible状态由ToastContainer管理
const progress = ref(100)
let progressTimer = null
let closeTimer = null

// 类型相关的样式类
const typeClasses = computed(() => {
  const baseClasses = 'bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-700/50'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} border-green-200/50 dark:border-green-700/50 ring-green-500`
    case 'error':
      return `${baseClasses} border-red-200/50 dark:border-red-700/50 ring-red-500`
    case 'warning':
      return `${baseClasses} border-yellow-200/50 dark:border-yellow-700/50 ring-yellow-500`
    default:
      return `${baseClasses} border-blue-200/50 dark:border-blue-700/50 ring-blue-500`
  }
})

const typeBackgroundGradient = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-gradient-to-r from-green-500 to-emerald-500'
    case 'error':
      return 'bg-gradient-to-r from-red-500 to-rose-500'
    case 'warning':
      return 'bg-gradient-to-r from-yellow-500 to-amber-500'
    default:
      return 'bg-gradient-to-r from-blue-500 to-indigo-500'
  }
})

const typeIconBg = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-blue-500'
  }
})

const typeTextColor = computed(() => {
  return 'text-gray-900 dark:text-gray-100'
})

const typeDescriptionColor = computed(() => {
  return 'text-gray-600 dark:text-gray-400'
})

const typeCloseButton = computed(() => {
  return 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
})

const typeProgressBar = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
})

const startProgress = () => {
  if (props.duration <= 0) return
  
  const startTime = Date.now()
  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, props.duration - elapsed)
    progress.value = (remaining / props.duration) * 100
    
    if (remaining > 0) {
      progressTimer = requestAnimationFrame(updateProgress)
    } else {
      close()
    }
  }
  
  progressTimer = requestAnimationFrame(updateProgress)
}

const close = () => {
  if (progressTimer) {
    cancelAnimationFrame(progressTimer)
    progressTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  
  // 延迟触发关闭事件，等待动画完成
  setTimeout(() => {
    emit('close')
  }, 300)
}

const handleClick = () => {
  if (props.closable) {
    close()
  }
}

onMounted(() => {
  if (props.duration > 0) {
    startProgress()
  }
})

onUnmounted(() => {
  if (progressTimer) {
    cancelAnimationFrame(progressTimer)
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
  }
})
</script>
