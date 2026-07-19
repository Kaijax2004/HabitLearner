<template>
  <AppLayout title="个人资料">
    <div class="space-y-6 p-4 lg:p-0">
      <div class="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section class="space-y-6">
          <BaseCard>
            <div class="flex flex-col items-center py-4 text-center">
              <div class="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                <img
                  v-if="displayAvatar"
                  :src="displayAvatar"
                  alt="用户头像"
                  class="h-full w-full object-cover"
                  @error="handleAvatarError"
                />
                <svg v-else class="h-10 w-10 text-zinc-500 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {{ userDisplayName }}
              </h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {{ user?.email || '未绑定邮箱' }}
              </p>

              <div class="mt-5 flex w-full gap-3">
                <button type="button" class="btn-primary flex-1" @click="openEditProfile">
                  编辑资料
                </button>
                <button type="button" class="btn-secondary flex-1" @click="openPasswordChange">
                  修改密码
                </button>
              </div>
            </div>
          </BaseCard>

          <BaseCard title="数据概览">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-apple border border-zinc-200/80 bg-white/70 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <div class="text-2xl font-semibold text-zinc-950 dark:text-white">{{ statsData.totalHabits }}</div>
                <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">习惯总数</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-white/70 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <div class="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{{ statsData.totalStreak }}</div>
                <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">累计连击</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-white/70 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <div class="text-2xl font-semibold text-amber-600 dark:text-amber-400">{{ statsData.learningCourses }}</div>
                <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">学习课程</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-white/70 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <div class="text-2xl font-semibold text-sky-600 dark:text-sky-400">{{ statsData.usageDays }}</div>
                <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">使用天数</div>
              </div>
            </div>
          </BaseCard>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">设置中心</h3>
            <span class="text-sm text-zinc-500 dark:text-zinc-400">提醒、隐私与数据管理</span>
          </div>

          <BaseCard title="账户安全">
            <div class="space-y-3">
              <div
                v-for="item in securitySummaryItems"
                :key="item.label"
                class="flex items-start justify-between gap-4 rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div class="min-w-0">
                  <div class="font-medium text-zinc-950 dark:text-white">{{ item.label }}</div>
                  <div class="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ item.description }}</div>
                </div>
                <span :class="item.badgeClass">{{ item.value }}</span>
              </div>
            </div>
            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" class="btn-primary flex-1" @click="openPasswordChange">
                修改密码
              </button>
              <button type="button" class="btn-secondary flex-1" @click="openEditProfile">
                更新资料
              </button>
            </div>
          </BaseCard>

          <BaseCard title="提醒摘要">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">提醒时间</div>
                <div class="mt-1 text-base font-medium text-zinc-950 dark:text-white">{{ notificationSettings.reminderTime }}</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">重复日期</div>
                <div class="mt-1 text-base font-medium text-zinc-950 dark:text-white">{{ reminderDaysLabel }}</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">推送状态</div>
                <div class="mt-1 text-base font-medium" :class="notificationSettings.pushNotifications ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'">
                  {{ notificationSettings.pushNotifications ? '已开启' : '已关闭' }}
                </div>
              </div>
            </div>
            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" class="btn-primary flex-1" @click="showNotificationModal = true">
                调整提醒
              </button>
              <button type="button" class="btn-secondary flex-1" @click="openReminderTest">
                测试提醒
              </button>
            </div>
          </BaseCard>

          <BaseCard v-if="isAdmin" title="管理员邮件中心">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">收件用户</div>
                <div class="mt-1 text-base font-medium text-zinc-950 dark:text-white">{{ adminEmailAudience.totalUsers || 0 }}</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">发件邮箱</div>
                <div class="mt-1 text-base font-medium text-zinc-950 dark:text-white">{{ adminEmailAudience.sender?.fromEmail || 'GF@habitlearner.cn' }}</div>
              </div>
              <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="text-sm text-zinc-500 dark:text-zinc-400">发送通道</div>
                <div class="mt-1 text-base font-medium" :class="adminEmailAudience.delivery?.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300'">
                  {{ adminEmailAudience.delivery?.enabled ? 'Resend 已启用' : '开发模式' }}
                </div>
              </div>
            </div>
            <div class="mt-4 rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
              管理员可以向所有已绑定邮箱的用户发送产品更新、学习分享或活动通知。当前默认发件邮箱固定为 `GF@habitlearner.cn`。
            </div>
            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" class="btn-primary flex-1" @click="openAdminMailModal">
                写邮件给所有用户
              </button>
              <button type="button" class="btn-secondary flex-1" :disabled="isLoadingAdminAudience" @click="loadAdminAudience">
                {{ isLoadingAdminAudience ? '刷新中...' : '刷新受众数据' }}
              </button>
            </div>
          </BaseCard>

          <BaseCard
            v-for="item in settingItems"
            :key="item.title"
            padding="none"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 rounded-apple p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
              @click="item.action"
            >
              <div class="flex items-center gap-3">
                <div :class="['flex h-11 w-11 items-center justify-center rounded-2xl border', item.iconClass]">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-zinc-950 dark:text-white">{{ item.title }}</div>
                  <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ item.description }}</div>
                </div>
              </div>
              <svg class="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </BaseCard>

          <BaseCard>
            <div class="flex flex-col gap-3 sm:flex-row">
              <button type="button" class="btn-secondary flex-1" @click="showHelpModal = true">
                使用帮助
              </button>
              <button type="button" class="btn-secondary flex-1" @click="showAboutModal = true">
                关于应用
              </button>
              <button
                type="button"
                class="flex-1 rounded-apple bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
                @click="handleLogout"
              >
                退出登录
              </button>
            </div>
          </BaseCard>
        </section>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-card max-w-lg">
        <ModalHeader title="编辑资料" @close="closeEditModal" />
        <div class="space-y-6 p-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">头像</label>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                <img v-if="avatarPreview" :src="avatarPreview" alt="头像预览" class="h-full w-full object-cover" />
                <svg v-else class="h-8 w-8 text-zinc-500 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff,image/x-icon,image/vnd.microsoft.icon"
                  class="input-apple"
                  @change="handleAvatarChange"
                />
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、GIF、WebP、BMP、SVG、TIFF、ICO，大小不超过 20MB。
                </p>
              </div>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">用户名</label>
            <input
              v-model.trim="editForm.username"
              type="text"
              class="input-apple"
              placeholder="请输入用户名"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary flex-1" :disabled="isSaving" @click="closeEditModal">
            取消
          </button>
          <button type="button" class="btn-primary flex-1" :disabled="isSaving" @click="saveProfile">
            {{ isSaving ? '保存中...' : '保存资料' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showVerifyModal" class="modal-overlay" @click.self="closeVerifyModal">
      <div class="modal-card max-w-md">
        <ModalHeader title="验证邮箱" @close="closeVerifyModal" />
        <div class="space-y-5 p-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">邮箱地址</label>
            <input v-model="verifyForm.email" type="email" class="input-apple" readonly />
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-200">验证码</label>
              <button
                type="button"
                class="text-sm font-medium text-zinc-700 hover:text-zinc-950 disabled:opacity-50 dark:text-zinc-300 dark:hover:text-white"
                :disabled="isSendingCode || verifyCodeCountdown > 0"
                @click="sendVerifyCode"
              >
                {{ isSendingCode ? '发送中...' : verifyCodeCountdown > 0 ? `${verifyCodeCountdown}s 后重发` : '发送验证码' }}
              </button>
            </div>
            <input
              v-model.trim="verifyForm.code"
              type="text"
              class="input-apple"
              placeholder="请输入验证码"
              @keyup.enter="verifyCode"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary flex-1" :disabled="isVerifying" @click="closeVerifyModal">
            取消
          </button>
          <button type="button" class="btn-primary flex-1" :disabled="isVerifying" @click="verifyCode">
            {{ isVerifying ? '验证中...' : '下一步' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showChangePasswordModal" class="modal-overlay" @click.self="closeChangePasswordModal">
      <div class="modal-card max-w-md">
        <ModalHeader title="修改密码" @close="closeChangePasswordModal" />
        <div class="space-y-5 p-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="input-apple"
              placeholder="至少 6 位"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="input-apple"
              placeholder="请再次输入新密码"
              @keyup.enter="changePassword"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary flex-1" :disabled="isChangingPassword" @click="closeChangePasswordModal">
            取消
          </button>
          <button type="button" class="btn-primary flex-1" :disabled="isChangingPassword" @click="changePassword">
            {{ isChangingPassword ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>

    <SettingsModal
      v-if="showNotificationModal"
      title="通知设置"
      :saving="isSavingNotifications"
      @close="showNotificationModal = false"
      @save="saveNotificationSettings"
    >
      <ToggleRow v-model="notificationSettings.pushNotifications" title="推送通知" description="允许浏览器和应用内提醒弹窗" />
      <ToggleRow v-model="notificationSettings.emailNotifications" title="邮件通知" description="接收邮件提醒和状态通知" />
      <ToggleRow v-model="notificationSettings.habitReminders" title="习惯提醒" description="根据习惯提醒时间触发应用内提醒" />
      <ToggleRow v-model="notificationSettings.planReminders" title="计划提醒" description="保留计划提醒开关，兼容后端设置字段" />
      <ToggleRow v-model="notificationSettings.learningReminders" title="学习提醒" description="接收学习任务和内容更新提醒" />
      <ToggleRow v-model="notificationSettings.weeklyReports" title="周报提醒" description="每周汇总习惯与学习进度" />
      <ToggleRow v-model="notificationSettings.quietHours" title="免打扰时段" description="在指定时段内暂停推送提醒" />

      <div class="grid gap-4 rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div class="flex items-center gap-3">
          <span class="w-20 text-sm text-zinc-600 dark:text-zinc-300">每日提醒</span>
          <input v-model="notificationSettings.reminderTime" type="time" class="input-apple flex-1" />
        </div>
        <div>
          <div class="mb-3 text-sm text-zinc-600 dark:text-zinc-300">重复日期</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in weekdayOptions"
              :key="day.value"
              type="button"
              :class="['day-chip', notificationSettings.reminderDays.includes(day.value) ? 'day-chip-active' : 'day-chip-inactive']"
              @click="toggleReminderDay(day.value)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
        <button type="button" class="btn-secondary" @click="openReminderTest">
          打开提醒测试页
        </button>
      </div>

      <div v-if="notificationSettings.quietHours" class="grid gap-3 rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div class="flex items-center gap-3">
          <span class="w-20 text-sm text-zinc-600 dark:text-zinc-300">开始时间</span>
          <input v-model="notificationSettings.quietStartTime" type="time" class="input-apple flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <span class="w-20 text-sm text-zinc-600 dark:text-zinc-300">结束时间</span>
          <input v-model="notificationSettings.quietEndTime" type="time" class="input-apple flex-1" />
        </div>
      </div>
    </SettingsModal>

    <SettingsModal
      v-if="showPrivacyModal"
      title="隐私设置"
      :saving="isSavingPrivacy"
      @close="showPrivacyModal = false"
      @save="savePrivacySettings"
    >
      <ToggleRow v-model="privacySettings.dataCollection" title="数据收集" description="允许收集必要使用数据以改进体验" />
      <ToggleRow v-model="privacySettings.analytics" title="匿名分析" description="用于统计性能和功能使用情况" />
      <ToggleRow v-model="privacySettings.crashReports" title="崩溃报告" description="出现异常时自动发送错误日志" />
      <ToggleRow v-model="privacySettings.shareProgress" title="分享进度" description="允许分享习惯与学习进展" />
      <ToggleRow v-model="privacySettings.publicProfile" title="公开资料" description="允许其他用户查看你的公开资料" />
    </SettingsModal>

    <div v-if="showDataExportModal" class="modal-overlay" @click.self="showDataExportModal = false">
      <div class="modal-card max-w-xl">
        <ModalHeader title="导出数据" @close="showDataExportModal = false" />
        <div class="space-y-6 p-6">
          <div class="space-y-3">
            <h4 class="text-base font-medium text-zinc-950 dark:text-white">导出格式</h4>
            <label class="option-row">
              <input v-model="exportSettings.format" type="radio" value="json" />
              <span>JSON</span>
            </label>
            <label class="option-row">
              <input v-model="exportSettings.format" type="radio" value="csv" />
              <span>CSV</span>
            </label>
          </div>

          <div class="space-y-3">
            <h4 class="text-base font-medium text-zinc-950 dark:text-white">时间范围</h4>
            <label v-for="range in dateRanges" :key="range.value" class="option-row">
              <input v-model="exportSettings.dateRange" type="radio" :value="range.value" />
              <span>{{ range.label }}</span>
            </label>
          </div>

          <div class="space-y-3">
            <h4 class="text-base font-medium text-zinc-950 dark:text-white">包含内容</h4>
            <ToggleRow v-model="exportSettings.includeHabits" title="习惯数据" description="包含习惯列表、打卡和留言" />
            <ToggleRow v-model="exportSettings.includePlans" title="计划数据" description="包含计划元信息与块结构内容" />
            <ToggleRow v-model="exportSettings.includeLearning" title="学习记录" description="导出学习模块占位信息与进度摘要" />
            <ToggleRow v-model="exportSettings.includeStatistics" title="统计数据" description="导出整体使用情况与累计数据" />
          </div>

          <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 text-xs leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            当前导出由后端实时汇总生成，包含账户、习惯、计划和学习相关数据快照。CSV 更适合表格查看，JSON 更适合备份与迁移。
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-primary w-full" :disabled="isExporting" @click="exportData">
            {{ isExporting ? '导出中...' : '开始导出' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAdminMailModal" class="modal-overlay" @click.self="showAdminMailModal = false">
      <div class="modal-card max-w-2xl">
        <ModalHeader title="管理员群发邮件" @close="showAdminMailModal = false" />
        <div class="space-y-5 p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">邮件类型</label>
              <select v-model="adminMailForm.category" class="input-apple">
                <option value="product_update">产品更新</option>
                <option value="learning_share">学习分享</option>
                <option value="activity">活动通知</option>
                <option value="custom">自定义邮件</option>
              </select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">回复邮箱</label>
              <input v-model.trim="adminMailForm.replyTo" type="email" class="input-apple" placeholder="可选，留空则使用系统默认" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">邮件标题</label>
            <input v-model.trim="adminMailForm.subject" type="text" class="input-apple" placeholder="例如：本周更新与好玩的新功能" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">摘要</label>
            <input v-model.trim="adminMailForm.summary" type="text" class="input-apple" placeholder="用于邮件顶部简介，控制在 200 字内" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">正文</label>
            <textarea
              v-model.trim="adminMailForm.content"
              rows="10"
              class="input-apple min-h-[240px] resize-y"
              placeholder="输入正文内容。系统会自动按段落排版，正文图片会展示在正文下方。"
            />
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium text-zinc-950 dark:text-white">正文图片</div>
                  <div class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">会作为邮件正文下方图片展示，不暴露外链。</div>
                </div>
                <label class="admin-upload-trigger">
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple @change="handleAdminInlineImagesChange" />
                  {{ isUploadingAdminImages ? '上传中...' : '上传图片' }}
                </label>
              </div>

              <div v-if="adminMailForm.inlineImages.length" class="space-y-3">
                <div
                  v-for="(image, index) in adminMailForm.inlineImages"
                  :key="`${image.path}-${index}`"
                  class="rounded-apple border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <div class="flex items-start gap-3">
                    <img :src="resolveMediaUrl(image.absoluteUrl || image.path)" :alt="image.filename" class="h-16 w-16 rounded-2xl object-cover" />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ image.filename }}</div>
                      <div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ formatBytes(image.size) }}</div>
                    </div>
                    <button type="button" class="text-xs font-medium text-red-500 hover:text-red-600" @click="removeAdminInlineImage(index)">
                      删除
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="rounded-apple border border-dashed border-zinc-200/80 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                还没有正文图片
              </div>
            </div>

            <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium text-zinc-950 dark:text-white">邮件附件</div>
                  <div class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">支持 PDF、Office、压缩包、音视频等现有上传类型。</div>
                </div>
                <label class="admin-upload-trigger">
                  <input type="file" multiple @change="handleAdminAttachmentsChange" />
                  {{ isUploadingAdminAttachments ? '上传中...' : '上传附件' }}
                </label>
              </div>

              <div v-if="adminMailForm.attachments.length" class="space-y-3">
                <div
                  v-for="(file, index) in adminMailForm.attachments"
                  :key="`${file.path}-${index}`"
                  class="flex items-center gap-3 rounded-apple border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
                    {{ (file.filename.split('.').pop() || 'FILE').slice(0, 4).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ file.filename }}</div>
                    <div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ formatBytes(file.size) }}</div>
                  </div>
                  <button type="button" class="text-xs font-medium text-red-500 hover:text-red-600" @click="removeAdminAttachment(index)">
                    删除
                  </button>
                </div>
              </div>
              <div v-else class="rounded-apple border border-dashed border-zinc-200/80 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                还没有附件
              </div>
            </div>
          </div>

          <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            <div>预计收件人数：{{ adminEmailAudience.totalUsers || 0 }}</div>
            <div>发件邮箱：{{ adminEmailAudience.sender?.fromEmail || 'GF@habitlearner.cn' }}</div>
            <div>发送模式：{{ adminEmailAudience.delivery?.message || '尚未加载' }}</div>
            <div>正文图片：{{ adminMailForm.inlineImages.length }} 张，附件：{{ adminMailForm.attachments.length }} 个</div>
            <div>媒体总大小：{{ adminMailAssetSizeLabel }} / 28 MB</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary flex-1" :disabled="isSendingAdminMail" @click="showAdminMailModal = false">
            取消
          </button>
          <button type="button" class="btn-primary flex-1" :disabled="isSendingAdminMail" @click="sendAdminMail">
            {{ isSendingAdminMail ? '发送中...' : '发送给全部用户' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-card max-w-xl">
        <ModalHeader title="使用帮助" @close="showHelpModal = false" />
        <div class="space-y-4 p-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h4 class="mb-2 text-base font-medium text-zinc-950 dark:text-white">提醒为何没有触发？</h4>
            <p>请确认习惯已开启提醒、设置了提醒时间，并且通知设置中的“习惯提醒”和“推送通知”保持开启。若浏览器权限被拒绝，可在系统或浏览器设置中重新允许通知。</p>
          </div>
          <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h4 class="mb-2 text-base font-medium text-zinc-950 dark:text-white">刷新后需要重新登录怎么办？</h4>
            <p>当前版本会在刷新时通过 token 和 `getProfile` 自动恢复登录态；如果仍然退出，请优先检查后端是否返回 401、JWT 是否过期，或本机时间是否异常。</p>
          </div>
          <div class="rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h4 class="mb-2 text-base font-medium text-zinc-950 dark:text-white">联系支持</h4>
            <p>邮箱：xie112624@gmail.com</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAboutModal" class="modal-overlay" @click.self="showAboutModal = false">
      <div class="modal-card max-w-md">
        <ModalHeader title="关于应用" @close="showAboutModal = false" />
        <div class="space-y-5 p-6 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Logo size="xl" />
          </div>
          <div>
            <h4 class="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">习知 HabitLearner</h4>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">版本 {{ appVersion }}</p>
          </div>
          <p class="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            HabitLearner 通过“学习 + 习惯执行 + 计划编辑”的组合方式帮助用户建立长期秩序，并提供提醒、进度追踪和内容沉淀能力。
          </p>
          <div class="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div class="flex items-center justify-between">
              <span>开发者</span>
              <span class="text-zinc-950 dark:text-white">易安</span>
            </div>
            <div class="flex items-center justify-between">
              <span>许可协议</span>
              <span class="text-zinc-950 dark:text-white">MIT License</span>
            </div>
            <div class="flex items-center justify-between">
              <span>当前模块</span>
              <span class="text-zinc-950 dark:text-white">习惯 / 计划 / 学习 / AI</span>
            </div>
            <div class="flex items-center justify-between">
              <span>登录恢复</span>
              <span class="text-zinc-950 dark:text-white">Token + Profile</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-primary w-full" @click="showAboutModal = false">关闭</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import * as authAPI from '@/api/auth.js'
import * as settingsAPI from '@/api/settings.js'
import * as statsAPI from '@/api/stats.js'
import { uploadFile, uploadImage } from '@/api/uploads.js'
import { resolveMediaUrl } from '@/utils/media.js'
import { useToast } from '@/composables/useToast'
import {
  cacheNotificationSettings,
  readNotificationSettings,
  requestNotificationPermission,
  normalizeNotificationSettings
} from '@/utils/notificationSettings.js'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import Logo from '@/components/Logo.vue'

const appVersion = '1.0.0'
const MAX_ADMIN_MAIL_ASSET_BYTES = 28 * 1024 * 1024

const ModalHeader = defineComponent({
  props: {
    title: { type: String, required: true }
  },
  emits: ['close'],
  setup(props, { emit }) {
    return () => h('div', {
      class: 'sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/95'
    }, [
      h('h3', { class: 'text-lg font-semibold tracking-tight text-zinc-950 dark:text-white' }, props.title),
      h('button', {
        class: 'rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white',
        onClick: () => emit('close')
      }, [
        h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M6 18L18 6M6 6l12 12'
          })
        ])
      ])
    ])
  }
})

