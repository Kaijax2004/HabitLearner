<template>
  <AppLayout :title="course?.title || '视频详情'" :show-back-button="true">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- 视频播放器区域 -->
      <div class="relative bg-black rounded-apple overflow-hidden">
        <div class="aspect-video bg-gray-800 flex items-center justify-center">
          <!-- 模拟视频播放器 -->
          <div class="text-center">
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p class="text-white/70 text-lg font-medium">点击播放视频</p>
          </div>
        </div>
        
        <!-- 播放控制栏 -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div class="flex items-center space-x-3">
            <button class="text-white hover:text-white/80 transition-colors duration-150">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
            <div class="flex-1">
              <div class="w-full bg-white/30 rounded-full h-1">
                <div class="bg-white h-1 rounded-full transition-all duration-300" style="width: 35%"></div>
              </div>
            </div>
            <span class="text-white/70 text-sm font-medium">2:30 / {{ course?.duration || '7:00' }}</span>
          </div>
        </div>
      </div>

      <!-- 课程信息 -->
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
            {{ course?.title || '高效时间管理' }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ course?.description || '学习如何更好地管理时间，提高工作效率' }}
          </p>
        </div>

        <!-- 课程元信息 -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-600 dark:text-gray-300 font-medium">{{ course?.duration || '7分钟' }}</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
            </svg>
            <span class="text-gray-600 dark:text-gray-300 font-medium">{{ isCompleted ? '已完成' : '未完成' }}</span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {{ course?.category || '时间管理' }}
            </span>
          </div>
        </div>

        <!-- 评分区域 -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-apple p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">课程评分</h3>
            <div class="flex items-center space-x-1">
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ course?.rating || '4.8' }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">({{ totalRatings }}人评价)</span>
            </div>
          </div>
          
          <!-- 用户评分 -->
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">我的评分：</span>
            <div class="flex items-center space-x-1">
              <button
                v-for="star in 5"
                :key="star"
                @click="setRating(star)"
                class="transition-colors duration-150"
              >
                <svg 
                  class="w-6 h-6" 
                  :class="star <= userRating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </div>
            <span v-if="userRating > 0" class="text-sm text-gray-600 dark:text-gray-400">
              {{ userRating }}星
            </span>
          </div>
        </div>
      </div>

      <!-- 课程大纲 -->
      <BaseCard title="课程大纲">
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">时间管理的重要性</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">了解时间管理对个人发展的意义</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">制定优先级</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">学会区分重要和紧急的任务</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">3</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">时间块管理法</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">掌握高效的时间分配技巧</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">4</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">避免时间浪费</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">识别并减少时间浪费的行为</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 课程文字稿 -->
      <BaseCard title="课程文字稿">
        <div class="prose prose-gray dark:prose-invert max-w-none">
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            时间管理是现代生活中非常重要的技能。通过合理规划时间，我们可以提高工作效率，减少压力，获得更好的生活质量。
          </p>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            首先，我们需要学会制定优先级。将任务按照重要性和紧急性进行分类，优先处理重要且紧急的事情。这样可以确保我们在有限的时间内完成最重要的工作。
          </p>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            时间块管理法是一种非常有效的方法。将一天的时间分成不同的块，每个块专注于特定的任务或活动。这种方法可以帮助我们保持专注，提高工作效率。
          </p>
        </div>
      </BaseCard>

      <!-- 课后测验 -->
      <BaseCard title="课后测验">
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">时间管理的第一步是什么？</h4>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <input type="radio" name="quiz1" value="a" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">制定详细计划</span>
              </label>
              <label class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <input type="radio" name="quiz1" value="b" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">制定优先级</span>
              </label>
              <label class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <input type="radio" name="quiz1" value="c" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">购买时间管理工具</span>
              </label>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 完成按钮 -->
      <div class="pt-4">
        <button
          @click="markAsCompleted"
          :disabled="isCompleted"
          class="w-full py-4 bg-primary-500 text-white rounded-apple font-semibold text-lg transition-all duration-200"
          :class="[
            isCompleted 
              ? 'bg-green-500 cursor-not-allowed' 
              : 'hover:bg-primary-600 active:scale-95'
          ]"
        >
          <span v-if="isCompleted" class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            已完成学习
          </span>
          <span v-else>标记为完成</span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()

// 响应式数据
const isCompleted = ref(false)
const userRating = ref(0)
const totalRatings = ref(128)
const course = ref(null)

// 课程数据
const courses = [
  {
    id: 1,
    title: '高效时间管理',
    description: '学习如何更好地管理时间，提高工作效率，掌握时间管理的核心技巧和方法',
    duration: '7分钟',
    category: '时间管理',
    rating: '4.8'
  },
  {
    id: 2,
    title: '专注力训练',
    description: '提升专注力，减少分心，提高学习效率，掌握深度工作的技巧',
    duration: '5分钟',
    category: '效率提升',
    rating: '4.6'
  },
  {
    id: 3,
    title: '健康饮食指南',
    description: '了解营养搭配，养成健康饮食习惯，掌握科学的饮食管理方法',
    duration: '6分钟',
    category: '健康生活',
    rating: '4.7'
  },
  {
    id: 4,
    title: '记忆技巧',
    description: '掌握高效记忆方法，提升学习效果，学会科学的记忆训练技巧',
    duration: '8分钟',
    category: '学习方法',
    rating: '4.9'
  },
  {
    id: 5,
    title: '职场沟通技巧',
    description: '提升职场沟通能力，建立良好人际关系，掌握有效的沟通策略',
    duration: '9分钟',
    category: '职业发展',
    rating: '4.5'
  }
]

// 方法
const setRating = async (rating) => {
  userRating.value = rating
  try {
    const response = await learningAPI.rateCourse(course.value.id, rating)
    if (response.success) {
      course.value.rating = response.data.averageRating
    }
  } catch (error) {
    console.error('评分失败:', error)
  }
}

const markAsCompleted = async () => {
  try {
    const response = await learningAPI.completeCourse(course.value.id)
    if (response.success) {
      isCompleted.value = true
    }
  } catch (error) {
    console.error('标记完成失败:', error)
  }
}

// 加载课程详情
const loadCourse = async () => {
  try {
    const courseId = parseInt(route.params.id)
    const response = await learningAPI.getCourseById(courseId)
    if (response.success) {
      course.value = response.data
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadCourse()
})
</script>
