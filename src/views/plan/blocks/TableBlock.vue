<template>
  <div ref="rootRef" class="relative group table-block">
    <div
      v-if="showToolbar"
      class="absolute -top-12 left-0 z-30 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <button class="toolbar-btn" title="添加列" @click="addColumn">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
        </svg>
      </button>
      <button class="toolbar-btn" title="添加行" @click="addRow">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
        </svg>
      </button>
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
      <button class="toolbar-btn" title="删除最后一列" @click="deleteColumn">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7H5m5 4v6m4-6v6M9 7V4h6v3" />
        </svg>
      </button>
      <button class="toolbar-btn" title="删除最后一行" @click="deleteRow">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7H5m5 4v6m4-6v6M9 7V4h6v3" />
        </svg>
      </button>
    </div>

    <div
      class="group min-h-[2rem] cursor-text overflow-x-auto rounded-md px-3 py-2 transition-all duration-200"
      :class="{
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 shadow-sm dark:bg-gray-800/50': isFocused
      }"
      @click="focusTable"
    >
      <table class="min-w-[360px] w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr>
            <th
              v-for="(header, colIndex) in model.headers"
              :key="`header-${colIndex}`"
              class="border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <input
                :value="header"
                class="w-full bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
                @focus="onFocus"
                @blur="onBlur"
                @input="(event) => updateHeader(colIndex, event.target.value)"
                @keydown="(event) => onKeydown(event, 0, colIndex, true)"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
            <td
              v-for="(cell, colIndex) in row"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="border border-gray-300 px-2 py-1 dark:border-gray-600"
            >
              <input
                :value="cell"
                class="w-full bg-transparent text-sm text-gray-900 outline-none dark:text-gray-100"
                @focus="onFocus"
                @blur="onBlur"
                @input="(event) => updateCell(rowIndex, colIndex, event.target.value)"
                @keydown="(event) => onKeydown(event, rowIndex, colIndex, false)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!rows.length" class="py-4 text-center text-gray-500 dark:text-gray-400">
        点击上方按钮添加表格内容
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      headers: ['列 1', '列 2'],
      rows: [['', '']]
    })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'delete-block'])

const isFocused = ref(false)
const showToolbar = ref(false)
const rootRef = ref(null)

const model = computed(() => props.modelValue || { headers: ['列 1', '列 2'], rows: [['', '']] })
const headers = computed(() => Array.isArray(model.value.headers) ? model.value.headers : [])
const rows = computed(() => Array.isArray(model.value.rows) ? model.value.rows : [])

const updateModel = (nextHeaders, nextRows) => {
  emit('update:modelValue', {
    headers: nextHeaders,
    rows: nextRows
  })
}

const updateHeader = (colIndex, value) => {
  const nextHeaders = [...headers.value]
  nextHeaders[colIndex] = value
  updateModel(nextHeaders, rows.value.map((row) => [...row]))
}

const updateCell = (rowIndex, colIndex, value) => {
  const nextRows = rows.value.map((row) => [...row])
  nextRows[rowIndex][colIndex] = value
  updateModel([...headers.value], nextRows)
}

const focusTable = () => {
  rootRef.value?.querySelector('input')?.focus()
}

const onFocus = () => {
  isFocused.value = true
  showToolbar.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  window.setTimeout(() => {
    showToolbar.value = false
  }, 150)
  emit('blur')
}

const addColumn = () => {
  updateModel(
    [...headers.value, `列 ${headers.value.length + 1}`],
    rows.value.map((row) => [...row, ''])
  )
}

const addRow = () => {
  updateModel(
    [...headers.value],
    [...rows.value.map((row) => [...row]), new Array(headers.value.length).fill('')]
  )
  nextTick(() => {
    const inputs = rootRef.value?.querySelectorAll('tbody input') || []
    inputs[inputs.length - headers.value.length]?.focus()
  })
}

const deleteColumn = () => {
  if (headers.value.length <= 1) return
  updateModel(
    headers.value.slice(0, -1),
    rows.value.map((row) => row.slice(0, -1))
  )
}

const deleteRow = () => {
  if (rows.value.length <= 1) return
  updateModel([...headers.value], rows.value.slice(0, -1))
}

const moveFocus = (index) => {
  rootRef.value?.querySelectorAll('input')[index]?.focus()
}

const onKeydown = (event, rowIndex, colIndex, isHeader) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    const inputs = Array.from(rootRef.value?.querySelectorAll('input') || [])
    const currentIndex = inputs.indexOf(event.target)
    if (currentIndex === -1) return
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + inputs.length) % inputs.length
      : (currentIndex + 1) % inputs.length
    moveFocus(nextIndex)
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!isHeader && rowIndex === rows.value.length - 1) {
      addRow()
      return
    }
    const inputs = Array.from(rootRef.value?.querySelectorAll('input') || [])
    const currentIndex = inputs.indexOf(event.target)
    if (currentIndex !== -1) moveFocus(Math.min(currentIndex + headers.value.length, inputs.length - 1))
  }
}
</script>

<style scoped>
.toolbar-btn {
  @apply flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700;
}
</style>
