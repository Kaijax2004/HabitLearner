<template>
  <AppLayout title="我的">
    <div class="profile-page-shell">
      <section class="profile-hero-panel">
        <div class="profile-hero-glow"></div>
        <div class="profile-brand-row">
          <div class="profile-logo-mark">
            <Logo class="h-8 w-auto" />
          </div>
          <div>
            <p class="profile-kicker">HabitLearner Account</p>
            <h1>我的工作台</h1>
          </div>
        </div>

        <div class="profile-hero-content">
          <div class="profile-identity-card">
            <div class="profile-avatar-ring">
              <img
                v-if="displayAvatar"
                :key="displayAvatar"
                :src="displayAvatar"
                alt="用户头像"
                class="h-full w-full object-cover"
                @error="handleAvatarError"
              />
              <svg v-else class="h-11 w-11 text-zinc-500 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="profile-kicker">Current User</p>
              <h2>{{ userDisplayName }}</h2>
              <p>{{ user?.email || '未绑定邮箱' }}</p>
            </div>
            <span class="summary-badge summary-badge-success">已登录</span>
          </div>

          <div class="profile-hero-copy">
            <p>把身份、安全、提醒、AI 能力和数据出口集中到一个清爽的控制台里。默认不启用 AI，需要你主动配置供应商后才会请求模型。</p>
            <div class="profile-action-row">
              <button type="button" class="profile-primary-action" @click="openEditProfile">编辑资料</button>
              <button type="button" class="profile-ghost-action" @click="openPasswordChange">修改密码</button>
              <button type="button" class="profile-ghost-action" @click="showDataExportModal = true">导出数据</button>
            </div>
          </div>
        </div>
      </section>

      <section class="profile-metric-grid">
        <article v-for="item in profileMetricItems" :key="item.label" class="profile-metric-card">
          <span>{{ item.label }}</span>
          <strong :class="item.valueClass">{{ item.value }}</strong>
          <p>{{ item.description }}</p>
        </article>
      </section>

      <div class="profile-layout-grid">
        <section class="profile-column profile-column-left">
          <BaseCard>
            <div class="profile-section-head">
              <div>
                <p class="profile-kicker">Security</p>
                <h3>账户安全</h3>
              </div>
              <button type="button" class="profile-mini-button" @click="openPasswordChange">更新</button>
            </div>
            <div class="profile-stack-list">
              <div v-for="item in securitySummaryItems" :key="item.label" class="profile-info-row">
                <div>
                  <strong>{{ item.label }}</strong>
                  <p>{{ item.description }}</p>
                </div>
                <span :class="item.badgeClass">{{ item.value }}</span>
              </div>
            </div>
          </BaseCard>

          <BaseCard>
            <div class="profile-section-head">
              <div>
                <p class="profile-kicker">Reminder</p>
                <h3>提醒摘要</h3>
              </div>
              <button type="button" class="profile-mini-button" @click="showNotificationModal = true">调整</button>
            </div>
            <div class="profile-reminder-grid">
              <div>
                <span>提醒时间</span>
                <strong>{{ notificationSettings.reminderTime }}</strong>
              </div>
              <div>
                <span>重复日期</span>
                <strong>{{ reminderDaysLabel }}</strong>
              </div>
              <div>
                <span>推送状态</span>
                <strong :class="notificationSettings.pushNotifications ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'">
                  {{ notificationSettings.pushNotifications ? '已开启' : '已关闭' }}
                </strong>
              </div>
            </div>
            <button type="button" class="profile-wide-secondary mt-4" @click="openReminderTest">测试提醒</button>
          </BaseCard>

          <BaseCard v-if="isAdmin">
            <div class="profile-section-head">
              <div>
                <p class="profile-kicker">Admin Mail</p>
                <h3>管理员邮件中心</h3>
              </div>
              <span class="summary-badge summary-badge-success">管理员</span>
            </div>
            <div class="profile-admin-strip">
              <div>
                <span>收件用户</span>
                <strong>{{ adminEmailAudience.totalUsers || 0 }}</strong>
              </div>
              <div>
                <span>发件邮箱</span>
                <strong>{{ adminEmailAudience.sender?.fromEmail || 'GF@habitlearner.cn' }}</strong>
              </div>
              <div>
                <span>发送通道</span>
                <strong>{{ adminEmailAudience.delivery?.enabled ? 'Resend 已启用' : '开发模式' }}</strong>
              </div>
            </div>
            <p class="profile-muted-box">管理员可以向所有已绑定邮箱的用户发送产品更新、学习分享或活动通知。</p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" class="profile-primary-action" @click="openAdminMailModal">写邮件给所有用户</button>
              <button type="button" class="profile-ghost-action" :disabled="isLoadingAdminAudience" @click="loadAdminAudience">
                {{ isLoadingAdminAudience ? '刷新中...' : '刷新受众数据' }}
              </button>
            </div>
          </BaseCard>
        </section>

        <section class="profile-column profile-column-right">
          <BaseCard>
            <div class="profile-section-head">
              <div>
                <p class="profile-kicker">AI Provider</p>
                <h3>AI 供应商配置</h3>
              </div>
              <span :class="['summary-badge', aiProviderStatus === 'configured' ? 'summary-badge-success' : 'summary-badge-warn']">
                {{ aiProviderStatusLabel }}
              </span>
            </div>
            <p class="profile-ai-summary">{{ aiProviderSummary }}</p>
            <div class="profile-ai-status-grid">
              <div>
                <span>默认供应商</span>
                <strong>{{ aiDefaultProvider?.name || '尚未配置' }}</strong>
              </div>
              <div>
                <span>上游协议</span>
                <strong>{{ aiDefaultProvider ? getProtocolLabel(aiDefaultProvider.protocol) : '未启用' }}</strong>
              </div>
              <div>
                <span>接入方式</span>
                <strong>{{ aiDefaultProvider ? getAccessModeLabel(aiDefaultProvider.accessMode) : '待设置' }}</strong>
              </div>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" class="profile-primary-action" @click="openAiProviderModal">进入配置中心</button>
              <button type="button" class="profile-ghost-action" :disabled="isLoadingAiProviders" @click="loadAiProviders">
                {{ isLoadingAiProviders ? '刷新中...' : '刷新配置状态' }}
              </button>
            </div>
          </BaseCard>

          <div class="profile-tool-grid">
            <BaseCard v-for="item in settingItems" :key="item.title" padding="none">
              <button type="button" class="profile-tool-button" @click="item.action">
                <div :class="['profile-tool-icon', item.iconClass]">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.description }}</p>
                </div>
                <svg class="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </BaseCard>
          </div>

          <BaseCard>
            <div class="profile-bottom-actions">
              <button type="button" class="profile-wide-secondary" @click="showHelpModal = true">使用帮助</button>
              <button type="button" class="profile-wide-secondary" @click="showAboutModal = true">关于应用</button>
              <button type="button" class="profile-danger-action" @click="handleLogout">退出登录</button>
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
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  class="input-apple"
                  @change="handleAvatarChange"
                />
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、GIF、WebP、SVG，大小不超过 5MB。
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

    <div v-if="showAiProviderModal" class="modal-overlay" @click.self="closeAiProviderModal">
      <div class="modal-card ai-provider-modal">
        <ModalHeader title="AI 供应商配置" @close="closeAiProviderModal" />
        <div class="ai-provider-shell">
          <section class="ai-provider-hero">
            <div>
              <p class="ai-provider-kicker">Provider Console</p>
              <h3>管理 API 供应商、协议、Key 与模型</h3>
              <p>AI 默认不启用。你可以接入官方 API，也可以接入纯 API / 中转 API。Key 会加密存储在服务器，请确认你信任当前部署环境。</p>
            </div>
            <span :class="['summary-badge', aiProviderStatus === 'configured' ? 'summary-badge-success' : 'summary-badge-warn']">
              {{ aiProviderStatusLabel }}
            </span>
          </section>

          <div class="ai-provider-grid">
            <section class="ai-provider-panel">
              <div class="ai-provider-panel-head">
                <div>
                  <p class="ai-provider-kicker">Edit Provider</p>
                  <h4>{{ aiProviderForm.id ? '编辑供应商' : '新增供应商' }}</h4>
                  <p>先填写接入信息，再刷新上游模型列表并选择默认模型。</p>
                </div>
                <button type="button" class="btn-secondary" @click="resetAiProviderForm">新建配置</button>
              </div>

              <div class="ai-provider-form-grid">
                <div class="ai-form-section">
                  <div class="ai-form-section-title">
                    <span>01</span>
                    <strong>基础接入</strong>
                  </div>
                  <label class="ai-field">
                    <span>名称</span>
                    <input v-model.trim="aiProviderForm.name" class="input-apple" placeholder="例如：OpenAI 官方 / 我的中转 API" />
                  </label>
                </div>

                <div class="ai-form-section ai-form-section-two">
                  <label class="ai-field">
                    <span>接入模式</span>
                    <select v-model="aiProviderForm.accessMode" class="input-apple" @change="applyAiAccessModeDefaults">
                      <option value="official_api">官方 API</option>
                      <option value="pure_api">纯 API / 中转 API</option>
                    </select>
                  </label>
                  <label class="ai-field">
                    <span>上游协议</span>
                    <select v-model="aiProviderForm.protocol" class="input-apple" @change="applyAiProtocolDefaults">
                      <option value="openai_responses">Responses API</option>
                      <option value="openai_chat">Chat Completions</option>
                    </select>
                  </label>
                </div>

                <div class="ai-form-section ai-form-section-two">
                  <label class="ai-field">
                    <span>Base URL</span>
                    <input v-model.trim="aiProviderForm.base_url" class="input-apple" placeholder="https://api.openai.com/v1 或你的中转 Base URL" />
                  </label>
                  <label class="ai-field">
                    <span>API Key</span>
                    <input v-model.trim="aiProviderForm.apiKey" type="password" class="input-apple" :placeholder="aiProviderForm.id ? '留空则沿用已保存 Key' : '请输入 API Key'" />
                  </label>
                </div>

                <div class="ai-form-section ai-model-section">
                  <div class="ai-form-section-title">
                    <span>02</span>
                    <strong>模型选择</strong>
                  </div>
                  <div class="ai-model-picker">
                    <div class="ai-field">
                      <span>上游模型</span>
                      <select v-model="aiProviderForm.model" class="input-apple" :disabled="!aiProviderModelOptions.length">
                        <option value="" disabled>{{ isLoadingAiModels ? '正在获取上游模型...' : '请先刷新上游模型列表' }}</option>
                        <option
                          v-for="model in aiProviderModelOptions"
                          :key="model.id"
                          :value="model.id"
                        >
                          {{ model.name || model.id }}{{ model.owned_by ? ` · ${model.owned_by}` : '' }}
                        </option>
                      </select>
                      <p class="ai-field-hint">
                        {{ aiProviderModelHint }}
                      </p>
                    </div>
                    <button type="button" class="profile-wide-secondary ai-model-refresh" :disabled="isLoadingAiModels" @click="refreshAiProviderModels">
                      {{ isLoadingAiModels ? '获取中...' : '刷新上游模型' }}
                    </button>
                  </div>
                </div>

                <div class="ai-form-section ai-form-section-two">
                  <label class="ai-field">
                    <span>超时毫秒</span>
                    <input v-model.number="aiProviderForm.timeoutMs" type="number" min="3000" step="1000" class="input-apple" />
                  </label>
                  <div class="ai-model-count-card">
                    <span>可选模型</span>
                    <strong>{{ aiProviderModelOptions.length }}</strong>
                    <p>模型列表来自当前 Base URL 的 /models 接口。</p>
                  </div>
                </div>

                <div class="ai-provider-final-row">
                  <label class="option-row">
                    <input v-model="aiProviderForm.is_default" type="checkbox" />
                    <span>设为默认 AI 供应商</span>
                  </label>
                  <div class="ai-provider-risk-note">
                    Key 会加密存储在服务器。请不要填写你不愿托管到当前部署环境的高权限 Key。
                  </div>
                </div>
              </div>

              <div class="ai-provider-footer-actions">
                <button type="button" class="btn-primary flex-1" :disabled="isSavingAiProvider" @click="saveAiProviderConfig">
                  {{ isSavingAiProvider ? '保存中...' : '保存供应商' }}
                </button>
                <button type="button" class="btn-secondary flex-1" :disabled="!aiProviderForm.id || isTestingAiProvider" @click="testAiProviderConfig(aiProviderForm.id)">
                  {{ isTestingAiProvider ? '测试中...' : '测试连接' }}
                </button>
              </div>
            </section>

            <section class="ai-provider-panel">
              <div class="ai-provider-panel-head">
                <div>
                  <p class="ai-provider-kicker">Provider List</p>
                  <h4>已保存供应商</h4>
                  <p>管理默认供应商、连接测试和停用状态。</p>
                </div>
                <button type="button" class="btn-secondary" :disabled="isLoadingAiProviders" @click="loadAiProviders">
                  {{ isLoadingAiProviders ? '刷新中...' : '刷新' }}
                </button>
              </div>

              <div v-if="aiProviders.length" class="ai-provider-list">
                <article
                  v-for="provider in aiProviders"
                  :key="provider.id"
                  class="ai-provider-item"
                  :class="{ 'is-active': provider.is_default }"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h5>{{ provider.name }}</h5>
                      <span v-if="provider.is_default" class="summary-badge summary-badge-success">默认</span>
                      <span :class="['summary-badge', provider.status === 'active' ? 'summary-badge-success' : 'summary-badge-muted']">{{ provider.status === 'active' ? '启用' : '停用' }}</span>
                    </div>
                    <p>{{ getAccessModeLabel(provider.accessMode) }} · {{ getProtocolLabel(provider.protocol) }} · {{ provider.model }}</p>
                    <p class="truncate">{{ provider.base_url }}</p>
                    <p v-if="provider.last_tested_at">最近测试：{{ formatDateTime(provider.last_tested_at) }}{{ provider.last_error ? ` · ${provider.last_error}` : '' }}</p>
                  </div>
                  <div class="ai-provider-actions">
                    <button type="button" class="btn-secondary" @click="editAiProvider(provider)">编辑</button>
                    <button type="button" class="btn-secondary" :disabled="isTestingAiProvider" @click="testAiProviderConfig(provider.id)">测试</button>
                    <button type="button" class="btn-secondary" @click="disableAiProvider(provider)">停用</button>
                  </div>
                </article>
              </div>

              <div v-else class="ai-provider-empty">
                <div class="text-base font-medium text-zinc-950 dark:text-white">尚未配置 AI 能力</div>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">保存一个供应商并设为默认后，计划页 AI、习知助手和相关 AI 功能才会开始请求远程模型。</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

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
import {
  deleteAiProvider,
  listAiProviderModels,
  listAiProviders,
  saveAiProvider,
  testAiProvider,
  updateAiProvider
} from '@/api/workspace.js'
import { uploadFile, uploadImage } from '@/api/uploads.js'
import { resolveMediaUrl } from '@/utils/media.js'
import { useToast } from '@/composables/useToast'
import { useWorkspaceAiStore } from '@/stores/workspaceAi.js'
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
const workspaceAiStore = useWorkspaceAiStore()
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
const showAiProviderModal = ref(false)

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
const isLoadingAiProviders = ref(false)
const isSavingAiProvider = ref(false)
const isTestingAiProvider = ref(false)
const isLoadingAiModels = ref(false)

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

