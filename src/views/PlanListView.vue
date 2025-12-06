<template>
  <AppLayout title="计划">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">计划</h1>
        <div class="flex items-center gap-2">
          <!-- 批量操作按钮 -->
          <div v-if="selectedPlans.length > 0" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">已选择 {{ selectedPlans.length }} 项</span>
            <button 
              @click="batchDelete"
              class="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              批量删除
            </button>
            <button 
              @click="clearSelection"
              class="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              取消选择
            </button>
          </div>
          <button class="btn-primary px-4 py-2 rounded-lg" @click="createNew">新建计划</button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button :class="tabClass('list')" @click="view='list'">列表</button>
        <button :class="tabClass('board')" @click="view='board'">看板</button>
        <button :class="tabClass('calendar')" @click="view='calendar'">日历</button>
        <button :class="tabClass('archive')" @click="view='archive'">归档</button>
      </div>

      <div v-if="view==='list'">
        <BaseCard>
          <div v-if="!plans.length" class="text-center text-gray-500 dark:text-gray-400 py-12">
            暂无计划，点击右上角“新建计划”开始吧
          </div>
          <div v-else class="divide-y">
            <!-- 全选行 -->
            <div class="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ isAllSelected ? '取消全选' : '全选' }}
              </span>
            </div>
            <div v-for="p in plans" :key="p.id" class="flex items-center justify-between py-3">
              <div class="flex items-center gap-3">
                <!-- 选择复选框 -->
                <input 
                  type="checkbox" 
                  :value="p.id"
                  v-model="selectedPlans"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div>
                  <div class="font-medium dark:text-white">{{ p.title }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="statusClass(p.status)">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass(p.status)"></span>{{ statusLabel(p.status) }}
                    </span>
                    <span v-if="p.due_date" class="text-xs text-gray-500">截止 {{ p.due_date }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <router-link :to="`/plan/${p.id}`" class="text-primary-500 hover:text-primary-600 transition-colors">编辑</router-link>
                <div class="flex items-center gap-1">
                  <!-- 归档按钮 (仅对已完成计划显示) -->
                  <button 
                    v-if="p.status === 'done'"
                    @click="archivePlan(p)"
                    class="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="归档计划"
                  >
                    归档
                  </button>
                  <!-- 删除按钮 -->
                  <button 
                    @click="deletePlan(p)"
                    class="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="删除计划"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      <div v-else-if="view==='board'">
        <BaseCard>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="col in boardColumns" :key="col.key" class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 border border-gray-200 dark:border-gray-800 min-h-[260px]"
                 @dragover.prevent @drop="onBoardDrop(col.key)">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium dark:text-white">{{ col.label }}</div>
                <div class="text-xs text-gray-500">{{ plansByStatus[col.key].length }}</div>
              </div>
              <div class="space-y-2">
                <div v-for="p in plansByStatus[col.key]" :key="p.id" class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" draggable="true" @dragstart="dragPlan=p">
                  <div class="text-sm font-medium dark:text-white truncate">{{ p.title }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" :class="statusClass(p.status)">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass(p.status)"></span>{{ statusLabel(p.status) }}
                    </span>
                    <span class="text-xs text-gray-500" v-if="p.due_date">截止 {{ p.due_date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      <div v-else-if="view==='calendar'">
        <BaseCard>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="d in 14" :key="d" class="p-3 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 min-h-[80px]">
              <div class="text-xs text-gray-500 mb-1">{{ calendarLabel(d) }}</div>
              <div class="space-y-1">
                <div v-for="p in plansDueOn(dates[d-1])" :key="p.id" class="text-xs px-2 py-1 rounded bg-primary-500 text-white truncate">{{ p.title }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <div v-else-if="view==='archive'">
        <BaseCard>
          <div v-if="!archivedPlans.length" class="text-center text-gray-500 dark:text-gray-400 py-12">
            暂无归档计划
          </div>
          <div v-else class="space-y-4">
            <!-- 按分类分组显示归档计划 -->
            <div v-for="category in archiveCategories" :key="category" class="space-y-2">
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {{ category === 'default' ? '默认分类' : category }}
                <span class="text-sm text-gray-500">({{ getPlansByCategory(category).length }})</span>
              </h3>
              <div class="space-y-2">
                <div v-for="p in getPlansByCategory(category)" :key="p.id" class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div class="font-medium dark:text-white">{{ p.title }}</div>
                    <div class="text-xs text-gray-500">
                      归档于 {{ formatDate(p.archived_at) }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="restorePlan(p)"
                      class="text-xs text-gray-500 hover:text-green-600 transition-colors px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="恢复计划"
                    >
                      恢复
                    </button>
                    <button 
                      @click="deletePlan(p)"
                      class="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="永久删除"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      
    </div>

    <!-- 确认删除弹窗 -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="删除计划"
      :message="deleteConfirmMessage"
      type="error"
      confirm-text="删除"
      cancel-text="取消"
      @update:show="showDeleteConfirm = $event"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <!-- 归档输入弹窗 -->
    <PromptModal
      :show="showArchivePrompt"
      title="归档计划"
      message="请输入归档分类名称（留空使用默认分类）："
      placeholder="输入分类名称"
      default-value="default"
      type="info"
      confirm-text="归档"
      cancel-text="取消"
      @update:show="showArchivePrompt = $event"
      @confirm="handleArchiveConfirm"
      @cancel="handleArchiveCancel"
    />

    <!-- 恢复确认弹窗 -->
    <ConfirmModal
      :show="showRestoreConfirm"
      title="恢复计划"
      :message="restoreConfirmMessage"
      type="info"
      confirm-text="恢复"
      cancel-text="取消"
      @update:show="showRestoreConfirm = $event"
      @confirm="handleRestoreConfirm"
      @cancel="handleRestoreCancel"
    />

    <!-- 批量删除确认弹窗 -->
    <ConfirmModal
      :show="showBatchDeleteConfirm"
      title="批量删除"
      :message="batchDeleteConfirmMessage"
      type="error"
      confirm-text="删除"
      cancel-text="取消"
      @update:show="showBatchDeleteConfirm = $event"
      @confirm="handleBatchDeleteConfirm"
      @cancel="handleBatchDeleteCancel"
    />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import PromptModal from '@/components/PromptModal.vue'
import { usePlanStore } from '@/stores/plan'
import { useRouter } from 'vue-router'

const view = ref('list')
const selectedPlans = ref([])

// 弹窗状态
const showDeleteConfirm = ref(false)
const showArchivePrompt = ref(false)
const showRestoreConfirm = ref(false)
const showBatchDeleteConfirm = ref(false)

// 弹窗数据
const deleteConfirmMessage = ref('')
const restoreConfirmMessage = ref('')
const batchDeleteConfirmMessage = ref('')
const currentPlan = ref(null)
const currentArchiveCategory = ref('default')
const tabClass = (k) =>
  `px-3 py-1.5 rounded-md text-sm ${view.value===k?'bg-black text-white dark:bg-white dark:text-black':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`

const router = useRouter()
const planStore = usePlanStore()
const plans = computed(() => planStore.plans.filter(p => p.status !== 'archived'))
const archivedPlans = computed(() => planStore.plans.filter(p => p.status === 'archived'))

// 全选相关
const isAllSelected = computed(() => {
  return plans.value.length > 0 && selectedPlans.value.length === plans.value.length
})

// 状态标签统一映射
const statusLabel = (s) => ({ not_started: '未开始', in_progress: '进行中', done: '已完成' }[s || 'not_started'])
const statusClass = (s) => {
  const k = s || 'not_started'
  return {
    not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  }[k]
}
const statusDotClass = (s) => {
  const k = s || 'not_started'
  return {
    not_started: 'bg-gray-400',
    in_progress: 'bg-blue-500',
    done: 'bg-emerald-500'
  }[k]
}

// 看板
const boardColumns = [
  { key: 'not_started', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'done', label: '已完成' }
]
const dragPlan = ref(null)
const plansByStatus = computed(() => ({
  not_started: plans.value.filter(p => (p.status||'not_started')==='not_started'),
  in_progress: plans.value.filter(p => p.status==='in_progress'),
  done: plans.value.filter(p => p.status==='done')
}))
const onBoardDrop = (status) => async () => {
  if (!dragPlan.value) return
  await planStore.updatePlan(dragPlan.value.id, { status })
  dragPlan.value = null
}

// 日历（未来两周简版）
const today = new Date()
const dates = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(today)
  d.setDate(today.getDate() + i)
  return d
})
const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}`
const calendarLabel = (idx) => fmt(dates[idx-1])
const dateStr = (d) => d.toISOString().split('T')[0]
const plansDueOn = (d) => plans.value.filter(p => p.due_date && p.due_date.startsWith(dateStr(d)))

// 归档相关
const archiveCategories = computed(() => {
  const categories = [...new Set(archivedPlans.value.map(p => p.archive_category || 'default'))]
  return categories.sort()
})

const getPlansByCategory = (category) => {
  return archivedPlans.value.filter(p => (p.archive_category || 'default') === category)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  planStore.loadPlans()
})

// 直接创建并跳转（移除弹窗避免冲突）
const createNew = async () => {
  const res = await planStore.addPlan('新计划')
  if (res.success && res.data?.id) {
    const id = res.data.id
    try { await router.push({ name: 'PlanEditor', params: { id } }) }
    catch { await router.replace(`/plan/${id}`) }
  }
}

// 删除计划
const deletePlan = async (plan) => {
  currentPlan.value = plan
  deleteConfirmMessage.value = `确定要删除计划"${plan.title}"吗？此操作不可撤销。`
  showDeleteConfirm.value = true
}

// 归档计划
const archivePlan = async (plan) => {
  currentPlan.value = plan
  currentArchiveCategory.value = 'default'
  showArchivePrompt.value = true
}

// 恢复计划
const restorePlan = async (plan) => {
  currentPlan.value = plan
  restoreConfirmMessage.value = `确定要恢复计划"${plan.title}"吗？`
  showRestoreConfirm.value = true
}

// 批量删除
const batchDelete = async () => {
  if (selectedPlans.value.length === 0) return
  
  const planNames = selectedPlans.value.map(id => {
    const plan = plans.value.find(p => p.id === id)
    return plan ? plan.title : '未知计划'
  }).join('、')
  
  batchDeleteConfirmMessage.value = `确定要删除以下 ${selectedPlans.value.length} 个计划吗？\n\n${planNames}\n\n此操作不可撤销。`
  showBatchDeleteConfirm.value = true
}

// 清空选择
const clearSelection = () => {
  selectedPlans.value = []
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPlans.value = []
  } else {
    selectedPlans.value = plans.value.map(p => p.id)
  }
}

// 弹窗处理函数
const handleDeleteConfirm = async () => {
  if (currentPlan.value) {
    const res = await planStore.deletePlan(currentPlan.value.id)
    if (res.success) {
      console.log('计划删除成功')
    }
  }
}

const handleDeleteCancel = () => {
  currentPlan.value = null
}

const handleArchiveConfirm = async (category) => {
  console.log('handleArchiveConfirm 被调用，参数:', category)
  console.log('currentPlan.value:', currentPlan.value)
  
  if (currentPlan.value) {
    try {
      console.log('开始归档计划:', currentPlan.value.id, '分类:', category || 'default')
      const res = await planStore.archivePlan(currentPlan.value.id, category || 'default')
      console.log('归档结果:', res)
      
      if (res.success) {
        console.log('计划归档成功')
        // 可以添加成功提示
      } else {
        console.error('计划归档失败:', res.message)
        // 可以添加错误提示
      }
    } catch (error) {
      console.error('计划归档出错:', error)
      // 可以添加错误提示
    }
  } else {
    console.error('currentPlan.value 为空')
  }
}

const handleArchiveCancel = () => {
  currentPlan.value = null
}

const handleRestoreConfirm = async () => {
  if (currentPlan.value) {
    const res = await planStore.updatePlan(currentPlan.value.id, { 
      status: 'done', 
      archived_at: null, 
      archive_category: null 
    })
    if (res.success) {
      console.log('计划恢复成功')
    }
  }
}

const handleRestoreCancel = () => {
  currentPlan.value = null
}

const handleBatchDeleteConfirm = async () => {
  try {
    // 批量删除
    const deletePromises = selectedPlans.value.map(id => planStore.deletePlan(id))
    await Promise.all(deletePromises)
    
    // 清空选择
    selectedPlans.value = []
    console.log('批量删除成功')
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

const handleBatchDeleteCancel = () => {
  // 不需要额外处理
}
</script>

<style scoped>
</style>


