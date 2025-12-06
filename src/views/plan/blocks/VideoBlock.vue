<template>
  <div class="relative group video-block">
    <!-- 视频显示区域 -->
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
      
      <!-- 视频容器 -->
      <div 
        class="relative overflow-hidden transition-all duration-200"
        :class="getVideoContainerClass()"
        @click="showStyleToolbar = !showStyleToolbar"
      >
        <video 
          :src="model.url" 
          class="w-full h-full object-cover transition-all duration-200"
          :class="getVideoClass()"
          controls
          preload="metadata"
        ></video>
        
        <!-- 视频标题覆盖层 -->
        <div 
          v-if="model.title" 
          class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {{ model.title }}
        </div>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div 
      v-else
      class="min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 cursor-pointer"
      @click="triggerFileInput"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'border-blue-400 bg-blue-50 dark:bg-blue-900/10': isDragOver }"
    >
      <div class="w-12 h-12 text-gray-400 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽视频到此处或点击上传</p>
      <p class="text-sm text-gray-500 dark:text-gray-500">支持 MP4、WebM、MOV 格式</p>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file" 
      accept="video/*" 
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
import { uploadVideo } from '@/api/uploads.js'

const props = defineProps({ 
  modelValue: { 
    type: Object, 
    default: () => ({ 
      url: '', 
      title: '', 
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
    description: '视频占满整个容器宽度'
  },
  {
    value: 'centered',
    label: '居中显示',
    icon: 'CenteredIcon',
    description: '视频居中显示，保持原始比例'
  },
  {
    value: 'left-aligned',
    label: '左对齐',
    icon: 'LeftAlignedIcon',
    description: '视频左对齐，适合图文混排'
  },
  {
    value: 'right-aligned',
    label: '右对齐',
    icon: 'RightAlignedIcon',
    description: '视频右对齐，适合图文混排'
  },
  {
    value: 'thumbnail',
    label: '缩略图',
    icon: 'ThumbnailIcon',
    description: '小尺寸缩略图显示'
  }
]

// 图标组件
const FullWidthIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }
const CenteredIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>' }
const LeftAlignedIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h8" /></svg>' }
const RightAlignedIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h8" /></svg>' }
const ThumbnailIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>' }

// 获取视频容器样式类
const getVideoContainerClass = () => {
  const style = model.value.displayStyle || 'full-width'
  switch (style) {
    case 'centered':
      return 'max-w-4xl mx-auto rounded-lg'
    case 'left-aligned':
      return 'max-w-2xl rounded-lg'
    case 'right-aligned':
      return 'max-w-2xl ml-auto rounded-lg'
    case 'thumbnail':
      return 'max-w-xs mx-auto rounded-lg'
    default:
      return 'w-full rounded-lg'
  }
}

// 获取视频样式类
const getVideoClass = () => {
  const style = model.value.displayStyle || 'full-width'
  switch (style) {
    case 'centered':
      return 'max-h-[600px] object-contain'
    case 'left-aligned':
      return 'max-h-[400px] object-contain'
    case 'right-aligned':
      return 'max-h-[400px] object-contain'
    case 'thumbnail':
      return 'max-h-[200px] object-cover'
    default:
      return 'max-h-[600px] object-cover'
  }
}

// 设置显示样式
const setDisplayStyle = (style) => {
  model.value = { ...model.value, displayStyle: style }
  showStyleToolbar.value = false
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
  const videoFile = files.find(file => file.type.startsWith('video/'))
  
  if (videoFile) {
    await uploadFile(videoFile)
  }
}

// 上传文件
const uploadFile = async (file) => {
  if (!file) return
  
  // 先本地预览
  const localUrl = URL.createObjectURL(file)
  model.value = { ...model.value, url: localUrl }
  
  // 后端上传
  try {
    const res = await uploadVideo(file, (p) => progress.value = p)
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


