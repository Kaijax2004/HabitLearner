<template>
  <AppLayout title="洞察">
    <div class="insights-page space-y-5">
      <section class="insights-hero rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Personal Insights</p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">把记录变成判断</h1>
            <p class="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              洞察页承接周期统计、趋势分析和工作台健康检查。今日页只负责状态判断和下一步行动，这里负责看清长期节奏。
            </p>
          </div>

          <div class="relative">
            <button type="button" class="insights-range-button" @click="toggleRangePopover">
              <span>{{ periodLabel }}</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showRangePopover" class="insights-range-popover">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">选择统计周期</p>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button
                  v-for="option in rangeOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-2xl border px-3 py-2 text-sm font-medium transition"
                  :class="selectedRange === option.value
                    ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600'"
                  @click="handleRangeOption(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>

              <div v-if="selectedRange === 'custom'" class="mt-4 space-y-3 rounded-[20px] border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div>
                  <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">开始日期</label>
                  <input v-model="customStartDate" type="date" class="insights-field mt-1" />
                </div>
                <div>
                  <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">结束日期</label>
                  <input v-model="customEndDate" type="date" class="insights-field mt-1" />
                </div>
                <div class="flex gap-2">
                  <button type="button" class="insights-secondary-button flex-1" @click="closeRangePopover">取消</button>
                  <button type="button" class="insights-primary-button flex-1" :disabled="isLoading" @click="applyCustomRange">
                    {{ isLoading ? '加载中' : '应用' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BaseCard
          v-for="card in summaryCards"
          :key="card.label"
          class="insights-summary-card border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75"
          :hover="false"
        >
          <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ card.label }}</p>
          <p class="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ card.value }}</p>
          <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ card.hint }}</p>
          <span class="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            {{ card.badge }}
          </span>
        </BaseCard>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Habits</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">习惯稳定度</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">用连续天数、完成率和打卡密度判断习惯是否真的稳定。</p>
            </div>
            <span class="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              {{ overview.period.label || periodLabel }}
            </span>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div v-for="item in habitCards" :key="item.label" class="insights-metric-tile">
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div v-for="habit in rankedHabits" :key="habit.id || habit.name" class="insights-rank-row">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ habit.name || '未命名习惯' }}</p>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">连续 {{ habit.streak || 0 }} 天 · {{ habit.totalCount || 0 }} 次打卡</p>
              </div>
              <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {{ habit.completionRate || 0 }}%
              </span>
            </div>
            <div v-if="!rankedHabits.length" class="insights-empty">当前周期还没有足够的习惯排行数据。</div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Focus</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">专注投入</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">看清专注时间花在哪里，后续再和计划块、学习主题联动。</p>
            </div>
            <button class="insights-secondary-button" type="button" :disabled="isLoading" @click="loadOverview">
              {{ isLoading ? '同步中' : '刷新' }}
            </button>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div v-for="item in focusCards" :key="item.label" class="insights-metric-tile">
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div v-for="task in taskBreakdown" :key="task.title || task.taskTitle" class="insights-task-row">
              <div class="flex items-center justify-between gap-3">
                <p class="truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ task.title || task.taskTitle || '未命名任务' }}</p>
                <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ task.percent || 0 }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span class="block h-full rounded-full bg-zinc-950 dark:bg-white" :style="{ width: `${Math.min(Number(task.percent || 0), 100)}%` }"></span>
              </div>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ formatFocusDuration(task.focusSeconds || task.totalFocusSeconds || 0) }}</p>
            </div>
            <div v-if="!taskBreakdown.length" class="insights-empty">当前周期还没有任务占比数据。</div>
          </div>
        </BaseCard>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Rhythm</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">时间分布</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">先看专注发生在哪些时段，后续可以用于推荐更合适的计划安排。</p>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div v-for="bucket in focusTimeBuckets" :key="bucket.label" class="insights-task-row">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ bucket.label }}</p>
                <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ bucket.percent }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span class="block h-full rounded-full" :class="bucket.color" :style="{ width: `${bucket.percent}%` }"></span>
              </div>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ formatFocusDuration(bucket.seconds) }}</p>
            </div>
            <div v-if="!hasFocusData" class="insights-empty">当前周期还没有专注记录，时间分布会在你完成专注后自动生成。</div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Workbench Dimensions</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">工作台维度检查</h2>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">按照 OOS 的思路，个人工作台需要同时覆盖执行、沉淀、轨道和判断。这里不伪造数据，只标记当前接入状态。</p>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div v-for="dimension in dimensionCards" :key="dimension.title" class="insights-dimension-card">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ dimension.title }}</p>
                <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="dimension.ready ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'">
                  {{ dimension.ready ? '已接入' : '待增强' }}
                </span>
              </div>
              <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ dimension.description }}</p>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useToast } from '@/composables/useToast'
