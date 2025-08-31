import { useState } from 'react'
import { Send, Search, MoreVertical } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: string
}

interface Chat {
  id: string
  name: string
  lastMessage: string
  unread: number
  avatar: string
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const chats: Chat[] = [
    {
      id: '1',
      name: 'John Smith',
      lastMessage: 'Great! I\'ll send you the updated files tomorrow.',
      unread: 2,
      avatar: 'JS'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      lastMessage: 'The project is looking great so far!',
      unread: 0,
      avatar: 'SJ'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      lastMessage: 'Can we schedule a call to discuss the details?',
      unread: 1,
      avatar: 'MW'
    }
  ]

  const messages: Message[] = [
    {
      id: '1',
      text: 'Hi! How is the project going?',
      sender: 'other',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      text: 'It\'s going great! I\'ve completed the first milestone.',
      sender: 'me',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      text: 'That\'s fantastic! Can you send me the progress report?',
      sender: 'other',
      timestamp: '10:35 AM'
    }
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      setMessage('')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
        {/* Chat List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat === chat.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">{chat.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{chat.name}</h3>
                      {chat.unread > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-xs">JS</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">John Smith</h3>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'me' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 input-field"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat 