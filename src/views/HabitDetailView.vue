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
                class="w-16 h-16 rounded-apple-lg flex items-center justify-center text-3xl"
                :style="{ backgroundColor: habit.color + '20' }"
              >
                {{ habit.icon }}
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">{{ habit.name }}</h2>
                <p class="text-gray-500 dark:text-gray-400">{{ habit.category }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-primary-500">{{ habit.streak }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">连续天数</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-500">{{ habit.target }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ habit.frequency === 'daily' ? '每日目标' : '每周目标' }}</div>
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
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <template v-if="habit.frequency === 'daily'">
                    {{ isCompleted ? '今日已完成！' : `还需打卡 ${habit.target - (todayProgress?.count || 0)} 次` }}
                  </template>
                  <template v-else>
                    {{ isCompleted ? '本周已完成！' : '本周未打卡' }}
                  </template>
                </p>
              </div>

              <!-- 打卡按钮 -->
              <button
                @click="handleCheckIn"
                :disabled="isLoading"
                class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200"
                :class="[
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                ]"
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
                    @click="openAddCommentModal"
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
                  <div class="text-sm text-gray-500 dark:text-gray-400 w-16">
                    {{ day.dayName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 w-20">
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
                class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-apple"
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
            <div class="w-16 h-16 bg-gray-200 rounded-apple-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- 添加留言弹窗 -->
    <Teleport to="body">
      <div v-if="showAddCommentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click.self="closeAddCommentModal">
        <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-md w-full shadow-2xl">
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
              :disabled="isLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-apple hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? '保存中...' : '保存留言' }}
            </button>
            <button
              @click="closeAddCommentModal"
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
      <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
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
                @click="showDayComment(day)"
                class="aspect-square rounded-apple flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                :class="{
                  'bg-green-500 text-white': day.isCompleted,
                  'bg-orange-500 text-white': day.count > 0 && !day.isCompleted,
                  'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300': day.count === 0
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
      <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-sm w-full">
        <div class="text-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {{ selectedDay?.dateStr }} 完成情况
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
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
        
        <div v-else class="mb-4 text-center text-gray-500 dark:text-gray-400">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHabitStore } from '@/stores/habit'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import LineChart from '@/components/LineChart.vue'

// Store
const habitStore = useHabitStore()
const route = useRoute()

// 响应式数据
const isLoading = ref(false)
const showCommentHistory = ref(false)
const showMonthlyDetail = ref(false)
const showDayCommentModal = ref(false)
const showAddCommentModal = ref(false)
const addCommentTitle = ref('')
const addCommentText = ref('')
const selectedDay = ref(null)
const selectedMonth = ref(new Date().getMonth())

// 计算属性
const habit = computed(() => {
  return habitStore.getHabitById(route.params.id)
})

const todayProgress = computed(() => {
  if (!habit.value?.checkIns) return null
  
  const today = new Date().toDateString()
  return habit.value.checkIns.find(checkIn => checkIn.date === today) || null
})

const isCompleted = computed(() => {
  if (!todayProgress.value) return false
  
  if (habit.value?.frequency === 'daily') {
    return todayProgress.value.count >= habit.value.target
  } else {
    // 每周习惯：今日有打卡就算完成
    return todayProgress.value.count > 0
  }
})

const weeklyProgress = computed(() => {
  if (habit.value?.frequency === 'daily') return 0
  return habitStore.getWeeklyProgress(habit.value)
})

const todayComment = computed(() => {
  if (!habit.value?.dailyComments) return null
  
  const today = new Date().toDateString()
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
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toDateString()
    
    // 查找当天的打卡记录
    const dayCheckIn = habit.value.checkIns.find(checkIn => checkIn.date === dateString)
    const dayComment = habit.value.dailyComments?.find(comment => comment.date === dateString)
    
    let isCompleted = false
    let count = 0
    
    if (dayCheckIn) {
      count = dayCheckIn.count
      if (habit.value.frequency === 'daily') {
        isCompleted = count >= habit.value.target
      } else {
        // 每周习惯：检查当天是否有打卡
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
      comment: dayComment?.comment || null
    })
  }
  
  return data
})

const monthlyData = computed(() => {
  if (!habit.value?.checkIns) return []
  
  const data = []
  const currentYear = new Date().getFullYear()
  const firstDay = new Date(currentYear, selectedMonth.value, 1)
  const lastDay = new Date(currentYear, selectedMonth.value + 1, 0)
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateString = d.toDateString()
    const dayCheckIn = habit.value.checkIns.find(checkIn => checkIn.date === dateString)
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
      day: d.getDate(),
      count,
      isCompleted,
      comment: dayComment?.comment || null
    })
  }
  
  return data
})

const monthlyStats = computed(() => {
  const data = monthlyData.value
  const totalDays = data.length
  const completedDays = data.filter(day => day.isCompleted).length
  const partialDays = data.filter(day => day.count > 0 && !day.isCompleted).length
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
    const completedDays = weekData.filter(day => day.isCompleted).length
    const totalDays = weekData.length
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    
    weeks.push({
      weekNumber: Math.floor(i / 7) + 1,
      completedDays,
      totalDays,
      completionRate
    })
  }
  
  return weeks
})

const recentRecords = computed(() => {
  // 模拟最近7天的完成记录
  const records = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 模拟完成情况
    if (Math.random() > 0.3) {
      records.push({
        date: date.toISOString(),
        time: `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      })
    }
  }
  
  return records.reverse()
})

// 方法
const handleCheckIn = () => {
  // 直接打卡，不显示留言弹窗
  handleCompleteWithoutComment()
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

// 关闭添加留言弹窗
const closeAddCommentModal = () => {
  showAddCommentModal.value = false
  addCommentTitle.value = ''
  addCommentText.value = ''
}

// 处理添加留言
const handleAddComment = async () => {
  if (!addCommentTitle.value.trim() && !addCommentText.value.trim()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const comment = {
      title: addCommentTitle.value.trim(),
      content: addCommentText.value.trim()
    }
    
    // 调用store方法添加留言
    const result = await habitStore.addDailyComment(habit.value.id, comment)
    
    if (result.success) {
      // 关闭弹窗
      closeAddCommentModal()
    } else {
      console.error('添加留言失败:', result.error)
    }
  } catch (error) {
    console.error('添加留言失败:', error)
  } finally {
    isLoading.value = false
  }
}


const handleCompleteWithoutComment = async () => {
  isLoading.value = true
  
  try {
    const result = await habitStore.completeHabit(habit.value.id, '')
    
    if (result.success) {
      // 打卡成功
    } else {
      console.error('完成习惯失败:', result.error)
    }
  } catch (error) {
    console.error('完成习惯时发生错误:', error)
  } finally {
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
onMounted(() => {
  // 确保习惯数据已加载
  if (!habit.value) {
    habitStore.fetchHabits()
  }
})
</script>
