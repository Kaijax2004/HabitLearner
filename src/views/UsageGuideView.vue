<template>
  <AppLayout title="使用教程" :showBackButton="true" :onBack="goBack">
    <main class="guide-page">
      <section class="guide-hero workbench-panel">
        <div class="guide-hero-copy">
          <p class="workbench-eyebrow">HabitLearner Manual</p>
          <h1>把“习知”用成你的个人工作台</h1>
          <p>
            这不是功能清单，而是一条使用路线：先收集，再判断，写成计划，安排执行，最后复盘进轨道。
            每天只围绕三个问题推进：今天最重要的是什么、现在做哪一步、结果如何沉淀。
          </p>
          <div class="guide-actions">
            <router-link class="workbench-primary" to="/dashboard">从今日开始</router-link>
            <router-link class="workbench-secondary" to="/plan">打开计划</router-link>
            <router-link class="workbench-secondary" to="/profile/ai-providers">配置 AI</router-link>
          </div>
        </div>
        <div class="guide-hero-card">
          <span>核心闭环</span>
          <ol>
            <li v-for="step in loopSteps" :key="step">{{ step }}</li>
          </ol>
        </div>
      </section>

      <section class="guide-layout">
        <aside class="guide-nav workbench-panel">
          <p class="workbench-eyebrow">Contents</p>
          <a v-for="section in guideSections" :key="section.id" :href="`#${section.id}`">
            {{ section.title }}
          </a>
        </aside>

        <div class="guide-content">
          <section id="quick-start" class="guide-section workbench-panel">
            <div class="guide-section-head">
              <p class="workbench-eyebrow">Quick Start</p>
              <h2>三分钟上手</h2>
            </div>
            <div class="guide-step-grid">
              <article v-for="item in quickStart" :key="item.title" class="guide-step-card">
                <span>{{ item.index }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <router-link :to="item.to">{{ item.action }}</router-link>
              </article>
            </div>
          </section>

          <section
            v-for="section in guideSections.filter((item) => item.id !== 'quick-start')"
            :id="section.id"
            :key="section.id"
            class="guide-section workbench-panel"
          >
            <div class="guide-section-head">
              <p class="workbench-eyebrow">{{ section.kicker }}</p>
              <h2>{{ section.title }}</h2>
              <p>{{ section.description }}</p>
            </div>

            <div class="guide-feature-list">
              <article v-for="feature in section.features" :key="feature.title" class="guide-feature-row">
                <div>
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                </div>
                <ul>
                  <li v-for="point in feature.points" :key="point">{{ point }}</li>
                </ul>
              </article>
            </div>

            <div v-if="section.links?.length" class="guide-link-row">
              <router-link
                v-for="link in section.links"
                :key="link.to"
                :to="link.to"
                class="workbench-secondary"
              >
                {{ link.label }}
              </router-link>
            </div>
          </section>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/profile')
}

const loopSteps = [
  '快速收集',
  '整理判断',
  '计划编辑',
  '安排执行',
  '习惯 / 专注 / 学习',
  '内容发布',
  '复盘沉淀',
  '轨道趋势'
]

const quickStart = [
  {
    index: '01',
    title: '先看今日',
    description: '今日页会告诉你当前状态、下一步行动、习惯打卡和今天的执行时间线。',
    action: '进入今日',
    to: '/dashboard'
  },
  {
    index: '02',
    title: '写一份计划',
    description: '计划页像文档编辑器一样组织正文、待办、标题、素材和执行属性。',
    action: '进入计划',
    to: '/plan'
  },
  {
    index: '03',
    title: '配置 AI 后再使用',
    description: 'AI 默认不请求远程。配置供应商和模型后，助手、计划 AI、学习 AI 会走同一套供应商逻辑。',
    action: '配置 AI',
    to: '/profile/ai-providers'
  },
  {
    index: '04',
    title: '把结果沉淀进轨道',
    description: '完成计划、专注、复盘和内容发布后，长期趋势会回到轨道里观察。',
    action: '查看轨道',
    to: '/tracks'
  }
]

