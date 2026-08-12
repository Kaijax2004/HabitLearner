<template>
  <AppLayout title="计划">
    <div class="workspace-page w-full min-w-0">
      <div class="workspace-header">
        <div class="workspace-header-copy">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Plan System</p>
          <h1 class="workspace-page-title">计划</h1>
          <p class="workspace-page-subtitle">把目标拆成可执行的计划，并在看板、日历和归档中闭环管理。</p>
        </div>
        <div class="workspace-toolbar">
          <template v-if="selectedPlans.length">
            <span class="rounded-full border border-zinc-200 bg-white/80 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">已选择 {{ selectedPlans.length }} 项</span>
            <button class="btn-secondary text-sm px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200" @click="batchDelete">批量删除</button>
            <button class="btn-secondary text-sm px-3 py-2" @click="clearSelection">取消选择</button>
          </template>
          <button class="btn-primary px-4 py-2 rounded-lg" :disabled="isCreating" @click="createNew">
            {{ isCreating ? '创建中...' : '新建计划' }}
          </button>
        </div>
      </div>

      <div class="workspace-section-grid-4">
        <BaseCard v-for="metric in metrics" :key="metric.label" :hover="false">
          <div class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ metric.label }}</div>
          <div class="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ metric.value }}</div>
        </BaseCard>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto rounded-[1.35rem] border border-zinc-200/80 bg-white/80 p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
        <button :class="tabClass('list')" @click="view = 'list'">列表</button>
        <button :class="tabClass('board')" @click="view = 'board'">看板</button>
        <button :class="tabClass('calendar')" @click="view = 'calendar'">日历</button>
        <button :class="tabClass('schedule')" @click="view = 'schedule'">日程</button>
        <button :class="tabClass('archive')" @click="view = 'archive'">归档</button>
      </div>

      <div class="workspace-toolbar rounded-[1.35rem] border border-zinc-200/80 bg-white/80 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
        <button
          v-for="option in typeFilters"
          :key="option.value"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="selectedTypeFilter === option.value
            ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white'"
          @click="selectedTypeFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <BaseCard v-if="planStore.error" class="border border-red-200 dark:border-red-800">
        <div class="text-red-600 dark:text-red-300">{{ planStore.error }}</div>
      </BaseCard>

      <BaseCard v-if="planStore.isLoading">
        <div class="py-12 text-center text-zinc-500 dark:text-zinc-400">正在加载计划...</div>
      </BaseCard>

      <BaseCard v-else-if="view === 'list'">
        <div v-if="!filteredActivePlans.length" class="text-center text-zinc-500 dark:text-zinc-400 py-12">
          暂无计划，点击右上角“新建计划”开始。
        </div>
        <div v-else class="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div class="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60">
            <input type="checkbox" :checked="isAllSelected" class="checkbox" @change="toggleSelectAll" />
            <span class="text-sm text-zinc-600 dark:text-zinc-400">{{ isAllSelected ? '取消全选' : '全选' }}</span>
          </div>
          <div v-for="plan in filteredActivePlans" :key="plan.id" class="flex flex-col gap-3 px-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3 min-w-0">
              <input v-model="selectedPlans" type="checkbox" :value="plan.id" class="checkbox mt-1" />
              <div class="min-w-0">
                <div class="truncate font-medium text-zinc-950 dark:text-white">{{ plan.title }}</div>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge :status="plan.status" />
                  <span :class="priorityClass(plan.priority)">{{ priorityLabel(plan.priority) }}</span>
                  <span class="text-xs text-zinc-500">{{ typeLabel(plan) }}</span>
                  <span v-if="plan.due_date" class="text-xs text-zinc-500">截止 {{ plan.due_date }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:justify-end">
              <router-link :to="`/plan/${plan.id}`" class="text-sm font-semibold text-zinc-950 transition-colors hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300">编辑</router-link>
              <button v-if="plan.status === 'completed'" class="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" @click="archivePlan(plan)">归档</button>
              <button class="text-sm text-gray-500 hover:text-red-600" @click="deletePlan(plan)">删除</button>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else-if="view === 'board'">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="column in boardColumns"
            :key="column.key"
            class="min-h-[260px] rounded-[1.35rem] border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            @dragover.prevent
            @drop="onBoardDrop(column.key)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="font-medium text-zinc-950 dark:text-white">{{ column.label }}</div>
              <div class="text-xs text-zinc-500">{{ plansByStatus[column.key].length }}</div>
            </div>
            <div class="space-y-2">
              <div
                v-for="plan in plansByStatus[column.key]"
                :key="plan.id"
                class="cursor-move rounded-[1.1rem] border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/80"
                draggable="true"
                @dragstart="dragPlan = plan"
              >
                <div class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ plan.title }}</div>
                <div class="flex items-center gap-2 mt-2">
                  <StatusBadge :status="plan.status" />
                  <span class="text-[11px] text-zinc-500">{{ typeLabel(plan) }}</span>
                  <span v-if="plan.due_date" class="text-xs text-zinc-500">{{ plan.due_date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else-if="view === 'calendar'">
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div v-for="date in dates" :key="date.value" class="min-h-[96px] rounded-[1.1rem] border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/55">
            <div class="mb-2 text-xs text-zinc-500">{{ date.label }}</div>
            <div class="space-y-1">
              <router-link
                v-for="plan in plansDueOn(date.value)"
                :key="plan.id"
                :to="`/plan/${plan.id}`"
                class="block text-xs px-2 py-1 rounded bg-primary-500 text-white truncate"
              >
                {{ plan.title }}
              </router-link>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else-if="view === 'schedule'">
        <div class="space-y-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Schedule Blocks</p>
              <h2 class="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">计划日程</h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">查看已经安排到某天的计划块，并直接更新执行状态。</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <label class="schedule-filter-field">
                <span>日期</span>
                <input v-model="scheduleDate" type="date" @change="loadScheduleBlocks" />
              </label>
              <label class="schedule-filter-field">
                <span>状态</span>
                <select v-model="scheduleStatusFilter" @change="loadScheduleBlocks">
                  <option value="all">全部状态</option>
                  <option value="scheduled">待开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="skipped">已跳过</option>
                </select>
              </label>
              <button type="button" class="schedule-refresh-button" :disabled="isScheduleLoading" @click="loadScheduleBlocks">
                {{ isScheduleLoading ? '同步中' : '刷新' }}
              </button>
            </div>
          </div>

          <div class="schedule-date-strip">
            <button
              v-for="day in scheduleDateStrip"
              :key="day.value"
              type="button"
              class="schedule-date-card"
              :class="{ 'schedule-date-card-active': scheduleDate === day.value }"
              @click="selectScheduleDate(day.value)"
            >
              <span class="schedule-date-card-week">{{ day.weekday }}</span>
              <strong>{{ day.day }}</strong>
              <span>{{ day.label }}</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div v-for="metric in scheduleMetrics" :key="metric.label" class="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ metric.label }}</p>
              <p class="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{{ metric.value }}</p>
            </div>
          </div>

          <div v-if="isScheduleLoading" class="rounded-3xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            正在同步日程...
          </div>

          <div v-else-if="!visibleScheduleBlocks.length" class="rounded-3xl border border-dashed border-zinc-200 p-8 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {{ scheduleEmptyText }}
          </div>

          <div v-else class="space-y-3">
            <article
              v-for="item in visibleScheduleBlocks"
              :key="`schedule-row-${item.id}`"
              class="rounded-[1.35rem] border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:hover:border-zinc-700"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="scheduleStatusClass(item.status)">
                      {{ scheduleStatusLabel(item.status) }}
                    </span>
                    <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatScheduleMeta(item) }}</span>
                    <span
                      v-if="item.conflict_count"
                      class="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
                    >
                      时间重叠 {{ item.conflict_count }}
                    </span>
                  </div>
                  <h3 class="mt-2 truncate text-base font-semibold text-zinc-950 dark:text-white">{{ item.title }}</h3>
                  <p class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {{ item.plan?.title ? `所属计划：${item.plan.title}` : '未绑定计划' }}
                  </p>
                </div>

                <div class="flex shrink-0 flex-wrap items-center gap-2">
                  <router-link
                    v-if="item.plan_id"
                    :to="`/plan/${item.plan_id}`"
                    class="schedule-action-link"
                  >
                    打开计划
                  </router-link>
                  <button
                    type="button"
                    class="schedule-action-button"
                    :disabled="updatingScheduleId === item.id || reschedulingScheduleId === item.id"
                    @click="openReschedulePanel(item)"
                  >
                    改期
                  </button>
                  <button
                    v-if="item.status !== 'completed'"
                    type="button"
                    class="schedule-action-button schedule-action-button-muted"
                    :disabled="updatingScheduleId === item.id"
                    @click="postponeSchedule(item)"
                  >
                    延期一天
                  </button>
                  <button
                    v-if="item.status !== 'in_progress' && item.status !== 'completed' && item.status !== 'skipped'"
                    type="button"
                    class="schedule-action-button"
                    :disabled="updatingScheduleId === item.id"
                    @click="changeScheduleStatus(item, 'in_progress')"
                  >
                    开始
                  </button>
                  <button
                    v-if="item.status !== 'completed'"
                    type="button"
                    class="schedule-action-button schedule-action-button-complete"
                    :disabled="updatingScheduleId === item.id"
                    @click="changeScheduleStatus(item, 'completed')"
                  >
                    完成
                  </button>
                  <button
                    v-if="item.status !== 'skipped' && item.status !== 'completed'"
                    type="button"
                    class="schedule-action-button schedule-action-button-muted"
                    :disabled="updatingScheduleId === item.id"
                    @click="changeScheduleStatus(item, 'skipped')"
                  >
                    跳过
                  </button>
                </div>
              </div>

              <div v-if="item.conflict_count" class="schedule-conflict-panel">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Time Conflict</p>
                <p class="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  这段时间与 {{ conflictTitles(item).join('、') }} 重叠。建议改期、缩短时长，或只保留一个重点任务。
                </p>
              </div>

              <div v-if="reschedulingScheduleId === item.id" class="schedule-reschedule-panel">
                <div class="grid gap-3 md:grid-cols-3">
                  <label class="schedule-filter-field">
                    <span>新日期</span>
                    <input v-model="rescheduleDraft.date" type="date" />
                  </label>
                  <label class="schedule-filter-field">
                    <span>开始时间</span>
                    <input v-model="rescheduleDraft.startTime" type="time" />
                  </label>
                  <label class="schedule-filter-field">
                    <span>持续分钟</span>
                    <input v-model.number="rescheduleDraft.durationMinutes" type="number" min="5" max="480" step="5" />
                  </label>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="schedule-action-button schedule-action-button-complete"
                    :disabled="updatingScheduleId === item.id"
                    @click="submitReschedule(item)"
                  >
                    保存改期
                  </button>
                  <button type="button" class="schedule-action-button schedule-action-button-muted" @click="closeReschedulePanel">
                    取消
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else>
        <div v-if="!filteredArchivedPlans.length" class="text-center text-zinc-500 dark:text-zinc-400 py-12">暂无归档计划</div>
        <div v-else class="space-y-5">
          <div v-for="category in archiveCategories" :key="category" class="space-y-2">
            <h3 class="text-lg font-medium text-zinc-800 dark:text-zinc-200">
              {{ category === 'default' ? '默认分类' : category }}
              <span class="text-sm text-zinc-500">({{ getPlansByCategory(category).length }})</span>
            </h3>
            <div class="space-y-2">
              <div v-for="plan in getPlansByCategory(category)" :key="plan.id" class="flex items-center justify-between rounded-[1.1rem] bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60">
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ plan.title }}</div>
                  <div class="text-xs text-zinc-500">归档于 {{ formatDate(plan.archived_at) }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" @click="restorePlan(plan)">恢复</button>
                  <button class="text-xs text-gray-500 hover:text-red-600" @click="deletePlan(plan)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { usePlanStore } from '@/stores/plan'
import { useToast } from '@/composables/useToast'
import { listScheduleBlocks, updateScheduleBlock } from '@/api/scheduleBlocks'
import { formatLocalDateKey } from '@/utils/date'

const StatusBadge = defineComponent({
  props: { status: { type: String, default: 'not_started' } },
  setup(props) {
    const labels = { not_started: '未开始', in_progress: '进行中', completed: '已完成', archived: '已归档' }
    const classes = {
      not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      in_progress: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
      completed: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
      archived: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
    return () => h('span', { class: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes[props.status] || classes.not_started}` }, labels[props.status] || labels.not_started)
  }
})

const router = useRouter()
const planStore = usePlanStore()
const { success, error: showError } = useToast()

const view = ref('list')
const selectedPlans = ref([])
const dragPlan = ref(null)
const isCreating = ref(false)
const selectedTypeFilter = ref('all')
const scheduleDate = ref(formatLocalDateKey())
const scheduleStatusFilter = ref('all')
const scheduleBlocks = ref([])
const isScheduleLoading = ref(false)
const updatingScheduleId = ref(null)
const reschedulingScheduleId = ref(null)
const rescheduleDraft = ref({
  date: '',
  startTime: '',
  durationMinutes: 60
})

const activePlans = computed(() => planStore.plans.filter((plan) => plan.status !== 'archived'))
const archivedPlans = computed(() => planStore.plans.filter((plan) => plan.status === 'archived'))
const matchesTypeFilter = (plan) => selectedTypeFilter.value === 'all' || plan.type === selectedTypeFilter.value
const filteredActivePlans = computed(() => activePlans.value.filter(matchesTypeFilter))
const filteredArchivedPlans = computed(() => archivedPlans.value.filter(matchesTypeFilter))
const visibleScheduleBlocks = computed(() => scheduleBlocks.value.filter((item) => {
  if (selectedTypeFilter.value === 'all') return true
  return item.plan?.type === selectedTypeFilter.value
}))
const scheduleEmptyText = computed(() => {
  if (scheduleBlocks.value.length && !visibleScheduleBlocks.value.length) {
    return '当前类型筛选下没有日程任务，可以切回“全部”查看这一天的完整安排。'
  }
  return '当前日期还没有安排计划任务。进入计划编辑器后，可以从块菜单或待安排池把任务安排到这一天。'
})
const completedPlans = computed(() => filteredActivePlans.value.filter((plan) => plan.status === 'completed'))
const overduePlans = computed(() => filteredActivePlans.value.filter((plan) => plan.due_date && plan.due_date < new Date().toISOString().slice(0, 10) && plan.status !== 'completed'))
const typeFilters = [
  { value: 'all', label: '全部' },
  { value: 'project', label: '项目' },
  { value: 'task', label: '任务' },
  { value: 'goal', label: '目标' },
  { value: 'custom', label: '自定义' }
]

const metrics = computed(() => [
  { label: '进行中', value: filteredActivePlans.value.filter((plan) => plan.status === 'in_progress').length },
  { label: '已完成', value: completedPlans.value.length },
  { label: '已逾期', value: overduePlans.value.length },
  { label: '归档', value: filteredArchivedPlans.value.length }
])

const scheduleMetrics = computed(() => [
  { label: '当日安排', value: visibleScheduleBlocks.value.length },
  { label: '待开始', value: visibleScheduleBlocks.value.filter((item) => item.status === 'scheduled').length },
  { label: '进行中', value: visibleScheduleBlocks.value.filter((item) => item.status === 'in_progress').length },
  { label: '已完成', value: visibleScheduleBlocks.value.filter((item) => item.status === 'completed').length }
])

const boardColumns = [
  { key: 'not_started', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' }
]

const plansByStatus = computed(() => ({
  not_started: filteredActivePlans.value.filter((plan) => plan.status === 'not_started'),
  in_progress: filteredActivePlans.value.filter((plan) => plan.status === 'in_progress'),
  completed: filteredActivePlans.value.filter((plan) => plan.status === 'completed')
}))

const isAllSelected = computed(() => filteredActivePlans.value.length > 0 && selectedPlans.value.length === filteredActivePlans.value.length)
const archiveCategories = computed(() => [...new Set(filteredArchivedPlans.value.map((plan) => plan.archive_category || 'default'))].sort())

const dates = computed(() => Array.from({ length: 14 }, (_, index) => {
  const date = new Date(`${formatLocalDateKey()}T00:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + index)
  return {
    value: formatLocalDateKey(date),
    label: index === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`
  }
}))

const scheduleDateStrip = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = new Date(`${formatLocalDateKey()}T00:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + index)
  const value = formatLocalDateKey(date)
  const labels = ['今天', '明天', '后天']
  return {
    value,
    label: labels[index] || `${date.getMonth() + 1}/${date.getDate()}`,
    weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'short', timeZone: 'Asia/Shanghai' }).format(date),
    day: String(date.getDate()).padStart(2, '0')
  }
}))

