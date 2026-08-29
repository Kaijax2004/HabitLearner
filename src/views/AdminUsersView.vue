<template>
  <AppLayout title="用户管理">
    <div class="admin-users-page">
      <section v-if="!isAdmin" class="admin-empty-state">
        <p class="admin-kicker">Admin Console</p>
        <h1>仅管理员可访问</h1>
        <p>当前账户没有管理员权限，请使用 ADMIN_EMAILS 白名单中的账户登录。</p>
        <button type="button" class="admin-secondary-button" @click="router.push('/dashboard')">返回今日</button>
      </section>

      <template v-else>
        <section class="admin-hero">
          <div>
            <p class="admin-kicker">HabitLearner Ops Radar</p>
            <h1>用户管理中心</h1>
            <p>把增长、活跃、来源、地区和用户画像收拢到一个可执行的运营中台。</p>
          </div>
          <div class="admin-hero-actions">
            <label class="admin-range-select">
              <span>分析周期</span>
              <select v-model.number="analyticsDays" @change="loadAnalytics">
                <option :value="14">14 天</option>
                <option :value="30">30 天</option>
                <option :value="60">60 天</option>
                <option :value="90">90 天</option>
              </select>
            </label>
            <button type="button" class="admin-secondary-button" :disabled="isLoading" @click="refreshAll">
              {{ isLoading ? '刷新中...' : '刷新数据' }}
            </button>
            <button type="button" class="admin-primary-button" @click="openMailCenter">邮件中心</button>
          </div>
        </section>

        <section class="admin-metric-grid">
          <article v-for="metric in metrics" :key="metric.label" class="admin-metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <p>{{ metric.description }}</p>
          </article>
        </section>

        <section class="admin-radar-grid">
          <article class="admin-analytics-panel admin-trend-panel">
            <div class="admin-panel-head">
              <div>
                <p class="admin-kicker">Growth Pulse</p>
                <h2>增长与活跃趋势</h2>
              </div>
              <span>{{ analyticsDays }} 天</span>
            </div>

            <div v-if="isLoadingAnalytics" class="admin-skeleton-chart"></div>
            <div v-else-if="!dailySeries.length" class="admin-empty-inline">暂无趋势数据。</div>
            <svg v-else class="admin-trend-chart" viewBox="0 0 720 260" role="img" aria-label="用户增长与活跃趋势">
              <defs>
                <linearGradient id="registeredFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#18181b" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="#18181b" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g class="admin-grid-lines">
                <line v-for="tick in chartTicks" :key="tick" x1="48" x2="690" :y1="tick" :y2="tick" />
              </g>
              <path :d="chartAreaPath('registered')" fill="url(#registeredFill)" />
              <polyline :points="chartLinePoints('registered')" class="admin-line admin-line-registered" />
              <polyline :points="chartLinePoints('loginActive')" class="admin-line admin-line-login" />
              <polyline :points="chartLinePoints('behaviorActive')" class="admin-line admin-line-behavior" />
              <g>
                <circle v-for="point in chartDots('registered')" :key="'r-' + point.index" :cx="point.x" :cy="point.y" r="3.5" class="admin-dot-registered" />
              </g>
              <g class="admin-axis-labels">
                <text x="48" y="238">{{ firstSeriesDate }}</text>
                <text x="690" y="238" text-anchor="end">{{ lastSeriesDate }}</text>
                <text x="48" y="30">{{ chartMax }}</text>
              </g>
            </svg>

            <div class="admin-chart-legend">
              <span><i class="is-registered"></i>新增注册</span>
              <span><i class="is-login"></i>登录活跃</span>
              <span><i class="is-behavior"></i>行为活跃</span>
            </div>
          </article>

          <article class="admin-analytics-panel admin-source-panel">
            <p class="admin-kicker">Acquisition Mix</p>
            <h2>登录来源结构</h2>
            <div class="admin-bar-list">
              <div v-for="item in loginProviderBars" :key="item.key" class="admin-bar-row">
                <div>
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.value }} 位</span>
                </div>
                <div class="admin-bar-track"><i :style="{ width: item.percent + '%' }"></i></div>
              </div>
              <p v-if="!loginProviderBars.length" class="admin-muted">暂无来源数据。</p>
            </div>
          </article>

          <article class="admin-analytics-panel admin-funnel-panel">
            <p class="admin-kicker">Activation Funnel</p>
            <h2>注册转化漏斗</h2>
            <div class="admin-funnel-list">
              <div v-for="step in conversionFunnel" :key="step.key" class="admin-funnel-row">
                <div>
                  <strong>{{ step.label }}</strong>
                  <span>{{ step.value }} 位 · {{ step.rate }}%</span>
                </div>
                <div class="admin-funnel-track"><i :style="{ width: Math.max(step.rate, step.value ? 4 : 0) + '%' }"></i></div>
              </div>
              <p v-if="!conversionFunnel.length" class="admin-muted">暂无转化数据。</p>
            </div>
          </article>

          <article class="admin-analytics-panel admin-product-panel">
            <p class="admin-kicker">Need Signal</p>
            <h2>产品刚需信号</h2>
            <div class="admin-product-rates">
              <div>
                <span>启动转行动</span>
                <strong>{{ productHealth.activationRate || 0 }}%</strong>
              </div>
              <div>
                <span>复盘收口</span>
                <strong>{{ productHealth.closeLoopRate || 0 }}%</strong>
              </div>
            </div>
            <div class="admin-funnel-list">
              <div v-for="step in productHealthItems" :key="step.key" class="admin-funnel-row">
                <div>
                  <strong>{{ step.label }}</strong>
                  <span>{{ step.value }} 次</span>
                </div>
                <div class="admin-funnel-track"><i :style="{ width: Math.max(step.rate, step.value ? 4 : 0) + '%' }"></i></div>
              </div>
              <p v-if="!productHealthItems.length" class="admin-muted">暂无产品行为数据。</p>
            </div>
          </article>
        </section>

        <section class="admin-map-layout">
          <article class="admin-analytics-panel admin-map-panel">
            <div class="admin-panel-head">
              <div>
                <p class="admin-kicker">China Heat Map</p>
                <h2>中国区域注册分布</h2>
              </div>
              <span>{{ locatedUsers }} 已定位 / {{ unknownUsers }} 未知</span>
            </div>

            <div class="admin-map-content">
              <AdminChinaGeoMap :provinces="regionAnalytics.provinces || []" />

              <div class="admin-map-side">
                <div class="admin-location-note">
                  <strong>定位口径</strong>
                  <p>{{ ipLocationNote }}</p>
                </div>
                <div class="admin-region-list">
                  <div v-for="region in topRegions" :key="region.name" class="admin-region-row">
                    <span>{{ region.name }}</span>
                    <strong>{{ region.value }}</strong>
                    <i :style="{ width: regionPercent(region) + '%' }"></i>
                  </div>
                  <p v-if="!topRegions.length" class="admin-muted">暂无可解析到省份的用户。</p>
                </div>
              </div>
            </div>
          </article>

          <aside class="admin-analytics-panel admin-city-panel">
            <p class="admin-kicker">Geo Portrait</p>
            <h2>城市与最近定位</h2>
            <div class="admin-city-list">
              <div v-for="city in topCities" :key="city.name">
                <span>{{ city.name }}</span>
                <strong>{{ city.value }}</strong>
              </div>
              <p v-if="!topCities.length" class="admin-muted">暂无城市数据。</p>
            </div>
            <div class="admin-located-list">
              <button v-for="user in recentLocatedUsers" :key="user.id" type="button" @click="openUserDetail(user.id)">
                <strong>{{ user.displayName }}</strong>
                <span>{{ formatProvider(user.provider) }} · {{ user.location }}</span>
              </button>
            </div>
          </aside>
        </section>
        <section class="admin-layout">
          <main class="admin-main-panel">
            <div class="admin-panel-head">
              <div>
                <p class="admin-kicker">User Ledger</p>
                <h2>用户列表</h2>
              </div>
              <span>{{ pagination.total }} 位用户</span>
            </div>

            <div class="admin-filter-grid">
              <input v-model.trim="filters.q" class="admin-input" placeholder="搜索用户名 / 昵称 / 邮箱" @keyup.enter="loadUsers(1)" />
              <select v-model="filters.provider" class="admin-input" @change="loadUsers(1)">
                <option value="">全部来源</option>
                <option value="wx">微信</option>
                <option value="qq">QQ</option>
                <option value="google">Google</option>
                <option value="github">GitHub</option>
                <option value="password">密码登录</option>
                <option value="email_code">验证码登录</option>
              </select>
              <select v-model="filters.profileStatus" class="admin-input" @change="loadUsers(1)">
                <option value="">资料状态</option>
                <option value="complete">已完成</option>
                <option value="incomplete">未完成</option>
              </select>
              <select v-model="filters.activeWithin" class="admin-input" @change="loadUsers(1)">
                <option value="">最近活跃</option>
                <option value="7">7 天内</option>
                <option value="30">30 天内</option>
                <option value="90">90 天内</option>
              </select>
              <input v-model="filters.createdFrom" type="date" class="admin-input" @change="loadUsers(1)" />
              <input v-model="filters.createdTo" type="date" class="admin-input" @change="loadUsers(1)" />
              <button type="button" class="admin-secondary-button" @click="loadUsers(1)">查询</button>
            </div>

            <div v-if="errorMessage" class="admin-error">{{ errorMessage }}</div>
            <div v-if="isLoadingUsers" class="admin-loading">正在加载用户...</div>

            <div v-else class="admin-user-table">
              <button v-for="user in users" :key="user.id" type="button" class="admin-user-row" @click="openUserDetail(user.id)">
                <div class="admin-user-identity">
                  <div class="admin-avatar">{{ getInitial(user) }}</div>
                  <div>
                    <strong>{{ user.displayName }}</strong>
                    <span>{{ user.username }} · {{ user.email || '未绑定邮箱' }}</span>
                  </div>
                </div>
                <div class="admin-row-meta">
                  <span>{{ formatProvider(user.lastLoginProvider) }}</span>
                  <span>{{ formatDate(user.lastLoginAt) || '未登录' }}</span>
                  <span>{{ user.lastLoginLocation || user.lastLoginIp || '未知地区' }}</span>
                </div>
                <span :class="['admin-status-pill', isProfileComplete(user) ? 'is-complete' : 'is-pending']">
                  {{ isProfileComplete(user) ? '资料完成' : '待完善' }}
                </span>
              </button>

              <div v-if="!users.length" class="admin-empty-inline">暂无符合条件的用户。</div>
            </div>

            <div class="admin-pagination">
              <button type="button" class="admin-secondary-button" :disabled="pagination.page <= 1" @click="loadUsers(pagination.page - 1)">上一页</button>
              <span>第 {{ pagination.page }} / {{ pagination.totalPages || 1 }} 页</span>
              <button type="button" class="admin-secondary-button" :disabled="pagination.page >= pagination.totalPages" @click="loadUsers(pagination.page + 1)">下一页</button>
            </div>
          </main>

          <aside class="admin-side-panel">
            <section class="admin-side-card">
              <p class="admin-kicker">Mail Center</p>
              <h3>群发邮件</h3>
              <p>当前收件用户 {{ emailAudience.totalUsers || 0 }} 位，通道：{{ emailAudience.delivery?.enabled ? 'Resend 已启用' : '开发模式' }}。</p>
              <button type="button" class="admin-primary-button w-full" @click="openMailCenter">打开邮件中心</button>
            </section>

            <section class="admin-side-card">
              <p class="admin-kicker">Membership</p>
              <h3>会员权益预留</h3>
              <p>后续接入会员权益表后，可在用户详情中手动赠送会员、调整到期时间和查看权益记录。</p>
              <button type="button" class="admin-disabled-button" disabled>赠送会员（预留）</button>
            </section>
          </aside>
        </section>

        <Transition name="admin-drawer">
          <div v-if="detailOpen" class="admin-drawer-layer" @click.self="closeDetail">
            <aside class="admin-detail-drawer">
              <header class="admin-detail-head">
                <div>
                  <p class="admin-kicker">User Profile</p>
                  <h2>{{ selectedDetail?.user?.displayName || '用户详情' }}</h2>
                </div>
                <button type="button" class="admin-icon-button" @click="closeDetail">×</button>
              </header>

              <div v-if="isLoadingDetail" class="admin-loading">正在加载详情...</div>
              <div v-else-if="selectedDetail" class="admin-detail-body">
                <section class="admin-detail-card">
                  <h3>基础信息</h3>
                  <div class="admin-info-grid">
                    <span>用户名</span><strong>{{ selectedDetail.user.username }}</strong>
                    <span>昵称</span><strong>{{ selectedDetail.user.nickname || '未设置' }}</strong>
                    <span>邮箱</span><strong>{{ selectedDetail.user.email || '未绑定' }}</strong>
                    <span>注册时间</span><strong>{{ formatDate(selectedDetail.user.createdAt) }}</strong>
                    <span>最近登录</span><strong>{{ formatDate(selectedDetail.user.lastLoginAt) || '未登录' }}</strong>
                    <span>IP / 地区</span><strong>{{ selectedDetail.user.lastLoginIp || '未知' }} / {{ selectedDetail.user.lastLoginLocation || '未知' }}</strong>
                  </div>
                </section>

                <section class="admin-detail-card">
                  <h3>社交身份</h3>
                  <div v-if="selectedDetail.user.socialIdentities.length" class="admin-social-list">
                    <div v-for="identity in selectedDetail.user.socialIdentities" :key="identity.provider + '-' + identity.socialUid">
                      <strong>{{ formatProvider(identity.provider) }}</strong>
                      <span>{{ identity.nickname || '未返回昵称' }} · {{ identity.location || identity.ip || '未知地区' }}</span>
                    </div>
                  </div>
                  <p v-else class="admin-muted">暂无社交身份绑定。</p>
                </section>

                <section class="admin-detail-card">
                  <h3>行为摘要</h3>
                  <div class="admin-behavior-grid">
                    <div v-for="item in behaviorItems" :key="item.label">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                  </div>
                </section>

                <section class="admin-detail-card">
                  <h3>最近活动</h3>
                  <div v-if="selectedDetail.recentActivity.length" class="admin-timeline">
                    <div v-for="(item, index) in selectedDetail.recentActivity" :key="item.type + '-' + index + '-' + item.at">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.title }}</strong>
                      <small>{{ formatDate(item.at) }} {{ item.status ? '· ' + item.status : '' }}</small>
                    </div>
                  </div>
                  <p v-else class="admin-muted">暂无近期行为记录。</p>
                </section>

                <section class="admin-detail-card">
                  <h3>会员操作</h3>
                  <p class="admin-muted">{{ selectedDetail.membership.message }}</p>
                  <button type="button" class="admin-disabled-button" disabled>赠送会员（预留）</button>
                </section>
              </div>
            </aside>
          </div>
        </Transition>
      </template>
    </div>
  </AppLayout>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AdminChinaGeoMap from '@/components/AdminChinaGeoMap.vue'
