import { ref } from 'vue'

export function useModal() {
  const showModal = ref(false)
  const modalConfig = ref({
    title: '提示',
    message: '',
    type: 'info',
    confirmText: '确定',
    cancelText: '取消'
  })

  const showConfirm = (config) => {
    return new Promise((resolve) => {
      modalConfig.value = {
        title: config.title || '确认操作',
        message: config.message,
        type: config.type || 'warning',
        confirmText: config.confirmText || '确定',
        cancelText: config.cancelText || '取消',
        onConfirm: () => {
          showModal.value = false
          resolve(true)
        },
        onCancel: () => {
          showModal.value = false
          resolve(false)
        }
      }
      showModal.value = true
    })
  }

  const showPrompt = (config) => {
    return new Promise((resolve) => {
      modalConfig.value = {
        title: config.title || '输入信息',
        message: config.message,
        placeholder: config.placeholder || '请输入...',
        defaultValue: config.defaultValue || '',
        type: config.type || 'info',
        confirmText: config.confirmText || '确定',
        cancelText: config.cancelText || '取消',
        onConfirm: (value) => {
          showModal.value = false
          resolve(value)
        },
        onCancel: () => {
          showModal.value = false
          resolve(null)
        }
      }
      showModal.value = true
    })
  }

  const closeModal = () => {
    showModal.value = false
  }

  return {
    showModal,
    modalConfig,
    showConfirm,
    showPrompt,
    closeModal
  }
}

// 全局弹窗方法，用于替换原生confirm和prompt
export const globalModal = {
  confirm: (message, title = '确认操作') => {
    return new Promise((resolve) => {
      // 这里可以集成全局弹窗组件
      const result = window.confirm(`${title}\n\n${message}`)
      resolve(result)
    })
  },
  
  prompt: (message, defaultValue = '', title = '输入信息') => {
    return new Promise((resolve) => {
      // 这里可以集成全局弹窗组件
      const result = window.prompt(`${title}\n\n${message}`, defaultValue)
      resolve(result)
    })
  }
}
