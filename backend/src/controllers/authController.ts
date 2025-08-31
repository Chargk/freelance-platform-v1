import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    // Remove password from response
    const userResponse = user.toObject()
    const { password: _, ...userWithoutPassword } = userResponse

    res.status(201).json({
      message: 'User registered successfully', 
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const userResponse = user.toObject()
    const { password: _, ...userWithoutPassword } = userResponse

    res.json({
      message: 'Login successful', 
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user profile' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updates = req.body
    delete updates.password // Don't allow password update through this route
    delete updates.email // Don't allow email update through this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
}