const guideSections = [
  {
    id: 'quick-start',
    title: '三分钟上手',
    kicker: 'Quick Start',
    description: ''
  },
  {
    id: 'navigation',
    title: '导航结构',
    kicker: 'Navigation',
    description: '桌面端用左侧栏，手机端用底部核心导航和工作区抽屉。核心入口只保留今日、计划、轨道、我的。',
    links: [
      { label: '今日', to: '/dashboard' },
      { label: '计划', to: '/plan' },
      { label: '轨道', to: '/tracks' },
      { label: '我的', to: '/profile' }
    ],
    features: [
      {
        title: '核心导航',
        description: '适合每天高频打开，只回答当前应该做什么。',
        points: ['今日看状态和下一步', '计划写文档和安排执行', '轨道看长期趋势', '我的管理账户、AI、主题和声音']
      },
      {
        title: '工作区入口',
        description: '学习、专注、收集、复盘、洞察和内容创作不再抢一级导航。',
        points: ['桌面端在侧边栏工作区', '手机端点击底栏工作区', '控制中心也放在手机工作区抽屉里']
      }
    ]
  },
  {
    id: 'today',
    title: '今日驾驶舱',
    kicker: 'Today',
    description: '今日页是每天的第一站，重点不是统计，而是帮你判断现在该做哪一步。',
    links: [{ label: '打开今日', to: '/dashboard' }],
    features: [
      {
        title: 'Current Truth',
        description: '用一句话压缩你当前的状态和当天最重要的方向。',
        points: ['查看今日最重要行动', '处理今日时间线', '快速进入专注或复盘']
      },
      {
        title: '习惯与内容摘要',
        description: '右侧或下方展示习惯快捷打卡、内容创作进度、收集箱和复盘状态。',
        points: ['习惯可以直接打卡', '内容创作显示下一条该推进的内容', '收集箱提示待处理数量']
      }
    ]
  },
  {
    id: 'plan',
    title: '计划编辑器',
    kicker: 'Plan Editor',
    description: '计划页的目标是像 Notion 式文档一样写计划，再把计划块安排到今日执行。',
    links: [{ label: '打开计划', to: '/plan' }],
    features: [
      {
        title: '块编辑',
        description: '正文由块组成，可以使用标题、正文、待办、引用、图片、视频、分割线、数据库等块。',
        points: ['输入 / 打开命令菜单', 'Enter 创建下一块', '六点柄拖拽移动块', '待办块可同步执行状态']
      },
      {
        title: '执行面板',
        description: '右侧执行面管理状态、优先级、类型、截止日期、待安排池和今日时间线。',
        points: ['把计划块安排到今日', '从今日时间线完成或跳过', '手机端会优先保留正文可读性']
      },
      {
        title: 'AI 工作区',
        description: '计划页只保留一个 AI 工作区，问答、生图、生视频都在右侧或手机底部工作区处理。',
        points: ['文本结果先预览再写入', '生成图片可插入图片块', '生成视频可插入视频块', '未配置 AI 时不会请求远程']
      }
    ]
  },
  {
    id: 'ai',
    title: 'AI 供应商与技能',
    kicker: 'AI',
    description: '所有 AI 功能使用同一套用户供应商配置，不再有隐藏默认 Key 或本地假结果。',
    links: [
      { label: 'AI 供应商', to: '/profile/ai-providers' },
      { label: 'AI 技能', to: '/profile/ai-skills' }
    ],
    features: [
      {
        title: '供应商配置',
        description: '在我的页面配置 Base URL、协议、模型和 Key。默认供应商会被计划、今日、学习和助手共用。',
        points: ['支持 Responses API', '支持 Chat Completions', '模型列表在配置中心刷新', '未配置时提示需要配置']
      },
      {
        title: '技能系统',
        description: '内置 Improve writing、Proofread、Explain、Reformat，也可以上传自己的 SKILL.md。',
        points: ['技能只作为提示词和参考资料', '不会执行用户上传脚本', '结果需要确认后才写入计划']
      }
    ]
  },
  {
    id: 'capture-creator',
    title: '收集箱与内容创作',
    kicker: 'Creator Loop',
    description: '自媒体工作流从真实来源开始，先收集，再转成热点、选题、草稿和发布复盘。',
    links: [
      { label: '收集箱', to: '/captures' },
      { label: '内容创作', to: '/creator' }
    ],
    features: [
      {
        title: '收集箱',
        description: '所有灵感、链接、想法先进入收集箱，再决定保留、转化或归档。',
        points: ['收集可转计划', '收集可转热点或选题', '保留原始来源和处理历史']
      },
      {
        title: '内容创作',
        description: '内容条目包含标题、类型、阶段、来源、平台、目标用户、核心观点、钩子、发布链接和复盘。',
        points: ['列表视图适合日常管理', '流水线视图适合推进阶段', '内容可以创建关联计划', '写作中或制作中可以进入专注']
      }
    ]
  },
  {
    id: 'focus-learning',
    title: '专注与学习',
    kicker: 'Focus & Learning',
    description: '专注负责执行，学习负责输入。两者都可以回到计划、内容创作和轨道里沉淀。',
    links: [
      { label: '专注', to: '/focus' },
      { label: '学习', to: '/learning' }
    ],
    features: [
      {
        title: '专注工作区',
        description: '用于番茄钟和深度执行，开始、完成、结束会走统一声音设置。',
        points: ['可以从计划块启动', '可以从内容创作启动', '已有运行会话时不会重复创建']
      },
      {
        title: '学习内容',
        description: '学习材料和笔记可以作为内容选题、计划块、习惯实验或复盘问题。',
        points: ['课程和视频保持原入口', '学习输出建议转计划或内容', 'AI 未配置时不生成远程建议']
      }
    ]
  },
  {
    id: 'tracks-review',
    title: '轨道、复盘与洞察',
    kicker: 'Review',
    description: '轨道不是任务列表，而是长期趋势。复盘和完成记录会成为轨道证据。',
    links: [
      { label: '轨道', to: '/tracks' },
      { label: '复盘', to: '/review' },
      { label: '洞察', to: '/insights' }
    ],
    features: [
      {
        title: '轨道',
        description: '用于观察长期方向是否健康，比如内容创作、学习、健康或个人项目。',
        points: ['看今日状态', '看最近证据', '看长期趋势', '识别正在变弱的轨道']
      },
      {
        title: '复盘',
        description: '记录执行结果，沉淀经验，避免计划只是完成或未完成。',
        points: ['今日复盘回写轨道证据', '发布后记录内容数据', '失败原因比完成数量更重要']
      }
    ]
  },
  {
    id: 'profile',
    title: '我的与个性化',
    kicker: 'Control Center',
    description: '我的页面是控制中心，负责账户、安全、AI、外观、通知声音、宠物和数据出口。',
    links: [
      { label: '我的', to: '/profile' },
      { label: '外观主题', to: '/profile/appearance' },
      { label: '宠物设置', to: '/profile/pet-settings' }
    ],
    features: [
      {
        title: '外观与品牌',
        description: '可以调整强调色、背景图、背景模糊、表面透明度、圆角、密度和模式。',
        points: ['个性化只作用于 CSS 变量', '不会破坏编辑器可读性', '移动端继承同一套品牌风格']
      },
      {
        title: '通知与声音',
        description: '通知声音可以设置启用、音量、音色、免打扰和单事件试听。',
        points: ['支持完成、错误、专注开始、专注结束等事件', '全局静音后不播放', '浏览器限制时不阻塞页面']
      },
      {
        title: '数据安全',
        description: '头像、导出、隐私和密码修改都在我的页面集中管理。',
        points: ['头像会使用上传后的真实地址', '导出用于备份个人数据', '密码修改走后端接口校验']
      }
    ]
  },
  {
    id: 'mobile',
    title: '手机端使用方式',
    kicker: 'Mobile',
    description: '手机端不是少功能版，而是把桌面侧栏折叠为工作区抽屉。',
    features: [
      {
        title: '底部核心导航',
        description: '底栏保留今日、计划、轨道、我的和工作区，避免遮挡正文输入。',
        points: ['常用页面一键进入', '工作区抽屉包含完整功能', '页面底部预留安全区']
      },
      {
        title: '移动端编辑',
        description: '计划页手机端优先保证文档可读，AI 工作区以底部面板出现。',
        points: ['正文优先显示', 'AI 不覆盖底部按钮', '内容创作详情为全屏编辑抽屉']
      }
    ]
  }
]
</script>

