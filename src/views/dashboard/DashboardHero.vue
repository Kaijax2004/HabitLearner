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
defineProps({
  currentDate: { type: String, default: '' },
  dashboardGreeting: { type: String, default: '' },
  dashboardNarrative: { type: String, default: '' },
  primaryAction: { type: Object, default: () => ({ title: '', label: '' }) },
  dashboardHighlights: { type: Array, default: () => [] }
})

defineEmits(['primary-action'])
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
}
</style>
