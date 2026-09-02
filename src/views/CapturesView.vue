<template>
  <AppLayout title="收集">
    <div class="captures-page w-full min-w-0 space-y-5">
      <section class="captures-hero w-full rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="grid gap-6 xl:grid-cols-2 xl:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Quick Capture</p>
            <h1 class="mt-3 w-full max-w-none text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">
              先收进来，再决定去向
            </h1>
            <p class="mt-4 w-full max-w-none text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              收集箱是个人工作台的中转站。想法、任务、学习收获和习惯备注先统一记录，再转成计划、计划块、学习笔记、习惯备注、复盘草稿或归档。
            </p>
          </div>

          <div class="grid grid-cols-3 overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-zinc-100 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div v-for="item in summaryCards" :key="item.label" class="bg-white px-4 py-3 dark:bg-zinc-950/80">
              <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
              <p class="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid w-full gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">New Capture</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">快速收集</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">先记录，不急着整理完美。处理时再决定它应该去哪里。</p>
            </div>

            <select v-model="draft.type" class="capture-field">
              <option value="idea">想法</option>
              <option value="task">任务</option>
              <option value="learning">学习</option>
              <option value="plan">计划</option>
              <option value="habit">习惯</option>
            </select>

            <textarea
              v-model="draft.content"
              class="capture-textarea"
              rows="6"
              maxlength="1200"
              placeholder="例如：把今天的学习收获转成一个 20 分钟行动"
            ></textarea>

            <button class="capture-primary-button w-full" type="button" :disabled="isCreating" @click="submitCapture">
              {{ isCreating ? '收集中...' : '加入收集箱' }}
            </button>

            <div class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-white/5">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">整理原则</p>
              <div class="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <p>1. 明确要执行的内容，优先转成计划或计划块。</p>
                <p>2. 学习收获先沉淀为笔记，再决定是否转行动。</p>
                <p>3. 暂时想不清的内容可以先保留，晚上复盘时再处理。</p>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Inbox</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">待整理内容</h2>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ activeStatusLabel }} · {{ captures.length }} 条</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in statusFilters"
                  :key="option.value"
                  type="button"
                  class="capture-filter-button"
                  :class="{ 'is-active': activeStatus === option.value }"
                  @click="setStatus(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {{ errorMessage }}
            </div>

            <div v-if="selectedIds.length" class="capture-bulk-bar">
              <div>
                <p class="text-sm font-semibold text-zinc-950 dark:text-white">已选择 {{ selectedIds.length }} 条</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">批量操作只改变状态，不会自动转换内容。</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button v-if="activeStatus !== 'archived'" class="capture-danger-button" type="button" :disabled="isBatchUpdating" @click="batchArchive">批量归档</button>
                <button v-if="activeStatus === 'archived'" class="capture-secondary-button" type="button" :disabled="isBatchUpdating" @click="batchRestore">恢复待处理</button>
                <button class="capture-secondary-button" type="button" @click="clearSelection">取消选择</button>
              </div>
            </div>

            <div v-if="isLoading" class="space-y-3">
              <div v-for="index in 5" :key="index" class="h-28 animate-pulse rounded-[1.4rem] bg-zinc-100 dark:bg-zinc-900"></div>
            </div>

            <div v-else-if="!captures.length" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <p class="text-base font-semibold text-zinc-950 dark:text-white">当前没有收集内容</p>
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">把脑子里的临时想法先放到这里，稍后再整理。</p>
            </div>

            <div v-else class="space-y-3">
              <article
                v-for="capture in captures"
                :key="capture.id"
                class="capture-card"
                :class="{ 'is-selected': selectedIds.includes(capture.id) }"
              >
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <label class="capture-check">
                        <input type="checkbox" :checked="selectedIds.includes(capture.id)" @change="toggleSelection(capture.id)" />
                        <span></span>
                      </label>
                      <span class="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">{{ typeLabel(capture.type) }}</span>
                      <span class="rounded-full bg-white px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-300">{{ statusLabel(capture.status) }}</span>
                      <span class="text-xs text-zinc-400">{{ formatDateTime(capture.createdAt) }}</span>
                    </div>

                    <textarea
                      v-if="editingId === capture.id"
                      v-model="editingContent"
                      class="capture-textarea mt-3"
                      rows="4"
                    ></textarea>
                    <p v-else class="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-200">{{ capture.content }}</p>

                    <div v-if="capture.status === 'linked' || latestHistory(capture)" class="capture-history mt-3">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">处理历史</p>
                      <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ historyText(capture) }}</p>
                    </div>

                    <div v-if="conversionTargetId === capture.id" class="capture-conversion-panel mt-4">
                      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p class="text-sm font-semibold text-zinc-950 dark:text-white">选择转换目标</p>
                          <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            先选择去向，再补充必要目标。转换后会记录历史并标记为已转化。
                          </p>
                        </div>
                        <button class="capture-secondary-button" type="button" @click="closeConversionPanel">收起</button>
                      </div>

                      <div class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                        <button
                          v-for="option in conversionOptions"
                          :key="option.value"
                          type="button"
                          class="capture-conversion-tab"
                          :class="{ 'is-active': conversionType === option.value }"
                          @click="conversionType = option.value"
                        >
                          {{ option.label }}
                        </button>
                      </div>

                      <div v-if="conversionType === 'plan_block'" class="mt-4">
                        <label class="capture-label">目标计划</label>
                        <select v-model="selectedPlanId" class="capture-field mt-2">
                          <option value="">请选择要追加到哪个计划</option>
                          <option v-for="plan in availablePlans" :key="plan.id" :value="String(plan.id)">
                            {{ plan.title }}
                          </option>
                        </select>
                        <p v-if="!availablePlans.length" class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">还没有可用计划，可以先转成新计划。</p>
                      </div>

                      <div v-if="conversionType === 'learning_note'" class="mt-4">
                        <label class="capture-label">目标课程</label>
                        <select v-model="selectedCourseId" class="capture-field mt-2">
                          <option value="">请选择要沉淀到哪节课程</option>
                          <option v-for="course in courses" :key="course.id" :value="String(course.id)">
                            {{ course.title }}
                          </option>
                        </select>
                        <p v-if="!courses.length" class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">学习内容库正在重建，暂时可以先把这条内容保存在收集箱或转入计划。</p>
                      </div>

                      <div v-if="conversionType === 'habit_comment'" class="mt-4">
                        <label class="capture-label">目标习惯</label>
                        <select v-model="selectedHabitId" class="capture-field mt-2">
                          <option value="">请选择要追加备注的习惯</option>
                          <option v-for="habit in habits" :key="habit.id" :value="String(habit.id)">
                            {{ habit.name }}
                          </option>
                        </select>
                        <p v-if="!habits.length" class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">还没有可选择的习惯，可以先创建一个习惯。</p>
                      </div>

                      <div v-if="conversionType === 'review_question'" class="mt-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-white/5 dark:text-zinc-300">
                        会追加到今天复盘的“今天卡住了什么”里。转换后你可以进入复盘页继续整理成明天第一步。
                      </div>

                      <div v-if="conversionType === 'creator_item'" class="mt-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-white/5">
                        <label class="capture-label">内容类型</label>
                        <select v-model="creatorType" class="capture-field mt-2">
                          <option value="trend">热点</option>
                          <option value="topic">选题</option>
                          <option value="draft">草稿</option>
                        </select>
                        <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">收集内容会进入内容创作轨道的收件箱，不会直接发布。</p>
                      </div>

                      <div class="mt-4 flex flex-wrap gap-2">
                        <button class="capture-primary-button" type="button" :disabled="isConverting" @click="submitConversion(capture)">
                          {{ isConverting ? '转换中...' : conversionSubmitLabel }}
                        </button>
                        <button class="capture-secondary-button" type="button" @click="closeConversionPanel">取消</button>
                      </div>
                    </div>
                  </div>

                  <div class="flex shrink-0 flex-wrap gap-2">
                    <button v-if="editingId === capture.id" class="capture-secondary-button" type="button" @click="saveEdit(capture)">保存</button>
                    <button v-if="editingId === capture.id" class="capture-secondary-button" type="button" @click="cancelEdit">取消</button>
                    <button v-if="editingId !== capture.id" class="capture-secondary-button" type="button" @click="startEdit(capture)">编辑</button>
                    <button v-if="capture.status === 'pending'" class="capture-primary-button" type="button" @click="openConversionPanel(capture)">整理</button>
                    <button v-if="capture.status !== 'archived'" class="capture-danger-button" type="button" @click="archiveCapture(capture)">归档</button>
                    <button v-if="capture.status === 'archived'" class="capture-secondary-button" type="button" @click="restoreCapture(capture)">恢复</button>
                    <button class="capture-delete-button" type="button" :disabled="deletingId === capture.id" @click="deleteCapture(capture)">
                      {{ deletingId === capture.id ? '删除中' : confirmDeleteId === capture.id ? '确认删除' : '删除' }}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import {
  batchUpdateQuickCaptures,
  createQuickCapture,
  deleteQuickCapture,
  linkQuickCapture,
  listQuickCaptures,
  updateQuickCapture
} from '@/api/workspace.js'
import { getHabits } from '@/api/habits.js'
import { getCourses } from '@/api/learning.js'
import { listPlans } from '@/api/plans.js'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error } = useToast()
const captures = ref([])
const totals = ref({ pending: 0, linked: 0, archived: 0 })
const courses = ref([])
const habits = ref([])
const plans = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const isBatchUpdating = ref(false)
const isConverting = ref(false)
const deletingId = ref(null)
const confirmDeleteId = ref(null)
const errorMessage = ref('')
const activeStatus = ref('pending')
const editingId = ref(null)
const editingContent = ref('')
const selectedIds = ref([])
const conversionTargetId = ref(null)
const conversionType = ref('plan')
const selectedPlanId = ref('')
const selectedCourseId = ref('')
const selectedHabitId = ref('')
const creatorType = ref('topic')
const draft = reactive({
  type: 'idea',
  content: ''
})

