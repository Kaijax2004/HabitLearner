<template>
  <BaseCard class="dashboard-execution-card" :hover="false">
    <div class="dashboard-section-heading">
      <div>
        <p class="workbench-eyebrow">Current Truth</p>
        <h2>今日执行</h2>
      </div>
      <button type="button" class="workbench-secondary" @click="$emit('refresh')">
        {{ isLoading ? '同步中' : '刷新' }}
      </button>
    </div>

    <div class="dashboard-truth">
      <p>{{ currentTruth?.summary || '正在整理你的今日状态。' }}</p>
      <strong>{{ currentTruth?.focusSuggestion || '先完成一个最小行动，再进入下一轮专注。' }}</strong>
    </div>

    <div class="dashboard-subheading">
      <div>
        <h3>今日时间线</h3>
        <p>计划块只在这里推进状态，不改变原计划正文。</p>
      </div>
      <span>{{ scheduleBlocks.length }} 项</span>
    </div>

    <div v-if="scheduleBlocks.length" class="dashboard-timeline">
      <article v-for="item in scheduleBlocks" :key="`dashboard-schedule-${item.id}`" class="dashboard-timeline-item">
        <div class="dashboard-timeline-time">{{ item.start_time || '待定' }}</div>
        <div class="dashboard-timeline-line"><span></span></div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="dashboard-status-pill" :class="scheduleStatusClass(item.status)">{{ scheduleStatusLabel(item.status) }}</span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatScheduleMeta(item) }}</span>
          </div>
          <p class="mt-2 truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
          <p v-if="item.plan?.title" class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{{ item.plan.title }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-if="item.status !== 'in_progress' && item.status !== 'completed' && item.status !== 'skipped'"
              type="button"
              class="dashboard-timeline-action"
              :disabled="updatingId === item.id"
              @click="$emit('change-status', item, 'in_progress')"
            >开始</button>
            <button
              v-if="item.status !== 'completed'"
              type="button"
              class="dashboard-timeline-action is-primary"
              :disabled="updatingId === item.id"
              @click="$emit('change-status', item, 'completed')"
            >完成</button>
            <button
              v-if="item.status !== 'skipped' && item.status !== 'completed'"
              type="button"
              class="dashboard-timeline-action"
              :disabled="updatingId === item.id"
              @click="$emit('change-status', item, 'skipped')"
            >跳过</button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="dashboard-empty">
      <p>今天还没有安排执行块。</p>
      <button type="button" class="workbench-secondary" @click="$emit('open-plan')">从计划待安排池选择</button>
    </div>

    <div class="dashboard-execution-footer">
      <button type="button" class="workbench-primary" @click="$emit('open-focus')">开始专注</button>
      <button type="button" class="workbench-secondary" @click="$emit('open-review')">写今日复盘</button>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'

defineProps({
  currentTruth: { type: Object, default: () => ({}) },
  scheduleBlocks: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  updatingId: { type: [String, Number, null], default: null },
  scheduleStatusLabel: { type: Function, required: true },
  scheduleStatusClass: { type: Function, required: true },
  formatScheduleMeta: { type: Function, required: true }
})

defineEmits(['refresh', 'change-status', 'open-plan', 'open-focus', 'open-review'])
</script>

<style scoped>
.dashboard-execution-card {
  min-width: 0;
  border: 1px solid var(--workbench-border);
  border-radius: var(--workbench-radius);
  background: var(--workbench-surface);
  box-shadow: 0 18px 44px rgba(24, 24, 27, 0.045);
}

.dashboard-section-heading,
.dashboard-subheading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-section-heading h2 {
  margin-top: 0.45rem;
  color: var(--workbench-text);
  font-size: 1.35rem;
  font-weight: 750;
  letter-spacing: -0.045em;
}

.dashboard-subheading {
  align-items: flex-end;
  margin-top: 1.4rem;
  border-bottom: 1px solid var(--workbench-border);
  padding-bottom: 0.7rem;
}

.dashboard-subheading h3 {
  color: var(--workbench-text);
  font-size: 0.92rem;
  font-weight: 800;
}

.dashboard-subheading p,
.dashboard-subheading > span {
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
  line-height: 1.5;
}

.dashboard-truth {
  display: grid;
  gap: 0.55rem;
  margin-top: 1.2rem;
  border-radius: calc(var(--workbench-radius) - 0.2rem);
  background: var(--workbench-surface-muted);
  padding: 1rem;
}

.dashboard-truth p,
.dashboard-truth strong {
  color: var(--workbench-text);
  font-size: 0.84rem;
  line-height: 1.7;
}

.dashboard-truth p {
  color: color-mix(in srgb, var(--workbench-text) 82%, var(--workbench-text-muted));
}

.dashboard-timeline {
  display: grid;
  gap: 0.2rem;
  margin-top: 0.25rem;
}

.dashboard-timeline-item {
  display: grid;
  grid-template-columns: 3.2rem 0.8rem minmax(0, 1fr);
  gap: 0.65rem;
  padding: 1rem 0;
}

.dashboard-timeline-time {
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.dashboard-timeline-line {
  position: relative;
  display: flex;
  justify-content: center;
}

.dashboard-timeline-line::before {
  position: absolute;
  top: 0.35rem;
  bottom: -1rem;
  width: 1px;
  background: var(--workbench-border);
  content: '';
}

.dashboard-timeline-line span {
  z-index: 1;
  width: 0.48rem;
  height: 0.48rem;
  margin-top: 0.25rem;
  border: 2px solid var(--workbench-surface);
  border-radius: 999px;
  background: var(--workbench-text);
  box-shadow: 0 0 0 1px var(--workbench-border);
}

.dashboard-timeline-action {
  border: 1px solid var(--workbench-border);
  border-radius: 0.7rem;
  background: var(--workbench-surface);
  color: var(--workbench-text-muted);
  padding: 0.35rem 0.7rem;
  font-size: 0.7rem;
}

.dashboard-timeline-action.is-primary {
  border-color: var(--workbench-text);
  background: var(--workbench-text);
  color: var(--workbench-surface);
}

.dashboard-empty {
  display: grid;
  gap: 0.8rem;
  margin-top: 1.2rem;
  color: var(--workbench-text-muted);
  font-size: 0.82rem;
}

.dashboard-execution-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1rem;
  border-top: 1px solid var(--workbench-border);
  padding-top: 1rem;
}
</style>
