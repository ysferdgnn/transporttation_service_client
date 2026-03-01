export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

let onForbidden = null
export function setForbiddenHandler(cb) {
  onForbidden = cb
}

async function request(path, options = {}) {
  const token = localStorage.getItem('authToken')

  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }

    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }

  if (response.status === 403) {
    if (typeof onForbidden === 'function') {
      onForbidden()
    }
    const error = new Error('Forbidden')
    error.status = 403
    throw error
  }

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const text = await response.text()
      message = text || message
    } catch {
      // ignore
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
}

