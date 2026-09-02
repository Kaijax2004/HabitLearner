<template>
  <AppLayout title="热点雷达">
    <div class="hotspot-page">
      <section class="hotspot-hero radar-hero">
        <div class="hero-orbit" aria-hidden="true"></div>
        <div class="hotspot-hero-copy hero-copy">
          <p class="hotspot-kicker">Hotspot Radar</p>
          <h1>今天值得写的信号，先被你看见。</h1>
          <p>
            热点雷达会按你的订阅源聚合全网信号，优先放大 AI、科技、开发和简报类高价值信息，再把热点转成可执行选题。
          </p>
          <div class="hotspot-hero-actions hero-actions">
            <button type="button" :disabled="isSavingSubscription" @click="quickCoreSubscription">聚焦核心源</button>
            <button type="button" :disabled="isRefreshing || isLoading" @click="refreshRadar">
              {{ isRefreshing ? '刷新中' : '刷新雷达' }}
            </button>
          </div>
        </div>
        <div class="hotspot-hero-panel hero-intel-card">
          <span>今日首要信号</span>
          <strong>{{ topSignalTitle }}</strong>
          <p>{{ topSignalReason }}</p>
          <button v-if="topSignal" type="button" @click="selectHotspot(topSignal)">查看分析</button>
        </div>
      </section>

      <section class="hotspot-metrics radar-command-grid">
        <article>
          <span>可用热点</span>
          <strong>{{ items.length }}</strong>
          <small>来自已订阅来源</small>
        </article>
        <article>
          <span>全量来源</span>
          <strong>{{ totalSourceCount }}</strong>
          <small>低关注渠道可按需开启</small>
        </article>
        <article>
          <span>高热信号</span>
          <strong>{{ highHeatCount }}</strong>
          <small>优先判断是否转选题</small>
        </article>
        <article>
          <span>首页快照</span>
          <strong>{{ prefilledSnapshotCount }}</strong>
          <small>一次抓取多源缓存</small>
        </article>
      </section>
      <section class="radar-insight-strip" aria-label="热点板块概览">
        <button
          v-for="brief in radarBriefs"
          :key="brief.key"
          type="button"
          :class="{ 'is-active': activeCategory === brief.key }"
          @click="activeCategory = brief.key"
        >
          <span>{{ brief.label }}</span>
          <strong>{{ brief.count }}</strong>
          <small>{{ brief.caption }}</small>
        </button>
      </section>

      <section class="hotspot-toolbar">
        <div class="hotspot-category-tabs" role="tablist" aria-label="板块筛选">
          <button
            v-for="category in categoryTabs"
            :key="category.key"
            type="button"
            :class="{ 'is-active': activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            {{ category.label }}
          </button>
        </div>
        <div class="hotspot-controls">
          <select v-model="activeTier">
            <option value="all">全部层级</option>
            <option value="boom">爆发</option>
            <option value="high">高热</option>
            <option value="medium">中热</option>
            <option value="longtail">长尾</option>
          </select>
          <select v-model="activeFit">
            <option value="all">全部内容平台</option>
            <option v-for="fit in contentFitOptions" :key="fit" :value="fit">{{ fit }}</option>
          </select>
          <input v-model.trim="searchKeyword" placeholder="搜索关键词、标题或来源" />
        </div>
      </section>

      <div v-if="errorMessage" class="hotspot-error">{{ errorMessage }}</div>

      <section class="hotspot-layout radar-workbench">
        <aside class="hotspot-subscription-panel source-console">
          <div class="hotspot-section-head">
            <div>
              <p class="hotspot-kicker">Subscriptions</p>
              <h2>订阅设置</h2>
            </div>
            <button type="button" class="ghost-button" :disabled="isSavingSubscription" @click="saveSubscription">
              {{ isSavingSubscription ? '保存中' : '保存' }}
            </button>
          </div>

          <div class="subscription-mode-card">
            <label>
              <input v-model="draftMode" value="custom" type="radio" />
              <span>只看我的订阅</span>
            </label>
            <label>
              <input v-model="draftMode" value="all" type="radio" />
              <span>临时查看全量源</span>
            </label>
          </div>

          <div class="subscription-block">
            <div class="subscription-block-head">
              <strong>按板块订阅</strong>
              <small>{{ selectedCategoryCount }} 个板块</small>
            </div>
            <div class="subscription-chip-grid">
              <button
                v-for="category in subscriptionCategories"
                :key="category.key"
                type="button"
                :class="{ 'is-active': draftCategories.includes(category.key) }"
                @click="toggleCategory(category.key)"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <div class="subscription-block">
            <div class="subscription-block-head">
              <strong>精确来源</strong>
              <small>{{ selectedSourceCount }} 个来源</small>
            </div>
            <div class="source-filter-row">
              <button type="button" :class="{ 'is-active': sourceCatalogFilter === 'core' }" @click="sourceCatalogFilter = 'core'">核心</button>
              <button type="button" :class="{ 'is-active': sourceCatalogFilter === 'all' }" @click="sourceCatalogFilter = 'all'">全部</button>
            </div>
            <div class="source-search-row">
              <input v-model.trim="sourceSearchKeyword" placeholder="搜索来源、平台或板块" />
              <select v-model="sourceCatalogCategory">
                <option value="all">全部板块</option>
                <option v-for="category in subscriptionCategories" :key="category.key" :value="category.key">{{ category.label }}</option>
              </select>
            </div>
            <div class="subscription-source-list">
              <button
                v-for="source in visibleSourceCatalog"
                :key="source.key"
                type="button"
                class="subscription-source"
                :class="{ 'is-active': draftSourceKeys.includes(source.key), 'is-core': source.priority === 'core' }"
                @click="toggleSource(source.key)"
              >
                <span>{{ source.platform || source.label }}</span>
                <small>{{ source.label }} · {{ categoryListText(source.categories) }}</small>
              </button>
            </div>
          </div>
        </aside>

        <main class="hotspot-feed signal-feed">
          <div class="hotspot-section-head">
            <div>
              <p class="hotspot-kicker">Signals</p>
              <h2>热点信号流</h2>
            </div>
            <span>{{ filteredItems.length }} 条匹配 · {{ activeCategoryLabel }}</span>
          </div>

          <div v-if="isLoading" class="hotspot-skeleton-list">
            <div v-for="index in 6" :key="index" class="hotspot-skeleton"></div>
          </div>

          <div v-else-if="!filteredItems.length" class="hotspot-empty">
            <strong>当前订阅或筛选下没有热点</strong>
            <p>可以开启更多来源，或者点击刷新订阅雷达让后台重新抓取。</p>
          </div>

          <article
            v-for="item in filteredItems"
            v-else
            :key="item.id"
            class="hotspot-card"
            :class="[`score-${scoreTone(item)}`, { 'is-selected': selectedHotspot?.id === item.id }]"
            @click="selectHotspot(item)"
          >
            <div class="card-rank">
              <span>#{{ item.rank }}</span>
              <strong>{{ item.signalScore || 0 }}</strong>
            </div>
            <div class="hotspot-card-main">
              <div class="hotspot-card-meta">
                <span>{{ item.sourcePlatform }}</span>
                <span>{{ categoryLabel(item.category || (item.categories || [])[0]) }}</span>
                <span>#{{ item.rank }}</span>
                <span>{{ item.heatTierLabel || item.heatTier || '热度' }}</span>
                <span>{{ item.heatText || '热度待解析' }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary || item.angle }}</p>
              <div class="hotspot-tags">
                <span v-for="keyword in item.keywords" :key="keyword">{{ keyword }}</span>
              </div>
              <div class="hotspot-guidance">
                <div>
                  <small>适合发布</small>
                  <div class="hotspot-guidance-tags">
                    <span v-for="platform in item.recommendedPlatforms || []" :key="platform.platform">{{ platform.platform }}</span>
                  </div>
                </div>
                <p>{{ item.platformAdvice }}</p>
                <strong>{{ item.primaryTitleAngle || (item.titleAngles || [])[0] || item.angle }}</strong>
              </div>
            </div>
            <div class="hotspot-card-side" @click.stop>
              <span class="score-label">{{ scoreLabel(item) }}</span>
              <a :href="item.url" target="_blank" rel="noreferrer">来源</a>
              <button type="button" :disabled="savingHotspotId === item.id" @click="saveAsTopic(item)">
                {{ savingHotspotId === item.id ? '转入中' : '转选题' }}
              </button>
            </div>
          </article>
        </main>

        <aside class="topic-lab" :class="{ 'is-open': Boolean(selectedHotspot) }">
          <div v-if="selectedHotspot" class="topic-lab-card">
            <button type="button" class="panel-close" aria-label="关闭热点分析" @click="closeHotspot">×</button>
            <p class="hotspot-kicker">Topic Lab</p>
            <h2>{{ selectedHotspot.title }}</h2>
            <div class="lab-score-row">
              <div>
                <span>信号分</span>
                <strong>{{ selectedHotspot.signalScore || 0 }}</strong>
              </div>
              <div>
                <span>热度层级</span>
                <strong>{{ selectedHotspot.heatTierLabel || selectedHotspot.heatTier || '待判断' }}</strong>
              </div>
            </div>
            <section class="lab-section">
              <h3>为什么值得看</h3>
              <ul>
                <li v-for="reason in selectedHotspotReasons" :key="reason">{{ reason }}</li>
              </ul>
            </section>
            <section class="lab-section">
              <h3>适合发布</h3>
              <div class="platform-grid">
                <span v-for="platform in selectedHotspot.recommendedPlatforms || []" :key="platform.platform">
                  {{ platform.platform }}
                  <small>{{ platform.reason }}</small>
                </span>
              </div>
              <p>{{ selectedHotspot.platformAdvice || '根据内容深度决定发布平台。' }}</p>
            </section>
            <section class="lab-section">
              <h3>标题角度</h3>
              <button
                v-for="angle in selectedTitleAngles"
                :key="angle"
                type="button"
                class="angle-button"
                @click="copyAngle(angle)"
              >
                {{ angle }}
              </button>
            </section>
            <section class="lab-section">
              <h3>风险提醒</h3>
              <p>{{ selectedRiskNote }}</p>
            </section>
            <div class="lab-actions">
              <a :href="selectedHotspot.url" target="_blank" rel="noreferrer">打开来源</a>
              <button type="button" :disabled="savingHotspotId === selectedHotspot.id" @click="saveAsTopic(selectedHotspot)">
                {{ savingHotspotId === selectedHotspot.id ? '转入中' : '转入内容创作' }}
              </button>
            </div>
          </div>
          <div v-else class="topic-lab-empty">
            <p class="hotspot-kicker">Topic Lab</p>
            <strong>选择一条热点，查看选题判断</strong>
            <span>这里会展示推荐平台、标题角度、风险提醒和转选题入口。</span>
          </div>
        </aside>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import {
  createCreatorItem,
  getHotspotRadarSummary,
  getHotspotSubscriptions,
  refreshHotspotRadarSummary,
  updateHotspotSubscriptions
} from '@/api/creator.js'
import { useToast } from '@/composables/useToast'
import { trackWorkbenchEvent } from '@/api/workspace.js'

