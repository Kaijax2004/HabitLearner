<template>
  <div class="onboarding-overlay" v-if="showOnboarding">
    <div class="onboarding-container" :class="{ 'slide-in': !isExiting, 'slide-out': isExiting }">
      <div class="onboarding-header">
        <h2>欢迎使用 HabitLearner！</h2>
        <button class="close-btn" @click="completeOnboarding">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="onboarding-slides">
        <div class="slide" v-show="currentSlide === 0">
          <div class="slide-icon">📝</div>
          <h3>创建你的第一个习惯</h3>
          <p>开始记录和跟踪你的日常生活习惯，建立健康的生活方式。</p>
        </div>
        
        <div class="slide" v-show="currentSlide === 1">
          <div class="slide-icon">📊</div>
          <h3>数据分析与统计</h3>
          <p>查看你的习惯养成进度，通过数据了解自己的成长。</p>
        </div>
        
        <div class="slide" v-show="currentSlide === 2">
          <div class="slide-icon">🎯</div>
          <h3>设定目标</h3>
          <p>为每个习惯设定具体的目标和频率，让进步可视化。</p>
        </div>
        
        <div class="slide" v-show="currentSlide === 3">
          <div class="slide-icon">🔔</div>
          <h3>提醒功能</h3>
          <p>设置提醒，再也不会忘记重要的习惯。</p>
        </div>
      </div>
      
      <div class="onboarding-controls">
        <div class="pagination">
          <span 
            v-for="(slide, index) in slides" 
            :key="index"
            class="dot"
            :class="{ 'active': currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
        
        <div class="buttons">
          <button 
            v-if="currentSlide > 0" 
            class="prev-btn" 
            @click="prevSlide"
          >
            上一步
          </button>
          <button 
            v-if="currentSlide < slides.length - 1" 
            class="next-btn" 
            @click="nextSlide"
          >
            下一步
          </button>
          <button 
            v-else 
            class="finish-btn" 
            @click="completeOnboarding"
          >
            开始使用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { getIsNewUser, hasCompletedOnboarding, markOnboardingComplete } from '@/api/index.js'

export default {
  name: 'OnboardingAnimation',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const currentSlide = ref(0)
    const slides = [1, 2, 3, 4] // 4个幻灯片
    const isExiting = ref(false)
    const showOnboarding = ref(false)
    let autoSlideTimer = null
    
    // 自动播放下一张
    const startAutoSlide = () => {
      autoSlideTimer = setInterval(() => {
        if (currentSlide.value < slides.length - 1) {
          nextSlide()
        }
      }, 5000) // 5秒自动切换
    }
    
    const stopAutoSlide = () => {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer)
        autoSlideTimer = null
      }
    }
    
    const nextSlide = () => {
      if (currentSlide.value < slides.length - 1) {
        currentSlide.value++
      }
    }
    
    const prevSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value--
      }
    }
    
    const goToSlide = (index) => {
      currentSlide.value = index
    }
    
    const completeOnboarding = () => {
      isExiting.value = true
      stopAutoSlide()
      
      // 标记引导完成
      markOnboardingComplete()
      
      // 同时将用户标记为非新用户，确保下次登录不会再次显示引导
      setIsNewUser(false)
      console.log('用户已完成引导，新用户状态已重置')
      
      // 动画结束后隐藏
      setTimeout(() => {
        showOnboarding.value = false
        emit('completed')
      }, 300)
    }
    
    onMounted(() => {
      // 检查是否需要显示引导
      if (props.show && !hasCompletedOnboarding()) {
        showOnboarding.value = true
        startAutoSlide()
        console.log('显示引导动画：新用户状态=', getIsNewUser(), '引导完成状态=', hasCompletedOnboarding())
      }
    })
    
    onUnmounted(() => {
      stopAutoSlide()
    })
    
    return {
      currentSlide,
      slides,
      isExiting,
      showOnboarding,
      nextSlide,
      prevSlide,
      goToSlide,
      completeOnboarding
    }
  }
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.onboarding-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.slide-in {
  transform: scale(1) translateY(0);
  animation: slideIn 0.5s ease;
}

.slide-out {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.onboarding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.onboarding-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.onboarding-slides {
  min-height: 200px;
  text-align: center;
  margin-bottom: 30px;
}

.slide {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.slide h3 {
  color: #333;
  font-size: 20px;
  margin-bottom: 10px;
}

.slide p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.onboarding-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background-color: #4CAF50;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.buttons button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.prev-btn {
  background-color: #f0f0f0;
  color: #333;
}

.prev-btn:hover {
  background-color: #e0e0e0;
}

.next-btn {
  background-color: #4CAF50;
  color: white;
}

.next-btn:hover {
  background-color: #45a049;
}

.finish-btn {
  background-color: #2196F3;
  color: white;
  font-weight: 600;
}

.finish-btn:hover {
  background-color: #1976D2;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .onboarding-container {
    padding: 20px;
    margin: 10px;
  }
  
  .onboarding-header h2 {
    font-size: 20px;
  }
  
  .slide-icon {
    font-size: 36px;
  }
  
  .slide h3 {
    font-size: 18px;
  }
}
</style>