const statusFilters = [
  { label: '待处理', value: 'pending' },
  { label: '已转化', value: 'linked' },
  { label: '已归档', value: 'archived' }
]

const conversionOptions = [
  { label: '转新计划', value: 'plan' },
  { label: '转计划块', value: 'plan_block' },
  { label: '转学习笔记', value: 'learning_note' },
  { label: '转习惯备注', value: 'habit_comment' },
  { label: '转内容创作', value: 'creator_item' },
  { label: '转复盘草稿', value: 'review_question' }
]

const summaryCards = computed(() => [
  { label: '待处理', value: totals.value.pending },
  { label: '已转化', value: totals.value.linked },
  { label: '已归档', value: totals.value.archived }
])

const activeStatusLabel = computed(() => statusFilters.find((item) => item.value === activeStatus.value)?.label || '收集箱')

const availablePlans = computed(() => plans.value.filter((plan) => !['completed', 'done', 'archived'].includes(plan.status)))

const conversionSubmitLabel = computed(() => ({
  plan: '转为新计划',
  plan_block: '追加到计划块',
  learning_note: '转为学习笔记',
  habit_comment: '转为习惯备注',
  creator_item: '转为内容条目',
  review_question: '转入复盘'
})[conversionType.value] || '确认转换')

const typeLabel = (type) => ({
  idea: '想法',
  task: '任务',
  learning: '学习',
  plan: '计划',
  habit: '习惯'
})[type] || '收集'

