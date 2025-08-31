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
  CheckCheck,
  File,
  Download,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'
import Loading from '../components/ui/Loading'
import { io, type Socket } from 'socket.io-client'
import EmojiPicker from 'emoji-picker-react'
import { mockChats, mockChatUsers, mockMessages } from '../data/mockChats'
import type { ChatUser, Message, ChatRoom } from '../types/chat'

const Chat = () => {
  const { user, getUserId } = useAuth()
  const { showError } = useToast()
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      const updatedMessages = [...messages, message]
      setMessages(updatedMessages)
      
      // Save messages to localStorage
      localStorage.setItem(`chat_messages_${message.chatId}`, JSON.stringify(updatedMessages))
      
      // Update last message in chat
      setChats(prev => {
        const updatedChats = prev.map(chat => {
          if (chat._id === message.chatId) {
            // Only increment unread count if this chat is not currently selected
            const unreadIncrement = selectedChat?._id === message.chatId ? 0 : 1
            return {
              ...chat,
              lastMessage: message,
              unreadCount: chat.unreadCount + unreadIncrement
            }
          }
          return chat
        })
        
        // Save updated chats to localStorage
        localStorage.setItem('chat_list', JSON.stringify(updatedChats))
        return updatedChats
      })
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
      
      // Try to load chats from localStorage first
      const savedChats = localStorage.getItem('chat_list')
      let chatList: ChatRoom[] = []
      
      if (savedChats) {
        try {
          chatList = JSON.parse(savedChats)
        } catch (error) {
          console.error('Error parsing saved chats:', error)
        }
      }
      
      // If no saved chats, use mock data
      if (chatList.length === 0) {
        chatList = mockChats
      }
      
      setChats(chatList)
      setUsers(mockChatUsers)
      
    } catch (error: any) {
      console.error('Error loading chat data:', error)
      showError('Failed to load chats', error.message)
      
      // Fallback to mock data
      setChats(mockChats)
      setUsers(mockChatUsers)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true)
      
      // Try to load from localStorage first
      const savedMessages = localStorage.getItem(`chat_messages_${chatId}`)
      let chatMessages: Message[] = []
      
      if (savedMessages) {
        try {
          chatMessages = JSON.parse(savedMessages)
        } catch (error) {
          console.error('Error parsing saved messages:', error)
        }
      }
      
      // If no saved messages, use mock data
      if (chatMessages.length === 0) {
        chatMessages = mockMessages.filter(msg => msg.chatId === chatId)
      }
      
      setMessages(chatMessages)
      
      // Join chat via WebSocket
      if (socketRef.current) {
        socketRef.current.emit('joinChat', { chatId })
      }
      
      // Mark messages as read
      // await api.markAsRead(chatId)
      
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
    if ((!newMessage.trim() && !selectedFile) || !selectedChat || !user) return

    try {
      let messageContent = newMessage.trim()
      let messageType: 'text' | 'image' | 'file' = 'text'
      let fileUrl = ''

      // Handle file upload
      if (selectedFile) {
        setIsUploading(true)
        try {
          // In production, this would upload to server
          // For now, create a mock file URL
          fileUrl = URL.createObjectURL(selectedFile)
          messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file'
          messageContent = selectedFile.name
        } catch (error) {
          showError('File upload failed', 'Could not upload file')
          return
        } finally {
          setIsUploading(false)
        }
      }

      const newMessageObj: Message = {
        _id: Date.now().toString(),
        chatId: selectedChat._id,
        senderId: getUserId(),
        receiverId: selectedChat.participants.find(id => id !== getUserId()) || '',
        content: messageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: messageType,
        fileUrl: fileUrl || undefined,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileType: selectedFile?.type
      }

      // Add message locally for immediate feedback
      const updatedMessages = [...messages, newMessageObj]
      setMessages(updatedMessages)
      
      // Save messages to localStorage
      localStorage.setItem(`chat_messages_${selectedChat._id}`, JSON.stringify(updatedMessages))
      
      // Update chat's last message and clear unread count
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: newMessageObj, unreadCount: 0 }
          : chat
      ))
      
      // Save updated chats to localStorage
      const updatedChats = chats.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: newMessageObj, unreadCount: 0 }
          : chat
      )
      localStorage.setItem('chat_list', JSON.stringify(updatedChats))

      // Send via WebSocket for speed
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          chatId: selectedChat._id,
          content: messageContent,
          type: messageType,
          fileUrl,
          fileName: selectedFile?.name,
          fileSize: selectedFile?.size,
          fileType: selectedFile?.type
        })
      }

      // Also send via API for reliability
      try {
        await api.sendMessage({
          chatId: selectedChat._id,
          content: messageContent,
          type: messageType,
          fileUrl
        })
      } catch (error) {
        console.error('API send failed, but message was sent via WebSocket')
      }

      setNewMessage('')
      setSelectedFile(null)
      
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

  const selectChat = async (chat: ChatRoom) => {
    setSelectedChat(chat)
    const otherUserId = chat.participants.find(id => id !== getUserId())
    const otherUser = users.find(u => u._id === otherUserId)
    setSelectedUser(otherUser || null)

    // Load messages
    await loadMessages(chat._id)

    // Clear unread messages and save to localStorage
    setChats(prev => {
      const updatedChats = prev.map(c => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
      localStorage.setItem('chat_list', JSON.stringify(updatedChats))
      return updatedChats
    })
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File too large', 'Maximum file size is 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const filteredChats = chats.filter(chat => {
    const otherUserId = chat.participants.find(id => id !== getUserId())
    const otherUser = users.find(u => u._id === otherUserId)
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherUser = (chat: ChatRoom) => {
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
                          {chat.lastMessage.type === 'file' ? (
                            <span className="flex items-center gap-1">
                              <File className="w-3 h-3" />
                              {chat.lastMessage.fileName || 'File'}
                            </span>
                          ) : chat.lastMessage.type === 'image' ? (
                            <span className="flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              Image
                            </span>
                          ) : (
                            chat.lastMessage.content
                          )}
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
                          {message.type === 'file' && (
                            <div className="mb-2">
                              <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
                                <File className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                                  <p className="text-xs opacity-75">{message.fileSize && formatFileSize(message.fileSize)}</p>
                                </div>
                                <button 
                                  onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
                                  className="p-1 hover:bg-white/20 rounded"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {message.type === 'image' && message.fileUrl && (
                            <div className="mb-2">
                              <img 
                                src={message.fileUrl} 
                                alt="Shared image"
                                className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.fileUrl, '_blank')}
                              />
                            </div>
                          )}
                          
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          
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

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <File className="w-4 h-4 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={removeSelectedFile}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

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
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div 
                          ref={emojiPickerRef}
                          className="absolute bottom-full right-0 mb-2 z-50"
                        >
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                      className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
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