const aiProviders = ref([])
const aiProviderCatalog = ref({})
const aiProviderStatus = ref('not_configured')
const aiProviderModels = ref([])
const aiProviderForm = ref({
  id: null,
  name: '',
  accessMode: 'official_api',
  protocol: 'openai_responses',
  base_url: 'https://api.openai.com/v1',
  model: '',
  timeoutMs: 15000,
  apiKey: '',
  is_default: true
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
    title: '宠物设置',
    description: '导入自定义宠物形象，并切换大 / 中 / 小显示尺寸。',
    iconClass: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-white/8 dark:text-white',
    icon: 'M12 3c3.866 0 7 2.91 7 6.5 0 2.01-.984 3.8-2.514 4.986L17 21l-5-2.5L7 21l.514-6.514C5.984 13.3 5 11.51 5 9.5 5 5.91 8.134 3 12 3zm-3 7h.01M15 10h.01M10 13c.667.667 3.333.667 4 0',
    action: () => { router.push('/profile/pet-settings') }
  },  {
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

const profileMetricItems = computed(() => [
  {
    label: '习惯资产',
    value: statsData.value.totalHabits,
    description: '当前正在追踪的长期行为',
    valueClass: 'text-zinc-950 dark:text-white'
  },
  {
    label: '累计连击',
    value: statsData.value.totalStreak,
    description: '所有习惯连续推进的合计',
    valueClass: 'text-emerald-600 dark:text-emerald-300'
  },
  {
    label: '学习课程',
    value: statsData.value.learningCourses,
    description: '已沉淀的学习内容入口',
    valueClass: 'text-amber-600 dark:text-amber-300'
  },
  {
    label: '使用天数',
    value: statsData.value.usageDays,
    description: '从注册开始累计的陪伴时间',
    valueClass: 'text-sky-600 dark:text-sky-300'
  }
])

const aiDefaultProvider = computed(() => (
  aiProviders.value.find((provider) => provider.is_default && provider.status === 'active') || null
))

const aiProviderStatusLabel = computed(() => (
  aiProviderStatus.value === 'configured' && aiDefaultProvider.value
    ? '已配置'
    : '尚未配置'
))

const aiProviderSummary = computed(() => {
  if (!aiDefaultProvider.value) {
    return 'AI 默认不启用。配置供应商并设为默认后，计划页 AI、习知助手和媒体生成入口才会开始请求远程模型。'
  }

  return `${aiDefaultProvider.value.name} 正作为默认 AI 供应商，协议为 ${getProtocolLabel(aiDefaultProvider.value.protocol)}，模型为 ${aiDefaultProvider.value.model || '未填写'}。`
})

const aiModelPlaceholder = computed(() => (
  aiProviderForm.value.accessMode === 'official_api'
    ? (aiProviderCatalog.value.defaults?.officialModel || 'gpt-4.1-mini')
    : (aiProviderCatalog.value.defaults?.pureApiModel || 'gpt-4.1-mini')
))

const aiProviderModelOptions = computed(() => {
  const map = new Map()
  const currentModel = String(aiProviderForm.value.model || '').trim()

  if (currentModel) {
    map.set(currentModel, {
      id: currentModel,
      name: currentModel,
      owned_by: '当前配置'
    })
  }

  aiProviderModels.value.forEach((model) => {
    const id = String(model?.id || '').trim()
    if (!id) return
    map.set(id, {
      id,
      name: model.name || id,
      owned_by: model.owned_by || ''
    })
  })

  return Array.from(map.values())
})

const aiProviderModelHint = computed(() => {
  if (isLoadingAiModels.value) return '正在向上游 /models 接口读取模型列表。'
  if (aiProviderModels.value.length) return `已从上游读取 ${aiProviderModels.value.length} 个模型，请从列表中选择默认模型。`
  return '填写 Base URL 和 API Key 后刷新模型列表，模型将从上游配置中自动读取。'
})

let verifyCodeTimer = null

const getProtocolLabel = (protocol) => {
  if (protocol === 'openai_responses') return 'Responses API'
  if (protocol === 'agnes_chat') return 'Agnes Chat'
  return 'Chat Completions'
}

const getAccessModeLabel = (accessMode) => (
  accessMode === 'official_api' ? '官方 API' : '纯 API / 中转 API'
)

const formatDateTime = (value) => {
  if (!value) return '未记录'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '未记录' : date.toLocaleString('zh-CN')
}

const resetAiProviderForm = () => {
  aiProviderModels.value = []
  aiProviderForm.value = {
    id: null,
    name: '',
    accessMode: 'official_api',
    protocol: 'openai_responses',
    base_url: 'https://api.openai.com/v1',
    model: '',
    timeoutMs: 15000,
    apiKey: '',
    is_default: aiProviders.value.length === 0
  }
}

const applyAiAccessModeDefaults = () => {
  aiProviderModels.value = []
  if (aiProviderForm.value.accessMode === 'official_api') {
    if (!aiProviderForm.value.base_url || aiProviderForm.value.base_url.includes('api.habitlearner')) {
      aiProviderForm.value.base_url = aiProviderCatalog.value.defaults?.officialBaseUrl || 'https://api.openai.com/v1'
    }
    return
  }

  if (!aiProviderForm.value.id && aiProviderForm.value.base_url === 'https://api.openai.com/v1') {
    aiProviderForm.value.base_url = ''
  }
}

const applyAiProtocolDefaults = () => {
  aiProviderModels.value = []
  if (!aiProviderForm.value.id) aiProviderForm.value.model = ''
}

const buildAiProviderDraftPayload = () => ({
  id: aiProviderForm.value.id || undefined,
  name: aiProviderForm.value.name || undefined,
  accessMode: aiProviderForm.value.accessMode,
  protocol: aiProviderForm.value.protocol,
  base_url: aiProviderForm.value.base_url,
  model: aiProviderForm.value.model || undefined,
  apiKey: aiProviderForm.value.apiKey || undefined,
  config: {
    timeoutMs: Number(aiProviderForm.value.timeoutMs || 15000)
  }
})

const refreshAiProviderModels = async () => {
  const form = aiProviderForm.value
  if (!form.base_url) {
    warning('请先填写 Base URL')
    return
  }
  if (!form.id && !form.apiKey) {
    warning('请先填写 API Key，再获取上游模型列表')
    return
  }

  isLoadingAiModels.value = true
  try {
    const response = await listAiProviderModels(buildAiProviderDraftPayload())
    if (!response?.success) {
      throw new Error(response?.error || response?.message || '模型列表获取失败')
    }

    aiProviderModels.value = Array.isArray(response.data?.models) ? response.data.models : []
    if (!aiProviderModels.value.length) {
      warning('上游没有返回可用模型', {
        description: '请确认该供应商支持 /models 接口，或检查 Base URL 是否完整。'
      })
      return
    }

    const current = String(form.model || '').trim()
    const hasCurrent = aiProviderModels.value.some((model) => model.id === current)
    if (!current || !hasCurrent) {
      aiProviderForm.value.model = aiProviderModels.value[0].id
    }

    success('模型列表已更新', {
      description: `已读取 ${aiProviderModels.value.length} 个模型。`
    })
  } catch (err) {
    showError('获取模型列表失败', {
      description: err?.error || err?.message || '请检查 Base URL、API Key、网络和上游 /models 接口。'
    })
  } finally {
    isLoadingAiModels.value = false
  }
}

const loadAiProviders = async () => {
  isLoadingAiProviders.value = true
  try {
    const response = await listAiProviders()
    const payload = response?.data || {}
    aiProviders.value = Array.isArray(payload.providers) ? payload.providers : []
    aiProviderCatalog.value = payload.catalog || {}
    aiProviderStatus.value = payload.status || (aiProviders.value.some((provider) => provider.is_default) ? 'configured' : 'not_configured')

    const defaultProvider = aiProviders.value.find((provider) => provider.is_default && provider.status === 'active')
    if (defaultProvider?.id) {
      workspaceAiStore.setSelectedProviderId(defaultProvider.id)
    } else {
      workspaceAiStore.clearSelectedProviderId()
    }
  } catch (err) {
    showError('读取 AI 配置失败', {
      description: err?.error || err?.message || '请稍后重试。'
    })
  } finally {
    isLoadingAiProviders.value = false
  }
}

const openAiProviderModal = async () => {
  router.push('/profile/ai-providers')
}

const closeAiProviderModal = () => {
  showAiProviderModal.value = false
  resetAiProviderForm()
}

const editAiProvider = (provider) => {
  aiProviderModels.value = provider.model
    ? [{ id: provider.model, name: provider.model, owned_by: '当前配置' }]
    : []
  aiProviderForm.value = {
    id: provider.id,
    name: provider.name || '',
    accessMode: provider.accessMode || 'pure_api',
    protocol: provider.protocol || 'openai_chat',
    base_url: provider.base_url || '',
    model: provider.model || '',
    timeoutMs: Number(provider.config?.timeoutMs || provider.config?.timeout_ms || 15000),
    apiKey: '',
    is_default: Boolean(provider.is_default)
  }
}

const saveAiProviderConfig = async () => {
  const form = aiProviderForm.value
  if (!form.name) {
    warning('请先填写供应商名称')
    return
  }
  if (!form.base_url) {
    warning('请填写 Base URL')
    return
  }
  if (!form.model) {
    warning('请填写模型名')
    return
  }
  if (!form.id && !form.apiKey) {
    warning('新建供应商时必须填写 API Key')
    return
  }

  isSavingAiProvider.value = true
  try {
    const payload = {
      ...buildAiProviderDraftPayload(),
      name: form.name,
      model: form.model,
      is_default: Boolean(form.is_default)
    }
    const response = form.id
      ? await updateAiProvider(form.id, payload)
      : await saveAiProvider(payload)

    if (!response?.success) {
      throw new Error(response?.error || response?.message || '保存供应商失败')
    }

    success(form.id ? '供应商配置已更新' : '供应商配置已创建')
    await loadAiProviders()
    resetAiProviderForm()
  } catch (err) {
    showError('保存 AI 供应商失败', {
      description: err?.error || err?.message || '请稍后重试。'
    })
  } finally {
    isSavingAiProvider.value = false
  }
}

const testAiProviderConfig = async (providerId) => {
  if (!providerId) {
    warning('请先保存供应商配置，再测试连接')
    return
  }

  isTestingAiProvider.value = true
  try {
    const response = await testAiProvider(providerId)
    if (!response?.success) {
      throw new Error(response?.error || response?.message || '连接测试失败')
    }
    success('供应商连接正常', {
      description: response.data?.sample || '模型已返回测试内容。'
    })
    await loadAiProviders()
  } catch (err) {
    showError('供应商连接失败', {
      description: err?.error || err?.message || '请检查 Base URL、协议、模型和 Key。'
    })
  } finally {
    isTestingAiProvider.value = false
  }
}

const disableAiProvider = async (provider) => {
  if (!provider?.id || !window.confirm(`确定停用“${provider.name || '该供应商'}”吗？`)) return

  try {
    const response = await deleteAiProvider(provider.id)
    if (!response?.success) {
      throw new Error(response?.error || response?.message || '停用供应商失败')
    }
    success('供应商已停用')
    await loadAiProviders()
    resetAiProviderForm()
  } catch (err) {
    showError('停用 AI 供应商失败', {
      description: err?.error || err?.message || '请稍后重试。'
    })
  }
}

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
    'image/svg+xml'
  ])

  if (!supportedTypes.has(file.type.toLowerCase())) {
    warning('请选择受支持的图片格式')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    warning('头像大小不能超过 5MB')
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
    loadPrivacySettings(),
    loadAiProviders()
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
.profile-page-shell {
  position: relative;
  display: grid;
  gap: 20px;
  padding: 4px 0 28px;
}

.profile-hero-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 30px;
  background:
    radial-gradient(circle at 88% 12%, rgba(217, 202, 166, 0.22), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(244, 244, 245, 0.84));
  box-shadow: 0 20px 60px rgba(24, 24, 27, 0.08);
  padding: 26px;
}