const statusLabel = (status) => ({
  pending: '待处理',
  linked: '已转化',
  archived: '已归档'
})[status] || '待处理'

const targetTypeLabel = (type) => ({
  plan: '计划',
  plan_block: '计划块',
  learning_note: '学习笔记',
  habit_comment: '习惯备注',
  creator_item: '内容创作',
  review_question: '复盘草稿',
  track_note: '轨道沉淀'
})[type] || '目标'

const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const latestHistory = (capture) => {
  const history = Array.isArray(capture.metadata?.history) ? capture.metadata.history : []
  return history[history.length - 1] || null
}

const historyText = (capture) => {
  const latest = latestHistory(capture)
  if (capture.status === 'linked') {
    const type = targetTypeLabel(capture.linked_type)
    const target = capture.linked_id ? ` #${capture.linked_id}` : ''
    const time = formatDateTime(latest?.at || capture.updatedAt)
    return `已转化为${type}${target}${time ? ` · ${time}` : ''}`
  }
  if (!latest) return '暂无处理历史'
  const actionLabel = {
    archived: '已归档',
    batch_archived: '批量归档',
    batch_restored: '恢复为待处理',
    status_changed: '状态已更新',
    linked: '已转化'
  }[latest.action] || '已处理'
  const time = formatDateTime(latest.at || capture.updatedAt)
  return `${actionLabel}${time ? ` · ${time}` : ''}`
}

