<template>
  <AppLayout title="复盘">
    <div class="review-page space-y-5">
      <section class="review-hero rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Review</p>
        <div class="mt-3 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">
              {{ activeCopy.heroTitle }}
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              {{ activeCopy.heroDescription }}
            </p>
          </div>

          <div class="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-white/5">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{{ activeCopy.summaryLabel }}</p>
            <p class="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
              {{ activeSummary }}
            </p>
          </div>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Closeout</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ activeCopy.formTitle }}</h2>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="option in reviewTypeOptions"
                  :key="option.value"
                  type="button"
                  class="review-mode-button"
                  :class="{ 'is-active': reviewType === option.value }"
                  @click="setReviewType(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3 rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{{ activeCopy.dateLabel }}</p>
                <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{{ reviewDate }}</p>
              </div>
              <input
                v-model="reviewDate"
                type="date"
                class="review-input sm:max-w-[13rem]"
                @change="loadCurrentReview"
              />
            </div>

            <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {{ errorMessage }}
            </div>

            <div class="grid gap-3">
              <label class="review-field-label">
                <span>{{ activeCopy.completedLabel }}</span>
                <textarea v-model="form.completed" class="review-textarea" rows="4" :placeholder="activeCopy.completedPlaceholder"></textarea>
              </label>

              <label class="review-field-label">
                <span>{{ activeCopy.blockedLabel }}</span>
                <textarea v-model="form.blocked" class="review-textarea" rows="5" :placeholder="activeCopy.blockedPlaceholder"></textarea>
              </label>

              <label class="review-field-label">
                <span>{{ activeCopy.nextStepLabel }}</span>
                <textarea v-model="form.nextStep" class="review-textarea is-compact" rows="3" :placeholder="activeCopy.nextStepPlaceholder"></textarea>
              </label>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input v-model="form.mood" class="review-input sm:max-w-[14rem]" :placeholder="activeCopy.moodPlaceholder" />
                <button class="review-primary-button" type="button" :disabled="isSaving" @click="saveReview">
                  {{ isSaving ? '保存中...' : activeCopy.saveLabel }}
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <aside class="space-y-5">
          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Signals</p>
            <div class="mt-4 space-y-3">
              <div v-for="item in signalCards" :key="item.label" class="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                <p class="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
                <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{{ activeCopy.actionsTitle }}</p>
            <div class="mt-4 space-y-2">
              <p
                v-for="action in nextActions"
                :key="action.title"
                class="rounded-2xl border border-zinc-200/80 px-4 py-3 text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
              >
                {{ action.title }}
              </p>
            </div>
          </BaseCard>

          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Closeout Rule</p>
            <div class="mt-4 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <p v-for="rule in activeCopy.rules" :key="rule">{{ rule }}</p>
            </div>
          </BaseCard>
        </aside>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { getReviewEntry, getWorkspaceToday, saveReviewEntry } from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'
import { formatLocalDateKey } from '@/utils/date.js'

const { success, error } = useToast()
const today = ref(null)
const reviewType = ref('daily')
const reviewDate = ref(formatLocalDateKey())
const isSaving = ref(false)
const isLoadingReview = ref(false)
const errorMessage = ref('')
const form = reactive({
  completed: '',
  blocked: '',
  nextStep: '',
  mood: ''
})

const reviewTypeOptions = [
  { label: '每日复盘', value: 'daily' },
  { label: '周复盘', value: 'weekly' }
]

const copyMap = {
  daily: {
    heroTitle: '把今天收束成明天的第一步',
    heroDescription: '每日复盘不是额外任务，而是把习惯、计划、学习和专注留下的线索整理成下一步行动。',
    summaryLabel: 'Today',
    formTitle: '今日复盘',
    dateLabel: '复盘日期',
    completedLabel: '今天完成了什么',
    completedPlaceholder: '写下已经完成的事，不需要很长，真实就好。',
    blockedLabel: '今天卡住了什么',
    blockedPlaceholder: '记录阻力、分心、拖延、资源缺口，或从收集箱带入的复盘问题。',
    nextStepLabel: '明天第一步',
    nextStepPlaceholder: '只写一个最小行动，让明天更容易开始。',
    moodPlaceholder: '状态 / 情绪',
    saveLabel: '保存今日复盘',
    actionsTitle: 'Next Actions',
    rules: [
      '1. 只记录真实发生的事，不补写不存在的完成。',
      '2. 卡点越具体，明天越容易调整。',
      '3. 明天第一步必须足够小，最好 5-20 分钟能启动。'
    ]
  },
  weekly: {
    heroTitle: '把一周的推进整理成下一轮策略',
    heroDescription: '周复盘关注轨道是否持续推进：哪些动作有效，哪里反复卡住，下周应该保留、减少或调整什么。',
    summaryLabel: 'This Week',
    formTitle: '周复盘',
    dateLabel: '周复盘锚点',
    completedLabel: '本周真正推进了什么',
    completedPlaceholder: '写下本周对习惯、计划、学习、专注或轨道有实际推进的动作。',
    blockedLabel: '本周反复卡住了什么',
    blockedPlaceholder: '记录重复出现的阻力、低效安排、过载信号或轨道复盘问题。',
    nextStepLabel: '下周第一步',
    nextStepPlaceholder: '写下下周最先启动的一件小事，越具体越好。',
    moodPlaceholder: '本周状态',
    saveLabel: '保存周复盘',
    actionsTitle: 'Week Moves',
    rules: [
      '1. 周复盘看趋势，不纠结单日波动。',
      '2. 每条轨道只保留一个最关键调整。',
      '3. 下周第一步要能在 24-72 小时内启动。'
    ]
  }
}

