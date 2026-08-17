<template>
  <aside class="plan-editor-rail plan-editor-inspector-rail">
    <div class="plan-rail-heading">
      <span class="plan-rail-eyebrow">Workbench</span>
      <strong>执行面</strong>
    </div>

    <div class="plan-inspector-section">
      <span class="plan-inspector-label">状态</span>
      <span class="plan-inspector-value">{{ statusLabel }}</span>
    </div>
    <div class="plan-inspector-section">
      <span class="plan-inspector-label">优先级</span>
      <span class="plan-inspector-value">{{ priorityLabel }}</span>
    </div>
    <div class="plan-inspector-section">
      <span class="plan-inspector-label">截止日期</span>
      <span class="plan-inspector-value">{{ dueDate || '未设置' }}</span>
    </div>

    <div class="plan-inspector-divider"></div>

    <button type="button" class="plan-inspector-action" @click="$emit('open-unscheduled')">
      <span>
        <strong>待安排池</strong>
        <small>{{ unscheduledBlocks.length }} 个计划块等待执行</small>
      </span>
      <span>→</span>
    </button>
    <button type="button" class="plan-inspector-action" @click="$emit('open-ai')">
      <span>
        <strong>AI 工作区</strong>
        <small>问答、生图和生视频都在这里处理</small>
      </span>
      <span>→</span>
    </button>

    <div class="plan-inspector-divider"></div>

    <div class="plan-inspector-timeline">
      <div class="flex items-center justify-between gap-3">
        <span class="plan-inspector-label">今日时间轴</span>
        <span class="text-xs text-zinc-400">{{ scheduleBlocks.length }} 项</span>
      </div>
      <div v-if="scheduleBlocks.length" class="mt-3 grid gap-2">
        <div v-for="item in scheduleBlocks.slice(0, 4)" :key="`inspector-schedule-${item.id}`" class="plan-inspector-timeline-item">
          <span>{{ item.start_time || '待定' }}</span>
          <div class="min-w-0">
            <strong>{{ item.title }}</strong>
            <small>{{ scheduleStatusLabel(item.status) }}</small>
          </div>
        </div>
      </div>
      <p v-else class="mt-3 text-xs leading-5 text-zinc-400">这个计划还没有安排到今天的执行块。</p>
    </div>

    <button type="button" class="plan-inspector-action" @click="$emit('open-creator')">
      <span>
        <strong>内容创作</strong>
        <small>把计划里的研究或写作推进到内容流水线</small>
      </span>
      <span>→</span>
    </button>
  </aside>
</template>

<script setup>
defineProps({
  statusLabel: { type: String, default: '' },
  priorityLabel: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  unscheduledBlocks: { type: Array, default: () => [] },
  scheduleBlocks: { type: Array, default: () => [] },
  scheduleStatusLabel: { type: Function, required: true }
})

defineEmits(['open-unscheduled', 'open-ai', 'open-creator'])
</script>

<style>
.plan-inspector-section {
  display: grid;
  gap: 0.38rem;
  border-bottom: 1px solid rgba(228, 228, 231, 0.72);
  padding-bottom: 0.8rem;
}

.dark .plan-inspector-section,
.dark .plan-inspector-timeline-item {
  border-color: rgba(63, 63, 70, 0.72);
}

.plan-inspector-label {
  color: rgb(113 113 122);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.plan-inspector-value {
  overflow: hidden;
  color: rgb(39 39 42);
  font-size: 0.82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .plan-inspector-value,
.dark .plan-inspector-action {
  color: rgb(244 244 245);
}

.plan-inspector-divider {
  height: 1px;
  background: rgba(228, 228, 231, 0.72);
}

.dark .plan-inspector-divider {
  background: rgba(63, 63, 70, 0.72);
}

.plan-inspector-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 0;
  border-radius: 0.9rem;
  background: transparent;
  color: rgb(39 39 42);
  padding: 0.7rem 0.5rem;
  text-align: left;
  transition: background 150ms ease;
}

.plan-inspector-action:hover {
  background: rgba(228, 228, 231, 0.6);
}

.dark .plan-inspector-action:hover {
  background: rgba(63, 63, 70, 0.6);
}

.plan-inspector-action strong,
.plan-inspector-action small {
  display: block;
}

.plan-inspector-action strong {
  font-size: 0.78rem;
}

.plan-inspector-action small {
  margin-top: 0.25rem;
  color: rgb(113 113 122);
  font-size: 0.68rem;
  line-height: 1.45;
}

.plan-inspector-timeline {
  min-width: 0;
}

.plan-inspector-timeline-item {
  display: grid;
  grid-template-columns: 2.8rem minmax(0, 1fr);
  gap: 0.55rem;
  border-bottom: 1px solid rgba(228, 228, 231, 0.72);
  padding: 0.55rem 0;
}

.plan-inspector-timeline-item > span {
  color: rgb(113 113 122);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
}

.plan-inspector-timeline-item strong,
.plan-inspector-timeline-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-inspector-timeline-item strong {
  color: rgb(39 39 42);
  font-size: 0.7rem;
  font-weight: 750;
}

.dark .plan-inspector-timeline-item strong {
  color: rgb(244 244 245);
}

.plan-inspector-timeline-item small {
  margin-top: 0.18rem;
  color: rgb(161 161 170);
  font-size: 0.62rem;
}

@media (max-width: 1023px) {
  .plan-editor-inspector-rail {
    display: none;
  }
}
</style>