.dark .profile-hero-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at 88% 12%, rgba(160, 125, 52, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 0.96));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
}

.profile-hero-glow {
  position: absolute;
  right: 8%;
  bottom: -80px;
  width: 240px;
  height: 160px;
  border-radius: 50%;
  background: rgba(24, 24, 27, 0.05);
  filter: blur(30px);
  pointer-events: none;
}

.dark .profile-hero-glow {
  background: rgba(255, 255, 255, 0.06);
}

.profile-brand-row,
.profile-hero-content,
.profile-section-head,
.profile-identity-card,
.profile-action-row,
.profile-bottom-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.profile-brand-row {
  gap: 12px;
}

.profile-logo-mark {
  display: flex;
  height: 42px;
  min-width: 42px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.58);
}

.dark .profile-logo-mark {
  border-color: rgba(244, 244, 245, 0.14);
  background: rgba(255, 255, 255, 0.06);
}

.profile-kicker {
  margin: 0;
  color: rgb(113, 113, 122);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.4;
  text-transform: uppercase;
}

.dark .profile-kicker {
  color: rgb(161, 161, 170);
}

.profile-brand-row h1 {
  margin: 3px 0 0;
  color: rgb(24, 24, 27);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 650;
  letter-spacing: -0.04em;
}

.dark .profile-brand-row h1 {
  color: rgb(250, 250, 250);
}

