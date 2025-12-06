<template>
  <div class="relative group audio-block">
    <!-- 音频显示区域 -->
    <div v-if="model.url" class="relative">
      <!-- 样式选择工具栏 -->
      <div 
        v-if="showStyleToolbar" 
        class="absolute top-2 right-2 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-20"
      >
        <button 
          v-for="style in displayStyles" 
          :key="style.value"
          @click="setDisplayStyle(style.value)"
          class="w-8 h-8 rounded flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{ 'bg-gray-100 dark:bg-gray-700': model.displayStyle === style.value }"
          :title="style.label"
        >
          <component :is="style.icon" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- 音频容器 -->
      <div 
        class="relative overflow-hidden transition-all duration-200 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        :class="getAudioContainerClass()"
        @click="showStyleToolbar = !showStyleToolbar"
      >
        <div class="flex items-center gap-3">
          <!-- 音频图标 -->
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          
          <!-- 音频信息 -->
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ model.title || '音频文件' }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDuration(model.duration) }}
            </div>
          </div>
        </div>
        
        <!-- 音频播放器 -->
        <audio 
          :src="model.url" 
          class="w-full mt-3"
          controls
          preload="metadata"
          @loadedmetadata="onAudioLoaded"
        ></audio>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div 
      v-else
      class="min-h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 cursor-pointer"
      @click="triggerFileInput"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'border-blue-400 bg-blue-50 dark:bg-blue-900/10': isDragOver }"
    >
      <div class="w-10 h-10 text-gray-400 mb-3">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-1">拖拽音频到此处或点击上传</p>
      <p class="text-sm text-gray-500 dark:text-gray-500">支持 MP3、WAV、OGG 格式</p>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file" 
      accept="audio/*" 
      @change="onFileSelect" 
      class="hidden"
    />
    
    <!-- 上传进度 -->
    <div v-if="progress > 0 && progress < 100" class="mt-4">
      <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="text-sm text-gray-500 mt-2 text-center">上传中 {{ progress }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadAudio } from '@/api/uploads.js'

const props = defineProps({ 
  modelValue: { 
    type: Object, 
    default: () => ({ 
      url: '', 
      title: '', 
      duration: 0,
      displayStyle: 'full-width' 
    }) 
  } 
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const progress = ref(0)
const isDragOver = ref(false)
const showStyleToolbar = ref(false)
const fileInput = ref(null)

// 显示样式选项 - 基于常用设计模式
const displayStyles = [
  {
    value: 'full-width',
    label: '全宽显示',
    icon: 'FullWidthIcon',
    description: '音频播放器占满整个容器宽度'
  },
  {
    value: 'centered',
    label: '居中显示',
    icon: 'CenteredIcon',
    description: '音频播放器居中显示'
  },
  {
    value: 'compact',
    label: '紧凑模式',
    icon: 'CompactIcon',
    description: '紧凑的音频播放器布局'
  },
  {
    value: 'minimal',
    label: '最小模式',
    icon: 'MinimalIcon',
    description: '最小化的音频播放器'
  }
]

// 图标组件
const FullWidthIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }
const CenteredIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>' }
const CompactIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>' }
const MinimalIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h12M4 12h12M4 18h12" /></svg>' }

// 获取音频容器样式类
const getAudioContainerClass = () => {
  const style = model.value.displayStyle || 'full-width'
  switch (style) {
    case 'centered':
      return 'max-w-2xl mx-auto'
    case 'compact':
      return 'max-w-lg mx-auto'
    case 'minimal':
      return 'max-w-sm mx-auto'
    default:
      return 'w-full'
  }
}

// 设置显示样式
const setDisplayStyle = (style) => {
  model.value = { ...model.value, displayStyle: style }
  showStyleToolbar.value = false
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 音频加载完成
const onAudioLoaded = (e) => {
  const duration = e.target.duration
  if (duration && !model.value.duration) {
    model.value = { ...model.value, duration }
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const onFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  await uploadFile(file)
}

// 处理拖拽
const onDragOver = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (e) => {
  e.preventDefault()
  isDragOver.value = false
}

const onDrop = async (e) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer.files)
  const audioFile = files.find(file => file.type.startsWith('audio/'))
  
  if (audioFile) {
    await uploadFile(audioFile)
  }
}

// 上传文件
const uploadFile = async (file) => {
  if (!file) return
  
  // 先本地预览
  const localUrl = URL.createObjectURL(file)
  model.value = { 
    ...model.value, 
    url: localUrl,
    title: file.name.replace(/\.[^/.]+$/, '') // 移除文件扩展名
  }
  
  // 后端上传
  try {
    const res = await uploadAudio(file, (p) => progress.value = p)
    if (res?.success) {
      model.value = { 
        ...model.value, 
        url: res.data.url || res.url || model.value.url 
      }
    }
    progress.value = 100
    setTimeout(() => progress.value = 0, 800)
  } catch (error) {
    console.error('上传失败:', error)
    progress.value = 0
  }
}
</script>

<style scoped>
</style>


