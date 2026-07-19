<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 left-4 lg:left-auto lg:right-4 lg:max-w-sm z-[9999] space-y-2 pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="space-y-2">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :type="toast.type"
          :message="toast.message"
          :description="toast.description"
          :duration="toast.duration"
          :closable="toast.closable"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px) translateX(16px) scale(0.98);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(16px) scale(0.98);
}

.toast-move {
  transition: transform 0.22s ease;
}
</style>