.profile-hero-content {
  justify-content: space-between;
  gap: 28px;
  margin-top: 34px;
}

.profile-identity-card {
  min-width: 0;
  flex: 1 1 48%;
  gap: 16px;
}

.profile-avatar-ring {
  display: flex;
  width: 86px;
  height: 86px;
  flex: 0 0 86px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.16);
  border-radius: 28px;
  background: rgba(228, 228, 231, 0.72);
  box-shadow: 0 12px 30px rgba(24, 24, 27, 0.1);
}

.dark .profile-avatar-ring {
  border-color: rgba(244, 244, 245, 0.16);
  background: rgba(63, 63, 70, 0.8);
}

.profile-identity-card h2 {
  margin: 4px 0 0;
  overflow: hidden;
  color: rgb(24, 24, 27);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 650;
  letter-spacing: -0.045em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .profile-identity-card h2 {
  color: rgb(250, 250, 250);
}

.profile-identity-card > div:last-of-type > p:last-child {
  margin: 5px 0 0;
  overflow: hidden;
  color: rgb(113, 113, 122);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .profile-identity-card > div:last-of-type > p:last-child {
  color: rgb(161, 161, 170);
}

.profile-hero-copy {
  max-width: 460px;
  flex: 1 1 42%;
}

.profile-hero-copy > p,
.profile-ai-summary {
  margin: 0;
  color: rgb(82, 82, 91);
  font-size: 14px;
  line-height: 1.8;
}

.dark .profile-hero-copy > p,
.dark .profile-ai-summary {
  color: rgb(212, 212, 216);
}

.profile-action-row {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.profile-primary-action,
.profile-ghost-action,
.profile-wide-secondary,
.profile-danger-action,
.profile-mini-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 650;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.profile-primary-action {
  border: 1px solid rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
  box-shadow: 0 10px 22px rgba(24, 24, 27, 0.16);
}

.profile-primary-action:hover {
  transform: translateY(-1px);
  background: rgb(39, 39, 42);
}

.dark .profile-primary-action {
  border-color: rgb(244, 244, 245);
  background: rgb(244, 244, 245);
  color: rgb(24, 24, 27);
}

.dark .profile-primary-action:hover {
  background: white;
}

.profile-ghost-action,
.profile-wide-secondary,
.profile-mini-button {
  border: 1px solid rgba(161, 161, 170, 0.42);
  background: rgba(255, 255, 255, 0.56);
  color: rgb(63, 63, 70);
}

.profile-ghost-action:hover,
.profile-wide-secondary:hover,
.profile-mini-button:hover {
  transform: translateY(-1px);
  border-color: rgba(24, 24, 27, 0.3);
  background: rgba(255, 255, 255, 0.9);
}

.dark .profile-ghost-action,
.dark .profile-wide-secondary,
.dark .profile-mini-button {
  border-color: rgba(113, 113, 122, 0.6);
  background: rgba(39, 39, 42, 0.62);
  color: rgb(244, 244, 245);
}

.dark .profile-ghost-action:hover,
.dark .profile-wide-secondary:hover,
.dark .profile-mini-button:hover {
  border-color: rgba(244, 244, 245, 0.36);
  background: rgba(63, 63, 70, 0.72);
}

.profile-primary-action:disabled,
.profile-ghost-action:disabled,
.profile-wide-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.profile-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.profile-metric-card {
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.92);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  padding: 17px 18px;
}

.dark .profile-metric-card {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(24, 24, 27, 0.72);
}

.profile-metric-card span,
.profile-reminder-grid span,
.profile-admin-strip span,
.profile-ai-status-grid span {
  display: block;
  color: rgb(113, 113, 122);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.dark .profile-metric-card span,
.dark .profile-reminder-grid span,
.dark .profile-admin-strip span,
.dark .profile-ai-status-grid span {
  color: rgb(161, 161, 170);
}

.profile-metric-card strong {
  display: block;
  margin-top: 7px;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.05em;
}

.profile-metric-card p,
.profile-info-row p,
.profile-tool-button p {
  margin: 5px 0 0;
  color: rgb(113, 113, 122);
  font-size: 12px;
  line-height: 1.6;
}

.dark .profile-metric-card p,
.dark .profile-info-row p,
.dark .profile-tool-button p {
  color: rgb(161, 161, 170);
}

.profile-layout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.profile-column {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.profile-section-head {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.profile-section-head h3 {
  margin: 4px 0 0;
  color: rgb(24, 24, 27);
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.035em;
}

.dark .profile-section-head h3 {
  color: rgb(250, 250, 250);
}

.profile-mini-button {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
}

.profile-stack-list {
  display: grid;
  gap: 10px;
}

.profile-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 16px;
  background: rgba(250, 250, 250, 0.76);
  padding: 13px 14px;
}

.dark .profile-info-row {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.55);
}

.profile-info-row strong,
.profile-reminder-grid strong,
.profile-admin-strip strong,
.profile-ai-status-grid strong,
.profile-tool-button strong {
  display: block;
  color: rgb(24, 24, 27);
  font-size: 13px;
  font-weight: 650;
}

.dark .profile-info-row strong,
.dark .profile-reminder-grid strong,
.dark .profile-admin-strip strong,
.dark .profile-ai-status-grid strong,
.dark .profile-tool-button strong {
  color: rgb(244, 244, 245);
}

.profile-reminder-grid,
.profile-admin-strip,
.profile-ai-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.profile-reminder-grid > div,
.profile-admin-strip > div,
.profile-ai-status-grid > div {
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 16px;
  background: rgba(250, 250, 250, 0.72);
  padding: 13px 14px;
}

.dark .profile-reminder-grid > div,
.dark .profile-admin-strip > div,
.dark .profile-ai-status-grid > div {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.55);
}

.profile-reminder-grid strong,
.profile-admin-strip strong,
.profile-ai-status-grid strong {
  overflow: hidden;
  margin-top: 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-admin-strip {
  margin-bottom: 12px;
}

.profile-muted-box {
  margin: 0;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 16px;
  background: rgba(250, 250, 250, 0.72);
  color: rgb(82, 82, 91);
  font-size: 12px;
  line-height: 1.7;
  padding: 13px 14px;
}

.dark .profile-muted-box {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.55);
  color: rgb(212, 212, 216);
}

.profile-ai-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(244, 244, 245, 0.82), rgba(255, 255, 255, 0.42));
  padding: 2px;
}

