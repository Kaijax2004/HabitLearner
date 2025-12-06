<template>
  <div 
    class="card-apple"
    :class="[
      paddingClass,
      shadowClass,
      hoverClass
    ]"
  >
    <!-- 标题区域 -->
    <div v-if="title || $slots.header" class="flex items-center justify-between mb-4">
      <h3 v-if="title" class="title-secondary">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    
    <!-- 内容区域 -->
    <div class="flex-1">
      <slot></slot>
    </div>
    
    <!-- 底部操作区域 -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-100">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
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

// 计算属性
const paddingClass = computed(() => {
  const paddingMap = {
    none: 'p-0',
    small: 'p-3',
    default: 'p-4',
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
  return props.hover ? 'hover:shadow-apple-md transition-shadow duration-200' : ''
})
</script>
