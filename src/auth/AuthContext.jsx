import { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/client'

const AuthContext = createContext(null)

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeRole(r) {
  const s = String(r ?? '').trim().toUpperCase()
  if (!s) return ''
  return s.replace(/^ROLE_/, '')
}

function hasAdminRole(role) {
  if (role == null || role === undefined) return false
  if (Array.isArray(role)) {
    return role.some((r) => normalizeRole(r) === 'ADMIN')
  }
  return normalizeRole(role) === 'ADMIN'
}

function isAdminFromUser(user) {
  if (!user) return false
  const role =
    user.role ??
    user.roles ??
    user.authority ??
    user.authorities ??
    user.userType ??
    user.type
  return hasAdminRole(role)
}

function isAdminFromToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload) return false
  const role =
    payload.role ??
    payload.roles ??
    payload.authority ??
    payload.authorities ??
    payload.userType ??
    payload.scope
  if (hasAdminRole(role)) return true
  if (typeof payload.scope === 'string' && payload.scope.toUpperCase().includes('ADMIN')) return true
  if (Array.isArray(payload.groups) && payload.groups.some((g) => normalizeRole(g) === 'ADMIN')) return true
  return false
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')

    if (storedToken) {
      setToken(storedToken)
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async ({ username, password }) => {
    if (!username || !password) {
      throw new Error('Kullanıcı adı ve şifre zorunludur')
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      let message = 'Giriş yapılamadı'
      try {
        const text = await response.text()
        message = text || message
      } catch {
        // ignore
      }
      throw new Error(message)
    }

    const data = await response.json()

    const accessToken =
      data.accessToken ??
      data.token ??
      data?.data?.accessToken ??
      data?.data?.token

    const userFromApi = data.user ?? data?.data?.user ?? { username }

    if (!accessToken) {
      throw new Error('Giriş cevabında token bulunamadı')
    }

    setToken(accessToken)
    setUser(userFromApi)

    localStorage.setItem('authToken', accessToken)
    localStorage.setItem('authUser', JSON.stringify(userFromApi))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  const isAdmin =
    isAdminFromUser(user) || (token ? isAdminFromToken(token) : false)

  if (process.env.NODE_ENV === 'development' && user) {
    const payload = token ? parseJwtPayload(token) : null
    console.log('[Auth] isAdmin:', isAdmin, '| user:', user, '| token payload:', payload)
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

