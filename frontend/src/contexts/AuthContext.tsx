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
  isLoading: boolean // Add loading state
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: 'client' | 'freelancer') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updatedUser: Partial<User>) => void
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
  const [isLoading, setIsLoading] = useState(true) // Start with loading true

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = getLocalStorage('user')
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false) // Set loading to false after check
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get users from localStorage
      const users: UserWithPassword[] = getLocalStorage('users') || []
      
      // Find user by email and password
      const foundUser = users.find(u => u.email === email && u.password === password)
      
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
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'User with this email already exists' }
      }

      // Create new user
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        name,
        email,
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

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 