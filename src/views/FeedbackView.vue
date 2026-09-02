<template>
  <AppLayout title="反馈共创" :showBackButton="true" :onBack="goBack">
    <main class="feedback-page">
      <section class="feedback-hero">
        <div class="feedback-hero-copy">
          <p class="feedback-kicker">Co-build HabitLearner</p>
          <h1>{{ feedbackConfig.hero.title }}</h1>
          <p>{{ feedbackConfig.hero.description }}</p>
          <div class="feedback-actions">
            <a class="workbench-primary" href="#community">查看共创入口</a>
            <router-link class="workbench-secondary" to="/guide">先看使用指南</router-link>
            <router-link v-if="isAdmin" class="workbench-secondary" to="/admin/users">前往用户管理中心</router-link>
          </div>
        </div>
        <div class="feedback-signal-card">
          <span>当前阶段</span>
          <strong>共创内测</strong>
          <p>优先收集登录、加载速度、热点雷达、内容创作、Mentor-X 使用体验相关问题。</p>
        </div>
      </section>

      <section class="feedback-grid" id="community">
        <article class="community-card is-group">
          <div>
            <p class="feedback-kicker">微信群</p>
            <h2>{{ feedbackConfig.wechatGroup.title }}</h2>
            <p>{{ feedbackConfig.wechatGroup.description }}</p>
          </div>
          <div class="qr-frame">
            <template v-if="wechatGroupImage">
              <img :src="wechatGroupImage" alt="习知共创用户群二维码" />
            </template>
            <span v-else>请管理员在用户管理中心上传微信群二维码</span>
          </div>
        </article>

        <article class="community-card is-official">
          <div>
            <p class="feedback-kicker">公众号</p>
            <h2>{{ feedbackConfig.officialAccount.title }}</h2>
            <p>{{ feedbackConfig.officialAccount.description }}</p>
            <p v-if="feedbackConfig.officialAccount.url" class="community-link">{{ feedbackConfig.officialAccount.url }}</p>
          </div>
          <div class="qr-frame">
            <template v-if="officialAccountImage">
              <img :src="officialAccountImage" alt="习知公众号二维码" />
            </template>
            <span v-else>请管理员在用户管理中心上传公众号截图</span>
          </div>
        </article>
      </section>

      <section class="feedback-roadmap">
        <div class="feedback-section-head">
          <p class="feedback-kicker">What to report</p>
          <h2>你可以重点反馈这些问题</h2>
        </div>
        <div class="feedback-topic-grid">
          <article v-for="topic in feedbackTopics" :key="topic.title">
            <span>{{ topic.index }}</span>
            <strong>{{ topic.title }}</strong>
            <p>{{ topic.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="isAdmin" id="admin-maintenance" class="admin-maintenance">
        <div class="feedback-section-head">
          <p class="feedback-kicker">Admin</p>
          <h2>管理员快捷维护</h2>
          <p>反馈入口图片和文案都由后端配置驱动，管理员可在用户管理中心直接上传或替换。</p>
        </div>
        <div class="admin-maintenance-grid">
          <article>
            <strong>微信群二维码</strong>
            <code>上传到用户管理中心 / 反馈入口配置</code>
            <small>替换后前端自动生效，无需重新构建。</small>
          </article>
          <article>
            <strong>公众号截图</strong>
            <code>上传到用户管理中心 / 反馈入口配置</code>
            <small>支持更新说明文字和公众号链接。</small>
          </article>
          <article>
            <strong>上线后访问</strong>
            <code>/feedback</code>
            <small>桌面侧栏、移动工作区和我的页面入口都可以指向这里。</small>
          </article>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getFeedbackConfig } from '@/api/feedback'
import { resolveMediaUrl } from '@/utils/media.js'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => Boolean(authStore.user?.isAdmin || authStore.user?.security?.isAdmin))
const isLoading = ref(false)
const feedbackConfig = reactive({
  hero: {
    title: '加入第一批共创用户，把习知打磨成真正好用的个人工作台。',
    description: '习知目前还是个人开发产品，第一阶段最需要真实用户告诉我：哪里卡、哪里有用、哪里还不够刚需。'
  },
  wechatGroup: {
    title: '加入共创用户群',
    description: '适合反馈 Bug、讨论功能优先级、提出真实使用场景。'
  },
  officialAccount: {
    title: '关注产品更新',
    description: '公众号用于发布版本更新、使用教程和重要通知。',
    url: ''
  }
})
const wechatGroupImage = ref('')
const officialAccountImage = ref('')

