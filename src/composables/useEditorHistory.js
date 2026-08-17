import { computed, ref } from 'vue'

const clone = (value) => JSON.parse(JSON.stringify(value))

export function useEditorHistory(maxSize = 100) {
  const entries = ref([])
  const index = ref(-1)
  const isApplying = ref(false)

  const canUndo = computed(() => index.value > 0)
  const canRedo = computed(() => index.value >= 0 && index.value < entries.value.length - 1)

  const reset = (initialState) => {
    entries.value = initialState === undefined ? [] : [clone(initialState)]
    index.value = initialState === undefined ? -1 : 0
  }

  const record = (state) => {
    if (isApplying.value) return
    const next = entries.value.slice(0, index.value + 1)
    next.push(clone(state))
    entries.value = next.slice(-maxSize)
    index.value = entries.value.length - 1
  }

  const undo = () => {
    if (!canUndo.value) return null
    isApplying.value = true
    index.value -= 1
    const result = clone(entries.value[index.value])
    isApplying.value = false
    return result
  }

  const redo = () => {
    if (!canRedo.value) return null
    isApplying.value = true
    index.value += 1
    const result = clone(entries.value[index.value])
    isApplying.value = false
    return result
  }

  return {
    entries,
    canUndo,
    canRedo,
    reset,
    record,
    undo,
    redo
  }
}
