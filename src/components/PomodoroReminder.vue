<template>
  <Teleport to="body">
    <Transition name="pomodoro-reminder">
      <div 
        v-if="isVisible"
        class="pomodoro-reminder-overlay"
        @click="handleOverlayClick"
      >
        <div 
          class="pomodoro-reminder"
          :class="{
            'pomodoro-reminder--light': !isDarkMode,
            'pomodoro-reminder--dark': isDarkMode
          }"
          @click.stop
        >
          <!-- 背景粒子效果 -->
          <div class="particles">
            <div 
              v-for="i in 20" 
              :key="i"
              class="particle"
              :style="getParticleStyle(i)"
            ></div>
          </div>

          <!-- 主要内容 -->
          <div class="pomodoro-reminder__content">
            <!-- 习惯信息 -->
            <div class="habit-info">
              <div class="habit-icon">
                <div 
                  class="icon-container"
                  :style="{ backgroundColor: habit.color + '20' }"
                >
                  <img 
                    v-if="isRenderableMediaUrl(habit.icon)" 
                    :src="resolveMediaUrl(habit.icon)" 
                    alt="习惯图标" 
                    class="icon-image"
                  />
                  <span v-else class="icon-text">{{ habit.icon || '📝' }}</span>
                </div>
              </div>
              
              <div class="habit-details">
                <h2 class="habit-name">{{ habit.name }}</h2>
                <p class="habit-category">{{ habit.category }}</p>
              </div>
            </div>

            <!-- 番茄钟计时器 -->
            <div class="pomodoro-timer">
              <div class="timer-circle">
                <svg class="timer-svg" viewBox="0 0 100 100">
                  <!-- 背景圆环 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    opacity="0.2"
                  />
                  <!-- 进度圆环 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="strokeDashoffset"
                    class="progress-ring"
                    :style="{ 
                      stroke: habit.color,
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%'
                    }"
                  />
                </svg>
                
                <div class="timer-display">
                  <div class="time-text">{{ formatTime(timeLeft) }}</div>
                  <div class="time-label">{{ isBreak ? '休息时间' : '专注时间' }}</div>
                </div>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="pomodoro-controls">
              <button 
                @click="toggleTimer"
                class="control-btn control-btn--primary"
                :class="{ 'control-btn--paused': isPaused }"
              >
                <svg v-if="!isRunning" class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ isRunning ? '暂停' : '开始' }}</span>
              </button>
              
              <button 
                @click="skipSession"
                class="control-btn control-btn--secondary"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>跳过</span>
              </button>
            </div>

            <!-- 完成按钮 -->
            <div class="completion-section">
              <button 
                @click="handleComplete"
                class="complete-btn"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 13l4 4L19 7" />
                </svg>
                <span>完成习惯</span>
              </button>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button 
            @click="handleClose"
            class="pomodoro-reminder__close"
          >
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useHabitStore } from '@/stores/habit'
import { useToast } from '@/composables/useToast'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'

// Props
const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  duration: {
    type: Number,
    default: 25 // 25分钟番茄钟
  }
})

// Emits
const emit = defineEmits(['complete', 'close'])

// Store
const themeStore = useThemeStore()
const habitStore = useHabitStore()
const { success } = useToast()

// 响应式数据
const isVisible = ref(false)
const isRunning = ref(false)
const isPaused = ref(false)
const isBreak = ref(false)
const timeLeft = ref(props.duration * 60) // 转换为秒
const timer = ref(null)
const audioContext = ref(null)

// 计算属性
const isDarkMode = computed(() => themeStore.isDarkMode)
const circumference = computed(() => 2 * Math.PI * 45)
const strokeDashoffset = computed(() => {
  const totalTime = props.duration * 60
  const progress = (totalTime - timeLeft.value) / totalTime
  return circumference.value * (1 - progress)
})

// 方法
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  isPaused.value = false
  
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completeSession()
    }
  }, 1000)
  
  playSound('start')
}

const pauseTimer = () => {
  isRunning.value = false
  isPaused.value = true
  
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  playSound('pause')
}

const skipSession = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  isRunning.value = false
  isPaused.value = false
  
  if (isBreak.value) {
    // 跳过休息，开始新的专注时间
    isBreak.value = false
    timeLeft.value = props.duration * 60
  } else {
    // 跳过专注时间，开始休息
    isBreak.value = true
    timeLeft.value = 5 * 60 // 5分钟休息
  }
  
  playSound('skip')
}

const completeSession = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  isRunning.value = false
  isPaused.value = false
  
  if (isBreak.value) {
    // 休息结束，开始新的专注时间
    isBreak.value = false
    timeLeft.value = props.duration * 60
    playSound('breakEnd')
  } else {
    // 专注时间结束，开始休息
    isBreak.value = true
    timeLeft.value = 5 * 60
    playSound('sessionComplete')
    
    // 显示完成提示
    success('专注时间完成！', {
      description: '休息5分钟后开始下一轮'
    })
  }
}

