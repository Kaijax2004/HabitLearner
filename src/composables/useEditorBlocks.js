import { computed, ref } from 'vue'

export function useEditorBlocks(blocks) {
  const selectedIds = ref(new Set())
  const activeId = ref(null)

  const selectedCount = computed(() => selectedIds.value.size)

  const select = (id, additive = false) => {
    const next = additive ? new Set(selectedIds.value) : new Set()
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  const clearSelection = () => {
    selectedIds.value = new Set()
  }

  const removeLocal = (ids) => {
    const idSet = new Set(ids)
    blocks.value = blocks.value.filter((block) => !idSet.has(block.id))
    selectedIds.value = new Set()
    if (activeId.value && idSet.has(activeId.value)) activeId.value = blocks.value[0]?.id || null
  }

  const moveLocal = (fromIndex, toIndex) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= blocks.value.length || toIndex >= blocks.value.length) return
    const next = [...blocks.value]
    const [block] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, block)
    blocks.value = next.map((item, index) => ({ ...item, order: index + 1, position: index + 1 }))
  }

  return {
    selectedIds,
    selectedCount,
    activeId,
    select,
    clearSelection,
    removeLocal,
    moveLocal
  }
}
