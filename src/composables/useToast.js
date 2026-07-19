import { ref, reactive } from 'vue'

// 全局Toast状态管理
const toasts = ref([])
let toastId = 0

// Toast方法
export const useToast = () => {
  const addToast = (options) => {
    const id = ++toastId
    const toast = reactive({
      id,
      type: options.type || 'info',
      message: options.message,
      description: options.description || '',
      duration: options.duration || 4000,
      closable: options.closable !== false,
      visible: true,
      ...options
    })
    
    toasts.value.push(toast)
    
    // 自动关闭
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return {
      id,
      close: () => removeToast(id)
    }
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value[index].visible = false
      // 延迟移除，等待动画完成
      setTimeout(() => {
        toasts.value.splice(index, 1)
      }, 300)
    }
  }
  
  const success = (message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    })
  }
  
  const error = (message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      ...options
    })
  }
  
  const warning = (message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    })
  }
  
  const info = (message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    })
  }
  
  const show = (message, type = 'info', options = {}) => {
    return addToast({
      type,
      message,
      ...options
    })
  }
  
  const clear = () => {
    toasts.value.forEach(toast => {
      toast.visible = false
    })
    setTimeout(() => {
      toasts.value = []
    }, 300)
  }
  
  return {
    toasts,
    success,
    error,
    warning,
    info,
    show,
    clear,
    removeToast
  }
}

// 全局Toast实例
export const toast = {
  success: (message, options = {}) => {
    const { success } = useToast()
    return success(message, options)
  },
  error: (message, options = {}) => {
    const { error } = useToast()
    return error(message, options)
  },
  warning: (message, options = {}) => {
    const { warning } = useToast()
    return warning(message, options)
  },
  info: (message, options = {}) => {
    const { info } = useToast()
    return info(message, options)
  },
  show: (message, type = 'info', options = {}) => {
    const { show } = useToast()
    return show(message, type, options)
  },
  clear: () => {
    const { clear } = useToast()
    return clear()
  }
}
