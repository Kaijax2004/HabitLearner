<template>
  <Teleport to="body">
    <Transition name="reminder-notification">
      <div 
        v-if="isVisible"
        class="reminder-notification-overlay"
        @click="handleOverlayClick"
      >
        <div 
          class="reminder-notification"
          :class="{
            'reminder-notification--light': !isDarkMode,
            'reminder-notification--dark': isDarkMode
          }"
          @click.stop
        >
          <!-- 背景动画 -->
          <div class="reminder-notification__bg-animation">
            <div class="pulse-ring"></div>
            <div class="pulse-ring delay-1"></div>
            <div class="pulse-ring delay-2"></div>
          </div>

          <!-- 主要内容 -->
          <div class="reminder-notification__content">
            <!-- 习惯图标 -->
            <div class="reminder-notification__icon">
              <div 
                class="icon-container"
                :style="{ backgroundColor: habit.color + '20' }"
              >
                <!-- 如果是图片URL -->
                <img 
                  v-if="habit.icon && (habit.icon.startsWith('data:image') || habit.icon.startsWith('http'))" 
                  :src="habit.icon" 
                  alt="习惯图标" 
                  class="icon-image"
                />
                <!-- 如果是文字图标 -->
                <span v-else class="icon-text">{{ habit.icon || '📝' }}</span>
              </div>
            </div>

            <!-- 提醒内容 -->
            <div class="reminder-notification__text">
              <h3 class="reminder-title">{{ habit.name }}</h3>
              <p class="reminder-message">该完成你的习惯了！</p>
              <div class="reminder-time">
                <svg class="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ formatTime(reminderTime) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="reminder-notification__actions">
              <button 
                @click="handleComplete"
                class="action-btn action-btn--complete"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 13l4 4L19 7" />
                </svg>
                <span>完成</span>
              </button>
              
              <button 
                @click="handleSnooze"
                class="action-btn action-btn--snooze"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>稍后提醒</span>
              </button>
              
              <button 
                @click="handleDismiss"
                class="action-btn action-btn--dismiss"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>忽略</span>
              </button>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button 
            @click="handleDismiss"
            class="reminder-notification__close"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useHabitStore } from '@/stores/habit'
import { useToast } from '@/composables/useToast'

// Props
const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  reminderTime: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['complete', 'snooze', 'dismiss'])

// Store
const themeStore = useThemeStore()
const habitStore = useHabitStore()
const { success } = useToast()

// 响应式数据
const isVisible = ref(false)
const audioContext = ref(null)
const notificationSound = ref(null)

// 计算属性
const isDarkMode = computed(() => themeStore.isDarkMode)

// 方法
const formatTime = (time) => {
  return time || '现在'
}

const handleComplete = async () => {
  try {
    // 播放完成音效
    playSound('complete')
    
    // 执行习惯打卡
    const result = await habitStore.completeHabit(props.habit.id)
    if (result.success) {
      success('习惯完成！', {
        description: `恭喜完成"${props.habit.name}"`
      })
      emit('complete', props.habit)
    }
    
    handleDismiss()
  } catch (error) {
    console.error('完成习惯失败:', error)
  }
}

const handleSnooze = () => {
  // 播放稍后提醒音效
  playSound('snooze')
  
  // 5分钟后再次提醒
  setTimeout(() => {
    showNotification()
  }, 5 * 60 * 1000)
  
  emit('snooze', props.habit)
  handleDismiss()
}

const handleDismiss = () => {
  isVisible.value = false
  emit('dismiss', props.habit)
}

const handleOverlayClick = () => {
  // 点击遮罩不关闭，需要明确操作
}

const showNotification = () => {
  isVisible.value = true
  playSound('notification')
  
  // 如果支持浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`习惯提醒 - ${props.habit.name}`, {
      body: '该完成你的习惯了！',
      icon: '/favicon.ico',
      tag: `habit-${props.habit.id}`
    })
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
    
    // 根据类型设置不同的音效
    switch (type) {
      case 'notification':
        oscillator.frequency.setValueAtTime(800, audioContext.value.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.value.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.3)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.3)
        break
      case 'complete':
        oscillator.frequency.setValueAtTime(523, audioContext.value.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.value.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.value.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.5)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.5)
        break
      case 'snooze':
        oscillator.frequency.setValueAtTime(400, audioContext.value.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.2)
        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + 0.2)
        break
    }
  } catch (error) {
    console.log('音效播放失败:', error)
  }
}

// 生命周期
onMounted(() => {
  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  
  // 显示通知
  showNotification()
})

onUnmounted(() => {
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>

<style scoped>
/* 提醒通知遮罩 */
.reminder-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 提醒通知主体 */
.reminder-notification {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reminder-notification--light {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

.reminder-notification--dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
}

/* 背景动画 */
.reminder-notification__bg-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  pointer-events: none;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid #007AFF;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 主要内容 */
.reminder-notification__content {
  position: relative;
  z-index: 2;
  padding: 32px 24px 24px;
  text-align: center;
}

/* 习惯图标 */
.reminder-notification__icon {
  margin-bottom: 20px;
}

.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.icon-text {
  font-size: 32px;
  line-height: 1;
}

/* 提醒文本 */
.reminder-notification__text {
  margin-bottom: 24px;
}

.reminder-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.reminder-notification--dark .reminder-title {
  color: #f1f5f9;
}

.reminder-message {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.reminder-notification--dark .reminder-message {
  color: #94a3b8;
}

.reminder-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #007AFF;
  font-weight: 500;
}

.reminder-notification--dark .reminder-time {
  color: #60a5fa;
}

.time-icon {
  width: 16px;
  height: 16px;
}

/* 操作按钮 */
.reminder-notification__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-btn:hover::before {
  opacity: 1;
}

.action-btn--complete {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn--complete:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.action-btn--snooze {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn--snooze:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.action-btn--dismiss {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn--dismiss:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* 关闭按钮 */
.reminder-notification__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
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

.reminder-notification--dark .reminder-notification__close {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.reminder-notification__close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #1e293b;
}

.reminder-notification--dark .reminder-notification__close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* 动画 */
.reminder-notification-enter-active,
.reminder-notification-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reminder-notification-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.reminder-notification-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .reminder-notification {
    max-width: 320px;
    margin: 0 20px;
  }
  
  .reminder-notification__content {
    padding: 24px 20px 20px;
  }
  
  .icon-container {
    width: 64px;
    height: 64px;
  }
  
  .icon-text {
    font-size: 24px;
  }
  
  .reminder-title {
    font-size: 18px;
  }
  
  .reminder-notification__actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
