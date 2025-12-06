<template>
  <AppLayout title="个人资料">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- 桌面端网格布局 -->
              <div class="lg:grid lg:grid-cols-12 lg:gap-10 space-y-6 lg:space-y-0">
        <!-- 左侧：用户信息和数据统计 -->
        <div class="lg:col-span-5 space-y-6">
          <!-- 用户信息卡片 -->
          <BaseCard>
            <div class="text-center py-6">
              <div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img 
                  v-if="getDisplayAvatar()" 
                  :src="getDisplayAvatar()" 
                  alt="用户头像" 
                  class="w-full h-full object-cover"
                  @error="handleAvatarError"
                />
                <svg v-else class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">{{ user?.username || '用户' }}</h2>
              <p class="text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
              <button @click="showEditModal = true" class="mt-3 text-primary-500 text-sm font-medium">
                编辑资料
              </button>
            </div>
          </BaseCard>

          <!-- 数据统计 -->
          <BaseCard title="数据统计">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-primary-500">{{ statsData.totalHabits }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">总习惯</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-green-500">{{ statsData.totalStreak }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">总连续天数</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-orange-500">{{ statsData.learningCourses }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">学习课程</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-purple-500">{{ statsData.usageDays }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">使用天数</div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 右侧：设置选项 -->
        <div class="lg:col-span-7 space-y-4">

          <!-- 设置选项 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">设置</h3>
        
            <!-- 通知设置 -->
            <BaseCard>
              <div class="list-item-apple cursor-pointer" @click="showNotificationModal = true">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-apple flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5L9 15l4.5 4.5M9 15v6" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">通知设置</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">管理推送通知和提醒</div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </BaseCard>

            <!-- 隐私设置 -->
            <BaseCard>
              <div class="list-item-apple cursor-pointer" @click="showPrivacyModal = true">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-apple flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">隐私设置</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">管理数据隐私和安全</div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </BaseCard>

            <!-- 数据导出 -->
            <BaseCard>
              <div class="list-item-apple cursor-pointer" @click="showDataExportModal = true">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-apple flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">数据导出</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">导出你的习惯数据</div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </BaseCard>

            <!-- 帮助与支持 -->
            <BaseCard>
              <div class="list-item-apple cursor-pointer" @click="showHelpModal = true">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-apple flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">帮助与支持</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">获取帮助和联系支持</div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </BaseCard>

            <!-- 关于应用 -->
            <BaseCard>
              <div class="list-item-apple cursor-pointer" @click="showAboutModal = true">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-apple flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">关于应用</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">版本 1.0.0</div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </BaseCard>
          </div>

          <!-- 退出登录 -->
          <div class="pt-4">
            <button
              @click="handleLogout"
              class="w-full py-4 bg-red-500 text-white rounded-apple font-medium hover:bg-red-600 transition-colors duration-200"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">编辑资料</h3>
        
        <!-- 头像上传 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">头像</label>
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
              <img v-if="avatarPreview" :src="avatarPreview" alt="头像预览" class="w-full h-full object-cover" />
              <svg v-else class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff,image/ico"
                @change="handleAvatarChange"
                class="input-apple w-full"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">支持JPG、PNG、GIF、WebP、BMP、SVG、TIFF、ICO格式，大小不超过20MB</p>
            </div>
          </div>
        </div>

        <!-- 用户名 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">用户名</label>
          <input
            v-model="editForm.username"
            type="text"
            placeholder="请输入用户名"
            class="input-apple w-full"
          />
        </div>

        <!-- 修改密码选项 -->
        <div class="mb-6">
          <button
            @click="openPasswordChange"
            class="w-full py-3 text-left text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-apple transition-colors duration-150"
          >
            修改密码
          </button>
        </div>

        <div class="flex space-x-3">
          <button
            @click="showEditModal = false"
            class="btn-secondary flex-1"
            :disabled="isSaving"
          >
            取消
          </button>
          <button
            @click="saveProfile"
            class="btn-primary flex-1"
            :disabled="isSaving"
          >
            <span v-if="isSaving">保存中...</span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 邮箱验证弹窗 -->
    <div v-if="showVerifyModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">验证邮箱</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">邮箱地址</label>
          <input
            v-model="verifyForm.email"
            type="email"
            class="input-apple w-full mb-2"
            readonly
          />
          <button
            @click="sendVerifyCode"
            class="text-sm text-primary-500 hover:text-primary-600"
            :disabled="isSendingCode"
          >
            <span v-if="isSendingCode">发送中...</span>
            <span v-else>发送验证码</span>
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">验证码</label>
          <input
            v-model="verifyForm.code"
            type="text"
            placeholder="请输入验证码"
            class="input-apple w-full"
            @keyup.enter="verifyCode"
          />
        </div>

        <div class="flex space-x-3">
          <button
            @click="showVerifyModal = false"
            class="btn-secondary flex-1"
            :disabled="isVerifying"
          >
            取消
          </button>
          <button
            @click="verifyCode"
            class="btn-primary flex-1"
            :disabled="isVerifying"
          >
            <span v-if="isVerifying">验证中...</span>
            <span v-else>验证</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showChangePasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">修改密码</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="input-apple w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">确认密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="input-apple w-full"
              @keyup.enter="changePassword"
            />
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="showChangePasswordModal = false"
            class="btn-secondary flex-1"
            :disabled="isChangingPassword"
          >
            取消
          </button>
          <button
            @click="changePassword"
            class="btn-primary flex-1"
            :disabled="isChangingPassword"
          >
            <span v-if="isChangingPassword">修改中...</span>
            <span v-else>确认修改</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 通知设置弹窗 -->
    <div v-if="showNotificationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- 弹窗头部 -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-apple-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">通知设置</h3>
            <button @click="showNotificationModal = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 space-y-6">
          <!-- 推送通知 -->
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">推送通知</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">推送通知</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">接收应用推送通知</div>
                </div>
                <button
                  @click="notificationSettings.pushNotifications = !notificationSettings.pushNotifications"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.pushNotifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">邮件通知</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">接收邮件提醒</div>
                </div>
                <button
                  @click="notificationSettings.emailNotifications = !notificationSettings.emailNotifications"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.emailNotifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
          </div>

          <!-- 提醒设置 -->
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">提醒设置</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">习惯提醒</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">习惯完成提醒</div>
                </div>
                <button
                  @click="notificationSettings.habitReminders = !notificationSettings.habitReminders"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.habitReminders ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.habitReminders ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">学习提醒</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">微学习内容提醒</div>
                </div>
                <button
                  @click="notificationSettings.learningReminders = !notificationSettings.learningReminders"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.learningReminders ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.learningReminders ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">周报提醒</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">每周进度报告</div>
                </div>
                <button
                  @click="notificationSettings.weeklyReports = !notificationSettings.weeklyReports"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.weeklyReports ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
          </div>

          <!-- 免打扰时间 -->
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">免打扰时间</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">开启免打扰</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">在指定时间内不接收通知</div>
                </div>
                <button
                  @click="notificationSettings.quietHours = !notificationSettings.quietHours"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="notificationSettings.quietHours ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="notificationSettings.quietHours ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div v-if="notificationSettings.quietHours" class="space-y-3 pl-4">
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400 w-16">开始时间</span>
                  <input
                    v-model="notificationSettings.quietStartTime"
                    type="time"
                    class="input-apple flex-1"
                  />
                </div>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400 w-16">结束时间</span>
                  <input
                    v-model="notificationSettings.quietEndTime"
                    type="time"
                    class="input-apple flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-apple-lg">
          <button @click="saveNotificationSettings" :disabled="isSavingNotifications" class="btn-primary w-full disabled:opacity-50">
            {{ isSavingNotifications ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 隐私设置弹窗 -->
    <div v-if="showPrivacyModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-apple-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">隐私设置</h3>
            <button @click="showPrivacyModal = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">数据收集</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">数据收集</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">允许收集使用数据以改善体验</div>
                </div>
                <button
                  @click="privacySettings.dataCollection = !privacySettings.dataCollection"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="privacySettings.dataCollection ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="privacySettings.dataCollection ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">分析数据</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">用于应用分析和改进</div>
                </div>
                <button
                  @click="privacySettings.analytics = !privacySettings.analytics"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="privacySettings.analytics ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="privacySettings.analytics ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">崩溃报告</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">自动发送崩溃报告</div>
                </div>
                <button
                  @click="privacySettings.crashReports = !privacySettings.crashReports"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="privacySettings.crashReports ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="privacySettings.crashReports ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">分享设置</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">分享进度</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">允许分享学习进度</div>
                </div>
                <button
                  @click="privacySettings.shareProgress = !privacySettings.shareProgress"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="privacySettings.shareProgress ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="privacySettings.shareProgress ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">公开资料</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">允许其他用户查看资料</div>
                </div>
                <button
                  @click="privacySettings.publicProfile = !privacySettings.publicProfile"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="privacySettings.publicProfile ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="privacySettings.publicProfile ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-apple-lg">
          <button @click="savePrivacySettings" :disabled="isSavingPrivacy" class="btn-primary w-full disabled:opacity-50">
            {{ isSavingPrivacy ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 数据导出弹窗 -->
    <div v-if="showDataExportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">数据导出</h3>
            <button @click="showDataExportModal = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">导出格式</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.format" value="json" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">JSON 格式</span>
              </label>
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.format" value="csv" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">CSV 格式</span>
              </label>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">日期范围</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.dateRange" value="all" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">全部数据</span>
              </label>
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.dateRange" value="30days" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">最近30天</span>
              </label>
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.dateRange" value="90days" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">最近90天</span>
              </label>
              <label class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple cursor-pointer">
                <input type="radio" v-model="exportSettings.dateRange" value="1year" class="text-primary-500">
                <span class="text-gray-900 dark:text-gray-100">最近1年</span>
              </label>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">包含内容</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">习惯数据</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">包含所有习惯记录</div>
                </div>
                <button
                  @click="exportSettings.includeHabits = !exportSettings.includeHabits"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="exportSettings.includeHabits ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="exportSettings.includeHabits ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">学习记录</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">包含学习进度</div>
                </div>
                <button
                  @click="exportSettings.includeLearning = !exportSettings.includeLearning"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="exportSettings.includeLearning ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="exportSettings.includeLearning ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">统计数据</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">包含使用统计</div>
                </div>
                <button
                  @click="exportSettings.includeStatistics = !exportSettings.includeStatistics"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="exportSettings.includeStatistics ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="exportSettings.includeStatistics ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="exportData" 
            :disabled="isExporting"
            class="btn-primary w-full flex items-center justify-center space-x-2"
            :class="{ 'opacity-50 cursor-not-allowed': isExporting }"
          >
            <svg v-if="isExporting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isExporting ? '导出中...' : '导出数据' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 帮助与支持弹窗 -->
    <div v-if="showHelpModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-apple-lg">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">帮助与支持</h3>
            <button @click="showHelpModal = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">常见问题</h4>
            <div class="space-y-3">
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-apple">
                <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2">如何创建习惯？</h5>
                <p class="text-sm text-gray-600 dark:text-gray-300">点击底部导航的"添加"按钮，填写习惯信息并保存即可。</p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-apple">
                <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2">如何修改密码？</h5>
                <p class="text-sm text-gray-600 dark:text-gray-300">在个人资料页面点击"编辑资料"，然后选择"修改密码"。</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">联系我们</h4>
            <div class="space-y-3">
              <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-gray-900 dark:text-gray-100">xie112624@gmail.com</span>
              </div>
              <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-apple">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span class="text-gray-900 dark:text-gray-100">在线客服</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于应用弹窗 -->
    <div v-if="showAboutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-apple-lg w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">关于应用</h3>
            <button @click="showAboutModal = false" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Logo size="xl" />
            </div>
            <h4 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">习知 HabitLearner</h4>
            <p class="text-gray-500 dark:text-gray-400">版本 1.0.0</p>
          </div>

          <div class="space-y-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                习知-HabitLearner是一个帮助用户通过“学+练”模式养成好习惯的工具。核心是：选择一个习惯（如喝水、运动、英语学习），app提供每日微学习内容（短课、Tips）来指导，然后用追踪器记录实践。例如，用户选“每日阅读”，app推送5-10分钟的阅读技巧微课，并追踪打卡进度。
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-600 dark:text-gray-300">开发者</span>
                <span class="text-gray-900 dark:text-gray-100">易安</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-600 dark:text-gray-300">发布日期</span>
                <span class="text-gray-900 dark:text-gray-100">2025年9月</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-600 dark:text-gray-300">许可证</span>
                <span class="text-gray-900 dark:text-gray-100">MIT License</span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showAboutModal = false" class="btn-primary w-full">
            确定
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import * as authAPI from '@/api/auth.js'
import * as settingsAPI from '@/api/settings.js'
import * as statsAPI from '@/api/stats.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import Logo from '@/components/Logo.vue'

// Store
const authStore = useAuthStore()
const habitStore = useHabitStore()
const router = useRouter()
const { success, error, warning } = useToast()

// 弹窗状态
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showVerifyModal = ref(false)
const showChangePasswordModal = ref(false)
const showNotificationModal = ref(false)
const showPrivacyModal = ref(false)
const showDataExportModal = ref(false)
const showHelpModal = ref(false)
const showAboutModal = ref(false)

// 表单数据
const editForm = ref({
  username: '',
  avatar: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const verifyForm = ref({
  email: '',
  code: ''
})

// 头像上传
const avatarFile = ref(null)
const avatarPreview = ref('')

// 加载状态
const isSaving = ref(false)
const isSendingCode = ref(false)
const isVerifying = ref(false)
const isChangingPassword = ref(false)
const isSavingNotifications = ref(false)
const isSavingPrivacy = ref(false)
const isExporting = ref(false)

// 设置表单数据
const notificationSettings = ref({
  pushNotifications: true,
  emailNotifications: false,
  habitReminders: true,
  learningReminders: true,
  weeklyReports: true,
  quietHours: false,
  quietStartTime: '22:00',
  quietEndTime: '08:00'
})

const privacySettings = ref({
  dataCollection: true,
  analytics: true,
  crashReports: true,
  shareProgress: false,
  publicProfile: false
})

const exportSettings = ref({
  format: 'json',
  includeHabits: true,
  includeLearning: true,
  includeStatistics: true,
  dateRange: 'all'
})

// 统计数据
const statsData = ref({
  totalHabits: 0,
  totalStreak: 0,
  learningCourses: 0,
  usageDays: 0
})

// 计算属性
const user = computed(() => authStore.user)

// 获取用户特定的localStorage键名
const getUserAvatarKey = () => {
  return user.value ? `userAvatar_${user.value.id}` : 'userAvatar'
}

// 清理其他用户的头像数据（避免数据混乱）
const cleanupOtherUserAvatars = () => {
  if (user.value) {
    const currentUserKey = getUserAvatarKey()
    // 只清理旧的通用键名，保留其他用户的头像数据
    if (localStorage.getItem('userAvatar') && !localStorage.getItem(currentUserKey)) {
      localStorage.removeItem('userAvatar')
      console.log('清理旧的通用头像数据')
    }
  }
}

// 初始化用户数据
const initUserData = () => {
  if (user.value) {
    // 首先清理其他用户的头像数据
    cleanupOtherUserAvatars()
    
    editForm.value.username = user.value.username || ''
    editForm.value.avatar = user.value.avatar || ''
    
    // 优先使用localStorage中的头像（使用用户特定的键名）
    const userAvatarKey = getUserAvatarKey()
    const localAvatar = localStorage.getItem(userAvatarKey)
    
    if (localAvatar && localAvatar !== '') {
      // 使用localStorage中的头像（通常是base64，无CORS问题）
      avatarPreview.value = localAvatar
    } else if (user.value.avatar && user.value.avatar.startsWith('data:')) {
      // 如果用户数据中的头像是base64格式，可以使用
      avatarPreview.value = user.value.avatar
      localStorage.setItem(userAvatarKey, user.value.avatar)
    } else {
      // 清除可能有CORS问题的URL格式头像
      avatarPreview.value = ''
    }
    
    // 强制触发头像显示更新
    nextTick(() => {
      // 触发响应式更新
      avatarPreview.value = avatarPreview.value
    })
  }
}

// 方法
const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/auth')
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 支持的图片格式
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff',
      'image/ico', 'image/x-icon'
    ]
    
    // 检查文件类型
    if (!supportedTypes.includes(file.type.toLowerCase())) {
      warning('请选择支持的图片格式：JPG、PNG、GIF、WebP、BMP、SVG、TIFF、ICO')
      return
    }
    
    // 检查文件大小（增加到20MB）
    if (file.size > 20 * 1024 * 1024) {
      warning('图片大小不能超过20MB')
      return
    }
    
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      editForm.value.avatar = e.target.result
      // 立即保存到localStorage并显示（使用用户特定的键名）
      const userAvatarKey = getUserAvatarKey()
      localStorage.setItem(userAvatarKey, e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

// 获取要显示的头像URL
const getDisplayAvatar = () => {
  // 优先级：localStorage > 用户数据（但避免CORS问题） > 空
  const userAvatarKey = getUserAvatarKey()
  const localAvatar = localStorage.getItem(userAvatarKey)
  const userAvatar = user.value?.avatar
  
  // 优先使用localStorage中的头像（通常是base64，不会有CORS问题）
  if (localAvatar && localAvatar !== '') {
    return localAvatar
  }
  
  // 如果用户数据中的头像是base64格式，可以使用
  if (userAvatar && userAvatar !== '' && userAvatar !== null) {
    // 检查是否是base64格式（以data:开头）
    if (userAvatar.startsWith('data:')) {
      return userAvatar
    }
    // 如果是URL格式，暂时不使用（避免CORS问题）
    console.log('跳过可能有CORS问题的头像URL:', userAvatar)
  }
  
  return null
}

const handleAvatarError = (event) => {
  console.error('头像加载失败:', event.target.src)
  
  // 如果失败的是后端URL，尝试使用localStorage中的头像
  const failedUrl = event.target.src
  const userAvatarKey = getUserAvatarKey()
  const localAvatar = localStorage.getItem(userAvatarKey)
  
  if (failedUrl.includes('localhost:3000') && localAvatar) {
    console.log('后端头像加载失败，使用本地头像')
    // 使用本地头像
    avatarPreview.value = localAvatar
    return
  }
  
  // 如果本地头像也失败，清除并显示默认图标
  localStorage.removeItem(userAvatarKey)
  avatarPreview.value = ''
}

const saveProfile = async () => {
  if (!editForm.value.username.trim()) {
    warning('请输入用户名')
    return
  }
  
  // 检查是否已登录
  const token = localStorage.getItem('token')
  if (!token) {
    error('请先登录', {
      description: '请重新登录后重试'
    })
    router.push('/auth')
    return
  }
  
  isSaving.value = true
  
  try {
    const formData = new FormData()
    formData.append('username', editForm.value.username.trim())
    
    // 如果有选择头像文件，添加到FormData
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }
    
    const response = await authAPI.updateProfile(formData)
    
    if (response.success) {
      // 更新用户数据
      authStore.updateUser(response.data)
      
      // 优先保持前端预览的头像（base64格式，无CORS问题）
      const userAvatarKey = getUserAvatarKey()
      if (avatarPreview.value) {
        localStorage.setItem(userAvatarKey, avatarPreview.value)
      } else if (response.data.avatar) {
        // 如果前端没有预览，但后端返回了头像URL
        // 检查是否是base64格式
        if (response.data.avatar.startsWith('data:')) {
          avatarPreview.value = response.data.avatar
          localStorage.setItem(userAvatarKey, response.data.avatar)
        } else {
          // 如果是URL格式，暂时不保存（避免CORS问题）
          console.log('后端返回的头像URL可能有CORS问题，跳过保存:', response.data.avatar)
        }
      }
      
      success('资料保存成功')
      showEditModal.value = false
      avatarFile.value = null
    } else {
      // API失败时，如果有头像预览，仍然保存到本地
      if (avatarPreview.value) {
        const userAvatarKey = getUserAvatarKey()
        localStorage.setItem(userAvatarKey, avatarPreview.value)
        success('用户名保存失败，但头像已保存到本地')
        showEditModal.value = false
        avatarFile.value = null
      } else {
        error('保存失败', {
          description: response.error || '请重试'
        })
      }
    }
  } catch (error) {
    console.error('保存失败:', error)
    
    // 检查是否是认证错误
    if (error.code === 401 || error.response?.status === 401) {
      error('登录已过期，请重新登录', {
        description: '请重新登录后重试'
      })
      // 清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/auth')
    } else {
      // 网络错误时，如果有头像预览，仍然保存到本地
      if (avatarPreview.value) {
        const userAvatarKey = getUserAvatarKey()
        localStorage.setItem(userAvatarKey, avatarPreview.value)
        success('网络错误，但头像已保存到本地')
        showEditModal.value = false
        avatarFile.value = null
      } else {
        error('保存失败', {
          description: error.error || error.message || '网络错误，请重试'
        })
      }
    }
  } finally {
    isSaving.value = false
  }
}

const openPasswordChange = () => {
  showEditModal.value = false
  showVerifyModal.value = true
  verifyForm.value.email = user.value?.email || ''
}

const sendVerifyCode = async () => {
  if (!verifyForm.value.email) {
    warning('邮箱地址不能为空')
    return
  }
  
  isSendingCode.value = true
  
  try {
    const response = await authAPI.sendVerifyCode(verifyForm.value.email, 'password_change')
    
    if (response.success) {
      success('验证码已发送到您的邮箱')
    } else {
      error('发送验证码失败', {
        description: response.error || '请重试'
      })
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    error('发送验证码失败', {
      description: error.error || '请重试'
    })
  } finally {
    isSendingCode.value = false
  }
}

const verifyCode = async () => {
  if (!verifyForm.value.code.trim()) {
    warning('请输入验证码')
    return
  }
  
  isVerifying.value = true
  
  try {
    const response = await authAPI.verifyCode(verifyForm.value.email, verifyForm.value.code)
    
    if (response.success) {
      showVerifyModal.value = false
      showChangePasswordModal.value = true
      
      // 重置验证码表单
      verifyForm.value.code = ''
    } else {
      error('验证码错误', {
        description: response.error || '请重试'
      })
    }
  } catch (error) {
    console.error('验证失败:', error)
    error('验证失败', {
      description: error.error || '请重试'
    })
  } finally {
    isVerifying.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.newPassword.trim()) {
    warning('请输入新密码')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    warning('两次输入的密码不一致')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    warning('密码长度不能少于6位')
    return
  }
  
  isChangingPassword.value = true
  
  try {
    const response = await authAPI.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    if (response.success) {
      success('密码修改成功')
      showChangePasswordModal.value = false
      
      // 重置密码表单
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      error('修改密码失败', {
        description: response.error || '请重试'
      })
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    error('修改密码失败', {
      description: error.error || '请重试'
    })
  } finally {
    isChangingPassword.value = false
  }
}

const exportData = async () => {
  isExporting.value = true
  try {
    // 收集要导出的数据
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        format: exportSettings.value.format,
        version: '1.0.0'
      },
      user: user.value
    }

    // 根据设置添加不同类型的数据
    if (exportSettings.value.includeHabits) {
      exportData.habits = filterHabitsByDateRange(habitStore.habits, exportSettings.value.dateRange)
    }

    if (exportSettings.value.includeLearning) {
      // 这里可以添加学习数据，暂时使用模拟数据
      exportData.learning = {
        courses: [],
        progress: [],
        notes: []
      }
    }

    if (exportSettings.value.includeStatistics) {
      exportData.statistics = {
        totalHabits: habitStore.habits.length,
        totalStreak: habitStore.habits.reduce((sum, habit) => sum + (habit.streak || 0), 0),
        totalCheckIns: habitStore.habits.reduce((sum, habit) => {
          return sum + (habit.checkIns ? habit.checkIns.reduce((checkSum, checkIn) => checkSum + checkIn.count, 0) : 0)
        }, 0),
        exportDate: new Date().toISOString()
      }
    }

    // 根据格式生成文件
    let fileContent, fileName, mimeType

    if (exportSettings.value.format === 'json') {
      fileContent = JSON.stringify(exportData, null, 2)
      fileName = `habit-learner-data-${new Date().toISOString().split('T')[0]}.json`
      mimeType = 'application/json'
    } else if (exportSettings.value.format === 'csv') {
      // 生成CSV格式
      const csvData = generateCSVData(exportData)
      fileContent = csvData
      fileName = `habit-learner-data-${new Date().toISOString().split('T')[0]}.csv`
      mimeType = 'text/csv'
    }

    // 创建并下载文件
    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    success('数据导出成功', {
      description: `已导出 ${fileName}`
    })
    showDataExportModal.value = false
  } catch (error) {
    console.error('导出数据失败:', error)
    error('数据导出失败', {
      description: error.message || '请重试'
    })
  } finally {
    isExporting.value = false
  }
}

// 根据日期范围过滤习惯数据
const filterHabitsByDateRange = (habits, dateRange) => {
  if (dateRange === 'all') {
    return habits
  }

  const now = new Date()
  let startDate

  switch (dateRange) {
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return habits
  }

  return habits.map(habit => {
    const filteredHabit = { ...habit }
    
    // 过滤打卡记录
    if (habit.checkIns) {
      filteredHabit.checkIns = habit.checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.date)
        return checkInDate >= startDate
      })
    }
    
    // 过滤每日留言
    if (habit.dailyComments) {
      filteredHabit.dailyComments = habit.dailyComments.filter(comment => {
        const commentDate = new Date(comment.date)
        return commentDate >= startDate
      })
    }
    
    return filteredHabit
  }).filter(habit => {
    // 只保留在指定时间范围内有活动的习惯
    return (habit.checkIns && habit.checkIns.length > 0) || 
           (habit.dailyComments && habit.dailyComments.length > 0) ||
           new Date(habit.createdAt) >= startDate
  })
}

// 生成CSV格式数据
const generateCSVData = (data) => {
  let csvContent = ''
  
  // 添加基本信息
  csvContent += '数据类型,字段,值\n'
  csvContent += `导出信息,导出日期,${data.exportInfo.exportDate}\n`
  csvContent += `导出信息,格式,${data.exportInfo.format}\n`
  csvContent += `导出信息,版本,${data.exportInfo.version}\n`
  
  if (data.user) {
    csvContent += `用户信息,用户名,${data.user.name || ''}\n`
    csvContent += `用户信息,邮箱,${data.user.email || ''}\n`
    csvContent += `用户信息,注册时间,${data.user.createdAt || ''}\n`
  }
  
  // 添加习惯数据
  if (data.habits && data.habits.length > 0) {
    csvContent += '\n习惯数据\n'
    csvContent += '习惯名称,分类,目标次数,当前连续天数,总打卡次数,创建时间,最后打卡时间\n'
    
    data.habits.forEach(habit => {
      const lastCheckIn = habit.checkIns && habit.checkIns.length > 0 
        ? habit.checkIns[habit.checkIns.length - 1].date 
        : ''
      const totalCheckIns = habit.checkIns 
        ? habit.checkIns.reduce((sum, checkIn) => sum + checkIn.count, 0)
        : 0
      
      csvContent += `"${habit.name || ''}","${habit.category || ''}",${habit.target || 1},${habit.streak || 0},${totalCheckIns},"${habit.createdAt || ''}","${lastCheckIn}"\n`
    })
  }
  
  // 添加统计数据
  if (data.statistics) {
    csvContent += '\n统计数据\n'
    csvContent += '统计项目,数值\n'
    csvContent += `总习惯数,${data.statistics.totalHabits}\n`
    csvContent += `总连续天数,${data.statistics.totalStreak}\n`
    csvContent += `总打卡次数,${data.statistics.totalCheckIns}\n`
  }
  
  return csvContent
}

// 获取用户特定的通知设置localStorage键名
const getUserNotificationSettingsKey = () => {
  return user.value ? `notificationSettings_${user.value.id}` : 'notificationSettings'
}

// 保存通知设置
const saveNotificationSettings = async () => {
  isSavingNotifications.value = true
  
  try {
    // 保存到localStorage（使用用户特定的键名）
    const userNotificationSettingsKey = getUserNotificationSettingsKey()
    localStorage.setItem(userNotificationSettingsKey, JSON.stringify(notificationSettings.value))
    
    // 这里可以调用API保存到服务器
    // const response = await settingsAPI.updateNotificationSettings(notificationSettings.value)
    
    success('通知设置已保存')
    showNotificationModal.value = false
  } catch (error) {
    console.error('保存通知设置失败:', error)
    error('保存失败', {
      description: '请重试'
    })
  } finally {
    isSavingNotifications.value = false
  }
}

// 获取用户特定的隐私设置localStorage键名
const getUserPrivacySettingsKey = () => {
  return user.value ? `privacySettings_${user.value.id}` : 'privacySettings'
}

// 保存隐私设置
const savePrivacySettings = async () => {
  isSavingPrivacy.value = true
  
  try {
    // 保存到localStorage（使用用户特定的键名）
    const userPrivacySettingsKey = getUserPrivacySettingsKey()
    localStorage.setItem(userPrivacySettingsKey, JSON.stringify(privacySettings.value))
    
    // 这里可以调用API保存到服务器
    // const response = await settingsAPI.updatePrivacySettings(privacySettings.value)
    
    success('隐私设置已保存')
    showPrivacyModal.value = false
  } catch (error) {
    console.error('保存隐私设置失败:', error)
    error('保存失败', {
      description: '请重试'
    })
  } finally {
    isSavingPrivacy.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await statsAPI.getStatsOverview()
    if (response.success) {
      statsData.value = {
        totalHabits: response.data.totalHabits,
        totalStreak: response.data.totalStreak,
        learningCourses: response.data.learningProgress.totalCourses,
        usageDays: Math.floor((Date.now() - new Date(user.value?.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 组件挂载时初始化数据
// 加载通知设置
const loadNotificationSettings = () => {
  const userNotificationSettingsKey = getUserNotificationSettingsKey()
  const saved = localStorage.getItem(userNotificationSettingsKey)
  if (saved) {
    try {
      notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(saved) }
    } catch (error) {
      console.error('加载通知设置失败:', error)
    }
  }
}

// 加载隐私设置
const loadPrivacySettings = () => {
  const userPrivacySettingsKey = getUserPrivacySettingsKey()
  const saved = localStorage.getItem(userPrivacySettingsKey)
  if (saved) {
    try {
      privacySettings.value = { ...privacySettings.value, ...JSON.parse(saved) }
    } catch (error) {
      console.error('加载隐私设置失败:', error)
    }
  }
}

onMounted(() => {
  initUserData()
  loadStats()
  loadNotificationSettings()
  loadPrivacySettings()
})
</script>
