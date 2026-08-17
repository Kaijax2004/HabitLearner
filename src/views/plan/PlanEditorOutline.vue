<template>
  <aside class="plan-editor-rail plan-editor-outline-rail">
    <div class="plan-rail-heading">
      <span class="plan-rail-eyebrow">Document</span>
      <strong>大纲</strong>
    </div>
    <div v-if="outlineItems.length" class="plan-outline-list">
      <button
        v-for="item in outlineItems"
        :key="item.id"
        type="button"
        class="plan-outline-item"
        :class="`plan-outline-level-${item.level}`"
        @click="$emit('scroll-to-block', item.id)"
      >
        <span class="plan-outline-dot"></span>
        <span class="truncate">{{ item.label }}</span>
      </button>
    </div>
    <div v-else class="plan-rail-empty">输入标题块后，这里会自动生成文档大纲。</div>
  </aside>
</template>

<script setup>
defineProps({
  outlineItems: { type: Array, default: () => [] }
})

defineEmits(['scroll-to-block'])
</script>

<style>
.plan-editor-rail {
  position: sticky;
  top: 6.3rem;
  display: grid;
  gap: 1rem;
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.86);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.66);
  padding: 1rem;
}

.dark .plan-editor-rail {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(18, 18, 20, 0.66);
}

.plan-rail-heading {
  display: grid;
  gap: 0.35rem;
}

.plan-rail-heading strong {
  color: rgb(24 24 27);
  font-size: 1rem;
  letter-spacing: -0.03em;
}

.dark .plan-rail-heading strong {
  color: white;
}

.plan-rail-eyebrow {
  color: rgb(113 113 122);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.plan-outline-list {
  display: grid;
  gap: 0.2rem;
}

.plan-outline-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.7rem;
  background: transparent;
  color: rgb(82 82 91);
  padding: 0.52rem 0.45rem;
  text-align: left;
  font-size: 0.75rem;
  transition: background 150ms ease, color 150ms ease;
}

.plan-outline-item:hover {
  background: rgba(228, 228, 231, 0.72);
  color: rgb(24 24 27);
}

.dark .plan-outline-item {
  color: rgb(212 212 216);
}

.dark .plan-outline-item:hover {
  background: rgba(63, 63, 70, 0.72);
  color: white;
}

.plan-outline-level-2 {
  padding-left: 0.85rem;
}

.plan-outline-level-3 {
  padding-left: 1.3rem;
}

.plan-outline-dot {
  width: 0.32rem;
  height: 0.32rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgb(161 161 170);
}

.plan-rail-empty {
  color: rgb(161 161 170);
  font-size: 0.73rem;
  line-height: 1.65;
}

@media (max-width: 1023px) {
  .plan-editor-outline-rail {
    display: none;
  }
}
</style>