import { useAuthStore } from '@/stores/auth'
import { getAdminUserDetail, getAdminUsers, getAdminUsersAnalytics, getAdminUsersOverview } from '@/api/admin'
import * as settingsAPI from '@/api/settings'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => Boolean(authStore.user?.isAdmin || authStore.user?.security?.isAdmin))

const overview = ref({})
const analytics = ref({})
const users = ref([])
const emailAudience = ref({})
const selectedDetail = ref(null)
const detailOpen = ref(false)
const isLoading = ref(false)
const isLoadingUsers = ref(false)
const isLoadingDetail = ref(false)
const isLoadingAnalytics = ref(false)
const errorMessage = ref('')
const analyticsDays = ref(30)

const filters = ref({
  q: '',
  provider: '',
  profileStatus: '',
  activeWithin: '',
  createdFrom: '',
  createdTo: ''
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1
})

const metrics = computed(() => [
  { label: '总用户', value: overview.value.totalUsers || 0, description: '当前本地用户总量' },
  { label: '今日新增', value: overview.value.todayNewUsers || 0, description: '今天创建账户的用户' },
  { label: '昨日新增', value: overview.value.yesterdayNewUsers || 0, description: '昨天创建账户的用户' },
  { label: '登录 DAU', value: overview.value.loginDau || 0, description: '最近 24 小时登录用户' },
  { label: '行为 DAU', value: overview.value.behaviorDau || 0, description: '最近 24 小时有真实操作' },
  { label: '资料完成', value: overview.value.completedProfiles || 0, description: '已完成资料和隐私确认' }
])

