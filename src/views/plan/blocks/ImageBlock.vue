<template>
  <div class="relative group image-block">
    <div v-if="model.url" class="space-y-3 rounded-md">
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <img :src="model.url" :alt="model.alt || ''" class="w-full object-cover" :class="imageClass" />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="displayStyle"
          class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="full-width">全宽</option>
          <option value="centered">居中</option>
          <option value="thumbnail">缩略图</option>
        </select>
        <button class="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800" @click="triggerFileInput">
          更换图片
        </button>
        <button class="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30" @click="deleteImage">
          删除图片
        </button>
      </div>

      <input
        :value="alt"
        class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        placeholder="图片说明"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="setAlt"
      />
    </div>

    <div
      v-else
      class="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors duration-200 hover:border-zinc-500 dark:border-gray-600 dark:hover:border-zinc-400"
      :class="{ 'border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20': isDragOver }"
      @click="triggerFileInput"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <svg class="mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm text-gray-600 dark:text-gray-400">点击上传图片，或直接拖入这里</p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">支持 JPG、PNG、GIF、WebP</p>
    </div>

    <div v-if="progress > 0 && progress < 100" class="mt-3">
      <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div class="h-full bg-zinc-900 transition-all duration-300 dark:bg-white" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">上传中 {{ progress }}%</div>
    </div>

    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { uploadImage } from '@/api/uploads.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      url: '',
      alt: '',
      displayStyle: 'full-width'
    })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'delete-block'])

const progress = ref(0)
const isDragOver = ref(false)
const fileInputRef = ref(null)

const model = computed(() => props.modelValue || { url: '', alt: '', displayStyle: 'full-width' })
const displayStyle = computed({
  get: () => model.value.displayStyle || 'full-width',
  set: (value) => emit('update:modelValue', { ...model.value, displayStyle: value })
})
const alt = computed(() => model.value.alt || '')

const imageClass = computed(() => ({
  'max-h-[620px]': displayStyle.value === 'full-width',
  'max-h-[460px] mx-auto': displayStyle.value === 'centered',
  'max-h-[220px] max-w-xs mx-auto': displayStyle.value === 'thumbnail'
}))

const setAlt = (event) => {
  emit('update:modelValue', { ...model.value, alt: event.target.value })
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const deleteImage = () => {
  if (!window.confirm('确定要删除这张图片吗？')) return
  emit('update:modelValue', { url: '', alt: '', displayStyle: 'full-width' })
  emit('delete-block')
}

const uploadFile = async (file) => {
  if (!file) return
  const localUrl = URL.createObjectURL(file)
  emit('update:modelValue', { ...model.value, url: localUrl })

  try {
    const res = await uploadImage(file, (value) => {
      progress.value = value
    })
    if (res?.success) {
      emit('update:modelValue', {
        ...model.value,
        url: res.data?.url || res.url || localUrl
      })
    }
    progress.value = 100
    window.setTimeout(() => {
      progress.value = 0
    }, 600)
  } catch {
    progress.value = 0
  }
}

const onFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (file) await uploadFile(file)
  event.target.value = ''
}

const onDrop = async (event) => {
  isDragOver.value = false
  const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/'))
  if (file) await uploadFile(file)
}
</script>

<style scoped>
</style>