const refreshTotals = async () => {
  const responses = await Promise.all(statusFilters.map((item) => listQuickCaptures({ status: item.value, limit: 1 })))
  const nextTotals = { pending: 0, linked: 0, archived: 0 }
  responses.forEach((response, index) => {
    if (response.success) nextTotals[statusFilters[index].value] = Number(response.total || response.data?.length || 0)
  })
  totals.value = nextTotals
}

const loadConversionTargets = async () => {
  const [courseResponse, habitResponse, planResponse] = await Promise.all([
    getCourses({ limit: 100 }),
    getHabits(),
    listPlans()
  ])

  if (courseResponse.success) {
    courses.value = Array.isArray(courseResponse.data?.courses) ? courseResponse.data.courses : []
  }

  if (habitResponse.success) {
    habits.value = Array.isArray(habitResponse.data) ? habitResponse.data : []
  }

  if (planResponse.success) {
    plans.value = Array.isArray(planResponse.data) ? planResponse.data : []
  }
}

const loadCaptures = async () => {
  isLoading.value = true
  errorMessage.value = ''
  selectedIds.value = []
  confirmDeleteId.value = null
  closeConversionPanel()
  const response = await listQuickCaptures({ status: activeStatus.value, limit: 100 })
  isLoading.value = false

  if (!response.success) {
    errorMessage.value = response.error || '收集箱加载失败'
    return
  }

  captures.value = Array.isArray(response.data) ? response.data : []
  await refreshTotals()
}

const setStatus = async (status) => {
  activeStatus.value = status
  await loadCaptures()
}

const submitCapture = async () => {
  const content = draft.content.trim()
  if (!content) {
    error('收集内容不能为空')
    return
  }

  isCreating.value = true
  const response = await createQuickCapture({ type: draft.type, content })
  isCreating.value = false

  if (!response.success) {
    error('收集失败', { description: response.error || '请稍后重试' })
    return
  }

  draft.content = ''
  activeStatus.value = 'pending'
  success('已加入收集箱')
  await loadCaptures()
}

const toggleSelection = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const clearSelection = () => {
  selectedIds.value = []
  confirmDeleteId.value = null
}

const startEdit = (capture) => {
  confirmDeleteId.value = null
  editingId.value = capture.id
  editingContent.value = capture.content || ''
}

const cancelEdit = () => {
  editingId.value = null
  editingContent.value = ''
}

const saveEdit = async (capture) => {
  const content = editingContent.value.trim()
  if (!content) {
    error('收集内容不能为空')
    return
  }

  const response = await updateQuickCapture(capture.id, { content })
  if (!response.success) {
    error('保存失败', { description: response.error || '请稍后重试' })
    return
  }

  capture.content = content
  cancelEdit()
  success('已更新')
}