const activeCopy = computed(() => copyMap[reviewType.value] || copyMap.daily)
const todaySummary = computed(() => today.value?.currentTruth?.summary || '正在整理今日状态，稍后会显示习惯、专注和计划摘要。')
const weeklySummary = computed(() => {
  const status = today.value?.statusBar || {}
  const riskCount = today.value?.currentTruth?.risks?.length || 0
  return `以 ${reviewDate.value} 为锚点：当前稳定度 ${status.stability || 0}%，今日专注 ${status.focusMinutes || 0} 分钟，待关注风险 ${riskCount} 条。`
})
const activeSummary = computed(() => (reviewType.value === 'weekly' ? weeklySummary.value : todaySummary.value))
const nextActions = computed(() => {
  if (reviewType.value === 'weekly') {
    return [
      { title: '回顾本周最有效的一次推进，把它保留下来。' },
      { title: '选一个反复卡住的点，下周只做一个小调整。' },
      { title: '从轨道页带入一条轨道复盘问题，沉淀成下周第一步。' }
    ]
  }
  return today.value?.currentTruth?.nextActions || [{ title: '先写下今天完成的一件小事。' }]
})

const signalCards = computed(() => {
  const status = today.value?.statusBar || {}
  const cards = [
    { label: '稳定度', value: `${status.stability || 0}%`, hint: '习惯、专注和计划推进的综合状态' },
    { label: '习惯', value: `${status.habitCompleted || 0}/${status.habitTotal || 0}`, hint: '今日习惯完成情况' },
    { label: '专注', value: `${status.focusMinutes || 0} 分钟`, hint: '今日累计专注时长' }
  ]

  if (reviewType.value === 'weekly') {
    return [
      cards[0],
      { label: '收集箱', value: status.pendingCaptureCount || 0, hint: '当前待处理内容数量' },
      { label: '风险', value: today.value?.currentTruth?.risks?.length || 0, hint: '当前工作台识别出的风险线索' }
    ]
  }

  return cards
})

const resetForm = () => {
  form.completed = ''
  form.blocked = ''
  form.nextStep = ''
  form.mood = ''
}

const applyReview = (entry) => {
  resetForm()
  if (!entry) return
  form.completed = entry.completed || ''
  form.blocked = entry.blocked || ''
  form.nextStep = entry.next_step || ''
  form.mood = entry.mood || ''
}

const loadToday = async () => {
  errorMessage.value = ''
  const response = await getWorkspaceToday()
  if (!response.success) {
    errorMessage.value = response.error || '复盘数据加载失败'
    return
  }
  today.value = response.data || null
}

const loadCurrentReview = async () => {
  isLoadingReview.value = true
  errorMessage.value = ''
  const response = await getReviewEntry({
    type: reviewType.value,
    reviewDate: reviewDate.value || formatLocalDateKey()
  })
  isLoadingReview.value = false

  if (!response.success) {
    errorMessage.value = response.error || '复盘记录加载失败'
    return
  }

  applyReview(response.data || null)
}

const setReviewType = async (type) => {
  if (reviewType.value === type) return
  reviewType.value = type
  await loadCurrentReview()
}

const saveReview = async () => {
  isSaving.value = true
  const response = await saveReviewEntry({
    reviewDate: reviewDate.value || formatLocalDateKey(),
    type: reviewType.value,
    completed: form.completed,
    blocked: form.blocked,
    nextStep: form.nextStep,
    mood: form.mood,
    summary_snapshot: {
      mode: reviewType.value,
      statusBar: today.value?.statusBar || {},
      currentTruth: today.value?.currentTruth || {}
    }
  })
  isSaving.value = false

  if (!response.success) {
    error('复盘保存失败', { description: response.error || '请稍后重试' })
    return
  }

  success(reviewType.value === 'weekly' ? '周复盘已保存' : '今日复盘已保存')
  await Promise.all([loadToday(), loadCurrentReview()])
}

onMounted(async () => {
  await loadToday()
  await loadCurrentReview()
})
</script>

<style scoped>
.review-hero {
  position: relative;
  overflow: hidden;
}

.review-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 85% 10%, rgba(24, 24, 27, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
}

.review-hero > * {
  position: relative;
}

.review-mode-button {
  min-height: 2.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.86);
  padding: 0 0.95rem;
  color: rgb(82, 82, 91);
  font-size: 0.8125rem;
  font-weight: 800;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.review-mode-button:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.8);
  color: rgb(24, 24, 27);
}

.review-mode-button.is-active {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.review-field-label {
  display: grid;
  gap: 0.5rem;
  color: rgb(82, 82, 91);
  font-size: 0.8125rem;
  font-weight: 700;
}

.review-input,
.review-textarea {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.review-input {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.review-textarea {
  resize: vertical;
  min-height: 6.25rem;
  padding: 0.9rem 1rem;
  line-height: 1.65;
}

.review-textarea.is-compact {
  min-height: 4.75rem;
}

.review-input:focus,
.review-textarea:focus {
  border-color: rgb(24, 24, 27);
  background: white;
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
}

.review-primary-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  background: rgb(24, 24, 27);
  padding: 0 1.25rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.review-primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.review-primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.dark .review-mode-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.72);
  color: rgb(212, 212, 216);
}

.dark .review-mode-button:hover {
  border-color: rgba(161, 161, 170, 0.72);
  color: white;
}

.dark .review-mode-button.is-active {
  border-color: white;
  background: white;
  color: rgb(24, 24, 27);
}

.dark .review-field-label {
  color: rgb(212, 212, 216);
}

.dark .review-input,
.dark .review-textarea {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .review-input:focus,
.dark .review-textarea:focus {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}

.dark .review-primary-button {
  background: white;
  color: rgb(24, 24, 27);
}
</style>
