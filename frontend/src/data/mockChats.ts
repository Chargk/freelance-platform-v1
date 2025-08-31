import type { ChatRoom, ChatUser, Message } from '../types/chat'

export const mockChatUsers: ChatUser[] = [
  {
    _id: 'user1',
    name: 'John Client',
    avatar: '',
    role: 'client',
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    _id: 'user2',
    name: 'Sarah Freelancer',
    avatar: '',
    role: 'freelancer',
    isOnline: false,
    lastSeen: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  },
  {
    _id: 'user3',
    name: 'Mike Designer',
    avatar: '',
    role: 'freelancer',
    isOnline: true,
    lastSeen: new Date().toISOString()
  }
]

export const mockMessages: Message[] = [
  {
    _id: 'msg1',
    chatId: 'chat1',
    senderId: 'user1',
    receiverId: 'user2',
    content: 'Hi Sarah! I really liked your portfolio. Are you available for a new project?',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: true,
    type: 'text'
  },
  {
    _id: 'msg2',
    chatId: 'chat1',
    senderId: 'user2',
    receiverId: 'user1',
    content: 'Hello John! Thank you for reaching out. Yes, I am available. What kind of project do you have in mind?',
    timestamp: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
    isRead: true,
    type: 'text'
  },
  {
    _id: 'msg3',
    chatId: 'chat1',
    senderId: 'user1',
    receiverId: 'user2',
    content: 'I need a modern website for my startup. Can I send you the requirements?',
    timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
    isRead: true,
    type: 'text'
  },
  {
    _id: 'msg4',
    chatId: 'chat1',
    senderId: 'user2',
    receiverId: 'user1',
    content: 'Absolutely! Please share the requirements and I\'ll review them.',
    timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    isRead: false,
    type: 'text'
  }
]

export const mockChats: ChatRoom[] = [
  {
    _id: 'chat1',
    participants: ['user1', 'user2'],
    lastMessage: mockMessages[mockMessages.length - 1],
    unreadCount: 1,
    projectId: 'project1',
    projectTitle: 'Modern Website Development'
  },
  {
    _id: 'chat2',
    participants: ['user1', 'user3'],
    lastMessage: {
      _id: 'msg5',
      chatId: 'chat2',
      senderId: 'user3',
      receiverId: 'user1',
      content: 'Thanks for the feedback! I\'ll make those changes.',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      isRead: true,
      type: 'text'
    },
    unreadCount: 0,
    projectId: 'project2',
    projectTitle: 'Logo Design Project'
  }
] 