const SettingsModal = defineComponent({
  props: {
    title: { type: String, required: true },
    saving: { type: Boolean, default: false }
  },
  emits: ['close', 'save'],
  setup(props, { emit, slots }) {
    return () => h('div', {
      class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm'
    }, [
      h('div', {
        class: 'w-full max-w-xl overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-apple-lg dark:border-zinc-800 dark:bg-zinc-950'
      }, [
        h(ModalHeader, { title: props.title, onClose: () => emit('close') }),
        h('div', { class: 'space-y-4 p-6' }, slots.default?.()),
        h('div', {
          class: 'border-t border-zinc-200 bg-white/90 px-6 py-4 backdrop-blur-apple dark:border-zinc-800 dark:bg-zinc-950/90'
        }, [
          h('button', {
            class: 'btn-primary w-full',
            disabled: props.saving,
            onClick: () => emit('save')
          }, props.saving ? '保存中...' : '保存设置')
        ])
      ])
    ])
  }
})

const ToggleRow = defineComponent({
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', {
      class: 'flex items-start justify-between gap-4 rounded-apple border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60'
    }, [
      h('div', { class: 'min-w-0' }, [
        h('div', { class: 'font-medium text-zinc-950 dark:text-white' }, props.title),
        props.description
          ? h('div', { class: 'mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400' }, props.description)
          : null
      ]),
      h('button', {
        type: 'button',
        class: [
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200',
          props.modelValue ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
        ],
        onClick: () => emit('update:modelValue', !props.modelValue)
      }, [
        h('span', {
          class: [
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 dark:bg-zinc-950',
            props.modelValue ? 'translate-x-6 dark:bg-zinc-950' : 'translate-x-1'
          ]
        })
      ])
    ])
  }
})

