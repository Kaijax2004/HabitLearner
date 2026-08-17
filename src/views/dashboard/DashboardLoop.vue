<template>
  <section class="dashboard-footer-grid">
    <BaseCard class="dashboard-72-card" :hover="false">
      <div class="dashboard-section-heading">
        <div>
          <p class="workbench-eyebrow">72 Hours</p>
          <h2>接下来 72 小时</h2>
        </div>
        <button type="button" class="workbench-secondary" @click="$emit('open-plan')">查看计划</button>
      </div>
      <div class="dashboard-72-list">
        <button v-for="day in days" :key="day.date" type="button" class="dashboard-72-row" @click="$emit('open-plan')">
          <span>
            <strong>{{ day.label }}</strong>
            <small>{{ day.date }}</small>
          </span>
          <span class="dashboard-72-items">{{ (day.plans?.length || 0) + (day.scheduleBlocks?.length || 0) }} 项</span>
          <span class="dashboard-72-preview">{{ previewItems(day).map((item) => item.title).join(' · ') || '暂无明确安排' }}</span>
          <span>→</span>
        </button>
      </div>
    </BaseCard>

    <BaseCard class="dashboard-capture-review-card" :hover="false">
      <div class="dashboard-section-heading">
        <div>
          <p class="workbench-eyebrow">Close The Loop</p>
          <h2>把今天收好</h2>
        </div>
      </div>
      <div class="dashboard-loop-grid">
        <button type="button" class="dashboard-loop-entry" @click="$emit('open-captures')">
          <span>收集</span>
          <strong>{{ pendingCaptureCount || 0 }}</strong>
          <small>待判断事项</small>
        </button>
        <button type="button" class="dashboard-loop-entry" @click="$emit('open-review')">
          <span>复盘</span>
          <strong>{{ reviewValue }}</strong>
          <small>留下明天第一步</small>
        </button>
        <button type="button" class="dashboard-loop-entry" @click="$emit('open-tracks')">
          <span>轨道</span>
          <strong>{{ tracksCount }}</strong>
          <small>观察长期节奏</small>
        </button>
      </div>
    </BaseCard>
  </section>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'

defineProps({
  days: { type: Array, default: () => [] },
  pendingCaptureCount: { type: Number, default: 0 },
  reviewValue: { type: [String, Number], default: '待写' },
  tracksCount: { type: Number, default: 0 },
  previewItems: { type: Function, required: true }
})

defineEmits(['open-plan', 'open-captures', 'open-review', 'open-tracks'])
</script>

<style>
.dashboard-footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: stretch;
  gap: var(--workbench-content-gap);
  min-width: 0;
}

.dashboard-72-card,
.dashboard-capture-review-card {
  min-width: 0;
  border: 1px solid var(--workbench-border);
  border-radius: var(--workbench-radius);
  background: var(--workbench-surface);
  box-shadow: 0 18px 44px rgba(24, 24, 27, 0.045);
}

.dashboard-section-heading {
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

.dashboard-72-list {
  display: grid;
  gap: 0.2rem;
  margin-top: 1rem;
}

.dashboard-72-row {
  display: grid;
  grid-template-columns: 4.5rem 3rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--workbench-border);
  background: transparent;
  padding: 0.75rem 0;
  text-align: left;
}

.dashboard-72-row strong,
.dashboard-72-row small {
  display: block;
}

.dashboard-72-row strong {
  color: var(--workbench-text);
  font-size: 0.78rem;
}

.dashboard-72-row small,
.dashboard-72-items,
.dashboard-72-preview,
.dashboard-72-row > span:last-child {
  color: var(--workbench-text-muted);
  font-size: 0.68rem;
}

.dashboard-72-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-loop-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.dashboard-loop-entry {
  display: grid;
  min-height: 7.5rem;
  align-content: space-between;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) - 0.2rem);
  background: var(--workbench-surface-muted);
  padding: 0.85rem;
  text-align: left;
  transition: transform 160ms ease, border-color 160ms ease;
}

.dashboard-loop-entry:hover {
  transform: translateY(-1px);
  border-color: var(--workbench-text-muted);
}

.dashboard-loop-entry span,
.dashboard-loop-entry small {
  color: var(--workbench-text-muted);
  font-size: 0.68rem;
}

.dashboard-loop-entry strong {
  color: var(--workbench-text);
  font-size: 1.35rem;
}

@media (max-width: 767px) {
  .dashboard-footer-grid,
  .dashboard-loop-grid {
    grid-template-columns: 1fr;
  }
}
</style>
