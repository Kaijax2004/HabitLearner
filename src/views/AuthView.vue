<template>
  <div class="auth-page relative min-h-screen overflow-hidden text-zinc-950 dark:text-white">
    <div class="auth-grid pointer-events-none absolute inset-0 opacity-40 dark:opacity-25" />

    <nav class="auth-nav relative z-10 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72">
      <div class="auth-nav-inner flex items-center justify-between px-5 sm:px-8">
        <div class="auth-nav-brand flex items-center gap-3">
          <div class="auth-nav-mark flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1rem] bg-zinc-950 text-white dark:bg-zinc-950 dark:text-white">
            <Logo size="default" class="brand-logo brand-logo--nav" />
          </div>
          <div>
            <p class="text-sm font-semibold tracking-[0.08em]">习知</p>
            <p class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">HabitLearner</p>
          </div>
        </div>

        <button
          type="button"
          class="auth-theme-button flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
          :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          @click="themeStore.toggleTheme()"
        >
          <svg v-if="themeStore.isDarkMode" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m8-8h1M3 12h1m12.364 6.364.707.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.001 9.001 0 0012 21a9.001 9.001 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </nav>

    <main class="auth-layout relative z-10">
      <section class="auth-intro hidden lg:flex">
        <div class="auth-intro-content">
          <div class="auth-brand-header auth-brand-header--lockup">
            <p class="auth-brand-kicker">Personal Workbench</p>
            <div class="auth-brand-lockup-frame">
              <Logo variant="brand" size="5xl" class="brand-logo brand-logo--hero-lockup" />
            </div>
            <div class="auth-brand-copyblock">
              <p class="auth-brand-tagline">知易行难，习以为常。</p>
              <p class="auth-brand-manifesto">
                习知把今天的真实状态、下一步行动和长期轨道放在同一张工作台上，让记录不只是保存，而是推动下一次行动。
              </p>
              <div class="auth-brand-axis" aria-label="习知品牌动作">
                <span>
                  <strong>知</strong>
                  <small>看见真实</small>
                </span>
                <span>
                  <strong>行</strong>
                  <small>收束行动</small>
                </span>
                <span>
                  <strong>习</strong>
                  <small>沉淀轨道</small>
                </span>
              </div>
            </div>
          </div>

          <div class="auth-narrative-panel" aria-label="习知工作流">
            <div class="auth-orbit-figure" aria-hidden="true">
              <div class="auth-orbit-figure__ring"></div>
              <div class="auth-orbit-figure__path"></div>
              <div class="auth-orbit-figure__core"></div>
            </div>

            <div class="auth-feature-stack">
              <div
                v-for="feature in features"
                :key="feature.index"
                class="auth-feature-card"
              >
                <span class="auth-feature-index">{{ feature.index }}</span>
                <div class="min-w-0">
                  <h2 class="text-[1.15rem] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">{{ feature.title }}</h2>
                  <p class="mt-1.5 text-[0.95rem] leading-7 text-zinc-600 dark:text-zinc-300">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="auth-entry flex px-5 py-10 sm:px-10">
        <div class="auth-form-shell w-full">
          <div class="mb-9 lg:hidden">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.2rem] bg-zinc-950 p-1 text-white dark:bg-zinc-950 dark:text-white">
                <Logo size="xl" class="brand-logo brand-logo--mobile" />
              </div>
              <div>
                <p class="text-lg font-semibold">习知</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">HabitLearner</p>
              </div>
            </div>
          </div>

          <div class="auth-entry-header mb-8">
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{{ authMeta.eyebrow }}</p>
            <h2 class="mt-3 text-[2rem] font-semibold tracking-[-0.04em] sm:text-[2.08rem]">{{ authMeta.title }}</h2>
            <p class="mt-3 text-[0.95rem] leading-6 text-zinc-600 dark:text-zinc-300">{{ authMeta.description }}</p>
          </div>

          <div v-if="authMode === 'login'" class="auth-login-panel mt-7">
            <div class="auth-method-tabs grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                class="auth-method-tab border-b-2 px-2 pb-3 text-sm font-medium transition"
                :class="loginMethod === 'password'
                  ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'"
                @click="loginMethod = 'password'"
              >
                密码登录
              </button>
              <button
                type="button"
                class="auth-method-tab border-b-2 px-2 pb-3 text-sm font-medium transition"
                :class="loginMethod === 'code'
                  ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'"
                @click="loginMethod = 'code'"
              >
                验证码登录
              </button>
            </div>

            <form v-if="loginMethod === 'password'" class="auth-auth-form mt-7 space-y-5" @submit.prevent="handlePasswordLogin">
              <div>
                <label class="field-label">邮箱地址</label>
                <input
                  v-model.trim="loginForm.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="auth-input"
                  placeholder="请输入邮箱地址"
                >
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label class="field-label mb-0">密码</label>
                  <button
                    type="button"
                    class="text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    @click="switchAuthMode('reset')"
                  >
                    找回密码
                  </button>
                </div>
                <div class="relative">
                  <input
                    v-model="loginForm.password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    required
                    autocomplete="current-password"
                    class="auth-input pr-16"
                    placeholder="请输入密码"
                  >
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 px-4 text-xs font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                    :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    {{ showLoginPassword ? '隐藏' : '显示' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading">
                {{ authStore.isLoading ? '登录中...' : '登录并进入工作区' }}
              </button>
            </form>

            <form v-else class="auth-auth-form mt-7 space-y-5" @submit.prevent="handleCodeLogin">
              <div>
                <label class="field-label">已注册邮箱</label>
                <input
                  v-model.trim="codeLoginForm.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="auth-input"
                  placeholder="请输入已注册邮箱"
                >
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label class="field-label mb-0">邮箱验证码</label>
                  <button
                    type="button"
                    class="text-sm font-medium text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
                    :disabled="isSendingLoginCode || loginCodeCountdown > 0 || !codeLoginForm.email.trim()"
                    @click="sendCode('login')"
                  >
                    {{ isSendingLoginCode ? '发送中...' : loginCodeCountdown > 0 ? `${loginCodeCountdown}s 后重发` : '发送验证码' }}
                  </button>
                </div>
                <input
                  v-model.trim="codeLoginForm.code"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  required
                  class="auth-input"
                  placeholder="请输入 6 位验证码"
                >
              </div>

              <p class="border-l-2 border-zinc-300 pl-3 text-xs leading-5 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                验证码仅支持已注册邮箱登录，未收到时请检查垃圾邮件箱。
              </p>

              <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading">
                {{ authStore.isLoading ? '登录中...' : '验证码登录' }}
              </button>
            </form>
          </div>

          <form v-else-if="authMode === 'register'" class="auth-auth-form mt-7 space-y-5" @submit.prevent="handleRegister">
            <div>
              <label class="field-label">用户名</label>
              <input
                v-model.trim="registerForm.name"
                type="text"
                required
                minlength="2"
                autocomplete="username"
                class="auth-input"
                placeholder="请输入用户名"
              >
            </div>

            <div>
              <label class="field-label">邮箱地址</label>
              <input
                v-model.trim="registerForm.email"
                type="email"
                required
                autocomplete="email"
                class="auth-input"
                placeholder="请输入邮箱地址"
              >
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label class="field-label mb-0">邮箱验证码</label>
                <button
                  type="button"
                  class="text-sm font-medium text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
                  :disabled="isSendingRegisterCode || registerCodeCountdown > 0 || !registerForm.email.trim()"
                  @click="sendCode('register')"
                >
                  {{ isSendingRegisterCode ? '发送中...' : registerCodeCountdown > 0 ? `${registerCodeCountdown}s 后重发` : '发送验证码' }}
                </button>
              </div>
              <input
                v-model.trim="registerForm.verificationCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                required
                class="auth-input"
                placeholder="请输入 6 位验证码"
              >
            </div>

            <div>
              <label class="field-label">密码</label>
              <div class="relative">
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="auth-input pr-16"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': registerForm.password && !isRegisterPasswordValid }"
                  placeholder="至少 6 位密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 px-4 text-xs font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                  :aria-label="showRegisterPassword ? '隐藏密码' : '显示密码'"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  {{ showRegisterPassword ? '隐藏' : '显示' }}
                </button>
              </div>
              <p v-if="registerForm.password && !isRegisterPasswordValid" class="mt-2 text-xs text-red-500">密码至少需要 6 位。</p>
            </div>

            <div>
              <label class="field-label">确认密码</label>
              <div class="relative">
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showRegisterConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  class="auth-input pr-16"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': registerForm.confirmPassword && !isRegisterPasswordMatch }"
                  placeholder="请再次输入密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 px-4 text-xs font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                  :aria-label="showRegisterConfirmPassword ? '隐藏密码' : '显示密码'"
                  @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                >
                  {{ showRegisterConfirmPassword ? '隐藏' : '显示' }}
                </button>
              </div>
              <p v-if="registerForm.confirmPassword && !isRegisterPasswordMatch" class="mt-2 text-xs text-red-500">两次输入的密码不一致。</p>
            </div>

            <label class="flex cursor-pointer items-start gap-3 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <input
                v-model="registerForm.agreeTerms"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
              >
              <span>我已阅读并同意用户协议与隐私政策。</span>
            </label>

            <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading || !canSubmitRegister">
              {{ authStore.isLoading ? '注册中...' : '创建账户并进入工作区' }}
            </button>
          </form>

          <form v-else class="auth-auth-form mt-7 space-y-5" @submit.prevent="handleResetPassword">
            <div>
              <label class="field-label">注册邮箱</label>
              <input
                v-model.trim="resetForm.email"
                type="email"
                required
                autocomplete="email"
                class="auth-input"
                placeholder="请输入注册邮箱"
              >
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label class="field-label mb-0">邮箱验证码</label>
                <button
                  type="button"
                  class="text-sm font-medium text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
                  :disabled="isSendingResetCode || resetCodeCountdown > 0 || !resetForm.email.trim()"
                  @click="sendCode('reset')"
                >
                  {{ isSendingResetCode ? '发送中...' : resetCodeCountdown > 0 ? `${resetCodeCountdown}s 后重发` : '发送验证码' }}
                </button>
              </div>
              <input
                v-model.trim="resetForm.code"
                type="text"
                inputmode="numeric"
                maxlength="6"
                required
                class="auth-input"
                placeholder="请输入 6 位验证码"
              >
            </div>

            <div>
              <label class="field-label">新密码</label>
              <div class="relative">
                <input
                  v-model="resetForm.newPassword"
                  :type="showResetPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="auth-input pr-16"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': resetForm.newPassword && !isResetPasswordValid }"
                  placeholder="至少 6 位密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 px-4 text-xs font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                  :aria-label="showResetPassword ? '隐藏密码' : '显示密码'"
                  @click="showResetPassword = !showResetPassword"
                >
                  {{ showResetPassword ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>

            <div>
              <label class="field-label">确认新密码</label>
              <div class="relative">
                <input
                  v-model="resetForm.confirmPassword"
                  :type="showResetConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  class="auth-input pr-16"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': resetForm.confirmPassword && !isResetPasswordMatch }"
                  placeholder="请再次输入新密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 px-4 text-xs font-medium text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                  :aria-label="showResetConfirmPassword ? '隐藏密码' : '显示密码'"
                  @click="showResetConfirmPassword = !showResetConfirmPassword"
                >
                  {{ showResetConfirmPassword ? '隐藏' : '显示' }}
                </button>
              </div>
              <p v-if="resetForm.confirmPassword && !isResetPasswordMatch" class="mt-2 text-xs text-red-500">两次输入的新密码不一致。</p>
            </div>

            <button type="submit" class="primary-button w-full" :disabled="isResettingPassword || !canSubmitReset">
              {{ isResettingPassword ? '设置中...' : '设置新密码' }}
            </button>

            <button
              type="button"
              class="secondary-button w-full"
              @click="switchAuthMode('login')"
            >
              返回登录
            </button>
          </form>

          <div v-if="authMode !== 'reset'" class="auth-footer-switch mt-7 border-t border-zinc-200 pt-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span v-if="authMode === 'login'">还没有账户？</span>
            <span v-else>已有账户？</span>
            <button
              type="button"
              class="ml-1 font-semibold text-zinc-950 transition hover:opacity-70 dark:text-white"
              @click="switchAuthMode(authMode === 'login' ? 'register' : 'login')"
            >
              {{ authMode === 'login' ? '立即注册' : '去登录' }}
            </button>
          </div>

          <div v-if="authMode === 'login'" class="auth-social-section" aria-label="第三方快捷登录">
            <button
              v-for="provider in socialProviders"
              :key="provider.key"
              type="button"
              class="auth-social-button"
              :title="provider.label"
              :aria-label="provider.label"
              @click="startSocialLogin(provider.key)"
            >
              <img :src="provider.icon" :alt="provider.label" class="auth-social-icon">
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as authAPI from '@/api/auth.js'
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/theme'
import Logo from '@/components/Logo.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const { success, error } = useToast()
const router = useRouter()

const features = [
  {
    index: '01',
    title: '看见真实状态',
    description: '收集灵感、习惯、计划和内容进度，先判断今天真正发生了什么。'
  },
  {
    index: '02',
    title: '收束下一步行动',
    description: '把模糊想法整理成可以开始的计划块、专注会话或内容选题。'
  },
  {
    index: '03',
    title: '沉淀长期轨道',
    description: '完成之后回写复盘和证据，让每一天都能连接到更长的趋势。'
  }
]

const authMode = ref('login')
const loginMethod = ref('password')

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
const showResetPassword = ref(false)
const showResetConfirmPassword = ref(false)

const isSendingLoginCode = ref(false)
const isSendingRegisterCode = ref(false)
const isSendingResetCode = ref(false)
const isResettingPassword = ref(false)

const loginCodeCountdown = ref(0)
const registerCodeCountdown = ref(0)
const resetCodeCountdown = ref(0)

let loginCodeTimer = null
let registerCodeTimer = null
let resetCodeTimer = null

const loginForm = ref({
  email: '',
  password: ''
})

const codeLoginForm = ref({
  email: '',
  code: ''
})

const registerForm = ref({
  name: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const resetForm = ref({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const socialProviders = [
  { key: 'wechat', label: '微信登录', icon: '/auth-providers/wechat.png' },
  { key: 'qq', label: 'QQ 登录', icon: '/auth-providers/qq.png' }
]

const authMeta = computed(() => {
  if (authMode.value === 'register') {
    return {
      eyebrow: '创建账户',
      title: '从第一条记录开始',
      description: '完成邮箱验证后即可创建你的习知账户，开始建立属于自己的节奏。'
    }
  }

  if (authMode.value === 'reset') {
    return {
      eyebrow: '找回账户',
      title: '设置新的登录密码',
      description: '验证注册邮箱后即可更新密码，不需要填写旧密码。'
    }
  }

  if (loginMethod.value === 'code') {
    return {
      eyebrow: '欢迎回来',
      title: '用验证码快速登录',
      description: '输入已注册邮箱，我们会向你的收件箱发送一次性登录验证码。'
    }
  }

  return {
    eyebrow: '欢迎回来',
    title: '继续你的日常节奏',
    description: '登录后回到习惯、计划和专注工作区，延续已经开始的记录。'
  }
})

const isRegisterPasswordValid = computed(() => registerForm.value.password.length >= 6)
const isRegisterPasswordMatch = computed(() => registerForm.value.password === registerForm.value.confirmPassword && registerForm.value.confirmPassword.length > 0)
const canSubmitRegister = computed(() => (
  registerForm.value.name.trim().length >= 2
  && registerForm.value.email.trim()
  && registerForm.value.verificationCode.trim().length === 6
  && isRegisterPasswordValid.value
  && isRegisterPasswordMatch.value
  && registerForm.value.agreeTerms
))

const isResetPasswordValid = computed(() => resetForm.value.newPassword.length >= 6)
const isResetPasswordMatch = computed(() => resetForm.value.newPassword === resetForm.value.confirmPassword && resetForm.value.confirmPassword.length > 0)
const canSubmitReset = computed(() => (
  resetForm.value.email.trim()
  && resetForm.value.code.trim().length === 6
  && isResetPasswordValid.value
  && isResetPasswordMatch.value
))

const clearTimer = (key) => {
  if (key === 'login' && loginCodeTimer) {
    window.clearInterval(loginCodeTimer)
    loginCodeTimer = null
  }

  if (key === 'register' && registerCodeTimer) {
    window.clearInterval(registerCodeTimer)
    registerCodeTimer = null
  }

  if (key === 'reset' && resetCodeTimer) {
    window.clearInterval(resetCodeTimer)
    resetCodeTimer = null
  }
}

const startCountdown = (key) => {
  const target = key === 'login' ? loginCodeCountdown : key === 'register' ? registerCodeCountdown : resetCodeCountdown
  target.value = 60
  clearTimer(key)

  const timer = window.setInterval(() => {
    target.value -= 1
    if (target.value <= 0) {
      target.value = 0
      clearTimer(key)
    }
  }, 1000)

  if (key === 'login') loginCodeTimer = timer
  if (key === 'register') registerCodeTimer = timer
  if (key === 'reset') resetCodeTimer = timer
}

const switchAuthMode = (mode) => {
  authMode.value = mode
  if (mode === 'login') {
    loginMethod.value = 'password'
  }
}

const getErrorMessage = (message = '', code) => {
  const text = String(message || '')
  const normalized = text.toLowerCase()

  if (code === 404 || normalized.includes('unavailable') || normalized.includes('service')) {
    return '后端服务暂时不可用，请稍后重试。'
  }

  if (code === 409 || text.includes('已注册') || normalized.includes('already')) {
    return text || '该邮箱已注册，请直接登录。'
  }

  if (code === 429 || text.includes('频繁') || normalized.includes('too many')) {
    return text || '操作过于频繁，请稍后再试。'
  }

  if (code === 400 && (text.includes('验证码') || normalized.includes('verification'))) {
    return text || '验证码无效或已过期，请重新发送。'
  }

  if (code === 401 || text.includes('密码错误') || normalized.includes('password') || normalized.includes('login')) {
    return text || '邮箱或密码错误。'
  }

  if (code === 422 || text.includes('格式') || normalized.includes('validation')) {
    return text || '输入信息格式不正确，请检查后重试。'
  }

  return text || '发生未知错误，请稍后重试。'
}

const startSocialLogin = (provider) => {
  const url = authAPI.getSocialLoginUrl(provider, router.currentRoute.value.query.redirect || '/dashboard')
  if (!url) {
    error('快捷登录不可用', { description: '暂不支持该登录方式。' })
    return
  }
  window.location.assign(url)
}

const sendCode = async (scene) => {
  const configMap = {
    login: {
      email: codeLoginForm.value.email.trim(),
      type: 'email_login',
      setLoading: (value) => { isSendingLoginCode.value = value }
    },
    register: {
      email: registerForm.value.email.trim(),
      type: 'email_verify',
      setLoading: (value) => { isSendingRegisterCode.value = value }
    },
    reset: {
      email: resetForm.value.email.trim(),
      type: 'password_reset',
      setLoading: (value) => { isSendingResetCode.value = value }
    }
  }

  const config = configMap[scene]
  if (!config?.email) {
    error('发送失败', { description: '请先输入邮箱地址。' })
    return
  }

  config.setLoading(true)
  try {
    const response = await authAPI.sendVerifyCode(config.email, config.type)
    if (!response.success) {
      throw new Error(response.error || response.message || '发送失败')
    }

    startCountdown(scene)
    success('验证码已发送', {
      description: '请检查邮箱收件箱。'
    })
  } catch (err) {
    error('发送失败', {
      description: getErrorMessage(err.error || err.message, err.code)
    })
  } finally {
    config.setLoading(false)
  }
}

const handlePasswordLogin = async () => {
  const result = await authStore.login(loginForm.value)

  if (result.success) {
    router.push('/dashboard')
    return
  }

  error('登录失败', {
    description: getErrorMessage(result.error, result.code)
  })
}

const handleCodeLogin = async () => {
  const result = await authStore.loginWithCode({
    email: codeLoginForm.value.email.trim(),
    code: codeLoginForm.value.code.trim()
  })

  if (result.success) {
    router.push('/dashboard')
    return
  }

  error('登录失败', {
    description: getErrorMessage(result.error, result.code)
  })
}

const handleRegister = async () => {
  if (!isRegisterPasswordValid.value) {
    error('注册失败', { description: '密码至少需要 6 位。' })
    return
  }

  if (!isRegisterPasswordMatch.value) {
    error('注册失败', { description: '两次输入的密码不一致。' })
    return
  }

  const result = await authStore.register({
    name: registerForm.value.name,
    email: registerForm.value.email.trim(),
    verificationCode: registerForm.value.verificationCode.trim(),
    password: registerForm.value.password
  })

  if (result.success) {
    router.push('/dashboard')
    return
  }

  error('注册失败', {
    description: getErrorMessage(result.error, result.code)
  })
}

const handleResetPassword = async () => {
  if (!canSubmitReset.value) {
    error('设置失败', { description: '请完整填写邮箱、验证码和新密码。' })
    return
  }

  isResettingPassword.value = true
  try {
    const response = await authAPI.resetPassword({
      email: resetForm.value.email.trim(),
      code: resetForm.value.code.trim(),
      newPassword: resetForm.value.newPassword,
      confirmPassword: resetForm.value.confirmPassword
    })

    if (!response.success) {
      throw new Error(response.error || response.message || '密码重置失败')
    }

    loginForm.value.email = resetForm.value.email.trim()
    resetForm.value = {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    }
    switchAuthMode('login')
    success('密码已重置', {
      description: '现在可以使用新密码登录。'
    })
  } catch (err) {
    error('设置失败', {
      description: getErrorMessage(err.error || err.message, err.code)
    })
  } finally {
    isResettingPassword.value = false
  }
}

onBeforeUnmount(() => {
  clearTimer('login')
  clearTimer('register')
  clearTimer('reset')
})
</script>

<style scoped>
.auth-page {
  isolation: isolate;
  background:
    radial-gradient(circle at top left, rgba(217, 205, 189, 0.3), transparent 26%),
    radial-gradient(circle at 50% -8%, rgba(255, 255, 255, 0.68), transparent 32%),
    radial-gradient(circle at bottom right, rgba(226, 216, 202, 0.22), transparent 28%),
    linear-gradient(135deg, #f7f2ea 0%, #f4efe6 46%, #faf7f1 100%);
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #18181b;
}

.dark .auth-page {
  background:
    radial-gradient(circle at top left, rgba(66, 66, 74, 0.18), transparent 24%),
    radial-gradient(circle at 50% -10%, rgba(255, 255, 255, 0.08), transparent 34%),
    radial-gradient(circle at bottom right, rgba(39, 39, 42, 0.16), transparent 28%),
    linear-gradient(160deg, #080808 0%, #111113 46%, #0a0a0b 100%);
  color: #fafafa;
}

.auth-page::before,
.auth-page::after {
  content: '';
  position: absolute;
  inset: -18% auto auto -12%;
  width: 52rem;
  height: 52rem;
  border-radius: 999px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
  filter: blur(42px);
}

.auth-page::before {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.42) 0%, rgba(255, 250, 241, 0.2) 34%, rgba(255, 255, 255, 0) 72%);
  animation: authGlowFloat 18s ease-in-out infinite;
}

.auth-page::after {
  inset: auto -10% -22% auto;
  width: 34rem;
  height: 34rem;
  background: radial-gradient(circle, rgba(213, 195, 166, 0.22) 0%, rgba(213, 195, 166, 0.08) 34%, rgba(255, 255, 255, 0) 72%);
  opacity: 0.42;
  animation: authGlowFloatAlt 22s ease-in-out infinite;
}

.dark .auth-page::before {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(115, 115, 122, 0.08) 34%, rgba(255, 255, 255, 0) 72%);
  opacity: 0.72;
}

.dark .auth-page::after {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(63, 63, 70, 0.08) 34%, rgba(255, 255, 255, 0) 72%);
  opacity: 0.52;
}

.auth-nav {
  position: sticky;
  top: 0;
  border-color: rgba(24, 24, 27, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 252, 248, 0.82), rgba(250, 246, 240, 0.64)),
    rgba(252, 249, 244, 0.68);
  box-shadow:
    0 12px 28px rgba(24, 24, 27, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(24px);
  animation: authNavBreath 16s ease-in-out infinite;
}

.dark .auth-nav {
  border-color: rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(22, 22, 24, 0.84), rgba(10, 10, 11, 0.68)),
    rgba(10, 10, 11, 0.7);
  box-shadow:
    0 16px 34px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation-name: authNavBreathDark;
}

.auth-nav-inner {
  width: 100%;
  height: 5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.auth-nav-brand {
  gap: 0.9rem !important;
  padding: 0.48rem 0.78rem 0.48rem 0.5rem;
  border: 1px solid rgba(24, 24, 27, 0.06);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.32);
  box-shadow:
    0 10px 24px rgba(24, 24, 27, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  animation: authBadgeBreath 14s ease-in-out infinite;
}

.dark .auth-nav-brand {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.035);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation-name: authBadgeBreathDark;
}

.auth-nav-mark {
  position: relative;
  width: 2.7rem;
  height: 2.7rem;
  flex-shrink: 0;
  padding: 0.18rem;
  overflow: hidden;
  border-radius: 1rem !important;
  border: 1px solid rgba(24, 24, 27, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.04)),
    linear-gradient(180deg, #1a1a1b 0%, #09090b 100%);
  box-shadow:
    0 12px 24px rgba(24, 24, 27, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.auth-nav-mark::after {
  content: '';
  position: absolute;
  inset: 0.18rem;
  border-radius: 0.82rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.dark .auth-nav-mark {
  border-color: rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
    linear-gradient(180deg, #1a1a1b 0%, #09090b 100%);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.dark .auth-nav-mark::after {
  border-color: rgba(255, 255, 255, 0.22);
}

.auth-nav-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-right: 0.08rem;
}

.auth-nav-copy p:first-child {
  font-size: 0.9rem !important;
  line-height: 1;
  letter-spacing: 0.14em !important;
  color: rgba(24, 24, 27, 0.96);
}

.auth-nav-copy p:last-child {
  margin-top: 0.32rem !important;
  font-size: 0.64rem !important;
  line-height: 1;
  letter-spacing: 0.28em !important;
  color: rgba(82, 82, 91, 0.78) !important;
}

.dark .auth-nav-copy p:first-child {
  color: rgba(250, 250, 250, 0.96);
}

.dark .auth-nav-copy p:last-child {
  color: rgba(212, 212, 216, 0.76) !important;
}

.auth-theme-button {
  border-color: rgba(24, 24, 27, 0.09) !important;
  background: rgba(255, 255, 255, 0.72) !important;
  box-shadow:
    0 10px 20px rgba(24, 24, 27, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.auth-theme-button:hover {
  transform: translateY(-1px);
}

.dark .auth-theme-button {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(24, 24, 27, 0.7) !important;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.auth-layout {
  display: grid;
  width: 100%;
  max-width: 1720px;
  min-height: calc(100vh - 5rem);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1.2fr) minmax(420px, 0.76fr);
  column-gap: clamp(2.25rem, 4.5vw, 5.75rem);
  align-items: start;
}

.auth-intro {
  min-height: calc(100vh - 5rem);
  justify-content: flex-start;
  align-items: flex-start;
  padding: clamp(2.75rem, 5vw, 5rem) clamp(3.5rem, 7vw, 7rem) clamp(3rem, 6vw, 5rem);
}

.auth-intro-content {
  position: relative;
  width: min(100%, 50rem);
  margin: 0 auto;
  padding-top: clamp(0.35rem, 1vw, 0.8rem);
}

.auth-intro-content::before {
  content: '习知';
  position: absolute;
  top: clamp(7.5rem, 12vw, 10.5rem);
  right: clamp(-1.2rem, -2vw, -0.5rem);
  z-index: -1;
  writing-mode: vertical-rl;
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(5.5rem, 10vw, 9rem);
  font-weight: 700;
  line-height: 0.78;
  letter-spacing: -0.16em;
  color: rgba(24, 24, 27, 0.035);
  user-select: none;
  pointer-events: none;
}

.dark .auth-intro-content::before {
  color: rgba(255, 255, 255, 0.045);
}

.auth-brand-header {
  display: grid;
  gap: 1.15rem;
  margin-bottom: 1.45rem;
}

.auth-brand-header--lockup {
  display: grid;
  gap: 0.95rem;
  max-width: 44rem;
}

.auth-brand-kicker {
  width: fit-content;
  margin: 0;
  border-bottom: 1px solid rgba(24, 24, 27, 0.18);
  padding-bottom: 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(63, 63, 70, 0.74);
}

.dark .auth-brand-kicker {
  border-bottom-color: rgba(255, 255, 255, 0.18);
  color: rgba(212, 212, 216, 0.72);
}

.auth-brand-lockup-frame {
  position: relative;
  width: min(100%, 37.5rem);
  padding: 0.55rem;
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 2.15rem;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.24)),
    radial-gradient(circle at 12% 18%, rgba(216, 197, 161, 0.18), transparent 42%);
  box-shadow:
    0 28px 60px rgba(24, 24, 27, 0.075),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
}

.auth-brand-lockup-frame::after {
  content: '';
  position: absolute;
  inset: 0.55rem;
  border-radius: 1.55rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.dark .auth-brand-lockup-frame {
  border-color: rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    radial-gradient(circle at 14% 18%, rgba(216, 197, 161, 0.1), transparent 42%),
    rgba(16, 16, 18, 0.62);
  box-shadow:
    0 24px 54px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.auth-brand-copyblock {
  display: grid;
  gap: 0.65rem;
  max-width: 36rem;
}

.auth-brand-copyblock::before {
  content: 'CURRENT TRUTH / NEXT STEP';
  width: fit-content;
  border-radius: 999px;
  border: 1px solid rgba(24, 24, 27, 0.08);
  background: rgba(255, 255, 255, 0.42);
  padding: 0.42rem 0.68rem;
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(82, 82, 91, 0.66);
}

.dark .auth-brand-copyblock::before {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.045);
  color: rgba(212, 212, 216, 0.62);
}

.auth-brand-tagline {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(2.15rem, 4.25vw, 4rem);
  font-weight: 600;
  line-height: 0.98;
  letter-spacing: -0.07em;
  text-wrap: balance;
  color: rgba(24, 24, 27, 0.94);
}

.dark .auth-brand-tagline {
  color: rgba(250, 250, 250, 0.86);
}

.auth-brand-manifesto {
  max-width: 31.5rem;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.85;
  color: rgba(63, 63, 70, 0.8);
}

.dark .auth-brand-manifesto {
  color: rgba(228, 228, 231, 0.72);
}

.auth-brand-axis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: min(100%, 31.5rem);
  margin-top: 0.15rem;
  border-top: 1px solid rgba(24, 24, 27, 0.1);
  border-bottom: 1px solid rgba(24, 24, 27, 0.1);
}

.auth-brand-axis span {
  display: grid;
  gap: 0.35rem;
  padding: 0.82rem 0.95rem 0.85rem 0;
}

.auth-brand-axis span + span {
  border-left: 1px solid rgba(24, 24, 27, 0.08);
  padding-left: 0.95rem;
}

.auth-brand-axis strong {
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", serif;
  font-size: 1.72rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.08em;
  color: rgba(24, 24, 27, 0.92);
}

.auth-brand-axis small {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(82, 82, 91, 0.7);
}

.dark .auth-brand-axis {
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .auth-brand-axis span + span {
  border-left-color: rgba(255, 255, 255, 0.09);
}

.dark .auth-brand-axis strong {
  color: rgba(250, 250, 250, 0.9);
}

.dark .auth-brand-axis small {
  color: rgba(212, 212, 216, 0.65);
}

.auth-form-shell h2,
.auth-feature-card h2 {
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", serif;
  font-weight: 600;
}

.auth-brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.15rem;
  height: 5.15rem;
  padding: 0.45rem;
  overflow: hidden;
  border-radius: 1.65rem;
  border: 1px solid rgba(24, 24, 27, 0.08);
  background: rgba(255, 255, 255, 0.76);
  box-shadow:
    0 20px 45px rgba(24, 24, 27, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(18px);
}

.dark .auth-brand-mark {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(20, 20, 22, 0.86);
  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.auth-feature-stack {
  display: grid;
  gap: 0;
}

.auth-feature-card {
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  align-items: start;
  gap: 1rem;
  border-top: 1px solid rgba(24, 24, 27, 0.09);
  padding: 1rem 0 1rem;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.auth-feature-card:last-child {
  border-bottom: 1px solid rgba(24, 24, 27, 0.09);
}

.auth-feature-card:hover {
  transform: translateX(0.22rem);
}

.dark .auth-feature-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.auth-feature-card h2 {
  font-size: 1.18rem !important;
  letter-spacing: -0.03em !important;
}

.auth-feature-card p {
  font-size: 0.93rem !important;
  line-height: 1.85;
  color: rgba(63, 63, 70, 0.82);
}

.dark .auth-feature-card p {
  color: rgba(228, 228, 231, 0.76);
}

.auth-feature-index {
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(24, 24, 27, 0.48);
}

.dark .auth-feature-index {
  color: rgba(212, 212, 216, 0.52);
}

.auth-narrative-panel {
  display: grid;
  grid-template-columns: minmax(9rem, 11.25rem) minmax(0, 1fr);
  align-items: center;
  gap: clamp(1.2rem, 2.5vw, 2rem);
  width: min(100%, 44rem);
  margin-top: 1.95rem;
}

.auth-orbit-figure {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 1px solid rgba(24, 24, 27, 0.1);
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.34) 0 17%, transparent 18%),
    radial-gradient(circle at center, transparent 56%, rgba(24, 24, 27, 0.035) 57% 58%, transparent 59%);
}

.dark .auth-orbit-figure {
  border-color: rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.055) 0 17%, transparent 18%),
    radial-gradient(circle at center, transparent 56%, rgba(255, 255, 255, 0.05) 57% 58%, transparent 59%);
}

.auth-orbit-figure__ring,
.auth-orbit-figure__path {
  position: absolute;
  inset: 1.2rem;
  border-radius: 999px;
  border: 2px solid rgba(24, 24, 27, 0.16);
  border-left-color: transparent;
  border-bottom-color: transparent;
  transform: rotate(28deg);
}

.auth-orbit-figure__path {
  inset: 2.45rem;
  border-width: 1px;
  border-color: rgba(216, 197, 161, 0.62);
  border-right-color: transparent;
  border-top-color: transparent;
  transform: rotate(-18deg);
}

.dark .auth-orbit-figure__ring {
  border-color: rgba(255, 255, 255, 0.16);
  border-left-color: transparent;
  border-bottom-color: transparent;
}

.dark .auth-orbit-figure__path {
  border-color: rgba(216, 197, 161, 0.5);
  border-right-color: transparent;
  border-top-color: transparent;
}

.auth-orbit-figure__core {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 2.75rem;
  height: 2.75rem;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.5), transparent 42%),
    #d8c5a1;
  box-shadow:
    0 0 0 0.72rem rgba(216, 197, 161, 0.12),
    0 18px 32px rgba(24, 24, 27, 0.12);
}

.auth-entry {
  min-height: calc(100vh - 5rem);
  align-items: flex-start;
  justify-content: center;
  padding-block: clamp(2.8rem, 5vw, 4rem);
  padding-inline: clamp(2rem, 5vw, 5.5rem);
}

.auth-form-shell {
  max-width: 33.5rem;
  margin: 0 auto;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.66);
  padding: 2.5rem 2.3rem 2.2rem;
  box-shadow:
    0 34px 64px rgba(24, 24, 27, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(24px);
}

.dark .auth-form-shell {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(16, 16, 18, 0.78);
  box-shadow:
    0 32px 60px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.auth-form-shell::before {
  content: '';
  display: block;
  width: 4.25rem;
  height: 0.25rem;
  margin-bottom: 1.65rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(24, 24, 27, 0.18), rgba(216, 197, 161, 0.72));
}

.auth-form-shell h2 {
  letter-spacing: -0.05em !important;
}

.auth-entry-header {
  margin-bottom: 2.15rem !important;
}

.auth-form-shell > .mb-8 p:first-child {
  letter-spacing: 0.22em !important;
}

.auth-form-shell > .mb-8 h2 {
  margin-top: 0.9rem !important;
  line-height: 1.02;
}

.auth-form-shell > .mb-8 p:last-child {
  margin-top: 1rem !important;
  max-width: 24rem;
  line-height: 1.8;
}


.auth-login-panel {
  margin-top: 0 !important;
}

.auth-social-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  margin-top: 1.15rem;
}

.auth-social-button {
  display: inline-flex;
  width: 3.25rem;
  height: 3.25rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.9), transparent 42%),
    rgba(255, 255, 255, 0.78);
  box-shadow:
    0 14px 28px rgba(24, 24, 27, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, opacity 160ms ease;
}

.auth-social-button:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(24, 24, 27, 0.26);
  background: rgba(255, 255, 255, 0.92);
}

.auth-social-button:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

.auth-social-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.auth-social-icon {
  width: 1.7rem;
  height: 1.7rem;
  object-fit: contain;
}

.auth-social-button[aria-label="QQ 登录"] .auth-social-icon {
  width: 1.95rem;
  height: 1.95rem;
}

.dark .auth-social-button {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(24, 24, 27, 0.68);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .auth-social-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(39, 39, 42, 0.86);
}
.auth-method-tabs {
  padding: 0.28rem;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.48);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.68),
    0 10px 20px rgba(24, 24, 27, 0.035);
}

