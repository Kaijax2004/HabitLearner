# 习知 HabitLearner

> 智能习惯养成平台，通过学+练模式帮助用户建立好习惯

## 🌟 项目简介

习知HabitLearner是一个帮助用户通过"学+练"模式养成好习惯的工具。核心是：选择一个习惯（如喝水、运动、英语学习），app提供每日微学习内容（短课、Tips）来指导，然后用追踪器记录实践。例如，用户选"每日阅读"，app推送5-10分钟的阅读技巧微课，并追踪打卡进度。

## ✨ 主要功能

### 🎯 习惯管理
- 创建和编辑习惯
- 习惯分类和图标自定义
- 每日/每周习惯追踪
- 习惯完成统计和图表

### 📚 微学习
- 每日微学习内容推荐
- 课程选择和视频学习
- 学习进度追踪
- 自定义学习内容上传

### 📊 数据统计
- 习惯完成率统计
- 连续打卡天数
- 学习进度分析
- 数据导出功能

### 👤 个人中心
- 用户资料管理
- 头像上传和用户名修改
- 密码修改和安全设置
- 通知和隐私设置

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式框架**: Tailwind CSS
- **图表库**: Recharts
- **HTTP客户端**: Axios

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境
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

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── AppLayout.vue   # 应用布局
│   ├── BaseCard.vue    # 基础卡片
│   ├── Logo.vue        # Logo组件
│   └── ...
├── views/              # 页面组件
│   ├── AuthView.vue    # 登录注册
│   ├── DashboardView.vue # 首页
│   ├── HabitFormView.vue # 习惯表单
│   ├── HabitDetailView.vue # 习惯详情
│   ├── LearningContentView.vue # 微学习
│   └── ProfileView.vue # 个人中心
├── stores/             # 状态管理
│   ├── auth.js         # 用户认证
│   ├── habit.js        # 习惯数据
│   └── theme.js        # 主题管理
├── router/             # 路由配置
└── assets/             # 静态资源
```

## 🎨 设计特色

### 视觉设计
- **配色方案**: 纯黑白科技感设计
- **设计风格**: 简约现代，Apple风格
- **响应式设计**: 完美适配桌面端和移动端
- **深色模式**: 支持明暗主题切换

### 交互体验
- **流畅动画**: 微交互动画提升用户体验
- **直观操作**: 符合用户习惯的交互设计
- **快速响应**: 优化的加载和渲染性能

## 📱 功能亮点

### 智能习惯追踪
- 支持每日/每周习惯设置
- 多维度完成统计
- 30天历史记录查看
- 习惯评论和备注功能

### 个性化学习
- 基于习惯的微学习推荐
- 课程分类和筛选
- 学习进度可视化
- 自定义内容上传

### 数据可视化
- 习惯完成率图表
- 连续打卡统计
- 学习进度分析
- 月度详细报告

## 🔧 配置说明

### 环境变量
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3000

# 生产环境
VITE_API_BASE_URL=https://habitlearner.cn
```

### 构建配置
- 代码分割和懒加载
- 静态资源优化
- 生产环境压缩
- CDN资源加速

## 📦 部署指南

### 服务器部署
1. 构建项目: `npm run build`
2. 上传 `dist` 文件夹到服务器
3. 配置 Nginx 支持 SPA 路由
4. 启用 HTTPS 和 CDN 加速

### GitHub Pages
1. 推送代码到 GitHub
2. 启用 GitHub Pages
3. 配置自定义域名
4. 自动部署更新

详细部署说明请参考 [deploy.md](./deploy.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- **项目地址**: https://github.com/yourusername/habitlearner
- **在线演示**: https://habitlearner.cn
- **问题反馈**: [Issues](https://github.com/yourusername/habitlearner/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**习知 HabitLearner** - 让习惯养成更科学高效 🚀