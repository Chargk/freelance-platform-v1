import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getLocalStorage, setLocalStorage } from '../utils/storage'

interface User {
  id: string
  name: string
  email: string
  role: 'client' | 'freelancer'
}

interface UserWithPassword extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: 'client' | 'freelancer') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updatedUser: Partial<User>) => void
  clearAllData: () => void // Add function to clear all data
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
    const savedUser = getLocalStorage('user')
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get users from localStorage
      const users: UserWithPassword[] = getLocalStorage('users') || []
      
      // Find user by email and password (case-insensitive)
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setLocalStorage('user', userWithoutPassword)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const register = async (name: string, email: string, password: string, role: 'client' | 'freelancer'): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get existing users
      const users: UserWithPassword[] = getLocalStorage('users') || []
      
      // Check if user already exists (case-insensitive email check)
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        console.log('Existing users:', users.map(u => ({ email: u.email, name: u.name })))
        console.log('Trying to register with email:', email)
        return { success: false, error: 'User with this email already exists' }
      }

      // Create new user
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        name,
        email: email.toLowerCase(), // Store email in lowercase
        password,
        role
      }

      // Add to users array
      users.push(newUser)
      setLocalStorage('users', users)

      // Remove password and set as current user
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      setLocalStorage('user', userWithoutPassword)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setLocalStorage('user', null)
  }

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      setLocalStorage('user', newUser)
      
      // Also update user in users array
      const users: UserWithPassword[] = getLocalStorage('users') || []
      const userIndex = users.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser }
        setLocalStorage('users', users)
      }
    }
  }

  // Function to clear all data (useful for development/testing)
  const clearAllData = () => {
    setUser(null)
    setLocalStorage('user', null)
    setLocalStorage('users', null)
    setLocalStorage('profile', null)
    setLocalStorage('projects', null)
    setLocalStorage('invites', null)
    setLocalStorage('messages', null)
    setLocalStorage('chatUsers', null)
    setLocalStorage('applications', null)
    
    // Clear all profile data for all users
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('profile_')) {
        localStorage.removeItem(key)
      }
    })
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    clearAllData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 