const dailySeries = computed(() => analytics.value.dailySeries || [])
const conversionFunnel = computed(() => analytics.value.conversionFunnel || [])
const productHealth = computed(() => analytics.value.productHealth || {})
const productHealthItems = computed(() => productHealth.value.items || [])
const regionAnalytics = computed(() => analytics.value.regionAnalytics || {})
const topRegions = computed(() => regionAnalytics.value.topRegions || [])
const topCities = computed(() => regionAnalytics.value.topCities || [])
const locatedUsers = computed(() => regionAnalytics.value.locatedUsers || 0)
const unknownUsers = computed(() => regionAnalytics.value.unknownUsers || 0)
const recentLocatedUsers = computed(() => regionAnalytics.value.recentLocatedUsers || [])
const ipLocationNote = computed(() => analytics.value.ipLocation?.note || 'IP 地区为运营分析推断结果，可能存在误差。')

const chartTicks = [42, 88, 134, 180, 226]
const chartMax = computed(() => Math.max(1, ...dailySeries.value.flatMap((item) => [item.registered || 0, item.loginActive || 0, item.behaviorActive || 0])))
const firstSeriesDate = computed(() => formatShortDate(dailySeries.value[0]?.date))
const lastSeriesDate = computed(() => formatShortDate(dailySeries.value[dailySeries.value.length - 1]?.date))