.dark .profile-ai-card {
  background: linear-gradient(135deg, rgba(82, 82, 91, 0.5), rgba(24, 24, 27, 0.46));
}

.profile-ai-orb {
  position: absolute;
  top: -100px;
  right: -40px;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 151, 85, 0.26), transparent 68%);
  filter: blur(2px);
}

.profile-ai-summary {
  max-width: 620px;
  margin-bottom: 16px;
}

.profile-ai-status-grid {
  position: relative;
  z-index: 1;
}

.profile-tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.profile-tool-button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 17px;
  text-align: left;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.profile-tool-button:hover {
  background: rgba(244, 244, 245, 0.7);
  transform: translateY(-1px);
}

.dark .profile-tool-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.profile-tool-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.profile-bottom-actions {
  flex-wrap: wrap;
  gap: 10px;
}

.profile-bottom-actions > * {
  flex: 1 1 150px;
}

.profile-danger-action {
  border: 1px solid rgba(239, 68, 68, 0.32);
  background: rgba(254, 226, 226, 0.72);
  color: rgb(185, 28, 28);
}

.profile-danger-action:hover {
  background: rgba(254, 202, 202, 0.9);
}

.dark .profile-danger-action {
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(127, 29, 29, 0.26);
  color: rgb(252, 165, 165);
}

