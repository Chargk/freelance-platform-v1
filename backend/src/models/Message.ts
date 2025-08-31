import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId
  receiverId: mongoose.Types.ObjectId
  content: string
  timestamp: Date
  isRead: boolean
  type: 'text' | 'image' | 'file'
  fileUrl?: string
}

const messageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String
  }
}, {
  timestamps: true
})

export default mongoose.model<IMessage>('Message', messageSchema)
