import { ref, computed } from 'vue'

export function useHistory(maxHistorySize = 50) {
  const history = ref([])
  const currentIndex = ref(-1)
  const isUndoRedoOperation = ref(false)

  // 当前状态
  const currentState = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length) {
      return history.value[currentIndex.value]
    }
    return null
  })

  // 是否可以撤销
  const canUndo = computed(() => currentIndex.value > 0)

  // 是否可以重做
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  // 保存状态到历史记录
  const saveState = (state) => {
    // 如果正在进行撤销/重做操作，不保存新状态
    if (isUndoRedoOperation.value) {
      return
    }

    // 移除当前位置之后的所有历史记录
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // 添加新状态
    const newState = JSON.parse(JSON.stringify(state)) // 深拷贝
    history.value.push(newState)
    currentIndex.value = history.value.length - 1

    // 限制历史记录大小
    if (history.value.length > maxHistorySize) {
      history.value.shift()
      currentIndex.value--
    }
  }

  // 撤销操作
  const undo = () => {
    if (canUndo.value) {
      isUndoRedoOperation.value = true
      currentIndex.value--
      const state = history.value[currentIndex.value]
      isUndoRedoOperation.value = false
      return JSON.parse(JSON.stringify(state)) // 返回深拷贝
    }
    return null
  }

  // 重做操作
  const redo = () => {
    if (canRedo.value) {
      isUndoRedoOperation.value = true
      currentIndex.value++
      const state = history.value[currentIndex.value]
      isUndoRedoOperation.value = false
      return JSON.parse(JSON.stringify(state)) // 返回深拷贝
    }
    return null
  }

  // 清空历史记录
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
  }

  // 初始化历史记录
  const initializeHistory = (initialState) => {
    clearHistory()
    saveState(initialState)
  }

  return {
    currentState,
    canUndo,
    canRedo,
    saveState,
    undo,
    redo,
    clearHistory,
    initializeHistory,
    historySize: computed(() => history.value.length)
  }
}
