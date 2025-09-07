# 🎨 HabitLearner Logo 自定义指南

## 📋 概述

我已经为您创建了一个统一的Logo管理系统，可以轻松替换所有页面中的logo样式。

## 🔧 如何替换您的自定义Logo

### 1. 准备您的Logo文件

将您的logo文件放在以下位置：
```
public/assets/logo.png    # 主要logo文件
public/assets/logo.svg    # 矢量logo文件（推荐）
```

**支持的格式：**
- ✅ PNG (.png)
- ✅ JPG (.jpg, .jpeg) 
- ✅ SVG (.svg) - **推荐**
- ✅ WebP (.webp)

### 2. 配置Logo设置

编辑 `src/config/logo.js` 文件：

```javascript
export const logoConfig = {
  // 启用自定义logo
  useCustomLogo: true,
  
  // 设置您的logo文件路径
  customLogoUrl: '/assets/logo.png', // 替换为您的logo文件名
  
  // 其他配置...
}
```

### 3. 不同尺寸的Logo

如果您有不同尺寸的logo文件，可以这样配置：

```javascript
// 在 src/config/logo.js 中
export function getLogoUrl(size = 'default') {
  if (!logoConfig.useCustomLogo) {
    return null
  }
  
  // 根据尺寸返回不同的logo文件
  const sizeMap = {
    small: '/assets/logo-small.png',
    default: '/assets/logo.png',
    large: '/assets/logo-large.png',
    xl: '/assets/logo-xl.png'
  }
  
  return sizeMap[size] || logoConfig.customLogoUrl
}
```

## 📍 Logo使用位置

Logo组件已经在以下位置使用：

### 1. 桌面端侧边栏
- **位置**: 左侧导航栏顶部
- **尺寸**: default (20x20px)
- **背景**: 蓝色圆角背景

### 2. 移动端导航栏
- **位置**: 顶部导航栏左侧
- **尺寸**: default (20x20px)
- **背景**: 蓝色圆角背景

### 3. 认证页面 - 桌面端
- **位置**: 左侧品牌展示区域
- **尺寸**: xl (48x48px)
- **背景**: 半透明白色背景

### 4. 认证页面 - 移动端
- **位置**: 表单上方
- **尺寸**: large (32x32px)
- **背景**: 蓝色圆角背景

## 🎯 快速替换步骤

### 方法1：使用单个Logo文件（推荐）

1. **上传您的logo文件**到 `public/assets/` 目录
2. **修改配置**：
   ```javascript
   // src/config/logo.js
   customLogoUrl: '/assets/your-logo.png'
   ```
3. **重新构建**：
   ```bash
   npm run build:prod
   ```
4. **上传到服务器**

### 方法2：使用多个尺寸的Logo文件

1. **准备不同尺寸的logo文件**：
   ```
   public/assets/
   ├── logo-small.png    (16x16)
   ├── logo.png          (20x20)
   ├── logo-large.png    (32x32)
   └── logo-xl.png       (48x48)
   ```

2. **修改配置函数**：
   ```javascript
   // src/config/logo.js
   export function getLogoUrl(size = 'default') {
     const sizeMap = {
       small: '/assets/logo-small.png',
       default: '/assets/logo.png',
       large: '/assets/logo-large.png',
       xl: '/assets/logo-xl.png'
     }
     return sizeMap[size] || '/assets/logo.png'
   }
   ```

## 🔍 测试和验证

### 1. 本地测试
```bash
npm run dev
```
访问 `http://localhost:3000` 检查logo是否正确显示

### 2. 生产环境测试
```bash
npm run build:prod
npm run preview
```
访问预览地址检查logo

### 3. 部署后验证
访问 `https://habitlearner.cn/` 检查所有页面的logo

## ⚠️ 注意事项

### 1. 文件路径
- 确保logo文件路径正确
- 使用相对路径 `/assets/logo.png`
- 不要使用绝对路径

### 2. 文件大小
- 建议logo文件大小 < 100KB
- 使用SVG格式可以获得最佳效果
- 避免过大的图片文件

### 3. 兼容性
- SVG格式支持最好
- PNG格式兼容性最佳
- 避免使用过新的图片格式

## 🎨 设计建议

### 1. Logo设计原则
- **简洁明了**: 在小尺寸下仍然清晰可见
- **品牌一致**: 与整体设计风格保持一致
- **高对比度**: 确保在深色和浅色背景下都清晰

### 2. 尺寸建议
- **16x16px**: 用于小图标
- **20x20px**: 用于导航栏
- **32x32px**: 用于移动端
- **48x48px**: 用于大尺寸显示

### 3. 颜色建议
- 使用单色或简单配色
- 确保在蓝色背景上清晰可见
- 考虑深色模式下的显示效果

## 🚀 部署清单

替换logo后的部署步骤：

- [ ] 上传logo文件到 `public/assets/` 目录
- [ ] 修改 `src/config/logo.js` 配置
- [ ] 本地测试logo显示效果
- [ ] 构建生产版本 (`npm run build:prod`)
- [ ] 上传新的 `dist` 目录到服务器
- [ ] 验证所有页面的logo显示

现在您可以轻松地使用自己的logo替换所有页面中的默认图标了！🎉
