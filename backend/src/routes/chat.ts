import express from 'express'
import {
  getChats,
  getChat,
  getMessages,
  sendMessage,
  markAsRead,
  createChat
} from '../controllers/chatController'
import { auth } from '../middleware/auth'

const router = express.Router()

// All chat routes require authentication
router.use(auth)

router.get('/', getChats)
router.get('/:id', getChat)
router.get('/:chatId/messages', getMessages)
router.post('/send', sendMessage)
router.put('/:chatId/read', markAsRead)
router.post('/create', createChat)

export default router
