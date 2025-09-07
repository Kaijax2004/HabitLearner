<template>
      <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="getTransitionName(route)"
        mode="out-in"
        appear
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 根据路由确定过渡动画
const getTransitionName = (route) => {
  const routeNames = ['Dashboard', 'HabitDetail', 'HabitCreate', 'HabitEdit', 'LearningContent', 'Profile']
  
  if (routeNames.includes(route.name)) {
    return 'slide-left'
  }
  
  return 'fade'
}
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
