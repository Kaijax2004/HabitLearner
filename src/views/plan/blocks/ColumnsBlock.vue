<template>
  <BaseCard>
    <div class="flex items-center gap-2 mb-2 text-xs text-gray-500">
      多列布局
      <select v-model="model.cols" class="bg-transparent border rounded px-2 py-1 text-xs w-24">
        <option :value="2">2 列</option>
        <option :value="3">3 列</option>
      </select>
    </div>
    <div :class="gridClass" class="gap-3">
      <div v-for="(col, idx) in columns" :key="idx" class="rounded border border-gray-200 dark:border-gray-700 p-2 space-y-2">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>第 {{ idx+1 }} 列</span>
          <button class="px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="addItem(idx)">+ 添加文本项</button>
        </div>
        <div v-for="(item, j) in columns[idx]" :key="j" class="flex items-start gap-2">
          <textarea v-model="columns[idx][j]" class="w-full bg-transparent outline-none resize-none dark:text-white text-sm" rows="2" placeholder="文本项..." />
          <button class="px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="removeItem(idx, j)">删除</button>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({ cols: 2, columns: ['', ''] }) } })
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const columns = computed({
  get: () => {
    const cols = model.value.cols || 2
    let arr = model.value.columns || Array.from({ length: cols }, () => [])
    // 规整列数
    if (arr.length !== cols) {
      arr = Array.from({ length: cols }, (v,i) => arr[i] || [])
    }
    return arr
  },
  set: (v) => model.value.columns = v
})

const addItem = (idx) => {
  const arr = [...columns.value]
  arr[idx] = [...arr[idx], '']
  columns.value = arr
}
const removeItem = (ci, ii) => {
  const arr = [...columns.value]
  arr[ci] = arr[ci].filter((_,j)=>j!==ii)
  columns.value = arr
}

const gridClass = computed(() => (model.value.cols||2)===3 ? 'grid grid-cols-1 md:grid-cols-3' : 'grid grid-cols-1 md:grid-cols-2')
</script>

<style scoped>
</style>