import * as statsAPI from '@/api/stats.js'
import { formatLocalDateKey } from '@/utils/date.js'

const { error } = useToast()

const createEmptyOverview = () => ({
  period: {
    range: 'today',
    label: '今日',
    startDate: formatLocalDateKey(),
    endDate: formatLocalDateKey(),
    dayCount: 1
  },
  habit: {
    totalHabits: 0,
    activeHabits: 0,
    totalCheckIns: 0,
    averageCheckInsPerDay: 0,
    consistencyRate: 0,
    longestStreak: 0,
    reminderEnabledCount: 0,
    commentEnabledCount: 0,
    rankedHabits: [],
    categoryBreakdown: []
  },
  pomodoro: {
    totalFocusSeconds: 0,
    totalFocusHours: 0,
    totalBreakSeconds: 0,
    totalBreakHours: 0,
    totalPomodoros: 0,
    sessionCount: 0,
    averageSessionFocusSeconds: 0,
    longestSessionFocusSeconds: 0,
    focusConsistencyRate: 0,
    streakDays: 0,
    focusTimeBuckets: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    },
    taskBreakdown: [],
    dailyTrend: []
  }
})

const overview = reactive(createEmptyOverview())
const selectedRange = ref('today')
const customStartDate = ref(formatLocalDateKey())
const customEndDate = ref(formatLocalDateKey())
const showRangePopover = ref(false)
const isLoading = ref(false)

const rangeOptions = [
  { value: 'today', label: '今日' },
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
  { value: 'custom', label: '自定义' }
]

const periodLabel = computed(() => {
  if (selectedRange.value === 'custom') return `${customStartDate.value} 至 ${customEndDate.value}`
  return rangeOptions.find((option) => option.value === selectedRange.value)?.label || '今日'
})

const hasFocusData = computed(() => Number(overview.pomodoro.totalFocusSeconds || 0) > 0)

const summaryCards = computed(() => [
  {
    label: '习惯稳定度',
    value: `${overview.habit.consistencyRate}%`,
    hint: '当前周期内有记录的习惯占比。',
    badge: `${overview.habit.activeHabits} 个活跃习惯`
  },
  {
    label: '周期打卡',
    value: overview.habit.totalCheckIns,
    hint: '当前周期累计完成的打卡次数。',
    badge: `平均 ${overview.habit.averageCheckInsPerDay} 次/天`
  },
  {
    label: '专注时长',
    value: `${overview.pomodoro.totalFocusHours} 小时`,
    hint: '当前周期累计专注投入。',
    badge: `${overview.pomodoro.sessionCount} 次会话`
  },
  {
    label: '番茄数量',
    value: overview.pomodoro.totalPomodoros,
    hint: '当前周期完成的番茄总量。',
    badge: `连续 ${overview.pomodoro.streakDays || 0} 天`
  }
])

