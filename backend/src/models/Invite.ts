import mongoose, { Document, Schema } from 'mongoose'

export interface IInvite extends Document {
  projectId: mongoose.Types.ObjectId
  projectTitle: string
  projectDescription: string
  clientId: mongoose.Types.ObjectId
  clientName: string
  clientRating: number
  freelancerId: mongoose.Types.ObjectId
  freelancerName: string
  message: string
  budget: {
    min: number
    max: number
  }
  duration: string
  location: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: Date
  expiresAt: Date
  skills: string[]
}

const inviteSchema = new Schema<IInvite>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientRating: {
    type: Number,
    default: 0
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerName: {
    type: String,
    required: true
  },
  message: {
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
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  skills: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
})

// Index for better query performance
inviteSchema.index({ freelancerId: 1, status: 1 })
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<IInvite>('Invite', inviteSchema)
