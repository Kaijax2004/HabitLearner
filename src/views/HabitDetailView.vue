<template>
  <AppLayout 
    :title="habit?.name || '习惯详情'"
    :show-back-button="true"
  >
    <template #actions>
      <router-link
        :to="`/habit/${habit?.id}/edit`"
        class="p-2 rounded-full hover:bg-white/10 transition-colors duration-150"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </router-link>
    </template>

    <div v-if="habit" class="p-4 lg:p-0 space-y-6 min-h-0">
      <!-- 桌面端网格布局 -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-10 space-y-6 lg:space-y-0 min-h-0">
        <!-- 左侧：习惯概览和打卡 -->
        <div class="lg:col-span-5 space-y-6">
          <!-- 习惯概览 -->
          <BaseCard>
            <div class="flex items-center space-x-4">
              <div 
                class="w-16 h-16 rounded-apple-lg flex items-center justify-center text-3xl overflow-hidden"
                :style="{ backgroundColor: habit.color + '20' }"
              >
                <!-- 如果是图片URL -->
                <img 
                  v-if="isRenderableMediaUrl(habit.icon)" 
                  :src="resolveMediaUrl(habit.icon)" 
                  alt="习惯图标" 
                  class="w-full h-full object-cover rounded-apple-lg"
                />
                <!-- 如果是文字图标 -->
                <span v-else class="text-3xl">{{ habit.icon || '📝' }}</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">{{ habit.name }}</h2>
                <p class="text-gray-500 dark:text-gray-300">{{ habit.category }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-primary-500">{{ habit.streak }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-300">连续天数</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-500">{{ habit.target }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-300">{{ habit.frequency === 'daily' ? '每日目标' : '每周目标' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 今日打卡 -->
          <BaseCard title="今日打卡">
            <div class="text-center py-6">
              <!-- 打卡进度 -->
              <div class="mb-4">
                <div class="text-2xl font-bold text-primary-500 mb-2">
                  <template v-if="habit.frequency === 'daily'">
                    {{ todayProgress?.count || 0 }}/{{ habit.target }}次
                  </template>
                  <template v-else>
                    {{ isCompleted ? '本周已完成' : '本周未打卡' }} ({{ weeklyProgress }}/{{ habit.target }})
                  </template>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    :style="{ 
                      width: habit.frequency === 'daily' 
                        ? `${Math.min((todayProgress?.count || 0) / habit.target * 100, 100)}%`
                        : (todayProgress?.count > 0 ? '100%' : '0%')
                    }"
                  ></div>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">
                  <template v-if="habit.frequency === 'daily'">
                    <template v-if="isCompleted">
                      <span class="text-green-600 dark:text-green-400 font-medium">今日已完成！</span>
                      <span class="block text-xs mt-1">已达到目标次数，无法继续打卡</span>
                    </template>
                    <template v-else>
                      <span>还需打卡 {{ habit.target - (todayProgress?.count || 0) }} 次</span>
                      <span class="block text-xs mt-1">完成目标后将无法继续打卡</span>
                    </template>
                  </template>
                  <template v-else>
                    {{ isCompleted ? '本周已完成！' : '本周未打卡' }}
                  </template>
                </p>
              </div>

              <!-- 打卡按钮 -->
              <button
                @click="handleCheckIn"
                :disabled="isLoading || isCompleted"
                class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200"
                :class="[
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                ]"
                :title="isCompleted ? '今日打卡次数已达上限，无法继续打卡' : (isLoading ? '正在打卡中...' : '点击打卡')"
              >
                <svg 
                  v-if="isCompleted" 
                  class="w-10 h-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg 
                  v-else-if="isLoading"
                  class="w-10 h-10 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg 
                  v-else
                  class="w-10 h-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <!-- 今日留言 -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">今日留言</h4>
                <div class="flex items-center space-x-2">
                  <button
                    @click="openCommentModal"
                    class="text-xs text-primary-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{{ todayComment ? '编辑留言' : '添加留言' }}</span>
                  </button>
                  <button
                    v-if="habit.dailyComments?.length > 1"
                    @click="showCommentHistory = true"
                    class="text-xs text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    查看历史
                  </button>
                </div>
              </div>
              <div v-if="todayComment" class="bg-gray-50 dark:bg-gray-800 rounded-apple p-3">
                <div v-if="todayComment.title" class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {{ todayComment.title }}
                </div>
                <div v-if="todayComment.content" class="text-sm text-gray-600 dark:text-gray-300">
                  {{ todayComment.content }}
                </div>
              </div>
              <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-apple p-3 text-center">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  还没有今日留言，点击上方按钮添加
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 右侧：图表和历史记录 -->
        <div class="lg:col-span-7 space-y-6">

          <!-- 统计图表 -->
          <BaseCard>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">最近7天完成情况</h3>
              <button
                @click="showMonthlyDetail = true"
                class="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                每月完成情况详情
              </button>
            </div>
            <div class="space-y-3">
              <div 
                v-for="day in weeklyData" 
                :key="day.date"
                @click="showDayComment(day)"
                class="flex items-center justify-between p-3 rounded-apple cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="{ 'bg-gray-50 dark:bg-gray-800': day.hasComment }"
              >
                <div class="flex items-center space-x-3">
                  <div class="text-sm text-gray-500 dark:text-gray-300 w-16">
                    {{ day.dayName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-300 w-20">
                    {{ day.dateStr }}
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="day.isCompleted ? 'bg-green-500' : day.count > 0 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'"
                  >
                    <svg v-if="day.isCompleted" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else class="text-xs text-white font-medium">{{ day.count }}</span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    {{ day.isCompleted ? '已完成' : day.count > 0 ? `${day.count}/${habit.target}次` : '未打卡' }}
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 历史记录 -->
          <BaseCard title="历史记录">
            <div class="space-y-3">
              <div 
                v-for="(record, index) in recentRecords" 
                :key="index"
                class="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-apple"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(record.date) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ record.time }}</div>
                  </div>
                </div>
                <div class="text-green-500 font-medium">已完成</div>
              </div>
              
              <div v-if="recentRecords.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                还没有完成记录
              </div>
            </div>
          </BaseCard>

          <!-- 习惯信息 -->
          <BaseCard title="习惯信息">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">创建时间</span>
                <span class="text-gray-900 dark:text-gray-100">{{ formatDate(habit.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">完成频率</span>
                <span class="text-gray-900 dark:text-gray-100">{{ habit.frequency === 'daily' ? '每日' : '每周' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">目标次数</span>
                <span class="text-gray-900 dark:text-gray-100">{{ habit.target }}次</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">最后完成</span>
                <span class="text-gray-900 dark:text-gray-100">
                  {{ habit.lastCompleted ? formatDate(habit.lastCompleted) : '从未完成' }}
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="p-4">
      <div class="space-y-4">
        <div class="card-apple p-4 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-apple-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- 添加留言弹窗 -->
    <Teleport to="body">
      <div v-if="showAddCommentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click.self="closeAddCommentModal">
        <div class="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-apple bg-white p-6 shadow-2xl dark:bg-gray-800">
          <div class="text-center mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">添加留言</h3>
              <button
                @click="closeAddCommentModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              为今天的打卡记录添加留言
            </p>
          </div>
          
          <div class="space-y-4">
            <!-- 标题输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">标题</label>
              <input
                v-model="addCommentTitle"
                type="text"
                placeholder="给今天的打卡起个标题..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <!-- 正文输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">正文</label>
              <textarea
                v-model="addCommentText"
                placeholder="记录一下今天的感受、收获或想法..."
                class="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button
              @click="handleAddComment"
              :disabled="isLoading || (!addCommentTitle.trim() && !addCommentText.trim())"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-apple hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? '打卡中...' : '打卡' }}
            </button>
            <button
              @click="handleSkipComment"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              跳过留言
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 单独留言弹窗 -->
    <Teleport to="body">
      <div v-if="showCommentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click="handleModalBackgroundClick">
        <div class="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-apple bg-white p-6 shadow-2xl dark:bg-gray-800">
          <div class="text-center mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ todayComment ? '编辑留言' : '添加留言' }}</h3>
              <button
                @click="closeCommentModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">记录今天的感受和想法</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标题</label>
              <input
                v-model="addCommentTitle"
                type="text"
                placeholder="输入标题（可选）"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">正文</label>
              <textarea
                v-model="addCommentText"
                rows="4"
                placeholder="输入正文内容..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button
              @click="handleSaveComment"
              :disabled="isLoading || (!addCommentTitle.trim() && !addCommentText.trim())"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-apple hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? '保存中...' : '保存留言' }}
            </button>
            <button
              @click="closeCommentModal"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 留言历史弹窗 -->
    <div v-if="showCommentHistory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-md w-full max-h-96 overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">留言历史</h3>
          <button
            @click="showCommentHistory = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-3">
          <div 
            v-for="comment in sortedComments" 
            :key="comment.date"
            class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {{ formatCommentDate(comment.date) }}
            </div>
            <div v-if="comment.title" class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {{ comment.title }}
            </div>
            <div v-if="comment.content" class="text-sm text-gray-700 dark:text-gray-300">
              {{ comment.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 每月完成情况详情弹窗 -->
    <div v-if="showMonthlyDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="max-h-[86vh] flex w-full max-w-4xl flex-col overflow-hidden rounded-apple bg-white p-6 dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100">每月完成情况详情</h3>
          <div class="flex items-center space-x-4">
            <!-- 月份选择器 -->
            <select
              v-model="selectedMonth"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-apple bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option 
                v-for="month in availableMonths" 
                :key="month.value" 
                :value="month.value"
              >
                {{ month.label }}
              </option>
            </select>
            <button
              @click="showMonthlyDetail = false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-6">
          <!-- 统计概览 -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-apple p-4 text-center">
              <div class="text-2xl font-bold text-primary-500">{{ monthlyStats.totalDays }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">总天数</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-apple p-4 text-center">
              <div class="text-2xl font-bold text-green-500">{{ monthlyStats.completedDays }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">完成天数</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-apple p-4 text-center">
              <div class="text-2xl font-bold text-orange-500">{{ monthlyStats.partialDays }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">部分完成</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-apple p-4 text-center">
              <div class="text-2xl font-bold text-blue-500">{{ monthlyStats.completionRate }}%</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">完成率</div>
            </div>
          </div>

          <!-- 每日详情 -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">每日详情</h4>
            <div class="grid grid-cols-7 gap-2">
              <div 
                v-for="day in monthlyData" 
                :key="day.date"
                @click="day.isBeforeCreation ? null : showDayComment(day)"
                class="aspect-square rounded-apple flex flex-col items-center justify-center transition-colors"
                :class="{
                  'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700': !day.isBeforeCreation,
                  'cursor-not-allowed opacity-50': day.isBeforeCreation,
                  'bg-green-500 text-white': day.isCompleted && !day.isBeforeCreation,
                  'bg-orange-500 text-white': day.count > 0 && !day.isCompleted && !day.isBeforeCreation,
                  'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300': day.count === 0 && !day.isBeforeCreation,
                  'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500': day.isBeforeCreation
                }"
              >
                <div class="text-xs font-medium">{{ day.day }}</div>
                <div class="text-xs mt-1">
                  {{ day.isCompleted ? '✓' : day.count > 0 ? day.count : '' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 周统计 -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">周统计</h4>
            <div class="space-y-3">
              <div 
                v-for="week in weeklyStats" 
                :key="week.weekNumber"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-apple"
              >
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  第{{ week.weekNumber }}周
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    完成: {{ week.completedDays }}/{{ week.totalDays }}天
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    完成率: {{ week.completionRate }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 单日留言弹窗 -->
    <div v-if="showDayCommentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="max-h-[86vh] w-full max-w-sm overflow-y-auto rounded-apple bg-white p-6 dark:bg-gray-800">
        <div class="text-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {{ selectedDay?.dateStr }} 完成情况
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ selectedDay?.isCompleted ? '已完成' : selectedDay?.count > 0 ? `完成 ${selectedDay.count}/${habit.target} 次` : '未打卡' }}
          </p>
        </div>
        
        <div v-if="selectedDay?.comment" class="mb-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">当日留言</h4>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-apple p-3">
            <div v-if="selectedDay.comment.title" class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {{ selectedDay.comment.title }}
            </div>
            <div v-if="selectedDay.comment.content" class="text-sm text-gray-600 dark:text-gray-300">
              {{ selectedDay.comment.content }}
            </div>
          </div>
        </div>
        
        <div v-else class="mb-4 text-center text-gray-500 dark:text-gray-300">
          当日无留言记录
        </div>
        
        <button
          @click="showDayCommentModal = false"
          class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHabitStore } from '@/stores/habit'
import * as statsAPI from '@/api/stats.js'
import { useToast } from '@/composables/useToast'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'
import { formatLocalDateKey } from '@/utils/date.js'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import LineChart from '@/components/LineChart.vue'

// Store
const habitStore = useHabitStore()
const route = useRoute()
const { success, error, warning } = useToast()

// 响应式数据
const isLoading = ref(false)
const showCommentHistory = ref(false)
const showMonthlyDetail = ref(false)
const showDayCommentModal = ref(false)
const showAddCommentModal = ref(false)
const forceUpdate = ref(0) // 强制更新触发器
const showCommentModal = ref(false)
const addCommentTitle = ref('')
const addCommentText = ref('')
const selectedDay = ref(null)
const selectedMonth = ref(new Date().getMonth())

// 计算属性
const habit = computed(() => {
  return habitStore.getHabitById(route.params.id)
})

const todayProgress = computed(() => {
  // 依赖forceUpdate触发器，确保立即更新
  forceUpdate.value
  
  if (!habit.value?.checkIns) {
    console.log('todayProgress: 没有checkIns数据')
    return null
  }
  
  const today = formatLocalDateKey()
  console.log('todayProgress: 查找今天的打卡记录，今天日期:', today)
  console.log('todayProgress: 所有checkIns:', habit.value.checkIns)
  
  // 查找今天的打卡记录，考虑checkInTime和date字段
  const result = habit.value.checkIns.find(checkIn => {
    let effectiveDate
    if (checkIn.checkInTime) {
      // 如果有checkInTime，使用其日期部分
      effectiveDate = formatLocalDateKey(checkIn.checkInTime)
    } else {
      // 如果没有checkInTime，使用date字段
      effectiveDate = checkIn.date
    }
    console.log('todayProgress: 检查记录:', checkIn, '有效日期:', effectiveDate, '匹配:', effectiveDate === today)
    return effectiveDate === today
  }) || null
  
  console.log('todayProgress: 找到的今天记录:', result)
  return result
})

const isCompleted = computed(() => {
  if (!todayProgress.value) {
    console.log('isCompleted: 没有今天的打卡记录')
    return false
  }
  
  const isCompletedResult = habit.value?.frequency === 'daily' 
    ? todayProgress.value.count >= habit.value.target
    : todayProgress.value.count > 0
  
  console.log('isCompleted 计算:', {
    todayProgress: todayProgress.value,
    frequency: habit.value?.frequency,
    target: habit.value?.target,
    count: todayProgress.value.count,
    isCompleted: isCompletedResult
  })
  
  return isCompletedResult
})

const weeklyProgress = computed(() => {
  if (habit.value?.frequency === 'daily') return 0
  return habitStore.getWeeklyProgress(habit.value)
})

const todayComment = computed(() => {
  if (!habit.value?.dailyComments) return null
  
  const today = formatLocalDateKey()
  return habit.value.dailyComments.find(comment => comment.date === today) || null
})

const sortedComments = computed(() => {
  if (!habit.value?.dailyComments) return []
  
  return [...habit.value.dailyComments].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const availableMonths = computed(() => {
  const months = []
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  for (let i = 0; i <= currentMonth; i++) {
    const date = new Date(currentYear, i, 1)
    months.push({
      value: i,
      label: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    })
  }
  
  return months.reverse() // 最新的月份在前
})

const weeklyData = computed(() => {
  if (!habit.value?.checkIns) return []
  
  const data = []
  const today = new Date()
  
  // 获取习惯创建日期
  const createDate = new Date(habit.value.createdAt)
  const createDateString = formatLocalDateKey(createDate)
  
  // 计算从创建日期开始的7天
  const startDate = new Date(createDate)
  const endDate = new Date(createDate)
  endDate.setDate(startDate.getDate() + 6) // 创建日期 + 6天 = 7天
  
  // 如果创建日期距离今天超过7天，则显示最近7天
  if (today > endDate) {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = formatLocalDateKey(date)
      
      // 查找当天的打卡记录，考虑checkInTime和date字段
      const dayCheckIn = habit.value.checkIns.find(checkIn => {
        let effectiveDate
        if (checkIn.checkInTime) {
          // 如果有checkInTime，使用其日期部分
          effectiveDate = formatLocalDateKey(checkIn.checkInTime)
        } else {
          // 如果没有checkInTime，使用date字段
          effectiveDate = checkIn.date
        }
        return effectiveDate === dateString
      })
      const dayComment = habit.value.dailyComments?.find(comment => comment.date === dateString)
      
      let isCompleted = false
      let count = 0
      
      if (dayCheckIn) {
        count = dayCheckIn.count
        if (habit.value.frequency === 'daily') {
          isCompleted = count >= habit.value.target
        } else {
          isCompleted = count > 0
        }
      }
      
      data.push({
        date: dateString,
        dateStr: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        count,
        isCompleted,
        hasComment: !!dayComment,
        comment: dayComment || null
      })
    }
  } else {
    // 显示从创建日期开始的7天
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateString = formatLocalDateKey(date)
      
      // 查找当天的打卡记录，考虑checkInTime和date字段
      const dayCheckIn = habit.value.checkIns.find(checkIn => {
        let effectiveDate
        if (checkIn.checkInTime) {
          // 如果有checkInTime，使用其日期部分
          effectiveDate = formatLocalDateKey(checkIn.checkInTime)
        } else {
          // 如果没有checkInTime，使用date字段
          effectiveDate = checkIn.date
        }
        return effectiveDate === dateString
      })
      const dayComment = habit.value.dailyComments?.find(comment => comment.date === dateString)
      
      let isCompleted = false
      let count = 0
      
      if (dayCheckIn) {
        count = dayCheckIn.count
        if (habit.value.frequency === 'daily') {
          isCompleted = count >= habit.value.target
        } else {
          isCompleted = count > 0
        }
      }
      
      data.push({
        date: dateString,
        dateStr: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        count,
        isCompleted,
        hasComment: !!dayComment,
        comment: dayComment || null
      })
    }
  }
  
  return data
})

const monthlyData = computed(() => {
  if (!habit.value?.checkIns) return []
  
  const data = []
  const currentYear = new Date().getFullYear()
  const firstDay = new Date(currentYear, selectedMonth.value, 1)
  const lastDay = new Date(currentYear, selectedMonth.value + 1, 0)
  
  // 获取习惯创建日期
  const createDate = new Date(habit.value.createdAt)
  const createDateString = formatLocalDateKey(createDate)
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateString = formatLocalDateKey(d) // 格式: YYYY-MM-DD
    const dayCheckIn = habit.value.checkIns.find(checkIn => checkIn.date === dateString)
    const dayComment = habit.value.dailyComments?.find(comment => comment.date === dateString)
    
    // 判断是否为创建前的日期
    const isBeforeCreation = dateString < createDateString
    
    let isCompleted = false
    let count = 0
    
    if (dayCheckIn) {
      count = dayCheckIn.count
      if (habit.value.frequency === 'daily') {
        isCompleted = count >= habit.value.target
      } else {
        isCompleted = count > 0
      }
    }
    
    data.push({
      date: dateString,
      day: d.getDate(),
      count,
      isCompleted,
      isBeforeCreation,
      comment: dayComment || null
    })
  }
  
  return data
})

const monthlyStats = computed(() => {
  const data = monthlyData.value
  // 只统计创建日期之后的天数
  const validDays = data.filter(day => !day.isBeforeCreation)
  const totalDays = validDays.length
  const completedDays = validDays.filter(day => day.isCompleted).length
  const partialDays = validDays.filter(day => day.count > 0 && !day.isCompleted).length
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  
  return {
    totalDays,
    completedDays,
    partialDays,
    completionRate
  }
})

const weeklyStats = computed(() => {
  const data = monthlyData.value
  const weeks = []
  
  for (let i = 0; i < data.length; i += 7) {
    const weekData = data.slice(i, i + 7)
    // 只统计创建日期之后的天数
    const validWeekData = weekData.filter(day => !day.isBeforeCreation)
    const completedDays = validWeekData.filter(day => day.isCompleted).length
    const totalDays = validWeekData.length
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    
    // 只有当周内有有效天数时才显示
    if (totalDays > 0) {
      weeks.push({
        weekNumber: Math.floor(i / 7) + 1,
        completedDays,
        totalDays,
        completionRate
      })
    }
  }
  
  return weeks
})

const recentRecords = computed(() => {
  // 基于真实的打卡记录生成历史记录
  if (!habit.value?.checkIns) return []
  
  console.log('习惯打卡记录:', habit.value.checkIns)
  console.log('习惯最后完成时间:', habit.value.lastCompleted)
  
  const records = []
  
  // 遍历所有打卡记录，按时间排序并去重
  const sortedCheckIns = [...habit.value.checkIns]
    .filter(checkIn => checkIn.count > 0)
    .sort((a, b) => {
      // 按实际打卡时间排序（升序，最早的在前）
      const timeA = a.checkInTime ? new Date(a.checkInTime) : new Date(a.date)
      const timeB = b.checkInTime ? new Date(b.checkInTime) : new Date(b.date)
      return timeA - timeB
    })
  
  // 去重：按本地日期去重，每个日期只保留首次打卡记录
  const uniqueCheckIns = []
  const seenDates = new Set()
  
  sortedCheckIns.forEach(dayCheckIn => {
    // 计算有效日期（本地日期）
    let effectiveDate
    if (dayCheckIn.checkInTime) {
      // 如果有checkInTime，使用其本地日期部分
      const localTime = new Date(dayCheckIn.checkInTime)
      effectiveDate = formatLocalDateKey(localTime)
    } else {
      // 如果没有checkInTime，使用date字段
      effectiveDate = dayCheckIn.date
    }
    
    if (!seenDates.has(effectiveDate)) {
      seenDates.add(effectiveDate)
      uniqueCheckIns.push(dayCheckIn)
      console.log('添加首次打卡记录:', dayCheckIn, '有效日期:', effectiveDate)
    } else {
      console.log('跳过重复日期记录:', dayCheckIn, '有效日期:', effectiveDate)
    }
  })
  
  console.log('去重后的记录数量:', uniqueCheckIns.length, '原始记录数量:', sortedCheckIns.length)
  
  uniqueCheckIns.forEach(dayCheckIn => {
    console.log('处理打卡记录:', dayCheckIn)
    
    // 使用后端返回的正确时间数据
    let checkInTime
    if (dayCheckIn.checkInTime) {
      // 优先使用后端返回的 checkInTime 字段
      checkInTime = new Date(dayCheckIn.checkInTime)
    } else if (dayCheckIn.timestamp) {
      // 如果后端提供了时间戳，使用真实时间
      checkInTime = new Date(dayCheckIn.timestamp)
    } else if (dayCheckIn.time) {
      // 如果后端提供了时间字符串，使用它
      checkInTime = new Date(`${dayCheckIn.date}T${dayCheckIn.time}`)
    } else {
      // 如果没有具体时间，使用当天的默认时间（中午12点）
      checkInTime = new Date(dayCheckIn.date)
      checkInTime.setHours(12, 0, 0, 0)
    }
    
    records.push({
      date: checkInTime.toISOString(),
      time: checkInTime.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    })
  })
  
  console.log('生成的历史记录:', records)
  return records
})

// 方法
const handleCheckIn = () => {
  // 如果已经完成，不允许再次打卡
  if (isCompleted.value) {
    return
  }
  
  const isFirstCheckInToday = !todayProgress.value || Number(todayProgress.value.count || 0) === 0

  // 如果启用了每日留言，显示留言弹窗
  if (habit.value?.enableComments && isFirstCheckInToday) {
    openAddCommentModal()
  } else {
    // 直接打卡，不显示留言弹窗
    handleCompleteWithoutComment()
  }
}

// 打开添加留言弹窗
const openAddCommentModal = () => {
  // 如果有今日留言，预填充内容
  if (todayComment.value) {
    addCommentTitle.value = todayComment.value.title || ''
    addCommentText.value = todayComment.value.content || ''
  } else {
    addCommentTitle.value = ''
    addCommentText.value = ''
  }
  showAddCommentModal.value = true
}

// 打开单独的留言弹窗
const openCommentModal = () => {
  // 如果有今日留言，预填充内容
  if (todayComment.value) {
    addCommentTitle.value = todayComment.value.title || ''
    addCommentText.value = todayComment.value.content || ''
  } else {
    addCommentTitle.value = ''
    addCommentText.value = ''
  }
  showCommentModal.value = true
}

// 关闭添加留言弹窗
const closeAddCommentModal = () => {
  showAddCommentModal.value = false
  addCommentTitle.value = ''
  addCommentText.value = ''
}

// 关闭单独的留言弹窗
const closeCommentModal = () => {
  showCommentModal.value = false
  addCommentTitle.value = ''
  addCommentText.value = ''
}

// 处理弹窗背景点击事件
const handleModalBackgroundClick = (event) => {
  // 只有当点击的是背景元素本身时才关闭弹窗
  // 这样可以避免在选择文字时意外关闭弹窗
  if (event.target === event.currentTarget) {
    closeCommentModal()
  }
}

// 处理单独保存留言
const handleSaveComment = async () => {
  // 检查是否有内容（标题或正文至少有一个不为空）
  if (!addCommentTitle.value.trim() && !addCommentText.value.trim()) {
    warning('请输入标题或正文')
    return
  }
  
  console.log('开始保存留言，habit ID:', habit.value?.id)
  isLoading.value = true
  
  try {
    const comment = {
      title: addCommentTitle.value.trim(),
      content: addCommentText.value.trim()
    }
    
    const result = await habitStore.addDailyComment(habit.value.id, comment)
    console.log('保存留言结果:', result)
    
    if (result.success) {
      closeCommentModal()
      success('留言保存成功！')
      // 重新获取习惯列表以更新视图
      await habitStore.fetchHabits()
    } else {
      console.error('保存留言失败:', result.error)
      error('保存留言失败', {
        description: result.error
      })
    }
  } catch (error) {
    console.error('保存留言时发生错误:', error)
    error('保存留言失败', {
      description: '网络错误，请稍后重试'
    })
  } finally {
    isLoading.value = false
  }
}

// 处理跳过留言
const handleSkipComment = async () => {
  console.log('开始跳过留言打卡，habit ID:', habit.value?.id)
  isLoading.value = true
  
  try {
    const result = await habitStore.completeHabit(habit.value.id, null)
    console.log('跳过留言打卡结果:', result)
    
    if (result.success) {
      // 打卡成功，关闭弹窗
      closeAddCommentModal()
      success('打卡成功！', {
        description: '今日打卡已完成，继续保持！'
      })
      // 数据已经通过completeHabit自动更新，强制触发响应式更新
      console.log('打卡成功，数据已自动更新')
      // 强制触发所有计算属性重新计算
      forceUpdate.value++
      await nextTick()
    } else {
      console.error('打卡失败:', result.error)
      error('打卡失败', {
        description: result.error
      })
    }
  } catch (err) {
    console.error('打卡失败:', err)
    error('打卡失败', {
      description: err.error || err.message
    })
  } finally {
    isLoading.value = false
  }
}

// 处理添加留言
const handleAddComment = async () => {
  // 检查是否有内容（标题或正文至少有一个不为空）
  if (!addCommentTitle.value.trim() && !addCommentText.value.trim()) {
    warning('请输入标题或正文')
    return
  }
  
  console.log('开始带留言打卡，habit ID:', habit.value?.id)
  isLoading.value = true
  
  try {
    const comment = {
      title: addCommentTitle.value.trim(),
      content: addCommentText.value.trim()
    }
    
    // 先进行打卡
    const checkInResult = await habitStore.completeHabit(habit.value.id, comment)
    console.log('带留言打卡结果:', checkInResult)
    
    if (checkInResult.success) {
      // 打卡成功，关闭弹窗
      closeAddCommentModal()
      success('打卡成功！', {
        description: '今日打卡已完成，继续保持！'
      })
      // 数据已经通过completeHabit自动更新，强制触发响应式更新
      console.log('带留言打卡成功，数据已自动更新')
      // 强制触发所有计算属性重新计算
      forceUpdate.value++
      await nextTick()
    } else {
      console.error('打卡失败:', checkInResult.error)
      error('打卡失败', {
        description: checkInResult.error
      })
    }
  } catch (err) {
    console.error('打卡失败:', err)
    error('打卡失败', {
      description: err.error || err.message
    })
  } finally {
    isLoading.value = false
  }
}


const handleCompleteWithoutComment = async () => {
  // 立即显示加载状态，但很快就会被乐观更新覆盖
  isLoading.value = true
  
  try {
    const result = await habitStore.completeHabit(habit.value.id, null)
    
    if (result.success) {
      // 打卡成功，显示成功提示
      success('打卡成功！', {
        description: result.warning ? `${result.warning}，但本地已更新` : '今日打卡已完成，继续保持！'
      })
      
      // 数据已经通过乐观更新立即更新，强制触发响应式更新
      console.log('✅ 打卡成功，UI已立即更新')
      
      // 强制触发所有计算属性重新计算
      forceUpdate.value++
      await nextTick()
    } else {
      console.error('完成习惯失败:', result.error)
      error('打卡失败', {
        description: result.error
      })
    }
  } catch (err) {
    console.error('完成习惯时发生错误:', err)
    error('打卡失败', {
      description: err.error || err.message
    })
  } finally {
    // 乐观更新后立即隐藏加载状态
    isLoading.value = false
  }
}

const formatCommentDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

const showDayComment = (day) => {
  selectedDay.value = {
    ...day,
    dateStr: new Date(day.date).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }
  showDayCommentModal.value = true
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 生命周期
// 加载月度报告
const loadMonthlyReport = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const response = await statsAPI.getMonthlyReport({
      year: currentYear,
      month: currentMonth
    })
    
    if (response.success) {
      // 这里可以更新月度统计数据
      console.log('月度报告:', response.data)
    }
  } catch (error) {
    console.error('加载月度报告失败:', error)
  }
}

onMounted(() => {
  // 确保习惯数据已加载
  if (!habit.value) {
    habitStore.fetchHabits()
  }
  
  // 加载月度报告
  loadMonthlyReport()
})
</script>