const loginProviderBars = computed(() => {
  const series = analytics.value.loginProviderSeries || []
  const max = Math.max(1, ...series.map((item) => item.value || 0))
  return series.map((item) => ({ ...item, percent: Math.round(((item.value || 0) / max) * 100) }))
})

const behaviorItems = computed(() => {
  const counts = selectedDetail.value?.behaviorCounts || {}
  return [
    { label: '计划', value: counts.plans || 0 },
    { label: '习惯', value: counts.habits || 0 },
    { label: '打卡', value: counts.habitCheckIns || 0 },
    { label: '日程', value: counts.scheduleBlocks || 0 },
    { label: '专注', value: counts.pomodoroSessions || 0 },
    { label: '收集', value: counts.quickCaptures || 0 },
    { label: '内容', value: counts.creatorItems || 0 },
    { label: '复盘', value: counts.reviewEntries || 0 }
  ]
})

const formatShortDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(5)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatProvider = (provider) => ({
  wx: '微信',
  qq: 'QQ',
  google: 'Google',
  github: 'GitHub',
  password: '密码登录',
  email_code: '验证码登录',
  email_register: '邮箱注册'
}[provider] || '未知来源')

const isProfileComplete = (user) => Boolean(user.profileCompletedAt && user.privacyPolicyAcceptedAt)
const getInitial = (user) => String(user.displayName || user.username || 'U').slice(0, 1).toUpperCase()

