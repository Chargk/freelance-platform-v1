import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  _id: string
  id?: string // Add id as optional for backward compatibility
  name: string
  email: string
  role: 'client' | 'freelancer'
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  skills: string[]
  experience: string
  education?: string
  portfolio?: string
  hourlyRate?: number
  availability: string
  languages: string[]
  rating: number
  totalProjects: number
  completedProjects: number
  joinDate: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: 'client' | 'freelancer') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updatedUser: Partial<User>) => void
  getUserId: () => string
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login({ email, password }) as { user: User; token: string }
      
      setUser(response.user)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (name: string, email: string, password: string, role: 'client' | 'freelancer'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.register({ name, email, password, role }) as { user: User; token: string }
      
      setUser(response.user)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  const getUserId = () => {
    return user?._id || user?.id || ''
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    getUserId
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 