const tabClass = (key) => `px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${view.value === key ? 'bg-zinc-950 text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`
const priorityLabel = (priority) => ({ low: '低优先级', medium: '中优先级', high: '高优先级' }[priority] || '中优先级')
const typeLabel = (plan) => {
  if (plan?.type === 'custom') return plan?.custom_type_name || '自定义'
  return ({ project: '项目', task: '任务', goal: '目标', custom: '自定义' }[plan?.type] || '项目')
}
const priorityClass = (priority) => ({
  low: 'text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}[priority] || priorityClass('medium'))

const plansDueOn = (date) => filteredActivePlans.value.filter((plan) => plan.due_date === date)
const getPlansByCategory = (category) => filteredArchivedPlans.value.filter((plan) => (plan.archive_category || 'default') === category)
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('zh-CN') : '-'
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
  return duration > 0 ? `${item.scheduled_date} · ${time} · ${duration} 分钟` : `${item.scheduled_date} · ${time}`
}

const conflictTitles = (item) => {
  const conflicts = Array.isArray(item.conflicts) ? item.conflicts : []
  return conflicts.map((conflict) => conflict.title || '未命名日程').slice(0, 3)
}

const loadScheduleBlocks = async () => {
  isScheduleLoading.value = true
  const params = {
    date: scheduleDate.value,
    limit: 200
  }
  if (scheduleStatusFilter.value !== 'all') params.status = scheduleStatusFilter.value

  const response = await listScheduleBlocks(params)
  isScheduleLoading.value = false

  if (!response.success) {
    scheduleBlocks.value = []
    showError('日程加载失败', { description: response.error || '请稍后重试' })
    return
  }

  scheduleBlocks.value = Array.isArray(response.data) ? response.data : []
}

const selectScheduleDate = async (date) => {
  if (!date || scheduleDate.value === date) return
  scheduleDate.value = date
  await loadScheduleBlocks()
}

const changeScheduleStatus = async (item, status) => {
  if (!item?.id || updatingScheduleId.value) return
  updatingScheduleId.value = item.id
  const response = await updateScheduleBlock(item.id, { status })
  updatingScheduleId.value = null

  if (!response.success) {
    showError('日程状态更新失败', { description: response.error || '请稍后重试' })
    return
  }

  success(status === 'completed' ? '日程任务已完成' : '日程状态已更新')
  await loadScheduleBlocks()
}

const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey || formatLocalDateKey()}T00:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + days)
  return formatLocalDateKey(date)
}

