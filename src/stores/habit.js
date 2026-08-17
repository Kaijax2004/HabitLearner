import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as habitAPI from '@/api/habits.js'
import { getIsNewUser, hasCompletedOnboarding } from '@/api/index.js'
import { formatLocalDateKey } from '@/utils/date.js'

export const useHabitStore = defineStore('habit', () => {
  // 状态
  const habits = ref([])
  const isLoading = ref(false)
  const currentHabit = ref(null)
  const forceUpdate = ref(0) // 全局强制更新触发器

  // 计算属性
  const totalHabits = computed(() => habits.value.length)
  const completedToday = computed(() => {
    const today = formatLocalDateKey() // 格式: YYYY-MM-DD
    return habits.value.filter(habit => 
      habit.lastCompleted && formatLocalDateKey(habit.lastCompleted) === today
    ).length
  })
  const totalStreak = computed(() => {
    return habits.value.reduce((total, habit) => total + (habit.streak || 0), 0)
  })

  const normalizeReminderTimes = (habit = {}) => {
    let reminderTimes = []

    if (Array.isArray(habit.reminderTimes)) {
      reminderTimes = habit.reminderTimes
    } else if (typeof habit.reminderTimes === 'string' && habit.reminderTimes.trim()) {
      try {
        const parsed = JSON.parse(habit.reminderTimes)
        reminderTimes = Array.isArray(parsed) ? parsed : [habit.reminderTimes]
      } catch {
        reminderTimes = habit.reminderTimes.split(',')
      }
    } else if (typeof habit.reminderTime === 'string' && habit.reminderTime.trim()) {
      reminderTimes = [habit.reminderTime]
    }

    return [...new Set(reminderTimes
      .map(time => (typeof time === 'string' ? time.trim() : ''))
      .filter(time => /^\d{2}:\d{2}$/.test(time))
    )].sort()
  }

  const normalizeHabit = (habit = {}) => {
    const reminderTimes = normalizeReminderTimes(habit)

    return {
      ...habit,
      reminderTimes,
      reminderTime: reminderTimes[0] || habit.reminderTime || null,
      checkIns: Array.isArray(habit.checkIns) ? habit.checkIns : [],
      dailyComments: Array.isArray(habit.dailyComments) ? habit.dailyComments : []
    }
  }

  const mergeHabitData = (currentHabitData = {}, incomingHabitData = {}) => {
    const normalizedCurrent = normalizeHabit(currentHabitData)
    const normalizedIncoming = normalizeHabit(incomingHabitData)

    return {
      ...normalizedCurrent,
      ...normalizedIncoming,
      checkIns: incomingHabitData.checkIns !== undefined ? normalizedIncoming.checkIns : normalizedCurrent.checkIns,
      dailyComments: incomingHabitData.dailyComments !== undefined ? normalizedIncoming.dailyComments : normalizedCurrent.dailyComments
    }
  }

  // 动作
  const fetchHabits = async () => {
    isLoading.value = true
    try {
      console.log('🔄 开始获取习惯数据...')
      
      const response = await habitAPI.getHabits()
      
      if (response.success) {
        console.log('✅ 成功获取习惯数据:', response.data)
        
        // 直接使用后端返回的数据，确保数据完整性
        habits.value = Array.isArray(response.data) ? response.data.map(normalizeHabit) : []
        
        // 保存到本地存储作为缓存
        localStorage.setItem('habits', JSON.stringify(habits.value))
        
        return { success: true, habits: response.data }
      } else {
        console.error('❌ 获取习惯数据失败:', response.error)
        
        // 如果后端失败，尝试使用本地缓存
        const storedHabits = localStorage.getItem('habits')
        if (storedHabits) {
          console.log('📱 后端失败，使用本地缓存数据')
          const parsedHabits = JSON.parse(storedHabits)
          habits.value = Array.isArray(parsedHabits) ? parsedHabits.map(normalizeHabit) : []
          return { success: true, data: habits.value, fromCache: true }
        }
        
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('❌ 获取习惯数据异常:', error)
      
      // 网络异常时尝试使用本地缓存
      const storedHabits = localStorage.getItem('habits')
      if (storedHabits) {
        console.log('📱 网络异常，使用本地缓存数据')
        const parsedHabits = JSON.parse(storedHabits)
        habits.value = Array.isArray(parsedHabits) ? parsedHabits.map(normalizeHabit) : []
        return { success: true, data: habits.value, fromCache: true }
      }
      
      return { success: false, error: error.message || '网络错误' }
    } finally {
      isLoading.value = false
    }
  }

  const createHabit = async (habitData) => {
    // 防止重复请求
    if (isLoading.value) {
      console.log('createHabit 正在加载中，忽略重复请求')
      return { success: false, error: '正在处理中，请稍后重试' }
    }
    
    console.log('🔄 开始创建习惯，数据:', habitData)
    isLoading.value = true
    
    try {
      // 验证并规范化图标数据
      if (!habitData.icon || typeof habitData.icon !== 'string' || habitData.icon.trim() === '') {
        habitData.icon = '📚' // 设置默认图标
        console.warn('图标数据无效，使用默认图标')
      }
      
      // 发送API请求
      const response = await habitAPI.createHabit(habitData)
      console.log('✅ createHabit API 响应:', response)
      
      if (response && response.success) {
        // 使用后端返回的完整习惯数据
        const newHabit = normalizeHabit(response.data)
        
        // 添加到本地状态
        habits.value = [...habits.value, newHabit]
        
        // 触发响应式更新
        forceUpdate.value++
        
        // 更新本地缓存
        localStorage.setItem('habits', JSON.stringify(habits.value))
        
        console.log('✅ 创建习惯成功:', newHabit)
        return { success: true, habit: newHabit }
      } else {
        const errorMessage = response?.error || '创建习惯失败'
        console.error('❌ createHabit API 错误:', response)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ createHabit 网络错误:', error)
      return { 
        success: false, 
        error: error.message || '网络错误，请检查连接后重试' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateHabit = async (id, habitData) => {
    isLoading.value = true
    try {
      const response = await habitAPI.updateHabit(id, habitData)
      
      if (response.success) {
        const index = habits.value.findIndex(habit => habit.id === parseInt(id))
        if (index !== -1) {
          habits.value[index] = mergeHabitData(habits.value[index], response.data)
          habits.value = [...habits.value]
        }
        localStorage.setItem('habits', JSON.stringify(habits.value))
        return { success: true, habit: index !== -1 ? habits.value[index] : normalizeHabit(response.data) }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabit = async (id) => {
    // 检查是否是测试习惯
    const habit = habits.value.find(h => h.id === parseInt(id) || h.id === id)
    if (habit && habit.isTestHabit) {
      console.log('🧪 删除测试习惯，跳过后端请求')
      // 只从本地数据中删除
      const index = habits.value.findIndex(h => h.id === parseInt(id) || h.id === id)
      if (index !== -1) {
        habits.value.splice(index, 1)
      }
      return { success: true }
    }
    
    isLoading.value = true
    try {
      const response = await habitAPI.deleteHabit(id)
      
      if (response.success) {
        const index = habits.value.findIndex(habit => habit.id === parseInt(id))
        if (index !== -1) {
          habits.value.splice(index, 1)
        }
        localStorage.setItem('habits', JSON.stringify(habits.value))
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabits = async (ids) => {
    console.log('deleteHabits 开始，IDs:', ids)
    isLoading.value = true
    try {
      // 分离测试习惯和真实习惯
      const testHabits = []
      const realHabits = []
      
      ids.forEach(id => {
        const habit = habits.value.find(h => h.id === parseInt(id) || h.id === id)
        if (habit && habit.isTestHabit) {
          testHabits.push(id)
        } else {
          realHabits.push(id)
        }
      })
      
      console.log('测试习惯IDs:', testHabits)
      console.log('真实习惯IDs:', realHabits)
      
      // 处理测试习惯（本地删除）
      testHabits.forEach(id => {
        const index = habits.value.findIndex(h => h.id === parseInt(id) || h.id === id)
        if (index !== -1) {
          habits.value.splice(index, 1)
        }
      })
      
      // 处理真实习惯（后端删除）
      if (realHabits.length > 0) {
        const response = await habitAPI.deleteHabits(realHabits)
        console.log('deleteHabits API 响应:', response)
        if (!response.success) return { success: false, error: response.error || '批量删除失败' }
        
        // 成功删除后，从本地数组中移除这些习惯
        realHabits.forEach(id => {
          const index = habits.value.findIndex(h => h.id === parseInt(id) || h.id === id)
          if (index !== -1) {
            habits.value.splice(index, 1)
          }
        })
      }
      
      console.log('删除后的习惯列表:', habits.value)
      return { success: true, deletedCount: ids.length }
    } catch (error) {
      console.error('删除习惯时发生错误:', error)
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const completeHabit = async (id, comment = null) => {
    console.log('completeHabit 开始，ID:', id, 'comment:', comment)
    
    // 检查是否是测试习惯
    const habit = habits.value.find(h => h.id === parseInt(id) || h.id === id)
    if (!habit) {
      return { success: false, error: '习惯不存在' }
    }
    
    // 检查是否已经达到今日打卡频率限制
    const today = formatLocalDateKey()
    const todayCheckIn = habit.checkIns?.find(checkIn => checkIn.date === today)
    const todayCount = todayCheckIn?.count || 0
    
    // 检查是否已达到目标次数
    if (habit.frequency === 'daily' && todayCount >= habit.target) {
      console.log('⚠️ 今日打卡次数已达上限，禁止打卡:', habit.name, `(${todayCount}/${habit.target})`)
      return { 
        success: false, 
        error: `今日打卡次数已达上限 (${todayCount}/${habit.target})`,
        isLimitReached: true
      }
    }

    // 🚀 乐观更新：立即更新UI状态
    console.log('🚀 执行乐观更新，立即显示最新状态')
    const optimisticUpdate = () => {
      const habitIndex = habits.value.findIndex(h => h.id === parseInt(id))
      if (habitIndex !== -1) {
        const currentHabit = habits.value[habitIndex]
        
        // 立即更新checkIns
        if (!currentHabit.checkIns) currentHabit.checkIns = []
        const existingTodayCheckIn = currentHabit.checkIns.find(checkIn => checkIn.date === today)
        
        if (!existingTodayCheckIn) {
          currentHabit.checkIns.push({
            date: today,
            count: 1,
            time: new Date().toLocaleTimeString('zh-CN', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          })
        } else {
          existingTodayCheckIn.count += 1
          existingTodayCheckIn.time = new Date().toLocaleTimeString('zh-CN', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
        
        // 更新其他状态
        currentHabit.lastCompleted = new Date().toISOString()
        currentHabit.todayCount = existingTodayCheckIn ? existingTodayCheckIn.count : 1
        
        // 处理留言数据
        if (comment && (comment.title || comment.content)) {
          if (!currentHabit.dailyComments) currentHabit.dailyComments = []
          
          const todayComment = currentHabit.dailyComments.find(c => c.date === today)
          if (todayComment) {
            // 更新今天的留言
            todayComment.title = comment.title || todayComment.title
            todayComment.content = comment.content || todayComment.content
          } else {
            // 添加今天的留言
            currentHabit.dailyComments.push({
              date: today,
              title: comment.title || '',
              content: comment.content || ''
            })
          }
        }
        
        // 强制触发响应式更新
        habits.value = [...habits.value]
        
        // 触发全局强制更新，确保所有页面立即响应
        forceUpdate.value++
        
        console.log('✅ 乐观更新完成，UI已立即更新，全局强制更新已触发')
      }
    }
    
    // 立即执行乐观更新
    optimisticUpdate()
    
    if (habit.isTestHabit) {
      console.log('🧪 测试习惯打卡，跳过后端请求')
      // 测试习惯已经通过乐观更新处理，直接返回成功
      return { success: true, habit: habit }
    }
    
    // 对于真实习惯，在后台同步到服务器
    try {
      console.log('🔄 后台同步到服务器...')
      const response = await habitAPI.checkInHabit(id, comment)
      console.log('API 响应:', response)
      
      if (response.success) {
        console.log('打卡成功')
        // 同步本地习惯状态
        const updatedHabit = response.data || response.habit || response
        const habitIndex = habits.value.findIndex(h => h.id === parseInt(id))

        if (habitIndex !== -1) {
          const existingHabit = habits.value[habitIndex]
          habits.value[habitIndex] = mergeHabitData(existingHabit, updatedHabit)
          habits.value = [...habits.value]
          localStorage.setItem('habits', JSON.stringify(habits.value))
        }

        const latestHabit = habitIndex !== -1
          ? habits.value[habitIndex]
          : normalizeHabit(updatedHabit)

        return {
          success: true,
          habit: latestHabit,
          isCompleted: updatedHabit.isCompleted || false,
          todayCount: updatedHabit.todayCount ?? latestHabit.todayCount ?? (todayCount + 1),
          target: latestHabit.target || habit.target || 1,
          isFirstCheckIn: updatedHabit.isFirstCheckIn || false
        }
      } else {
        console.warn('⚠️ 后端同步失败，但前端已更新:', response.error)
        // 后端失败但前端已更新，返回成功但标记为部分成功
        return { 
          success: true, 
          habit: habits.value.find(h => h.id === parseInt(id)),
          isCompleted: (todayCount + 1) >= (habit.target || 1),
          todayCount: todayCount + 1,
          target: habit.target || 1,
          isFirstCheckIn: todayCount === 0,
          warning: '后端同步失败，数据可能不同步'
        }
      }
    } catch (error) {
      console.error('❌ 后端同步异常:', error)
      // 后端异常但前端已更新，返回成功但标记为部分成功
      return { 
        success: true, 
        habit: habits.value.find(h => h.id === parseInt(id)),
        isCompleted: (todayCount + 1) >= (habit.target || 1),
        todayCount: todayCount + 1,
        target: habit.target || 1,
        isFirstCheckIn: todayCount === 0,
        warning: '网络异常，数据可能不同步'
      }
    }
  }

  // 添加每日留言
  const addDailyComment = async (id, comment) => {
    try {
      const response = await habitAPI.addDailyComment(id, comment)
      
      if (response.success) {
        const habitIndex = habits.value.findIndex(h => h.id === parseInt(id))
        if (habitIndex !== -1) {
          const existingHabit = habits.value[habitIndex]
          const updatedHabit = response.data?.habit || response.habit || response.data || response
          const today = formatLocalDateKey() // 格式: YYYY-MM-DD
          
          // 处理留言数据
          let updatedDailyComments = updatedHabit.dailyComments || existingHabit.dailyComments || []
          
          // 确保今天的留言被保存
          if (comment && (comment.title || comment.content)) {
            const todayComment = updatedDailyComments.find(c => c.date === today)
            if (todayComment) {
              // 更新今天的留言
              updatedDailyComments = updatedDailyComments.map(c => 
                c.date === today 
                  ? { ...c, title: comment.title || c.title, content: comment.content || c.content }
                  : c
              )
            } else {
              // 添加今天的留言
              updatedDailyComments = [...updatedDailyComments, {
                date: today,
                title: comment.title || '',
                content: comment.content || ''
              }]
            }
          }
          
          // 更新habit数据
          habits.value[habitIndex] = mergeHabitData(existingHabit, {
            ...updatedHabit,
            dailyComments: updatedDailyComments
          })
          habits.value = [...habits.value]
          localStorage.setItem('habits', JSON.stringify(habits.value))
        }
        
        return { success: true, habit: habits.value[habitIndex] }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    }
  }

  // 计算本周进度
  const getWeeklyProgress = (habit) => {
    if (!habit.checkIns) return 0
    
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() - now.getDay() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return habit.checkIns
      .filter(checkIn => {
        const checkInDate = new Date(checkIn.date)
        return checkInDate >= startOfWeek && checkInDate <= endOfWeek
      })
      .reduce((total, checkIn) => total + checkIn.count, 0)
  }

  const getHabitById = (id) => {
    return habits.value.find(habit => habit.id === parseInt(id))
  }

  const setCurrentHabit = (habit) => {
    currentHabit.value = habit
  }

  // 强制刷新习惯数据（清除缓存）
  const forceRefreshHabits = async () => {
    console.log('强制刷新习惯数据，清除所有缓存...')
    // 清除当前的习惯数据
    habits.value = []
    // 重新获取数据
    return await fetchHabits()
  }

  return {
    // 状态
    habits,
    isLoading,
    currentHabit,
    forceUpdate,
    // 计算属性
    totalHabits,
    completedToday,
    totalStreak,
    // 动作
    fetchHabits,
    forceRefreshHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    deleteHabits,
    completeHabit,
    addDailyComment,
    getHabitById,
    setCurrentHabit,
    getWeeklyProgress
  }
})
