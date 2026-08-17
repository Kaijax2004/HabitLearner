<template>
  <Teleport to="body">
    <div v-if="showUnscheduledPanel" class="fixed inset-0 z-[1240] flex justify-end bg-black/35 backdrop-blur-sm" @click="$emit('close-unscheduled')">
      <aside class="flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white/95 p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950/95" @click.stop>
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Unscheduled</p>
            <h3 class="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">待安排池</h3>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">这些计划块还没有安排到具体日期。先放在这里，等你决定执行时间后再进入今日工作台。</p>
          </div>
          <button type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-300" @click="$emit('close-unscheduled')">关闭</button>
        </div>

        <div class="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <span class="text-zinc-500 dark:text-zinc-400">当前未安排</span>
          <strong class="text-lg font-semibold text-zinc-950 dark:text-white">{{ filteredUnscheduledBlocks.length }}</strong>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <label class="unscheduled-filter-field">
            <span>搜索</span>
            <input :value="unscheduledSearch" type="search" placeholder="搜索计划块内容" @input="$emit('update-search', $event.target.value)" />
          </label>
          <label class="unscheduled-filter-field">
            <span>类型</span>
            <select :value="unscheduledTypeFilter" @change="$emit('update-type', $event.target.value)">
              <option value="all">全部类型</option>
              <option v-for="option in unscheduledTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
        </div>

        <div class="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div v-if="scheduleBlocksLoading" class="rounded-3xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">正在同步日程状态...</div>
          <div v-else-if="!filteredUnscheduledBlocks.length" class="rounded-3xl border border-dashed border-zinc-200 p-6 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{{ unscheduledEmptyText }}</div>
          <div v-else class="space-y-3">
            <article v-for="block in filteredUnscheduledBlocks" :key="`unscheduled-${block.id}`" class="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="line-clamp-2 text-sm font-semibold leading-6 text-zinc-950 dark:text-white">{{ getBlockTextContent(block) || '未命名计划块' }}</p>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ blockTypeLabel(block.type) }}</p>
                </div>
                <button type="button" class="shrink-0 rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950" @click="$emit('schedule', block)">安排</button>
              </div>
            </article>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="scheduleDialog.show" class="fixed inset-0 z-[1250] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm" @click="$emit('close-dialog')">
      <div class="w-full max-w-xl rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950" @click.stop>
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Schedule Block</p>
            <h3 class="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">安排到日程</h3>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">这只会创建一次执行安排，不会删除或改写原计划块。</p>
          </div>
          <button type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-300" @click="$emit('close-dialog')">关闭</button>
        </div>

        <div class="mt-5 grid gap-4">
          <label class="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span>执行标题</span>
            <input v-model="scheduleDialog.title" class="schedule-input" maxlength="255" placeholder="这次要执行什么" />
          </label>
          <div class="grid gap-4 md:grid-cols-3">
            <label class="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span>日期</span>
              <input v-model="scheduleDialog.date" type="date" class="schedule-input" />
            </label>
            <label class="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span>开始时间</span>
              <input v-model="scheduleDialog.startTime" type="time" class="schedule-input" />
            </label>
            <label class="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span>持续分钟</span>
              <input v-model.number="scheduleDialog.durationMinutes" type="number" min="5" max="480" step="5" class="schedule-input" />
            </label>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200" @click="$emit('close-dialog')">取消</button>
          <button type="button" class="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950" :disabled="scheduleDialog.isSubmitting" @click="$emit('submit')">
            {{ scheduleDialog.isSubmitting ? '安排中...' : '确认安排' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  showUnscheduledPanel: { type: Boolean, default: false },
  scheduleDialog: { type: Object, required: true },
  filteredUnscheduledBlocks: { type: Array, default: () => [] },
  scheduleBlocksLoading: { type: Boolean, default: false },
  unscheduledSearch: { type: String, default: '' },
  unscheduledTypeFilter: { type: String, default: 'all' },
  unscheduledTypeOptions: { type: Array, default: () => [] },
  unscheduledEmptyText: { type: String, default: '' },
  getBlockTextContent: { type: Function, required: true },
  blockTypeLabel: { type: Function, required: true }
})

defineEmits(['close-unscheduled', 'update-search', 'update-type', 'schedule', 'close-dialog', 'submit'])
</script>

<style scoped>
.unscheduled-filter-field {
  display: grid;
  gap: 0.4rem;
  color: #71717a;
  font-size: 0.68rem;
  font-weight: 700;
}

.unscheduled-filter-field input,
.unscheduled-filter-field select,
.schedule-input {
  width: 100%;
  border: 1px solid #e4e4e7;
  border-radius: 0.9rem;
  background: white;
  color: #18181b;
  padding: 0.7rem 0.8rem;
  font-size: 0.8rem;
  outline: none;
}

.dark .unscheduled-filter-field input,
.dark .unscheduled-filter-field select,
.dark .schedule-input {
  border-color: #3f3f46;
  background: #18181b;
  color: #f4f4f5;
}
</style>