const chartPoint = (item, index, field) => {
  const width = 642
  const left = 48
  const top = 38
  const height = 184
  const step = dailySeries.value.length > 1 ? width / (dailySeries.value.length - 1) : 0
  const value = Number(item?.[field] || 0)
  return {
    index,
    x: left + step * index,
    y: top + height - (value / chartMax.value) * height
  }
}

const chartDots = (field) => dailySeries.value.map((item, index) => chartPoint(item, index, field))
const chartLinePoints = (field) => chartDots(field).map((point) => `${point.x},${point.y}`).join(' ')
const chartAreaPath = (field) => {
  const points = chartDots(field)
  if (!points.length) return ''
  const start = points[0]
  const end = points[points.length - 1]
  return `M ${start.x} 222 L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${end.x} 222 Z`
}

const regionPercent = (region) => {
  const max = Math.max(1, ...topRegions.value.map((item) => item.value || 0))
  return Math.round(((region.value || 0) / max) * 100)
}
const loadOverview = async () => {
  const response = await getAdminUsersOverview()
  if (!response.success) throw new Error(response.error || '概览加载失败')
  overview.value = response.data || {}
}

const loadAnalytics = async () => {
  if (!isAdmin.value) return
  isLoadingAnalytics.value = true
  try {
    const response = await getAdminUsersAnalytics({ days: analyticsDays.value })
    if (!response.success) throw new Error(response.error || '分析数据加载失败')
    analytics.value = response.data || {}
  } catch (error) {
    errorMessage.value = error.message || '分析数据加载失败'
  } finally {
    isLoadingAnalytics.value = false
  }
}

const loadEmailAudience = async () => {
  const response = await settingsAPI.getAdminEmailAudience()
  if (response.success) {
    emailAudience.value = response.data || {}
  }
}

const loadUsers = async (page = pagination.value.page) => {
  isLoadingUsers.value = true
  errorMessage.value = ''
  try {
    const response = await getAdminUsers({
      ...filters.value,
      page,
      pageSize: pagination.value.pageSize
    })
    if (!response.success) throw new Error(response.error || '用户列表加载失败')
    users.value = response.data?.items || []
    pagination.value = {
      ...pagination.value,
      ...(response.data?.pagination || {}),
      page
    }
  } catch (error) {
    errorMessage.value = error.message || '用户列表加载失败'
  } finally {
    isLoadingUsers.value = false
  }
}

const refreshAll = async () => {
  if (!isAdmin.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([
      loadOverview(),
      loadAnalytics(),
      loadUsers(1),
      loadEmailAudience()
    ])
  } catch (error) {
    errorMessage.value = error.message || '管理员数据加载失败'
  } finally {
    isLoading.value = false
  }
}

const openUserDetail = async (id) => {
  detailOpen.value = true
  selectedDetail.value = null
  isLoadingDetail.value = true
  try {
    const response = await getAdminUserDetail(id)
    if (!response.success) throw new Error(response.error || '用户详情加载失败')
    selectedDetail.value = response.data
  } catch (error) {
    selectedDetail.value = {
      user: { displayName: '加载失败', socialIdentities: [] },
      behaviorCounts: {},
      recentActivity: [],
      membership: { message: error.message || '请稍后重试' }
    }
  } finally {
    isLoadingDetail.value = false
  }
}

const closeDetail = () => {
  detailOpen.value = false
  selectedDetail.value = null
}

const openMailCenter = () => {
  router.push({ path: '/profile', query: { panel: 'admin-mail' } })
}

