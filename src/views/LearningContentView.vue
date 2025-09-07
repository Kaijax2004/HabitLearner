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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const router = useRouter()

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

// 课程分类
const courseCategories = [
  { id: 'all', name: '全部' },
  { id: 'time', name: '时间管理' },
  { id: 'productivity', name: '效率提升' },
  { id: 'health', name: '健康生活' },
  { id: 'learning', name: '学习方法' },
  { id: 'career', name: '职业发展' }
]

// 课程数据
const courses = [
  {
    id: 1,
    title: '高效时间管理',
    description: '学习如何更好地管理时间，提高工作效率',
    duration: '7分钟',
    category: '时间管理',
    rating: '4.8',
    categoryId: 'time'
  },
  {
    id: 2,
    title: '专注力训练',
    description: '提升专注力，减少分心，提高学习效率',
    duration: '5分钟',
    category: '效率提升',
    rating: '4.6',
    categoryId: 'productivity'
  },
  {
    id: 3,
    title: '健康饮食指南',
    description: '了解营养搭配，养成健康饮食习惯',
    duration: '6分钟',
    category: '健康生活',
    rating: '4.7',
    categoryId: 'health'
  },
  {
    id: 4,
    title: '记忆技巧',
    description: '掌握高效记忆方法，提升学习效果',
    duration: '8分钟',
    category: '学习方法',
    rating: '4.9',
    categoryId: 'learning'
  },
  {
    id: 5,
    title: '职场沟通技巧',
    description: '提升职场沟通能力，建立良好人际关系',
    duration: '9分钟',
    category: '职业发展',
    rating: '4.5',
    categoryId: 'career'
  }
]

// 计算属性
const filteredCourses = computed(() => {
  if (selectedCategory.value === 'all') {
    return courses
  }
  return courses.filter(course => course.categoryId === selectedCategory.value)
})

// 方法
const goToVideoPage = (course) => {
  // 跳转到视频详情页面
  router.push(`/learning/video/${course.id}`)
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 100 * 1024 * 1024) {
      alert('视频大小不能超过100MB')
      return
    }
    uploadForm.value.file = file
  }
}

const uploadVideo = () => {
  if (!uploadForm.value.title.trim() || !uploadForm.value.description.trim() || !uploadForm.value.file) {
    alert('请填写完整信息并选择视频文件')
    return
  }
  
  // 这里应该调用API上传视频
  console.log('上传视频:', uploadForm.value)
  alert('视频上传成功，等待审核')
  
  // 重置表单
  uploadForm.value = {
    title: '',
    description: '',
    file: null
  }
  showUploadModal.value = false
}
</script>
