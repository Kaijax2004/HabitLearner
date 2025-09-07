import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHabitStore = defineStore('habit', () => {
  // 状态
  const habits = ref([])
  const isLoading = ref(false)
  const currentHabit = ref(null)

  // 计算属性
  const totalHabits = computed(() => habits.value.length)
  const completedToday = computed(() => {
    const today = new Date().toDateString()
    return habits.value.filter(habit => 
      habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === today
    ).length
  })
  const totalStreak = computed(() => {
    return habits.value.reduce((total, habit) => total + (habit.streak || 0), 0)
  })

  // 动作
  const fetchHabits = async () => {
    isLoading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 从localStorage获取数据，如果没有则使用默认数据
      const savedHabits = localStorage.getItem('habits')
      console.log('从localStorage获取的数据:', savedHabits)
      
      if (savedHabits) {
        habits.value = JSON.parse(savedHabits)
        console.log('加载的习惯数据:', habits.value)
      } else {
        // 默认数据
        const mockHabits = [
          {
            id: 1,
            name: '每日阅读',
            icon: '📚',
            category: '学习',
            target: 3,
            frequency: 'daily',
            streak: 7,
            lastCompleted: new Date().toISOString(),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#007AFF',
            enableComments: true,
            checkIns: [],
            dailyComments: []
          },
          {
            id: 2,
            name: '晨间运动',
            icon: '🏃‍♂️',
            category: '健康',
            target: 1,
            frequency: 'daily',
            streak: 3,
            lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#34C759',
            enableComments: true,
            checkIns: [],
            dailyComments: []
          },
          {
            id: 3,
            name: '冥想练习',
            icon: '🧘‍♀️',
            category: '健康',
            target: 5,
            frequency: 'weekly',
            streak: 0,
            lastCompleted: null,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#FF9500',
            enableComments: true,
            checkIns: [],
            dailyComments: []
          }
        ]
        habits.value = mockHabits
        localStorage.setItem('habits', JSON.stringify(mockHabits))
        console.log('初始化默认数据:', mockHabits)
      }
      
      return { success: true, habits: habits.value }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const createHabit = async (habitData) => {
    isLoading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newHabit = {
        id: Date.now(),
        ...habitData,
        streak: 0,
        lastCompleted: null,
        createdAt: new Date().toISOString()
      }
      
      habits.value.push(newHabit)
      // 保存到localStorage
      localStorage.setItem('habits', JSON.stringify(habits.value))
      return { success: true, habit: newHabit }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const updateHabit = async (id, habitData) => {
    isLoading.value = true
    try {
      console.log('开始更新习惯，ID:', id, '数据:', habitData)
      console.log('当前习惯列表:', habits.value.map(h => ({ id: h.id, name: h.name, enableComments: h.enableComments })))
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = habits.value.findIndex(habit => habit.id === parseInt(id))
      console.log('找到习惯索引:', index)
      
      if (index !== -1) {
        // 创建新的习惯对象，保持原有数据并更新
        const updatedHabit = { ...habits.value[index], ...habitData }
        habits.value[index] = updatedHabit
        // 保存到localStorage
        localStorage.setItem('habits', JSON.stringify(habits.value))
        console.log('更新后的习惯:', updatedHabit)
        console.log('保存到localStorage成功')
        return { success: true, habit: updatedHabit }
      }
      console.log('习惯不存在')
      return { success: false, error: '习惯不存在' }
    } catch (error) {
      console.error('更新习惯错误:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabit = async (id) => {
    isLoading.value = true
    try {
      console.log('开始删除习惯，ID:', id)
      console.log('删除前习惯列表:', habits.value.map(h => ({ id: h.id, name: h.name })))
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = habits.value.findIndex(habit => habit.id === parseInt(id))
      console.log('找到习惯索引:', index)
      
      if (index !== -1) {
        habits.value.splice(index, 1)
        // 保存到localStorage
        localStorage.setItem('habits', JSON.stringify(habits.value))
        console.log('删除后习惯列表:', habits.value.map(h => ({ id: h.id, name: h.name })))
        console.log('保存到localStorage成功')
        return { success: true }
      }
      console.log('习惯不存在')
      return { success: false, error: '习惯不存在' }
    } catch (error) {
      console.error('删除习惯错误:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabits = async (ids) => {
    isLoading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      habits.value = habits.value.filter(habit => !ids.includes(habit.id))
      return { success: true, deletedCount: ids.length }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const completeHabit = async (id, comment = '') => {
    try {
      console.log('开始完成习惯，ID:', id, '留言:', comment)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const habitIndex = habits.value.findIndex(h => h.id === id)
      console.log('找到习惯索引:', habitIndex)
      if (habitIndex !== -1) {
        const habit = habits.value[habitIndex]
        const today = new Date().toDateString()
        
        // 创建新的习惯对象，避免直接修改
        const updatedHabit = { ...habit }
        
        // 初始化数组
        if (!updatedHabit.checkIns) {
          updatedHabit.checkIns = []
        }
        if (!updatedHabit.dailyComments) {
          updatedHabit.dailyComments = []
        }
        
        // 查找今天的打卡记录
        const todayCheckIn = updatedHabit.checkIns.find(checkIn => checkIn.date === today)
        const isFirstCheckIn = !todayCheckIn
        
        if (todayCheckIn) {
          // 今天已有打卡记录，增加次数
          todayCheckIn.count += 1
          if (comment && isFirstCheckIn) {
            todayCheckIn.comments = todayCheckIn.comments || []
            todayCheckIn.comments.push(comment)
          }
        } else {
          // 今天第一次打卡
          updatedHabit.checkIns.push({
            date: today,
            count: 1,
            comments: comment ? [comment] : []
          })
        }
        
        // 处理每日留言（仅在首次打卡时）
        if (comment && isFirstCheckIn && updatedHabit.enableComments) {
          // 查找是否已有今日留言
          const existingComment = updatedHabit.dailyComments.find(c => c.date === today)
          if (existingComment) {
            existingComment.title = comment.title || ''
            existingComment.content = comment.content || ''
          } else {
            updatedHabit.dailyComments.push({
              date: today,
              title: comment.title || '',
              content: comment.content || ''
            })
          }
          
          // 保持30天内的留言记录
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString()
          updatedHabit.dailyComments = updatedHabit.dailyComments.filter(c => c.date >= thirtyDaysAgo)
        }
        
        // 检查是否完成今日目标
        const currentCheckIn = updatedHabit.checkIns.find(checkIn => checkIn.date === today)
        const isCompleted = updatedHabit.frequency === 'daily' 
          ? currentCheckIn.count >= updatedHabit.target
          : currentCheckIn.count > 0  // 每周习惯：今日有打卡就算完成
        
        if (isCompleted) {
          // 更新连续天数和最后完成时间
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
          const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null
          
          if (lastCompleted === yesterday) {
            updatedHabit.streak += 1
          } else if (lastCompleted !== today) {
            updatedHabit.streak = 1
          }
          
          updatedHabit.lastCompleted = new Date().toISOString()
        }
        
        // 替换数组中的对象，保持顺序
        habits.value[habitIndex] = updatedHabit
        // 保存到localStorage
        localStorage.setItem('habits', JSON.stringify(habits.value))
        console.log('习惯更新成功:', updatedHabit)
        
        return { 
          success: true, 
          habit: updatedHabit,
          isCompleted,
          todayCount: currentCheckIn.count,
          target: updatedHabit.target,
          isFirstCheckIn
        }
      }
      return { success: false, error: '习惯不存在' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 添加每日留言
  const addDailyComment = async (id, comment) => {
    try {
      const habitIndex = habits.value.findIndex(h => h.id === parseInt(id))
      
      if (habitIndex !== -1) {
        const habit = habits.value[habitIndex]
        const today = new Date().toDateString()
        
        // 创建新的习惯对象
        const updatedHabit = { ...habit }
        updatedHabit.dailyComments = [...(habit.dailyComments || [])]
        
        // 查找是否已有今日留言
        const existingCommentIndex = updatedHabit.dailyComments.findIndex(c => c.date === today)
        
        if (existingCommentIndex !== -1) {
          // 更新现有留言
          updatedHabit.dailyComments[existingCommentIndex] = {
            date: today,
            title: comment.title || '',
            content: comment.content || ''
          }
        } else {
          // 添加新留言
          updatedHabit.dailyComments.push({
            date: today,
            title: comment.title || '',
            content: comment.content || ''
          })
        }
        
        // 保持30天内的留言记录
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString()
        updatedHabit.dailyComments = updatedHabit.dailyComments.filter(c => c.date >= thirtyDaysAgo)
        
        // 更新习惯 - 使用数组替换确保响应式更新
        habits.value.splice(habitIndex, 1, updatedHabit)
        // 保存到localStorage
        localStorage.setItem('habits', JSON.stringify(habits.value))
        
        return { success: true, habit: updatedHabit }
      }
      return { success: false, error: '习惯不存在' }
    } catch (error) {
      return { success: false, error: error.message }
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

  return {
    // 状态
    habits,
    isLoading,
    currentHabit,
    // 计算属性
    totalHabits,
    completedToday,
    totalStreak,
    // 动作
    fetchHabits,
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