const openReschedulePanel = (item) => {
  reschedulingScheduleId.value = item.id
  rescheduleDraft.value = {
    date: item.scheduled_date || scheduleDate.value,
    startTime: item.start_time || '',
    durationMinutes: Number(item.duration_minutes || 60)
  }
}

const closeReschedulePanel = () => {
  reschedulingScheduleId.value = null
  rescheduleDraft.value = {
    date: '',
    startTime: '',
    durationMinutes: 60
  }
}

const submitReschedule = async (item) => {
  if (!item?.id || updatingScheduleId.value) return
  updatingScheduleId.value = item.id
  const response = await updateScheduleBlock(item.id, {
    scheduled_date: rescheduleDraft.value.date || item.scheduled_date,
    start_time: rescheduleDraft.value.startTime || null,
    duration_minutes: rescheduleDraft.value.durationMinutes || item.duration_minutes
  })
  updatingScheduleId.value = null

  if (!response.success) {
    showError('日程改期失败', { description: response.error || '请稍后重试' })
    return
  }

  closeReschedulePanel()
  success(response.data?.conflict_count ? '已改期，但仍有时间重叠' : '日程已改期', {
    description: response.data?.conflict_count ? '建议继续调整时间，避免同一时间段任务过载。' : response.message || ''
  })
  scheduleDate.value = response.data?.scheduled_date || rescheduleDraft.value.date || scheduleDate.value
  await loadScheduleBlocks()
}

