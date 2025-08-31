export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
  return null
}

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters long'
  if (name.length > 50) return 'Name must be less than 50 characters'
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export const validateProjectTitle = (title: string): string | null => {
  if (!title) return 'Project title is required'
  if (title.length < 10) return 'Project title must be at least 10 characters long'
  if (title.length > 100) return 'Project title must be less than 100 characters'
  return null
}

export const validateProjectDescription = (description: string): string | null => {
  if (!description) return 'Project description is required'
  if (description.length < 50) return 'Project description must be at least 50 characters long'
  if (description.length > 1000) return 'Project description must be less than 1000 characters'
  return null
}

export const validateBudget = (budget: string): string | null => {
  if (!budget) return 'Budget is required'
  const budgetNum = parseFloat(budget)
  if (isNaN(budgetNum) || budgetNum <= 0) return 'Please enter a valid budget amount'
  if (budgetNum > 100000) return 'Budget cannot exceed $100,000'
  return null
}
