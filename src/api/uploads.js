export const uploadImage = async (file, progressCallback) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (progressCallback) progressCallback(100)
      resolve({
        success: true,
        data: {
          url: reader.result,
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
      })
    }
    reader.onerror = () => reject(reader.error)
    reader.onprogress = (e) => {
      if (e.lengthComputable && progressCallback) {
        progressCallback(Math.floor((e.loaded * 100) / e.total))
      }
    }
    reader.readAsDataURL(file)
  })
}

export const uploadVideo = async (file, progressCallback) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    if (progressCallback) progressCallback(100)
    resolve({
      success: true,
      data: {
        url,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    })
  })
}

export const uploadAudio = async (file, progressCallback) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    if (progressCallback) progressCallback(100)
    resolve({
      success: true,
      data: {
        url,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    })
  })
}