.dark .profile-danger-action:hover {
  background: rgba(153, 27, 27, 0.38);
}

.ai-provider-modal {
  width: min(1480px, calc(100vw - 24px));
  max-height: min(940px, calc(100vh - 24px));
  overflow: hidden;
}

.ai-provider-shell {
  max-height: calc(min(940px, 100vh - 24px) - 66px);
  overflow-y: auto;
  padding: 32px;
}

.ai-provider-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid rgba(228, 228, 231, 0.88);
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(250, 250, 250, 0.96), rgba(244, 244, 245, 0.64));
  padding: 28px;
}

.dark .ai-provider-hero {
  border-color: rgba(63, 63, 70, 0.88);
  background: linear-gradient(135deg, rgba(39, 39, 42, 0.86), rgba(24, 24, 27, 0.7));
}

.ai-provider-hero h3,
.ai-provider-panel h4 {
  margin: 5px 0 0;
  color: rgb(24, 24, 27);
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.035em;
}

.dark .ai-provider-hero h3,
.dark .ai-provider-panel h4 {
  color: rgb(250, 250, 250);
}

.ai-provider-hero p:not(.ai-provider-kicker) {
  max-width: 650px;
  margin: 9px 0 0;
  color: rgb(82, 82, 91);
  font-size: 13px;
  line-height: 1.75;
}