const DEFAULT_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'general', label: '综合' },
  { key: 'tech', label: '科技' },
  { key: 'preview', label: '预览' },
  { key: 'finance', label: '财经' },
  { key: 'dev', label: '开发' },
  { key: 'briefing', label: '简报' },
  { key: 'ai', label: 'AI' }
]

const CORE_CATEGORIES = ['ai', 'tech', 'dev', 'briefing']

const { success, error } = useToast()
const summary = ref({})
const items = ref([])
const sources = ref([])
const sourceCatalog = ref([])
const subscriptionCategories = ref(DEFAULT_CATEGORIES.filter((category) => category.key !== 'all'))
const draftMode = ref('custom')
const draftCategories = ref([...CORE_CATEGORIES])
const draftSourceKeys = ref([])
const sourceCatalogFilter = ref('core')
const isLoading = ref(false)
const isRefreshing = ref(false)
const isSavingSubscription = ref(false)
const errorMessage = ref('')
const activeSource = ref('all')
const activeCategory = ref('all')
const activeTier = ref('all')
const activeFit = ref('all')
const searchKeyword = ref('')
const sourceSearchKeyword = ref('')
const sourceCatalogCategory = ref('all')
const savingHotspotId = ref('')
const selectedHotspot = ref(null)

const createClientMutationId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const recordHotspotEvent = async (eventType, payload = {}) => {
  try {
    await trackWorkbenchEvent({
      eventType,
      action: eventType.replace(/^workspace\\.hotspot_radar\\./, '').replace(/^hotspot\\./, ''),
      clientMutationId: createClientMutationId(eventType.replace(/[^a-z0-9_]+/gi, '_')),
      payload,
      metadata: { page: 'hotspot_radar' }
    })
  } catch (_error) {
    // 埋点失败不能影响用户继续看热点或转选题。
  }
}