const feedbackTopics = [
  { index: '01', title: '登录注册是否顺畅', description: '邮箱、用户名、第三方快捷登录、资料完成、退出再登录是否有卡点。' },
  { index: '02', title: '页面加载是否够快', description: '今日页、计划页、热点雷达、内容创作是否有明显等待或白屏。' },
  { index: '03', title: '主线是否容易理解', description: '你是否知道第一步该做什么，是否理解热点到选题再到执行复盘的流转。' },
  { index: '04', title: 'Mentor-X 是否真有用', description: '它给的建议是否能帮你决定下一步，动作卡片是否足够可信。' },
  { index: '05', title: '内容创作闭环缺什么', description: '热点来源、选题判断、草稿协作、发布准备和复盘里哪些最影响你持续使用。' },
  { index: '06', title: '你愿意为什么付费', description: '哪些能力如果稳定做好，会让你认为它值得成为会员功能。' }
]

const hydrateConfig = (payload = {}) => {
  feedbackConfig.hero.title = payload.hero?.title || feedbackConfig.hero.title
  feedbackConfig.hero.description = payload.hero?.description || feedbackConfig.hero.description
  feedbackConfig.wechatGroup.title = payload.wechatGroup?.title || feedbackConfig.wechatGroup.title
  feedbackConfig.wechatGroup.description = payload.wechatGroup?.description || feedbackConfig.wechatGroup.description
  feedbackConfig.officialAccount.title = payload.officialAccount?.title || feedbackConfig.officialAccount.title
  feedbackConfig.officialAccount.description = payload.officialAccount?.description || feedbackConfig.officialAccount.description
  feedbackConfig.officialAccount.url = payload.officialAccount?.url || ''
  wechatGroupImage.value = resolveMediaUrl(payload.wechatGroup?.qr?.publicUrl || payload.wechatGroup?.qr?.absoluteUrl || payload.wechatGroup?.qr?.path || '')
  officialAccountImage.value = resolveMediaUrl(payload.officialAccount?.qr?.publicUrl || payload.officialAccount?.qr?.absoluteUrl || payload.officialAccount?.qr?.path || '')
}

const loadConfig = async () => {
  isLoading.value = true
  try {
    const response = await getFeedbackConfig()
    if (response?.success && response.data) {
      hydrateConfig(response.data)
    }
  } catch (error) {
    console.error('加载反馈配置失败:', error)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/dashboard')
}

onMounted(loadConfig)
</script>

<style scoped>
.feedback-page {
  display: grid;
  gap: 1rem;
  color: var(--workbench-text);
  padding-bottom: 2rem;
}

.feedback-hero,
.feedback-roadmap,
.admin-maintenance {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 1.12);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 52%, transparent), transparent 48%),
    var(--workbench-surface);
  box-shadow:
    inset 0 1px 0 var(--workbench-glass-highlight),
    0 16px 48px var(--workbench-glass-shadow);
  backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(170%);
  -webkit-backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(170%);
}

