import express from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getUserProjects
} from '../controllers/projectController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getProjects)
router.get('/:id', getProject)

// Protected routes
router.post('/', auth, createProject)
router.put('/:id', auth, updateProject)
router.delete('/:id', auth, deleteProject)
router.get('/user/my-projects', auth, getUserProjects)

export default router
