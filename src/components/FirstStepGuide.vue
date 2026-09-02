<template>
  <section class="first-step-guide" aria-label="新用户第一步任务">
    <div class="first-step-visual" aria-hidden="true">
      <span class="orbit orbit-one"></span>
      <span class="orbit orbit-two"></span>
      <strong>01</strong>
    </div>

    <div class="first-step-copy">
      <p class="first-step-kicker">First Mission</p>
      <h2>第一次打开习知，先完成一个最小闭环。</h2>
      <p>
        不需要一次把所有功能都学完。先用 10 分钟完成“发现信号 -> 变成选题或计划 -> 开始执行”的第一步，产品价值会更快变清楚。
      </p>
      <div class="first-step-stats">
        <span>计划 {{ normalizedStats.plans }}</span>
        <span>今日重点 {{ normalizedStats.priorities }}</span>
        <span>收集 {{ normalizedStats.captures }}</span>
        <span>内容 {{ normalizedStats.creatorItems }}</span>
      </div>
    </div>

    <div class="first-step-actions">
      <button v-for="action in actions" :key="action.key" type="button" :class="['first-step-action', action.tone]" @click="$emit('select', action.key)">
        <span>{{ action.badge }}</span>
        <strong>{{ action.title }}</strong>
        <small>{{ action.description }}</small>
      </button>
    </div>

    <button type="button" class="first-step-dismiss" @click="$emit('dismiss')">暂时不看</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['select', 'dismiss'])

const normalizedStats = computed(() => ({
  plans: Number(props.stats?.plans || 0),
  priorities: Number(props.stats?.priorities || 0),
  captures: Number(props.stats?.captures || 0),
  creatorItems: Number(props.stats?.creatorItems || 0)
}))

const actions = [
  {
    key: 'plan',
    badge: '计划',
    title: '写下第一个目标',
    description: '把脑子里的事落成计划，后面才能安排到今天。',
    tone: 'is-primary'
  },
  {
    key: 'hotspots',
    badge: '选题',
    title: '去热点雷达找信号',
    description: '适合创作者先找一个真实来源，再转入内容创作。',
    tone: 'is-warm'
  },
  {
    key: 'mentor',
    badge: 'Mentor-X',
    title: '问今天先做什么',
    description: '让智能体基于当前工作台给出下一步，但执行前仍由你确认。',
    tone: 'is-calm'
  },
  {
    key: 'guide',
    badge: '教程',
    title: '看 3 分钟上手路线',
    description: '理解今日页、计划、热点雷达、内容创作如何流转。',
    tone: 'is-soft'
  }
]
</script>

<style scoped>
.first-step-guide {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(6.8rem, 0.16fr) minmax(0, 0.84fr) minmax(19rem, 0.74fr);
  gap: clamp(0.8rem, 1.7vw, 1.2rem);
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 1.18);
  background:
    radial-gradient(circle at 7% 10%, rgb(var(--workbench-accent-rgb) / 0.16), transparent 30%),
    linear-gradient(135deg, color-mix(in srgb, var(--workbench-glass-highlight) 58%, transparent), transparent 46%),
    var(--workbench-surface);
  padding: clamp(1rem, 2vw, 1.45rem);
  box-shadow:
    inset 0 1px 0 var(--workbench-glass-highlight),
    0 18px 54px var(--workbench-glass-shadow);
  backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(170%);
  -webkit-backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(170%);
}

.first-step-guide::after {
  content: '';
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(120deg, rgb(255 255 255 / 0.28), transparent 38%, rgb(255 255 255 / 0.14));
  pointer-events: none;
}

.first-step-visual {
  position: relative;
  display: grid;
  min-height: 8.4rem;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--workbench-border) 72%, transparent);
  border-radius: calc(var(--workbench-radius) * 0.95);
  background:
    radial-gradient(circle at 25% 16%, rgb(255 255 255 / 0.24), transparent 34%),
    var(--workbench-text);
  color: var(--workbench-page);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
}

