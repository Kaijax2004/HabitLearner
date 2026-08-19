<template>
  <div class="social-callback-page">
    <div class="social-callback-card">
      <Logo size="xl" class="social-callback-logo" />
      <p class="social-callback-kicker">快捷登录</p>
      <h1>{{ statusTitle }}</h1>
      <p>{{ statusText }}</p>
      <button v-if="hasError" type="button" class="social-callback-button" @click="goAuth">
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
const message = ref('正在确认第三方身份，请稍候。')

const statusTitle = computed(() => (hasError.value ? '快捷登录未完成' : '正在进入习知'))
const statusText = computed(() => message.value)

const readHashParams = () => new URLSearchParams(window.location.hash.replace(/^#/, ''))

const goAuth = () => {
  router.replace('/auth')
}

onMounted(async () => {
  const params = readHashParams()
  const error = params.get('error')
  const token = params.get('token')
  const redirect = params.get('redirect') || '/dashboard'

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

  router.replace(route.query.redirect || redirect)
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

p {
  margin-top: 0.9rem;
  color: rgba(63, 63, 70, 0.78);
}

.social-callback-button {
  margin-top: 1.4rem;
  border: 0;
  border-radius: 999px;
  background: #18181b;
  color: #fff;
  padding: 0.82rem 1.3rem;
  font-weight: 700;
}
</style>

