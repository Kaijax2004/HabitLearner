const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const storage = typeof window !== 'undefined'
  ? window.localStorage
  : {
      _data: {},
      getItem(key) {
        return this._data[key] || null
      },
      setItem(key, value) {
        this._data[key] = String(value)
      },
      removeItem(key) {
        delete this._data[key]
      },
      clear() {
        this._data = {}
      }
    }

const getIsNewUser = () => !storage.getItem('hasLoggedInBefore')
const setIsNewUser = (value) => {
  if (value) storage.removeItem('hasLoggedInBefore')
  else storage.setItem('hasLoggedInBefore', 'true')
}
const hasCompletedOnboarding = () => storage.getItem('onboardingCompleted') === 'true'
const markOnboardingComplete = () => storage.setItem('onboardingCompleted', 'true')

const buildUrl = (url, params = {}) => {
  const normalizedUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const query = params?.params || params
  const cleanParams = Object.fromEntries(
    Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )

  if (!Object.keys(cleanParams).length) return normalizedUrl

  const separator = normalizedUrl.includes('?') ? '&' : '?'
  return `${normalizedUrl}${separator}${new URLSearchParams(cleanParams).toString()}`
}

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text ? { success: response.ok, data: text } : { success: response.ok }
  }
  return response.json()
}

const call = async (method, url, params = {}, body = null) => {
  const requestUrl = method === 'GET' || method === 'DELETE' ? buildUrl(url, params) : buildUrl(url)
  const headers = { Accept: 'application/json' }
  const token = storage.getItem('token')

  if (token) headers.Authorization = `Bearer ${token}`

  const config = { method, headers }

  if (body !== null && body !== undefined && method !== 'GET' && method !== 'DELETE') {
    if (body instanceof FormData) {
      config.body = body
    } else {
      headers['Content-Type'] = 'application/json'
      config.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(requestUrl, config)
    const data = await parseResponse(response)

    if (response.status === 401) {
      storage.removeItem('token')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `请求失败，状态码：${response.status}`,
        code: response.status,
        details: data
      }
    }

    if ((url.includes('/auth/login') || url.includes('/auth/register')) && data?.success && data?.data?.token) {
      storage.setItem('token', data.data.token)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: `网络请求失败：${error.message}`,
      code: 0
    }
  }
}

const api = {
  get: (url, params = {}) => call('GET', url, params),
  post: (url, data = null) => call('POST', url, {}, data),
  put: (url, data = null) => call('PUT', url, {}, data),
  patch: (url, data = null) => call('PATCH', url, {}, data),
  delete: (url, params = {}) => call('DELETE', url, params)
}

export const register = (userData) => api.post('/auth/register', userData)
export const login = (credentials) => api.post('/auth/login', credentials)

export default api
export { storage, getIsNewUser, setIsNewUser, hasCompletedOnboarding, markOnboardingComplete }
