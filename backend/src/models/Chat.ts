import mongoose, { Document, Schema } from 'mongoose'

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]
  lastMessage: mongoose.Types.ObjectId
  unreadCount: number
  projectId?: mongoose.Types.ObjectId
}

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  timestamps: true
})

export default mongoose.model<IChat>('Chat', chatSchema)