const openConversionPanel = async (capture) => {
  confirmDeleteId.value = null
  conversionTargetId.value = capture.id
  conversionType.value = capture.content?.includes('复盘问题')
    ? 'review_question'
    : capture.type === 'learning'
      ? 'learning_note'
      : capture.type === 'habit'
        ? 'habit_comment'
        : capture.type === 'task'
          ? 'plan_block'
          : 'plan'
  selectedPlanId.value = ''
  selectedCourseId.value = ''
  selectedHabitId.value = ''
  creatorType.value = 'topic'
  await loadConversionTargets()
}

const closeConversionPanel = () => {
  conversionTargetId.value = null
  conversionType.value = 'plan'
  selectedPlanId.value = ''
  selectedCourseId.value = ''
  selectedHabitId.value = ''
}

const submitConversion = async (capture) => {
  const payload = { targetType: conversionType.value }

  if (conversionType.value === 'plan_block') {
    if (!selectedPlanId.value) {
      error('请选择目标计划', { description: '转为计划块需要选择要追加到哪个计划。' })
      return
    }
    payload.planId = Number(selectedPlanId.value)
  }

  if (conversionType.value === 'learning_note') {
    if (!selectedCourseId.value) {
      error('请选择课程', { description: '学习笔记暂时需要选择一个内容来源；学习内容库重建期间可以先转入收集箱或计划。' })
      return
    }
    payload.courseId = Number(selectedCourseId.value)
  }

  if (conversionType.value === 'habit_comment') {
    if (!selectedHabitId.value) {
      error('请选择习惯', { description: '习惯备注需要选择一个目标习惯。' })
      return
    }
    payload.habitId = Number(selectedHabitId.value)
  }

  if (conversionType.value === 'creator_item') {
    payload.creatorType = creatorType.value
  }

  isConverting.value = true
  const response = await linkQuickCapture(capture.id, payload)
  isConverting.value = false

  if (!response.success) {
    error('转换失败', { description: response.error || '请稍后重试' })
    return
  }

  success(response.message || '转换成功')
  if (conversionType.value === 'review_question') {
    router.push('/review')
    return
  }
  await loadCaptures()
}

