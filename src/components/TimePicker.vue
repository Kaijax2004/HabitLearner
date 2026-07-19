<template>
  <div class="time-picker-container">
    <!-- 时间显示区域 -->
    <div 
      class="time-display"
      :class="{
        'time-display--light': !isDarkMode,
        'time-display--dark': isDarkMode
      }"
      @click="togglePicker"
    >
      <div class="time-display__icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="time-display__text">
        <span class="time-display__time">{{ formattedTime }}</span>
        <span class="time-display__label">提醒时间</span>
      </div>
      <div class="time-display__arrow">
        <svg 
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- 时间选择器弹窗 -->
    <Transition name="time-picker">
      <div 
        v-if="isOpen"
        class="time-picker-overlay"
        @click="closePicker"
      >
        <div 
          class="time-picker-modal"
          :class="{
            'time-picker-modal--light': !isDarkMode,
            'time-picker-modal--dark': isDarkMode
          }"
          @click.stop
        >
          <!-- 头部 -->
          <div class="time-picker-header">
            <h3 class="time-picker-title">选择提醒时间</h3>
            <button 
              type="button"
              @click="closePicker"
              class="time-picker-close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 时间选择器主体 -->
          <div class="time-picker-body">
            <!-- 小时选择器 -->
            <div class="time-column">
              <div class="time-column__label">时</div>
              <div class="time-column__container">
                <div 
                  ref="hourContainer"
                  class="time-column__scroll"
                  @scroll="onHourScroll"
                >
                  <div 
                    v-for="hour in hours" 
                    :key="hour"
                    class="time-item"
                    :class="{
                      'time-item--selected': hour === selectedHour,
                      'time-item--light': !isDarkMode,
                      'time-item--dark': isDarkMode
                    }"
                    @click="selectHour(hour)"
                  >
                    {{ hour.toString().padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 分隔符 -->
            <div class="time-separator">
              <span class="time-separator__dot"></span>
              <span class="time-separator__dot"></span>
            </div>

            <!-- 分钟选择器 -->
            <div class="time-column">
              <div class="time-column__label">分</div>
              <div class="time-column__container">
                <div 
                  ref="minuteContainer"
                  class="time-column__scroll"
                  @scroll="onMinuteScroll"
                >
                  <div 
                    v-for="minute in minutes" 
                    :key="minute"
                    class="time-item"
                    :class="{
                      'time-item--selected': minute === selectedMinute,
                      'time-item--light': !isDarkMode,
                      'time-item--dark': isDarkMode
                    }"
                    @click="selectMinute(minute)"
                  >
                    {{ minute.toString().padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="time-picker-footer">
            <button 
              type="button"
              @click="resetTime"
              class="time-picker-btn time-picker-btn--secondary"
            >
              重置
            </button>
            <button 
              type="button"
              @click="confirmTime"
              class="time-picker-btn time-picker-btn--primary"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Store
const themeStore = useThemeStore()

// 响应式数据
const isOpen = ref(false)
const selectedHour = ref(9)
const selectedMinute = ref(0)
const hourContainer = ref(null)
const minuteContainer = ref(null)

// 计算属性
const isDarkMode = computed(() => themeStore.isDarkMode)

const formattedTime = computed(() => {
  return `${selectedHour.value.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
})

// 生成小时和分钟数组
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

// 方法
const togglePicker = () => {
  if (isOpen.value) {
    closePicker()
  } else {
    openPicker()
  }
}

const openPicker = () => {
  isOpen.value = true
  // 每次打开弹窗时都重新获取当前时间
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  nextTick(() => {
    scrollToSelected()
  })
}

const closePicker = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  isOpen.value = false
}

const selectHour = (hour) => {
  selectedHour.value = hour
  scrollToSelected()
}

const selectMinute = (minute) => {
  selectedMinute.value = minute
  scrollToSelected()
}

const scrollToSelected = () => {
  nextTick(() => {
    if (hourContainer.value) {
      const hourItem = hourContainer.value.querySelector('.time-item--selected')
      if (hourItem) {
        hourItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    if (minuteContainer.value) {
      const minuteItem = minuteContainer.value.querySelector('.time-item--selected')
      if (minuteItem) {
        minuteItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

const onHourScroll = () => {
  // 可以添加滚动时的逻辑
}

const onMinuteScroll = () => {
  // 可以添加滚动时的逻辑
}

const resetTime = (event) => {
  event.preventDefault()
  event.stopPropagation()
  // 重置为当前时间
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  scrollToSelected()
}

const confirmTime = (event) => {
  event.preventDefault()
  event.stopPropagation()
  emit('update:modelValue', formattedTime.value)
  closePicker()
}

// 初始化
const initTime = () => {
  const now = new Date()
  if (props.modelValue && props.modelValue !== '') {
    const [hour, minute] = props.modelValue.split(':').map(Number)
    selectedHour.value = hour || now.getHours()
    selectedMinute.value = minute || now.getMinutes()
  } else {
    // 始终使用当前时间作为默认值
    selectedHour.value = now.getHours()
    selectedMinute.value = now.getMinutes()
  }
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== '') {
    const [hour, minute] = newValue.split(':').map(Number)
    if (hour !== selectedHour.value || minute !== selectedMinute.value) {
      selectedHour.value = hour
      selectedMinute.value = minute
    }
  }
}, { immediate: false })

// 键盘事件处理
const handleKeyDown = (event) => {
  // 只在弹窗打开时处理键盘事件
  if (!isOpen.value) return
  
  // 防止Ctrl+Alt+A等组合键导致的闪屏
  if (event.ctrlKey && event.altKey && event.key === 'a') {
    event.preventDefault()
    event.stopPropagation()
    console.log('🚫 阻止Ctrl+Alt+A组合键')
    return false
  }
  
  // 防止其他可能导致问题的组合键
  if (event.ctrlKey && event.altKey) {
    event.preventDefault()
    event.stopPropagation()
    console.log('🚫 阻止Ctrl+Alt组合键')
    return false
  }
  
  // 防止Ctrl+A全选导致的闪屏
  if (event.ctrlKey && event.key === 'a') {
    event.preventDefault()
    event.stopPropagation()
    console.log('🚫 阻止Ctrl+A组合键')
    return false
  }
  
  // 防止F5刷新页面
  if (event.key === 'F5') {
    event.preventDefault()
    event.stopPropagation()
    console.log('🚫 阻止F5刷新')
    return false
  }
  
  // 防止Ctrl+R刷新页面
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault()
    event.stopPropagation()
    console.log('🚫 阻止Ctrl+R刷新')
    return false
  }
  
  // ESC键关闭弹窗
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closePicker()
  }
  
  // Enter键确认时间
  if (event.key === 'Enter') {
    event.preventDefault()
    event.stopPropagation()
    confirmTime()
  }
}

onMounted(() => {
  initTime()
  
  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown, true)
})

onUnmounted(() => {
  // 清理键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown, true)
})
</script>

<style scoped>
/* 时间选择器容器 */
.time-picker-container {
  position: relative;
  width: 100%;
}

/* 防止闪屏的全局样式 */
.time-picker-container * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 防止键盘快捷键导致的闪屏 */
.time-picker-container:focus-within {
  outline: none;
}

/* 时间显示区域 */
.time-display {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.time-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.time-display:hover::before {
  opacity: 1;
}

.time-display--light {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.time-display--light:hover {
  border-color: #007AFF;
  box-shadow: 0 10px 15px -3px rgba(0, 122, 255, 0.1), 0 4px 6px -2px rgba(0, 122, 255, 0.05);
  transform: translateY(-1px);
}

.time-display--dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.time-display--dark:hover {
  border-color: #60a5fa;
  box-shadow: 0 10px 15px -3px rgba(96, 165, 250, 0.1), 0 4px 6px -2px rgba(96, 165, 250, 0.05);
  transform: translateY(-1px);
}

.time-display__icon {
  margin-right: 12px;
  color: #007AFF;
  transition: color 0.3s ease;
}

.time-display--dark .time-display__icon {
  color: #60a5fa;
}

.time-display__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.time-display__time {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #1e293b;
  transition: color 0.3s ease;
}

.time-display--dark .time-display__time {
  color: #f1f5f9;
}

.time-display__label {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  transition: color 0.3s ease;
}

.time-display--dark .time-display__label {
  color: #94a3b8;
}

.time-display__arrow {
  color: #64748b;
  transition: color 0.3s ease;
}

.time-display--dark .time-display__arrow {
  color: #94a3b8;
}

/* 时间选择器弹窗 */
.time-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.time-picker-modal {
  width: 100%;
  max-width: 320px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.time-picker-modal--light {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

.time-picker-modal--dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
}

/* 头部 */
.time-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid;
}

.time-picker-modal--light .time-picker-header {
  border-bottom-color: #e2e8f0;
}

.time-picker-modal--dark .time-picker-header {
  border-bottom-color: #334155;
}

.time-picker-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.time-picker-modal--dark .time-picker-title {
  color: #f1f5f9;
}

.time-picker-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  cursor: pointer;
}

.time-picker-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.time-picker-modal--dark .time-picker-close:hover {
  background: #334155;
  color: #f1f5f9;
}

/* 时间选择器主体 */
.time-picker-body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.time-column__label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-picker-modal--dark .time-column__label {
  color: #94a3b8;
}

.time-column__container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid;
}

.time-picker-modal--light .time-column__container {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.time-picker-modal--dark .time-column__container {
  border-color: #334155;
  background: #0f172a;
}

.time-column__scroll {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 80px 0;
}

.time-column__scroll::-webkit-scrollbar {
  width: 4px;
}

.time-column__scroll::-webkit-scrollbar-track {
  background: transparent;
}

.time-column__scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.time-picker-modal--dark .time-column__scroll::-webkit-scrollbar-thumb {
  background: #475569;
}

.time-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 8px;
  position: relative;
}

.time-item--light {
  color: #64748b;
}

.time-item--light:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.time-item--light.time-item--selected {
  background: linear-gradient(135deg, #007AFF 0%, #5856d6 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.time-item--dark {
  color: #94a3b8;
}

.time-item--dark:hover {
  background: #334155;
  color: #f1f5f9;
}

.time-item--dark.time-item--selected {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

/* 分隔符 */
.time-separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 8px;
}

.time-separator__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #cbd5e1;
}

.time-picker-modal--dark .time-separator__dot {
  background: #475569;
}

/* 底部按钮 */
.time-picker-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.time-picker-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.time-picker-btn::before {
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

.time-picker-btn:hover::before {
  opacity: 1;
}

.time-picker-btn--secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.time-picker-btn--secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.time-picker-modal--dark .time-picker-btn--secondary {
  background: #334155;
  color: #94a3b8;
  border-color: #475569;
}

.time-picker-modal--dark .time-picker-btn--secondary:hover {
  background: #475569;
  color: #f1f5f9;
}

.time-picker-btn--primary {
  background: linear-gradient(135deg, #007AFF 0%, #5856d6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.time-picker-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.time-picker-modal--dark .time-picker-btn--primary {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.time-picker-modal--dark .time-picker-btn--primary:hover {
  box-shadow: 0 6px 16px rgba(96, 165, 250, 0.4);
}

/* 动画 */
.time-picker-enter-active,
.time-picker-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.time-picker-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.time-picker-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .time-picker-modal {
    max-width: 280px;
    margin: 0 20px;
  }
  
  .time-picker-body {
    padding: 20px;
    gap: 12px;
  }
  
  .time-column__container {
    height: 180px;
  }
  
  .time-item {
    height: 36px;
    font-size: 15px;
  }
}
</style>
