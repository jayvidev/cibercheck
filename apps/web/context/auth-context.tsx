'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { login as loginAPI, getUser as getUserAPI } from '@/lib/endpoints/users'
import type { AuthContextType, LoginResponse, User } from '@/typings/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_COOKIE_NAME = 'auth_token'
const USER_STORAGE_KEY = 'auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializar desde localStorage/cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Intentar obtener el token de la cookie
        const cookieToken = getCookie(AUTH_COOKIE_NAME)
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)

        if (cookieToken && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setToken(cookieToken)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Limpiar en caso de error
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await loginAPI<LoginResponse>(email, password)

      const { token: newToken, user: userData } = response

      // Guardar token en cookie (cliente)
      setCookie(AUTH_COOKIE_NAME, newToken)

      // Guardar usuario en localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))

      // Guardar cookies en el servidor también
      try {
        await saveCookieToServer(AUTH_COOKIE_NAME, newToken)
        await saveCookieToServer(USER_STORAGE_KEY, JSON.stringify(userData))
      } catch {}

      setToken(newToken)
      setUser(userData)
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
  }

  const clearAuth = () => {
    deleteCookie(AUTH_COOKIE_NAME)
    localStorage.removeItem(USER_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const refreshUser = async (userId?: number) => {
    try {
      const id = userId ?? user?.userId
      if (!id) return
      const fresh = await getUserAPI<User>(id)
      setUser(fresh)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fresh))
      // También actualizar cookie de usuario en servidor si aplica
      try {
        await saveCookieToServer(USER_STORAGE_KEY, JSON.stringify(fresh))
      } catch {}
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utilidades para manejar cookies
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const cookieStr = document.cookie || ''
  const parts = cookieStr.split(';').map((c) => c.trim())
  for (const part of parts) {
    if (part.startsWith(name + '=')) {
      return decodeURIComponent(part.substring(name.length + 1))
    }
  }
  return null
}

function setCookie(name: string, value: string): void {
  if (typeof window === 'undefined') return

  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax']
  if (window.location.protocol === 'https:') {
    parts.push('Secure')
  }
  document.cookie = parts.join('; ')
}

function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return

  const parts = [`${name}=`, 'Path=/', 'Max-Age=0', 'SameSite=Lax']
  if (window.location.protocol === 'https:') {
    parts.push('Secure')
  }
  document.cookie = parts.join('; ')
}

async function saveCookieToServer(name: string, value: string): Promise<void> {
  try {
    const response = await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value }),
    })

    if (!response.ok) {
      throw new Error('Failed to save cookie to server')
    }
  } catch (error) {
    console.error('Error saving cookie to server:', error)
    throw error
  }
}
