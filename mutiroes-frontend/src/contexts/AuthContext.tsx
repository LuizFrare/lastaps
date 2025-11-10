'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile?: {
    bio?: string
    avatar?: string
    phone?: string
    city?: string
    state?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
  }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await api.getProfile()
      // O backend retorna { user: {...}, ...profile }
      const profileData = response.data as any
      if (profileData.user) {
        setUser({
          ...profileData.user,
          profile: profileData,
        })
      } else {
        setUser(profileData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.login(email, password)

      // Get user profile after successful login
      const profileResponse = await api.getProfile()
      const profileData = profileResponse.data as any

      // O backend retorna { user: {...}, ...profile }
      if (profileData.user) {
        setUser({
          ...profileData.user,
          profile: profileData,
        })
      } else {
        setUser(profileData)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
  }) => {
    try {
      setIsLoading(true)
      await api.register(userData)

      // Não fazer auto-login, deixar o usuário fazer login manualmente
      // Isso evita problemas com senhas não salvas corretamente
    } catch (error: any) {
      console.error('Registration failed:', error)

      // Extrair mensagem de erro específica do backend
      let errorMessage = 'Erro ao criar conta'

      // Tentar extrair detalhes do erro
      if (error.response?.data) {
        const data = error.response.data
        // Se houver erros de campo específicos
        if (data.email) {
          errorMessage = `Email: ${
            Array.isArray(data.email) ? data.email[0] : data.email
          }`
        } else if (data.username) {
          errorMessage = `Usuário: ${
            Array.isArray(data.username) ? data.username[0] : data.username
          }`
        } else if (data.password) {
          errorMessage = `Senha: ${
            Array.isArray(data.password) ? data.password[0] : data.password
          }`
        } else if (typeof data === 'string') {
          errorMessage = data
        } else if (data.detail) {
          errorMessage = data.detail
        }
      } else if (error.message && !error.message.includes('HTTP error')) {
        errorMessage = error.message
      }

      const enhancedError = new Error(errorMessage)
      throw enhancedError
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userData } : null))
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
