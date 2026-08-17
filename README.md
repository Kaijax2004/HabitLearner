# 习知 HabitLearner

面向创作者、知识工作者和自我管理者的 AI 个人工作台。

习知不是单一的习惯打卡工具，而是把快速收集、计划编辑、习惯执行、专注、学习、内容创作、复盘和长期轨道串起来的个人操作系统。它希望每天帮你回答三个问题：

- 今天最重要的事情是什么？
- 我现在应该执行哪一步？
- 这次执行结果如何沉淀？

在线访问：https://habitlearner.cn

## 产品定位

HabitLearner 将个人管理拆成一条清晰闭环：

```text
快速收集
  -> 整理判断
  -> 计划编辑
  -> 安排执行
  -> 习惯 / 专注 / 学习
  -> 内容发布
  -> 复盘沉淀
  -> 轨道与长期趋势
```

适合这些场景：

- 自媒体创作者管理热点、选题、脚本、发布和复盘。
- 知识工作者整理计划、学习笔记、行动块和长期项目。
- 自我管理者追踪习惯、番茄专注、每日复盘和成长轨道。
- 希望用统一 AI 供应商能力辅助写作、分析、提问和内容生成的用户。

## 核心功能

### 今日驾驶舱

- Current Truth 当前状态判断。
- 今日最重要的 1-3 个行动。
- 今日计划时间线。
- 习惯快捷打卡。
- 内容创作摘要。
- 收集箱待处理提醒。
- 今日复盘入口。
- 接下来 72 小时预览。

### Notion 式计划编辑器

- 块编辑体验。
- 页面树和文档大纲。
- 正文、标题、待办、引用、图片、视频、分割线、数据库等块。
- Slash 命令菜单。
- 块类型切换。
- 多块选择、拖拽排序和块合并。
- 自动保存、撤销和重做。
- 右侧执行面板：状态、优先级、类型、截止日期、待安排池、今日时间线。
- 手机端优先保证正文可读，AI 工作区和执行面板折叠为轻量入口。

### AI 工作区

- 所有文本 AI 统一到同一个问答工作区。
- 支持 AI 对话、新对话、历史对话、上下文记录和模型切换。
- 支持计划上下文压缩读取。
- 支持生图、生视频，并可把结果插入计划。
- 未配置 AI 时不请求远程供应商。
- 上游失败时展示真实错误信息。
- AI 结果默认先预览，用户确认后再写入计划或块。

### AI 供应商与技能

- 统一用户级 AI 供应商配置。
- 支持 OpenAI Responses API。
- 支持 Chat Completions 兼容协议。
- 支持 Base URL、模型、请求头和额外请求体配置。
- 支持模型列表拉取和默认模型选择。
- 支持内置技能：Improve writing、Proofread、Explain、Reformat。
- 支持上传自定义 `SKILL.md` 技能包。
- 用户技能只作为提示词和参考资料，不执行脚本。

### 内容创作工作台

- 热点、选题、研究、大纲、写作、制作、待发布、已发布、复盘。
- 列表视图优先，流水线视图辅助推进阶段。
- 内容条目支持标题、类型、阶段、来源、来源链接、来源时间、目标平台、目标用户、核心观点、开头钩子、内容大纲、发布时间、发布链接和复盘结论。
- 内容可创建关联计划。
- 写作中或制作中可进入专注工作区。

### 收集箱

- 快速收集灵感、链接、想法和待处理内容。
- 支持保留、转化、归档。
- 可转为计划、计划块、热点、选题、学习笔记、习惯备注、复盘问题和轨道沉淀。
- 转化为内容创作时保留原始来源和处理历史。

### 专注、学习、习惯和复盘

- 番茄钟和专注会话。
- 专注开始、结束、完成、错误等事件接入统一声音系统。
- 习惯创建、打卡、统计和管理。
- 学习内容、视频课程和学习笔记。
- 今日复盘回写长期轨道证据。

