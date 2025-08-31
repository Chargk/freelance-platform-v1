import express from 'express'
import {
  createInvite,
  getInvites,
  getInvite,
  respondToInvite,
  getSentInvites,
  deleteInvite
} from '../controllers/inviteController'
import { auth } from '../middleware/auth'

const router = express.Router()

// All invite routes require authentication
router.use(auth)

// Routes for freelancers (receiving invites)
router.get('/', getInvites)
router.get('/sent', getSentInvites)
router.get('/:id', getInvite)
router.put('/:id/respond', respondToInvite)

// Routes for clients (sending invites)
router.post('/', createInvite)
router.delete('/:id', deleteInvite)

export default router
