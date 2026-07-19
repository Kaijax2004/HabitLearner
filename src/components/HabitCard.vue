<template>
  <BaseCard
    class="relative h-full overflow-hidden card-enhanced"
    :hover="false"
    padding="small"
    :class="{ 'ring-2 ring-primary-500': isEditMode && isSelected }"
  >
    <div v-if="isEditMode" class="absolute top-3 left-3 z-10">
      <div
        class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200"
        :class="isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'"
        @click.stop="handleSelect"
      >
        <svg v-if="isSelected" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <div class="flex items-start justify-between" :class="{ 'pl-9': isEditMode }">
      <div class="flex flex-1 cursor-pointer items-center space-x-2.5" @click.stop="handleCardClick">
        <div
          class="icon-enhanced flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-apple text-[1.35rem]"
          :style="{ backgroundColor: iconBackgroundColor }"
        >
          <img
            v-if="isRenderableMediaUrl(habit.icon)"
            :src="resolveMediaUrl(habit.icon)"
            alt="习惯图标"
            class="h-full w-full rounded-apple object-cover"
          />
          <span v-else class="text-2xl">{{ habit.icon || '📝' }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="title-tertiary truncate">{{ habit.name }}</h3>
          <p class="text-body-small truncate">{{ habit.category || '未分类' }}</p>

          <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-xs text-gray-400 dark:text-gray-500">连续</span>
            <span class="text-sm font-medium text-primary-500">{{ habit.streak || 0 }}天</span>

            <span class="text-xs text-gray-400 dark:text-gray-500">{{ progressScopeLabel }}</span>
            <span class="text-sm font-medium" :class="progressMeta.textClass">
              {{ progressCountText }}
            </span>

            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="progressMeta.badgeClass"
            >
              {{ progressStatusText }}
            </span>
          </div>
        </div>
      </div>

      <button
        v-if="!isEditMode"
        @click.stop="handleCheckIn"
        :disabled="isLoading || isCompleted"
        class="ml-2.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200"
        :class="checkInButtonClass"
        :style="checkInButtonStyle"
        :title="checkInButtonTitle"
      >
        <svg
          v-if="isCompleted"
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg
          v-else-if="isLoading"
          class="h-6 w-6 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg
          v-else
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>

    <div class="mt-3">
      <div class="mb-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{{ progressLabel }}</span>
        <span :class="progressMeta.textClass">{{ progressStatusText }}</span>
      </div>
      <div class="h-2 w-full rounded-full transition-colors duration-300" :class="progressTrackClass">
        <div
          class="h-2 rounded-full transition-all duration-500 ease-out"
          :class="progressFillClass"
          :style="progressFillStyle"
        />
      </div>
    </div>

    <transition name="complete">
      <div
        v-if="showCompleteAnimation"
        class="absolute inset-0 flex items-center justify-center bg-success-500 bg-opacity-20"
      >
        <div class="text-4xl text-success-500 animate-bounce-gentle">✓</div>
      </div>
    </transition>

    <Teleport to="body">
      <div
        v-if="showCommentModal"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        @click.self="closeCommentModal"
      >
        <div class="w-full max-w-md rounded-apple bg-white p-6 shadow-2xl dark:bg-gray-800">
          <div class="mb-6 text-center">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">打卡留言</h3>
              <button
                @click="closeCommentModal"
                class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">今天首次打卡，顺手记录一下当前感受。</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">标题</label>
              <input
                v-model="commentTitle"
                type="text"
                placeholder="给这次打卡起个标题"
                class="w-full rounded-apple border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">正文</label>
              <textarea
                v-model="commentText"
                placeholder="记录一下今天的感受、收获或想法"
                class="h-24 w-full resize-none rounded-apple border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div class="mt-6 flex space-x-3">
            <button
              @click="handleCompleteWithComment"
              :disabled="isLoading"
              class="btn-enhanced flex-1 rounded-apple bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {{ isLoading ? '打卡中...' : '完成打卡' }}
            </button>
            <button
              @click="handleCompleteWithoutComment"
              :disabled="isLoading"
              class="btn-enhanced flex-1 rounded-apple bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              跳过留言
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </BaseCard>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHabitStore } from '@/stores/habit'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'
import { formatLocalDateKey } from '@/utils/date.js'
import BaseCard from './BaseCard.vue'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'complete', 'select'])

const habitStore = useHabitStore()

const isLoading = ref(false)
const showCompleteAnimation = ref(false)
const showCommentModal = ref(false)
const commentText = ref('')
const commentTitle = ref('')
const isProcessing = ref(false)

const normalizeHexColor = (color, fallback = '#18181b') => {
  if (typeof color !== 'string') return fallback

  const value = color.trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return fallback

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }

  return value
}

const withAlpha = (hexColor, alpha) => `${normalizeHexColor(hexColor)}${alpha}`

const accentColor = computed(() => normalizeHexColor(props.habit.color, '#111827'))
const iconBackgroundColor = computed(() => withAlpha(accentColor.value, '18'))

