import mongoose, { Document, Schema } from 'mongoose'

export interface IProject extends Document {
  title: string
  description: string
  budget: {
    min: number
    max: number
  }
  skills: string[]
  category: string
  postedBy: mongoose.Types.ObjectId
  postedDate: Date
  proposals: number
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  location: string
  duration: string
  experience: 'entry' | 'intermediate' | 'expert'
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  skills: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  proposals: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model<IProject>('Project', projectSchema)