const DEFAULT_UI_NOTIFICATION_SETTINGS = {
  ...normalizeNotificationSettings(),
  planReminders: true,
  reminderTime: '09:00',
  reminderDays: [1, 2, 3, 4, 5, 6, 7]
}

const normalizeUiNotificationSettings = (settings = {}) => ({
  ...DEFAULT_UI_NOTIFICATION_SETTINGS,
  ...normalizeNotificationSettings(settings),
  habitReminders: settings.habitReminders ?? settings.habitsReminder ?? DEFAULT_UI_NOTIFICATION_SETTINGS.habitReminders,
  planReminders: settings.planReminders ?? settings.plansReminder ?? DEFAULT_UI_NOTIFICATION_SETTINGS.planReminders,
  reminderTime: settings.reminderTime || DEFAULT_UI_NOTIFICATION_SETTINGS.reminderTime,
  reminderDays: Array.isArray(settings.reminderDays)
    ? settings.reminderDays
    : DEFAULT_UI_NOTIFICATION_SETTINGS.reminderDays
})

const mapNotificationSettingsToApi = (settings) => ({
  pushNotifications: settings.pushNotifications,
  emailNotifications: settings.emailNotifications,
  habitsReminder: settings.habitReminders,
  plansReminder: settings.planReminders,
  learningReminders: settings.learningReminders,
  weeklyReports: settings.weeklyReports,
  quietHours: settings.quietHours,
  quietStartTime: settings.quietStartTime,
  quietEndTime: settings.quietEndTime,
  reminderTime: settings.reminderTime,
  reminderDays: settings.reminderDays
})

