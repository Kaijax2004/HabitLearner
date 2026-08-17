<template>
  <header class="plan-editor-topbar mb-8 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <span class="h-2 w-2 rounded-full" :class="saveDotClass"></span>
          <span>{{ saveStatusText }}</span>
        </span>
        <span
          v-if="selectedBlockCount"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          <span>已选 {{ selectedBlockCount }} 块</span>
          <button type="button" class="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white" @click="$emit('clear-selection')">清空</button>
        </span>
        <button v-if="planId" type="button" class="btn-ghost px-3 py-2 text-sm" @click="$emit('open-unscheduled')">
          待安排池 {{ unscheduledCount }}
        </button>
        <button type="button" class="btn-ghost px-3 py-2 text-sm" @click="$emit('import')">导入</button>
        <button type="button" class="btn-ghost px-3 py-2 text-sm" @click="$emit('export')">导出</button>
        <button v-if="planId" type="button" class="btn-ghost px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200" @click="$emit('delete')">
          删除计划
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ statusLabel }}</span>
        <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ priorityLabel }}</span>
        <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ typeLabel }}</span>
        <span v-if="dueDate" class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">截止 {{ dueDate }}</span>
      </div>
    </div>

    <div class="space-y-4">
      <textarea
        ref="titleRef"
        :value="title"
        class="plan-title-input"
        rows="1"
        placeholder="无标题"
        @input="onTitleInput"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
          <span>状态</span>
          <select :value="status" @change="update('status', $event.target.value)">
            <option value="not_started">未开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </select>
        </label>
        <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
          <span>优先级</span>
          <select :value="priority" @change="update('priority', $event.target.value)">
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </label>
        <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-6' : 'lg:col-span-3'">
          <span>类型</span>
          <div class="plan-meta-type-row" :class="{ 'plan-meta-type-row-custom': isCustomPlanType }">
            <select :value="planType" @change="update('planType', $event.target.value)">
              <option value="project">项目</option>
              <option value="task">任务</option>
              <option value="goal">目标</option>
              <option value="custom">自定义</option>
            </select>
            <input
              v-if="isCustomPlanType"
              :value="customTypeName"
              class="plan-meta-type-input"
              type="text"
              maxlength="50"
              placeholder="例如：会议、灵感、复盘、研究"
              @input="update('customTypeName', $event.target.value)"
            />
          </div>
        </label>
        <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
          <span>截止日期</span>
          <input :value="dueDate" type="date" @change="update('dueDate', $event.target.value)" />
        </label>
      </div>
    </div>
  </header>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  planId: { type: [String, Number, null], default: null },
  title: { type: String, default: '' },
  status: { type: String, default: 'not_started' },
  priority: { type: String, default: 'medium' },
  planType: { type: String, default: 'project' },
  customTypeName: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  isCustomPlanType: { type: Boolean, default: false },
  statusLabel: { type: String, default: '' },
  priorityLabel: { type: String, default: '' },
  typeLabel: { type: String, default: '' },
  saveStatusText: { type: String, default: '' },
  saveDotClass: { type: String, default: '' },
  selectedBlockCount: { type: Number, default: 0 },
  unscheduledCount: { type: Number, default: 0 }
})

const emit = defineEmits([
  'update:title',
  'update:status',
  'update:priority',
  'update:planType',
  'update:customTypeName',
  'update:dueDate',
  'title-input',
  'dirty',
  'clear-selection',
  'open-unscheduled',
  'import',
  'export',
  'delete'
])

const titleRef = ref(null)

const resizeTitle = () => {
  if (!titleRef.value) return
  titleRef.value.style.height = 'auto'
  titleRef.value.style.height = `${titleRef.value.scrollHeight}px`
}

const onTitleInput = (event) => {
  emit('update:title', event.target.value)
  emit('title-input', event)
}

const update = (key, value) => {
  emit(`update:${key}`, value)
  emit('dirty')
}

watch(() => props.title, () => nextTick(resizeTitle), { immediate: true })
</script>

<style scoped>
.plan-title-input {
  display: block;
  width: 100%;
  resize: none;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: var(--workbench-text, #18181b);
  padding: 0;
  font-size: clamp(2rem, 5vw, 3.8rem);
  font-weight: 750;
  letter-spacing: -0.065em;
  line-height: 1.05;
  outline: none;
}

.plan-title-input::placeholder {
  color: #a1a1aa;
}

.plan-meta-field {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

.plan-meta-field > span {
  color: #71717a;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.plan-meta-field select,
.plan-meta-field input {
  width: 100%;
  min-width: 0;
  border: 1px solid #e4e4e7;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.76);
  color: #27272a;
  padding: 0.7rem 0.8rem;
  font-size: 0.78rem;
  outline: none;
}

.dark .plan-meta-field select,
.dark .plan-meta-field input {
  border-color: #3f3f46;
  background: rgba(24, 24, 27, 0.76);
  color: #f4f4f5;
}

.plan-meta-type-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
}

.plan-meta-type-row-custom {
  grid-template-columns: minmax(7rem, 0.8fr) minmax(0, 1.2fr);
}

@media (max-width: 640px) {
  .plan-meta-type-row-custom {
    grid-template-columns: 1fr;
  }
}
</style>
