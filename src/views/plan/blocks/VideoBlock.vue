<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div v-if="model.url" class="space-y-3">
      <video :src="displayUrl" controls class="w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900"></video>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-zinc-950" :disabled="isUploading" @click="triggerFileInput">
          {{ isUploading ? '上传中...' : '替换视频' }}
        </button>
        <button type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300" :disabled="isUploading" @click="clearVideo">移除</button>
      </div>
      <input :value="model.title" class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="视频标题" @input="(event) => patch({ title: event.target.value })" />
      <div v-if="uploadError" class="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">{{ uploadError }}</div>
    </div>
    <div
      v-else
      class="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 text-center transition-colors duration-150 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="text-sm text-zinc-600 dark:text-zinc-300">{{ isUploading ? '视频上传中...' : '点击上传视频或拖拽到此处' }}</div>
      <div class="mt-1 text-xs text-zinc-400">支持 MP4、WebM、OGG</div>
      <div v-if="uploadError" class="mt-3 max-w-md rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">{{ uploadError }}</div>
    </div>
    <input ref="fileInputRef" type="file" accept="video/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { uploadVideo } from '@/api/uploads.js'
import { resolveMediaUrl } from '@/utils/media.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ url: '', title: '', mimeType: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const fileInputRef = ref(null)
const localPreviewUrl = ref('')
const isUploading = ref(false)
const uploadError = ref('')
const model = computed(() => props.modelValue || { url: '', title: '', mimeType: '' })
const displayUrl = computed(() => localPreviewUrl.value || resolveMediaUrl(model.value.url || ''))
const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const triggerFileInput = () => fileInputRef.value?.click()

const clearVideo = () => {
  uploadError.value = ''
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  localPreviewUrl.value = ''
  emit('update:modelValue', { url: '', title: '', mimeType: '' })
}

const upload = async (file) => {
  if (!file) return
  uploadError.value = ''
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  localPreviewUrl.value = URL.createObjectURL(file)
  isUploading.value = true

  try {
    const res = await uploadVideo(file)
    if (!res?.success) {
      throw new Error(res?.error || '视频上传失败')
    }
    patch({
      url: res.data?.url || res.data?.path || '',
      title: model.value.title || res.data?.filename || file.name,
      mimeType: res.data?.mimeType || file.type
    })
  } catch (error) {
    uploadError.value = error?.message || '视频上传失败，请稍后重试'
    if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = ''
  } finally {
    isUploading.value = false
  }
}

const onFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (file) await upload(file)
  event.target.value = ''
}

const onDrop = async (event) => {
  const file = Array.from(event.dataTransfer.files || []).find((item) => item.type.startsWith('video/'))
  if (file) await upload(file)
}

onBeforeUnmount(() => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
})
</script>