const authStore = useAuthStore()
const habitStore = useHabitStore()
const router = useRouter()
const { success, error: showError, warning } = useToast()

const showEditModal = ref(false)
const showVerifyModal = ref(false)
const showChangePasswordModal = ref(false)
const showNotificationModal = ref(false)
const showPrivacyModal = ref(false)
const showDataExportModal = ref(false)
const showHelpModal = ref(false)
const showAboutModal = ref(false)
const showAdminMailModal = ref(false)

const editForm = ref({
  username: '',
  avatar: ''
})

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const verifyForm = ref({
  email: '',
  code: ''
})

const avatarFile = ref(null)
const avatarPreview = ref('')
const isSaving = ref(false)
const isSendingCode = ref(false)
const verifyCodeCountdown = ref(0)
const isVerifying = ref(false)
const isChangingPassword = ref(false)
const isSavingNotifications = ref(false)
const isSavingPrivacy = ref(false)
const isExporting = ref(false)
const isLoadingAdminAudience = ref(false)
const isSendingAdminMail = ref(false)
const isUploadingAdminImages = ref(false)
const isUploadingAdminAttachments = ref(false)

const notificationSettings = ref(normalizeUiNotificationSettings())

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
  includePlans: true,
  includeLearning: true,
  includeStatistics: true,
  dateRange: 'all'
})