<style scoped>
.guide-page {
  display: grid;
  gap: 1.2rem;
  padding-bottom: 2rem;
}

.guide-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: clamp(1rem, 2.4vw, 2rem);
  overflow: hidden;
  padding: clamp(1.25rem, 2.6vw, 2.4rem);
  background:
    radial-gradient(circle at 92% 14%, rgb(var(--workbench-accent-rgb) / 0.14), transparent 34%),
    var(--workbench-surface);
}

.guide-hero-copy h1 {
  max-width: 780px;
  margin-top: 0.65rem;
  color: var(--workbench-text);
  font-size: clamp(2rem, 5vw, 4.25rem);
  font-weight: 780;
  letter-spacing: -0.07em;
  line-height: 0.98;
}

.guide-hero-copy p:not(.workbench-eyebrow) {
  max-width: 720px;
  margin-top: 1rem;
  color: var(--workbench-text-muted);
  font-size: clamp(0.92rem, 1.3vw, 1.05rem);
  line-height: 1.85;
}

.guide-actions,
.guide-link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.2rem;
}

.guide-hero-card {
  align-self: stretch;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 1.25);
  background: rgb(255 255 255 / 0.54);
  padding: 1rem;
}

.dark .guide-hero-card {
  background: rgb(24 24 27 / 0.46);
}

