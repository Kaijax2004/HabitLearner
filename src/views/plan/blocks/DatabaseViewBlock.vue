<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="flex flex-wrap items-center gap-2">
      <input :value="model.title" class="min-w-40 flex-1 rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="数据库标题" @input="(event) => patch({ title: event.target.value })" />
      <select v-model="viewModel" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white">
        <option value="table">表格视图</option>
        <option value="board">看板视图</option>
        <option value="gallery">画廊视图</option>
        <option value="list">列表视图</option>
        <option value="calendar">日历视图</option>
        <option value="timeline">时间轴视图</option>
      </select>
      <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950" @click="addRow">添加条目</button>
    </div>

    <div class="mt-4 space-y-4">
      <div v-if="viewModel === 'table'" class="overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="border-b border-zinc-200 p-2 text-left dark:border-zinc-800">名称</th>
              <th class="border-b border-zinc-200 p-2 text-left dark:border-zinc-800">状态</th>
              <th class="border-b border-zinc-200 p-2 text-left dark:border-zinc-800">日期</th>
              <th class="border-b border-zinc-200 p-2 text-left dark:border-zinc-800">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td class="border-b border-zinc-100 p-2 dark:border-zinc-900"><input :value="row.title" class="w-full bg-transparent outline-none" @input="(event) => updateRow(index, { title: event.target.value })" /></td>
              <td class="border-b border-zinc-100 p-2 dark:border-zinc-900"><input :value="row.status" class="w-full bg-transparent outline-none" @input="(event) => updateRow(index, { status: event.target.value })" /></td>
              <td class="border-b border-zinc-100 p-2 dark:border-zinc-900"><input :value="row.date" type="date" class="w-full bg-transparent outline-none" @input="(event) => updateRow(index, { date: event.target.value })" /></td>
              <td class="border-b border-zinc-100 p-2 dark:border-zinc-900"><input :value="row.note" class="w-full bg-transparent outline-none" @input="(event) => updateRow(index, { note: event.target.value })" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="viewModel === 'board'" class="grid gap-3 md:grid-cols-3">
        <div v-for="group in boardGroups" :key="group.name" class="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div class="mb-3 text-sm font-medium">{{ group.name }}</div>
          <div class="space-y-2">
            <div v-for="item in group.items" :key="item.id" class="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
              {{ item.title || '未命名条目' }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="viewModel === 'gallery'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="row in rows" :key="row.id" class="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div class="mb-2 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
          <div class="text-sm font-medium">{{ row.title || '未命名条目' }}</div>
          <div class="text-xs text-zinc-500">{{ row.note || row.status || '无说明' }}</div>
        </div>
      </div>

      <div v-else-if="viewModel === 'calendar'" class="space-y-2">
        <div v-for="item in calendarItems" :key="item.id" class="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <div class="text-xs text-zinc-500">{{ item.date || '未安排日期' }}</div>
          <div class="text-sm font-medium">{{ item.title || '未命名条目' }}</div>
        </div>
      </div>

      <div v-else-if="viewModel === 'timeline'" class="space-y-3">
        <div v-for="item in timelineItems" :key="item.id" class="flex gap-3">
          <div class="mt-2 h-2 w-2 rounded-full bg-zinc-950 dark:bg-white"></div>
          <div class="flex-1 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <div class="text-xs text-zinc-500">{{ item.date || '未安排日期' }}</div>
            <div class="text-sm font-medium">{{ item.title || '未命名条目' }}</div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-2">
        <div v-for="item in rows" :key="item.id" class="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          {{ item.title || '未命名条目' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      title: '数据库',
      viewType: 'table',
      rows: [
        { id: '1', title: '条目 1', status: '进行中', date: '', note: '' }
      ]
    })
  }
})

const emit = defineEmits(['update:modelValue'])
const model = computed(() => props.modelValue || { title: '数据库', viewType: 'table', rows: [] })
const rows = computed(() => Array.isArray(model.value.rows) ? model.value.rows : [])

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })
const viewModel = computed({
  get: () => model.value.viewType || 'table',
  set: (value) => patch({ viewType: value })
})

const addRow = () => {
  patch({
    rows: [...rows.value, { id: `${Date.now()}`, title: '', status: '进行中', date: '', note: '' }]
  })
}

const updateRow = (index, patchValue) => {
  const nextRows = rows.value.map((row, rowIndex) => rowIndex === index ? { ...row, ...patchValue } : row)
  patch({ rows: nextRows })
}

const boardGroups = computed(() => {
  const groups = [
    { name: '未开始', items: [] },
    { name: '进行中', items: [] },
    { name: '已完成', items: [] }
  ]
  rows.value.forEach((item) => {
    const target = item.status?.includes('完成') ? groups[2] : item.status?.includes('开始') ? groups[0] : groups[1]
    target.items.push(item)
  })
  return groups
})

const calendarItems = computed(() => [...rows.value].sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))))
const timelineItems = calendarItems
</script>