const adminEmailAudience = ref({
  totalUsers: 0,
  delivery: null,
  sender: null,
  sampleRecipients: []
})

const adminMailForm = ref({
  category: 'product_update',
  subject: '',
  summary: '',
  content: '',
  replyTo: '',
  inlineImages: [],
  attachments: []
})

const statsData = ref({
  totalHabits: 0,
  totalStreak: 0,
  learningCourses: 0,
  usageDays: 0
})

const dateRanges = [
  { value: 'all', label: '全部数据' },
  { value: '30days', label: '最近 30 天' },
  { value: '90days', label: '最近 90 天' },
  { value: '1year', label: '最近 1 年' }
]

const weekdayOptions = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

const settingItems = computed(() => [
  {
    title: '通知设置',
    description: '统一管理提醒弹窗、推送与免打扰时间',
    iconClass: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-white/8 dark:text-white',
    icon: 'M15 17h5l-5 5v-5zM4.5 19.5L9 15l4.5 4.5M9 15v6',
    action: () => { showNotificationModal.value = true }
  },
  {
    title: '隐私设置',
    description: '控制数据收集、公开资料与错误上报',
    iconClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-500/10 dark:text-emerald-300',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    action: () => { showPrivacyModal.value = true }
  },
  {
    title: '导出数据',
    description: '导出习惯记录、统计数据和学习摘要',
    iconClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-500/10 dark:text-amber-300',
    icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    action: () => { showDataExportModal.value = true }
  }
])