const categoryTabs = computed(() => {
  const list = Array.isArray(summary.value.categories) && summary.value.categories.length
    ? summary.value.categories
    : DEFAULT_CATEGORIES
  return list
})

const categoryMap = computed(() => Object.fromEntries(categoryTabs.value.map((item) => [item.key, item.label])))
const categoryLabel = (key) => categoryMap.value[key] || key || '综合'
const activeCategoryLabel = computed(() => (activeCategory.value === 'all' ? '全部板块' : categoryLabel(activeCategory.value)))
const subscribedSources = computed(() => sources.value.filter((source) => source.subscribed !== false))
const subscribedSourceCount = computed(() => subscribedSources.value.length || summary.value.sourceCount || 0)
const totalSourceCount = computed(() => summary.value.totalSourceCount || sources.value.length || sourceCatalog.value.length || 0)
const prefilledSnapshotCount = computed(() => summary.value.discovery?.prefilledSnapshotCount || 0)
const discoveryText = computed(() => {
  const discovery = summary.value.discovery || {}
  if (discovery.discoveredCount) return `已发现 ${discovery.discoveredCount} 个 Tophub 来源`
  return '低关注渠道可按需开启'
})
const selectedCategoryCount = computed(() => draftMode.value === 'all' ? subscriptionCategories.value.length : draftCategories.value.length)
const selectedSourceCount = computed(() => draftMode.value === 'all' ? sourceCatalog.value.length : draftSourceKeys.value.length)
const highHeatCount = computed(() => items.value.filter((item) => ['boom', 'high'].includes(item.heatTier)).length)
const contentFitOptions = computed(() => {
  const fits = new Set()
  items.value.forEach((item) => (item.contentFit || []).forEach((fit) => fits.add(fit)))
  return Array.from(fits)
})
const visibleSourceCatalog = computed(() => {
  const keyword = sourceSearchKeyword.value.toLowerCase()
  const base = sourceCatalog.value.length ? sourceCatalog.value : sources.value
  return base.filter((source) => {
    const categories = source.categories || [source.category || 'general']
    if (sourceCatalogFilter.value === 'core' && !(source.priority === 'core' || categories.some((category) => CORE_CATEGORIES.includes(category)))) return false
    if (sourceCatalogCategory.value !== 'all' && !categories.includes(sourceCatalogCategory.value)) return false
    if (keyword) {
      const haystack = [
        source.label,
        source.platform,
        source.summary,
        source.sourceType,
        ...categories.map((category) => categoryLabel(category))
      ].join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
})
const subscriptionModeText = computed(() => {
  if (draftMode.value === 'all') return '当前临时查看全量来源，保存后每日也会按全量源展示。'
  const labels = draftCategories.value.map((key) => categoryLabel(key)).join('、')
  return labels ? `每日优先更新：${labels}` : '请选择至少一个板块或来源。'
})
const lastUpdatedText = computed(() => {
  if (!summary.value.updatedAt) return '等待首次同步'
  return `更新于 ${formatDateTime(summary.value.updatedAt)}`
})
const filteredItems = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return items.value.filter((item) => {
    if (activeSource.value !== 'all' && item.sourceKey !== activeSource.value) return false
    if (activeCategory.value !== 'all' && !(item.categories || [item.category || 'general']).includes(activeCategory.value)) return false
    if (activeTier.value !== 'all' && item.heatTier !== activeTier.value) return false
    if (activeFit.value !== 'all' && !(item.contentFit || []).includes(activeFit.value)) return false
    if (keyword) {
      const haystack = [
        item.title,
        item.summary,
        item.angle,
        item.sourcePlatform,
        ...(item.keywords || [])
      ].join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
})

const topSignal = computed(() => filteredItems.value[0] || items.value[0] || null)
const topSignalTitle = computed(() => topSignal.value?.title || '等待热点雷达同步')
const topSignalReason = computed(() => topSignal.value
  ? topSignal.value.primaryTitleAngle || topSignal.value.angle || '这条热点当前综合信号最高。'
  : '刷新后会展示最值得优先判断的一条热点。')
const radarBriefs = computed(() => {
  const interesting = ['ai', 'tech', 'dev', 'briefing', 'finance', 'preview']
  return interesting.map((key) => {
    const count = items.value.filter((item) => (item.categories || [item.category || 'general']).includes(key)).length
    return {
      key,
      label: categoryLabel(key),
      count,
      caption: key === 'ai' || key === 'dev' ? '核心赛道' : '辅助观察'
    }
  })
})
const selectedTitleAngles = computed(() => {
  const angles = selectedHotspot.value?.titleAngles || []
  if (angles.length) return angles
  return selectedHotspot.value?.primaryTitleAngle ? [selectedHotspot.value.primaryTitleAngle] : []
})
const selectedHotspotReasons = computed(() => {
  const item = selectedHotspot.value
  if (!item) return []
  const reasons = []
  if (Number(item.signalScore || 0) >= 80) reasons.push('综合信号分较高，适合优先进入选题判断。')
  if (['boom', 'high'].includes(item.heatTier)) reasons.push(`当前属于${item.heatTierLabel || '高热'}层级，传播窗口更短，需要快速判断。`)
  if ((item.categories || []).some((key) => CORE_CATEGORIES.includes(key))) reasons.push('命中 AI / 科技 / 开发 / 简报核心关注板块。')
  if ((item.recommendedPlatforms || []).length) reasons.push(`已匹配 ${item.recommendedPlatforms.map((platform) => platform.platform).slice(0, 3).join('、')} 等发布平台。`)
  return reasons.length ? reasons : ['这条热点适合作为补充观察，可以先收藏或转入选题池。']
})
const selectedRiskNote = computed(() => {
  const item = selectedHotspot.value
  if (!item) return ''
  if (item.sourceType === 'social') return '社交平台热点变化快，建议先核验事实来源，再做观点表达。'
  if (item.sourceType === 'search') return '搜索热度代表需求强，但不一定代表内容价值，需要结合受众判断。'
  if (item.heatTier === 'longtail') return '长尾热点适合做深度内容，不建议追求即时流量。'
  return '建议保留来源链接和关键事实，避免直接复述热点标题。'
})

const categoryListText = (categories = []) => {
  const labels = (Array.isArray(categories) ? categories : [])
    .map((key) => categoryLabel(key))
    .filter(Boolean)
  return labels.length ? labels.join(' / ') : '综合'
}

const scoreTone = (item) => {
  const score = Number(item?.signalScore || 0)
  if (score >= 86 || item?.heatTier === 'boom') return 'boom'
  if (score >= 72 || item?.heatTier === 'high') return 'high'
  if (score >= 56 || item?.heatTier === 'medium') return 'medium'
  return 'longtail'
}

const scoreLabel = (item) => {
  const tone = scoreTone(item)
  if (tone === 'boom') return '爆发信号'
  if (tone === 'high') return '高价值'
  if (tone === 'medium') return '可观察'
  return '长尾'
}

const selectHotspot = (item) => {
  selectedHotspot.value = item
}

const closeHotspot = () => {
  selectedHotspot.value = null
}

const copyAngle = async (angle) => {
  if (!angle) return
  try {
    await navigator.clipboard?.writeText(angle)
    success('标题角度已复制')
  } catch (_error) {
    success('标题角度已选中', { description: angle })
  }
}

const formatDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part) => String(part).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const applySubscriptionData = (data = {}) => {
  const subscription = data.subscription || {}
  draftMode.value = subscription.mode || 'custom'
  draftCategories.value = Array.isArray(subscription.categories) && subscription.categories.length
    ? [...subscription.categories]
    : [...CORE_CATEGORIES]
  draftSourceKeys.value = Array.isArray(subscription.sourceKeys) ? [...subscription.sourceKeys] : []
  subscriptionCategories.value = Array.isArray(data.categories) && data.categories.length
    ? data.categories
    : DEFAULT_CATEGORIES.filter((category) => category.key !== 'all')
  sourceCatalog.value = Array.isArray(data.sources) ? data.sources : []
}

const applyRadarData = (data = {}) => {
  summary.value = data || {}
  items.value = Array.isArray(data.items) ? data.items : []
  sources.value = Array.isArray(data.sources) ? data.sources : []
  if (!selectedHotspot.value && items.value.length) selectedHotspot.value = items.value[0]
  if (selectedHotspot.value && !items.value.some((item) => item.id === selectedHotspot.value.id)) {
    selectedHotspot.value = items.value[0] || null
  }
}

const toggleCategory = (key) => {
  draftMode.value = 'custom'
  draftCategories.value = draftCategories.value.includes(key)
    ? draftCategories.value.filter((item) => item !== key)
    : [...draftCategories.value, key]
}

const toggleSource = (key) => {
  draftMode.value = 'custom'
  draftSourceKeys.value = draftSourceKeys.value.includes(key)
    ? draftSourceKeys.value.filter((item) => item !== key)
    : [...draftSourceKeys.value, key]
}

const quickCoreSubscription = async () => {
  draftMode.value = 'custom'
  draftCategories.value = [...CORE_CATEGORIES]
  draftSourceKeys.value = []
  await saveSubscription()
}

const loadSubscriptions = async () => {
  const response = await getHotspotSubscriptions()
  if (response.success) {
    applySubscriptionData(response.data)
    return
  }
  errorMessage.value = response.error || '热点订阅加载失败'
}

const loadRadar = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const response = await getHotspotRadarSummary()
  isLoading.value = false
  if (!response.success) {
    errorMessage.value = response.error || '热点雷达加载失败'
    return
  }
  applyRadarData(response.data)
}

const saveSubscription = async () => {
  if (draftMode.value === 'custom' && !draftCategories.value.length && !draftSourceKeys.value.length) {
    error('订阅不能为空', { description: '至少选择一个板块或一个来源。' })
    return
  }
  isSavingSubscription.value = true
  const response = await updateHotspotSubscriptions({
    mode: draftMode.value,
    categories: draftCategories.value,
    sourceKeys: draftSourceKeys.value
  })
  isSavingSubscription.value = false
  if (!response.success) {
    error('订阅保存失败', { description: response.error || '请稍后重试' })
    return
  }
  applySubscriptionData(response.data)
  success('热点订阅已保存', { description: '雷达会按你的订阅重新加载。' })
  recordHotspotEvent('hotspot.subscription.update', {
    mode: draftMode.value,
    categories: draftCategories.value,
    sourceCount: draftSourceKeys.value.length
  })
  await loadRadar()
}

const refreshRadar = async () => {
  isRefreshing.value = true
  errorMessage.value = ''
  const response = await refreshHotspotRadarSummary()
  isRefreshing.value = false
  if (!response.success) {
    errorMessage.value = response.error || '热点雷达刷新失败'
    error('刷新失败', { description: errorMessage.value })
    return
  }
  applyRadarData(response.data)
  recordHotspotEvent('hotspot.radar.refresh', {
    itemCount: items.value.length,
    sourceCount: subscribedSourceCount.value
  })
  success('订阅雷达已刷新')
}

const saveAsTopic = async (item) => {
  if (!item?.title || savingHotspotId.value) return
  savingHotspotId.value = item.id
  const response = await createCreatorItem({
    type: 'topic',
    stage: 'research',
    title: item.primaryTitleAngle || item.title,
    body: [
      `原始热点：${item.title}`,
      item.summary || item.angle || '',
      item.platformAdvice ? `平台建议：${item.platformAdvice}` : '',
      (item.titleAngles || []).length ? `备选角度：${item.titleAngles.join(' / ')}` : ''
    ].filter(Boolean).join('\n'),
    sourceName: item.sourceLabel || item.sourcePlatform || '热点雷达',
    sourceUrl: item.url,
    sourcePublishedAt: item.fetchedAt || new Date().toISOString(),
    platform: item.recommendedPlatforms?.[0]?.platform || (item.contentFit || [])[0] || item.sourcePlatform || '',
    tags: item.keywords || [],
    metadata: {
      source: 'hotspot_radar',
      sourceKey: item.sourceKey,
      sourcePlatform: item.sourcePlatform,
      sourceRank: item.rank,
      sourceHeatText: item.heatText,
      sourceHeatValue: item.heatValue,
      heatTier: item.heatTier,
      heatTierLabel: item.heatTierLabel,
      signalScore: item.signalScore,
      hotLevel: item.heatBand,
      category: item.category || (item.categories || [])[0] || 'general',
      categories: item.categories || [],
      contentFit: item.contentFit || [],
      corePoint: item.angle || '',
      titleAngle: item.primaryTitleAngle || (item.titleAngles || [])[0] || '',
      titleAngles: item.titleAngles || [],
      recommendedPlatforms: item.recommendedPlatforms || [],
      platformAdvice: item.platformAdvice || '',
      originalUrl: item.url
    }
  })
  savingHotspotId.value = ''
  if (!response.success) {
    error('转入选题失败', { description: response.error || '请稍后重试' })
    return
  }
  recordHotspotEvent('hotspot.topic.convert', {
    hotspotId: item.id,
    title: item.title,
    sourceKey: item.sourceKey,
    sourcePlatform: item.sourcePlatform,
    heatTier: item.heatTier,
    signalScore: item.signalScore,
    creatorItemId: response.data?.id || null
  })
  success('已转入内容创作', { description: '这条热点已进入选题研究阶段。' })
}

onMounted(async () => {
  await loadSubscriptions()
  await loadRadar()
  recordHotspotEvent('workspace.hotspot_radar.view', {
    itemCount: items.value.length,
    sourceCount: subscribedSourceCount.value,
    totalSourceCount: totalSourceCount.value,
    activeCategory: activeCategory.value
  })
})
</script>

<style scoped>
.hotspot-page { display: grid; gap: 1.1rem; width: 100%; color: var(--workbench-text); }
.hotspot-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.3fr); gap: 1rem; align-items: stretch; border: 1px solid var(--workbench-border); border-radius: 1.5rem; background: radial-gradient(circle at top left, rgb(var(--workbench-accent-rgb) / 0.12), transparent 34%), var(--workbench-surface); padding: clamp(1.2rem, 3vw, 2rem); overflow: hidden; }
.hotspot-kicker { margin: 0; color: var(--workbench-text-muted); font-size: 0.68rem; font-weight: 850; letter-spacing: 0.18em; text-transform: uppercase; }
.hotspot-hero h1 { max-width: 14em; margin: 0.45rem 0 0; color: var(--workbench-text); font-size: clamp(2rem, 4.8vw, 4.3rem); font-weight: 860; line-height: 0.98; }
.hotspot-hero p { max-width: 58rem; margin: 1rem 0 0; color: var(--workbench-text-muted); font-size: 0.92rem; line-height: 1.8; }
.hotspot-hero-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.2rem; }
.hotspot-hero-actions button, .ghost-button, .hotspot-card-side button, .hotspot-card-side a, .hotspot-toolbar button, .hotspot-controls select, .hotspot-controls input, .source-filter-row button, .source-search-row input, .source-search-row select { min-height: 2.45rem; border: 1px solid var(--workbench-border); border-radius: 999px; background: var(--workbench-surface); color: var(--workbench-text); padding: 0 0.9rem; font-size: 0.76rem; font-weight: 850; }
.hotspot-hero-actions button:first-child, .hotspot-card-side button, .ghost-button { background: var(--workbench-text); color: var(--workbench-page); }
.hotspot-hero-panel { display: grid; align-content: space-between; min-height: 13rem; border: 1px solid var(--workbench-border); border-radius: 1.15rem; background: rgb(255 255 255 / 0.7); padding: 1rem; }
.hotspot-hero-panel span, .hotspot-metrics span, .hotspot-score span { color: var(--workbench-text-muted); font-size: 0.7rem; font-weight: 850; letter-spacing: 0.12em; text-transform: uppercase; }
.hotspot-hero-panel strong { color: var(--workbench-text); font-size: 3.5rem; line-height: 1; }
.hotspot-hero-panel small, .hotspot-hero-panel p { color: var(--workbench-text-muted); font-size: 0.72rem; line-height: 1.5; }
.hotspot-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
.hotspot-metrics article { display: grid; gap: 0.4rem; border: 1px solid var(--workbench-border); border-radius: 1.15rem; background: rgb(255 255 255 / 0.68); padding: 1rem; }
.hotspot-metrics strong { color: var(--workbench-text); font-size: 1.65rem; }
.hotspot-metrics small { color: var(--workbench-text-muted); font-size: 0.72rem; }
.hotspot-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.8rem; align-items: center; }
.hotspot-category-tabs, .hotspot-controls, .source-filter-row, .source-search-row { display: flex; align-items: center; gap: 0.45rem; }
.hotspot-category-tabs { overflow-x: auto; padding-bottom: 0.15rem; }
.hotspot-toolbar button, .source-filter-row button { flex: 0 0 auto; background: rgb(255 255 255 / 0.58); color: var(--workbench-text-muted); }
.source-search-row input { min-width: 0; width: 100%; border-radius: 0.8rem; background: rgb(255 255 255 / 0.72); font-weight: 700; }
.source-search-row select { width: 7.8rem; border-radius: 0.8rem; background: rgb(255 255 255 / 0.72); }
.hotspot-toolbar button.is-active, .source-filter-row button.is-active { background: var(--workbench-text); color: var(--workbench-page); }
.hotspot-controls input { width: min(18rem, 26vw); border-radius: 1rem; background: rgb(255 255 255 / 0.72); font-weight: 700; }
.hotspot-controls select { background: rgb(255 255 255 / 0.72); }
.hotspot-error { border: 1px solid rgb(254, 202, 202); border-radius: 1rem; background: rgb(254 242 242 / 0.9); color: rgb(185, 28, 28); padding: 0.9rem 1rem; font-size: 0.82rem; font-weight: 750; }
.hotspot-layout { display: grid; grid-template-columns: minmax(17rem, 0.3fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
.hotspot-subscription-panel, .hotspot-feed { display: grid; gap: 0.85rem; min-width: 0; }
.hotspot-subscription-panel { position: sticky; top: 1rem; border: 1px solid var(--workbench-border); border-radius: 1.25rem; background: rgb(255 255 255 / 0.64); padding: 1rem; }
.hotspot-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
.hotspot-section-head h2 { margin: 0.25rem 0 0; color: var(--workbench-text); font-size: 1.2rem; font-weight: 850; }
.hotspot-section-head span { color: var(--workbench-text-muted); font-size: 0.74rem; font-weight: 850; }
.subscription-mode-card, .subscription-block { display: grid; gap: 0.65rem; border: 1px solid var(--workbench-border); border-radius: 1rem; background: rgb(255 255 255 / 0.5); padding: 0.85rem; }
.subscription-mode-card label { display: flex; align-items: center; gap: 0.55rem; color: var(--workbench-text); font-size: 0.78rem; font-weight: 800; }
.subscription-block-head { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; }
.subscription-block-head strong { color: var(--workbench-text); font-size: 0.82rem; }
.subscription-block-head small { color: var(--workbench-text-muted); font-size: 0.68rem; font-weight: 800; }
.subscription-chip-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.subscription-chip-grid button { border: 1px solid var(--workbench-border); border-radius: 999px; background: var(--workbench-surface-muted); color: var(--workbench-text-muted); padding: 0.5rem 0.7rem; font-size: 0.72rem; font-weight: 850; }
.subscription-chip-grid button.is-active { background: rgb(var(--workbench-accent-rgb) / 0.16); border-color: rgb(var(--workbench-accent-rgb) / 0.4); color: var(--workbench-text); }
.subscription-source-list { display: grid; gap: 0.45rem; max-height: 26rem; overflow: auto; padding-right: 0.2rem; }
.subscription-source { cursor: pointer; display: grid; gap: 0.25rem; text-align: left; border: 1px solid var(--workbench-border); border-radius: 0.9rem; background: rgb(255 255 255 / 0.5); padding: 0.72rem; }
.subscription-source span { color: var(--workbench-text); font-size: 0.78rem; font-weight: 850; }
.subscription-source small { color: var(--workbench-text-muted); font-size: 0.66rem; line-height: 1.45; }
.subscription-source.is-active { border-color: rgb(var(--workbench-accent-rgb) / 0.46); background: rgb(var(--workbench-accent-rgb) / 0.13); }
.subscription-source.is-core span::after { content: ' 核心'; color: rgb(var(--workbench-accent-rgb)); font-size: 0.62rem; }
.hotspot-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(8.5rem, 0.18fr); gap: 1rem; border: 1px solid var(--workbench-border); border-radius: 1.15rem; background: rgb(255 255 255 / 0.72); padding: 1rem; }
.hotspot-card-meta, .hotspot-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.hotspot-card-meta span, .hotspot-tags span { border-radius: 999px; background: var(--workbench-surface-muted); color: var(--workbench-text-muted); padding: 0.28rem 0.52rem; font-size: 0.65rem; font-weight: 800; }
.hotspot-card h3 { margin: 0.65rem 0 0; color: var(--workbench-text); font-size: clamp(1.02rem, 1.6vw, 1.32rem); font-weight: 840; line-height: 1.28; }
.hotspot-card p { margin: 0.55rem 0 0; color: var(--workbench-text-muted); font-size: 0.78rem; line-height: 1.65; }
.hotspot-tags { margin-top: 0.75rem; }
.hotspot-guidance { display: grid; gap: 0.45rem; margin-top: 0.95rem; padding: 0.85rem; border: 1px solid var(--workbench-border); border-radius: 1rem; background: rgba(255, 255, 255, 0.48); }
.hotspot-guidance small { color: var(--workbench-text-muted); font-size: 0.65rem; font-weight: 850; letter-spacing: 0.14em; text-transform: uppercase; }
.hotspot-guidance-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem; }
.hotspot-guidance-tags span { border-radius: 999px; background: var(--workbench-surface-muted); color: var(--workbench-text); padding: 0.24rem 0.46rem; font-size: 0.64rem; font-weight: 800; }
.hotspot-guidance p { margin: 0; color: var(--workbench-text-muted); font-size: 0.72rem; line-height: 1.55; }
.hotspot-guidance strong { color: var(--workbench-text); font-size: 0.78rem; line-height: 1.55; }
.hotspot-card-side { display: grid; gap: 0.55rem; align-content: start; }
.hotspot-score { display: grid; gap: 0.25rem; border: 1px solid var(--workbench-border); border-radius: 1rem; background: var(--workbench-surface-muted); padding: 0.8rem; }
.hotspot-score strong { color: var(--workbench-text); font-size: 1.55rem; line-height: 1; }
.hotspot-card-side a { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
.hotspot-skeleton-list { display: grid; gap: 0.75rem; }
.hotspot-skeleton { height: 8.5rem; border-radius: 1.15rem; background: linear-gradient(90deg, rgb(244 244 245 / 0.74), rgb(255 255 255 / 0.9), rgb(244 244 245 / 0.74)); background-size: 220% 100%; animation: hotspotPulse 1.15s ease-in-out infinite; }
.hotspot-empty { display: grid; gap: 0.45rem; border: 1px dashed var(--workbench-border); border-radius: 1.15rem; padding: 2rem; text-align: center; }
.hotspot-empty strong { color: var(--workbench-text); }
.hotspot-hero-actions button:active, .ghost-button:active, .hotspot-card-side button:active, .hotspot-card-side a:active, .hotspot-toolbar button:active, .subscription-chip-grid button:active, .subscription-source:active { transform: scale(0.98); }
button:disabled { cursor: not-allowed; opacity: 0.55; }
.dark .hotspot-hero-panel, .dark .hotspot-metrics article, .dark .hotspot-controls select, .dark .hotspot-controls input, .dark .source-search-row input, .dark .source-search-row select, .dark .hotspot-subscription-panel, .dark .subscription-mode-card, .dark .subscription-block, .dark .subscription-source, .dark .hotspot-card { background: rgb(24 24 27 / 0.62); }
.dark .hotspot-error { border-color: rgb(127 29 29 / 0.7); background: rgb(127 29 29 / 0.22); color: rgb(254 202 202); }
@keyframes hotspotPulse { 0% { background-position: 0 0; } 100% { background-position: -220% 0; } }
@media (max-width: 1100px) {
  .hotspot-hero, .hotspot-layout, .hotspot-toolbar { grid-template-columns: 1fr; }
  .hotspot-subscription-panel { position: static; }
  .hotspot-controls { flex-wrap: wrap; }
  .hotspot-controls input { width: 100%; }
}
@media (max-width: 720px) {
  .hotspot-page { gap: 0.95rem; }
  .hotspot-hero { border-radius: 1.35rem; padding: 1rem; }
  .hotspot-hero h1 { font-size: clamp(1.85rem, 13vw, 3.2rem); }
  .hotspot-metrics { grid-template-columns: 1fr 1fr; }
  .hotspot-card { grid-template-columns: 1fr; }
  .hotspot-card-side { grid-template-columns: 0.8fr 1fr 1fr; align-items: stretch; }
  .hotspot-card-side > * { min-width: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hotspot-hero-actions button, .ghost-button, .hotspot-card-side button, .hotspot-card-side a, .hotspot-toolbar button, .subscription-source, .hotspot-skeleton { transition: none; animation: none; }
}

/* Intelligence workbench upgrade */
.radar-hero { position: relative; background: radial-gradient(circle at 8% 8%, rgb(var(--workbench-accent-rgb) / 0.2), transparent 34%), linear-gradient(135deg, rgb(255 255 255 / 0.82), rgb(255 255 255 / 0.5)); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.62); }
.hero-orbit { position: absolute; right: -8rem; bottom: -10rem; width: 26rem; height: 26rem; border-radius: 999px; background: repeating-radial-gradient(circle, rgb(var(--workbench-accent-rgb) / 0.18) 0 1px, transparent 1px 19px); opacity: 0.5; pointer-events: none; }
.hero-copy, .hero-intel-card { position: relative; z-index: 1; }
.hero-copy h1 { max-width: 12em; letter-spacing: -0.06em; text-wrap: balance; }
.hero-intel-card { border-color: rgb(var(--workbench-accent-rgb) / 0.28); background: linear-gradient(160deg, rgb(var(--workbench-accent-rgb) / 0.13), rgb(255 255 255 / 0.72)); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.64); }
.hero-intel-card strong { font-size: 1.12rem; line-height: 1.38; }
.hero-intel-card button { justify-self: start; min-height: 2.2rem; border: 0; border-radius: 999px; background: var(--workbench-text); color: var(--workbench-page); padding: 0 0.85rem; font-size: 0.72rem; font-weight: 850; }
.radar-command-grid article { font-variant-numeric: tabular-nums; }
.radar-insight-strip { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.6rem; }
.radar-insight-strip button { display: grid; gap: 0.24rem; text-align: left; border: 1px solid var(--workbench-border); border-radius: 1rem; background: rgb(255 255 255 / 0.52); color: var(--workbench-text); padding: 0.85rem; }
.radar-insight-strip button.is-active { border-color: rgb(var(--workbench-accent-rgb) / 0.42); background: rgb(var(--workbench-accent-rgb) / 0.13); }
.radar-insight-strip span { color: var(--workbench-text-muted); font-size: 0.7rem; font-weight: 850; }
.radar-insight-strip strong { font-size: 1.35rem; line-height: 1; }
.radar-insight-strip small { color: var(--workbench-text-muted); font-size: 0.66rem; }
.radar-workbench { grid-template-columns: minmax(17rem, 0.27fr) minmax(0, 1fr) minmax(19rem, 0.34fr); }
.source-console, .topic-lab-card, .topic-lab-empty { backdrop-filter: blur(16px); }
.signal-feed { display: grid; gap: 0.78rem; }
.hotspot-card { cursor: pointer; grid-template-columns: 4.2rem minmax(0, 1fr) minmax(7.5rem, 0.16fr); gap: 0.85rem; align-items: stretch; box-shadow: 0 18px 50px rgb(15 23 42 / 0.04); transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease; }
.hotspot-card:hover, .hotspot-card.is-selected { transform: translateY(-2px); border-color: rgb(var(--workbench-accent-rgb) / 0.4); background: rgb(255 255 255 / 0.84); }
.hotspot-card.score-boom { border-left: 4px solid rgb(239 68 68); }
.hotspot-card.score-high { border-left: 4px solid rgb(var(--workbench-accent-rgb)); }
.hotspot-card.score-medium { border-left: 4px solid rgb(245 158 11); }
.card-rank { display: grid; place-items: center; align-content: center; gap: 0.35rem; border-radius: 1rem; background: var(--workbench-surface-muted); font-variant-numeric: tabular-nums; }
.card-rank span { color: var(--workbench-text-muted); font-size: 0.7rem; font-weight: 850; }
.card-rank strong { color: var(--workbench-text); font-size: 1.45rem; line-height: 1; }
.score-label { justify-self: stretch; border-radius: 999px; background: rgb(var(--workbench-accent-rgb) / 0.12); color: var(--workbench-text); padding: 0.45rem 0.55rem; text-align: center; font-size: 0.68rem; font-weight: 850; }
.topic-lab { display: grid; min-width: 0; }
.topic-lab-card, .topic-lab-empty { position: sticky; top: 1rem; display: grid; gap: 0.85rem; border: 1px solid var(--workbench-border); border-radius: 1.25rem; background: rgb(255 255 255 / 0.64); padding: 1rem; }
.topic-lab-card { position: sticky; }
.topic-lab-card h2 { margin: 0.2rem 1.8rem 0 0; color: var(--workbench-text); font-size: 1.18rem; line-height: 1.35; text-wrap: pretty; }
.panel-close { position: absolute; top: 0.75rem; right: 0.75rem; width: 2rem; min-height: 2rem; border: 0; border-radius: 999px; background: var(--workbench-surface-muted); color: var(--workbench-text-muted); }
.lab-score-row { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 0.55rem; }
.lab-score-row div { display: grid; gap: 0.35rem; border-radius: 1rem; background: var(--workbench-surface-muted); padding: 0.78rem; }
.lab-score-row span { color: var(--workbench-text-muted); font-size: 0.68rem; font-weight: 850; letter-spacing: 0.12em; text-transform: uppercase; }
.lab-score-row strong { color: var(--workbench-text); font-size: 1.25rem; line-height: 1; }
.lab-section { display: grid; gap: 0.55rem; border-top: 1px solid var(--workbench-border); padding-top: 0.85rem; }
.lab-section h3 { margin: 0; color: var(--workbench-text); font-size: 0.86rem; font-weight: 860; }
.lab-section ul { display: grid; gap: 0.45rem; margin: 0; padding-left: 1rem; color: var(--workbench-text-muted); font-size: 0.75rem; line-height: 1.55; }
.platform-grid { display: grid; gap: 0.45rem; }
.platform-grid span, .angle-button { display: grid; gap: 0.25rem; border: 1px solid var(--workbench-border); border-radius: 0.86rem; background: rgb(255 255 255 / 0.48); color: var(--workbench-text); padding: 0.65rem; text-align: left; font-size: 0.76rem; font-weight: 850; }
.platform-grid small { color: var(--workbench-text-muted); font-size: 0.66rem; font-weight: 700; line-height: 1.45; }
.lab-actions { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 0.5rem; }
.lab-actions a, .lab-actions button { display: inline-flex; align-items: center; justify-content: center; min-height: 2.45rem; border: 1px solid var(--workbench-border); border-radius: 999px; text-decoration: none; font-size: 0.76rem; font-weight: 850; }
.lab-actions button { background: var(--workbench-text); color: var(--workbench-page); }
.topic-lab-empty { min-height: 18rem; align-content: center; text-align: center; }
.topic-lab-empty strong { color: var(--workbench-text); font-size: 1rem; }
.topic-lab-empty span, .lab-section p { color: var(--workbench-text-muted); font-size: 0.76rem; line-height: 1.65; }
.dark .radar-hero, .dark .hero-intel-card, .dark .radar-insight-strip button, .dark .topic-lab-card, .dark .topic-lab-empty, .dark .platform-grid span, .dark .angle-button { background: rgb(24 24 27 / 0.62); }
.dark .hotspot-card:hover, .dark .hotspot-card.is-selected { background: rgb(39 39 42 / 0.72); }
@media (max-width: 1280px) {
  .radar-workbench { grid-template-columns: minmax(16rem, 0.3fr) minmax(0, 1fr); }
  .topic-lab { position: fixed; inset: auto 1rem 1rem; z-index: 30; pointer-events: none; }
  .topic-lab-card { pointer-events: auto; max-height: min(78vh, 42rem); overflow: auto; box-shadow: 0 24px 80px rgb(15 23 42 / 0.18); }
  .topic-lab-empty { display: none; }
  .topic-lab:not(.is-open) { display: none; }
}
@media (max-width: 1100px) {
  .radar-insight-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .radar-insight-strip { grid-template-columns: 1fr 1fr; }
  .hotspot-card { grid-template-columns: 1fr; }
  .card-rank { grid-template-columns: auto auto; justify-content: space-between; padding: 0.65rem; }
  .hotspot-card-side { grid-template-columns: 0.8fr 1fr 1fr; align-items: stretch; }
  .lab-actions { grid-template-columns: 1fr; }
}

</style>


