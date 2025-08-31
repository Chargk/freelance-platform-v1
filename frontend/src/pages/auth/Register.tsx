import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '../../utils/validation'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'freelancer'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate name
    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError

    // Validate email
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    // Validate password
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    // Validate confirm password
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setErrors({})
    
    if (!validateForm()) return
    
    const result = await register(formData.name, formData.email, formData.password, formData.role)
    
    if (result.success) {
      navigate('/projects')
    } else {
      setServerError(result.error || 'Registration failed')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' }
    if (password.length < 8) return { strength: 'Weak', color: 'text-red-500' }
    if (password.length < 12) return { strength: 'Medium', color: 'text-yellow-500' }
    return { strength: 'Strong', color: 'text-green-500' }
  }

  const clearLocalStorage = () => {
    // Clear all localStorage data
    localStorage.clear()
    // Reload the page to reset the state
    window.location.reload()
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input-field pl-10 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I want to
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="input-field"
              >
                <option value="client">Hire freelancers</option>
                <option value="freelancer">Work as a freelancer</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Create a password"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.strength}
                  </span>
                  {passwordStrength.strength === 'Strong' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        {/* Clear Data Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={clearLocalStorage}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear all data
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Use this if you're having registration issues
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register