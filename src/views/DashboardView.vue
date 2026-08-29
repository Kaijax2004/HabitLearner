<template>
  <AppLayout title="今日">
    <div class="workbench-shell dashboard-workbench">
      <DashboardHero
        :current-date="currentDate"
        :dashboard-greeting="dashboardGreeting"
        :dashboard-narrative="dashboardNarrative"
        :primary-action="primaryDashboardAction"
        :dashboard-highlights="dashboardHighlights"
        :selected-priority-items="selectedPriorityItems"
        :priority-candidates="priorityCandidates"
        @primary-action="handlePrimaryDashboardAction"
        @add-priority="addTodayPriority"
        @remove-priority="removeTodayPriority"
      />

      <div v-if="workspaceError" class="dashboard-error">{{ workspaceError }}</div>

      <section class="dashboard-main-grid">
        <DashboardExecution
          :current-truth="workspaceToday?.currentTruth"
          :schedule-blocks="todayScheduleBlocks"
          :is-loading="isWorkspaceLoading"
          :updating-id="updatingScheduleId"
          :schedule-status-label="scheduleStatusLabel"
          :schedule-status-class="scheduleStatusClass"
          :format-schedule-meta="formatScheduleMeta"
          @refresh="loadWorkspaceToday"
          @change-status="changeScheduleStatus"
          @open-plan="goToPlan"
          @open-focus="goToFocus"
          @open-review="goToReview"
        />

        <DashboardStatus
          :habits="todayHabitPreview"
          :habit-loading="habitStore.isLoading"
          :checking-id="checkingHabitId"
          :creator-next-action="creatorNextAction"
          :creator-counts="creatorSnapshot.counts || {}"
          :pending-capture-count="pendingCaptureCount"
          :latest-capture-text="latestCaptureText"
          :has-review="Boolean(workspaceToday?.latestReview)"
          :review-summary-line="reviewSummaryLine"
          :ai-loading="todayAiLoading"
          :ai-error-code="todayAiErrorCode"
          :ai-status-text="todayAiStatusText"
          :ai-reply="todayAiRemoteAdvice?.reply || ''"
          @manage-habits="openHabitManager"
          @open-habit="goToHabitDetail"
          @check-habit="quickCheckIn"
          @create-habit="goToHabitCreate"
          @open-creator="goToCreator"
          @open-captures="goToCaptures"
          @open-review="goToReview"
          @ask-ai="generateTodayAiAdvice"
          @configure-ai="router.push('/profile/ai-providers')"
        />
      </section>
      <DashboardLoop
        :days="workspaceSeventyTwoDays"
        :pending-capture-count="pendingCaptureCount"
        :review-value="workspaceToday?.latestReview ? '已记' : '待写'"
        :tracks-count="workspaceTracks.length"
        :preview-items="dayPreviewItems"
        @open-plan="goToPlan"
        @open-captures="goToCaptures"
        @open-review="goToReview"
        @open-tracks="goToTracks"
      />
    </div>
    <DashboardHabitManager
      :show="showHabitManager"
      :habits="managerHabits"
      :selected-ids="selectedHabitIds"
      :all-selected="isAllHabitsSelected"
      :deleting="deletingSelectedHabits"
      @close="closeHabitManager"
      @create="goToHabitCreate"
      @toggle-select-all="toggleSelectAllHabits"
      @delete-selected="deleteSelectedHabits"
      @toggle-selection="toggleHabitSelection"
      @open-detail="openHabitDetailFromManager"
    />
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import { useToast } from '@/composables/useToast'
import { confirmDialog } from '@/composables/useGlobalDialog'
import { useWorkspaceAiStore } from '@/stores/workspaceAi'
import AppLayout from '@/components/AppLayout.vue'
import DashboardHero from '@/views/dashboard/DashboardHero.vue'
import DashboardExecution from '@/views/dashboard/DashboardExecution.vue'
import DashboardStatus from '@/views/dashboard/DashboardStatus.vue'
import DashboardLoop from '@/views/dashboard/DashboardLoop.vue'
import DashboardHabitManager from '@/views/dashboard/DashboardHabitManager.vue'
import {
  chatWithMascotAssistant,
  getWorkspaceBootstrap,
  trackWorkbenchEvent,
  updateTodayPriorities
} from '@/api/workspace.js'
import { updateScheduleBlock } from '@/api/scheduleBlocks.js'