const handleComplete = async () => {
  try {
    // 播放完成音效
    playSound('habitComplete')
    
    // 执行习惯打卡
    const result = await habitStore.completeHabit(props.habit.id)
    if (result.success) {
      success('习惯完成！', {
        description: `恭喜完成"${props.habit.name}"`
      })
      emit('complete', props.habit)
    }
    
    handleClose()
  } catch (error) {
    console.error('完成习惯失败:', error)
  }
}

const handleClose = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  isVisible.value = false
  emit('close', props.habit)
}

const handleOverlayClick = () => {
  // 点击遮罩不关闭，需要明确操作
}

const getParticleStyle = (index) => {
  const delay = Math.random() * 2
  const duration = 3 + Math.random() * 2
  const size = 2 + Math.random() * 4
  const left = Math.random() * 100
  const top = Math.random() * 100
  
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const playSound = (type) => {
  try {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    switch (type) {
      case 'start':
        oscillator.frequency.setValueAtTime(440, audioContext.value.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.3)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.3)
        break
      case 'pause':
        oscillator.frequency.setValueAtTime(330, audioContext.value.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.2)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.2)
        break
      case 'sessionComplete':
        // 完成音效：上升音阶
        oscillator.frequency.setValueAtTime(523, audioContext.value.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.value.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.value.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.5)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.5)
        break
      case 'habitComplete':
        // 习惯完成音效：胜利音效
        oscillator.frequency.setValueAtTime(523, audioContext.value.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.value.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.value.currentTime + 0.2) // G5
        oscillator.frequency.setValueAtTime(1047, audioContext.value.currentTime + 0.3) // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.8)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.8)
        break
    }
  } catch (error) {
    console.log('音效播放失败:', error)
  }
}

// 生命周期
onMounted(() => {
  isVisible.value = true
  playSound('start')
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})

// 监听时间变化
watch(timeLeft, (newTime) => {
  if (newTime === 0) {
    completeSession()
  }
})
</script>

<style scoped>
/* 番茄钟提醒遮罩 */
.pomodoro-reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 番茄钟提醒主体 */
.pomodoro-reminder {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.4);
  transform: scale(1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pomodoro-reminder--light {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

.pomodoro-reminder--dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: #007AFF;
  border-radius: 50%;
  animation: float 4s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 主要内容 */
.pomodoro-reminder__content {
  position: relative;
  z-index: 2;
  padding: 40px 32px 32px;
  text-align: center;
}

/* 习惯信息 */
.habit-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(0, 122, 255, 0.05);
}

.pomodoro-reminder--dark .habit-info {
  background: rgba(96, 165, 250, 0.1);
}

.habit-icon {
  flex-shrink: 0;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.icon-text {
  font-size: 24px;
  line-height: 1;
}

.habit-details {
  flex: 1;
  text-align: left;
}

.habit-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
}

.pomodoro-reminder--dark .habit-name {
  color: #f1f5f9;
}

.habit-category {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.pomodoro-reminder--dark .habit-category {
  color: #94a3b8;
}

/* 番茄钟计时器 */
.pomodoro-timer {
  margin-bottom: 32px;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  color: #007AFF;
}

.pomodoro-reminder--dark .timer-svg {
  color: #60a5fa;
}

.progress-ring {
  transition: stroke-dashoffset 0.5s ease;
}

.timer-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-text {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}

.pomodoro-reminder--dark .time-text {
  color: #f1f5f9;
}

.time-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.pomodoro-reminder--dark .time-label {
  color: #94a3b8;
}

/* 控制按钮 */
.pomodoro-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-btn:hover::before {
  opacity: 1;
}

.control-btn--primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.control-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 122, 255, 0.4);
}

.control-btn--paused {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
}

.control-btn--paused:hover {
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4);
}

.control-btn--secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
}

.control-btn--secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(107, 114, 128, 0.4);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* 完成按钮 */
.completion-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.pomodoro-reminder--dark .completion-section {
  border-top-color: #334155;
}

.complete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  margin: 0 auto;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
}

/* 关闭按钮 */
.pomodoro-reminder__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 3;
}

.pomodoro-reminder--dark .pomodoro-reminder__close {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.pomodoro-reminder__close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #1e293b;
}

.pomodoro-reminder--dark .pomodoro-reminder__close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
}

.close-icon {
  width: 20px;
  height: 20px;
}

/* 动画 */
.pomodoro-reminder-enter-active,
.pomodoro-reminder-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.pomodoro-reminder-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
}

.pomodoro-reminder-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-30px);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .pomodoro-reminder {
    max-width: 400px;
    margin: 0 20px;
  }
  
  .pomodoro-reminder__content {
    padding: 32px 24px 24px;
  }
  
  .habit-info {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .habit-details {
    text-align: center;
  }
  
  .timer-circle {
    width: 160px;
    height: 160px;
  }
  
  .time-text {
    font-size: 28px;
  }
  
  .pomodoro-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .control-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
