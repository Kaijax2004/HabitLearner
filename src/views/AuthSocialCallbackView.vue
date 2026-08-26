<template>
  <div class="social-callback-page">
    <div class="social-callback-card">
      <Logo size="xl" class="social-callback-logo" />
      <p class="social-callback-kicker">快捷登录</p>
      <h1>{{ title }}</h1>
      <p class="social-callback-description">{{ description }}</p>

      <form v-if="needsProfileCompletion" class="social-complete-form" @submit.prevent="submitProfile">
        <label class="social-field">
          <span>用户名</span>
          <input v-model="form.username" maxlength="20" autocomplete="username" placeholder="手动设置 6-20 位字母或数字" @blur="checkUsernameAvailability" />
          <small :class="{ 'is-ok': usernameAvailable, 'is-error': usernameAvailable === false }">
            {{ usernameHint }}
          </small>
        </label>

        <label class="social-field">
          <span>昵称</span>
          <input v-model="form.nickname" maxlength="120" autocomplete="nickname" placeholder="可与他人重复" />
        </label>

        <label class="social-field">
          <span>邮箱（可选）</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="绑定真实邮箱，留空也可继续" />
        </label>

        <label v-if="form.email" class="social-field">
          <span>邮箱验证码</span>
          <div class="social-code-row">
            <input v-model="form.emailVerificationCode" maxlength="6" inputmode="numeric" placeholder="请输入 6 位验证码" />
            <button type="button" :disabled="isSendingEmailCode || emailCodeCountdown > 0" @click="sendEmailCode">
              {{ isSendingEmailCode ? '发送中' : emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : '发送' }}
            </button>
          </div>
        </label>

        <p v-else class="social-note">你可以暂不绑定邮箱，后续在“我的 / 账户安全”中绑定。</p>

        <TermsConsent v-model:accepted="form.acceptedPrivacyPolicy" />

        <button type="submit" class="social-callback-button" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '完成资料' }}
        </button>
      </form>

      <button v-else-if="hasError" type="button" class="social-callback-button" @click="goAuth">
        返回登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import TermsConsent from '@/components/TermsConsent.vue'
import { useAuthStore } from '@/stores/auth'
import * as authAPI from '@/api/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const hasError = ref(false)
const isSubmitting = ref(false)
const isSendingEmailCode = ref(false)
const needsProfileCompletion = ref(false)
const profileSnapshot = ref(null)
const message = ref('正在确认第三方身份，请稍候。')
const redirectTarget = ref('/dashboard')
const usernameAvailable = ref(null)
const usernameHint = ref('用户名一旦确定将不可修改。')
const emailCodeCountdown = ref(0)
let emailCodeTimer = null

const form = ref({
  username: '',
  nickname: '',
  email: '',
  emailVerificationCode: '',
  acceptedPrivacyPolicy: false
})

const title = computed(() => {
  if (hasError.value) return '快捷登录未完成'
  if (needsProfileCompletion.value) return '补全你的资料'
  return '正在进入习知'
})

const description = computed(() => message.value)

