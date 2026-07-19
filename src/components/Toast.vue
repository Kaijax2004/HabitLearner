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
        'ring-1 ring-white/5 dark:ring-white/10',
        typeClasses
      ]"
    >
      <div
        :class="[
          'absolute inset-0 opacity-5',
          typeBackgroundGradient
        ]"
      ></div>

      <div class="relative flex items-start p-4">
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else-if="type === 'error'"
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg
            v-else-if="type === 'warning'"
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <svg
            v-else
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <p :class="['text-sm font-medium leading-5', typeTextColor]">
            {{ message }}
          </p>
          <p v-if="description" :class="['mt-1 text-xs leading-4', typeDescriptionColor]">
            {{ description }}
          </p>
        </div>

        <button
          @click.stop="close"
          :class="[
            'flex-shrink-0 ml-3 p-1 rounded-full transition-colors duration-200',
            'hover:bg-white/10 dark:hover:bg-white/10',
            typeCloseButton
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        v-if="duration > 0"
        :class="[
          'absolute bottom-0 left-0 h-1 bg-current opacity-15',
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

const progress = ref(100)
let progressTimer = null

const typeClasses = computed(() => {
  const baseClasses = 'bg-white/95 dark:bg-black/95 border-zinc-200/80 dark:border-zinc-800/80'

  switch (props.type) {
    case 'success':
      return `${baseClasses} ring-zinc-400`
    case 'error':
      return `${baseClasses} ring-zinc-700`
    case 'warning':
      return `${baseClasses} ring-zinc-500`
    default:
      return `${baseClasses} ring-zinc-300`
  }
})

const typeBackgroundGradient = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-gradient-to-r from-white to-zinc-400 dark:from-black dark:to-zinc-700'
    case 'error':
      return 'bg-gradient-to-r from-zinc-950 to-zinc-700 dark:from-black dark:to-zinc-800'
    case 'warning':
      return 'bg-gradient-to-r from-zinc-600 to-zinc-300 dark:from-zinc-800 dark:to-zinc-600'
    default:
      return 'bg-gradient-to-r from-zinc-700 to-zinc-400 dark:from-zinc-900 dark:to-zinc-700'
  }
})

const typeIconBg = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-zinc-700'
    case 'error':
      return 'bg-zinc-950'
    case 'warning':
      return 'bg-zinc-600'
    default:
      return 'bg-zinc-800'
  }
})

const typeTextColor = computed(() => 'text-zinc-950 dark:text-white')
const typeDescriptionColor = computed(() => 'text-zinc-600 dark:text-zinc-400')
const typeCloseButton = computed(() => 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200')

const typeProgressBar = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-zinc-700'
    case 'error':
      return 'text-zinc-950'
    case 'warning':
      return 'text-zinc-600'
    default:
      return 'text-zinc-500'
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

  setTimeout(() => {
    emit('close')
  }, 200)
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
})
</script>