const user = computed(() => authStore.user)
const isAdmin = computed(() => Boolean(user.value?.isAdmin || user.value?.security?.isAdmin))
const userDisplayName = computed(() => user.value?.username || user.value?.name || '用户')
const displayAvatar = computed(() => resolveMediaUrl(user.value?.avatar || ''))
const adminMailAssetTotalBytes = computed(() => (
  [...adminMailForm.value.inlineImages, ...adminMailForm.value.attachments]
    .reduce((sum, item) => sum + Number(item.size || 0), 0)
))
const adminMailAssetSizeLabel = computed(() => formatBytes(adminMailAssetTotalBytes.value))
const reminderDaysLabel = computed(() => {
  const activeDays = weekdayOptions.filter((day) => notificationSettings.value.reminderDays.includes(day.value))

  if (activeDays.length === 7) return '每天'
  if (activeDays.length === 0) return '未设置'

  return activeDays.map((day) => day.label.replace('周', '')).join(' / ')
})
const securitySummaryItems = computed(() => {
  const createdAtText = user.value?.createdAt
    ? new Date(user.value.createdAt).toLocaleDateString('zh-CN')
    : '未知'

  return [
    {
      label: '邮箱账户',
      description: user.value?.email || '当前账号未绑定邮箱',
      value: user.value?.email ? '已绑定' : '未绑定',
      badgeClass: user.value?.email ? 'summary-badge summary-badge-success' : 'summary-badge summary-badge-muted'
    },
    {
      label: '登录保持',
      description: '刷新页面后通过 token 和 profile 自动恢复登录态',
      value: '已启用',
      badgeClass: 'summary-badge summary-badge-success'
    },
    {
      label: '注册时间',
      description: '用于统计使用天数与账户启用时间',
      value: createdAtText,
      badgeClass: 'summary-badge summary-badge-muted'
    }
  ]
})

let verifyCodeTimer = null

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

const getTotalAssetBytesWithNewFiles = (files = []) => (
  adminMailAssetTotalBytes.value + Array.from(files).reduce((sum, file) => sum + Number(file.size || 0), 0)
)

const clearVerifyCodeTimer = () => {
  if (verifyCodeTimer) {
    window.clearInterval(verifyCodeTimer)
    verifyCodeTimer = null
  }
}

const startVerifyCodeCountdown = () => {
  verifyCodeCountdown.value = 60
  clearVerifyCodeTimer()
  verifyCodeTimer = window.setInterval(() => {
    verifyCodeCountdown.value -= 1
    if (verifyCodeCountdown.value <= 0) {
      clearVerifyCodeTimer()
      verifyCodeCountdown.value = 0
    }
  }, 1000)
}

const initUserData = () => {
  editForm.value = {
    username: user.value?.username || user.value?.name || '',
    avatar: user.value?.avatar || ''
  }
  avatarPreview.value = resolveMediaUrl(user.value?.avatar || '')
}

const openEditProfile = () => {
  initUserData()
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  avatarFile.value = null
  avatarPreview.value = resolveMediaUrl(user.value?.avatar || '')
}

const closeVerifyModal = () => {
  showVerifyModal.value = false
  verifyForm.value.code = ''
  verifyCodeCountdown.value = 0
  clearVerifyCodeTimer()
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  passwordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
}

const openReminderTest = () => {
  router.push('/reminder-test')
}

const openAdminMailModal = async () => {
  showAdminMailModal.value = true
  if (!adminEmailAudience.value.totalUsers) {
    await loadAdminAudience()
  }
}

const normalizeUploadedAsset = (payload, extra = {}) => ({
  path: payload.path || payload.url || '',
  filename: payload.filename || '未命名文件',
  mimeType: payload.mimeType || '',
  size: Number(payload.size || 0),
  absoluteUrl: payload.absoluteUrl || payload.publicUrl || '',
  ...extra
})

