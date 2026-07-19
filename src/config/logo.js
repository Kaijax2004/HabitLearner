// Logo 配置文件
// 在这里配置您的自定义logo

export const logoConfig = {
  // 是否启用自定义logo
  useCustomLogo: true,
  
  // 自定义logo URL - 用户自定义logo
  customLogoUrl: '/src/assets/logo.svg', // SVG版本，支持缩放
  
  // 备用logo URL（如果主logo加载失败）
  fallbackLogoUrl: '/assets/logo-fallback.png',
  
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

// 检查logo格式是否支持
export function isSupportedFormat(url) {
  if (!url) return false
  
  const extension = url.toLowerCase().substring(url.lastIndexOf('.'))
  return logoConfig.supportedFormats.includes(extension)
}
