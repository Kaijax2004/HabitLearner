<template>
  <div class="page-transition" :class="{ 'animate-page-enter': isVisible }">
    <slot />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  // 页面加载完成后触发进入动画
  setTimeout(() => {
    isVisible.value = true
  }, 50)
})
</script>

<style scoped>
.page-transition {
  animation: pageEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