.dark .ai-provider-hero p:not(.ai-provider-kicker) {
  color: rgb(212, 212, 216);
}

.ai-provider-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(420px, 0.88fr);
  gap: 24px;
  margin-top: 24px;
  align-items: start;
}

.ai-provider-panel {
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.88);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.58);
  padding: 28px;
}

.dark .ai-provider-panel {
  border-color: rgba(63, 63, 70, 0.88);
  background: rgba(24, 24, 27, 0.66);
}

.ai-provider-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.ai-provider-panel-head p:not(.ai-provider-kicker) {
  margin: 8px 0 0;
  color: rgb(113, 113, 122);
  font-size: 13px;
  line-height: 1.65;
}

.dark .ai-provider-panel-head p:not(.ai-provider-kicker) {
  color: rgb(161, 161, 170);
}

.ai-provider-form-grid {
  display: grid;
  gap: 18px;
}

.ai-form-section {
  display: grid;
  gap: 14px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 20px;
  background: rgba(250, 250, 250, 0.58);
  padding: 18px;
}

.dark .ai-form-section {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.42);
}

.ai-form-section-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ai-model-section {
  background:
    radial-gradient(circle at 92% 16%, rgba(180, 151, 85, 0.12), transparent 34%),
    rgba(250, 250, 250, 0.58);
}

.dark .ai-model-section {
  background:
    radial-gradient(circle at 92% 16%, rgba(180, 151, 85, 0.13), transparent 34%),
    rgba(39, 39, 42, 0.42);
}

