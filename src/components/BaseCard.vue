<template>
  <div
    class="card-apple surface-panel flex flex-col"
    :class="[
      paddingClass,
      shadowClass,
      hoverClass
    ]"
  >
    <div v-if="title || $slots.header" class="mb-4 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h3 v-if="title" class="title-secondary truncate">{{ title }}</h3>
        <slot name="subtitle"></slot>
      </div>
      <slot name="header"></slot>
    </div>

    <div class="flex-1 min-h-0">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'small', 'default', 'large'].includes(value)
  },
  shadow: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'small', 'default', 'large'].includes(value)
  },
  hover: {
    type: Boolean,
    default: true
  }
})

const paddingClass = computed(() => {
  const paddingMap = {
    none: 'p-0',
    small: 'p-3',
    default: 'p-4 sm:p-5',
    large: 'p-6'
  }

  return paddingMap[props.padding]
})

const shadowClass = computed(() => {
  const shadowMap = {
    none: 'shadow-none',
    small: 'shadow-apple',
    default: 'shadow-apple',
    large: 'shadow-apple-lg'
  }

  return shadowMap[props.shadow]
})

const hoverClass = computed(() => {
  return props.hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-md' : ''
})
</script>