const todayProgress = computed(() => {
  habitStore.forceUpdate

  if (!props.habit.checkIns) return null

  const today = formatLocalDateKey()
  return props.habit.checkIns.find(checkIn => checkIn.date === today) || null
})

const weeklyProgress = computed(() => {
  if (props.habit.frequency === 'daily') return 0
  return habitStore.getWeeklyProgress(props.habit)
})

const goalCount = computed(() => {
  const target = Number(props.habit.target)
  return Number.isFinite(target) && target > 0 ? target : 1
})

const currentCount = computed(() => {
  if (props.habit.frequency === 'daily') {
    return todayProgress.value?.count || 0
  }

  return weeklyProgress.value || 0
})

const progressRatio = computed(() => Math.min(currentCount.value / goalCount.value, 1))
const hasStarted = computed(() => currentCount.value > 0)
const isCompleted = computed(() => currentCount.value >= goalCount.value)

const progressState = computed(() => {
  if (isCompleted.value) return 'completed'
  if (hasStarted.value) return 'in-progress'
  return 'idle'
})

const progressScopeLabel = computed(() => (props.habit.frequency === 'daily' ? '今日' : '本周'))
const progressLabel = computed(() => (props.habit.frequency === 'daily' ? '今日进度' : '本周进度'))
const progressCountText = computed(() => `${currentCount.value}/${goalCount.value}次`)

const progressStatusText = computed(() => {
  if (progressState.value === 'completed') return '已完成'
  if (progressState.value === 'in-progress') return '进行中'
  return '未开始'
})

const progressMeta = computed(() => {
  switch (progressState.value) {
    case 'completed':
      return {
        textClass: 'text-emerald-600 dark:text-emerald-400',
        badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      }
    case 'in-progress':
      return {
        textClass: 'text-zinc-900 dark:text-white',
        badgeClass: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
      }
    default:
      return {
        textClass: 'text-zinc-500 dark:text-zinc-400',
        badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
      }
  }
})

const checkInButtonClass = computed(() => {
  if (isCompleted.value) {
    return 'bg-emerald-500 text-white shadow-apple-glow cursor-not-allowed'
  }

  if (progressState.value === 'in-progress') {
    return 'text-white shadow-sm hover:opacity-90 active:scale-95'
  }

  return 'border border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-100 dark:hover:text-zinc-900'
})

const checkInButtonStyle = computed(() => {
  if (progressState.value === 'in-progress' && !isCompleted.value) {
    return { backgroundColor: accentColor.value }
  }

  return {}
})

const checkInButtonTitle = computed(() => {
  if (isCompleted.value) return '今天已完成'
  if (progressState.value === 'in-progress') return '继续打卡'
  return '开始打卡'
})

const progressTrackClass = computed(() => {
  if (isCompleted.value) {
    return 'bg-emerald-100 dark:bg-emerald-950/40'
  }

  return 'bg-zinc-200 dark:bg-zinc-800'
})

const progressFillClass = computed(() => {
  if (isCompleted.value) {
    return 'bg-emerald-500'
  }

  if (progressState.value === 'in-progress') {
    return 'shadow-sm'
  }

  return 'bg-zinc-300 dark:bg-zinc-700'
})

const progressFillStyle = computed(() => {
  const width = `${Math.max(progressRatio.value, 0) * 100}%`

  if (progressState.value === 'in-progress') {
    return {
      width,
      backgroundColor: accentColor.value
    }
  }

  return { width }
})

const handleCardClick = () => {
  emit('click')
}

const handleSelect = () => {
  emit('select', props.habit.id)
}

const closeCommentModal = () => {
  showCommentModal.value = false
  commentText.value = ''
  commentTitle.value = ''
  isProcessing.value = false
}

const handleCheckIn = () => {
  if (isCompleted.value || isProcessing.value || showCommentModal.value) {
    return
  }

  const isFirstCheckIn = !todayProgress.value || Number(todayProgress.value.count || 0) === 0

  if (props.habit.enableComments && isFirstCheckIn) {
    isProcessing.value = true
    showCommentModal.value = true
    return
  }

  handleCompleteWithoutComment()
}

const finishCompletion = () => {
  closeCommentModal()
  showCompleteAnimation.value = true
  setTimeout(() => {
    showCompleteAnimation.value = false
  }, 1500)
  emit('complete', props.habit.id)
}

const handleCompleteWithComment = async () => {
  isLoading.value = true

  try {
    const comment = {
      title: commentTitle.value,
      content: commentText.value
    }

    const result = await habitStore.completeHabit(props.habit.id, comment)
    if (result.success) {
      finishCompletion()
    } else {
      console.error('完成习惯失败:', result.error)
    }
  } catch (error) {
    console.error('完成习惯时发生错误:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCompleteWithoutComment = async () => {
  isLoading.value = true

  try {
    const result = await habitStore.completeHabit(props.habit.id, null)
    if (result.success) {
      finishCompletion()
    } else {
      console.error('完成习惯失败:', result.error)
    }
  } catch (error) {
    console.error('完成习惯时发生错误:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.complete-enter-active,
.complete-leave-active {
  transition: all 0.3s ease;
}

.complete-enter-from,
.complete-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