.ai-form-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(24, 24, 27);
  font-size: 13px;
  font-weight: 700;
}

.dark .ai-form-section-title {
  color: rgb(244, 244, 245);
}

.ai-form-section-title span {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(24, 24, 27);
  color: white;
  font-size: 11px;
}

.dark .ai-form-section-title span {
  background: rgb(244, 244, 245);
  color: rgb(24, 24, 27);
}

.ai-field {
  display: grid;
  gap: 8px;
  color: rgb(63, 63, 70);
  font-size: 12px;
  font-weight: 650;
}

.dark .ai-field {
  color: rgb(228, 228, 231);
}

.ai-field .input-apple {
  min-height: 48px;
}

.ai-field-hint {
  margin: 0;
  color: rgb(113, 113, 122);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
}

.dark .ai-field-hint {
  color: rgb(161, 161, 170);
}

.ai-model-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 156px;
  gap: 14px;
  align-items: end;
}

.ai-model-refresh {
  min-height: 48px;
  white-space: nowrap;
}

.ai-model-count-card {
  min-height: 88px;
  border: 1px solid rgba(228, 228, 231, 0.78);
  border-radius: 16px;
  background: rgba(250, 250, 250, 0.72);
  padding: 14px 16px;
}

.dark .ai-model-count-card {
  border-color: rgba(63, 63, 70, 0.78);
  background: rgba(39, 39, 42, 0.55);
}

.ai-model-count-card span {
  display: block;
  color: rgb(113, 113, 122);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
}

.dark .ai-model-count-card span {
  color: rgb(161, 161, 170);
}

.ai-model-count-card strong {
  display: block;
  margin-top: 5px;
  color: rgb(24, 24, 27);
  font-size: 22px;
  font-weight: 650;
}

.dark .ai-model-count-card strong {
  color: rgb(244, 244, 245);
}

.ai-model-count-card p {
  margin: 3px 0 0;
  color: rgb(113, 113, 122);
  font-size: 12px;
  line-height: 1.45;
}

.dark .ai-model-count-card p {
  color: rgb(161, 161, 170);
}

.ai-provider-final-row {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
  gap: 14px;
  align-items: stretch;
}

.ai-provider-risk-note {
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 18px;
  background: rgba(254, 243, 199, 0.58);
  color: rgb(146, 64, 14);
  font-size: 12px;
  line-height: 1.7;
  padding: 14px 16px;
}

.dark .ai-provider-risk-note {
  border-color: rgba(245, 158, 11, 0.22);
  background: rgba(120, 53, 15, 0.18);
  color: rgb(253, 230, 138);
}

.ai-provider-footer-actions {
  display: flex;
  gap: 14px;
  margin-top: 22px;
}

.ai-provider-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(228, 228, 231, 0.82);
  border-radius: 20px;
  background: rgba(250, 250, 250, 0.72);
  padding: 17px;
}

.ai-provider-list {
  display: grid;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;
  gap: 12px;
}

.ai-provider-item.is-active {
  border-color: rgba(161, 132, 65, 0.58);
  box-shadow: 0 0 0 3px rgba(180, 151, 85, 0.1);
}

.dark .ai-provider-item {
  border-color: rgba(63, 63, 70, 0.82);
  background: rgba(39, 39, 42, 0.56);
}

.ai-provider-item h5 {
  margin: 0;
  color: rgb(24, 24, 27);
  font-size: 14px;
  font-weight: 650;
}

.dark .ai-provider-item h5 {
  color: rgb(244, 244, 245);
}

.ai-provider-item p {
  margin: 6px 0 0;
  color: rgb(113, 113, 122);
  font-size: 12px;
  line-height: 1.55;
}

.dark .ai-provider-item p {
  color: rgb(161, 161, 170);
}

.ai-provider-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.ai-provider-actions .btn-secondary {
  min-height: 32px;
  padding: 0 10px;
  font-size: 12px;
}

.ai-provider-empty {
  margin-top: 18px;
  border: 1px dashed rgba(161, 161, 170, 0.52);
  border-radius: 18px;
  background: rgba(250, 250, 250, 0.5);
  padding: 26px 20px;
  text-align: center;
}

.dark .ai-provider-empty {
  border-color: rgba(113, 113, 122, 0.62);
  background: rgba(39, 39, 42, 0.44);
}

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

@media (max-width: 1100px) {
  .ai-provider-grid {
    grid-template-columns: 1fr;
  }

  .ai-provider-modal {
    width: min(920px, calc(100vw - 32px));
  }
}

@media (max-width: 640px) {
  .profile-hero-panel,
  .ai-provider-shell {
    padding: 18px;
  }

  .profile-hero-content,
  .profile-layout-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .profile-hero-content {
    gap: 22px;
  }

  .profile-metric-grid,
  .profile-reminder-grid,
  .profile-admin-strip,
  .profile-ai-status-grid,
  .profile-tool-grid,
  .ai-provider-grid {
    grid-template-columns: 1fr;
  }

  .profile-hero-copy {
    max-width: none;
  }

  .profile-identity-card {
    width: 100%;
  }

  .profile-identity-card .summary-badge {
    display: none;
  }

  .profile-action-row > *,
  .profile-bottom-actions > * {
    flex: 1 1 100%;
  }

  .ai-provider-hero,
  .ai-provider-item {
    display: grid;
    grid-template-columns: 1fr;
  }

  .ai-model-picker {
    grid-template-columns: 1fr;
  }

  .ai-provider-panel-head,
  .ai-provider-footer-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .ai-form-section-two,
  .ai-provider-final-row {
    grid-template-columns: 1fr;
  }

  .ai-provider-actions {
    justify-content: flex-start;
  }

  .modal-card {
    border-radius: 24px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
