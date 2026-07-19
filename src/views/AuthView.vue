<template>
  <div class="min-h-screen bg-white dark:bg-black flex flex-col lg:flex-row relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div class="grid-pattern"></div>
      </div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-gray-200/20 to-transparent dark:from-white/10 dark:to-transparent blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-gray-300/10 to-transparent dark:from-white/5 dark:to-transparent blur-2xl"></div>
    </div>

    <nav class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <Logo size="default" class="custom-logo-navbar-fill" />
            </div>
            <div>
              <h1 class="title-primary text-black dark:text-white">习知</h1>
              <p class="text-body-small">HabitLearner</p>
            </div>
          </div>

          <button
            @click="themeStore.toggleTheme()"
            class="p-2 rounded-xl btn-enhanced"
            :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          >
            <svg v-if="themeStore.isDarkMode" class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <section class="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:relative">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black"></div>
      <div class="absolute top-20 left-20 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-2xl"></div>
      <div class="absolute bottom-20 right-20 w-24 h-24 bg-gray-300/20 dark:bg-white/10 rounded-full blur-xl"></div>

      <div class="text-center max-w-lg relative z-10">
        <div class="relative mb-12">
          <div class="w-40 h-40 mx-auto relative">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl blur-sm"></div>
            <div class="relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
              <Logo size="5xl" class="custom-logo-desktop" />
            </div>
            <div class="absolute inset-3 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl"></div>
          </div>
        </div>

        <div class="mb-12">
          <h1 class="text-4xl font-bold text-black dark:text-white mb-3 tracking-tight">习知</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 font-medium mb-2">HabitLearner</p>
          <p class="text-xl text-gray-500 dark:text-gray-500 font-light">知易行难，习以为常</p>
        </div>

        <div class="space-y-6 text-left">
          <div v-for="feature in features" :key="feature.title" class="flex items-center space-x-4 group">
            <div class="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <svg class="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="feature.icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-black dark:text-white">{{ feature.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flex-1 flex flex-col justify-center px-6 lg:px-16 pt-20 lg:pt-0 relative">
      <div class="lg:hidden text-center mb-16">
        <div class="relative mb-8">
          <div class="w-32 h-32 mx-auto relative">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl blur-sm"></div>
            <div class="relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
              <Logo size="4xl" class="custom-logo-mobile" />
            </div>
            <div class="absolute inset-3 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl"></div>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">习知</h1>
        <p class="text-base text-gray-600 dark:text-gray-400 font-medium mb-1">HabitLearner</p>
        <p class="text-lg text-gray-500 dark:text-gray-500 font-light">知易行难，习以为常</p>
      </div>

      <div class="max-w-sm mx-auto lg:max-w-md w-full">
        <form v-if="!isRegisterMode" @submit.prevent="handleLogin" class="space-y-8">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">邮箱地址</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  v-model.trim="loginForm.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent input-enhanced"
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  class="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                >
                  <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-lg btn-enhanced disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>

          <div class="text-center">
            <button type="button" @click="toggleMode" class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-black dark:hover:text-white transition-colors duration-200">
              还没有账号？立即注册
            </button>
          </div>
        </form>

        <form v-else @submit.prevent="handleRegister" class="space-y-8">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">用户名</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  v-model.trim="registerForm.name"
                  type="text"
                  required
                  minlength="2"
                  autocomplete="username"
                  class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">邮箱地址</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  v-model.trim="registerForm.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            <div>
              <div class="mb-3 flex items-center justify-between gap-3">
                <label class="block text-sm font-semibold text-black dark:text-white">邮箱验证码</label>
                <button
                  type="button"
                  @click="sendRegisterCode"
                  :disabled="isSendingRegisterCode || registerCodeCountdown > 0 || !registerForm.email"
                  class="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  {{ isSendingRegisterCode ? '发送中...' : registerCodeCountdown > 0 ? `${registerCodeCountdown}s 后重发` : '发送验证码' }}
                </button>
              </div>
              <input
                v-model.trim="registerForm.verificationCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                class="w-full px-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                placeholder="请输入邮箱验证码"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  v-model="registerForm.password"
                  type="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  :class="{ 'border-red-500 dark:border-red-500': registerForm.password && !isPasswordValid }"
                  placeholder="至少 6 位密码"
                />
              </div>
              <p v-if="registerForm.password && !isPasswordValid" class="text-red-500 text-sm mt-2">密码至少需要 6 位</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-black dark:text-white mb-3">确认密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  required
                  autocomplete="new-password"
                  class="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  :class="{ 'border-red-500 dark:border-red-500': registerForm.password && registerForm.confirmPassword && !isPasswordMatch }"
                  placeholder="请再次输入密码"
                />
              </div>
              <p v-if="registerForm.password && registerForm.confirmPassword && !isPasswordMatch" class="text-red-500 text-sm mt-2">两次输入的密码不一致</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <input
              v-model="registerForm.agreeTerms"
              type="checkbox"
              required
              class="mt-1 w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-black dark:focus:ring-white focus:ring-offset-0"
            />
            <label class="text-sm text-gray-600 dark:text-gray-300">
              我已阅读并同意
              <a href="#" class="text-black dark:text-white hover:underline font-medium">用户协议</a>
              和
              <a href="#" class="text-black dark:text-white hover:underline font-medium">隐私政策</a>
            </label>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading || !canSubmitRegister"
            class="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
            <span v-else>注册</span>
          </button>

          <div class="text-center">
            <button type="button" @click="toggleMode" class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-black dark:hover:text-white transition-colors duration-200">
              已有账号？立即登录
            </button>
          </div>
        </form>
      </div>
    </section>

    <div class="px-6 pb-8">
      <div class="text-center text-sm text-gray-500 dark:text-gray-500">
        <p class="font-light">内在秩序的无声革命</p>
      </div>
    </div>
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
  { icon: 'chart', title: '智能习惯追踪', description: '用数据看见进步，让坚持变得更清晰' },
  { icon: 'book', title: '微学习内容', description: '把碎片时间变成稳定成长的入口' },
  { icon: 'chart', title: '可视化分析', description: '用图表复盘节奏，及时调整计划' }
]

const isRegisterMode = ref(false)
const showPassword = ref(false)
const isSendingRegisterCode = ref(false)
const registerCodeCountdown = ref(0)
let registerCodeTimer = null

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const isPasswordValid = computed(() => registerForm.value.password.length >= 6)

const isPasswordMatch = computed(() => {
  return registerForm.value.password === registerForm.value.confirmPassword &&
    registerForm.value.password.length > 0
})

const canSubmitRegister = computed(() => {
  return registerForm.value.name.trim() &&
    registerForm.value.email.trim() &&
    registerForm.value.verificationCode.trim().length === 6 &&
    isPasswordValid.value &&
    isPasswordMatch.value &&
    registerForm.value.agreeTerms
})

const clearRegisterCodeTimer = () => {
  if (registerCodeTimer) {
    window.clearInterval(registerCodeTimer)
    registerCodeTimer = null
  }
}

const startRegisterCodeCountdown = () => {
  registerCodeCountdown.value = 60
  clearRegisterCodeTimer()
  registerCodeTimer = window.setInterval(() => {
    registerCodeCountdown.value -= 1
    if (registerCodeCountdown.value <= 0) {
      clearRegisterCodeTimer()
      registerCodeCountdown.value = 0
    }
  }, 1000)
}

const resetForms = () => {
  loginForm.value = { email: '', password: '' }
  registerForm.value = {
    name: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  }
}

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  resetForms()
  registerCodeCountdown.value = 0
  clearRegisterCodeTimer()
}

