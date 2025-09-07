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
                  v-if="user?.avatar" 
                  :src="user.avatar" 
                  alt="用户头像" 
                  class="w-full h-full object-cover"
                />
                <svg v-else class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">{{ user?.name || '用户' }}</h2>
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
                <div class="text-2xl font-bold text-primary-500">{{ habitStore.totalHabits }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">总习惯</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-green-500">{{ habitStore.totalStreak }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">总连续天数</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-orange-500">15</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">学习课程</div>
              </div>
              <div class="text-center py-4">
                <div class="text-2xl font-bold text-purple-500">7</div>
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
                accept="image/*"
                @change="handleAvatarChange"
                class="input-apple w-full"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">支持JPG、PNG等格式，大小不超过10MB</p>
            </div>
          </div>
        </div>

        <!-- 用户名 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">用户名</label>
          <input
            v-model="editForm.name"
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
          <button @click="showNotificationModal = false" class="btn-primary w-full">
            保存设置
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
          <button @click="showPrivacyModal = false" class="btn-primary w-full">
            保存设置
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
          <button @click="exportData" class="btn-primary w-full">
            导出数据
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import Logo from '@/components/Logo.vue'

// Store
const authStore = useAuthStore()
const habitStore = useHabitStore()
const router = useRouter()

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
  name: '',
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
  analytics: false,
  crashReports: true,
  personalizedAds: false,
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

// 计算属性
const user = computed(() => authStore.user)

// 初始化用户数据
const initUserData = () => {
  if (user.value) {
    editForm.value.name = user.value.name || ''
    editForm.value.avatar = user.value.avatar || ''
    avatarPreview.value = user.value.avatar || ''
  }
}

// 方法
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/auth')
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    
    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }
    
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      editForm.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = async () => {
  if (!editForm.value.name.trim()) {
    alert('请输入用户名')
    return
  }
  
  isSaving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息到store
    const updatedUser = {
      ...user.value,
      name: editForm.value.name.trim(),
      avatar: editForm.value.avatar
    }
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // 更新authStore中的用户信息
    authStore.updateUser(updatedUser)
    
    alert('资料保存成功')
    showEditModal.value = false
    
    // 重置表单
    avatarFile.value = null
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
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
    alert('邮箱地址不能为空')
    return
  }
  
  isSendingCode.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟发送验证码
    console.log('发送验证码到:', verifyForm.value.email)
    alert('验证码已发送到您的邮箱')
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert('发送验证码失败，请重试')
  } finally {
    isSendingCode.value = false
  }
}

const verifyCode = async () => {
  if (!verifyForm.value.code.trim()) {
    alert('请输入验证码')
    return
  }
  
  isVerifying.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟验证码验证（这里简化处理，实际应该调用API）
    if (verifyForm.value.code === '123456') {
      showVerifyModal.value = false
      showChangePasswordModal.value = true
      
      // 重置验证码表单
      verifyForm.value.code = ''
    } else {
      alert('验证码错误，请重试')
    }
  } catch (error) {
    console.error('验证失败:', error)
    alert('验证失败，请重试')
  } finally {
    isVerifying.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.newPassword.trim()) {
    alert('请输入新密码')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    alert('密码长度不能少于6位')
    return
  }
  
  isChangingPassword.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟密码修改
    console.log('修改密码:', passwordForm.value)
    
    // 更新用户密码（实际应该调用API）
    const updatedUser = {
      ...user.value,
      password: passwordForm.value.newPassword
    }
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    alert('密码修改成功')
    showChangePasswordModal.value = false
    
    // 重置密码表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('修改密码失败，请重试')
  } finally {
    isChangingPassword.value = false
  }
}

const exportData = () => {
  // 这里应该调用API导出数据
  console.log('导出数据:', exportSettings.value)
  alert('数据导出成功')
  showDataExportModal.value = false
}

// 组件挂载时初始化数据
onMounted(() => {
  initUserData()
})
</script>
