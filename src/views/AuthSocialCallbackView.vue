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
          <input v-model="form.username" maxlength="20" autocomplete="username" placeholder="6-20 位字母或数字" />
        </label>

        <label class="social-field">
          <span>昵称</span>
          <input v-model="form.nickname" maxlength="120" autocomplete="nickname" placeholder="可与他人重复" />
        </label>

        <label class="social-field">
          <span>邮箱（可选）</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="绑定真实邮箱，留空也可继续" />
        </label>

        <label class="social-agree">
          <input v-model="form.acceptedPrivacyPolicy" type="checkbox" />
          <span>我已阅读并同意用户协议与隐私政策</span>
        </label>

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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const hasError = ref(false)
const isSubmitting = ref(false)
const needsProfileCompletion = ref(false)
const profileSnapshot = ref(null)
const message = ref('正在确认第三方身份，请稍候。')
const redirectTarget = ref('/dashboard')

const form = ref({
  username: '',
  nickname: '',
  email: '',
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

  const fallbackName = snapshot.nickname || ''
  form.value.nickname = snapshot.nickname || form.value.nickname || ''
  form.value.email = snapshot.email || form.value.email || ''
  form.value.username = snapshot.username || ''
  if (!form.value.username) {
    const base = (fallbackName || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    form.value.username = (base.length >= 6 ? base : `user${Date.now().toString().slice(-6)}`).slice(0, 20)
  }
}

const submitProfile = async () => {
  isSubmitting.value = true
  try {
    const result = await authStore.updateSocialProfile({
      username: form.value.username.trim(),
      nickname: form.value.nickname.trim(),
      email: form.value.email.trim(),
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

onMounted(async () => {
  const params = readHashParams()
  const error = params.get('error')
  const token = params.get('token')
  const redirect = params.get('redirect') || '/dashboard'
  const complete = params.get('complete')
  const profile = params.get('profile')

  redirectTarget.value = route.query.redirect || redirect

  if (error) {
    hasError.value = true
    message.value = error
    return
  }

  const result = await authStore.acceptSocialToken(token)
  if (!result.success) {
    hasError.value = true
    message.value = result.error || '快捷登录失败，请重新尝试。'
    return
  }

  if (profile) {
    try {
      applyProfileSnapshot(JSON.parse(profile))
    } catch (_error) {
      applyProfileSnapshot(null)
    }
  }

  if (complete === '0' || !authStore.user?.profileCompletedAt || !authStore.user?.privacyPolicyAcceptedAt) {
    needsProfileCompletion.value = true
    message.value = '请完善用户名、昵称并同意隐私政策后继续。'
    applyProfileSnapshot(authStore.user)
    return
  }

  await router.replace(redirectTarget.value)
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

.social-agree {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.88rem;
  color: rgba(63, 63, 70, 0.8);
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