const habitCards = computed(() => [
  { label: '习惯总数', value: overview.habit.totalHabits, hint: '当前账号下的习惯总量。' },
  { label: '最长连续', value: `${overview.habit.longestStreak} 天`, hint: '单个习惯保持过的最长连续天数。' },
  { label: '提醒开启', value: overview.habit.reminderEnabledCount, hint: '已经开启提醒的习惯数量。' },
  { label: '留言开启', value: overview.habit.commentEnabledCount, hint: '开启每日首次留言的习惯数量。' }
])

const focusCards = computed(() => [
  { label: '会话数', value: overview.pomodoro.sessionCount, hint: '当前周期记录的专注会话。' },
  { label: '平均时长', value: formatFocusDuration(overview.pomodoro.averageSessionFocusSeconds), hint: '每次专注会话的平均投入。' },
  { label: '单次最长', value: formatFocusDuration(overview.pomodoro.longestSessionFocusSeconds), hint: '当前周期最长的一次专注。' },
  { label: '专注稳定度', value: `${overview.pomodoro.focusConsistencyRate}%`, hint: '有专注记录的天数占比。' }
])

const focusTimeBuckets = computed(() => {
  const buckets = overview.pomodoro.focusTimeBuckets || {}
  const total = Number(overview.pomodoro.totalFocusSeconds || 0)
  const items = [
    { key: 'morning', label: '上午', color: 'bg-stone-500' },
    { key: 'afternoon', label: '下午', color: 'bg-amber-600' },
    { key: 'evening', label: '晚上', color: 'bg-slate-600' },
    { key: 'night', label: '深夜', color: 'bg-zinc-950 dark:bg-white' }
  ]
  return items.map((item) => {
    const seconds = Number(buckets[item.key] || 0)
    return {
      ...item,
      seconds,
      percent: total > 0 ? Math.round((seconds / total) * 100) : 0
    }
  })
})

const rankedHabits = computed(() => Array.isArray(overview.habit.rankedHabits) ? overview.habit.rankedHabits.slice(0, 6) : [])
const taskBreakdown = computed(() => Array.isArray(overview.pomodoro.taskBreakdown) ? overview.pomodoro.taskBreakdown.slice(0, 6) : [])

const dimensionCards = computed(() => [
  {
    title: '今日判断',
    ready: true,
    description: '今日页已接入 Current Truth、风险、重点行动和 72 小时摘要。'
  },
  {
    title: '执行记录',
    ready: true,
    description: '习惯打卡、番茄专注和计划日程已经能形成真实执行记录。'
  },
  {
    title: '学习沉淀',
    ready: true,
    description: '学习笔记可以进入收集箱，并继续转行动计划或复盘问题。'
  },
  {
    title: '计划日程',
    ready: true,
    description: '计划块支持安排到日期、开始时间和持续时长。'
  },
  {
    title: '周期洞察',
    ready: Boolean(rankedHabits.value.length || taskBreakdown.value.length),
    description: '当前先接入习惯和专注统计，后续补学习、计划和复盘趋势。'
  },
  {
    title: '长期记忆',
    ready: false,
    description: '后续可增加 Memory/Decision 记录，用于长期偏好和关键决策回顾。'
  }
])

const formatFocusDuration = (seconds = 0) => {
  const value = Math.max(0, Number(seconds || 0))
  const minutes = Math.round(value / 60)
  if (minutes >= 60) return `${(value / 3600).toFixed(1).replace(/\.0$/, '')} 小时`
  return `${minutes} 分钟`
}