.first-step-visual strong {
  position: relative;
  z-index: 1;
  font-size: clamp(2.5rem, 5vw, 4.45rem);
  font-weight: 880;
  letter-spacing: -0.08em;
  line-height: 1;
}

.orbit {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 999px;
}

.orbit-one {
  width: 7.5rem;
  height: 7.5rem;
}

.orbit-two {
  width: 11rem;
  height: 11rem;
  border-style: dashed;
}

.first-step-copy {
  display: grid;
  align-content: center;
  gap: 0.58rem;
  min-width: 0;
}

.first-step-kicker {
  margin: 0;
  color: var(--workbench-text-muted);
  font-size: 0.66rem;
  font-weight: 860;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.first-step-copy h2 {
  max-width: 11em;
  margin: 0;
  color: var(--workbench-text);
  font-size: clamp(1.45rem, 3vw, 2.35rem);
  font-weight: 850;
  letter-spacing: -0.06em;
  line-height: 1.04;
}

.first-step-copy p:not(.first-step-kicker) {
  max-width: 42rem;
  margin: 0;
  color: var(--workbench-text-muted);
  font-size: 0.86rem;
  line-height: 1.75;
}

.first-step-stats,
.first-step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.first-step-stats span {
  border: 1px solid var(--workbench-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--workbench-surface) 68%, transparent);
  color: var(--workbench-text-muted);
  padding: 0.32rem 0.58rem;
  font-size: 0.68rem;
  font-weight: 820;
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
}

.first-step-actions {
  align-content: center;
}

.first-step-action {
  display: grid;
  flex: 1 1 8.8rem;
  min-height: 6.25rem;
  gap: 0.28rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.82);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 48%, transparent), transparent 52%),
    var(--workbench-surface-muted);
  color: var(--workbench-text);
  padding: 0.82rem;
  text-align: left;
  box-shadow: inset 0 1px 0 var(--workbench-glass-highlight);
  backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.65)) saturate(150%);
  -webkit-backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.65)) saturate(150%);
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease), background var(--workbench-motion-duration) var(--workbench-ease), box-shadow var(--workbench-motion-duration) var(--workbench-ease);
}

.first-step-action:hover,
.first-step-action:focus-visible {
  border-color: rgb(var(--workbench-accent-rgb) / 0.38);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 64%, transparent), transparent 50%),
    var(--workbench-surface);
  box-shadow:
    inset 0 1px 0 var(--workbench-glass-highlight),
    0 14px 30px color-mix(in srgb, var(--workbench-glass-shadow) 70%, transparent);
  outline: none;
  transform: translateY(-2px);
}

.first-step-action:active {
  transform: scale(0.985);
}

.first-step-action span {
  color: rgb(var(--workbench-accent-rgb));
  font-size: 0.62rem;
  font-weight: 880;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.first-step-action strong {
  font-size: 0.86rem;
  font-weight: 840;
  line-height: 1.35;
}

.first-step-action small {
  color: var(--workbench-text-muted);
  font-size: 0.68rem;
  line-height: 1.45;
}

.first-step-dismiss {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: 1px solid var(--workbench-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--workbench-surface) 72%, transparent);
  color: var(--workbench-text-muted);
  padding: 0.38rem 0.65rem;
  font-size: 0.68rem;
  font-weight: 820;
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), color var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease);
}

.first-step-dismiss:hover,
.first-step-dismiss:focus-visible {
  border-color: rgb(var(--workbench-accent-rgb) / 0.28);
  color: var(--workbench-text);
  outline: none;
  transform: translateY(-1px);
}

.first-step-dismiss:active {
  transform: scale(0.96);
}

@media (max-width: 1080px) {
  .first-step-guide {
    grid-template-columns: 1fr;
  }

  .first-step-visual {
    min-height: 5.5rem;
  }
}

@media (max-width: 640px) {
  .first-step-guide {
    border-radius: 1.25rem;
    padding: 1rem;
  }

  .first-step-copy h2 {
    max-width: 100%;
  }

  .first-step-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .first-step-action {
    min-height: auto;
  }

  .first-step-dismiss {
    position: static;
    justify-self: start;
  }
}
</style>