const authStore = useAuthStore()
const habitStore = useHabitStore()
const workspaceAiStore = useWorkspaceAiStore()
const router = useRouter()
const { success, error } = useToast()

const workspaceToday = ref(null)
const workspaceError = ref('')
const isWorkspaceLoading = ref(false)
const updatingScheduleId = ref(null)
const todayAiLoading = ref(false)
const todayAiRemoteAdvice = ref(null)
const todayAiErrorCode = ref('')
const todayAiErrorMessage = ref('')

const user = computed(() => authStore.user)

const workspaceActions = computed(() => workspaceToday.value?.currentTruth?.nextActions || [])
const workspaceSeventyTwoDays = computed(() => workspaceToday.value?.seventyTwoHours?.days || [])
const workspaceCaptures = computed(() => workspaceToday.value?.captures || [])
const workspaceTracks = computed(() => workspaceToday.value?.tracks?.items || [])
const selectedPriorityItems = computed(() => workspaceToday.value?.todayPriorities?.items || [])
const priorityCandidates = computed(() => workspaceToday.value?.todayPriorities?.candidates || [])
const primaryWorkspaceTrack = computed(() => workspaceTracks.value[0] || null)
const todayScheduleBlocks = computed(() => workspaceToday.value?.plans?.scheduleBlocks || [])
const creatorSnapshot = computed(() => workspaceToday.value?.creator || { total: 0, counts: {}, nextItem: null, activeItems: [] })
const creatorNextAction = computed(() => {
  const item = creatorSnapshot.value.nextItem
  if (!item) {
    return {
      title: '先记录一个热点或选题',
      description: '把灵感放进内容流水线，后续再决定是否写作。'
    }
  }
  const stageLabel = {
    inbox: '先判断是否值得继续',
    research: '补齐来源和核心观点',
    drafting: '把核心观点写成可发布草稿',
    production: '推进素材或剪辑',
    scheduled: '确认发布时间和发布平台'
  }[item.stage] || '继续推进这条内容'
  return {
    title: item.title,
    description: stageLabel
  }
})
const showHabitManager = ref(false)
const selectedHabitIds = ref([])
const deletingSelectedHabits = ref(false)
const checkingHabitId = ref(null)
const todayHabitPreview = computed(() => {
  const workspaceItems = workspaceToday.value?.habits?.items
  if (Array.isArray(workspaceItems) && workspaceItems.length) return workspaceItems

  return habitStore.habits.slice(0, 8).map((habit) => {
    const target = Math.max(1, Number(habit.target || 1))
    const count = Number(habit.todayCount || 0)
    return {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      target,
      count,
      done: count >= target,
      streak: Number(habit.streak || 0)
    }
  })
})
const managerHabits = computed(() => habitStore.habits.map((habit) => {
  const target = Math.max(1, Number(habit.target || 1))
  const count = Number(habit.todayCount || 0)
  return {
    ...habit,
    target,
    count,
    done: count >= target,
    streak: Number(habit.streak || 0)
  }
}))
const isAllHabitsSelected = computed(() => managerHabits.value.length > 0 && selectedHabitIds.value.length === managerHabits.value.length)
const pendingCaptureCount = computed(() => workspaceCaptures.value.filter((capture) => capture.status === 'pending').length)
const latestCaptureText = computed(() => {
  const latest = workspaceCaptures.value[0]
  return latest?.content || '暂无临时收集。想到任务、灵感或学习问题时，可以进入收集箱统一处理。'
})
const reviewSummaryLine = computed(() => {
  const latestReview = workspaceToday.value?.latestReview
  if (!latestReview) return '今天还没有复盘记录。建议在结束前写下完成了什么、卡住什么和明天第一步。'

  const nextStep = latestReview.next_step || latestReview.nextStep
  if (nextStep) return `明天第一步：${nextStep}`
  if (latestReview.completed) return `今日完成：${latestReview.completed}`
  return '已有今日复盘记录，可以进入复盘工作区继续补充。'
})
const pendingScheduleBlocks = computed(() => todayScheduleBlocks.value.filter((item) => !['completed', 'skipped'].includes(item.status)))
const nextScheduleBlock = computed(() => pendingScheduleBlocks.value[0] || null)
const recommendedFocusTitle = computed(() => {
  const action = workspaceActions.value[0]
  if (action?.title) return action.title
  if (pendingCaptureCount.value > 0) return '清理一个收集箱条目'
  if (incompleteHabitCount.value > 0) return '完成一个未打卡习惯'
  return '推进一个最小行动'
})
const incompleteHabitCount = computed(() => {
  const status = workspaceToday.value?.statusBar || {}
  return Math.max(Number(status.habitTotal || 0) - Number(status.habitCompleted || 0), 0)
})
const currentDate = computed(() => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}).format(new Date()))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const dashboardGreeting = computed(() => {
  const name = user.value?.name?.trim()
  return name ? `${greeting.value} ${name}` : greeting.value
})

