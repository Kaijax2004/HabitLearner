<template>
  <div class="relative min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]">
        <div class="grid-pattern h-full w-full" />
      </div>
      <div class="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-black/5 blur-3xl dark:bg-white/6" />
      <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-zinc-300/20 blur-3xl dark:bg-white/5" />
    </div>

    <nav class="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-black/80">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <Logo size="default" class="custom-logo-navbar-fill" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight">习知</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">HabitLearner</p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-2xl border border-zinc-200 bg-white/90 p-2.5 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/90 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          @click="themeStore.toggleTheme()"
        >
          <svg v-if="themeStore.isDarkMode" class="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m8-8h1M3 12h1m12.364 6.364.707.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.001 9.001 0 0012 21a9.001 9.001 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </nav>

    <main class="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-10 pt-28 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
      <section class="hidden flex-1 lg:block">
        <div class="max-w-xl">
          <div class="mb-10 flex items-center gap-4">
            <div class="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950">
              <Logo size="4xl" class="custom-logo-desktop" />
            </div>
            <div>
              <h2 class="text-4xl font-semibold tracking-tight">习知</h2>
              <p class="mt-2 text-base text-zinc-500 dark:text-zinc-400">HabitLearner</p>
              <p class="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-300">知易行难，习以为常。</p>
            </div>
          </div>

          <div class="grid gap-4">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="rounded-[28px] border border-zinc-200/80 bg-white/88 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.05)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/72"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="feature.icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 20V10m5 10V4m5 16v-7" />
                    <path v-else-if="feature.icon === 'spark'" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">{{ feature.title }}</h3>
                  <p class="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="flex w-full justify-center lg:w-[28rem] xl:w-[31rem]">
        <div class="w-full rounded-[32px] border border-zinc-200/80 bg-white/92 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/78 sm:p-7">
          <div class="mb-6 lg:hidden">
            <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-zinc-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950">
              <Logo size="3xl" class="custom-logo-mobile" />
            </div>
            <div class="text-center">
              <h2 class="text-2xl font-semibold tracking-tight">习知</h2>
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">知易行难，习以为常。</p>
            </div>
          </div>

          <div class="rounded-[24px] bg-zinc-100/80 p-1 dark:bg-zinc-900/80">
            <div class="grid grid-cols-2 gap-1">
              <button
                type="button"
                class="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                :class="authMode === 'login'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
                @click="switchAuthMode('login')"
              >
                登录
              </button>
              <button
                type="button"
                class="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                :class="authMode === 'register'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
                @click="switchAuthMode('register')"
              >
                注册
              </button>
            </div>
          </div>

          <div v-if="authMode === 'login'" class="mt-6">
            <div class="rounded-[24px] border border-zinc-200/70 bg-zinc-50/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  class="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                  :class="loginMethod === 'password'
                    ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
                  @click="loginMethod = 'password'"
                >
                  密码登录
                </button>
                <button
                  type="button"
                  class="rounded-[18px] px-4 py-3 text-sm font-medium transition"
                  :class="loginMethod === 'code'
                    ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'"
                  @click="loginMethod = 'code'"
                >
                  验证码登录
                </button>
              </div>
            </div>

            <form v-if="loginMethod === 'password'" class="mt-6 space-y-5" @submit.prevent="handlePasswordLogin">
              <div>
                <label class="mb-2 block text-sm font-semibold">邮箱地址</label>
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
                  <label class="block text-sm font-semibold">密码</label>
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
                    class="auth-input pr-12"
                    placeholder="请输入密码"
                  >
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                    :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    <svg v-if="showLoginPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.584 10.587A2 2 0 0013.413 13.4M9.88 5.09A9.77 9.77 0 0112 4.8c4.48 0 8.27 2.94 9.54 7a9.84 9.84 0 01-4.24 5.22M6.23 6.23A9.82 9.82 0 002.46 11.8c1.27 4.06 5.06 7 9.54 7 1.66 0 3.23-.4 4.61-1.1" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading">
                <span v-if="authStore.isLoading">登录中...</span>
                <span v-else>登录</span>
              </button>
            </form>

            <form v-else class="mt-6 space-y-5" @submit.prevent="handleCodeLogin">
              <div>
                <label class="mb-2 block text-sm font-semibold">已注册邮箱</label>
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
                  <label class="block text-sm font-semibold">邮箱验证码</label>
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

              <div class="rounded-[20px] border border-zinc-200/70 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/65 dark:text-zinc-300">
                验证码登录仅支持已注册邮箱。收不到邮件时可检查垃圾箱，或稍后再次发送。
              </div>

              <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading">
                <span v-if="authStore.isLoading">登录中...</span>
                <span v-else>验证码登录</span>
              </button>
            </form>
          </div>

          <form v-else-if="authMode === 'register'" class="mt-6 space-y-5" @submit.prevent="handleRegister">
            <div>
              <label class="mb-2 block text-sm font-semibold">用户名</label>
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
              <label class="mb-2 block text-sm font-semibold">邮箱地址</label>
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
                <label class="block text-sm font-semibold">邮箱验证码</label>
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
              <label class="mb-2 block text-sm font-semibold">密码</label>
              <div class="relative">
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="auth-input pr-12"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': registerForm.password && !isRegisterPasswordValid }"
                  placeholder="至少 6 位密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  :aria-label="showRegisterPassword ? '隐藏密码' : '显示密码'"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  <svg v-if="showRegisterPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.584 10.587A2 2 0 0013.413 13.4M9.88 5.09A9.77 9.77 0 0112 4.8c4.48 0 8.27 2.94 9.54 7a9.84 9.84 0 01-4.24 5.22M6.23 6.23A9.82 9.82 0 002.46 11.8c1.27 4.06 5.06 7 9.54 7 1.66 0 3.23-.4 4.61-1.1" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="registerForm.password && !isRegisterPasswordValid" class="mt-2 text-sm text-red-500">密码至少需要 6 位。</p>
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold">确认密码</label>
              <div class="relative">
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showRegisterConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  class="auth-input pr-12"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': registerForm.confirmPassword && !isRegisterPasswordMatch }"
                  placeholder="请再次输入密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  :aria-label="showRegisterConfirmPassword ? '隐藏密码' : '显示密码'"
                  @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                >
                  <svg v-if="showRegisterConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.584 10.587A2 2 0 0013.413 13.4M9.88 5.09A9.77 9.77 0 0112 4.8c4.48 0 8.27 2.94 9.54 7a9.84 9.84 0 01-4.24 5.22M6.23 6.23A9.82 9.82 0 002.46 11.8c1.27 4.06 5.06 7 9.54 7 1.66 0 3.23-.4 4.61-1.1" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="registerForm.confirmPassword && !isRegisterPasswordMatch" class="mt-2 text-sm text-red-500">两次输入的密码不一致。</p>
            </div>

            <label class="flex items-start gap-3 rounded-[20px] border border-zinc-200/70 bg-zinc-50/75 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
              <input
                v-model="registerForm.agreeTerms"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 rounded border-zinc-300 text-black focus:ring-black dark:border-zinc-600 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
              >
              <span>我已阅读并同意用户协议与隐私政策。</span>
            </label>

            <button type="submit" class="primary-button w-full" :disabled="authStore.isLoading || !canSubmitRegister">
              <span v-if="authStore.isLoading">注册中...</span>
              <span v-else>注册并进入</span>
            </button>
          </form>

          <form v-else class="mt-6 space-y-5" @submit.prevent="handleResetPassword">
            <div>
              <label class="mb-2 block text-sm font-semibold">注册邮箱</label>
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
                <label class="block text-sm font-semibold">邮箱验证码</label>
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
              <label class="mb-2 block text-sm font-semibold">新密码</label>
              <div class="relative">
                <input
                  v-model="resetForm.newPassword"
                  :type="showResetPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="auth-input pr-12"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': resetForm.newPassword && !isResetPasswordValid }"
                  placeholder="至少 6 位密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  :aria-label="showResetPassword ? '隐藏密码' : '显示密码'"
                  @click="showResetPassword = !showResetPassword"
                >
                  <svg v-if="showResetPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.584 10.587A2 2 0 0013.413 13.4M9.88 5.09A9.77 9.77 0 0112 4.8c4.48 0 8.27 2.94 9.54 7a9.84 9.84 0 01-4.24 5.22M6.23 6.23A9.82 9.82 0 002.46 11.8c1.27 4.06 5.06 7 9.54 7 1.66 0 3.23-.4 4.61-1.1" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold">确认新密码</label>
              <div class="relative">
                <input
                  v-model="resetForm.confirmPassword"
                  :type="showResetConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  class="auth-input pr-12"
                  :class="{ 'border-red-400 focus:ring-red-400 dark:border-red-500': resetForm.confirmPassword && !isResetPasswordMatch }"
                  placeholder="请再次输入新密码"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  :aria-label="showResetConfirmPassword ? '隐藏密码' : '显示密码'"
                  @click="showResetConfirmPassword = !showResetConfirmPassword"
                >
                  <svg v-if="showResetConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.584 10.587A2 2 0 0013.413 13.4M9.88 5.09A9.77 9.77 0 0112 4.8c4.48 0 8.27 2.94 9.54 7a9.84 9.84 0 01-4.24 5.22M6.23 6.23A9.82 9.82 0 002.46 11.8c1.27 4.06 5.06 7 9.54 7 1.66 0 3.23-.4 4.61-1.1" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="resetForm.confirmPassword && !isResetPasswordMatch" class="mt-2 text-sm text-red-500">两次输入的新密码不一致。</p>
            </div>

            <button type="submit" class="primary-button w-full" :disabled="isResettingPassword || !canSubmitReset">
              <span v-if="isResettingPassword">重置中...</span>
              <span v-else>设置新密码</span>
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              @click="switchAuthMode('login')"
            >
              返回登录
            </button>
          </form>

          <div v-if="authMode !== 'reset'" class="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span v-if="authMode === 'login'">还没有账户？</span>
            <span v-else>已有账户？</span>
            <button
              type="button"
              class="ml-1 font-medium text-zinc-950 transition hover:opacity-70 dark:text-white"
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
  { icon: 'chart', title: '习惯追踪', description: '把打卡、连续天数和阶段变化整理成一套清晰可见的日常反馈。' },
  { icon: 'book', title: '微学习内容', description: '用轻量课程和学习记录承接每天的输入，降低开始学习的门槛。' },
  { icon: 'spark', title: '计划与专注', description: '把计划编辑、番茄专注和复盘沉淀到同一个工作流里。' }
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