const postponeSchedule = async (item) => {
  if (!item?.id || updatingScheduleId.value) return
  updatingScheduleId.value = item.id
  const nextDate = addDaysToDateKey(item.scheduled_date || scheduleDate.value, 1)
  const response = await updateScheduleBlock(item.id, {
    scheduled_date: nextDate,
    status: item.status === 'completed' ? item.status : 'scheduled'
  })
  updatingScheduleId.value = null

  if (!response.success) {
    showError('延期失败', { description: response.error || '请稍后重试' })
    return
  }

  success(response.data?.conflict_count ? '已延期，但新时间有重叠' : '已延期一天', {
    description: response.data?.conflict_count ? '新日期存在时间重叠，可以进入对应日期继续改期。' : `已移动到 ${nextDate}`
  })
  scheduleDate.value = nextDate
  await loadScheduleBlocks()
}

const createNew = async () => {
  isCreating.value = true
  const res = await planStore.addPlan({
    title: '新计划',
    status: 'not_started',
    priority: 'medium',
    type: 'project'
  })
  isCreating.value = false

  if (res.success && res.data?.id) {
    success('计划创建成功')
    router.push({ name: 'PlanEditor', params: { id: res.data.id } })
    return
  }

  showError('新建计划失败', { description: res.error || '请稍后重试' })
}