.dark .auth-method-tabs {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(24, 24, 27, 0.58);
}

.auth-method-tab {
  min-height: 2.8rem;
  border: 1px solid transparent !important;
  border-radius: 999px;
  padding: 0.72rem 0.9rem !important;
  font-size: 0.88rem !important;
  letter-spacing: 0.02em;
}

.auth-method-tab.border-zinc-950,
.auth-method-tab.dark\:border-white {
  border-width: 1px !important;
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 8px 18px rgba(24, 24, 27, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.dark .auth-method-tab.border-zinc-950,
.dark .auth-method-tab.dark\:border-white {
  background: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.auth-form-shell form {
  margin-top: 2rem !important;
}

.auth-form-shell form.space-y-5 > * + * {
  margin-top: 1.5rem !important;
}

.auth-auth-form > .primary-button:last-child,
.auth-auth-form > .secondary-button:last-child,
.auth-auth-form > p + .primary-button {
  margin-top: 0.4rem;
}

.auth-form-shell .relative button.text-xs {
  font-size: 0.75rem !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-footer-switch {
  margin-top: 2.3rem !important;
  padding-top: 1.5rem !important;
  border-top-color: rgba(24, 24, 27, 0.08) !important;
}

.auth-footer-switch button {
  letter-spacing: 0.01em;
}

.auth-grid {
  background-image:
    linear-gradient(rgba(24, 24, 27, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 24, 27, 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(circle at top center, rgba(0, 0, 0, 0.98), transparent 88%);
  animation: authGridDrift 26s linear infinite;
}

.dark .auth-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}

@keyframes authGlowFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translate3d(1.2rem, -0.9rem, 0) scale(1.04);
    opacity: 0.72;
  }
}

@keyframes authGlowFloatAlt {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.42;
  }
  50% {
    transform: translate3d(-1rem, 0.8rem, 0) scale(1.06);
    opacity: 0.56;
  }
}

@keyframes authNavBreath {
  0%, 100% {
    box-shadow:
      0 12px 28px rgba(24, 24, 27, 0.045),
      inset 0 1px 0 rgba(255, 255, 255, 0.62);
  }
  50% {
    box-shadow:
      0 16px 34px rgba(24, 24, 27, 0.065),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }
}

@keyframes authBadgeBreath {
  0%, 100% {
    transform: translate3d(0, 0, 0);
    box-shadow:
      0 10px 24px rgba(24, 24, 27, 0.035),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  50% {
    transform: translate3d(0, -1px, 0);
    box-shadow:
      0 14px 30px rgba(24, 24, 27, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }
}

@keyframes authNavBreathDark {
  0%, 100% {
    box-shadow:
      0 16px 34px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  50% {
    box-shadow:
      0 20px 42px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }
}

@keyframes authBadgeBreathDark {
  0%, 100% {
    transform: translate3d(0, 0, 0);
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  50% {
    transform: translate3d(0, -1px, 0);
    box-shadow:
      0 14px 30px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
}

@keyframes authGridDrift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0.5rem, -0.35rem, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-page::before,
  .auth-page::after,
  .auth-nav,
  .auth-nav-brand,
  .auth-grid {
    animation: none !important;
  }
}

@media (max-width: 1023px) {
  .auth-layout {
    display: block;
    min-height: calc(100vh - 5rem);
  }

  .auth-entry {
    min-height: calc(100vh - 5rem);
    padding-block: 3rem;
  }

  .auth-intro {
    min-height: auto;
    padding-top: 3rem;
    padding-bottom: 1rem;
  }

  .auth-nav {
    position: relative;
  }

  .auth-form-shell {
    max-width: 34rem;
    padding: 2.1rem 1.55rem 1.9rem;
  }
}

@media (max-width: 639px) {
  .auth-entry {
    padding-inline: 1.25rem;
    padding-block: 2.2rem;
  }

  .auth-entry-header {
    margin-bottom: 1.7rem !important;
  }

  .auth-form-shell > .mb-8 h2 {
    font-size: 1.82rem !important;
  }

  .auth-form-shell form.space-y-5 > * + * {
    margin-top: 1.25rem !important;
  }
}

.field-label {
  display: block;
  margin-bottom: 0.62rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(87 83 78);
}

.dark .field-label {
  color: rgba(228, 228, 231, 0.78);
}

.auth-input {
  width: 100%;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.88);
  padding: 1rem 1.05rem;
  font-size: 0.95rem;
  color: rgb(24 24 27);
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.auth-input::placeholder {
  color: rgb(161 161 170);
}

.auth-input:focus {
  border-color: rgba(24, 24, 27, 0.4);
  box-shadow:
    0 0 0 3px rgba(24, 24, 27, 0.06),
    0 10px 22px rgba(24, 24, 27, 0.05);
  transform: translateY(-1px);
}

.dark .auth-input {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 22, 0.82);
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dark .auth-input:focus {
  border-color: rgba(255, 255, 255, 0.46);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
}

.primary-button,
.secondary-button {
  min-height: 3.35rem;
  border-radius: 999px;
  padding: 0.88rem 1.28rem;
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.primary-button {
  background: linear-gradient(180deg, #191919 0%, #09090b 100%);
  color: white;
  box-shadow: 0 14px 24px rgba(24, 24, 27, 0.18);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(180deg, #27272a 0%, #111113 100%);
  box-shadow: 0 18px 28px rgba(24, 24, 27, 0.2);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .primary-button {
  background: linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%);
  color: rgb(24 24 27);
}

.dark .primary-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #fafafa 0%, #d4d4d8 100%);
}

.secondary-button {
  border: 1px solid rgba(24, 24, 27, 0.12);
  background: rgba(255, 255, 255, 0.46);
  color: rgb(63 63 70);
}

.secondary-button:hover {
  border-color: rgba(24, 24, 27, 0.2);
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 12px 24px rgba(24, 24, 27, 0.08);
}

.dark .secondary-button {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(24, 24, 27, 0.58);
  color: rgb(212 212 216);
}

.dark .secondary-button:hover {
  border-color: rgb(113 113 122);
  background: rgba(39, 39, 42, 0.7);
}

@media (max-width: 1023px) {
  .auth-form-shell {
    max-width: 34rem;
    padding: 2.1rem 1.55rem 1.85rem;
  }

}

.brand-logo--nav :deep(img),
.brand-logo--nav :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border-radius: 0.82rem;
  object-fit: contain !important;
}

.brand-logo--mobile :deep(img),
.brand-logo--mobile :deep(svg) {
  width: 34px !important;
  height: 34px !important;
  max-width: 34px !important;
  max-height: 34px !important;
  border-radius: 0.95rem;
}

.brand-logo--hero :deep(img),
.brand-logo--hero :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border-radius: 1.18rem;
  object-fit: contain !important;
  box-shadow:
    0 8px 18px rgba(24, 24, 27, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.brand-logo--hero-lockup {
  justify-content: flex-start;
  width: 100%;
}

.brand-logo--hero-lockup :deep(img) {
  width: 100% !important;
  height: clamp(9.4rem, 14vw, 12.4rem) !important;
  max-height: none !important;
  border-radius: 1.55rem;
  object-fit: cover !important;
  object-position: left center;
  box-shadow:
    0 18px 40px rgba(24, 24, 27, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
</style>

