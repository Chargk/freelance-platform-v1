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
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'
import Loading from '../components/ui/Loading'
import { io, type Socket } from 'socket.io-client'

interface ChatUser {
  _id: string
  name: string
  avatar: string
  role: 'client' | 'freelancer'
  isOnline: boolean
  lastSeen: string
}

interface Message {
  _id: string
  chatId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file'
  fileUrl?: string
}

interface Chat {
  _id: string
  participants: [string, string] // [currentUserId, otherUserId]
  lastMessage: Message
  unreadCount: number
  projectId?: string
  projectTitle?: string
}

const Chat = () => {
  const { user, getUserId } = useAuth()
  const { showError } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadChatData()
    initializeSocket()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSocket = () => {
    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5001', {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    // Authentication
    socketRef.current.on('authenticated', () => {
      console.log('WebSocket authenticated')
    })

    // Receive new messages
    socketRef.current.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message])
      
      // Update last message in chat
      setChats(prev => prev.map(chat => {
        if (chat._id === message.chatId) {
          return {
            ...chat,
            lastMessage: message,
            unreadCount: chat.unreadCount + 1
          }
        }
        return chat
      }))
    })

    // User typing
    socketRef.current.on('userTyping', (data: { userId: string; chatId: string }) => {
      if (selectedChat?._id === data.chatId) {
        setTypingUsers(prev => new Set(prev).add(data.userId))
      }
    })

    // User stopped typing
    socketRef.current.on('userStoppedTyping', (data: { userId: string; chatId: string }) => {
      if (selectedChat?._id === data.chatId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    })

    // Message read
    socketRef.current.on('messageRead', (data: { messageId: string; chatId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, isRead: true } : msg
      ))
    })

    // User online/offline status
    socketRef.current.on('userStatusChange', (data: { userId: string; isOnline: boolean }) => {
      setUsers(prev => prev.map(user => 
        user._id === data.userId ? { ...user, isOnline: data.isOnline } : user
      ))
    })

    // Error handling
    socketRef.current.on('error', (error: any) => {
      console.error('WebSocket error:', error)
      showError('Connection error', 'Lost connection to chat server')
    })
  }

  const loadChatData = async () => {
    try {
      setIsLoading(true)
      
      // Load chats
      const chatsResponse = await api.getChats() as { chats: Chat[] }
      setChats(chatsResponse.chats || [])
      
      // Load users (in real app this would be a separate API)
      // Here would be logic to load users
      
    } catch (error: any) {
      console.error('Error loading chat data:', error)
      showError('Failed to load chats', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true)
      const response = await api.getMessages(chatId) as { messages: Message[] }
      setMessages(response.messages || [])
      
      // Join chat via WebSocket
      if (socketRef.current) {
        socketRef.current.emit('joinChat', { chatId })
      }
      
      // Mark messages as read
      await api.markAsRead(chatId)
      
    } catch (error: any) {
      console.error('Error loading messages:', error)
      showError('Failed to load messages', error.message)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return

    try {
      // Send via WebSocket for speed
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          chatId: selectedChat._id,
          content: newMessage.trim(),
          type: 'text'
        })
      }

      // Also send via API for reliability
      await api.sendMessage({
        chatId: selectedChat._id,
        content: newMessage.trim(),
        type: 'text'
      })

      setNewMessage('')
      
      // Stop typing indicator
      if (socketRef.current) {
        socketRef.current.emit('stopTyping', { chatId: selectedChat._id })
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error)
      showError('Failed to send message', error.message)
    }
  }

  const handleTyping = () => {
    if (!socketRef.current || !selectedChat) return

    // Send typing indicator
    socketRef.current.emit('typing', { chatId: selectedChat._id })

    // Clear previous timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timer
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stopTyping', { chatId: selectedChat._id })
      }
    }, 3000) // Stop after 3 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      handleTyping()
    }
  }

  const selectChat = async (chat: Chat) => {
    setSelectedChat(chat)
    const otherUserId = chat.participants.find(id => id !== getUserId())
    const otherUser = users.find(u => u._id === otherUserId)
    setSelectedUser(otherUser || null)

    // Load messages
    await loadMessages(chat._id)

    // Clear unread messages
    setChats(prev => prev.map(c => 
      c._id === chat._id ? { ...c, unreadCount: 0 } : c
    ))
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
    const otherUser = users.find(u => u._id === otherUserId)
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherUser = (chat: Chat) => {
    const otherUserId = chat.participants.find(id => id !== getUserId())
    return users.find(u => u._id === otherUserId)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Loading chats..." />
      </div>
    )
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
                    key={chat._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
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
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loading size="md" text="Loading messages..." />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message._id}
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
                    
                    {/* Typing indicator */}
                    {typingUsers.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs">typing...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
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
                      disabled={!newMessage.trim()}
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