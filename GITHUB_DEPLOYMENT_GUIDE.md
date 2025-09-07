# HabitLearner GitHub部署指南

## 🎉 恭喜！代码已准备就绪

您的代码已经成功提交到本地Git仓库，现在可以上传到GitHub了！

## 📋 上传到GitHub的步骤

### **方法1：直接上传（最简单）**

1. **登录GitHub** → 点击右上角 "+" → "New repository"
2. **仓库设置**：
   - Repository name: `HabitLearner` 或 `habitlearner-frontend`
   - Description: `习知HabitLearner - 智能习惯养成平台前端`
   - 选择 Public（公开）
   - ✅ 不要勾选 "Add a README file"
   - ✅ 不要勾选 "Add .gitignore"
   - ✅ 不要勾选 "Choose a license"
3. **点击 "Create repository"**
4. **上传文件**：
   - 点击 "uploading an existing file"
   - 拖拽以下文件夹和文件：
     ```
     ✅ src/ 文件夹
     ✅ public/ 文件夹
     ✅ package.json
     ✅ package-lock.json
     ✅ vite.config.js
     ✅ tailwind.config.js
     ✅ postcss.config.js
     ✅ index.html
     ✅ README.md
     ✅ .gitignore
     ```
5. **提交**：填写提交信息 "Initial commit" → 点击 "Commit changes"

### **方法2：使用Git命令行（推荐）**

1. **在GitHub创建仓库**（同上，但不要添加任何文件）
2. **复制仓库URL**（如：`https://github.com/yourusername/HabitLearner.git`）
3. **在项目目录运行**：
   ```bash
   git remote add origin https://github.com/yourusername/HabitLearner.git
   git branch -M main
   git push -u origin main
   ```

## 🚀 自动部署设置

### **GitHub Pages部署（免费）**

1. **进入仓库** → Settings → Pages
2. **Source**：选择 "GitHub Actions"
3. **创建部署文件**：在仓库根目录创建 `.github/workflows/deploy.yml`

### **部署配置文件**

创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 📁 需要上传的文件清单

### **核心文件（必须）**
```
📁 src/                    # 源代码
📁 public/                 # 静态资源
📄 package.json            # 项目配置
📄 package-lock.json       # 依赖锁定
📄 vite.config.js          # 构建配置
📄 tailwind.config.js      # 样式配置
📄 postcss.config.js       # CSS处理
📄 index.html              # 入口文件
📄 README.md               # 项目说明
📄 .gitignore              # Git忽略规则
```

### **可选文件**
```
📄 .github/workflows/deploy.yml  # 自动部署配置
📄 .htaccess                     # 服务器配置
```

### **不需要上传**
```
📁 node_modules/           # 依赖包（太大）
📁 dist/                   # 构建文件（自动生成）
📄 *.md                    # 部署文档（可选）
📄 *.conf                  # 服务器配置（可选）
📄 *.sh, *.bat             # 部署脚本（可选）
```

## 🔧 本地开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌐 部署后的访问

- **GitHub Pages**: `https://yourusername.github.io/HabitLearner`
- **自定义域名**: 在仓库Settings → Pages中设置

## 📝 项目说明

**HabitLearner** 是一个基于Vue.js 3的智能习惯养成平台，具有以下特性：

- 🎨 **Apple风格设计**：黑白极简配色，圆角阴影效果
- 🌙 **深色模式**：完整的明暗主题切换
- 📱 **响应式设计**：完美适配桌面和移动端
- 🎯 **习惯追踪**：支持每日/每周习惯，多维度数据分析
- 📚 **微学习内容**：集成学习模块，学+练模式
- 👤 **用户管理**：完整的注册登录和个人资料系统

## 🛠️ 技术栈

- **前端框架**: Vue.js 3 + Composition API
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP客户端**: Axios
- **图表库**: Recharts

现在您可以选择任一方法上传到GitHub，推荐使用方法1（直接上传）更简单！
