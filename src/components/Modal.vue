<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- 弹窗内容 -->
        <div 
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          @click.stop
        >
          <!-- 头部 -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h3>
              <button 
                v-if="closable"
                @click="close"
                class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="px-6 py-4">
            <slot>
              <p class="text-gray-600 dark:text-gray-300">{{ message }}</p>
            </slot>
          </div>

          <!-- 底部按钮 -->
          <div v-if="showFooter" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-end gap-3">
              <slot name="footer">
                <button 
                  v-if="showCancel"
                  @click="handleCancel"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {{ cancelText }}
                </button>
                <button 
                  @click="handleConfirm"
                  :class="[
                    'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                    confirmButtonClass
                  ]"
                >
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'close'])

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 hover:bg-green-600'
    case 'warning':
      return 'bg-yellow-500 hover:bg-yellow-600'
    case 'error':
      return 'bg-red-500 hover:bg-red-600'
    default:
      return 'bg-blue-500 hover:bg-blue-600'
  }
})

const close = () => {
  emit('update:show', false)
  emit('close')
}

const handleConfirm = (...args) => {
  emit('confirm', ...args)
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white,
.modal-enter-from .dark\\:bg-gray-800,
.modal-leave-to .dark\\:bg-gray-800 {
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-to .bg-white,
.modal-leave-to .bg-white,
.modal-enter-to .dark\\:bg-gray-800,
.modal-leave-to .dark\\:bg-gray-800 {
  transform: scale(1) translateY(0);
}
</style>
