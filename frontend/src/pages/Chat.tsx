import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLocalStorage, setLocalStorage } from '../utils/storage'

interface ChatUser {
  id: string
  name: string
  avatar: string
  role: 'client' | 'freelancer'
  isOnline: boolean
  lastSeen: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file'
  fileUrl?: string
}

interface Chat {
  id: string
  participants: [string, string] // [currentUserId, otherUserId]
  lastMessage: Message
  unreadCount: number
  projectId?: string
  projectTitle?: string
}

const Chat = () => {
  const { user, getUserId } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatData = () => {
    // Load from localStorage or create mock data
    const savedChats = getLocalStorage('chats')
    const savedUsers = getLocalStorage('chatUsers')
    const savedMessages = getLocalStorage('messages')

    if (savedChats && savedUsers && savedMessages) {
      setChats(savedChats)
      setUsers(savedUsers)
      setMessages(savedMessages)
    } else {
      // Create mock data
      const mockUsers: ChatUser[] = [
        {
          id: 'user1',
          name: 'John Smith',
          avatar: '',
          role: 'client',
          isOnline: true,
          lastSeen: new Date().toISOString()
        },
        {
          id: 'user2',
          name: 'Sarah Johnson',
          avatar: '',
          role: 'client',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'user3',
          name: 'Mike Wilson',
          avatar: '',
          role: 'client',
          isOnline: true,
          lastSeen: new Date().toISOString()
        },
        {
          id: 'user4',
          name: 'Emily Davis',
          avatar: '',
          role: 'freelancer',
          isOnline: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]

      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'user1',
          receiverId: getUserId() || 'unknown',
          content: 'Hi! I really liked your proposal for the e-commerce project.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          senderId: getUserId() || 'unknown',
          receiverId: 'user1',
          content: 'Thank you! I\'m excited to work on this project. When would you like to start?',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          senderId: 'user1',
          receiverId: getUserId() || 'unknown',
          content: 'Perfect! Let\'s start next week. I\'ll send you the project requirements.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: 'text'
        },
        {
          id: '4',
          senderId: 'user2',
          receiverId: getUserId() || 'unknown',
          content: 'Hello! Are you available for a new project?',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          id: '5',
          senderId: getUserId() || 'unknown',
          receiverId: 'user2',
          content: 'Hi Sarah! Yes, I\'m available. What kind of project do you have in mind?',
          timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        }
      ]

      const mockChats: Chat[] = [
        {
          id: 'chat1',
          participants: [getUserId() || 'unknown', 'user1'],
          lastMessage: mockMessages[2],
          unreadCount: 1,
          projectId: '1',
          projectTitle: 'E-commerce Website Development'
        },
        {
          id: 'chat2',
          participants: [getUserId() || 'unknown', 'user2'],
          lastMessage: mockMessages[4],
          unreadCount: 0,
          projectId: '2',
          projectTitle: 'Mobile App Development'
        },
        {
          id: 'chat3',
          participants: [getUserId() || 'unknown', 'user3'],
          lastMessage: {
            id: '6',
            senderId: 'user3',
            receiverId: getUserId() || 'unknown',
            content: 'Thanks for the great work on the previous project!',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            type: 'text'
          },
          unreadCount: 0,
          projectId: '3',
          projectTitle: 'AI Chatbot Development'
        }
      ]

      setUsers(mockUsers)
      setMessages(mockMessages)
      setChats(mockChats)
      setLocalStorage('chatUsers', mockUsers)
      setLocalStorage('messages', mockMessages)
      setLocalStorage('chats', mockChats)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const message: Message = {
        id: Date.now().toString(),
        senderId: getUserId() || '',
        receiverId: selectedUser?.id || '',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text'
      }

      const updatedMessages = [...messages, message]
      setMessages(updatedMessages)
      setLocalStorage('messages', updatedMessages)

      // Update chat's last message
      const updatedChats = chats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, lastMessage: message, unreadCount: 0 }
          : chat
      )
      setChats(updatedChats)
      setLocalStorage('chats', updatedChats)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
    const otherUserId = chat.participants.find(id => id !== getUserId())
    const otherUser = users.find(u => u.id === otherUserId)
    setSelectedUser(otherUser || null)

    // Mark messages as read
    const updatedMessages = messages.map(msg => 
      msg.senderId === otherUserId && msg.receiverId === getUserId()
        ? { ...msg, isRead: true }
        : msg
    )
    setMessages(updatedMessages)
    setLocalStorage('messages', updatedMessages)

    // Update unread count
    const updatedChats = chats.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    )
    setChats(updatedChats)
    setLocalStorage('chats', updatedChats)
  }

  const getChatMessages = () => {
    if (!selectedChat) return []
    return messages.filter(msg => 
      (msg.senderId === selectedChat.participants[0] && msg.receiverId === selectedChat.participants[1]) ||
      (msg.senderId === selectedChat.participants[1] && msg.receiverId === selectedChat.participants[0])
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredChats = chats.filter(chat => {
    const otherUserId = chat.participants.find(id => id !== getUserId())
    const otherUser = users.find(u => u.id === otherUserId)
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherUser = (chat: Chat) => {
    const otherUserId = chat.participants.find(id => id !== getUserId())
    return users.find(u => u.id === otherUserId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Connect with clients and freelancers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto h-[calc(600px-80px)]">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No conversations found</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat)
                if (!otherUser) return null

                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {otherUser.avatar ? (
                            <img 
                              src={otherUser.avatar} 
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {otherUser.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        </div>
                        
                        {chat.projectTitle && (
                          <p className="text-xs text-blue-600 mb-1">
                            {chat.projectTitle}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.content}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1">
                            {chat.lastMessage.senderId === getUserId() ? (
                              chat.lastMessage.isRead ? (
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-400" />
                              )
                            ) : null}
                          </div>
                          
                          {chat.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          {selectedChat && selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-8 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {selectedUser.avatar ? (
                          <img 
                            src={selectedUser.avatar} 
                            alt={selectedUser.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          selectedUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {selectedUser.isOnline && (
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{selectedUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="capitalize font-medium">{selectedUser.role}</span>
                        <span className="text-gray-400">•</span>
                        {selectedUser.isOnline ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Online
                          </span>
                        ) : (
                          <span className="text-gray-500">Last seen {formatTime(selectedUser.lastSeen)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button className="p-3 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Phone className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Video className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {getChatMessages().map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderId === getUserId() ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === getUserId()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          message.senderId === getUserId() ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === getUserId() && (
                            message.isRead ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat 