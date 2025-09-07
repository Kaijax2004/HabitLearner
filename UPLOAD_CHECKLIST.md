# HabitLearner 虚拟主机上传清单

## 📦 需要上传的文件

### 1. 网站文件（从 dist/ 文件夹）
```
✅ index.html
✅ favicon.ico
✅ favicon.svg
✅ favicon.png
✅ assets/ 文件夹（包含所有子文件）
```

### 2. 配置文件
```
✅ .htaccess  ← 重要！解决404问题
```

## 🎯 上传步骤

### 步骤1：构建项目
```bash
npm run build
```

### 步骤2：准备文件
- 复制 `dist/` 文件夹中的所有文件
- 复制 `.htaccess` 文件

### 步骤3：上传到虚拟主机
- 通过控制面板的文件管理器
- 或使用FTP客户端
- 上传到网站根目录（通常是 `public_html/` 或 `www/`）

## 🔍 上传后检查

### 文件结构应该是：
```
网站根目录/
├── index.html
├── favicon.ico
├── favicon.svg
├── favicon.png
├── .htaccess          ← 必须存在！
└── assets/
    ├── *.css
    ├── *.js
    └── *.svg
```

## 🧪 测试URL

上传完成后测试：
1. `https://habitlearner.cn/` - 应该显示登录页面
2. `https://habitlearner.cn/auth` - 应该显示登录页面（不是404）
3. `https://habitlearner.cn/dashboard` - 应该正常显示

## ⚠️ 重要提醒

- **必须上传 `.htaccess` 文件**，这是解决404错误的关键
- 确保文件上传到正确的根目录
- 如果仍有问题，检查虚拟主机是否支持URL重写功能
