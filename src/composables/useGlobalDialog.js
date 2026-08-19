import { ref } from 'vue'

const dialogState = ref({
  show: false,
  mode: 'alert',
  title: '提示',
  message: '',
  type: 'info',
  confirmText: '确定',
  cancelText: '取消',
  resolver: null
})

const openDialog = (config = {}) => new Promise((resolve) => {
  dialogState.value = {
    show: true,
    mode: config.mode || 'alert',
    title: config.title || '提示',
    message: config.message || '',
    type: config.type || 'info',
    confirmText: config.confirmText || '确定',
    cancelText: config.cancelText || '取消',
    resolver: resolve
  }
})

export const closeGlobalDialog = (result = false) => {
  const resolver = dialogState.value.resolver
  dialogState.value = {
    ...dialogState.value,
    show: false,
    resolver: null
  }
  if (resolver) resolver(result)
}

export const confirmDialog = (messageOrConfig, title = '确认操作') => {
  const config = typeof messageOrConfig === 'string'
    ? { message: messageOrConfig, title }
    : (messageOrConfig || {})

  return openDialog({
    ...config,
    mode: 'confirm',
    type: config.type || 'warning',
    title: config.title || title,
    confirmText: config.confirmText || '确认',
    cancelText: config.cancelText || '取消'
  })
}

export const alertDialog = (messageOrConfig, title = '提示') => {
  const config = typeof messageOrConfig === 'string'
    ? { message: messageOrConfig, title }
    : (messageOrConfig || {})

  return openDialog({
    ...config,
    mode: 'alert',
    type: config.type || 'info',
    title: config.title || title,
    confirmText: config.confirmText || '知道了'
  })
}

export const useGlobalDialog = () => ({ dialogState, confirmDialog, alertDialog, closeGlobalDialog })
