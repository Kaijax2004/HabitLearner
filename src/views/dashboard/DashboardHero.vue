<template>
  <section class="dashboard-hero workbench-panel">
    <div class="dashboard-hero-copy">
      <p class="workbench-eyebrow">{{ currentDate }}</p>
      <h1>{{ dashboardGreeting }}</h1>
      <p>{{ dashboardNarrative }}</p>
    </div>
    <div class="dashboard-hero-next">
      <p class="workbench-eyebrow">下一步</p>
      <strong>{{ primaryAction.title }}</strong>
      <button type="button" class="workbench-primary" @click="$emit('primary-action')">
        {{ primaryAction.label }}
      </button>
    </div>
    <div class="dashboard-priorities">
      <div class="dashboard-priorities-head">
        <div>
          <p class="workbench-eyebrow">Daily Three</p>
          <h2>今日三件事</h2>
        </div>
        <small>{{ selectedPriorityItems.length }}/3</small>
      </div>
      <div class="dashboard-priority-list">
        <button
          v-for="item in visiblePriorityItems"
          :key="item.id"
          type="button"
          class="dashboard-priority-chip"
          :class="{ 'is-selected': isPrioritySelected(item) }"
          @click="$emit(isPrioritySelected(item) ? 'remove-priority' : 'add-priority', item)"
        >
          <span>{{ item.title }}</span>
          <small>{{ item.description || (isPrioritySelected(item) ? '已加入今日重点' : '点击加入今日重点') }}</small>
        </button>
        <div v-if="!visiblePriorityItems.length" class="dashboard-priority-empty">
          暂时没有候选事项。可以先从计划页安排一个执行块。
        </div>
      </div>
    </div>
    <div class="dashboard-metrics">
      <div v-for="item in dashboardHighlights" :key="item.label" class="dashboard-metric">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['primary-action', 'add-priority', 'remove-priority'])

const props = defineProps({
  currentDate: { type: String, default: '' },
  dashboardGreeting: { type: String, default: '' },
  dashboardNarrative: { type: String, default: '' },
  primaryAction: { type: Object, default: () => ({ title: '', label: '' }) },
  dashboardHighlights: { type: Array, default: () => [] },
  selectedPriorityItems: { type: Array, default: () => [] },
  priorityCandidates: { type: Array, default: () => [] }
})

const isPrioritySelected = (item) => props.selectedPriorityItems.some((candidate) => candidate.id === item.id)

const visiblePriorityItems = computed(() => {
  if (props.selectedPriorityItems.length) return props.selectedPriorityItems
  return props.priorityCandidates.slice(0, 3)
})
</script>

<style>
.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(15rem, 0.85fr);
  gap: 1.25rem;
  min-width: 0;
  padding: clamp(1.2rem, 2.2vw, 2rem);
}

.dashboard-hero-copy {
  min-width: 0;
}

.dashboard-hero-copy h1 {
  margin-top: 0.55rem;
  color: var(--workbench-text);
  font-size: clamp(2rem, 4vw, 3.45rem);
  font-weight: 750;
  letter-spacing: -0.06em;
  line-height: 1.04;
}

.dashboard-hero-copy > p:last-child {
  max-width: 46rem;
  margin-top: 0.9rem;
  color: var(--workbench-text-muted);
  font-size: 0.88rem;
  line-height: 1.75;
}

.dashboard-hero-next {
  display: grid;
  min-width: 0;
  align-content: space-between;
  gap: 0.8rem;
  border-left: 1px solid var(--workbench-border);
  padding-left: 1.25rem;
}

.dashboard-hero-next strong {
  min-height: 3rem;
  color: var(--workbench-text);
  font-size: 1rem;
  line-height: 1.6;
}

.dashboard-hero-next .workbench-primary {
  justify-self: start;
}

.dashboard-priorities {
  display: grid;
  grid-column: 1 / -1;
  gap: 0.85rem;
  border-top: 1px solid var(--workbench-border);
  padding-top: 1rem;
}

.dashboard-priorities-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-priorities-head h2 {
  margin-top: 0.3rem;
  color: var(--workbench-text);
  font-size: 1.08rem;
  font-weight: 760;
  letter-spacing: -0.04em;
}

.dashboard-priorities-head small,
.dashboard-priority-chip small,
.dashboard-priority-empty {
  color: var(--workbench-text-muted);
  font-size: 0.7rem;
  line-height: 1.5;
}

.dashboard-priority-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.dashboard-priority-chip {
  display: grid;
  gap: 0.32rem;
  min-height: 5rem;
  align-content: start;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) - 0.25rem);
  background: var(--workbench-surface-muted);
  padding: 0.8rem;
  text-align: left;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.dashboard-priority-chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--workbench-text) 34%, var(--workbench-border));
}

.dashboard-priority-chip.is-selected {
  border-color: color-mix(in srgb, var(--workbench-text) 55%, var(--workbench-border));
  background: color-mix(in srgb, var(--workbench-surface) 84%, var(--workbench-accent, #8f7350));
}

.dashboard-priority-chip span {
  display: -webkit-box;
  overflow: hidden;
  color: var(--workbench-text);
  font-size: 0.82rem;
  font-weight: 780;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.dashboard-priority-empty {
  grid-column: 1 / -1;
  border: 1px dashed var(--workbench-border);
  border-radius: calc(var(--workbench-radius) - 0.25rem);
  padding: 1rem;
}

.dashboard-metrics {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--workbench-border);
}

.dashboard-metric {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
  padding: 1rem 1rem 0 0;
}

.dashboard-metric + .dashboard-metric {
  border-left: 1px solid var(--workbench-border);
  padding-left: 1rem;
}

.dashboard-metric span,
.dashboard-metric small {
  color: var(--workbench-text-muted);
  font-size: 0.7rem;
  line-height: 1.45;
}

.dashboard-metric span {
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dashboard-metric strong {
  color: var(--workbench-text);
  font-size: 1.55rem;
  letter-spacing: -0.04em;
}

@media (max-width: 767px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .dashboard-hero-next {
    border-top: 1px solid var(--workbench-border);
    border-left: 0;
    padding-top: 1rem;
    padding-left: 0;
  }

  .dashboard-priority-list,
  .dashboard-metrics {
    grid-template-columns: 1fr;
  }

  .dashboard-metric + .dashboard-metric {
    border-top: 1px solid var(--workbench-border);
    border-left: 0;
    padding-left: 0;
  }
}
</style>
