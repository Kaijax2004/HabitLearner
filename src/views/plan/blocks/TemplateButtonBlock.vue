<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="flex flex-wrap items-center gap-3">
      <input :value="model.label" class="min-w-40 flex-1 rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="模板按钮文案" @input="(event) => patch({ label: event.target.value })" />
      <select v-model="templateModel" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white">
        <option value="meeting">会议记录</option>
        <option value="project">项目推进</option>
        <option value="journal">日记模板</option>
      </select>
      <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950" @click="insertTemplate">
        {{ model.label || '插入模板' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ label: '插入模板', template: 'meeting' })
  }
})

const emit = defineEmits(['update:modelValue', 'insert-blocks'])
const model = computed(() => props.modelValue || { label: '插入模板', template: 'meeting' })
const templateModel = computed({
  get: () => model.value.template || 'meeting',
  set: (value) => patch({ template: value })
})

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const templates = {
  meeting: [
    { type: 'heading', content: { text: '会议主题', level: 2 } },
    { type: 'todo', content: { text: '会议结论', done: false } },
    { type: 'quote', content: { text: '行动项' } }
  ],
  project: [
    { type: 'heading', content: { text: '目标', level: 2 } },
    { type: 'list', content: { listType: 'unordered', items: ['里程碑 1', '里程碑 2'] } },
    { type: 'callout', content: { text: '风险与依赖', variant: 'warning' } }
  ],
  journal: [
    { type: 'heading', content: { text: '今日记录', level: 2 } },
    { type: 'text', content: { text: '' } },
    { type: 'divider', content: { style: 'solid' } }
  ]
}

const insertTemplate = () => {
  emit('insert-blocks', (templates[templateModel.value] || templates.meeting).map((block) => ({ ...block })))
}
</script>