const applyOverview = (payload = {}) => {
  Object.assign(overview, createEmptyOverview(), payload || {})
  overview.period = { ...createEmptyOverview().period, ...(payload.period || {}) }
  overview.habit = { ...createEmptyOverview().habit, ...(payload.habit || {}) }
  overview.pomodoro = { ...createEmptyOverview().pomodoro, ...(payload.pomodoro || {}) }
  overview.habit.rankedHabits = Array.isArray(payload.habit?.rankedHabits) ? payload.habit.rankedHabits : []
  overview.habit.categoryBreakdown = Array.isArray(payload.habit?.categoryBreakdown) ? payload.habit.categoryBreakdown : []
  overview.pomodoro.taskBreakdown = Array.isArray(payload.pomodoro?.taskBreakdown) ? payload.pomodoro.taskBreakdown : []
  overview.pomodoro.dailyTrend = Array.isArray(payload.pomodoro?.dailyTrend) ? payload.pomodoro.dailyTrend : []
  overview.pomodoro.focusTimeBuckets = {
    ...createEmptyOverview().pomodoro.focusTimeBuckets,
    ...(payload.pomodoro?.focusTimeBuckets || {})
  }
}

const loadOverview = async () => {
  isLoading.value = true
  try {
    const params = selectedRange.value === 'custom'
      ? { range: 'custom', startDate: customStartDate.value, endDate: customEndDate.value }
      : { range: selectedRange.value }
    const response = await statsAPI.getStatsOverview(params)
    if (!response.success) throw new Error(response.error || '获取统计概览失败')
    applyOverview(response.data || {})
  } catch (err) {
    error('洞察加载失败', { description: err.message || '请稍后重试' })
  } finally {
    isLoading.value = false
  }
}

const closeRangePopover = () => {
  showRangePopover.value = false
}

const toggleRangePopover = () => {
  showRangePopover.value = !showRangePopover.value
}

const handleRangeOption = async (value) => {
  selectedRange.value = value
  if (value === 'custom') return
  closeRangePopover()
  await loadOverview()
}

const applyCustomRange = async () => {
  if (!customStartDate.value || !customEndDate.value || customStartDate.value > customEndDate.value) {
    error('日期范围无效', { description: '请确认开始日期不晚于结束日期' })
    return
  }
  await loadOverview()
  closeRangePopover()
}

onMounted(loadOverview)
</script>

<style scoped>
.insights-hero {
  position: relative;
  overflow: visible;
}

.insights-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 84% 12%, rgba(24, 24, 27, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
}

.insights-hero > * {
  position: relative;
}

.insights-summary-card {
  overflow: hidden;
  position: relative;
}

.insights-summary-card::after {
  content: '';
  position: absolute;
  inset: auto 1.25rem 0 1.25rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(24, 24, 27, 0.2), transparent);
}

.insights-range-button,
.insights-primary-button,
.insights-secondary-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  padding: 0 1.1rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.insights-range-button,
.insights-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  color: rgb(39, 39, 42);
}

.insights-range-button:hover,
.insights-secondary-button:hover:not(:disabled),
.insights-primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.insights-range-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 0.75rem);
  z-index: 30;
  width: 20rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(18px);
}

.insights-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.insights-field {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  outline: none;
}

.insights-metric-tile,
.insights-rank-row,
.insights-task-row,
.insights-dimension-card {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.25rem;
  background: rgba(250, 250, 250, 0.78);
  padding: 1rem;
}

.insights-rank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.insights-empty {
  border: 1px dashed rgba(212, 212, 216, 0.95);
  border-radius: 1.25rem;
  padding: 1rem;
  color: rgb(113, 113, 122);
  font-size: 0.875rem;
  line-height: 1.7;
  text-align: center;
}

.dark .insights-range-button,
.dark .insights-secondary-button,
.dark .insights-field {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .insights-range-popover {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(9, 9, 11, 0.96);
}

.dark .insights-primary-button {
  background: white;
  color: rgb(24, 24, 27);
}

.dark .insights-metric-tile,
.dark .insights-rank-row,
.dark .insights-task-row,
.dark .insights-dimension-card {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.58);
}

.dark .insights-empty {
  border-color: rgba(63, 63, 70, 0.95);
  color: rgb(161, 161, 170);
}

.dark .insights-summary-card::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
}

@media (max-width: 640px) {
  .insights-range-popover {
    left: 0;
    right: auto;
    width: min(20rem, calc(100vw - 2rem));
  }
}
</style>
