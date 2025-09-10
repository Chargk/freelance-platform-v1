import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import Chat from '../models/Chat'
import Message from '../models/Message'
import User from '../models/User'

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email role avatar')
    .populate('lastMessage')
    .populate('projectId', 'title')
    .sort({ updatedAt: -1 })

    res.json(chats)
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({ error: 'Failed to get chats' })
  }
}

export const getChat = async (req: AuthRequest, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email role avatar')
      .populate('projectId', 'title')

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Check if user is participant
    if (!chat.participants.some((p: any) => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to access this chat' })
    }

    res.json(chat)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat' })
  }
}

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Check if user is participant
    if (!chat.participants.some((p: any) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to access this chat' })
    }

    const skip = (Number(page) - 1) * Number(limit)

    const messages = await Message.find({
      $or: [
        { senderId: chat.participants[0], receiverId: chat.participants[1] },
        { senderId: chat.participants[1], receiverId: chat.participants[0] }
      ]
    })
    .populate('senderId', 'name email role avatar')
    .populate('receiverId', 'name email role avatar')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(Number(limit))

    const total = await Message.countDocuments({
      $or: [
        { senderId: chat.participants[0], receiverId: chat.participants[1] },
        { senderId: chat.participants[1], receiverId: chat.participants[0] }
      ]
    })

    res.json({
      messages: messages.reverse(), // Show oldest first
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to get messages' })
  }
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, type = 'text', fileUrl } = req.body

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Check if user is participant
    if (!chat.participants.some((p: any) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to send message to this chat' })
    }

    // Find the other participant
    const receiverId = chat.participants.find((p: any) => p.toString() !== req.user._id.toString())

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content,
      type,
      fileUrl
    })

    await message.save()

    // Update chat's last message and unread count
    chat.lastMessage = message._id
    chat.unreadCount += 1
    await chat.save()

    // Populate sender info
    await message.populate('senderId', 'name email role avatar')

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Check if user is participant
    if (!chat.participants.some((p: any) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to access this chat' })
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        receiverId: req.user._id,
        senderId: { $in: chat.participants },
        isRead: false
      },
      { isRead: true }
    )

    // Reset unread count
    chat.unreadCount = 0
    await chat.save()

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' })
  }
}

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, projectId } = req.body

    // Check if participant exists
    const participant = await User.findById(participantId)
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' })
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    })

    if (existingChat) {
      return res.json({
        message: 'Chat already exists',
        chat: existingChat
      })
    }

    const chat = new Chat({
      participants: [req.user._id, participantId],
      projectId
    })

    await chat.save()

    await chat.populate('participants', 'name email role avatar')
    if (projectId) {
      await chat.populate('projectId', 'title')
    }

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({ error: 'Failed to create chat' })
  }
}
