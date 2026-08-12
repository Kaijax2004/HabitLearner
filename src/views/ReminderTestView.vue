<template>
  <AppLayout title="提醒功能测试" :show-back-button="true">
    <div class="p-4 lg:p-0">
      <div class="w-full space-y-8">
        
        <!-- 提醒系统状态 -->
        <BaseCard title="提醒系统状态">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-primary-500">{{ activeReminders.size }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">今日已提醒</div>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-orange-500">{{ reminderQueue.length }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">等待提醒</div>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold" :class="isReminderActive ? 'text-green-500' : 'text-gray-400'">
                {{ isReminderActive ? '活跃' : '空闲' }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">系统状态</div>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold" :class="userReminderSettings.habitReminders ? 'text-green-500' : 'text-red-500'">
                {{ userReminderSettings.habitReminders ? '开启' : '关闭' }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">用户设置</div>
            </div>
          </div>
        </BaseCard>

        <!-- 测试环境设置 -->
        <BaseCard title="测试环境设置">
          <div class="space-y-4">
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 class="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ 测试模式说明</h4>
              <p class="text-yellow-800 dark:text-yellow-200 text-sm">
                由于后端连接问题，可以使用测试模式来测试提醒功能。测试模式会创建模拟用户和习惯数据。
              </p>
            </div>
            
            <div class="flex gap-4">
              <button 
                @click="setupTestEnvironmentHandler"
                class="btn-primary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                设置测试环境
              </button>
              
              <button 
                @click="clearTestEnvironmentHandler"
                class="btn-secondary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清理测试环境
              </button>
              
              <button 
                @click="clearTestHabits"
                class="btn-secondary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                清理测试习惯
              </button>
            </div>
          </div>
        </BaseCard>

        <!-- 测试提醒 -->
        <BaseCard title="测试提醒功能">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                @click="testNotificationReminder"
                class="btn-primary flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7M4.828 17l2.586-2.586a2 2 0 012.828 0L12 17" />
                </svg>
                测试通知提醒
              </button>
              
              <button 
                @click="testCustomIconReminder"
                class="btn-primary flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                测试自定义图标
              </button>
              
              <button 
                @click="testPomodoroReminder"
                class="btn-primary flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                测试番茄钟提醒
              </button>
            </div>
            
            <div class="flex gap-4">
              <button 
                @click="clearTodayReminders"
                class="btn-secondary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清除今日提醒记录
              </button>
              
              <button 
                @click="checkReminders"
                class="btn-secondary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                立即检查提醒
              </button>
            </div>
            
            <!-- 音效测试 -->
            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">🔊 音效测试</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  @click="testSound('notification')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  🔔 通知音效
                </button>
                <button 
                  @click="testSound('success')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  ✅ 完成音效
                </button>
                <button 
                  @click="testSound('error')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  ❌ 错误音效
                </button>
                <button 
                  @click="testSound('snooze')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  ⏰ 稍后提醒
                </button>
                <button 
                  @click="testSound('dismiss')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  🚫 忽略音效
                </button>
                <button 
                  @click="testSound('focusStart')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  🎯 专注开始
                </button>
                <button 
                  @click="testSound('focusEnd')"
                  class="btn-secondary text-sm px-3 py-2"
                >
                  🏁 专注结束
                </button>
                <button 
                  @click="testAllSounds"
                  class="btn-primary text-sm px-3 py-2"
                >
                  🎼 测试全部
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 习惯列表 -->
        <BaseCard title="习惯列表">
          <div class="space-y-4">
            <div 
              v-for="habit in habitsWithReminders" 
              :key="habit.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  :style="{ backgroundColor: habit.color + '20' }"
                >
                  <img 
                    v-if="habit.icon && (habit.icon.startsWith('data:image') || habit.icon.startsWith('http'))" 
                    :src="habit.icon" 
                    alt="习惯图标" 
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <span v-else>{{ habit.icon || '📝' }}</span>
                </div>
                
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">{{ habit.name }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ habit.category }} • 
                    <span v-if="habit.reminderEnabled" class="text-green-600 dark:text-green-400">
                      提醒: {{ habit.reminderTime }}
                    </span>
                    <span v-else class="text-gray-400">无提醒</span>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  v-if="habit.reminderEnabled"
                  @click="triggerReminder(habit)"
                  class="btn-primary text-sm px-3 py-1"
                >
                  测试提醒
                </button>
                <button 
                  v-else
                  @click="enableReminder(habit)"
                  class="btn-secondary text-sm px-3 py-1"
                >
                  启用提醒
                </button>
              </div>
            </div>
            
            <div v-if="habitsWithReminders.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              没有找到启用了提醒的习惯
            </div>
          </div>
        </BaseCard>

        <!-- 提醒设置说明 -->
        <BaseCard title="提醒功能说明">
          <div class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">通知提醒</h4>
                <ul class="space-y-1">
                  <li>• 简洁的通知界面</li>
                  <li>• 支持完成、稍后提醒、忽略操作</li>
                  <li>• 浏览器原生通知支持</li>
                  <li>• 音效反馈</li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">番茄钟提醒</h4>
                <ul class="space-y-1">
                  <li>• 25分钟专注时间</li>
                  <li>• 5分钟休息时间</li>
                  <li>• 可视化进度环</li>
                  <li>• 粒子动画效果</li>
                </ul>
              </div>
            </div>
            
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">智能提醒选择</h4>
              <p class="text-blue-800 dark:text-blue-200">
                系统会根据习惯类型自动选择最适合的提醒方式：
                学习、阅读、工作类习惯使用番茄钟提醒，其他习惯使用通知提醒。
              </p>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useHabitStore } from '@/stores/habit'
import { useAuthStore } from '@/stores/auth'
import { useReminder } from '@/composables/useReminder'
import { useToast } from '@/composables/useToast'
import { setupTestEnvironment, clearTestEnvironment } from '@/utils/testUser'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

// Store
const habitStore = useHabitStore()
const authStore = useAuthStore()
const { 
  activeReminders, 
  reminderQueue, 
  isReminderActive,
  checkReminders,
  triggerReminder,
  clearTodayReminders
} = useReminder()
const { success, error } = useToast()

// 计算属性
const habitsWithReminders = computed(() => {
  return habitStore.habits.filter(habit => habit.reminderEnabled)
})

const userReminderSettings = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userNotificationSettingsKey = user.id ? `notificationSettings_${user.id}` : 'notificationSettings'
    const settings = localStorage.getItem(userNotificationSettingsKey)
    
    if (settings) {
      return JSON.parse(settings)
    }
  } catch (error) {
    console.log('获取用户提醒设置失败:', error)
  }
  
  // 默认设置
  return {
    habitReminders: true,
    pushNotifications: true,
    emailNotifications: false,
    learningReminders: true,
    weeklyReports: true,
    quietHours: false,
    quietStartTime: '22:00',
    quietEndTime: '08:00'
  }
})

