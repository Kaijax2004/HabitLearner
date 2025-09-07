# 🚀 HabitLearner 虚拟主机部署指南

## 📋 部署前准备

### 1. 构建生产版本
```bash
npm run build
```
构建完成后，`dist` 目录包含所有需要上传的文件。

### 2. 上传文件
将 `dist` 目录内的所有文件上传到虚拟主机的网站根目录（通常是 `public_html` 或 `www` 目录）。

## 🔧 虚拟主机配置

### Apache 服务器配置

#### 方法一：使用 .htaccess 文件（推荐）
1. 将项目根目录的 `.htaccess` 文件上传到网站根目录
2. 确保 Apache 启用了 `mod_rewrite` 模块
3. 确保 `.htaccess` 文件权限正确

#### 方法二：虚拟主机配置
在 Apache 虚拟主机配置中添加：
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/your/dist
    
    <Directory /path/to/your/dist>
        AllowOverride All
        Require all granted
        
        # SPA 路由支持
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Nginx 服务器配置

1. 将 `nginx.conf` 内容添加到您的 Nginx 配置中
2. 修改 `server_name` 为您的域名
3. 修改 `root` 路径为您的 dist 目录路径
4. 重新加载 Nginx 配置：`nginx -s reload`

## 📁 文件结构

上传后的目录结构应该是：
```
网站根目录/
├── index.html
├── assets/
│   ├── index-DQ-0ZviZ.js
│   ├── index-HlpBIgAo.css
│   ├── AuthView-C15MYAem.js
│   ├── BaseCard-CcaCJXhC.js
│   └── ... (其他资源文件)
└── .htaccess (Apache) 或 nginx.conf (Nginx)
```

## ⚠️ 常见问题解决

### 1. 白屏问题
**原因**: 通常是路由配置问题
**解决**: 
- 确保 `.htaccess` 文件正确上传
- 检查 Apache 是否启用了 `mod_rewrite`
- 确认所有文件都上传到了正确位置

### 2. 404 错误
**原因**: 直接访问子路由时出现 404
**解决**: 确保重写规则正确配置，所有请求都重定向到 `index.html`

### 3. 静态资源加载失败
**原因**: 路径问题或缓存问题
**解决**: 
- 检查文件路径是否正确
- 清除浏览器缓存
- 检查服务器 MIME 类型配置

### 4. 权限问题
**原因**: 文件权限不正确
**解决**: 
```bash
# 设置正确的文件权限
chmod 644 index.html
chmod 644 assets/*
chmod 644 .htaccess
```

## 🔍 调试步骤

### 1. 检查文件上传
- 确认 `index.html` 在网站根目录
- 确认 `assets` 目录及其内容完整上传
- 确认 `.htaccess` 文件存在

### 2. 检查服务器配置
- 确认 Apache 启用了 `mod_rewrite`
- 确认 `.htaccess` 文件被正确读取
- 检查服务器错误日志

### 3. 浏览器调试
- 打开浏览器开发者工具
- 查看 Console 是否有 JavaScript 错误
- 查看 Network 标签页检查资源加载情况

## 📞 技术支持

如果遇到问题，请检查：
1. 服务器错误日志
2. 浏览器控制台错误信息
3. 网络请求状态
4. 文件权限设置

## 🎯 部署检查清单

- [ ] 构建生产版本 (`npm run build`)
- [ ] 上传 `dist` 目录所有文件到网站根目录
- [ ] 上传 `.htaccess` 文件（Apache）或配置 Nginx
- [ ] 设置正确的文件权限
- [ ] 测试网站访问
- [ ] 测试路由跳转
- [ ] 测试静态资源加载
- [ ] 测试移动端访问
- [ ] 测试夜间模式切换
