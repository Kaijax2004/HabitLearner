<template>
  <div
    class="plan-row"
    :data-block-id="String(block.id)"
    :class="{
      'plan-row-active': activeBlockId === block.id,
      'plan-row-selected': selectedBlockIds.has(block.id),
      'plan-row-drop-before': dragState.overIndex === index && dragState.position === 'before' && !dragState.draggingIds.includes(block.id),
      'plan-row-drop-after': dragState.overIndex === index && dragState.position === 'after' && !dragState.draggingIds.includes(block.id),
      'plan-row-drop-merge': dragState.overIndex === index && dragState.position === 'merge' && !dragState.draggingIds.includes(block.id),
      'plan-row-dragging': dragState.draggingIds.includes(block.id)
    }"
    @mouseenter="$emit('hover', block.id, index)"
    @mouseleave="$emit('leave')"
    @click="onRowClick"
    @dragover.capture="onDragOver"
    @drop.capture="onDrop"
  >
    <div class="plan-row-gutter" @mousedown="onGutterMouseDown">
      <div
        class="plan-row-selection-zone"
        title="拖动选择多个块"
        aria-label="拖动选择多个块"
      ></div>
      <button
        type="button"
        class="plan-row-select"
        :class="{
          'opacity-100': hoveredBlockId === block.id || activeBlockId === block.id || selectedBlockIds.has(block.id) || blockSelection.active,
          'plan-row-select-active': selectedBlockIds.has(block.id)
        }"
        title="块操作"
        @click.stop="$emit('open-menu', $event, index, block)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 3.25v9.5M3.25 8h9.5" />
        </svg>
      </button>
      <button
        type="button"
        draggable="true"
        class="plan-row-handle"
        :class="{ 'opacity-100': hoveredBlockId === block.id || activeBlockId === block.id || dragState.draggingId === block.id }"
        @dragstart="$emit('drag-start', $event, index, block)"
        @dragend="$emit('drag-end')"
        @click.stop.prevent="$emit('open-type-menu', index, block)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="5.25" cy="4" r="1.05" />
          <circle cx="10.75" cy="4" r="1.05" />
          <circle cx="5.25" cy="8" r="1.05" />
          <circle cx="10.75" cy="8" r="1.05" />
          <circle cx="5.25" cy="12" r="1.05" />
          <circle cx="10.75" cy="12" r="1.05" />
        </svg>
      </button>
    </div>

    <div class="plan-row-content">
      <component
        :is="resolveBlock(block.type)"
        :key="`${block.id}-${block.type}-${block.content?.level ?? ''}-${block.content?.viewType ?? ''}`"
        :model-value="block.content"
        :all-blocks="allBlocks"
        :plan-title="planTitle"
        :plan-id="planId"
        :block-id="block.id"
        @update:modelValue="$emit('update-content', block, $event)"
        @toggle-complete="$emit('toggle-complete', block)"
        @delete-block="$emit('delete-block', block)"
        @create-new-block="$emit('create-new-block', index)"
        @open-ai="$emit('open-ai', block)"
        @open-slash-menu="$emit('open-slash-menu', $event, index)"
        @change-type="$emit('change-type', block, $event)"
        @insert-blocks="$emit('insert-blocks', index, $event)"
        @focus="$emit('focus', block.id)"
        @blur="$emit('blur', block.id)"
      />
      <slot :block="block" :index="index"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true },
  allBlocks: { type: Array, default: () => [] },
  planTitle: { type: String, default: '' },
  planId: { type: [String, Number, null], default: null },
  resolveBlock: { type: Function, required: true },
  activeBlockId: { type: [String, Number, null], default: null },
  hoveredBlockId: { type: [String, Number, null], default: null },
  selectedBlockIds: { type: Object, default: () => new Set() },
  blockSelection: { type: Object, default: () => ({}) },
  dragState: { type: Object, default: () => ({ draggingIds: [] }) }
})

const emit = defineEmits([
  'hover',
  'leave',
  'drag-over',
  'drop',
  'begin-selection',
  'drag-start',
  'drag-end',
  'open-menu',
  'open-type-menu',
  'row-click',
  'update-content',
  'toggle-complete',
  'delete-block',
  'create-new-block',
  'open-ai',
  'open-slash-menu',
  'change-type',
  'insert-blocks',
  'focus',
  'blur'
])

