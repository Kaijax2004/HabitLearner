<template>
  <Teleport to="body">
    <Transition name="reminder-fade">
      <div v-if="reminder" class="reminder-overlay" @click.self="handleDismiss">
        <div class="reminder-modal surface-panel card-enhanced">
          <button class="reminder-close" type="button" @click="handleDismiss">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="reminder-orb" :style="{ background: reminderGlow }"></div>

          <div class="relative z-10">
            <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/40 bg-white/40 shadow-apple dark:border-white/10 dark:bg-white/[0.06]">
              <img
                v-if="isRenderableMediaUrl(reminder.habit.icon)"
                :src="resolveMediaUrl(reminder.habit.icon)"
                alt="习惯图标"
                class="h-full w-full object-cover"
              />
              <span v-else class="text-3xl">{{ reminder.habit.icon || '✓' }}</span>
            </div>

            <div class="text-center">
              <p class="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                {{ reminder.source === 'snooze' ? '稍后提醒' : '习惯提醒' }}
              </p>
              <h3 class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {{ currentHabit?.name || reminder.habit.name }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {{ reminderMessage }}
              </p>
            </div>

            <div class="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ reminder.reminderTime || '现在' }}</span>
            </div>

            <div v-if="showCommentForm" class="mt-6 space-y-4 rounded-3xl border border-zinc-200/80 bg-white/70 p-4 text-left dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <label class="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">留言标题</label>
                <input
                  v-model="commentTitle"
                  type="text"
                  class="input-apple"
                  placeholder="给今天的第一次打卡起个标题"
                />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">留言内容</label>
                <textarea
                  v-model="commentText"
                  class="min-h-[108px] w-full rounded-[22px] border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:focus:border-white"
                  placeholder="记录一下今天的状态、感受或想法"
                />
              </div>
            </div>

            <div v-if="showCommentForm" class="mt-6 grid gap-3 sm:grid-cols-3">
              <button type="button" class="btn-primary reminder-action-complete" @click="submitWithComment">
                提交打卡
              </button>
              <button type="button" class="btn-secondary" @click="submitWithoutComment">
                跳过留言
              </button>
              <button type="button" class="btn-ghost border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" @click="cancelCommentMode">
                返回
              </button>
            </div>

            <div v-else class="mt-6 grid gap-3 sm:grid-cols-3">
              <button type="button" class="btn-primary reminder-action-complete" @click="handlePrimaryAction">
                {{ requiresCommentPrompt ? '去打卡' : '完成' }}
              </button>
              <button type="button" class="btn-secondary" @click="handleSnooze">
                5 分钟后提醒
              </button>
              <button type="button" class="btn-ghost border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" @click="handleDismiss">
                忽略
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHabitStore } from '@/stores/habit'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'
import { formatLocalDateKey } from '@/utils/date.js'

const props = defineProps({
  reminder: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['complete', 'snooze', 'dismiss'])
const habitStore = useHabitStore()

const commentTitle = ref('')
const commentText = ref('')
const showCommentForm = ref(false)

const currentHabit = computed(() => {
  const habitId = props.reminder?.habit?.id
  return habitId ? habitStore.getHabitById(habitId) || props.reminder?.habit : props.reminder?.habit
})

const todayCount = computed(() => {
  const today = formatLocalDateKey()
  const todayCheckIn = currentHabit.value?.checkIns?.find(checkIn => checkIn.date === today)
  return Number(todayCheckIn?.count || 0)
})

const requiresCommentPrompt = computed(() => (
  Boolean(currentHabit.value?.enableComments) && todayCount.value === 0
))

const reminderGlow = computed(() => {
  const color = currentHabit.value?.color || props.reminder?.habit?.color || '#0f172a'
  return `radial-gradient(circle at center, ${color}26 0%, transparent 72%)`
})

const reminderMessage = computed(() => {
  if (showCommentForm.value) {
    return '这是今天的第一次打卡，可以顺手留一句话，也可以直接跳过。'
  }

  if (props.reminder?.source === 'snooze') {
    return '稍后提醒时间到了，现在继续把这个习惯完成。'
  }

  if (requiresCommentPrompt.value) {
    return '到时间了。今天第一次打卡时会先提示你是否留言。'
  }

  return '设定的提醒时间到了，继续保持节奏。'
})

const resetCommentState = () => {
  showCommentForm.value = false
  commentTitle.value = ''
  commentText.value = ''
}

watch(() => props.reminder?.id, () => {
  resetCommentState()
})

const handlePrimaryAction = () => {
  if (!props.reminder) return
  if (requiresCommentPrompt.value) {
    showCommentForm.value = true
    return
  }

  emit('complete', props.reminder)
}

const submitWithComment = () => {
  if (!props.reminder) return

  emit('complete', {
    ...props.reminder,
    comment: {
      title: commentTitle.value.trim(),
      content: commentText.value.trim()
    }
  })
  resetCommentState()
}

const submitWithoutComment = () => {
  if (!props.reminder) return

  emit('complete', {
    ...props.reminder,
    comment: null,
    skipComment: true
  })
  resetCommentState()
}

const cancelCommentMode = () => {
  resetCommentState()
}

const handleSnooze = () => {
  resetCommentState()
  emit('snooze', props.reminder)
}

const handleDismiss = () => {
  resetCommentState()
  emit('dismiss', props.reminder)
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.reminder) {
    event.preventDefault()
    event.stopPropagation()
    if (showCommentForm.value) {
      resetCommentState()
      return
    }
    handleDismiss()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.reminder-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(16px);
}

.reminder-modal {
  position: relative;
  width: min(100%, 440px);
  overflow: hidden;
  border-radius: 30px;
  padding: 28px;
}

.reminder-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.45);
  color: #3f3f46;
  transition: all 0.2s ease;
}

.reminder-close:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.65);
}

.dark .reminder-close {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  color: #d4d4d8;
}

.dark .reminder-close:hover {
  background: rgba(255, 255, 255, 0.12);
}

.reminder-orb {
  position: absolute;
  inset: -20% auto auto 50%;
  width: 360px;
  height: 360px;
  transform: translateX(-50%);
  pointer-events: none;
  filter: blur(10px);
}

.reminder-action-complete {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.reminder-fade-enter-active,
.reminder-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.reminder-fade-enter-from,
.reminder-fade-leave-to {
  opacity: 0;
}

.reminder-fade-enter-from .reminder-modal,
.reminder-fade-leave-to .reminder-modal {
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 640px) {
  .reminder-modal {
    padding: 24px 18px 18px;
    border-radius: 26px;
  }
}
</style>
