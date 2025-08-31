export interface ChatUser {
  _id: string
  name: string
  avatar: string
  role: 'client' | 'freelancer'
  isOnline: boolean
  lastSeen: string
}

export interface Message {
  _id: string
  chatId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
}

export interface ChatRoom {
  _id: string
  participants: [string, string] // [currentUserId, otherUserId]
  lastMessage: Message
  unreadCount: number
  projectId?: string
  projectTitle?: string
} 