const onGutterMouseDown = (event) => {
  if (event.button !== 0 || event.target?.closest?.('button')) return
  emit('begin-selection', event, props.index)
}

const onRowClick = (event) => {
  emit('row-click', event, props.index, props.block)
}

const isBlockDrag = (event) => Boolean(
  props.dragState?.draggingId
  && event?.dataTransfer?.types?.includes?.('application/x-habitlearner-blocks')
)

const onDragOver = (event) => {
  if (!isBlockDrag(event)) return
  event.preventDefault()
  emit('drag-over', event, props.index)
}

const onDrop = (event) => {
  if (!isBlockDrag(event)) return
  event.preventDefault()
  event.stopPropagation()
  emit('drop', props.index, event)
}
</script>

<style>
.plan-row {
  position: relative;
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  min-width: 0;
  border-radius: 0.8rem;
  transition: background 150ms ease, box-shadow 150ms ease;
}

.plan-row:hover,
.plan-row-active {
  background: rgba(244, 244, 245, 0.62);
}

.dark .plan-row:hover,
.dark .plan-row-active {
  background: rgba(39, 39, 42, 0.58);
}

.plan-row-selected {
  background: rgba(228, 228, 231, 0.72);
  box-shadow: inset 0 0 0 1px rgba(113, 113, 122, 0.35);
}

.dark .plan-row-selected {
  background: rgba(63, 63, 70, 0.68);
}

.plan-row-gutter {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.2rem;
  padding-top: 0.55rem;
  padding-right: 0.35rem;
  user-select: none;
}

.plan-row-selection-zone {
  width: 0.7rem;
  min-height: 1.45rem;
  cursor: crosshair;
}

.plan-row-select,
.plan-row-handle {
  display: grid;
  width: 1.45rem;
  height: 1.45rem;
  place-items: center;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: #a1a1aa;
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms ease, background 150ms ease;
}

.plan-row:hover .plan-row-select,
.plan-row:hover .plan-row-handle,
.plan-row-active .plan-row-select,
.plan-row-active .plan-row-handle,
.plan-row-selected .plan-row-select,
.plan-row-selected .plan-row-handle {
  opacity: 1;
}

.plan-row-select:hover,
.plan-row-handle:hover {
  background: rgba(228, 228, 231, 0.8);
}

.dark .plan-row-select:hover,
.dark .plan-row-handle:hover {
  background: rgba(63, 63, 70, 0.8);
}

.plan-row-handle {
  cursor: grab;
}

.plan-row-handle:active {
  cursor: grabbing;
}

.plan-row-select svg,
.plan-row-handle svg {
  width: 0.95rem;
  height: 0.95rem;
}

.plan-row-select svg {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.plan-row-handle svg {
  fill: currentColor;
}

.plan-row-select-active {
  color: #18181b;
}

.dark .plan-row-select-active {
  color: white;
}

.plan-row-select-active svg {
  stroke-width: 2.1;
}

.plan-row-content {
  min-width: 0;
  padding: 0.2rem 0;
}

.plan-row-drop-before::before,
.plan-row-drop-after::after,
.plan-row-drop-merge::after {
  position: absolute;
  right: 0.35rem;
  left: 0.35rem;
  height: 2px;
  border-radius: 999px;
  background: #18181b;
  content: '';
}

.plan-row-drop-before::before {
  top: -1px;
}

.plan-row-drop-after::after {
  bottom: -1px;
}

.plan-row-drop-merge {
  background: rgba(228, 228, 231, 0.86);
  box-shadow: inset 0 0 0 2px rgba(82, 82, 91, 0.35);
}

.plan-row-drop-merge::after {
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  background: rgba(82, 82, 91, 0.7);
}

.dark .plan-row-drop-before::before,
.dark .plan-row-drop-after::after,
.dark .plan-row-drop-merge {
  background: white;
}

.dark .plan-row-drop-merge {
  background: rgba(63, 63, 70, 0.9);
  box-shadow: inset 0 0 0 2px rgba(212, 212, 216, 0.4);
}

.dark .plan-row-drop-merge::after {
  background: rgba(228, 228, 231, 0.78);
}

.plan-row-dragging {
  opacity: 0.45;
}
</style>