onMounted(() => {
  if (isAdmin.value) {
    refreshAll()
  }
})
</script>

<style scoped>
.admin-users-page { display: grid; gap: 20px; }
.admin-hero, .admin-main-panel, .admin-side-card, .admin-metric-card, .admin-empty-state, .admin-analytics-panel {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 48px rgba(24, 24, 27, 0.07);
  backdrop-filter: blur(18px);
}
.dark .admin-hero, .dark .admin-main-panel, .dark .admin-side-card, .dark .admin-metric-card, .dark .admin-empty-state, .dark .admin-analytics-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
}
.admin-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; padding: 28px; }
.admin-hero h1, .admin-empty-state h1 { margin: 6px 0 0; color: rgb(24, 24, 27); font-size: clamp(32px, 4vw, 52px); font-weight: 720; letter-spacing: -0.07em; }
.dark .admin-hero h1, .dark .admin-empty-state h1 { color: white; }
.admin-hero p, .admin-side-card p, .admin-empty-state p, .admin-muted, .admin-location-note p { color: rgb(113, 113, 122); }
.admin-kicker { margin: 0; color: rgb(113, 113, 122); font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
.admin-hero-actions, .admin-pagination, .admin-chart-legend { display: flex; align-items: center; gap: 10px; }
.admin-range-select { display: grid; gap: 5px; min-width: 116px; color: rgb(113, 113, 122); font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.admin-range-select select, .admin-input { min-width: 0; border: 1px solid rgba(212, 212, 216, 0.9); border-radius: 16px; background: rgba(255, 255, 255, 0.86); padding: 0.75rem 0.85rem; color: rgb(24, 24, 27); }
.dark .admin-range-select select, .dark .admin-input { border-color: rgba(82, 82, 91, 0.9); background: rgba(39, 39, 42, 0.72); color: white; }
.admin-primary-button, .admin-secondary-button, .admin-disabled-button, .admin-icon-button { border: 0; border-radius: 999px; padding: 0.78rem 1rem; font-weight: 750; transition: transform 160ms ease, opacity 160ms ease; }
.admin-primary-button { background: rgb(24, 24, 27); color: white; }
.admin-secondary-button { border: 1px solid rgba(212, 212, 216, 0.9); background: rgba(255, 255, 255, 0.78); color: rgb(39, 39, 42); }
.dark .admin-secondary-button { border-color: rgba(82, 82, 91, 0.9); background: rgba(39, 39, 42, 0.7); color: white; }
.admin-disabled-button { width: 100%; background: rgba(212, 212, 216, 0.5); color: rgb(113, 113, 122); }
.admin-primary-button:not(:disabled):hover, .admin-secondary-button:not(:disabled):hover, .admin-user-row:hover, .admin-located-list button:hover { transform: translateY(-1px); }
.admin-primary-button:not(:disabled):active, .admin-secondary-button:not(:disabled):active, .admin-user-row:active, .admin-located-list button:active { transform: scale(0.985); }
.admin-metric-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.admin-metric-card { padding: 18px; }
.admin-metric-card span, .admin-user-row span, .admin-info-grid span, .admin-behavior-grid span, .admin-region-row span, .admin-city-list span, .admin-funnel-row span, .admin-bar-row span { color: rgb(113, 113, 122); font-size: 12px; }
.admin-metric-card strong { display: block; margin-top: 8px; color: rgb(24, 24, 27); font-size: 30px; letter-spacing: -0.05em; }
.dark .admin-metric-card strong, .dark .admin-panel-head h2, .dark .admin-side-card h3, .dark .admin-detail-card h3, .dark .admin-analytics-panel h2, .dark .admin-bar-row strong, .dark .admin-funnel-row strong, .dark .admin-region-row strong, .dark .admin-city-list strong { color: white; }
.admin-metric-card p { margin: 6px 0 0; color: rgb(113, 113, 122); font-size: 12px; }
.admin-radar-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.72fr) minmax(260px, 0.72fr); gap: 16px; align-items: stretch; }
.admin-analytics-panel, .admin-main-panel, .admin-side-card { padding: 20px; }
.admin-trend-panel { min-height: 368px; }
.admin-panel-head { display: flex; justify-content: space-between; gap: 16px; }
.admin-panel-head h2, .admin-side-card h3, .admin-detail-card h3, .admin-analytics-panel h2 { margin: 4px 0 0; color: rgb(24, 24, 27); font-size: 20px; font-weight: 700; letter-spacing: -0.04em; }
.admin-trend-chart { width: 100%; min-height: 238px; margin-top: 16px; }
.admin-grid-lines line { stroke: rgba(212, 212, 216, 0.62); stroke-width: 1; }
.admin-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.admin-line-registered { stroke: rgb(24, 24, 27); }
.admin-line-login { stroke: rgb(82, 82, 91); stroke-dasharray: 6 7; }
.admin-line-behavior { stroke: rgb(120, 113, 108); }
.admin-dot-registered { fill: rgb(24, 24, 27); }
.admin-axis-labels text, .admin-province-label { fill: rgb(113, 113, 122); font-size: 11px; font-weight: 700; }
.admin-chart-legend { flex-wrap: wrap; color: rgb(113, 113, 122); font-size: 12px; }
.admin-chart-legend i { display: inline-block; width: 18px; height: 3px; margin-right: 6px; border-radius: 999px; vertical-align: middle; }
.admin-chart-legend .is-registered { background: rgb(24, 24, 27); }
.admin-chart-legend .is-login { background: rgb(82, 82, 91); }
.admin-chart-legend .is-behavior { background: rgb(120, 113, 108); }
.admin-bar-list, .admin-funnel-list, .admin-region-list, .admin-city-list, .admin-located-list { display: grid; gap: 12px; margin-top: 16px; }
.admin-bar-row, .admin-funnel-row { display: grid; gap: 8px; }
.admin-bar-row > div:first-child, .admin-funnel-row > div:first-child, .admin-region-row, .admin-city-list > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-bar-row strong, .admin-funnel-row strong, .admin-region-row strong, .admin-city-list strong { color: rgb(24, 24, 27); }
.admin-bar-track, .admin-funnel-track { height: 9px; overflow: hidden; border-radius: 999px; background: rgba(228, 228, 231, 0.72); }
.admin-bar-track i, .admin-funnel-track i { display: block; height: 100%; border-radius: inherit; background: rgb(24, 24, 27); }
.admin-product-rates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
.admin-product-rates div { border: 1px solid rgba(228, 228, 231, 0.85); border-radius: 18px; background: rgba(250, 250, 250, 0.7); padding: 12px; }
.admin-product-rates span { color: rgb(113, 113, 122); font-size: 12px; }
.admin-product-rates strong { display: block; margin-top: 6px; color: rgb(24, 24, 27); font-size: 24px; letter-spacing: -0.04em; }
.dark .admin-product-rates div { border-color: rgba(63, 63, 70, 0.9); background: rgba(39, 39, 42, 0.68); }
.dark .admin-product-rates strong { color: white; }
.admin-map-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; }
.admin-map-content { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr); gap: 18px; align-items: center; margin-top: 12px; }

