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


          <div class="guide-visual-strip" aria-label="产品作用图解">
            <article v-for="card in productStoryCards" :key="card.title">
              <span>{{ card.icon }}</span>
              <strong>{{ card.title }}</strong>
              <small>{{ card.description }}</small>
            </article>
          </div>
          <div class="guide-actions">
            <router-link class="workbench-primary" to="/dashboard">从今日开始</router-link>
            <router-link class="workbench-secondary" to="/plan">打开计划</router-link>
            <router-link class="workbench-secondary" to="/profile/ai-providers">配置 Mentor-X</router-link>
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
          <a href="#faq">常见问题</a>
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
      <section id="faq" class="guide-section workbench-panel">
        <div class="guide-section-head">
          <p class="workbench-eyebrow">FAQ</p>
          <h2>新用户常见疑问</h2>
          <p>把第一次使用最容易卡住的问题提前讲清楚，避免用户打开后不知道下一步。</p>
        </div>
        <div class="guide-faq-list">
          <article v-for="item in faqItems" :key="item.question">
            <h3>{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
          </article>
        </div>
      </section>    </main>
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



const productStoryCards = [
  {
    icon: '看',
    title: '看清真实状态',
    description: '今日页把计划、习惯、专注、收集和内容创作压缩成当前事实。'
  },
  {
    icon: '选',
    title: '选择最小下一步',
    description: '热点雷达、计划和 Mentor-X 都服务于一个目标：减少犹豫。'
  },
  {
    icon: '做',
    title: '进入真实执行',
    description: '通过今日三件事、日程块和专注，把想法推进成可验证结果。'
  },
  {
    icon: '复',
    title: '沉淀长期能力',
    description: '复盘和轨道把一次次完成记录沉淀成长期趋势。'
  }
]

const faqItems = [
  {
    question: '习知和普通待办软件有什么区别？',
    answer: '普通待办更像清单，习知更像个人工作台。它不仅记录任务，还把热点、选题、计划、专注、复盘和 Mentor-X 决策串起来，帮助你每天知道先做什么。'
  },
  {
    question: '我第一次进来应该先用哪个功能？',
    answer: '先从今日页开始。如果你已经有明确目标，就创建计划；如果你是创作者但不知道写什么，就打开热点雷达；如果你很乱，就直接问 Mentor-X 今天先做什么。'
  },
  {
    question: '热点雷达适合所有人吗？',
    answer: '最适合创作者、独立开发者、自媒体运营和需要持续观察趋势的人。它不是让你追热点，而是把高价值信号转成可以执行的选题。'
  },
  {
    question: 'Mentor-X 是不是一个模型？',
    answer: '不是。Mentor-X 是习知里的个人工作流智能体，外部模型只是推理引擎。真正的价值来自上下文、记忆、决策规则和确认执行工作流。'
  },
  {
    question: '为什么 Mentor-X 不能直接替我完成所有操作？',
    answer: '第一版坚持用户确认后再真实写入，避免 AI 编造完成、误删数据或越权操作。它可以建议和编排，但关键动作需要你确认。'
  },
  {
    question: '如果我只是想管理生活习惯，也能用吗？',
    answer: '可以。你可以只使用今日页、习惯、计划、专注和复盘。热点雷达和内容创作是给创作者的增强链路，不会强迫使用。'
  },
  {
    question: '我应该怎么反馈问题？',
    answer: '点击侧边栏或工作区里的反馈共创入口，加入微信群或关注公众号。早期共创用户的反馈会直接影响功能优先级。'
  }
]

const loopSteps = [
  '快速收集',
  '整理判断',
  '计划编辑',
  '安排执行',
  'Mentor-X 判断',
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
    title: '配置 Mentor-X',
    description: 'Mentor-X 不是模型本身。配置模型引擎后，它会把上下文、记忆、决策规则和确认执行网关编排起来。',
    action: '配置 Mentor-X',
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
        title: 'Mentor-X 工作区',
        description: '计划页只保留一个 Mentor-X 工作区，问答、生图、生视频都在右侧或手机底部工作区处理。',
        points: ['文本结果先预览再写入', '生成图片可插入图片块', '生成视频可插入视频块', '未配置模型引擎时不会请求远程']
      }
    ]
  },
  {
    id: 'ai',
    title: 'Mentor-X 智能体',
    kicker: 'Agent',
    description: 'Mentor-X 是习知里的个人工作流智能体，不替代模型，而是把模型、上下文、记忆、决策规则和真实执行动作编排成每天可用的行动系统。',
    links: [
      { label: 'Mentor-X 模型引擎', to: '/profile/ai-providers' },
      { label: 'Mentor-X 技能', to: '/profile/ai-skills' }
    ],
    features: [
      {
        title: '五层架构',
        description: '模型引擎只负责推理，Mentor-X 的灵魂来自产品自己的工作流内核。',
        points: ['模型引擎层：接入外部模型', 'Prompt 核心层：定义角色、边界和输出协议', '用户记忆层：读取偏好、模式和风险', '决策策略层：遵守你的长期原则', '工作流执行层：生成待确认动作并由后端真实写入']
      },
      {
        title: '确认执行',
        description: 'Mentor-X 可以提出动作，但不会越过你直接写入。每张动作卡会显示建议理由、上下文信号和执行状态。',
        points: ['安排到今天', '开始专注', '完成今日块', '收集转内容', '创建内容条目', '保存复盘']
      },
      {
        title: '模型引擎配置',
        description: '在我的页面配置 Base URL、协议、模型和 Key。默认模型引擎会被计划、今日、学习和 Mentor-X 工作区共用。',
        points: ['支持 Responses API', '支持 Chat Completions', '模型列表在配置中心刷新', '未配置时提示需要配置 Mentor-X 模型引擎']
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
        description: '计划页手机端优先保证文档可读，Mentor-X 工作区以底部面板出现。',
        points: ['正文优先显示', 'Mentor-X 不覆盖底部按钮', '内容创作详情为全屏编辑抽屉']
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
  border-radius: calc(var(--workbench-radius) * 1.02);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 46%, transparent), transparent 54%),
    var(--workbench-surface-muted);
  padding: 1rem;
  box-shadow: inset 0 1px 0 var(--workbench-glass-highlight);
  backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.72)) saturate(150%);
  -webkit-backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.72)) saturate(150%);
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
  border-radius: calc(var(--workbench-radius) * 0.82);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 42%, transparent), transparent 54%),
    var(--workbench-surface-muted);
  box-shadow: inset 0 1px 0 var(--workbench-glass-highlight);
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



