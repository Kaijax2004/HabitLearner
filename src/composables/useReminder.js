import { ref, computed } from 'vue'
import { useHabitStore } from '@/stores/habit'
import { useAuthStore } from '@/stores/auth'

// 全局提醒状态
const activeReminders = ref(new Map())
const reminderQueue = ref([])
const isReminderActive = ref(false)
let reminderInterval = null
let preciseReminderTimeouts = new Map() // 精确提醒定时器

export function useReminder() {
  const habitStore = useHabitStore()
  const authStore = useAuthStore()

  // 检查是否已完成今日首次打卡
  const hasCompletedTodayFirstCheckIn = (habit) => {
    if (!habit.checkIns || !Array.isArray(habit.checkIns)) {
      console.log('📊 习惯无打卡记录:', habit.name)
      return false
    }
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
    console.log('📅 检查今日打卡记录:', {
      habitName: habit.name,
      today: today,
      checkIns: habit.checkIns
    })
    
    // 查找今日的打卡记录
    const todayCheckIn = habit.checkIns.find(checkIn => checkIn.date === today)
    
    if (!todayCheckIn) {
      console.log('❌ 今日无打卡记录:', habit.name)
      return false
    }
    
    // 检查是否有打卡记录（count > 0）
    const hasCheckIn = todayCheckIn.count > 0
    console.log('📊 今日打卡状态:', {
      habitName: habit.name,
      todayCheckIn: todayCheckIn,
      hasCheckIn: hasCheckIn
    })
    
    return hasCheckIn
  }

  // 检查是否有需要提醒的习惯
  const checkReminders = () => {
    console.log('🔔 检查提醒...', {
      isAuthenticated: authStore.isAuthenticated,
      habitsCount: habitStore.habits.length
    })
    
    if (!authStore.isAuthenticated) {
      console.log('❌ 用户未登录，跳过提醒检查')
      return
    }

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    console.log('⏰ 当前时间:', currentTime)
    console.log('📋 习惯列表:', habitStore.habits.map(h => ({
      id: h.id,
      name: h.name,
      reminderEnabled: h.reminderEnabled,
      reminderTime: h.reminderTime
    })))
    
    habitStore.habits.forEach(habit => {
      if (habit.reminderEnabled && habit.reminderTime === currentTime) {
        console.log('🎯 找到需要提醒的习惯:', habit.name, '时间:', habit.reminderTime)
        
        // 检查今天是否已经提醒过
        const reminderKey = `${habit.id}-${now.toDateString()}`
        if (!activeReminders.value.has(reminderKey)) {
          // 检查是否已经完成今日首次打卡
          if (hasCompletedTodayFirstCheckIn(habit)) {
            console.log('✅ 用户已完成今日首次打卡，跳过提醒:', habit.name)
            // 标记为已提醒，避免重复检查
            activeReminders.value.set(reminderKey, true)
          } else {
            console.log('✅ 触发提醒:', habit.name)
            showReminder(habit)
            activeReminders.value.set(reminderKey, true)
          }
        } else {
          console.log('⏭️ 今日已提醒过:', habit.name)
        }
      }
    })
  }

  // 显示提醒
  const showReminder = (habit) => {
    // 避免重复提醒
    if (isReminderActive.value) {
      reminderQueue.value.push(habit)
      return
    }

    isReminderActive.value = true
    
    // 根据用户偏好选择提醒方式
    const reminderType = getReminderType(habit)
    
    switch (reminderType) {
      case 'notification':
        showNotificationReminder(habit)
        break
      case 'pomodoro':
        showPomodoroReminder(habit)
        break
      default:
        showNotificationReminder(habit)
    }
  }

  // 获取提醒类型
  const getReminderType = (habit) => {
    // 可以根据习惯类型或用户设置决定提醒方式
    // 这里简单根据习惯名称判断
    if (habit.name.includes('学习') || habit.name.includes('阅读') || habit.name.includes('工作')) {
      return 'pomodoro'
    }
    return 'notification'
  }

  // 获取图标显示内容
  const getIconDisplay = (icon) => {
    if (!icon) return '📝'
    
    // 如果是图片URL（data:image 或 http）
    if (icon.startsWith('data:image') || icon.startsWith('http')) {
      return `<img src="${icon}" alt="习惯图标" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;" />`
    }
    
    // 如果是文字图标
    return icon
  }

  // 显示通知提醒
  const showNotificationReminder = (habit) => {
    console.log('📱 显示通知提醒:', habit.name)
    
    // 创建简单的提醒弹窗
    const reminderModal = document.createElement('div')
    reminderModal.id = 'reminder-notification'
    reminderModal.innerHTML = `
      <div class="reminder-overlay" style="
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
      ">
        <div class="reminder-modal" style="
          background: white;
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: reminderSlideIn 0.4s ease-out;
        ">
          <div class="habit-icon" style="
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: ${habit.color}20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 20px;
            overflow: hidden;
          ">
            ${getIconDisplay(habit.icon)}
          </div>
          
          <h3 style="
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #1e293b;
          ">${habit.name}</h3>
          
          <p style="
            font-size: 16px;
            color: #64748b;
            margin: 0 0 12px 0;
          ">该完成你的习惯了！</p>
          
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            color: #007AFF;
            font-weight: 500;
            margin-bottom: 24px;
          ">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${habit.reminderTime}</span>
          </div>
          
          <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
          ">
            <button id="complete-btn" style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 12px 16px;
              border-radius: 12px;
              border: none;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            ">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>完成</span>
            </button>
            
            <button id="snooze-btn" style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 12px 16px;
              border-radius: 12px;
              border: none;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            ">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>稍后提醒</span>
            </button>
            
            <button id="dismiss-btn" style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 12px 16px;
              border-radius: 12px;
              border: none;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            ">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>忽略</span>
            </button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes reminderSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      </style>
    `
    
    document.body.appendChild(reminderModal)
    
    // 使用setTimeout确保DOM完全渲染后再添加事件监听器
    setTimeout(() => {
      const completeBtn = document.getElementById('complete-btn')
      const snoozeBtn = document.getElementById('snooze-btn')
      const dismissBtn = document.getElementById('dismiss-btn')
      
      console.log('🔍 查找按钮元素:', {
        completeBtn: !!completeBtn,
        snoozeBtn: !!snoozeBtn,
        dismissBtn: !!dismissBtn
      })
      
      if (completeBtn) {
        completeBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('✅ 用户点击完成')
          // 播放完成音效
          import('@/utils/audioManager.js').then(module => {
            module.default.playSuccessSound()
          })
          handleReminderComplete(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
        })
      }
      
      if (snoozeBtn) {
        snoozeBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('⏰ 用户点击稍后提醒')
          // 播放稍后提醒音效
          import('@/utils/audioManager.js').then(module => {
            module.default.playSnoozeSound()
          })
          handleReminderSnooze(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
        })
      }
      
      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('❌ 用户点击忽略')
          // 播放忽略音效
          import('@/utils/audioManager.js').then(module => {
            module.default.playDismissSound()
          })
          handleReminderDismiss(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
        })
      }
    }, 100)
    
    // 备用事件委托方式
    const handleModalClick = (e) => {
      const target = e.target
      const button = target.closest('button')
      
      if (!button) return
      
      const buttonId = button.id
      console.log('🎯 通过事件委托捕获点击:', buttonId)
      
      switch (buttonId) {
        case 'complete-btn':
          e.preventDefault()
          e.stopPropagation()
          console.log('✅ 用户点击完成 (事件委托)')
          import('@/utils/audioManager.js').then(module => {
            module.default.playSuccessSound()
          })
          handleReminderComplete(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
          break
          
        case 'snooze-btn':
          e.preventDefault()
          e.stopPropagation()
          console.log('⏰ 用户点击稍后提醒 (事件委托)')
          import('@/utils/audioManager.js').then(module => {
            module.default.playSnoozeSound()
          })
          handleReminderSnooze(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
          break
          
        case 'dismiss-btn':
          e.preventDefault()
          e.stopPropagation()
          console.log('❌ 用户点击忽略 (事件委托)')
          import('@/utils/audioManager.js').then(module => {
            module.default.playDismissSound()
          })
          handleReminderDismiss(habit)
          if (document.body.contains(reminderModal)) {
            document.body.removeChild(reminderModal)
          }
          break
      }
    }
    
    reminderModal.addEventListener('click', handleModalClick)
    
    // 播放音效
    playNotificationSound()
    
    // 显示浏览器通知
    showBrowserNotification(habit)
  }

  // 显示番茄钟提醒
  const showPomodoroReminder = (habit) => {
    console.log('🍅 显示番茄钟提醒:', habit.name)
    // 暂时使用通知提醒，后续可以扩展
    showNotificationReminder(habit)
  }

  // 处理提醒完成
  const handleReminderComplete = async (habit) => {
    isReminderActive.value = false
    
    // 如果是测试习惯，不执行真实的打卡操作
    if (habit.isTestHabit) {
      console.log('🧪 测试习惯完成，跳过真实打卡操作')
      processNextReminder()
      return
    }
    
    // 检查是否已经达到今日打卡频率限制
    const today = new Date().toISOString().split('T')[0]
    const todayCheckIn = habit.checkIns?.find(checkIn => checkIn.date === today)
    const todayCount = todayCheckIn?.count || 0
    
    // 检查是否已达到目标次数
    if (habit.frequency === 'daily' && todayCount >= habit.target) {
      console.log('⚠️ 今日打卡次数已达上限，跳过打卡:', habit.name, `(${todayCount}/${habit.target})`)
      processNextReminder()
      return
    }
    
    try {
      // 执行真实的习惯打卡
      const result = await habitStore.completeHabit(habit.id)
      if (result.success) {
        console.log('✅ 习惯打卡成功:', habit.name)
      } else {
        console.error('❌ 习惯打卡失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 习惯打卡异常:', error)
    }
    
    processNextReminder()
  }

  // 处理提醒稍后
  const handleReminderSnooze = (habit) => {
    isReminderActive.value = false
    
    // 5分钟后再次提醒
    setTimeout(() => {
      showReminder(habit)
    }, 5 * 60 * 1000)
    
    processNextReminder()
  }

  // 处理提醒忽略
  const handleReminderDismiss = (habit) => {
    isReminderActive.value = false
    processNextReminder()
  }

  // 处理下一个提醒
  const processNextReminder = () => {
    if (reminderQueue.value.length > 0) {
      const nextHabit = reminderQueue.value.shift()
      setTimeout(() => {
        showReminder(nextHabit)
      }, 1000) // 1秒后显示下一个提醒
    }
  }

  // 播放通知音效
  const playNotificationSound = () => {
    try {
      // 使用专业的音效管理器
      import('@/utils/audioManager.js').then(module => {
        const audioManager = module.default
        audioManager.playNotificationSound()
      })
    } catch (error) {
      console.log('❌ 音效播放失败:', error)
    }
  }

  // 显示浏览器通知
  const showBrowserNotification = (habit) => {
    if ('Notification' in window) {
      // 获取习惯图标作为通知图标
      const getNotificationIcon = (icon) => {
        if (icon && (icon.startsWith('data:image') || icon.startsWith('http'))) {
          return icon
        }
        return '/favicon.ico' // 默认图标
      }
      
      if (Notification.permission === 'granted') {
        new Notification(`习惯提醒 - ${habit.name}`, {
          body: '该完成你的习惯了！',
          icon: getNotificationIcon(habit.icon),
          tag: `habit-${habit.id}`,
          requireInteraction: true
        })
        console.log('📱 显示浏览器通知')
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`习惯提醒 - ${habit.name}`, {
              body: '该完成你的习惯了！',
              icon: getNotificationIcon(habit.icon),
              tag: `habit-${habit.id}`,
              requireInteraction: true
            })
            console.log('📱 显示浏览器通知（权限已获取）')
          }
        })
      }
    }
  }

  // 精确提醒调度
  const startPreciseReminderScheduling = () => {
    console.log('🎯 启动精确提醒调度')
    
    // 清除之前的精确提醒定时器
    clearAllPreciseReminders()
    
    // 为每个启用了提醒的习惯设置精确提醒
    habitStore.habits.forEach(habit => {
      if (habit.reminderEnabled && habit.reminderTime) {
        schedulePreciseReminder(habit)
      }
    })
  }
  
  // 为单个习惯设置精确提醒
  const schedulePreciseReminder = (habit) => {
    if (!habit.reminderEnabled || !habit.reminderTime) return
    
    const [hour, minute] = habit.reminderTime.split(':').map(Number)
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hour, minute, 0, 0) // 设置为当天的提醒时间（秒和毫秒为0）
    
    // 如果今天的提醒时间已过，设置为明天
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime()
    
    console.log(`⏰ 为习惯"${habit.name}"设置精确提醒:`, {
      reminderTime: habit.reminderTime,
      scheduledFor: reminderTime.toLocaleString(),
      timeUntilReminder: Math.round(timeUntilReminder / 1000) + '秒'
    })
    
    // 设置精确提醒定时器
    const timeoutId = setTimeout(() => {
      console.log(`🔔 精确提醒触发: ${habit.name}`)
      
      // 检查是否已完成今日首次打卡
      if (hasCompletedTodayFirstCheckIn(habit)) {
        console.log('✅ 用户已完成今日首次打卡，跳过精确提醒:', habit.name)
      } else {
        showReminder(habit)
      }
      
      // 提醒后，为明天设置新的提醒
      schedulePreciseReminder(habit)
    }, timeUntilReminder)
    
    // 存储定时器ID，用于清理
    preciseReminderTimeouts.set(habit.id, timeoutId)
  }
  
  // 清除所有精确提醒
  const clearAllPreciseReminders = () => {
    console.log('🧹 清除所有精确提醒定时器')
    preciseReminderTimeouts.forEach((timeoutId, habitId) => {
      clearTimeout(timeoutId)
    })
    preciseReminderTimeouts.clear()
  }

  // 启动提醒检查
  const startReminderCheck = () => {
    console.log('🚀 启动提醒检查系统')
    
    // 清除之前的定时器
    if (reminderInterval) {
      clearInterval(reminderInterval)
    }
    
    // 每10秒检查一次，提高精度
    reminderInterval = setInterval(checkReminders, 10 * 1000)
    
    // 立即检查一次
    checkReminders()
    
    // 启动精确提醒调度
    startPreciseReminderScheduling()
    
    console.log('✅ 提醒检查系统已启动（10秒间隔 + 精确调度）')
  }

  // 停止提醒检查
  const stopReminderCheck = () => {
    console.log('🛑 停止提醒检查系统')
    
    // 清除定时器
    if (reminderInterval) {
      clearInterval(reminderInterval)
      reminderInterval = null
    }
    
    // 清除精确提醒定时器
    clearAllPreciseReminders()
    
    // 清除所有状态
    activeReminders.value.clear()
    reminderQueue.value = []
    isReminderActive.value = false
    
    console.log('✅ 提醒检查系统已停止')
  }

  // 手动触发提醒（用于测试）
  const triggerReminder = (habit) => {
    showReminder(habit)
  }

  // 清除今日提醒记录
  const clearTodayReminders = () => {
    const today = new Date().toDateString()
    for (const [key] of activeReminders.value) {
      if (key.includes(today)) {
        activeReminders.value.delete(key)
      }
    }
  }
  
  // 重新调度提醒（当习惯更新时调用）
  const rescheduleReminders = () => {
    console.log('🔄 重新调度提醒')
    startPreciseReminderScheduling()
  }

  return {
    // 状态
    activeReminders: computed(() => activeReminders.value),
    reminderQueue: computed(() => reminderQueue.value),
    isReminderActive: computed(() => isReminderActive.value),
    
    // 方法
    checkReminders,
    showReminder,
    startReminderCheck,
    stopReminderCheck,
    triggerReminder,
    clearTodayReminders,
    rescheduleReminders,
    handleReminderComplete,
    handleReminderSnooze,
    handleReminderDismiss
  }
}