// 方法
const testNotificationReminder = () => {
  const testHabit = {
    id: 'test-notification-' + Date.now(), // 使用时间戳确保唯一性
    name: '测试通知提醒',
    icon: '🔔',
    category: '测试',
    color: '#007AFF',
    reminderTime: '现在',
    reminderEnabled: true,
    isTestHabit: true // 标记为测试习惯
  }
  
  console.log('🧪 测试通知提醒:', testHabit)
  triggerReminder(testHabit)
  success('通知提醒已触发')
}

const testCustomIconReminder = () => {
  const testHabit = {
    id: 'test-custom-icon-' + Date.now(),
    name: '测试自定义图标提醒',
    icon: 'https://xgeeetivgxef.sealosbja.site/uploads/icons/user_39/icon-1757437659232-36252969.png', // 使用真实的图片URL
    category: '测试',
    color: '#10b981',
    reminderTime: '现在',
    reminderEnabled: true,
    isTestHabit: true
  }
  
  console.log('🧪 测试自定义图标提醒:', testHabit)
  triggerReminder(testHabit)
  success('自定义图标提醒已触发')
}

const testPomodoroReminder = () => {
  const testHabit = {
    id: 'test-pomodoro-' + Date.now(), // 使用时间戳确保唯一性
    name: '测试番茄钟提醒',
    icon: '🍅',
    category: '测试',
    color: '#10b981',
    reminderTime: '现在',
    reminderEnabled: true,
    isTestHabit: true // 标记为测试习惯
  }
  
  console.log('🧪 测试番茄钟提醒:', testHabit)
  triggerReminder(testHabit)
  success('番茄钟提醒已触发')
}

