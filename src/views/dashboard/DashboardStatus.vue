<template>
  <BaseCard class="dashboard-status-card" :hover="false">
    <div class="dashboard-section-heading">
      <div>
        <p class="workbench-eyebrow">Status</p>
        <h2>今日状态</h2>
      </div>
      <button type="button" class="workbench-secondary" @click="$emit('manage-habits')">管理习惯</button>
    </div>

    <div class="dashboard-habit-list">
      <div v-if="habitLoading" class="dashboard-empty">正在同步习惯...</div>
      <template v-else-if="habits.length">
        <div v-for="habit in habits" :key="habit.id" class="dashboard-habit-row">
          <button type="button" class="dashboard-habit-main" @click="$emit('open-habit', habit.id)">
            <span class="habit-preview-dot" :style="{ backgroundColor: habit.color || '#18181b' }"></span>
            <span class="min-w-0 flex-1 text-left">
              <strong>{{ habit.name }}</strong>
              <small>{{ habit.count }}/{{ habit.target }} · 连续 {{ habit.streak || 0 }} 天</small>
            </span>
          </button>
          <button
            type="button"
            class="dashboard-check-button"
            :class="{ 'is-completed': habit.done }"
            :disabled="habit.done || checkingId === habit.id"
            @click.stop="$emit('check-habit', habit)"
          >{{ checkingId === habit.id ? '记录中' : habit.done ? '已完成' : '打卡' }}</button>
        </div>
      </template>
      <div v-else class="dashboard-empty">
        <p>还没有习惯记录。</p>
        <button type="button" class="workbench-secondary" @click="$emit('create-habit')">创建习惯</button>
      </div>
    </div>

    <div class="dashboard-status-divider"></div>
    <button type="button" class="dashboard-status-link" @click="$emit('open-creator')">
      <span>
        <small>内容创作</small>
        <strong>{{ creatorNextAction.title }}</strong>
        <em>{{ creatorCounts.trend || 0 }} 条热点 · {{ creatorCounts.drafting || 0 }} 条写作中 · {{ creatorCounts.scheduled || 0 }} 条待发布</em>
      </span>
      <span>→</span>
    </button>
    <button type="button" class="dashboard-status-link" @click="$emit('open-captures')">
      <span>
        <small>收集箱</small>
        <strong>{{ pendingCaptureCount ? `${pendingCaptureCount} 条待处理` : '收集箱暂时清爽' }}</strong>
        <em>{{ latestCaptureText }}</em>
      </span>
      <span>→</span>
    </button>
    <button type="button" class="dashboard-status-link" @click="$emit('open-review')">
      <span>
        <small>今日复盘</small>
        <strong>{{ hasReview ? '已记录' : '还没有收口' }}</strong>
        <em>{{ reviewSummaryLine }}</em>
      </span>
      <span>→</span>
    </button>

    <div class="dashboard-ai-entry">
      <div>
        <p class="workbench-eyebrow">Xizhi Intelligence</p>
        <strong>问习知：今天先做什么？</strong>
        <span>{{ aiStatusText }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="workbench-primary" :disabled="aiLoading" @click="$emit('ask-ai')">
          {{ aiLoading ? '生成中' : '问习知' }}
        </button>
        <button v-if="aiErrorCode === 'AI_NOT_CONFIGURED'" type="button" class="workbench-secondary" @click="$emit('configure-ai')">
          配置
        </button>
      </div>
    </div>
    <p v-if="aiReply" class="dashboard-ai-reply">{{ aiReply }}</p>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'

defineProps({
  habits: { type: Array, default: () => [] },
  habitLoading: { type: Boolean, default: false },
  checkingId: { type: [String, Number, null], default: null },
  creatorNextAction: { type: Object, default: () => ({ title: '' }) },
  creatorCounts: { type: Object, default: () => ({}) },
  pendingCaptureCount: { type: Number, default: 0 },
  latestCaptureText: { type: String, default: '' },
  hasReview: { type: Boolean, default: false },
  reviewSummaryLine: { type: String, default: '' },
  aiLoading: { type: Boolean, default: false },
  aiErrorCode: { type: String, default: '' },
  aiStatusText: { type: String, default: '' },
  aiReply: { type: String, default: '' }
})

defineEmits([
  'manage-habits',
  'open-habit',
  'check-habit',
  'create-habit',
  'open-creator',
  'open-captures',
  'open-review',
  'ask-ai',
  'configure-ai'
])
</script>

<style scoped>
.dashboard-status-card {
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

.dashboard-habit-list {
  display: grid;
  gap: 0.35rem;
  margin-top: 1.2rem;
}

.dashboard-habit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border-bottom: 1px solid var(--workbench-border);
  padding: 0.65rem 0;
}

.dashboard-habit-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
}

.dashboard-habit-main strong,
.dashboard-habit-main small {
  display: block;
}

.dashboard-habit-main strong {
  overflow: hidden;
  color: var(--workbench-text);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-habit-main small,
.dashboard-status-link small,
.dashboard-status-link em,
.dashboard-ai-entry span {
  color: var(--workbench-text-muted);
  font-size: 0.68rem;
  line-height: 1.5;
}

.dashboard-check-button {
  border: 1px solid var(--workbench-border);
  border-radius: 0.7rem;
  background: var(--workbench-surface);
  color: var(--workbench-text-muted);
  padding: 0.4rem 0.65rem;
  font-size: 0.68rem;
}

.dashboard-check-button.is-completed {
  border-color: #86efac;
  color: #15803d;
}

.dashboard-status-divider {
  height: 1px;
  margin: 1rem 0 0.35rem;
  background: var(--workbench-border);
}

.dashboard-status-link {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 0;
  border-bottom: 1px solid var(--workbench-border);
  background: transparent;
  padding: 0.75rem 0;
  text-align: left;
}

.dashboard-status-link small,
.dashboard-status-link strong,
.dashboard-status-link em {
  display: block;
}

.dashboard-status-link strong {
  overflow: hidden;
  margin-top: 0.2rem;
  color: var(--workbench-text);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-status-link em {
  overflow: hidden;
  margin-top: 0.2rem;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-ai-entry {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) - 0.2rem);
  background: var(--workbench-surface-muted);
  padding: 0.9rem;
}

.dashboard-ai-entry strong,
.dashboard-ai-entry span {
  display: block;
}

.dashboard-ai-entry strong {
  margin-top: 0.35rem;
  color: var(--workbench-text);
  font-size: 0.78rem;
}

.dashboard-ai-entry span {
  margin-top: 0.25rem;
}

.dashboard-ai-reply {
  margin-top: 0.7rem;
  color: var(--workbench-text-muted);
  font-size: 0.76rem;
  line-height: 1.7;
}

.dashboard-empty {
  display: grid;
  gap: 0.8rem;
  color: var(--workbench-text-muted);
  font-size: 0.82rem;
}
</style>