.guide-visual-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1.2rem;
}

.guide-visual-strip article,
.guide-faq-list article {
  display: grid;
  gap: 0.42rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.78);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--workbench-glass-highlight) 48%, transparent), transparent 52%),
    var(--workbench-surface-muted);
  padding: 0.9rem;
  box-shadow: inset 0 1px 0 var(--workbench-glass-highlight);
  backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.62)) saturate(150%);
  -webkit-backdrop-filter: blur(calc(var(--workbench-backdrop-blur) * 0.62)) saturate(150%);
  transition: transform var(--workbench-motion-duration) var(--workbench-ease), border-color var(--workbench-motion-duration) var(--workbench-ease), box-shadow var(--workbench-motion-duration) var(--workbench-ease);
}

.guide-visual-strip article:hover,
.guide-faq-list article:hover {
  border-color: rgb(var(--workbench-accent-rgb) / 0.26);
  box-shadow:
    inset 0 1px 0 var(--workbench-glass-highlight),
    0 12px 30px color-mix(in srgb, var(--workbench-glass-shadow) 70%, transparent);
  transform: translateY(-2px);
}

.guide-visual-strip span {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 999px;
  background: var(--workbench-text);
  color: var(--workbench-page);
  font-size: 0.86rem;
  font-weight: 880;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
}

.guide-visual-strip strong,
.guide-faq-list h3 {
  margin: 0;
  color: var(--workbench-text);
  font-size: 0.92rem;
  font-weight: 820;
  line-height: 1.4;
}

.guide-visual-strip small,
.guide-faq-list p {
  margin: 0;
  color: var(--workbench-text-muted);
  font-size: 0.74rem;
  line-height: 1.65;
}

.guide-faq-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 1100px) {
  .guide-step-grid,
  .guide-visual-strip,
  .guide-faq-list {
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

  .guide-step-grid,
  .guide-visual-strip,
  .guide-faq-list {
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

