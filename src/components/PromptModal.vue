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
            class="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/15 dark:focus:ring-white/15 focus:border-zinc-500 transition-colors"
            @keydown.enter="handleConfirm"
            @keydown.escape="handleCancel"
          />
        </div>
      </div>
    </template>
    
    <template #footer>
      <button 
        @click="handleCancel"
        class="btn-secondary px-4 py-2 text-sm"
      >
        {{ cancelText }}
      </button>
      <button 
        @click="handleConfirm"
        :class="[
          'btn-primary px-4 py-2 text-sm',
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
      return 'bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
    case 'warning':
      return 'bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-200 dark:hover:bg-zinc-100 dark:text-zinc-950'
    case 'error':
      return 'bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
    default:
      return 'bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
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
