<template>
  <BaseCard class="relative overflow-hidden" :hover="false" :class="{ 'ring-2 ring-primary-500': isEditMode && isSelected }">
    <!-- 选择框 -->
    <div v-if="isEditMode" class="absolute top-3 left-3 z-10">
      <div 
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200"
        :class="isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'"
        @click.stop="handleSelect"
      >
        <svg v-if="isSelected" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- 习惯信息 -->
    <div class="flex items-center justify-between" :class="{ 'pl-10': isEditMode }">
      <div class="flex items-center space-x-3 flex-1 cursor-pointer" @click.stop="handleCardClick">
        <!-- 习惯图标 -->
        <div 
          class="w-12 h-12 rounded-apple flex items-center justify-center text-2xl flex-shrink-0"
          :style="{ backgroundColor: habit.color + '20' }"
        >
          {{ habit.icon }}
        </div>
        
        <!-- 习惯详情 -->
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ habit.name }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ habit.category }}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs text-gray-400 dark:text-gray-500">连续</span>
            <span class="text-sm font-medium text-primary-500">{{ habit.streak }}天</span>
            <!-- 今日打卡进度 -->
            <div v-if="todayProgress" class="flex items-center space-x-1">
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ habit.frequency === 'daily' ? '今日' : '本周' }}</span>
              <span class="text-sm font-medium" :class="isCompleted ? 'text-success-500' : 'text-orange-500'">
                <template v-if="habit.frequency === 'daily'">
                  {{ todayProgress.count }}/{{ habit.target }}次
                </template>
                <template v-else>
                  {{ isCompleted ? '已完成' : '未打卡' }} ({{ weeklyProgress }}/{{ habit.target }})
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 打卡按钮 -->
      <button
        v-if="!isEditMode"
        @click.stop="handleCheckIn"
        :disabled="isLoading"
        class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-3"
        :class="[
          isCompleted 
            ? 'bg-success-500 text-white shadow-apple-glow' 
            : 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-apple-glow active:scale-95'
        ]"
      >
        <svg 
          v-if="isCompleted" 
          class="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg 
          v-else-if="isLoading"
          class="w-6 h-6 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg 
          v-else
          class="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
    
    <!-- 进度条 -->
    <div class="mt-4">
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>今日进度</span>
        <span>{{ isCompleted ? '已完成' : '未完成' }}</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-500 ease-out"
          :class="isCompleted ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'"
          :style="{ width: isCompleted ? '100%' : '0%' }"
        ></div>
      </div>
    </div>
    
    <!-- 完成动画 -->
    <transition name="complete">
      <div 
        v-if="showCompleteAnimation"
        class="absolute inset-0 bg-success-500 bg-opacity-20 flex items-center justify-center"
      >
        <div class="text-success-500 text-4xl animate-bounce-gentle">
          ✓
        </div>
      </div>
    </transition>

    <!-- 打卡留言弹窗 -->
    <Teleport to="body">
      <div v-if="showCommentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click.self="closeCommentModal">
        <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-md w-full shadow-2xl">
          <div class="text-center mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">打卡留言</h3>
              <button
                @click="closeCommentModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              今日首次打卡，记录一下感受吧
            </p>
          </div>
          
          <div class="space-y-4">
            <!-- 标题输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">标题</label>
              <input
                v-model="commentTitle"
                type="text"
                placeholder="给今天的打卡起个标题..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <!-- 正文输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">正文</label>
              <textarea
                v-model="commentText"
                placeholder="记录一下今天的感受、收获或想法..."
                class="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button
              @click="handleCompleteWithComment"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-apple hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? '打卡中...' : '打卡' }}
            </button>
            <button
              @click="handleCompleteWithoutComment"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
import { ref, computed } from 'vue'
import { useHabitStore } from '@/stores/habit'
import BaseCard from './BaseCard.vue'

// Props
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

// Store
const habitStore = useHabitStore()

// Emits
const emit = defineEmits(['click', 'complete', 'select'])

// 响应式数据
const isLoading = ref(false)
const showCompleteAnimation = ref(false)
const showCommentModal = ref(false)
const commentText = ref('')
const commentTitle = ref('')
const isProcessing = ref(false) // 防止重复处理

// 计算属性
const todayProgress = computed(() => {
  if (!props.habit.checkIns) return null
  
  const today = new Date().toDateString()
  return props.habit.checkIns.find(checkIn => checkIn.date === today) || null
})

const isCompleted = computed(() => {
  if (!todayProgress.value) return false
  
  if (props.habit.frequency === 'daily') {
    return todayProgress.value.count >= props.habit.target
  } else {
    // 每周习惯：今日有打卡就算完成
    return todayProgress.value.count > 0
  }
})

const weeklyProgress = computed(() => {
  if (props.habit.frequency === 'daily') return 0
  return habitStore.getWeeklyProgress(props.habit)
})

// 方法
const handleCardClick = () => {
  // 触发父组件的点击事件，跳转到详情页
  emit('click')
}

const handleSelect = () => {
  // 触发选择事件
  emit('select', props.habit.id)
}


// 关闭留言弹窗
const closeCommentModal = () => {
  showCommentModal.value = false
  commentText.value = ''
  commentTitle.value = ''
  isProcessing.value = false
}

// 处理打卡点击
const handleCheckIn = () => {
  // 防止重复处理
  if (isProcessing.value || showCommentModal.value) {
    return
  }
  
  const isFirstCheckIn = !todayProgress.value
  
  // 只有在启用留言且首次打卡时才显示留言弹窗
  if (props.habit.enableComments && isFirstCheckIn) {
    isProcessing.value = true
    showCommentModal.value = true
  } else {
    // 直接打卡，不显示留言弹窗
    handleCompleteWithoutComment()
  }
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
      // 先关闭弹窗并清空留言
      closeCommentModal()
      
      // 显示完成动画
      showCompleteAnimation.value = true
      setTimeout(() => {
        showCompleteAnimation.value = false
      }, 1500)
      
      // 触发完成事件
      emit('complete', props.habit.id)
    } else {
      // 处理错误
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
    const result = await habitStore.completeHabit(props.habit.id, '')
    
    if (result.success) {
      // 关闭弹窗并重置状态
      closeCommentModal()
      
      // 显示完成动画
      showCompleteAnimation.value = true
      setTimeout(() => {
        showCompleteAnimation.value = false
      }, 1500)
      
      // 触发完成事件
      emit('complete', props.habit.id)
    } else {
      // 处理错误
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
