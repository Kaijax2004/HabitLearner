import api from './index.js'

// 获取分类列表
export const getCategories = async () => {
  try {
    console.log('🔄 调用后端API获取分类列表...')
    const result = await api.get('/categories')
    console.log('✅ 获取分类列表响应:', result)
    return result
  } catch (error) {
    console.error('❌ 获取分类失败:', error)
    return { success: false, error: error.message || '获取分类失败' }
  }
}

// 创建新分类
export const createCategory = async (categoryData) => {
  try {
    console.log('🔄 调用后端API创建分类:', categoryData)
    // 确保发送正确的数据格式
    const data = typeof categoryData === 'string' 
      ? { name: categoryData } 
      : categoryData
    
    const result = await api.post('/categories', data)
    console.log('✅ 创建分类响应:', result)
    return result
  } catch (error) {
    console.error('❌ 创建分类失败:', error)
    return { success: false, error: error.message || '创建分类失败' }
  }
}

// 删除分类
export const deleteCategory = async (id) => {
  try {
    console.log('🔄 调用后端API删除分类:', id)
    const result = await api.delete(`/categories/${id}`)
    console.log('✅ 删除分类响应:', result)
    return result
  } catch (error) {
    console.error('❌ 删除分类失败:', error)
    return { success: false, error: error.message || '删除分类失败' }
  }
}

// 获取图标列表
export const getIcons = async () => {
  try {
    console.log('🔄 调用后端API获取图标列表...')
    const result = await api.get('/icons')
    console.log('✅ 获取图标列表响应:', result)
    return result
  } catch (error) {
    console.error('❌ 获取图标失败:', error)
    return { success: false, error: error.message || '获取图标失败' }
  }
}

// 上传图标文件
export const uploadIcon = async (formData) => {
  try {
    console.log('🔄 调用后端API上传图标文件...')
    console.log('📤 FormData内容:', formData.get('file'))
    
    // 先尝试上传到 /icons/upload
    let result = await api.post('/icons/upload', formData)
    console.log('✅ 上传图标响应:', result)
    return result
  } catch (error) {
    console.error('❌ 上传图标失败:', error)
    
    // 如果 /icons/upload 失败，尝试直接上传到 /icons
    try {
      console.log('🔄 尝试备用上传方式...')
      const file = formData.get('file')
      if (file) {
        // 将文件转换为base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        
        const result = await api.post('/icons', {
          type: 'image',
          content: base64,
          filename: file.name,
          size: file.size
        })
        
        console.log('✅ 备用上传响应:', result)
        return result
      }
    } catch (fallbackError) {
      console.error('❌ 备用上传也失败:', fallbackError)
    }
    
    return { success: false, error: error.message || '上传失败' }
  }
}

// 创建文本图标
export const createIcon = async (iconData) => {
  try {
    console.log('🔄 调用后端API创建图标:', iconData)
    const result = await api.post('/icons', iconData)
    console.log('✅ 创建图标响应:', result)
    return result
  } catch (error) {
    console.error('❌ 创建图标失败:', error)
    return { success: false, error: error.message || '创建图标失败' }
  }
}

// 删除图标
export const deleteIcon = async (id) => {
  try {
    console.log('🔄 调用后端API删除图标:', id)
    const result = await api.delete(`/icons/${id}`)
    console.log('✅ 删除图标响应:', result)
    return result
  } catch (error) {
    console.error('❌ 删除图标失败:', error)
    return { success: false, error: error.message || '删除图标失败' }
  }
}

// 清空所有图标
export const clearAllIcons = async () => {
  try {
    console.log('🔄 调用后端API清空所有图标...')
    const result = await api.delete('/icons/clear')
    console.log('✅ 清空图标响应:', result)
    return result
  } catch (error) {
    console.error('❌ 清空图标失败:', error)
    return { success: false, error: error.message || '清空图标失败' }
  }
}
