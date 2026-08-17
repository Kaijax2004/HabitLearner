// Logo 配置文件
// 在这里配置您的自定义logo

export const logoConfig = {
  // 是否启用自定义logo
  useCustomLogo: true,
  
  // 小尺寸图标，用于导航、通知、favicon 和桌面应用图标
  iconLogoUrl: '/favicon.png',

  // 主品牌锁定图，用于登录页、品牌展示和对外分享
  brandLogoUrl: '/HabitLearner.png',

  // 兼容旧调用：默认返回小图标，避免宽幅主品牌被塞进方形容器
  customLogoUrl: '/favicon.png',
  
  // 备用logo URL（如果主logo加载失败）
  fallbackLogoUrl: '/favicon.png',
  
  // 不同尺寸的logo配置
  sizes: {
    small: {
      width: '16px',
      height: '16px'
    },
    default: {
      width: '20px', 
      height: '20px'
    },
    large: {
      width: '32px',
      height: '32px'
    },
    xl: {
      width: '48px',
      height: '48px'
    }
  },
  
  // 支持的logo格式
  supportedFormats: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
  
  // 默认alt文本
  defaultAlt: 'HabitLearner Logo'
}

// 获取logo URL的辅助函数
export function getLogoUrl(size = 'default') {
  if (!logoConfig.useCustomLogo) {
    return null
  }
  
  // 这里可以根据尺寸返回不同的logo文件
  // 例如：logo-small.png, logo-large.png 等
  return logoConfig.customLogoUrl
}

export function getBrandLogoUrl() {
  return logoConfig.brandLogoUrl
}

export function getIconLogoUrl() {
  return logoConfig.iconLogoUrl
}

// 检查logo格式是否支持
export function isSupportedFormat(url) {
  if (!url) return false
  
  const extension = url.toLowerCase().substring(url.lastIndexOf('.'))
  return logoConfig.supportedFormats.includes(extension)
}
