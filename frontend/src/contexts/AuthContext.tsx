import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/storage'

interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'freelancer'
  avatar?: string
}

interface UserWithPassword extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, role: 'client' | 'freelancer') => Promise<{ success: boolean; error?: string }>
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

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = getLocalStorage('user')
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get registered users from localStorage
      const users = getLocalStorage('users') || []
      const user = users.find((u: UserWithPassword) => u.email === email && u.password === password)
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user
      setUser(userWithoutPassword)
      setLocalStorage('user', userWithoutPassword)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: 'client' | 'freelancer'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get existing users
      const users = getLocalStorage('users') || []
      
      // Check if email already exists
      if (users.find((u: UserWithPassword) => u.email === email)) {
        return { success: false, error: 'Email already registered' }
      }

      // Create new user
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        email,
        password, // In real app, this would be hashed
        name,
        role
      }

      // Save to localStorage
      users.push(newUser)
      setLocalStorage('users', users)

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      setLocalStorage('user', userWithoutPassword)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    removeLocalStorage('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
} 