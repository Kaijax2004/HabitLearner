<template>
  <Modal
    :show="show"
    :title="title"
    :type="type"
    :closable="closable"
    :close-on-backdrop="closeOnBackdrop"
    @update:show="$emit('update:show', $event)"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #default>
      <p class="text-gray-600 dark:text-gray-300">{{ message }}</p>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'warning',
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

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('close')
}
</script>
