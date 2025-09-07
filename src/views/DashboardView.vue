<template>
  <AppLayout title="HabitLearner">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- 问候语和日期 -->
      <div class="text-center py-6">
                          <h1 class="text-2xl lg:text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
          {{ greeting }}, {{ user?.name || '用户' }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400">{{ currentDate }}</p>
      </div>

      <!-- 桌面端网格布局 -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-10 space-y-6 lg:space-y-0">
        <!-- 左侧：概览和学习内容 -->
        <div class="lg:col-span-5 space-y-6">
          <!-- 今日概览 -->
          <BaseCard title="今日概览" class="text-center">
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <div class="text-2xl font-bold text-primary-500">{{ habitStore.totalHabits }}</div>
                <div class="text-sm text-gray-500">总习惯</div>
              </div>
              <div class="space-y-2">
                <div class="text-2xl font-bold text-green-500">{{ habitStore.completedToday }}</div>
                <div class="text-sm text-gray-500">已完成</div>
              </div>
              <div class="space-y-2">
                <div class="text-2xl font-bold text-orange-500">{{ habitStore.totalStreak }}</div>
                <div class="text-sm text-gray-500">总连续</div>
              </div>
            </div>
          </BaseCard>

          <!-- 今日微学习内容 -->
          <BaseCard title="今日微学习" class="cursor-pointer" @click="goToLearning">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 rounded-apple flex items-center justify-center overflow-hidden">
                <img 
                  :src="LearningIcon" 
                  alt="学习图标" 
                  class="w-16 h-16 object-contain rounded-apple"
                />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-gray-100">高效时间管理</h3>
                <p class="text-sm text-gray-500 mt-1">学习如何更好地管理时间，提高工作效率</p>
                <div class="flex items-center mt-2">
                  <span class="text-xs text-gray-400">5分钟</span>
                  <span class="text-xs text-gray-400 mx-2">•</span>
                  <span class="text-xs text-gray-400">未完成</span>
                </div>
              </div>
              <div class="text-primary-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 右侧：习惯列表 -->
        <div class="lg:col-span-7 space-y-4">

          <!-- 习惯列表标题 -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">我的习惯</h2>
            <div class="flex items-center space-x-3">
              <!-- 批量删除按钮 -->
              <button
                v-if="selectedHabits.length > 0"
                @click="showDeleteConfirm = true"
                class="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
              >
                删除 ({{ selectedHabits.length }})
              </button>
              <!-- 编辑模式切换按钮 -->
              <button
                @click="toggleEditMode"
                class="text-gray-500 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                {{ isEditMode ? '完成' : '编辑' }}
              </button>
              <!-- 添加习惯按钮 -->
              <router-link 
                to="/habit/create"
                class="text-primary-500 text-sm font-medium"
              >
                添加习惯
              </router-link>
            </div>
          </div>

          <!-- 习惯卡片列表 - 桌面端网格布局 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 min-h-0">
            <!-- 加载状态 -->
            <template v-if="habitStore.isLoading">
              <div v-for="i in 3" :key="`loading-${i}`" class="card-apple p-4 animate-pulse">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-apple"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </template>
            
            <!-- 习惯卡片 -->
            <template v-else>
              <HabitCard
                v-for="habit in habitStore.habits"
                :key="`habit-${habit.id}`"
                :habit="habit"
                :is-edit-mode="isEditMode"
                :is-selected="selectedHabits.includes(habit.id)"
                @click="handleHabitClick(habit.id)"
                @complete="handleHabitComplete"
                @select="handleHabitSelect"
                class="w-full"
              />
            </template>
          </div>

          <!-- 空状态 -->
          <div v-if="!habitStore.isLoading && habitStore.habits.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
                                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">还没有习惯</h3>
                      <p class="text-gray-500 dark:text-gray-400 mb-4">开始创建你的第一个习惯吧</p>
            <router-link to="/habit/create" class="btn-primary">
              创建习惯
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">确认删除</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            确定要删除选中的 {{ selectedHabits.length }} 个习惯吗？此操作无法撤销。
          </p>
          <div class="flex space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-apple hover:bg-red-600 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import HabitCard from '@/components/HabitCard.vue'
import LearningIcon from '@/assets/学习图标.svg'

// Store
const authStore = useAuthStore()
const habitStore = useHabitStore()
const router = useRouter()

// 编辑模式状态
const isEditMode = ref(false)
const selectedHabits = ref([])
const showDeleteConfirm = ref(false)

// 计算属性
const user = computed(() => authStore.user)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }
  return now.toLocaleDateString('zh-CN', options)
})

// 方法
const goToHabitDetail = (habitId) => {
  // 使用replace避免历史记录堆积，减少跳动
  router.push(`/habit/${habitId}`)
}

const goToLearning = () => {
  router.push('/learning')
}

const handleHabitComplete = (habitId) => {
  // 阻止事件冒泡，避免触发详情页面跳转
  console.log('习惯完成:', habitId)
}

// 编辑模式切换
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    selectedHabits.value = []
  }
}

// 处理习惯点击
const handleHabitClick = (habitId) => {
  if (isEditMode.value) {
    handleHabitSelect(habitId)
  } else {
    goToHabitDetail(habitId)
  }
}

// 处理习惯选择
const handleHabitSelect = (habitId) => {
  const index = selectedHabits.value.indexOf(habitId)
  if (index > -1) {
    selectedHabits.value.splice(index, 1)
  } else {
    selectedHabits.value.push(habitId)
  }
}

// 确认删除
const confirmDelete = async () => {
  try {
    const result = await habitStore.deleteHabits(selectedHabits.value)
    if (result.success) {
      selectedHabits.value = []
      isEditMode.value = false
      showDeleteConfirm.value = false
    }
  } catch (error) {
    console.error('删除习惯失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 检查认证状态
  authStore.checkAuth()
  
  // 获取习惯数据
  await habitStore.fetchHabits()
})
</script>

