import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'client' | 'freelancer'
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  skills: string[]
  experience: 'entry' | 'intermediate' | 'expert'
  education?: string
  portfolio?: string
  hourlyRate?: number
  availability: 'available' | 'busy' | 'unavailable'
  languages: string[]
  rating: number
  totalProjects: number
  completedProjects: number
  joinDate: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: 'Tell us about yourself...'
  },
  skills: [{
    type: String,
    default: []
  }],
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'entry'
  },
  education: {
    type: String,
    default: ''
  },
  portfolio: {
    type: String,
    default: ''
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalProjects: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
