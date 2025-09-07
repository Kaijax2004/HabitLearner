# 🚀 HabitLearner.cn 部署指南

## 🎯 针对 https://habitlearner.cn/ 的部署配置

### ✅ 问题已解决
您之前遇到的白屏问题确实是因为代码中配置的是本地开发端口3000，而实际部署域名是 `https://habitlearner.cn/`。

### 🔧 已修复的配置

#### 1. Vite配置优化
- ✅ 设置正确的 `base: '/'` 路径
- ✅ 优化生产环境构建配置
- ✅ 修复资源路径问题

#### 2. 路由配置修复
- ✅ 使用 `import.meta.env.BASE_URL` 确保路径正确
- ✅ 支持生产环境的History模式

### 📁 部署文件清单

现在需要上传到 `https://habitlearner.cn/` 的文件：

```
dist/ 目录内容：
├── index.html                    # 主页面文件
├── assets/                       # 静态资源目录
│   ├── index-Bob-vMHp.js        # 主应用文件
│   ├── vendor-CjtZyhqn.js       # 第三方库文件
│   ├── index-HlpBIgAo.css       # 样式文件
│   ├── DashboardView-CR7c-4RG.js
│   ├── AuthView-CohFu_mT.js
│   ├── HabitDetailView-BK5cZcMN.js
│   ├── BaseCard-D-lQxcrH.js
│   └── ... (其他组件文件)
└── .htaccess                     # Apache服务器配置
```

### 🚀 部署步骤

#### 1. 清理旧文件
```bash
# 删除虚拟主机上的旧文件
rm -rf /path/to/website/*
```

#### 2. 上传新文件
```bash
# 上传 dist 目录的所有内容到网站根目录
# 确保 index.html 在根目录
# 确保 assets 目录完整上传
```

#### 3. 上传配置文件
```bash
# 上传 .htaccess 文件到根目录
# 确保文件权限正确 (644)
```

### ⚙️ 服务器配置要求

#### Apache 服务器
确保启用了以下模块：
- ✅ `mod_rewrite` - 用于URL重写
- ✅ `mod_headers` - 用于安全头设置
- ✅ `mod_deflate` - 用于Gzip压缩

#### 检查 .htaccess 是否生效
```apache
# 测试重写规则
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 🔍 部署后测试

#### 1. 基础功能测试
- [ ] 访问 `https://habitlearner.cn/` - 应该显示登录页面
- [ ] 测试路由跳转 - 直接访问 `https://habitlearner.cn/dashboard`
- [ ] 检查静态资源加载 - 查看浏览器Network标签

#### 2. 功能测试
- [ ] 登录/注册功能
- [ ] 习惯管理功能
- [ ] 夜间模式切换
- [ ] 移动端适配

#### 3. 性能测试
- [ ] 页面加载速度
- [ ] 资源压缩效果
- [ ] 缓存策略生效

### 🐛 常见问题排查

#### 1. 仍然白屏
**检查项目：**
- 确认 `index.html` 在根目录
- 确认 `assets` 目录完整上传
- 检查浏览器控制台错误信息
- 确认 `.htaccess` 文件存在且权限正确

#### 2. 404错误
**检查项目：**
- 确认Apache启用了 `mod_rewrite`
- 检查 `.htaccess` 重写规则
- 确认服务器支持 `.htaccess` 文件

#### 3. 静态资源加载失败
**检查项目：**
- 确认文件路径正确
- 检查文件权限 (644)
- 确认MIME类型配置

### 📊 部署验证清单

- [ ] 构建生产版本 (`npm run build:prod`)
- [ ] 上传 `dist` 目录所有文件到根目录
- [ ] 上传 `.htaccess` 文件
- [ ] 设置正确文件权限
- [ ] 测试主页访问
- [ ] 测试路由跳转
- [ ] 测试静态资源加载
- [ ] 测试移动端访问
- [ ] 测试夜间模式
- [ ] 检查浏览器控制台无错误

### 🎯 预期结果

部署成功后，访问 `https://habitlearner.cn/` 应该：
1. ✅ 正常显示登录页面（不是白屏）
2. ✅ 所有静态资源正常加载
3. ✅ 路由跳转正常工作
4. ✅ 移动端和桌面端都正常显示
5. ✅ 夜间模式切换正常

### 📞 技术支持

如果部署后仍有问题，请提供：
1. 浏览器控制台错误信息
2. 服务器错误日志
3. 网络请求状态截图
4. 文件目录结构截图

现在按照这个配置重新部署，您的 `https://habitlearner.cn/` 应该就能正常访问了！🎉