const onBoardDrop = async (status) => {
  if (!dragPlan.value || dragPlan.value.status === status) return
  const res = await planStore.updatePlan(dragPlan.value.id, { status })
  if (!res.success) showError('更新状态失败', { description: res.error || '请稍后重试' })
  dragPlan.value = null
}

const deletePlan = async (plan) => {
  if (!confirm(`确定要删除计划“${plan.title}”吗？此操作不可撤销。`)) return
  const res = await planStore.deletePlan(plan.id)
  if (res.success) {
    selectedPlans.value = selectedPlans.value.filter((id) => id !== plan.id)
    success('计划已删除')
  } else {
    showError('删除失败', { description: res.error || '请稍后重试' })
  }
}

const archivePlan = async (plan) => {
  const category = prompt('请输入归档分类，留空使用默认分类：', plan.archive_category || 'default') || 'default'
  const res = await planStore.archivePlan(plan.id, category)
  if (res.success) success('计划已归档')
  else showError('归档失败', { description: res.error || '请稍后重试' })
}

const restorePlan = async (plan) => {
  const res = await planStore.updatePlan(plan.id, { status: 'not_started', archived_at: null, archive_category: null })
  if (res.success) success('计划已恢复')
  else showError('恢复失败', { description: res.error || '请稍后重试' })
}

