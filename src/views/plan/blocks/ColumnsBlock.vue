<template>
  <BaseCard>
    <div class="mb-2 flex items-center gap-2 text-xs text-gray-500">
      <span>多列布局</span>
      <select :value="model.cols" class="w-24 rounded border bg-transparent px-2 py-1 text-xs" @change="setCols(Number($event.target.value) || 2)">
        <option :value="2">2 列</option>
        <option :value="3">3 列</option>
      </select>
    </div>

    <div :class="gridClass" class="gap-3">
      <div v-for="(column, idx) in model.columns" :key="idx" class="space-y-2 rounded border border-gray-200 p-2 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>第 {{ idx + 1 }} 列</span>
          <button class="rounded px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800" type="button" @click="addItem(idx)">+ 添加文本项</button>
        </div>

        <div v-for="(item, itemIndex) in column" :key="itemIndex" class="flex items-start gap-2">
          <textarea
            :value="item"
            class="w-full resize-none bg-transparent text-sm outline-none dark:text-white"
            rows="2"
            placeholder="文本项..."
            @input="updateItem(idx, itemIndex, $event.target.value)"
          />
          <button class="rounded px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800" type="button" @click="removeItem(idx, itemIndex)">删除</button>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ cols: 2, columns: [[], []] })
  }
})

const emit = defineEmits(['update:modelValue'])

const normalizeColumn = (column = []) => {
  if (Array.isArray(column)) return column.map((item) => String(item ?? ''))
  if (typeof column === 'string' && column.trim()) return [column]
  return []
}

const normalizeModel = (value = {}) => {
  const cols = Number(value.cols || 2)
  const columns = Array.isArray(value.columns)
    ? value.columns.slice(0, cols).map((column) => normalizeColumn(column))
    : []

  while (columns.length < cols) columns.push([])

  return {
    ...value,
    cols,
    columns
  }
}

const model = computed(() => normalizeModel(props.modelValue))

const commit = (next) => {
  emit('update:modelValue', normalizeModel(next))
}

const setCols = (cols) => {
  const nextCols = Math.min(Math.max(Number(cols) || 2, 2), 3)
  const nextColumns = model.value.columns.slice(0, nextCols)
  while (nextColumns.length < nextCols) nextColumns.push([])
  commit({ ...model.value, cols: nextCols, columns: nextColumns })
}

const updateItem = (columnIndex, itemIndex, value) => {
  const nextColumns = model.value.columns.map((column, idx) => {
    if (idx !== columnIndex) return [...column]
    const nextColumn = [...column]
    nextColumn[itemIndex] = String(value ?? '')
    return nextColumn
  })
  commit({ ...model.value, columns: nextColumns })
}

const addItem = (columnIndex) => {
  const nextColumns = model.value.columns.map((column, idx) => (
    idx === columnIndex ? [...column, ''] : [...column]
  ))
  commit({ ...model.value, columns: nextColumns })
}

const removeItem = (columnIndex, itemIndex) => {
  const nextColumns = model.value.columns.map((column, idx) => {
    if (idx !== columnIndex) return [...column]
    return column.filter((_, index) => index !== itemIndex)
  })
  commit({ ...model.value, columns: nextColumns })
}

const gridClass = computed(() => (model.value.cols === 3 ? 'grid grid-cols-1 md:grid-cols-3' : 'grid grid-cols-1 md:grid-cols-2'))
</script>

<style scoped>
</style>