const loadWorkspaceToday = async ({ force = false } = {}) => {
  isWorkspaceLoading.value = true
  workspaceError.value = ''

  try {
    const response = await getWorkspaceBootstrap(force ? { noCache: '1' } : {})
    if (!response.success) {
      throw new Error(response.error || '今日工作台加载失败')
    }
    workspaceToday.value = response.data || null
  } catch (err) {
    workspaceError.value = err.message || '今日工作台加载失败'
  } finally {
    isWorkspaceLoading.value = false
  }
}

const ensureHabitsLoaded = async () => {
  if (habitStore.habits.length || habitStore.isLoading) return
  await habitStore.fetchHabits()
}

const scheduleStatusLabel = (status) => ({
  scheduled: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  skipped: '已跳过'
}[status] || '待开始')

const scheduleStatusClass = (status) => ({
  scheduled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  skipped: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
}[status] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300')

const formatScheduleMeta = (item) => {
  const time = item.start_time || '未定时间'
  const duration = Number(item.duration_minutes || 0)
  return duration > 0 ? `${time} · ${duration} 分钟` : time
}

const changeScheduleStatus = async (item, status) => {
  if (!item?.id || updatingScheduleId.value) return
  updatingScheduleId.value = item.id

  const response = await updateScheduleBlock(item.id, { status })
  updatingScheduleId.value = null

  if (!response.success) {
    error('任务状态更新失败', { description: response.error || '请稍后重试' })
    return
  }

  success(status === 'completed' ? '今日任务已完成' : '任务状态已更新')
  await loadWorkspaceToday()
}

const createClientMutationId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const recordDashboardEvent = async (eventType, payload = {}) => {
  await trackWorkbenchEvent({
    eventType,
    action: eventType.replace(/^dashboard_/, ''),
    clientMutationId: createClientMutationId(eventType),
    payload,
    metadata: { page: 'dashboard' }
  })
}

const saveTodayPriorities = async (items, action, item = null) => {
  const response = await updateTodayPriorities({
    items,
    clientMutationId: createClientMutationId(`today_priorities_${action}`)
  })
  if (!response.success) {
    error('今日三件事更新失败', { description: response.error || '请稍后重试' })
    return false
  }
  workspaceToday.value = {
    ...(workspaceToday.value || {}),
    todayPriorities: {
      ...(workspaceToday.value?.todayPriorities || {}),
      items: response.data?.items || items
    }
  }
  await recordDashboardEvent(`dashboard_priority_${action}`, item ? { id: item.id, title: item.title } : {})
  return true
}

const addTodayPriority = async (item) => {
  if (!item?.id || selectedPriorityItems.value.some((candidate) => candidate.id === item.id)) return
  if (selectedPriorityItems.value.length >= 3) {
    error('今日三件事已满', { description: '先移除一项，再加入新的重点。' })
    return
  }
  const saved = await saveTodayPriorities([...selectedPriorityItems.value, item], 'add', item)
  if (saved) success('已加入今日三件事', { description: item.title })
}

const removeTodayPriority = async (item) => {
  if (!item?.id) return
  const saved = await saveTodayPriorities(
    selectedPriorityItems.value.filter((candidate) => candidate.id !== item.id),
    'remove',
    item
  )
  if (saved) success('已从今日三件事移除')
}

const handlePrimaryDashboardAction = async () => {
  await recordDashboardEvent('dashboard_next_step_click', {
    title: primaryDashboardAction.value?.title || '',
    label: primaryDashboardAction.value?.label || ''
  })
  primaryDashboardAction.value?.action?.()
}

const dayPreviewItems = (day) => {
  const schedules = (day.scheduleBlocks || []).map((item) => ({
    key: `schedule-${item.id}`,
    title: `${item.start_time ? `${item.start_time} · ` : ''}${item.title}`
  }))
  const plans = (day.plans || []).map((item) => ({
    key: `plan-${item.id}`,
    title: `计划 · ${item.title}`
  }))
  return [...schedules, ...plans].slice(0, 3)
}

const dashboardHighlights = computed(() => [
  {
    label: '今日习惯',
    value: `${workspaceToday.value?.statusBar?.habitCompleted || 0}/${workspaceToday.value?.statusBar?.habitTotal || 0}`,
    hint: '已完成 / 今日总数'
  },
  {
    label: '今日专注',
    value: `${workspaceToday.value?.statusBar?.focusMinutes || 0} 分钟`,
    hint: `${workspaceToday.value?.focus?.completedPomodoros || 0} 个番茄`
  },
  {
    label: '今日计划',
    value: workspaceToday.value?.statusBar?.todayPlanCount || 0,
    hint: `${todayScheduleBlocks.value.length} 个日程块`
  }
])

const dashboardNarrative = computed(() => {
  return workspaceToday.value?.currentTruth?.summary || '今日页只负责判断、分流和下一步行动，完整统计已经移到洞察页。'
})

const primaryDashboardAction = computed(() => {
  const schedule = nextScheduleBlock.value
  if (schedule) {
    return {
      title: schedule.title,
      label: schedule.status === 'in_progress' ? '继续执行' : '开始执行',
      action: () => changeScheduleStatus(schedule, 'in_progress')
    }
  }

  return {
    title: workspaceActions.value[0]?.title || recommendedFocusTitle.value,
    label: '进入计划',
    action: goToPlan
  }
})

const todayAiStatusText = computed(() => {
  if (todayAiLoading.value) return '正在读取当前工作台数据'
  if (todayAiErrorCode.value === 'AI_NOT_CONFIGURED') return '尚未配置 Mentor-X 能力'
  if (todayAiErrorMessage.value) return todayAiErrorMessage.value
  if (todayAiRemoteAdvice.value?.source) return '已生成供应商建议'
  return '点击后按当前模型引擎配置生成'
})

const normalizeMentorXError = (value) => {
  const message = String(value || '').trim()
  if (!message) return 'Mentor-X 建议生成失败'
  const unreadableCount = (message.match(/\uFFFD/g) || []).length
  if (unreadableCount >= 3 || unreadableCount / Math.max(message.length, 1) > 0.02) {
    return '模型返回了不可读内容，请检查 Mentor-X 模型引擎的协议和响应格式配置。'
  }
  return message
}

const goToHabitDetail = (habitId) => {
  router.push(`/habit/${habitId}`)
}

const quickCheckIn = async (habit) => {
  if (!habit?.id || checkingHabitId.value || habit.done) return

  checkingHabitId.value = habit.id
  try {
    await ensureHabitsLoaded()
    const response = await habitStore.completeHabit(habit.id)
    if (!response.success) {
      error('快捷打卡失败', { description: response.error || '请稍后重试' })
      return
    }

    success('打卡成功', { description: `「${habit.name}」已记录到今天。` })
    await loadWorkspaceToday({ force: true })
  } catch (err) {
    error('快捷打卡失败', { description: err.message || '请稍后重试' })
  } finally {
    checkingHabitId.value = null
  }
}

const goToLearning = () => {
  router.push('/learning')
}

const goToFocus = () => {
  router.push('/focus')
}

const goToCreator = () => {
  router.push('/creator')
}

const goToPlan = () => {
  router.push('/plan')
}

const goToTracks = () => {
  router.push('/tracks')
}

const goToCaptures = () => {
  router.push('/captures')
}

const goToReview = () => {
  router.push('/review')
}

const goToHabitCreate = () => {
  showHabitManager.value = false
  selectedHabitIds.value = []
  router.push('/habit/create')
}

const openHabitManager = async () => {
  showHabitManager.value = true
  selectedHabitIds.value = []
  if (!habitStore.habits.length && !habitStore.isLoading) {
    await habitStore.fetchHabits()
  }
}

const closeHabitManager = () => {
  showHabitManager.value = false
  selectedHabitIds.value = []
}

const openHabitDetailFromManager = (habitId) => {
  closeHabitManager()
  goToHabitDetail(habitId)
}

const toggleHabitSelection = (habitId) => {
  const next = new Set(selectedHabitIds.value)
  if (next.has(habitId)) next.delete(habitId)
  else next.add(habitId)
  selectedHabitIds.value = [...next]
}

const toggleSelectAllHabits = () => {
  selectedHabitIds.value = isAllHabitsSelected.value ? [] : managerHabits.value.map((habit) => habit.id)
}

const deleteSelectedHabits = async () => {
  if (!selectedHabitIds.value.length || deletingSelectedHabits.value) return
  const count = selectedHabitIds.value.length
  if (!(await confirmDialog(`确定删除选中的 ${count} 个习惯吗？此操作不可撤销。`))) return

  deletingSelectedHabits.value = true
  const response = await habitStore.deleteHabits(selectedHabitIds.value)
  deletingSelectedHabits.value = false

  if (!response.success) {
    error('批量删除习惯失败', { description: response.error || '请稍后重试' })
    return
  }

  selectedHabitIds.value = []
  success('习惯已删除', { description: `已删除 ${count} 个习惯` })
  await loadWorkspaceToday({ force: true })
}

const generateTodayAiAdvice = async () => {
  if (todayAiLoading.value) return
  todayAiLoading.value = true
  todayAiErrorCode.value = ''
  todayAiErrorMessage.value = ''

  try {
    const response = await chatWithMascotAssistant({
      message: '请基于今日工作台真实数据，告诉我今天先做什么、哪里有风险、接下来 30 分钟怎么安排。请简短输出。',
      providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null
    })

    if (!response.success) {
      todayAiErrorCode.value = response.code || ''
      todayAiErrorMessage.value = normalizeMentorXError(response.error || response.message)
      return
    }

    todayAiRemoteAdvice.value = response.data || null
  } catch (err) {
    todayAiErrorMessage.value = normalizeMentorXError(err.message)
  } finally {
    todayAiLoading.value = false
  }
}

onMounted(async () => {
  await loadWorkspaceToday()
  recordDashboardEvent('dashboard_daily_start_view', {
    hasPriorities: selectedPriorityItems.value.length > 0,
    scheduleCount: todayScheduleBlocks.value.length
  })
})
</script>

<style scoped>
.dashboard-workbench {
  display: grid;
  gap: var(--workbench-content-gap, 1rem);
  min-width: 0;
}

.dashboard-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--workbench-content-gap, 1rem);
  min-width: 0;
}

.dashboard-error {
  border: 1px solid rgba(185, 28, 28, 0.22);
  border-radius: 1rem;
  background: rgba(254, 242, 242, 0.84);
  color: rgb(185, 28, 28);
  font-size: 0.78rem;
  line-height: 1.6;
  padding: 0.8rem 1rem;
}

@media (max-width: 900px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
