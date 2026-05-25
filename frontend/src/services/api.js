const API_BASE = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
const SERVER_BASE = API_BASE.replace('/api', '')

export function getMediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SERVER_BASE}${path}`
}

const ACCESS_KEY = 'eduprimaire_access'
const REFRESH_KEY = 'eduprimaire_refresh'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function setTokens(tokens = {}) {
  const { access, refresh, access_token, refresh_token } = tokens
  const nextAccess = access || access_token
  const nextRefresh = refresh || refresh_token

  if (nextAccess) localStorage.setItem(ACCESS_KEY, nextAccess)
  if (nextRefresh) localStorage.setItem(REFRESH_KEY, nextRefresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

async function parseResponse(response) {
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  return { ok: response.ok, status: response.status, data }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Injecter X-School-Id si présent dans localStorage (pour l'impersonation par le superadmin)
  const impersonateSchoolId = localStorage.getItem('eduprimaire_impersonate_school_id')
  if (impersonateSchoolId) {
    headers.set('X-School-Id', impersonateSchoolId)
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const fetchOptions = {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body,
  }

  let response = await fetch(`${API_BASE}${path}`, fetchOptions)
  let { ok, status, data } = await parseResponse(response)

  // Si on reçoit un 401 et que ce n'est pas une tentative de login ou de refresh
  if (status === 401 && path !== '/auth/login/' && path !== '/token/refresh/') {
    const refresh = localStorage.getItem(REFRESH_KEY)

    if (!refresh) {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Session expirée')
    }

    if (!isRefreshing) {
      isRefreshing = true
      
      try {
        const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
        
        const refreshData = await refreshResponse.json()
        
        if (refreshResponse.ok) {
          setTokens(refreshData)
          isRefreshing = false
          onRefreshed(refreshData.access)
        } else {
          throw new Error('Refresh failed')
        }
      } catch (err) {
        isRefreshing = false
        clearTokens()
        window.location.href = '/login'
        throw new Error('Session expirée')
      }
    }

    // On attend que le refresh soit fini pour relancer la requête
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        headers.set('Authorization', `Bearer ${newToken}`)
        resolve(
          fetch(`${API_BASE}${path}`, { ...fetchOptions, headers })
            .then(res => parseResponse(res))
            .then(res => {
              if (!res.ok) {
                const message = res.data?.detail || res.data?.error || `Erreur API ${res.status}`
                throw new Error(message)
              }
              return res.data
            })
        )
      })
    })
  }

  if (!ok) {
    const message = data?.detail || data?.error || (typeof data === 'string' ? data : JSON.stringify(data)) || `Erreur API ${status}`
    throw new Error(message)
  }

  return data
}

export function list(path) {
  return apiRequest(path).then(data => Array.isArray(data) ? data : data?.results || [])
}

export function create(path, body) {
  return apiRequest(path, { method: 'POST', body })
}

export function update(path, body) {
  return apiRequest(path, { method: 'PATCH', body })
}

export function remove(path) {
  return apiRequest(path, { method: 'DELETE' })
}

export async function loginApi(email, password) {
  const data = await apiRequest('/auth/login/', { method: 'POST', body: { email, password } })
  setTokens(data)
  return data
}

export async function logoutApi() {
  const refresh = localStorage.getItem(REFRESH_KEY)
  try {
    if (refresh) await apiRequest('/auth/logout/', { method: 'POST', body: { refresh } })
  } finally {
    clearTokens()
  }
}

export async function downloadFile(path, filename) {
  const token = getAccessToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { headers })
  if (!response.ok) throw new Error('Téléchargement échoué')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'document.pdf'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
