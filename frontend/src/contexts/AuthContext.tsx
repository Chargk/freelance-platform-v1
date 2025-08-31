import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'freelancer'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: 'client' | 'freelancer') => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual login logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: '1',
        email,
        name: 'Test User',
        role: 'client'
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: 'client' | 'freelancer') => {
    setIsLoading(true)
    try {
      // TODO: Implement actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: '1',
        email,
        name,
        role
      })
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
} 