const handleAdminInlineImagesChange = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  if (getTotalAssetBytesWithNewFiles(files) > MAX_ADMIN_MAIL_ASSET_BYTES) {
    warning('邮件图片和附件总大小不能超过 28MB')
    return
  }

  isUploadingAdminImages.value = true
  try {
    for (const file of files) {
      const response = await uploadImage(file)
      if (!response?.success || !response.data) {
        throw new Error(response?.error || response?.message || `图片 ${file.name} 上传失败`)
      }

      const contentId = `mail-inline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      adminMailForm.value.inlineImages.push(normalizeUploadedAsset(response.data, { contentId }))
    }

    success('正文图片已上传')
  } catch (err) {
    showError('上传图片失败', {
      description: err.message || '请稍后重试。'
    })
  } finally {
    isUploadingAdminImages.value = false
  }
}

const handleAdminAttachmentsChange = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  if (getTotalAssetBytesWithNewFiles(files) > MAX_ADMIN_MAIL_ASSET_BYTES) {
    warning('邮件图片和附件总大小不能超过 28MB')
    return
  }

  isUploadingAdminAttachments.value = true
  try {
    for (const file of files) {
      const response = await uploadFile(file)
      if (!response?.success || !response.data) {
        throw new Error(response?.error || response?.message || `附件 ${file.name} 上传失败`)
      }

      adminMailForm.value.attachments.push(normalizeUploadedAsset(response.data))
    }

    success('附件已上传')
  } catch (err) {
    showError('上传附件失败', {
      description: err.message || '请稍后重试。'
    })
  } finally {
    isUploadingAdminAttachments.value = false
  }
}

const removeAdminInlineImage = (index) => {
  adminMailForm.value.inlineImages.splice(index, 1)
}

const removeAdminAttachment = (index) => {
  adminMailForm.value.attachments.splice(index, 1)
}

const openPasswordChange = () => {
  verifyForm.value = {
    email: user.value?.email || '',
    code: ''
  }
  verifyCodeCountdown.value = 0
  clearVerifyCodeTimer()
  showEditModal.value = false
  showVerifyModal.value = true
}

const handleLogout = async () => {
  if (!window.confirm('确定要退出登录吗？')) return
  await authStore.logout()
  router.push('/auth')
}

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const supportedTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ])

  if (!supportedTypes.has(file.type.toLowerCase())) {
    warning('请选择受支持的图片格式')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    warning('头像大小不能超过 20MB')
    return
  }

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const handleAvatarError = (event) => {
  event.target.style.display = 'none'
}

const saveProfile = async () => {
  if (!editForm.value.username) {
    warning('请输入用户名')
    return
  }

  isSaving.value = true
  try {
    const formData = new FormData()
    formData.append('username', editForm.value.username)
    formData.append('name', editForm.value.username)

    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    const response = await authAPI.updateProfile(formData)
    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || '保存失败')
    }

    authStore.updateUser(response.data)
    success('资料已更新')
    closeEditModal()
    initUserData()
  } catch (err) {
    if (err.code === 401 || err.response?.status === 401) {
      showError('登录已失效', { description: '请重新登录后再试。' })
      await authStore.logout()
      router.push('/auth')
      return
    }

    showError('保存失败', {
      description: err.error || err.message || '网络异常，请稍后重试。'
    })
  } finally {
    isSaving.value = false
  }
}

const sendVerifyCode = async () => {
  if (!verifyForm.value.email) {
    warning('当前账号未绑定邮箱')
    return
  }

  isSendingCode.value = true
  try {
    const response = await authAPI.sendVerifyCode(verifyForm.value.email, 'password_change')
    if (!response.success) {
      throw new Error(response.error || response.message || '发送失败')
    }

    startVerifyCodeCountdown()
    success('验证码已发送', { description: '请检查邮箱收件箱。' })
  } catch (err) {
    showError('发送失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isSendingCode.value = false
  }
}

const verifyCode = async () => {
  if (!verifyForm.value.code) {
    warning('请输入验证码')
    return
  }

  isVerifying.value = true
  try {
    const response = await authAPI.verifyCode(verifyForm.value.email, verifyForm.value.code, 'password_change')
    if (!response.success) {
      throw new Error(response.error || response.message || '验证码无效')
    }

    showVerifyModal.value = false
    showChangePasswordModal.value = true
    verifyForm.value.code = ''
  } catch (err) {
    showError('验证失败', {
      description: err.error || err.message || '请检查验证码后重试。'
    })
  } finally {
    isVerifying.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword.length < 6) {
    warning('新密码至少需要 6 位')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    warning('两次输入的新密码不一致')
    return
  }

  isChangingPassword.value = true
  try {
    const response = await authAPI.changePassword({
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })

    if (!response.success) {
      throw new Error(response.error || response.message || '修改失败')
    }

    success('密码修改成功')
    closeChangePasswordModal()
  } catch (err) {
    showError('修改失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isChangingPassword.value = false
  }
}

const toggleReminderDay = (day) => {
  const nextDays = new Set(notificationSettings.value.reminderDays)

  if (nextDays.has(day)) {
    nextDays.delete(day)
  } else {
    nextDays.add(day)
  }

  notificationSettings.value.reminderDays = Array.from(nextDays).sort((a, b) => a - b)
}

const loadAdminAudience = async () => {
  if (!isAdmin.value) return

  isLoadingAdminAudience.value = true
  try {
    const response = await settingsAPI.getAdminEmailAudience()
    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || '加载失败')
    }

    adminEmailAudience.value = response.data
  } catch (err) {
    showError('加载管理员邮件数据失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isLoadingAdminAudience.value = false
  }
}

const sendAdminMail = async () => {
  if (!adminMailForm.value.subject) {
    warning('请输入邮件标题')
    return
  }

  if (!adminMailForm.value.content || adminMailForm.value.content.length < 5) {
    warning('请输入更完整的邮件正文')
    return
  }

  if (adminMailAssetTotalBytes.value > MAX_ADMIN_MAIL_ASSET_BYTES) {
    warning('邮件图片和附件总大小不能超过 28MB')
    return
  }

  isSendingAdminMail.value = true
  try {
    const response = await settingsAPI.sendAdminBroadcastEmail(adminMailForm.value)
    if (!response.success) {
      throw new Error(response.error || response.message || '发送失败')
    }

    success('群发任务已提交', {
      description: `已向 ${response.data?.recipientCount || 0} 位用户发送邮件`
    })

    adminMailForm.value = {
      category: 'product_update',
      subject: '',
      summary: '',
      content: '',
      replyTo: '',
      inlineImages: [],
      attachments: []
    }
    showAdminMailModal.value = false
    await loadAdminAudience()
  } catch (err) {
    showError('群发失败', {
      description: err.error || err.message || '请检查 Resend 配置后重试。'
    })
  } finally {
    isSendingAdminMail.value = false
  }
}

const exportData = async () => {
  isExporting.value = true
  try {
    const response = await settingsAPI.exportUserData(exportSettings.value)
    if (!response.success || !response.data?.content) {
      throw new Error(response.error || response.message || '导出失败')
    }

    const fileContent = response.data.content
    const fileName = response.data.filename || `habit-learner-data-${new Date().toISOString().split('T')[0]}.${exportSettings.value.format}`
    const mimeType = response.data.mimeType || (exportSettings.value.format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json')

    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    success('数据导出成功', { description: `已生成 ${fileName}` })
    showDataExportModal.value = false
  } catch (err) {
    showError('导出失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isExporting.value = false
  }
}

const saveNotificationSettings = async () => {
  isSavingNotifications.value = true
  try {
    if (!notificationSettings.value.reminderDays.length) {
      warning('请至少选择一个提醒日期')
      return
    }

    if (notificationSettings.value.pushNotifications) {
      await requestNotificationPermission()
    }

    const payload = mapNotificationSettingsToApi(notificationSettings.value)
    const response = await settingsAPI.updateNotificationSettings(payload)
    if (!response.success) {
      throw new Error(response.error || response.message || '保存失败')
    }

    notificationSettings.value = normalizeUiNotificationSettings({
      ...notificationSettings.value,
      ...(response.data || {})
    })
    cacheNotificationSettings(authStore.user?.id, notificationSettings.value)

    success('通知设置已保存')
    showNotificationModal.value = false
  } catch (err) {
    showError('保存失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isSavingNotifications.value = false
  }
}

const savePrivacySettings = async () => {
  isSavingPrivacy.value = true
  try {
    const response = await settingsAPI.updatePrivacySettings(privacySettings.value)
    if (!response.success) {
      throw new Error(response.error || response.message || '保存失败')
    }

    privacySettings.value = {
      ...privacySettings.value,
      ...(response.data || {})
    }

    success('隐私设置已保存')
    showPrivacyModal.value = false
  } catch (err) {
    showError('保存失败', {
      description: err.error || err.message || '请稍后重试。'
    })
  } finally {
    isSavingPrivacy.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await statsAPI.getStatsOverview()
    if (response?.success && response.data) {
      statsData.value = {
        totalHabits: response.data.totalHabits || 0,
        totalStreak: response.data.totalStreak || 0,
        learningCourses: response.data.learningProgress?.totalCourses || 0,
        usageDays: user.value?.createdAt
          ? Math.max(0, Math.floor((Date.now() - new Date(user.value.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
          : 0
      }
      return
    }
  } catch (err) {
    console.error('Failed to load profile stats:', err)
  }

  statsData.value = {
    totalHabits: habitStore.habits.length,
    totalStreak: habitStore.habits.reduce((sum, habit) => sum + (habit.streak || 0), 0),
    learningCourses: 0,
    usageDays: 0
  }
}

const loadNotificationSettings = async () => {
  notificationSettings.value = normalizeUiNotificationSettings(
    readNotificationSettings(authStore.user?.id)
  )

  try {
    const response = await settingsAPI.getNotificationSettings()
    if (response.success && response.data) {
      notificationSettings.value = normalizeUiNotificationSettings(response.data)
      cacheNotificationSettings(authStore.user?.id, notificationSettings.value)
    }
  } catch (err) {
    console.error('Failed to load notification settings:', err)
  }
}

const loadPrivacySettings = async () => {
  try {
    const response = await settingsAPI.getPrivacySettings()
    if (response.success && response.data) {
      privacySettings.value = {
        ...privacySettings.value,
        ...response.data
      }
    }
  } catch (err) {
    console.error('Failed to load privacy settings:', err)
  }
}

onMounted(async () => {
  initUserData()

  if (!Array.isArray(habitStore.habits) || habitStore.habits.length === 0) {
    try {
      await habitStore.fetchHabits()
    } catch (error) {
      console.error('Failed to preload habits for profile view:', error)
    }
  }

  await Promise.allSettled([
    loadStats(),
    loadNotificationSettings(),
    loadPrivacySettings()
  ])

  if (isAdmin.value) {
    await loadAdminAudience()
  }
})

onBeforeUnmount(() => {
  clearVerifyCodeTimer()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}

.modal-card {
  width: min(100%, 720px);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  border-radius: 28px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
}

.dark .modal-card {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.98);
}

.modal-footer {
  display: flex;
  gap: 12px;
  border-top: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 24px 20px;
}

.dark .modal-footer {
  border-top-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.92);
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  border: 1px solid rgba(228, 228, 231, 0.8);
  background: rgba(250, 250, 250, 0.8);
  padding: 14px 16px;
  color: rgb(24, 24, 27);
}

.dark .option-row {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: rgb(244, 244, 245);
}

.admin-upload-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(24, 24, 27, 0.12);
  background: rgba(24, 24, 27, 0.96);
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.admin-upload-trigger input[type="file"] {
  display: none;
}

.dark .admin-upload-trigger {
  border-color: rgba(244, 244, 245, 0.12);
  background: rgba(244, 244, 245, 0.96);
  color: rgb(9, 9, 11);
}

.summary-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.summary-badge-success {
  background: rgba(16, 185, 129, 0.12);
  color: rgb(5, 150, 105);
}

.summary-badge-warn {
  background: rgba(245, 158, 11, 0.14);
  color: rgb(180, 83, 9);
}

.summary-badge-muted {
  background: rgba(113, 113, 122, 0.12);
  color: rgb(82, 82, 91);
}

.dark .summary-badge-success {
  background: rgba(16, 185, 129, 0.16);
  color: rgb(110, 231, 183);
}

.dark .summary-badge-warn {
  background: rgba(245, 158, 11, 0.16);
  color: rgb(253, 224, 71);
}

.dark .summary-badge-muted {
  background: rgba(82, 82, 91, 0.4);
  color: rgb(228, 228, 231);
}

.day-chip {
  border-radius: 999px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.day-chip-active {
  border-color: rgba(24, 24, 27, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: white;
}

.day-chip-inactive {
  background: rgba(255, 255, 255, 0.82);
  color: rgb(82, 82, 91);
}

.dark .day-chip {
  border-color: rgba(63, 63, 70, 0.9);
}

.dark .day-chip-active {
  border-color: rgba(244, 244, 245, 0.95);
  background: rgba(244, 244, 245, 0.98);
  color: rgb(9, 9, 11);
}

.dark .day-chip-inactive {
  background: rgba(24, 24, 27, 0.82);
  color: rgb(212, 212, 216);
}

@media (max-width: 640px) {
  .modal-card {
    border-radius: 24px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
