<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <router-view v-slot="{ Component, route }">
      <Suspense>
        <template #default>
          <transition
            :name="getTransitionName(route)"
            mode="out-in"
            appear
          >
            <KeepAlive :include="cachedRoutes">
              <component :is="Component" :key="route.path" />
            </KeepAlive>
          </transition>
        </template>
        <template #fallback>
          <PageSkeleton />
        </template>
      </Suspense>
    </router-view>
    
    <!-- Toast容器 -->
    <ToastContainer />
    
    <!-- 引导动画 -->
    <OnboardingAnimation 
      :show="showOnboarding" 
      @completed="handleOnboardingComplete" 
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import { useReminder } from '@/composables/useReminder'
import PageSkeleton from '@/components/PageSkeleton.vue'
import OnboardingAnimation from '@/components/OnboardingAnimation.vue'
import { getIsNewUser, hasCompletedOnboarding, markOnboardingComplete } from '@/api/index.js'

const route = useRoute()
const authStore = useAuthStore()
const { startReminderCheck, stopReminderCheck } = useReminder()

// 需要缓存的页面（避免回退时白屏闪烁）
const cachedRoutes = ref(['Dashboard', 'HabitDetail'])
const showOnboarding = ref(false)

// 检查并处理引导动画显示的函数
const checkAndShowOnboarding = () => {
  const isNew = getIsNewUser()
  const hasCompleted = hasCompletedOnboarding()
  console.log('检查引导状态: 新用户=', isNew, '已完成引导=', hasCompleted)
  
  // 仅当用户是新用户且未完成引导时显示引导动画
  if (isNew && !hasCompleted) {
    console.log('显示引导动画')
    // 延迟显示，确保页面加载完成
    setTimeout(() => {
      showOnboarding.value = true
    }, 1000)
  } else {
    console.log('跳过引导动画: ', isNew ? '已完成引导' : '非新用户')
  }
}

// 处理引导完成事件
const handleOnboardingComplete = () => {
  showOnboarding.value = false
  console.log('引导动画已完成，标记状态')
  // 引导完成后标记状态，确保不会再次显示
  markOnboardingComplete()
}

// 根据路由确定过渡动画
const getTransitionName = (route) => {
  const routeNames = ['Dashboard', 'HabitDetail', 'HabitCreate', 'HabitEdit', 'LearningContent', 'Profile']
  
  if (routeNames.includes(route.name)) {
    return 'slide-left'
  }
  
  return 'fade'
}

// 生命周期
onMounted(() => {
  console.log('🚀 App.vue 已挂载，检查用户状态:', authStore.isAuthenticated)
  
  // 检查认证状态
  authStore.checkAuth()
  
  // 如果仍然未登录，尝试测试模式
  if (!authStore.isAuthenticated) {
    console.log('🧪 尝试测试模式登录...')
    const testLoginSuccess = authStore.testLogin()
    if (testLoginSuccess) {
      console.log('✅ 测试模式登录成功，启动提醒检查')
      startReminderCheck()
      // 使用新的检查函数处理引导动画
      checkAndShowOnboarding()
    } else {
      console.log('❌ 用户未登录，等待登录后启动提醒检查')
    }
  } else {
    console.log('✅ 用户已登录，启动提醒检查')
    startReminderCheck()
    // 使用新的检查函数处理引导动画
    checkAndShowOnboarding()
  }
})

onUnmounted(() => {
  console.log('🛑 App.vue 即将卸载，停止提醒检查')
  // 停止提醒检查
  stopReminderCheck()
})
</script>

<style scoped>
/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
