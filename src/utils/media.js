const ABSOLUTE_MEDIA_RE = /^(data:|blob:|https?:\/\/|\/\/)/i

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || '/api'

const getAbsoluteBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost'

  try {
    return new URL(getApiBaseUrl(), window.location.origin).toString()
  } catch (error) {
    return window.location.origin + '/'
  }
}

export const isRenderableMediaUrl = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return !!trimmed && (ABSOLUTE_MEDIA_RE.test(trimmed) || trimmed.startsWith('/'))
}

export const resolveMediaUrl = (value) => {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  if (ABSOLUTE_MEDIA_RE.test(trimmed)) {
    return trimmed
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  if (typeof window === 'undefined') {
    return normalizedPath
  }

  try {
    return new URL(normalizedPath, getAbsoluteBaseUrl()).toString()
  } catch (error) {
    return normalizedPath
  }
}