.admin-map-side { display: grid; gap: 14px; }
.admin-location-note { border-radius: 22px; background: rgba(244, 244, 245, 0.78); padding: 14px; }
.dark .admin-location-note { background: rgba(39, 39, 42, 0.72); }
.admin-location-note strong { color: rgb(24, 24, 27); }
.dark .admin-location-note strong { color: white; }
.admin-region-row { position: relative; overflow: hidden; border-radius: 16px; background: rgba(244, 244, 245, 0.72); padding: 12px; }
.dark .admin-region-row { background: rgba(39, 39, 42, 0.72); }
.admin-region-row i { position: absolute; inset: auto auto 0 0; height: 3px; border-radius: 999px; background: rgb(24, 24, 27); }
.admin-city-list > div, .admin-located-list button { border: 1px solid rgba(228, 228, 231, 0.82); border-radius: 18px; background: rgba(250, 250, 250, 0.68); padding: 12px; }
.dark .admin-city-list > div, .dark .admin-located-list button { border-color: rgba(63, 63, 70, 0.9); background: rgba(39, 39, 42, 0.68); }
.admin-located-list button { display: grid; gap: 4px; width: 100%; text-align: left; transition: transform 160ms ease; }
.admin-located-list strong { color: rgb(24, 24, 27); }
.dark .admin-located-list strong { color: white; }
.admin-located-list span { color: rgb(113, 113, 122); font-size: 12px; }
.admin-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; align-items: start; }
.admin-filter-grid { display: grid; grid-template-columns: 1.5fr repeat(5, minmax(0, 1fr)) auto; gap: 10px; margin-top: 18px; }
.admin-user-table { display: grid; gap: 10px; margin-top: 16px; }
.admin-user-row { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto; align-items: center; gap: 14px; border: 1px solid rgba(228, 228, 231, 0.8); border-radius: 20px; background: rgba(250, 250, 250, 0.74); padding: 14px; text-align: left; transition: transform 160ms ease; }
.dark .admin-user-row { border-color: rgba(63, 63, 70, 0.85); background: rgba(39, 39, 42, 0.68); }
.admin-user-identity { display: flex; min-width: 0; align-items: center; gap: 12px; }
.admin-avatar { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; border-radius: 16px; background: rgb(24, 24, 27); color: white; font-weight: 800; }
.admin-user-identity strong { display: block; color: rgb(24, 24, 27); }
.dark .admin-user-identity strong { color: white; }
.admin-user-identity span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-row-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.admin-status-pill { border-radius: 999px; padding: 0.38rem 0.68rem; font-size: 12px; font-weight: 800; }
.admin-status-pill.is-complete { background: rgba(16, 185, 129, 0.12); color: rgb(4, 120, 87); }
.admin-status-pill.is-pending { background: rgba(245, 158, 11, 0.14); color: rgb(180, 83, 9); }
.admin-side-panel { display: grid; gap: 14px; }
.admin-error, .admin-loading, .admin-empty-inline, .admin-skeleton-chart { margin-top: 14px; border-radius: 18px; background: rgba(244, 244, 245, 0.85); padding: 18px; color: rgb(113, 113, 122); text-align: center; }
.admin-skeleton-chart { min-height: 238px; background: linear-gradient(90deg, rgba(244, 244, 245, 0.6), rgba(228, 228, 231, 0.9), rgba(244, 244, 245, 0.6)); background-size: 220% 100%; animation: adminShimmer 1.3s ease-in-out infinite; }
.admin-error { background: rgba(254, 226, 226, 0.8); color: rgb(185, 28, 28); }
.admin-pagination { justify-content: center; margin-top: 18px; }
.admin-empty-state { display: grid; place-items: center; min-height: 55vh; padding: 42px; text-align: center; }
.admin-drawer-layer { position: fixed; inset: 0; z-index: 80; display: flex; justify-content: flex-end; background: rgba(24, 24, 27, 0.2); backdrop-filter: blur(10px); }
.admin-detail-drawer { width: min(100%, 560px); height: 100%; overflow-y: auto; border-left: 1px solid rgba(228, 228, 231, 0.9); background: rgba(255, 255, 255, 0.94); padding: 22px; }
.dark .admin-detail-drawer { border-color: rgba(63, 63, 70, 0.9); background: rgba(24, 24, 27, 0.96); }
.admin-detail-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-icon-button { width: 38px; height: 38px; padding: 0; background: rgb(24, 24, 27); color: white; font-size: 24px; line-height: 1; }
.admin-detail-body { display: grid; gap: 14px; margin-top: 18px; }
.admin-detail-card { border: 1px solid rgba(228, 228, 231, 0.9); border-radius: 22px; padding: 16px; }
.dark .admin-detail-card { border-color: rgba(63, 63, 70, 0.9); }
.admin-info-grid { display: grid; grid-template-columns: 86px minmax(0, 1fr); gap: 10px; margin-top: 12px; }
.admin-info-grid strong { min-width: 0; overflow-wrap: anywhere; color: rgb(39, 39, 42); }
.dark .admin-info-grid strong { color: white; }
.admin-social-list, .admin-timeline { display: grid; gap: 10px; margin-top: 12px; }
.admin-social-list > div, .admin-timeline > div { display: grid; gap: 3px; border-radius: 16px; background: rgba(244, 244, 245, 0.8); padding: 12px; }
.dark .admin-social-list > div, .dark .admin-timeline > div { background: rgba(39, 39, 42, 0.8); }
.admin-behavior-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.admin-behavior-grid div { border-radius: 16px; background: rgba(244, 244, 245, 0.8); padding: 12px; }
.dark .admin-behavior-grid div { background: rgba(39, 39, 42, 0.8); }
.admin-behavior-grid strong { display: block; margin-top: 4px; font-size: 20px; }
.admin-drawer-enter-active, .admin-drawer-leave-active { transition: opacity 160ms ease; }
.admin-drawer-enter-from, .admin-drawer-leave-to { opacity: 0; }
@keyframes adminShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 220% 50%; } }
@media (prefers-reduced-motion: reduce) { .admin-skeleton-chart { animation: none; } .admin-primary-button, .admin-secondary-button, .admin-user-row, .admin-located-list button { transition: none; } }
@media (max-width: 1280px) { .admin-metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .admin-radar-grid, .admin-map-layout, .admin-layout { grid-template-columns: 1fr; } }
@media (max-width: 920px) { .admin-map-content { grid-template-columns: 1fr; } .admin-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) { .admin-hero { align-items: stretch; flex-direction: column; } .admin-hero-actions, .admin-pagination { flex-wrap: wrap; } .admin-metric-grid, .admin-filter-grid, .admin-user-row { grid-template-columns: 1fr; } .admin-behavior-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>

