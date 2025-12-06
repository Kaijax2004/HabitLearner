<template>
  <div class="relative group image-block">
    <!-- 图片显示区域 -->
    <div v-if="model.url" class="relative">
      <!-- 编辑工具栏 -->
      <div 
        v-if="showEditToolbar" 
        class="absolute top-2 right-2 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-20"
      >
        <!-- 样式选择按钮 -->
        <button 
          @click="showStyleSelector = !showStyleSelector"
          class="w-8 h-8 rounded flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="选择样式"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </button>
        
        <!-- 编辑描述按钮 -->
        <button 
          @click="editDescription"
          class="w-8 h-8 rounded flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="编辑描述"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <!-- 删除按钮 -->
        <button 
          @click="deleteImage"
          class="w-8 h-8 rounded flex items-center justify-center text-xs hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          title="删除图片"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <!-- 样式选择器 -->
      <div 
        v-if="showStyleSelector" 
        class="absolute top-12 right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-30 min-w-[200px]"
      >
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">选择样式</div>
        <div class="grid grid-cols-2 gap-1">
          <button 
            v-for="style in displayStyles" 
            :key="style.value"
            @click="setDisplayStyle(style.value)"
            class="p-2 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            :class="{ 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': model.displayStyle === style.value }"
          >
            <div class="font-medium">{{ style.label }}</div>
            <div class="text-gray-500 dark:text-gray-400">{{ style.description }}</div>
          </button>
        </div>
      </div>
      
      <!-- 图片容器 -->
      <div 
        class="relative overflow-hidden transition-all duration-200 group"
        :class="getImageContainerClass()"
        @click="showEditToolbar = !showEditToolbar"
      >
        <!-- 拖拽调整大小手柄 -->
        <div 
          v-if="showEditToolbar"
          class="absolute bottom-2 right-2 w-4 h-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          @mousedown="startResize"
        >
          <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        
        <img 
          :src="model.url" 
          :alt="model.alt || ''" 
          class="w-full h-full object-cover transition-all duration-200"
          :class="getImageClass()"
          :style="getImageStyle()"
        />
        
        <!-- 图片描述编辑 -->
        <div 
          v-if="editingDescription" 
          class="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2"
        >
          <input 
            v-model="tempDescription"
            class="w-full bg-transparent outline-none text-sm"
            placeholder="输入图片描述..."
            @blur="saveDescription"
            @keydown.enter="saveDescription"
            @keydown.escape="cancelEditDescription"
            ref="descriptionInput"
          />
        </div>
        
        <!-- 图片信息覆盖层 -->
        <div 
          v-else-if="model.alt" 
          class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {{ model.alt }}
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽图片到此处或点击上传</p>
      <p class="text-sm text-gray-500 dark:text-gray-500">支持 JPG、PNG、GIF 格式</p>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file" 
      accept="image/*" 
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
import { ref, computed, nextTick } from 'vue'
import { uploadImage } from '@/api/uploads.js'
import { useModal } from '@/composables/useModal'

// 智能图片压缩 - 保持原始尺寸，优化文件大小
const compressImage = (file) => new Promise((resolve) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    // 保持原始尺寸，不进行缩放
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // 绘制原始尺寸图片
    ctx.drawImage(img, 0, 0, img.width, img.height)
    
    // 根据文件大小智能选择压缩质量
    const fileSizeMB = file.size / (1024 * 1024)
    let quality = 0.95 // 默认高质量
    
    if (fileSizeMB > 5) {
      quality = 0.85 // 大文件适当压缩
    } else if (fileSizeMB > 2) {
      quality = 0.90 // 中等文件轻微压缩
    }
    
    // 根据图片格式选择输出格式
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    
    canvas.toBlob((blob) => {
      resolve(new File([blob], file.name, { type: blob.type }))
    }, outputType, quality)
  }
  img.src = url
})

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
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const { showConfirm } = useModal()

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const progress = ref(0)
const isDragOver = ref(false)
const showEditToolbar = ref(false)
const showStyleSelector = ref(false)
const editingDescription = ref(false)
const tempDescription = ref('')
const fileInput = ref(null)
const descriptionInput = ref(null)
const isResizing = ref(false)
const resizeStartX = ref(0)
const resizeStartY = ref(0)
const resizeStartWidth = ref(0)
const resizeStartHeight = ref(0)

// 显示样式选项 - 基于常用设计模式
const displayStyles = [
  {
    value: 'full-width',
    label: '全宽显示',
    icon: 'FullWidthIcon',
    description: '图片占满整个容器宽度'
  },
  {
    value: 'centered',
    label: '居中显示',
    icon: 'CenteredIcon',
    description: '图片居中显示，保持原始比例'
  },
  {
    value: 'left-aligned',
    label: '左对齐',
    icon: 'LeftAlignedIcon',
    description: '图片左对齐，适合图文混排'
  },
  {
    value: 'right-aligned',
    label: '右对齐',
    icon: 'RightAlignedIcon',
    description: '图片右对齐，适合图文混排'
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
const ThumbnailIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' }

// 获取图片容器样式类
const getImageContainerClass = () => {
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

// 获取图片样式类
const getImageClass = () => {
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
  showStyleSelector.value = false
}

// 编辑描述
const editDescription = () => {
  tempDescription.value = model.value.alt || ''
  editingDescription.value = true
  nextTick(() => {
    descriptionInput.value?.focus()
  })
}

// 保存描述
const saveDescription = () => {
  model.value = { ...model.value, alt: tempDescription.value }
  editingDescription.value = false
}

// 取消编辑描述
const cancelEditDescription = () => {
  editingDescription.value = false
  tempDescription.value = ''
}

// 删除图片
const deleteImage = async () => {
  // 使用统一的确认弹窗
  const confirmed = await showConfirm({
    title: '删除图片',
    message: '确定要删除这张图片吗？',
    type: 'warning'
  })
  
  if (confirmed) {
    model.value = { url: '', alt: '', displayStyle: 'full-width' }
    showEditToolbar.value = false
    emit('delete-block')
  }
}

// 获取图片样式
const getImageStyle = () => {
  const style = {}
  if (model.value.customWidth) {
    style.width = model.value.customWidth + 'px'
  }
  if (model.value.customHeight) {
    style.height = model.value.customHeight + 'px'
  }
  return style
}

// 开始调整大小
const startResize = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing.value = true
  resizeStartX.value = e.clientX
  resizeStartY.value = e.clientY
  
  const img = e.target.closest('.group').querySelector('img')
  const rect = img.getBoundingClientRect()
  resizeStartWidth.value = rect.width
  resizeStartHeight.value = rect.height
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

// 处理调整大小
const handleResize = (e) => {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - resizeStartX.value
  const deltaY = e.clientY - resizeStartY.value
  
  const newWidth = Math.max(100, resizeStartWidth.value + deltaX)
  const newHeight = Math.max(100, resizeStartHeight.value + deltaY)
  
  model.value = {
    ...model.value,
    customWidth: newWidth,
    customHeight: newHeight
  }
}

// 停止调整大小
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
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
  const imageFile = files.find(file => file.type.startsWith('image/'))
  
  if (imageFile) {
    await uploadFile(imageFile)
  }
}

// 上传文件
const uploadFile = async (file) => {
  if (!file) return
  
  // 先本地预览
  const localUrl = URL.createObjectURL(file)
  model.value = { ...model.value, url: localUrl }
  
  // 后端上传（含压缩）
  try {
    const compressed = await compressImage(file).catch(() => file)
    const res = await uploadImage(compressed || file, (p) => progress.value = p)
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