const resetLoginForm = () => {
  loginForm.value = { email: '', password: '' }
  codeLoginForm.value = { email: '', code: '' }
  showLoginPassword.value = false
}

const resetRegisterForm = () => {
  registerForm.value = {
    name: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  }
  showRegisterPassword.value = false
  showRegisterConfirmPassword.value = false
}

const resetResetForm = () => {
  resetForm.value = {
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  }
  showResetPassword.value = false
  showResetConfirmPassword.value = false
}

const switchAuthMode = (mode) => {
  authMode.value = mode
  if (mode === 'login') {
    loginMethod.value = 'password'
  }
}

const getErrorMessage = (message = '', code) => {
  const text = String(message || '')

  if (code === 404 || text.includes('未启动') || text.includes('服务暂时不可用')) {
    return '后端服务暂时不可用，请稍后重试。'
  }

  if (code === 409 || text.includes('已注册') || text.includes('已被使用')) {
    return text || '该邮箱已注册，请直接登录。'
  }

  if (code === 429 || text.includes('频繁')) {
    return text || '操作过于频繁，请稍后再试。'
  }

  if (code === 400 && (text.includes('验证码') || text.includes('验证'))) {
    return text || '验证码无效或已过期，请重新发送。'
  }

  if (code === 401 || text.includes('密码错误') || text.includes('登录')) {
    return text || '邮箱或密码错误。'
  }

  if (code === 422 || text.includes('格式') || text.includes('参数校验')) {
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
    username: registerForm.value.name,
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
    error('重置失败', { description: '请完整填写邮箱、验证码和新密码。' })
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
    switchAuthMode('login')
    resetResetForm()
    success('密码已重置', {
      description: '你现在可以使用新密码登录。'
    })
  } catch (err) {
    error('重置失败', {
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
.grid-pattern {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dark .grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
}

.auth-input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgb(228 228 231 / 0.9);
  background: rgba(255, 255, 255, 0.95);
  padding: 0.95rem 1rem;
  font-size: 0.95rem;
  color: rgb(9 9 11);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.auth-input:focus {
  border-color: rgb(24 24 27);
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
}

.dark .auth-input {
  border-color: rgb(63 63 70 / 0.95);
  background: rgba(24, 24, 27, 0.94);
  color: white;
}

.dark .auth-input:focus {
  border-color: rgb(255 255 255 / 0.95);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}

.primary-button {
  border-radius: 1rem;
  background: rgb(9 9 11);
  padding: 0.95rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgb(24 24 27);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .primary-button {
  background: white;
  color: black;
}

.dark .primary-button:hover:not(:disabled) {
  background: rgb(228 228 231);
}

.custom-logo-desktop :deep(img),
.custom-logo-desktop :deep(svg) {
  width: 78px !important;
  height: 78px !important;
  max-width: 78px !important;
  max-height: 78px !important;
}

.custom-logo-mobile :deep(img),
.custom-logo-mobile :deep(svg) {
  width: 66px !important;
  height: 66px !important;
  max-width: 66px !important;
  max-height: 66px !important;
}

.custom-logo-navbar-fill :deep(img),
.custom-logo-navbar-fill :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
}
</style>
