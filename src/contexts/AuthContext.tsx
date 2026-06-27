import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: string
  balance: number
  trustScore: number
  phone?: string
  userType?: 'personal' | 'enterprise'
  verified?: boolean
  subscription?: string
  subscriptionExpiresAt?: string
  checkInStreak?: number
  totalCheckIns?: number
  lastCheckIn?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithPhone: (phone: string, code: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  sendCode: (phone: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  userType: 'personal' | 'enterprise'
  companyName?: string
  companyId?: string
  idCard?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '登录失败')
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }, [])

  const loginWithPhone = useCallback(async (phone: string, code: string) => {
    const response = await fetch('/api/auth/login-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '登录失败')
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || '注册失败')
    setToken(result.token)
    setUser(result.user)
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
  }, [])

  const sendCode = useCallback(async (phone: string) => {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '发送验证码失败')
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...data } : null
      if (updated) localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const checkAuth = useCallback(async () => {
    if (!token) return false
    try {
      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
        return true
      }
      logout()
      return false
    } catch {
      return false
    }
  }, [token, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        loginWithPhone,
        register,
        sendCode,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