const archiveCapture = async (capture) => {
  const response = await updateQuickCapture(capture.id, { status: 'archived' })
  if (!response.success) {
    error('归档失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已归档')
  await loadCaptures()
}

const restoreCapture = async (capture) => {
  const response = await updateQuickCapture(capture.id, { status: 'pending' })
  if (!response.success) {
    error('恢复失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已恢复为待处理')
  await loadCaptures()
}

const deleteCapture = async (capture) => {
  if (!capture?.id || deletingId.value) return

  if (confirmDeleteId.value !== capture.id) {
    confirmDeleteId.value = capture.id
    return
  }

  deletingId.value = capture.id
  const response = await deleteQuickCapture(capture.id)
  deletingId.value = null

  if (!response.success) {
    error('删除失败', { description: response.error || '请稍后重试' })
    return
  }

  confirmDeleteId.value = null
  success('已删除收集项')
  await loadCaptures()
}

const batchUpdate = async (status) => {
  if (!selectedIds.value.length) return
  isBatchUpdating.value = true
  const response = await batchUpdateQuickCaptures({ ids: selectedIds.value, status })
  isBatchUpdating.value = false

  if (!response.success) {
    error('批量操作失败', { description: response.error || '请稍后重试' })
    return
  }

  success(response.message || '批量操作完成')
  await loadCaptures()
}

const batchArchive = () => batchUpdate('archived')
const batchRestore = () => batchUpdate('pending')

onMounted(async () => {
  await Promise.all([loadCaptures(), loadConversionTargets()])
})
</script>

<style scoped>
.captures-hero {
  position: relative;
  overflow: hidden;
}

.captures-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 12%, rgba(24, 24, 27, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
}

.captures-hero > * {
  position: relative;
}

.capture-field,
.capture-textarea {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  outline: none;
}

.capture-field {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.capture-textarea {
  min-height: 6rem;
  resize: vertical;
  padding: 0.9rem 1rem;
  line-height: 1.65;
}

.capture-label {
  color: rgb(82, 82, 91);
  font-size: 0.75rem;
  font-weight: 700;
}

.capture-primary-button,
.capture-secondary-button,
.capture-danger-button,
.capture-delete-button,
.capture-filter-button,
.capture-conversion-tab {
  min-height: 2.5rem;
  border-radius: 1rem;
  padding: 0 1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.capture-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.capture-secondary-button,
.capture-danger-button,
.capture-delete-button,
.capture-filter-button,
.capture-conversion-tab {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  color: rgb(63, 63, 70);
}

.capture-filter-button,
.capture-conversion-tab {
  border-radius: 9999px;
}

.capture-filter-button.is-active,
.capture-conversion-tab.is-active {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.capture-danger-button {
  color: rgb(185, 28, 28);
}

.capture-delete-button {
  border-color: rgba(248, 113, 113, 0.45);
  background: rgba(254, 242, 242, 0.92);
  color: rgb(153, 27, 27);
}

.capture-primary-button:hover:not(:disabled),
.capture-secondary-button:hover:not(:disabled),
.capture-danger-button:hover:not(:disabled),
.capture-delete-button:hover:not(:disabled),
.capture-filter-button:hover:not(:disabled),
.capture-conversion-tab:hover:not(:disabled) {
  transform: translateY(-1px);
}

.capture-primary-button:disabled,
.capture-secondary-button:disabled,
.capture-danger-button:disabled,
.capture-delete-button:disabled,
.capture-conversion-tab:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.capture-bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 1.4rem;
  background: rgba(250, 250, 250, 0.92);
  padding: 1rem;
}

.capture-card {
  border: 1px solid rgba(212, 212, 216, 0.86);
  border-radius: 1.45rem;
  background: rgba(250, 250, 250, 0.82);
  padding: 1rem;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.capture-card.is-selected {
  border-color: rgb(24, 24, 27);
  background: white;
  box-shadow: 0 16px 36px rgba(24, 24, 27, 0.08);
}

.capture-check {
  display: inline-flex;
  cursor: pointer;
  align-items: center;
}

.capture-check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.capture-check span {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid rgba(161, 161, 170, 0.9);
  border-radius: 9999px;
  background: white;
}

.capture-check input:checked + span {
  border-color: rgb(24, 24, 27);
  background: radial-gradient(circle, rgb(24, 24, 27) 42%, white 46%);
}

.capture-history {
  border-top: 1px solid rgba(228, 228, 231, 0.9);
  padding-top: 0.75rem;
}

.capture-conversion-panel {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top right, rgba(24, 24, 27, 0.06), transparent 36%),
    rgba(255, 255, 255, 0.78);
  padding: 1rem;
}

.dark .capture-field,
.dark .capture-textarea,
.dark .capture-secondary-button,
.dark .capture-danger-button,
.dark .capture-delete-button,
.dark .capture-filter-button,
.dark .capture-conversion-tab {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .capture-label {
  color: rgb(212, 212, 216);
}

.dark .capture-primary-button,
.dark .capture-filter-button.is-active,
.dark .capture-conversion-tab.is-active {
  background: white;
  color: rgb(24, 24, 27);
}

.dark .capture-danger-button,
.dark .capture-delete-button {
  color: rgb(252, 165, 165);
}

.dark .capture-delete-button {
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(127, 29, 29, 0.18);
}

.dark .capture-bulk-bar,
.dark .capture-card,
.dark .capture-conversion-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
}

.dark .capture-card.is-selected {
  border-color: white;
  background: rgba(39, 39, 42, 0.82);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.dark .capture-check span {
  border-color: rgba(113, 113, 122, 0.9);
  background: rgb(24, 24, 27);
}

.dark .capture-check input:checked + span {
  border-color: white;
  background: radial-gradient(circle, white 42%, rgb(24, 24, 27) 46%);
}

.dark .capture-history {
  border-color: rgba(63, 63, 70, 0.9);
}

@media (max-width: 640px) {
  .capture-bulk-bar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