.guide-hero-card span {
  color: var(--workbench-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.guide-hero-card ol {
  display: grid;
  gap: 0.45rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
}

.guide-hero-card li {
  border-bottom: 1px solid var(--workbench-border);
  color: var(--workbench-text);
  font-size: 0.9rem;
  font-weight: 680;
  padding: 0.48rem 0;
}

.guide-hero-card li:last-child {
  border-bottom: 0;
}

.guide-layout {
  display: grid;
  grid-template-columns: minmax(180px, 0.18fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.guide-nav {
  position: sticky;
  top: 6.4rem;
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
}

.guide-nav a {
  border-radius: 0.8rem;
  color: var(--workbench-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.55rem 0.65rem;
  transition: background var(--workbench-motion-duration) var(--workbench-ease), color var(--workbench-motion-duration) var(--workbench-ease);
}

.guide-nav a:hover {
  background: var(--workbench-surface-muted);
  color: var(--workbench-text);
}

.guide-content {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.guide-section {
  padding: clamp(1rem, 2vw, 1.7rem);
  scroll-margin-top: 6rem;
}

.guide-section-head {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.guide-section-head h2 {
  color: var(--workbench-text);
  font-size: clamp(1.35rem, 2.4vw, 2.2rem);
  font-weight: 760;
  letter-spacing: -0.05em;
}

.guide-section-head p:not(.workbench-eyebrow) {
  max-width: 760px;
  color: var(--workbench-text-muted);
  font-size: 0.88rem;
  line-height: 1.75;
}

.guide-step-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.guide-step-card,
.guide-feature-row {
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.9);
  background: var(--workbench-surface-muted);
}

.guide-step-card {
  display: grid;
  align-content: start;
  gap: 0.6rem;
  padding: 1rem;
}

.guide-step-card span {
  color: rgb(var(--workbench-accent-rgb));
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.16em;
}

.guide-step-card h3,
.guide-feature-row h3 {
  color: var(--workbench-text);
  font-size: 1rem;
  font-weight: 760;
  letter-spacing: -0.025em;
}

.guide-step-card p,
.guide-feature-row p,
.guide-feature-row li {
  color: var(--workbench-text-muted);
  font-size: 0.78rem;
  line-height: 1.65;
}

.guide-step-card a {
  align-self: end;
  color: var(--workbench-text);
  font-size: 0.78rem;
  font-weight: 800;
}

.guide-feature-list {
  display: grid;
  gap: 0.75rem;
}

.guide-feature-row {
  display: grid;
  grid-template-columns: minmax(0, 0.45fr) minmax(0, 0.55fr);
  gap: 1rem;
  padding: 1rem;
}

.guide-feature-row ul {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding-left: 1rem;
}

.guide-feature-row li::marker {
  color: rgb(var(--workbench-accent-rgb));
}

@media (max-width: 1100px) {
  .guide-step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .guide-hero,
  .guide-layout,
  .guide-feature-row {
    grid-template-columns: 1fr;
  }

  .guide-nav {
    position: static;
    display: flex;
    overflow-x: auto;
    padding: 0.65rem;
  }

  .guide-nav .workbench-eyebrow {
    display: none;
  }

  .guide-nav a {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

@media (max-width: 560px) {
  .guide-page {
    gap: 0.85rem;
  }

  .guide-hero {
    border-radius: 1.25rem;
    padding: 1rem;
  }

  .guide-hero-copy h1 {
    font-size: clamp(2rem, 12vw, 3.1rem);
  }

  .guide-step-grid {
    grid-template-columns: 1fr;
  }

  .guide-section {
    border-radius: 1.15rem;
    padding: 1rem;
  }

  .guide-actions .workbench-primary,
  .guide-actions .workbench-secondary,
  .guide-link-row .workbench-secondary {
    width: 100%;
  }
}
</style>