const sendRegisterCode = async () => {
  if (!registerForm.value.email.trim()) {
    error('发送失败', { description: '请先输入邮箱地址' })
    return
  }

  isSendingRegisterCode.value = true
  try {
    const response = await authAPI.sendVerifyCode(registerForm.value.email.trim(), 'email_verify')
    if (!response.success) {
      throw new Error(response.error || response.message || '发送失败')
    }

    startRegisterCodeCountdown()
    success('验证码已发送', {
      description: response.data?.verification?.message || response.message || '请检查邮箱收件箱'
    })
  } catch (err) {
    error('发送失败', {
      description: getErrorMessage(err.error || err.message, err.code)
    })
  } finally {
    isSendingRegisterCode.value = false
  }
}

const handleLogin = async () => {
  const result = await authStore.login(loginForm.value)

  if (result.success) {
    router.push('/dashboard')
    return
  }

  error('登录失败', {
    description: getErrorMessage(result.error, result.code)
  })
}

const handleRegister = async () => {
  if (!isPasswordValid.value) {
    error('注册失败', { description: '密码至少需要 6 位' })
    return
  }

  if (!isPasswordMatch.value) {
    error('注册失败', { description: '两次输入的密码不一致' })
    return
  }

  if (!registerForm.value.agreeTerms) {
    error('注册失败', { description: '请先同意用户协议和隐私政策' })
    return
  }

  const result = await authStore.register({
    username: registerForm.value.name,
    name: registerForm.value.name,
    email: registerForm.value.email,
    verificationCode: registerForm.value.verificationCode,
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

const getErrorMessage = (message = '', code) => {
  const text = String(message || '')

  if (code === 404 || text.includes('服务暂时不可用')) {
    return '后端服务未启动，请先启动服务后重试'
  }

  if (code === 503 || text.includes('网络连接失败')) {
    return '网络连接失败，请检查网络或后端服务'
  }

  if (code === 409 || text.includes('已存在') || text.includes('already exists')) {
    return '该邮箱已被注册，请使用其他邮箱或直接登录'
  }

  if (code === 400 && (text.includes('验证码') || text.includes('验证'))) {
    return text || '邮箱验证码无效或已过期，请重新发送'
  }

  if (code === 422 || text.includes('验证失败') || text.includes('格式')) {
    return '输入信息格式不正确，请检查用户名、邮箱和密码'
  }

  return text || '未知错误，请稍后重试'
}

onBeforeUnmount(() => {
  clearRegisterCodeTimer()
})
</script>

<style scoped>
.grid-pattern {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dark .grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

.custom-logo-desktop :deep(img),
.custom-logo-desktop :deep(svg) {
  width: 140px !important;
  height: 140px !important;
  max-width: 140px !important;
  max-height: 140px !important;
}

.custom-logo-mobile :deep(img),
.custom-logo-mobile :deep(svg) {
  width: 100px !important;
  height: 100px !important;
  max-width: 100px !important;
  max-height: 100px !important;
}

.custom-logo-desktop :deep(img),
.custom-logo-mobile :deep(img) {
  object-fit: contain !important;
  object-position: center !important;
  border-radius: 16px !important;
}

.custom-logo-navbar-fill :deep(img),
.custom-logo-navbar-fill :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border-radius: 8px !important;
  object-fit: cover !important;
  object-position: center !important;
}
</style>
