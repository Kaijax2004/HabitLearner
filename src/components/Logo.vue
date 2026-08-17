<template>
  <div
    class="flex items-center justify-center"
    :class="containerClass"
  >
    <img
      v-if="useCustomLogo && resolvedLogoUrl && !imageLoadError"
      :src="resolvedLogoUrl"
      :alt="alt"
      :class="[imageClass, imageVariantClass]"
      @error="handleImageError"
    />
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
        d="M4 13.2C4.4 7.9 8.8 4 14 4c4.2 0 7.4 2.9 8 6.7M20 14.2C19.2 18 16 20 12 20c-4.2 0-7.3-2.5-8-6.4"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>

    <div v-if="shouldShowText" class="ml-3 flex flex-col">
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

const props = defineProps({
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'mark',
    validator: (value) => ['mark', 'brand'].includes(value)
  },
  useCustomLogo: {
    type: Boolean,
    default: logoConfig.useCustomLogo
  },
  customLogoUrl: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: logoConfig.defaultAlt
  },
  showText: {
    type: Boolean,
    default: false
  },
  showSubtitle: {
    type: Boolean,
    default: false
  },
  brandName: {
    type: String,
    default: '习知'
  },
  subtitle: {
    type: String,
    default: 'HabitLearner'
  },
  onDarkBackground: {
    type: Boolean,
    default: false
  }
})

const imageLoadError = ref(false)

const resolvedLogoUrl = computed(() => {
  if (props.customLogoUrl) return props.customLogoUrl
  return props.variant === 'brand' ? logoConfig.brandLogoUrl : logoConfig.iconLogoUrl
})

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

const imageClass = computed(() => {
  const markSizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
    '4xl': 'w-28 h-28',
    '5xl': 'w-36 h-36'
  }
  const brandSizeClasses = {
    small: 'h-6 w-auto max-w-[8rem]',
    default: 'h-8 w-auto max-w-[10rem]',
    large: 'h-10 w-auto max-w-[13rem]',
    xl: 'h-14 w-auto max-w-[18rem]',
    '2xl': 'h-16 w-auto max-w-[22rem]',
    '3xl': 'h-20 w-auto max-w-[28rem]',
    '4xl': 'h-24 w-auto max-w-[34rem]',
    '5xl': 'h-32 w-auto max-w-[42rem]'
  }
  const sizeClasses = props.variant === 'brand' ? brandSizeClasses : markSizeClasses
  return `${sizeClasses[props.size] || sizeClasses.default} shrink-0 object-contain`
})

const imageVariantClass = computed(() => (
  props.variant === 'brand'
    ? 'rounded-[1.35rem] bg-zinc-950 shadow-[0_14px_32px_rgba(0,0,0,0.16)]'
    : 'rounded-[1rem] bg-zinc-950'
))

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

const shouldShowText = computed(() => props.showText && props.variant !== 'brand')

const handleImageError = () => {
  imageLoadError.value = true
  console.warn('Logo image failed to load, falling back to orbit mark SVG')
}
</script>
