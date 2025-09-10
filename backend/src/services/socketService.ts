import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: IUser;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    // Initialize Socket.io server with CORS configuration
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL 
          : "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Middleware for JWT authentication
  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Find user in database
        const User = require('../models/User').default;
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        // Attach user info to socket
        socket.userId = user._id.toString();
        socket.user = user;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  // Setup event handlers for different socket events
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId!, socket.id);

      // Handle joining a chat room
      socket.on('joinChat', (data: { chatId: string }) => {
        socket.join(data.chatId);
        console.log(`User ${socket.userId} joined chat ${data.chatId}`);
        
        // Notify others in the chat that user joined
        socket.to(data.chatId).emit('userJoined', {
          userId: socket.userId,
          user: socket.user
        });
      });

      // Handle leaving a chat room
      socket.on('leaveChat', (data: { chatId: string }) => {
        socket.leave(data.chatId);
        console.log(`User ${socket.userId} left chat ${data.chatId}`);
        
        // Notify others in the chat that user left
        socket.to(data.chatId).emit('userLeft', {
          userId: socket.userId
        });
      });

      // Handle sending messages
      socket.on('sendMessage', async (data: { 
        chatId: string; 
        content: string; 
        type?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        fileType?: string;
      }) => {
        try {
          // Create message object
          const message = {
            _id: new Date().getTime().toString(), // Temporary ID
            senderId: socket.userId,
            receiverId: data.chatId, // For now, using chatId as receiverId
            content: data.content,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: data.type || 'text',
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            sender: {
              _id: socket.userId,
              name: socket.user?.name || 'Unknown User',
              avatar: socket.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(socket.user?.name || 'User')}&background=random`
            }
          };

          // Broadcast message to all users in the chat room
          this.io.to(data.chatId).emit('newMessage', message);
          
          console.log(`Message sent in chat ${data.chatId} by user ${socket.userId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data: { chatId: string }) => {
        socket.to(data.chatId).emit('userTyping', {
          userId: socket.userId,
          userName: socket.user?.name || 'Unknown User'
        });
      });

      // Handle stop typing
      socket.on('stopTyping', (data: { chatId: string }) => {
        socket.to(data.chatId).emit('userStoppedTyping', {
          userId: socket.userId
        });
      });

      // Handle message read status
      socket.on('markAsRead', (data: { chatId: string; messageId: string }) => {
        // Notify sender that message was read
        const senderSocketId = this.connectedUsers.get(data.chatId);
        if (senderSocketId) {
          this.io.to(senderSocketId).emit('messageRead', {
            messageId: data.messageId,
            readBy: socket.userId
          });
        }
      });

      // Handle user status changes
      socket.on('updateStatus', (data: { status: 'online' | 'away' | 'busy' }) => {
        // Broadcast status change to all connected users
        this.io.emit('userStatusChange', {
          userId: socket.userId,
          status: data.status
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove user from connected users map
        this.connectedUsers.delete(socket.userId!);
        
        // Broadcast that user went offline
        this.io.emit('userStatusChange', {
          userId: socket.userId,
          status: 'offline'
        });
      });
    });
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }
}

export default SocketService;