### 轨道与洞察

- 用轨道观察长期趋势，而不是只看单日任务。
- 支持轨道目标、状态、证据、复盘问题和趋势判断。
- 内容创作、学习、计划和习惯都可以沉淀到轨道。

### 品牌化与个性化

- 暖调黑白基础视觉。
- 低饱和强调色。
- 统一工作台 Token。
- 自定义强调色、背景图、背景模糊、表面透明度、圆角、密度和模式。
- 手机端采用核心底栏和工作区抽屉，完整保留桌面端能力。
- 通知与声音控制台支持事件音色、音量、试听、全局静音和免打扰。

## 技术栈

- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Tiptap
- Axios
- Cloudflare Pages

## 项目结构

```text
backend/
  index.html
  public/
    favicon.png
    HabitLearner.png
    robots.txt
    sitemap.xml
    site.webmanifest
  src/
    api/
    components/
    composables/
    config/
    router/
    stores/
    styles/
    utils/
    views/
      dashboard/
      plan/
      AuthView.vue
      DashboardView.vue
      PlanEditorView.vue
      CreatorWorkspaceView.vue
      ProfileView.vue
      UsageGuideView.vue
```

说明：当前仓库中 `backend/` 是 Vue 3 + Vite 前端源码目录。后端 API 在开发仓的 `frontend/` 目录中维护。

## 本地开发

### 环境要求

- Node.js 16+
- npm 8+

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 环境变量

常用配置：

```env
VITE_API_BASE_URL=https://api.habitlearner.cn/api
```

本项目不在前端仓库中提交真实 `.env` 文件。生产环境变量建议在 Cloudflare Pages 中配置。

## 部署

当前前端推荐使用 GitHub + Cloudflare Pages。

### Cloudflare Pages

推荐配置：

```text
Build command: npm run build
Build output directory: dist
Root directory: /
```

如果 Cloudflare Pages 项目直接绑定的是前端仓 `Kaijax2004/HabitLearner`，推送到 `main` 后会自动构建发布。

### SEO 与搜索展示

前端已包含：

- `favicon.ico`
- `favicon.png`
- `HabitLearner.png`
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- Open Graph / Twitter Card 元信息。
- WebApplication 结构化数据。

搜索引擎展示不会实时刷新。更新标题、描述和图标后，通常需要几天到几周重新抓取。

建议上线后在 Google Search Console 或百度搜索资源平台提交：

```text
https://habitlearner.cn/sitemap.xml
```

## 重要页面

- `/dashboard`：今日驾驶舱。
- `/plan`：计划列表。
- `/plan/:id`：计划编辑器。
- `/creator`：内容创作工作台。
- `/captures`：收集箱。
- `/focus`：专注工作区。
- `/learning`：学习内容。
- `/tracks`：长期轨道。
- `/profile`：个人控制中心。
- `/profile/ai-providers`：AI 供应商配置。
- `/profile/ai-skills`：AI 技能管理。
- `/profile/appearance`：外观与主题。
- `/guide`：使用教程。

## 设计原则

- 不用假数据伪造成功状态。
- AI 未配置时只提示配置，不请求远程。
- 结果先预览，用户确认后写入。
- 移动端不是功能缩水版，而是通过工作区抽屉承载完整入口。
- 编辑器优先保证内容可读和保存可靠。
- 视觉保持克制、清爽、品牌统一。

## 相关仓库

- 前端仓库：https://github.com/Kaijax2004/HabitLearner
- 后端 API 仓库：https://github.com/Kaijax2004/api.HabitLearner
- 开发整合仓库：https://github.com/Kaijax2004/yanfa.HabitLearner

## 反馈

如果发现功能问题、显示异常或搜索展示没有及时更新，可以在 GitHub Issues 中反馈：

https://github.com/Kaijax2004/HabitLearner/issues

---

习知 HabitLearner：知易行难，习以为常。