.feedback-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.32fr); gap: clamp(1rem, 2.4vw, 1.6rem); padding: clamp(1.2rem, 3vw, 2.35rem); }
.feedback-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 8% 10%, rgb(var(--workbench-accent-rgb) / 0.16), transparent 32%),
    radial-gradient(circle at 88% 0%, rgb(255 255 255 / 0.42), transparent 30%);
  pointer-events: none;
}
.feedback-kicker { margin: 0; color: var(--workbench-text-muted); font-size: 0.66rem; font-weight: 860; letter-spacing: 0.18em; line-height: 1.2; text-transform: uppercase; }
.feedback-hero h1 { max-width: 13em; margin: 0.65rem 0 0; color: var(--workbench-text); font-size: clamp(2rem, 4.8vw, 4rem); font-weight: 860; letter-spacing: -0.07em; line-height: 1; }
.feedback-hero p, .feedback-section-head p, .community-card p, .feedback-topic-grid p, .admin-maintenance small, .community-link { color: var(--workbench-text-muted); font-size: 0.84rem; line-height: 1.75; }
.feedback-hero-copy > p:not(.feedback-kicker) { max-width: 46rem; margin-top: 1rem; }
.feedback-actions { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.2rem; }
.feedback-actions :deep(a) { text-decoration: none; }
.feedback-signal-card { display: grid; align-content: space-between; gap: 1rem; border: 1px solid rgb(var(--workbench-accent-rgb) / 0.25); border-radius: calc(var(--workbench-radius) * 0.92); background: linear-gradient(145deg, rgb(255 255 255 / 0.34), transparent 52%), rgb(var(--workbench-accent-rgb) / 0.11); padding: 1rem; box-shadow: inset 0 1px 0 var(--workbench-glass-highlight); backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.7)) saturate(160%); -webkit-backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.7)) saturate(160%); }
.feedback-signal-card span { color: var(--workbench-text-muted); font-size: 0.68rem; font-weight: 850; letter-spacing: 0.14em; text-transform: uppercase; }
.feedback-signal-card strong { color: var(--workbench-text); font-size: 1.65rem; font-weight: 860; letter-spacing: -0.05em; }
.feedback-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; scroll-margin-top: 6rem; }
.community-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(9rem, 0.34fr); gap: 1rem; align-items: center; overflow: hidden; border: 1px solid var(--workbench-border); border-radius: calc(var(--workbench-radius) * 1.02); background: linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 50%, transparent), transparent 50%), var(--workbench-surface); padding: clamp(1rem, 2vw, 1.35rem); box-shadow: inset 0 1px 0 var(--workbench-glass-highlight), 0 12px 34px color-mix(in srgb, var(--workbench-glass-shadow) 70%, transparent); backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.8)) saturate(165%); -webkit-backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.8)) saturate(165%); transition: transform var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease), box-shadow var(--workbench-motion-duration) var(--workbench-ease); }
.community-card:hover { border-color: rgb(var(--workbench-accent-rgb) / 0.28); box-shadow: inset 0 1px 0 var(--workbench-glass-highlight), 0 18px 46px color-mix(in srgb, var(--workbench-glass-shadow) 72%, transparent); transform: translateY(-2px); }
.community-card h2, .feedback-section-head h2 { margin: 0.45rem 0 0; color: var(--workbench-text); font-size: clamp(1.25rem, 2.2vw, 2rem); font-weight: 820; letter-spacing: -0.05em; }
.qr-frame { position: relative; display: grid; aspect-ratio: 1; place-items: center; overflow: hidden; border: 1px solid var(--workbench-border); border-radius: calc(var(--workbench-radius) * 0.9); background: linear-gradient(145deg, rgb(255 255 255 / 0.34), transparent 48%), var(--workbench-surface-muted); box-shadow: inset 0 1px 0 var(--workbench-glass-highlight); }
.qr-frame img { width: 100%; height: 100%; object-fit: cover; }
.qr-frame span { position: absolute; inset: 0; display: grid; place-items: center; padding: 1rem; color: var(--workbench-text-muted); font-size: 0.74rem; font-weight: 780; line-height: 1.6; text-align: center; }
.feedback-roadmap, .admin-maintenance { display: grid; gap: 1rem; padding: clamp(1rem, 2vw, 1.45rem); }
#admin-maintenance { scroll-margin-top: 6rem; }
.feedback-topic-grid, .admin-maintenance-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.feedback-topic-grid article, .admin-maintenance-grid article { display: grid; gap: 0.45rem; border: 1px solid var(--workbench-border); border-radius: calc(var(--workbench-radius) * 0.78); background: var(--workbench-surface-muted); padding: 0.95rem; box-shadow: inset 0 1px 0 var(--workbench-glass-highlight); }
.feedback-topic-grid span { color: rgb(var(--workbench-accent-rgb)); font-size: 0.66rem; font-weight: 880; letter-spacing: 0.16em; }
.feedback-topic-grid strong, .admin-maintenance-grid strong { color: var(--workbench-text); font-size: 0.9rem; font-weight: 820; }
.admin-maintenance-grid code { overflow-wrap: anywhere; border: 1px solid var(--workbench-border); border-radius: 0.8rem; background: color-mix(in srgb, var(--workbench-surface) 70%, transparent); color: var(--workbench-text); padding: 0.55rem; font-size: 0.72rem; }
.dark .feedback-hero::before { background: radial-gradient(circle at 8% 10%, rgb(var(--workbench-accent-rgb) / 0.18), transparent 32%), radial-gradient(circle at 88% 0%, rgb(255 255 255 / 0.08), transparent 30%); }
@media (max-width: 1100px) { .feedback-hero, .feedback-grid, .community-card, .feedback-topic-grid, .admin-maintenance-grid { grid-template-columns: 1fr; } .qr-frame { width: min(15rem, 100%); } }
@media (max-width: 640px) { .feedback-page { gap: 0.85rem; } .feedback-hero, .community-card, .feedback-roadmap, .admin-maintenance { border-radius: 1.25rem; padding: 1rem; } .feedback-hero h1 { font-size: clamp(2rem, 11vw, 3.05rem); } .feedback-actions > * { width: 100%; } }
</style>