const readHashParams = () => new URLSearchParams(window.location.hash.replace(/^#/, ''))

const goAuth = () => {
  router.replace('/auth')
}

const applyProfileSnapshot = (snapshot) => {
  profileSnapshot.value = snapshot
  if (!snapshot) return

  form.value.nickname = snapshot.nickname || form.value.nickname || ''
  form.value.email = snapshot.emailBound ? snapshot.email || form.value.email || '' : ''
}

const submitProfile = async () => {
  if (form.value.email.trim() && form.value.emailVerificationCode.trim().length !== 6) {
    message.value = '绑定邮箱需要先填写 6 位验证码；也可以清空邮箱后暂不绑定。'
    return
  }

  isSubmitting.value = true
  try {
    const result = await authStore.updateSocialProfile({
      username: form.value.username.trim(),
      nickname: form.value.nickname.trim(),
      email: form.value.email.trim(),
      emailVerificationCode: form.value.emailVerificationCode.trim(),
      acceptedPrivacyPolicy: form.value.acceptedPrivacyPolicy
    })

    if (!result.success) {
      hasError.value = true
      message.value = result.error || '资料完善失败，请稍后再试。'
      return
    }

    await router.replace(redirectTarget.value)
  } finally {
    isSubmitting.value = false
  }
}

const checkUsernameAvailability = async () => {
  const username = form.value.username.trim()
  usernameAvailable.value = null
  if (!username) {
    usernameHint.value = '请输入你的唯一用户名。'
    return
  }
  if (!/^[a-zA-Z0-9]{6,20}$/.test(username)) {
    usernameAvailable.value = false
    usernameHint.value = '用户名必须为 6-20 位字母或数字。'
    return
  }
  const response = await authAPI.checkUsername(username)
  usernameAvailable.value = Boolean(response?.success && response.data?.available)
  usernameHint.value = usernameAvailable.value ? '这个用户名可以使用。' : (response?.error || response?.message || '该用户名已被使用。')
}

const startEmailCountdown = () => {
  emailCodeCountdown.value = 60
  if (emailCodeTimer) window.clearInterval(emailCodeTimer)
  emailCodeTimer = window.setInterval(() => {
    emailCodeCountdown.value -= 1
    if (emailCodeCountdown.value <= 0) {
      window.clearInterval(emailCodeTimer)
      emailCodeTimer = null
      emailCodeCountdown.value = 0
    }
  }, 1000)
}

const sendEmailCode = async () => {
  if (!form.value.email.trim()) return
  isSendingEmailCode.value = true
  try {
    const response = await authAPI.sendEmailBindCode(form.value.email.trim())
    if (!response.success) {
      throw new Error(response.error || response.message || '验证码发送失败')
    }
    startEmailCountdown()
    message.value = '邮箱验证码已发送，请检查收件箱。'
  } catch (error) {
    message.value = error.message || '验证码发送失败'
  } finally {
    isSendingEmailCode.value = false
  }
}

onMounted(async () => {
  const params = readHashParams()
  const error = params.get('error')
  const token = params.get('token')
  const redirect = params.get('redirect') || '/dashboard'
  const complete = params.get('complete')
  const profile = params.get('profile')
  const action = params.get('action')
  const actionMessage = params.get('message')

  redirectTarget.value = route.query.redirect || redirect

  if (error) {
    hasError.value = true
    message.value = error
    return
  }

  if (token) {
    const result = await authStore.acceptSocialToken(token)
    if (!result.success) {
      hasError.value = true
      message.value = result.error || '快捷登录失败，请重新尝试。'
      return
    }
  } else if (!authStore.isAuthenticated) {
    hasError.value = true
    message.value = '快捷登录凭证为空，请重新尝试。'
    return
  }

  if (action === 'unlink' || action === 'delete') {
    message.value = actionMessage || '操作已完成。'
    await router.replace(redirectTarget.value)
    return
  }

  if (profile) {
    try {
      applyProfileSnapshot(JSON.parse(profile))
    } catch (_error) {
      applyProfileSnapshot(null)
    }
  }

  if (complete === '0' || !authStore.user?.profileComplete) {
    needsProfileCompletion.value = true
    message.value = '请完善用户名、昵称并同意隐私政策后继续。'
    applyProfileSnapshot(authStore.user)
    return
  }

  await router.replace(redirectTarget.value)
})

onBeforeUnmount(() => {
  if (emailCodeTimer) {
    window.clearInterval(emailCodeTimer)
  }
})
</script>

<style scoped>
.social-callback-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(circle at 30% 15%, rgba(216, 197, 161, 0.22), transparent 32%),
    linear-gradient(135deg, #f7f2ea, #fbf8f3);
}

.social-callback-card {
  width: min(100%, 28rem);
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.72);
  padding: 2.25rem;
  text-align: center;
  box-shadow: 0 28px 60px rgba(24, 24, 27, 0.08);
  backdrop-filter: blur(22px);
}

.social-callback-logo {
  margin: 0 auto 1rem;
}

.social-callback-kicker {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(82, 82, 91, 0.72);
}

h1 {
  margin: 0.75rem 0 0;
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.social-callback-description {
  margin-top: 0.9rem;
  color: rgba(63, 63, 70, 0.78);
}

.social-complete-form {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.25rem;
  text-align: left;
}

.social-field {
  display: grid;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: rgba(63, 63, 70, 0.82);
}

.social-field input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(24, 24, 27, 0.12);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
}

.social-field small {
  color: rgba(82, 82, 91, 0.72);
  font-size: 0.78rem;
}

.social-field small.is-ok {
  color: #047857;
}

.social-field small.is-error {
  color: #dc2626;
}

.social-code-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.social-code-row button {
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 1rem;
  background: #18181b;
  color: #fff;
  padding: 0 1rem;
  font-weight: 700;
}

.social-code-row button:disabled {
  opacity: 0.55;
}

.social-note {
  margin: -0.2rem 0 0;
  font-size: 0.82rem;
  color: rgba(82, 82, 91, 0.74);
}

.social-callback-button {
  margin-top: 1rem;
  border: 0;
  border-radius: 999px;
  background: #18181b;
  color: #fff;
  padding: 0.82rem 1.3rem;
  font-weight: 700;
}

.social-callback-button:disabled {
  opacity: 0.6;
}
</style>
