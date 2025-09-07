# HabitLearner 部署指南

## 🚀 部署到服务器

### 1. 构建项目
```bash
npm run build
```

### 2. 部署文件
将 `dist` 文件夹中的所有文件上传到服务器的网站根目录。

### 3. 服务器配置
确保服务器支持：
- SPA (Single Page Application) 路由
- HTTPS 支持
- 静态文件服务

### 4. Nginx 配置示例
```nginx
server {
    listen 80;
    server_name habitlearner.cn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name habitlearner.cn;
    
    root /var/www/habitlearner.cn;
    index index.html;
    
    # SSL 配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📦 GitHub 部署

### 1. 初始化 Git 仓库
```bash
git init
git add .
git commit -m "Initial commit: HabitLearner frontend"
```

### 2. 添加远程仓库
```bash
git remote add origin https://github.com/yourusername/habitlearner.git
```

### 3. 推送到 GitHub
```bash
git push -u origin main
```

### 4. GitHub Pages 部署
1. 在 GitHub 仓库设置中启用 Pages
2. 选择 `gh-pages` 分支或 `main` 分支的 `docs` 文件夹
3. 访问 `https://yourusername.github.io/habitlearner`

## 🔧 环境变量

### 生产环境配置
- 基础URL: `https://habitlearner.cn/`
- API地址: 根据后端部署情况配置
- 静态资源: 自动使用CDN加速

## 📋 部署检查清单

- [ ] 项目构建成功
- [ ] 所有静态资源正确加载
- [ ] 路由正常工作
- [ ] 响应式设计正常
- [ ] 深色模式正常切换
- [ ] 所有功能模块正常
- [ ] 性能优化完成
- [ ] SEO 配置正确

## 🎯 性能优化

- 代码分割和懒加载
- 静态资源压缩
- 图片优化
- 缓存策略
- CDN 加速

## 📞 技术支持

如有部署问题，请检查：
1. 服务器配置
2. 文件权限
3. 网络连接
4. 浏览器控制台错误
