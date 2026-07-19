import api from './index.js'

const uploadWithProgress = async (endpoint, file, progressCallback) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
      const url = `${API_BASE_URL}${endpoint}`

      xhr.open('POST', url)

      const token = localStorage.getItem('token')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && progressCallback) {
          progressCallback(Math.floor((e.loaded * 100) / e.total))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('无法解析响应'))
          }
        } else {
          reject(new Error(`上传失败: ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('网络错误'))
      xhr.send(formData)
    })
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const uploadImage = async (file, progressCallback) => {
  return uploadWithProgress('/uploads/image', file, progressCallback)
}

export const uploadVideo = async (file, progressCallback) => {
  return uploadWithProgress('/uploads/video', file, progressCallback)
}

export const uploadAudio = async (file, progressCallback) => {
  return uploadWithProgress('/uploads/audio', file, progressCallback)
}

export const uploadFile = async (file, progressCallback) => {
  return uploadWithProgress('/uploads/file', file, progressCallback)
}



