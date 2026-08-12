<template>
  <div class="auth-page relative min-h-screen overflow-hidden text-zinc-950 dark:text-white">
    <div class="auth-grid pointer-events-none absolute inset-0 opacity-40 dark:opacity-25" />

    <nav class="auth-nav relative z-10 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72">
      <div class="auth-nav-inner flex items-center justify-between px-5 sm:px-8">
        <div class="auth-nav-brand flex items-center gap-3">
          <div class="auth-nav-mark flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
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
          <div class="auth-brand-header">
            <div class="auth-brand-mark">
              <Logo size="4xl" class="brand-logo brand-logo--hero" />
            </div>

            <div class="min-w-0">
              <h1 class="text-[2.45rem] font-semibold tracking-[-0.05em] text-zinc-950 dark:text-white">习知</h1>
              <p class="mt-1 text-[0.98rem] font-medium tracking-[0.01em] text-zinc-500 dark:text-zinc-400">HabitLearner</p>
              <p class="mt-3.5 text-[0.98rem] leading-7 text-zinc-600 dark:text-zinc-300">知易行难，习以为常。</p>
</div>
</div>

          <div class="auth-feature-stack">
            <div
              v-for="feature in features"
              :key="feature.index"
              class="auth-feature-card"
            >
              <div class="auth-feature-icon">
                <svg v-if="feature.icon === 'habit'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M8 6v12M12 3v18M16 8v8" />
                </svg>
                <svg v-else-if="feature.icon === 'learning'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M4 6.5C5.4 5.5 7.3 5 9 5c1.8 0 3.7.5 5 1.5M4 6.5v11c1.4-1 3.3-1.5 5-1.5 1.8 0 3.7.5 5 1.5m0-11C15.3 5.5 17.2 5 19 5c1.7 0 3.6.5 5 1.5v11c-1.4-1-3.3-1.5-5-1.5-1.8 0-3.7.5-5 1.5" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 4v4m0 8v4M4 12h4m8 0h4M7.8 7.8l2.8 2.8m2.8 2.8 2.8 2.8m0-8.4-2.8 2.8m-2.8 2.8-2.8 2.8" />
                </svg>
              </div>

              <div class="min-w-0">
                <h2 class="text-[1.15rem] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">{{ feature.title }}</h2>
                <p class="mt-1.5 text-[0.95rem] leading-7 text-zinc-600 dark:text-zinc-300">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="auth-entry flex px-5 py-10 sm:px-10">
        <div class="auth-form-shell w-full">
          <div class="mb-9 lg:hidden">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
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

          <div v-if="authMode !== 'reset'" class="auth-mode-switch grid grid-cols-2 rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/70">
            <button
              type="button"
              class="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
              :class="authMode === 'login'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
              @click="switchAuthMode('login')"
            >
              登录
            </button>
            <button
              type="button"
              class="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
              :class="authMode === 'register'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
              @click="switchAuthMode('register')"
            >
              注册
            </button>
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
    icon: 'habit',
    title: '习惯追踪',
    description: '把打卡、连续天数和阶段变化整理成一套清晰可见的日常反馈。'
  },
  {
    index: '02',
    icon: 'learning',
    title: '微学习内容',
    description: '用轻量课程和学习记录承接每天的输入，降低开始学习的门槛。'
  },
  {
    index: '03',
    icon: 'focus',
    title: '计划与专注',
    description: '把计划编辑、番茄专注和复盘沉淀到同一个工作流里。'
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
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.18)),
    linear-gradient(180deg, #f7f7f8 0%, #d4d4d8 100%);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.58);
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
  max-width: 1600px;
  min-height: calc(100vh - 5rem);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1fr) minmax(460px, 1fr);
  column-gap: clamp(2.25rem, 4vw, 4.5rem);
}

.auth-intro {
  min-height: calc(100vh - 5rem);
  justify-content: center;
  align-items: center;
  padding: 4.85rem clamp(3rem, 6.5vw, 6rem);
}

.auth-intro-content {
  width: min(100%, 34rem);
  margin: 0 auto;
}

.auth-brand-header {
  display: flex;
  align-items: center;
  gap: 1.35rem;
  margin-bottom: 2.7rem;
}

.auth-brand-header h1,
.auth-form-shell h2,
.auth-feature-card h2 {
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", serif;
  font-weight: 600;
}

.auth-brand-header h1 {
  font-size: 2.85rem !important;
  line-height: 0.96;
  letter-spacing: -0.055em !important;
}

.auth-brand-header p:first-of-type {
  font-size: 0.93rem !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-brand-header p:last-of-type {
  max-width: 20rem;
  font-size: 0.95rem !important;
  line-height: 1.9;
  color: rgba(63, 63, 70, 0.84);
}

.dark .auth-brand-header p:last-of-type {
  color: rgba(228, 228, 231, 0.76);
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
  gap: 1.05rem;
}

.auth-feature-card {
  display: grid;
  grid-template-columns: 3.55rem minmax(0, 1fr);
  align-items: center;
  gap: 1.05rem;
  min-height: 8.1rem;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 1.85rem;
  background: rgba(255, 255, 255, 0.56);
  padding: 1.45rem 1.5rem;
  box-shadow:
    0 20px 36px rgba(24, 24, 27, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
}

.dark .auth-feature-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(18, 18, 20, 0.76);
  box-shadow:
    0 22px 40px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
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

.auth-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: linear-gradient(180deg, #171717 0%, #09090b 100%);
  color: white;
  box-shadow:
    0 12px 24px rgba(24, 24, 27, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.dark .auth-feature-icon {
  background: linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%);
  color: rgb(9 9 11);
}

.auth-entry {
  min-height: calc(100vh - 5rem);
  align-items: center;
  padding-block: 4.25rem;
  padding-inline: clamp(2rem, 4.75vw, 4.75rem);
}

.auth-form-shell {
  max-width: 31rem;
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

.auth-mode-switch {
  padding: 0.32rem;
  border-color: rgba(24, 24, 27, 0.08) !important;
  border-radius: 999px !important;
  background: rgba(255, 255, 255, 0.54) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 24px rgba(24, 24, 27, 0.045);
}

.auth-mode-switch button {
  min-height: 3rem;
  border-radius: 999px !important;
  font-size: 0.9rem !important;
  letter-spacing: 0.03em;
}

.dark .auth-mode-switch {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(24, 24, 27, 0.62) !important;
}

.auth-login-panel {
  margin-top: 1.95rem !important;
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
</style>