const batchDelete = async () => {
  if (!selectedPlans.value.length || !confirm(`确定要删除选中的 ${selectedPlans.value.length} 个计划吗？`)) return
  const results = await Promise.all(selectedPlans.value.map((id) => planStore.deletePlan(id)))
  const failed = results.filter((item) => !item.success)
  selectedPlans.value = []
  if (failed.length) showError('部分计划删除失败', { description: `失败 ${failed.length} 个` })
  else success('批量删除成功')
}

const clearSelection = () => {
  selectedPlans.value = []
}

const toggleSelectAll = () => {
  selectedPlans.value = isAllSelected.value ? [] : filteredActivePlans.value.map((plan) => plan.id)
}

watch(filteredActivePlans, (plans) => {
  const visibleIds = new Set(plans.map((plan) => plan.id))
  selectedPlans.value = selectedPlans.value.filter((id) => visibleIds.has(id))
})

watch(view, (nextView) => {
  if (nextView === 'schedule') {
    loadScheduleBlocks()
  }
})

onMounted(() => {
  planStore.loadPlans()
  if (view.value === 'schedule') {
    loadScheduleBlocks()
  }
})
</script>

<style scoped>
.checkbox {
  @apply w-4 h-4 text-zinc-900 bg-gray-100 border-gray-300 rounded focus:ring-zinc-400 dark:focus:ring-zinc-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
}

.schedule-filter-field {
  display: grid;
  gap: 0.4rem;
  min-width: 9.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(82, 82, 91);
}

