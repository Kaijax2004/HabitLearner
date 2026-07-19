<template>
  <AppLayout title="计划">
    <div class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">计划</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">把目标拆成可执行的计划，并在看板、日历和归档中闭环管理。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="selectedPlans.length">
            <span class="text-sm text-gray-600 dark:text-gray-400">已选择 {{ selectedPlans.length }} 项</span>
            <button class="btn-secondary text-sm px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200" @click="batchDelete">批量删除</button>
            <button class="btn-secondary text-sm px-3 py-2" @click="clearSelection">取消选择</button>
          </template>
          <button class="btn-primary px-4 py-2 rounded-lg" :disabled="isCreating" @click="createNew">
            {{ isCreating ? '创建中...' : '新建计划' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BaseCard v-for="metric in metrics" :key="metric.label">
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ metric.label }}</div>
          <div class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{{ metric.value }}</div>
        </BaseCard>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button :class="tabClass('list')" @click="view = 'list'">列表</button>
        <button :class="tabClass('board')" @click="view = 'board'">看板</button>
        <button :class="tabClass('calendar')" @click="view = 'calendar'">日历</button>
        <button :class="tabClass('archive')" @click="view = 'archive'">归档</button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
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
        <div class="py-12 text-center text-gray-500 dark:text-gray-400">正在加载计划...</div>
      </BaseCard>

      <BaseCard v-else-if="view === 'list'">
        <div v-if="!filteredActivePlans.length" class="text-center text-gray-500 dark:text-gray-400 py-12">
          暂无计划，点击右上角“新建计划”开始。
        </div>
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <div class="flex items-center gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <input type="checkbox" :checked="isAllSelected" class="checkbox" @change="toggleSelectAll" />
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ isAllSelected ? '取消全选' : '全选' }}</span>
          </div>
          <div v-for="plan in filteredActivePlans" :key="plan.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3 min-w-0">
              <input v-model="selectedPlans" type="checkbox" :value="plan.id" class="checkbox mt-1" />
              <div class="min-w-0">
                <div class="font-medium text-gray-900 dark:text-white truncate">{{ plan.title }}</div>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge :status="plan.status" />
                  <span :class="priorityClass(plan.priority)">{{ priorityLabel(plan.priority) }}</span>
                  <span class="text-xs text-gray-500">{{ typeLabel(plan) }}</span>
                  <span v-if="plan.due_date" class="text-xs text-gray-500">截止 {{ plan.due_date }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:justify-end">
              <router-link :to="`/plan/${plan.id}`" class="text-primary-500 hover:text-primary-600 transition-colors">编辑</router-link>
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
            class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 border border-gray-200 dark:border-gray-800 min-h-[260px]"
            @dragover.prevent
            @drop="onBoardDrop(column.key)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="font-medium text-gray-900 dark:text-white">{{ column.label }}</div>
              <div class="text-xs text-gray-500">{{ plansByStatus[column.key].length }}</div>
            </div>
            <div class="space-y-2">
              <div
                v-for="plan in plansByStatus[column.key]"
                :key="plan.id"
                class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-move"
                draggable="true"
                @dragstart="dragPlan = plan"
              >
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ plan.title }}</div>
                <div class="flex items-center gap-2 mt-2">
                  <StatusBadge :status="plan.status" />
                  <span class="text-[11px] text-gray-500">{{ typeLabel(plan) }}</span>
                  <span v-if="plan.due_date" class="text-xs text-gray-500">{{ plan.due_date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else-if="view === 'calendar'">
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div v-for="date in dates" :key="date.value" class="p-3 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 min-h-[96px]">
            <div class="text-xs text-gray-500 mb-2">{{ date.label }}</div>
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

      <BaseCard v-else>
        <div v-if="!filteredArchivedPlans.length" class="text-center text-gray-500 dark:text-gray-400 py-12">暂无归档计划</div>
        <div v-else class="space-y-5">
          <div v-for="category in archiveCategories" :key="category" class="space-y-2">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">
              {{ category === 'default' ? '默认分类' : category }}
              <span class="text-sm text-gray-500">({{ getPlansByCategory(category).length }})</span>
            </h3>
            <div class="space-y-2">
              <div v-for="plan in getPlansByCategory(category)" :key="plan.id" class="flex items-center justify-between py-3 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ plan.title }}</div>
                  <div class="text-xs text-gray-500">归档于 {{ formatDate(plan.archived_at) }}</div>
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

const activePlans = computed(() => planStore.plans.filter((plan) => plan.status !== 'archived'))
const archivedPlans = computed(() => planStore.plans.filter((plan) => plan.status === 'archived'))
const matchesTypeFilter = (plan) => selectedTypeFilter.value === 'all' || plan.type === selectedTypeFilter.value
const filteredActivePlans = computed(() => activePlans.value.filter(matchesTypeFilter))
const filteredArchivedPlans = computed(() => archivedPlans.value.filter(matchesTypeFilter))
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
  const date = new Date()
  date.setDate(date.getDate() + index)
  return {
    value: date.toISOString().slice(0, 10),
    label: index === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`
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

onMounted(() => {
  planStore.loadPlans()
})
</script>

<style scoped>
.checkbox {
  @apply w-4 h-4 text-zinc-900 bg-gray-100 border-gray-300 rounded focus:ring-zinc-400 dark:focus:ring-zinc-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
}
</style>
