<template>
  <Modal
    :show="show"
    :title="title"
    :type="type"
    :closable="closable"
    :close-on-backdrop="closeOnBackdrop"
    @update:show="$emit('update:show', $event)"
    @confirm="() => {}"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #default>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">{{ message }}</p>
        <div>
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            @keydown.enter="handleConfirm"
            @keydown.escape="handleCancel"
          />
        </div>
      </div>
    </template>
    
    <template #footer>
      <button 
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
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '输入信息'
  },
  message: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '请输入...'
  },
  defaultValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'close'])

const inputRef = ref(null)
const inputValue = ref(props.defaultValue)

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

// 监听show变化，重置输入值
watch(() => props.show, (newShow) => {
  if (newShow) {
    inputValue.value = props.defaultValue
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleConfirm = () => {
  emit('confirm', inputValue.value)
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}
</script>