.schedule-filter-field input,
.schedule-filter-field select {
  min-height: 2.55rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 0 0.85rem;
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.schedule-filter-field input:focus,
.schedule-filter-field select:focus {
  border-color: rgb(24, 24, 27);
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.08);
}

.schedule-refresh-button,
.schedule-action-button,
.schedule-action-link {
  min-height: 2.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.85);
  padding: 0 0.95rem;
  color: rgb(39, 39, 42);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 2.35rem;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.schedule-refresh-button:hover:not(:disabled),
.schedule-action-button:hover:not(:disabled),
.schedule-action-link:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.82);
  background: white;
}

.schedule-refresh-button:disabled,
.schedule-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.schedule-date-strip {
  display: grid;
  grid-auto-columns: minmax(5.75rem, 1fr);
  grid-auto-flow: column;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(113, 113, 122, 0.45) transparent;
}

.schedule-date-card {
  display: grid;
  min-height: 5.4rem;
  min-width: 5.75rem;
  align-content: center;
  gap: 0.2rem;
  border: 1px solid rgba(212, 212, 216, 0.88);
  border-radius: 1.2rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(244, 244, 245, 0.78));
  padding: 0.75rem;
  text-align: left;
  color: rgb(82, 82, 91);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.schedule-date-card:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.7);
}

.schedule-date-card strong {
  color: rgb(24, 24, 27);
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.schedule-date-card span:last-child {
  font-size: 0.75rem;
  font-weight: 700;
}

.schedule-date-card-week {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.schedule-date-card-active {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 45px rgba(24, 24, 27, 0.18);
}

.schedule-date-card-active strong {
  color: white;
}

.schedule-conflict-panel,
.schedule-reschedule-panel {
  margin-top: 1rem;
  border-radius: 1.15rem;
  padding: 1rem;
}

.schedule-conflict-panel {
  border: 1px solid rgba(245, 158, 11, 0.22);
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 34%),
    rgba(255, 251, 235, 0.58);
}

.schedule-reschedule-panel {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(250, 250, 250, 0.82);
}

.schedule-action-button-complete {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(236, 253, 245, 0.86);
  color: rgb(4, 120, 87);
}

.schedule-action-button-muted {
  color: rgb(113, 113, 122);
}

.dark .schedule-filter-field {
  color: rgb(161, 161, 170);
}

.dark .schedule-filter-field input,
.dark .schedule-filter-field select {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .schedule-filter-field input:focus,
.dark .schedule-filter-field select:focus {
  border-color: white;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.dark .schedule-refresh-button,
.dark .schedule-action-button,
.dark .schedule-action-link {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.72);
  color: rgb(244, 244, 245);
}

.dark .schedule-refresh-button:hover:not(:disabled),
.dark .schedule-action-button:hover:not(:disabled),
.dark .schedule-action-link:hover {
  border-color: rgba(161, 161, 170, 0.7);
  background: rgba(63, 63, 70, 0.85);
}

.dark .schedule-date-strip {
  scrollbar-color: rgba(161, 161, 170, 0.36) transparent;
}

.dark .schedule-date-card {
  border-color: rgba(63, 63, 70, 0.9);
  background: linear-gradient(145deg, rgba(39, 39, 42, 0.78), rgba(24, 24, 27, 0.82));
  color: rgb(161, 161, 170);
}

.dark .schedule-date-card:hover {
  border-color: rgba(161, 161, 170, 0.58);
}

.dark .schedule-date-card strong {
  color: white;
}

.dark .schedule-date-card-active {
  border-color: white;
  background: white;
  color: rgba(24, 24, 27, 0.62);
  box-shadow: 0 18px 45px rgba(255, 255, 255, 0.08);
}

.dark .schedule-date-card-active strong {
  color: rgb(24, 24, 27);
}

.dark .schedule-conflict-panel {
  border-color: rgba(245, 158, 11, 0.24);
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 34%),
    rgba(24, 24, 27, 0.72);
}

.dark .schedule-reschedule-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
}

.dark .schedule-action-button-complete {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(16, 185, 129, 0.13);
  color: rgb(167, 243, 208);
}

.dark .schedule-action-button-muted {
  color: rgb(161, 161, 170);
}
</style>
