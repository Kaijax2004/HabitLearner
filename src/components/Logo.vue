<template>
  <div
    class="flex items-center justify-center"
    :class="containerClass"
  >
    <!-- 如果有自定义logo图片且未加载失败 -->
    <img
      v-if="useCustomLogo && customLogoUrl && !imageLoadError"
      :src="customLogoUrl"
      :alt="alt"
      :class="imageClass"
      @error="handleImageError"
    />
    <!-- 默认SVG logo -->
    <svg
      v-else
      :class="svgClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
    
    <!-- 品牌文字Logo -->
    <div v-if="showText" class="ml-3 flex flex-col">
      <span class="font-bold" :class="[textSizeClass, onDarkBackground ? 'text-white' : 'text-gray-900 dark:text-white']">
        {{ brandName }}
      </span>
      <span v-if="showSubtitle" class="text-xs font-medium" :class="onDarkBackground ? 'text-gray-300' : 'text-gray-500 dark:text-gray-300'">
        {{ subtitle }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { logoConfig } from '@/config/logo'
import logoSvg from '@/assets/logo.svg'

// Props
const props = defineProps({
  // 尺寸变体
  size: {
    type: String,
    default: 'default', // 'small', 'default', 'large', 'xl', '2xl', '3xl', '4xl', '5xl'
    validator: (value) => ['small', 'default', 'large', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(value)
  },
  // 是否使用自定义logo
  useCustomLogo: {
    type: Boolean,
    default: logoConfig.useCustomLogo
  },
  // 自定义logo URL
  customLogoUrl: {
    type: String,
    default: logoSvg
  },
  // 容器样式类
  containerClass: {
    type: String,
    default: ''
  },
  // 图片alt文本
  alt: {
    type: String,
    default: 'HabitLearner Logo'
  },
  // 是否显示文字
  showText: {
    type: Boolean,
    default: false
  },
  // 是否显示副标题
  showSubtitle: {
    type: Boolean,
    default: false
  },
  // 品牌名称
  brandName: {
    type: String,
    default: '习知'
  },
  // 副标题
  subtitle: {
    type: String,
    default: 'HabitLearner'
  },
  // 是否在深色背景上显示
  onDarkBackground: {
    type: Boolean,
    default: false
  }
})

// 计算属性 - SVG样式类
const svgClass = computed(() => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
    '3xl': 'w-20 h-20',
    '4xl': 'w-24 h-24',
    '5xl': 'w-32 h-32'
  }
  return sizeClasses[props.size] || sizeClasses.default
})

// 计算属性 - 图片样式类
const imageClass = computed(() => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
    '4xl': 'w-28 h-28',
    '5xl': 'w-36 h-36'
  }
  return `${sizeClasses[props.size] || sizeClasses.default} object-cover`
})

// 计算属性 - 文字大小类
const textSizeClass = computed(() => {
  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl'
  }
  return sizeClasses[props.size] || sizeClasses.default
})

// 响应式数据
const imageLoadError = ref(false)

// 方法
const handleImageError = () => {
  imageLoadError.value = true
  console.warn('Logo image failed to load, falling back to default SVG')
}
</script>
