<template>
  <AppLayout title="微学习" :show-back-button="true">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- 课程选择板块 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">推荐课程</h2>
          <button
            @click="showUploadModal = true"
            class="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-150"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-sm font-medium">上传视频</span>
          </button>
        </div>

        <!-- 课程分类选择 -->
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            v-for="category in courseCategories"
            :key="category.id"
            @click="selectedCategory = category.id"
            class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            :class="[
              selectedCategory === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- 课程列表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            @click="goToVideoPage(course)"
            class="card-apple cursor-pointer hover:shadow-apple-md transition-all duration-200 group"
          >
            <div class="aspect-video bg-gradient-to-br from-primary-500 to-primary-600 rounded-apple mb-4 flex items-center justify-center relative overflow-hidden">
              <div class="text-center text-white z-10">
                <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                  <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p class="text-sm font-semibold">{{ course.duration }}</p>
              </div>
              <!-- 渐变遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div class="px-1">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {{ course.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed line-clamp-2">
                {{ course.description }}
              </p>
              
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {{ course.category }}
                </span>
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ course.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 上传视频弹窗 -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">上传学习视频</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">视频标题</label>
            <input
              v-model="uploadForm.title"
              type="text"
              placeholder="请输入视频标题"
              class="input-apple w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">视频描述</label>
            <textarea
              v-model="uploadForm.description"
              placeholder="请描述视频内容"
              class="input-apple w-full h-20 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">选择视频文件</label>
            <input
              type="file"
              accept="video/*"
              @change="handleVideoUpload"
              class="input-apple w-full"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">支持MP4、AVI等格式，大小不超过100MB</p>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-apple p-3">
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                <p class="font-medium mb-1">内容要求</p>
                <p>请确保上传的视频内容积极正向，与学习相关。我们将审核您的内容，审核通过后会在推荐课程中显示。</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="showUploadModal = false"
            class="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            @click="uploadVideo"
            class="btn-primary flex-1"
          >
            上传
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const router = useRouter()
const { success, error, warning } = useToast()

// 响应式数据
const isCompleted = ref(false)
const showUploadModal = ref(false)
const selectedCategory = ref('all')
const selectedCourse = ref(null)

// 上传表单
const uploadForm = ref({
  title: '',
  description: '',
  file: null
})

// 响应式数据
const courseCategories = ref([
  { id: 'all', name: '全部' }
])
const courses = ref([])
const isLoading = ref(false)

// 计算属性
const filteredCourses = computed(() => {
  if (selectedCategory.value === 'all') {
    return courses.value
  }
  return courses.value.filter(course => course.categoryId === selectedCategory.value)
})

// 方法
const goToVideoPage = (course) => {
  // 跳转到视频详情页面
  router.push(`/learning/video/${course.id}`)
}

// 加载数据
const loadData = async () => {
  isLoading.value = true
  try {
    // 加载课程分类
    const categoriesResponse = await learningAPI.getCourseCategories()
    if (categoriesResponse.success) {
      courseCategories.value = [
        { id: 'all', name: '全部' },
        ...categoriesResponse.data
      ]
    }
    
    // 加载课程列表
    const coursesResponse = await learningAPI.getCourses()
    if (coursesResponse.success) {
      courses.value = coursesResponse.data.courses || []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 100 * 1024 * 1024) {
      warning('视频大小不能超过100MB')
      return
    }
    uploadForm.value.file = file
  }
}

const uploadVideo = async () => {
  if (!uploadForm.value.title.trim() || !uploadForm.value.description.trim() || !uploadForm.value.file) {
    warning('请填写完整信息并选择视频文件')
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('title', uploadForm.value.title)
    formData.append('description', uploadForm.value.description)
    formData.append('category', selectedCategory.value)
    formData.append('video', uploadForm.value.file)
    
    const response = await learningAPI.uploadVideo(formData)
    
    if (response.success) {
      success('视频上传成功', {
        description: response.data.message || '等待审核'
      })
      showUploadModal.value = false
      
      // 重置表单
      uploadForm.value = {
        title: '',
        description: '',
        file: null
      }
      
      // 重新加载课程列表
      await loadData()
    } else {
      error('视频上传失败', {
        description: response.error || '请重试'
      })
    }
  } catch (error) {
    console.error('上传视频失败:', error)
    error('视频上传失败', {
      description: error.error || '请重试'
    })
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>