const setupTestEnvironmentHandler = () => {
  try {
    const { user, token, habits } = setupTestEnvironment()
    
    // 更新认证状态
    authStore.testLogin()
    
    // 刷新习惯数据
    habitStore.fetchHabits()
    
    success('测试环境设置成功！', {
      description: `已创建测试用户 ${user.username} 和 ${habits.length} 个测试习惯`
    })
  } catch (error) {
    error('设置测试环境失败', {
      description: error.message
    })
  }
}

const clearTestEnvironmentHandler = () => {
  try {
    clearTestEnvironment()
    
    // 清除认证状态
    authStore.logout()
    
    // 清除习惯数据
    habitStore.habits = []
    
    success('测试环境已清理')
  } catch (error) {
    error('清理测试环境失败', {
      description: error.message
    })
  }
}

const testSound = async (soundType) => {
  try {
    const audioManager = (await import('@/utils/audioManager.js')).default
    
    switch (soundType) {
      case 'notification':
        audioManager.playNotificationSound()
        break
      case 'success':
        audioManager.playSuccessSound()
        break
      case 'error':
        audioManager.playErrorSound()
        break
      case 'snooze':
        audioManager.playSnoozeSound()
        break
      case 'dismiss':
        audioManager.playDismissSound()
        break
      case 'focusStart':
        audioManager.playFocusStartSound()
        break
      case 'focusEnd':
        audioManager.playFocusEndSound()
        break
      default:
        console.log('未知音效类型:', soundType)
    }
    
    console.log(`🔊 测试音效: ${soundType}`)
  } catch (error) {
    console.error('音效测试失败:', error)
    error('音效测试失败', {
      description: error.message
    })
  }
}

const testAllSounds = async () => {
  try {
    const audioManager = (await import('@/utils/audioManager.js')).default
    audioManager.testAllSounds()
    success('开始测试所有音效', {
      description: '请听音效序列，每个音效间隔1秒'
    })
  } catch (error) {
    console.error('音效测试失败:', error)
    error('音效测试失败', {
      description: error.message
    })
  }
}

const clearTestHabits = () => {
  try {
    // 找到所有测试习惯
    const testHabits = habitStore.habits.filter(habit => habit.isTestHabit)
    
    if (testHabits.length === 0) {
      success('没有找到测试习惯')
      return
    }
    
    // 从习惯列表中移除测试习惯
    habitStore.habits = habitStore.habits.filter(habit => !habit.isTestHabit)
    
    // 清除localStorage中的测试习惯
    localStorage.removeItem('testHabits')
    
    success(`已清理 ${testHabits.length} 个测试习惯`, {
      description: '测试习惯已从本地数据中移除'
    })
    
    console.log('🧹 清理的测试习惯:', testHabits.map(h => h.name))
  } catch (error) {
    error('清理测试习惯失败', {
      description: error.message
    })
  }
}

const enableReminder = (habit) => {
  // 这里可以跳转到习惯编辑页面
  success('请到习惯编辑页面启用提醒功能')
}
</script>
