import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/auth'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('futureme_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('futureme_token') || null
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('futureme_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('futureme_user')
    }

    if (token) {
      localStorage.setItem('futureme_token', token)
    } else {
      localStorage.removeItem('futureme_token')
    }
  }, [user, token])

  const register = async ({ name, email, password, role = 'STUDENT' }) => {
    setLoading(true)
    try {
      let response
      try {
        response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        })
      } catch (networkError) {
        // Backend not reached: fallback client mock to keep UI testable
        console.warn('Backend unavailable, using local mock for demonstration:', networkError)
        const mockUser = {
          id: `usr_${Date.now()}`,
          name,
          email,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const mockToken = `mock_jwt_token_${Date.now()}`
        setUser(mockUser)
        setToken(mockToken)
        return { success: true, user: mockUser }
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      setUser(data.user)
      setToken(data.token)
      return { success: true, user: data.user }
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      let response
      try {
        response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      } catch (networkError) {
        // Backend not reached: fallback client mock
        console.warn('Backend unavailable, using local mock for demonstration:', networkError)
        const mockUser = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: email.includes('admin') ? 'ADMIN' : 'STUDENT',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const mockToken = `mock_jwt_token_${Date.now()}`
        setUser(mockUser)
        setToken(mockToken)
        return { success: true, user: mockUser }
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password')
      }

      setUser(data.user)
      setToken(data.token)
      return { success: true, user: data.user }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('futureme_user')
    localStorage.removeItem('futureme_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
