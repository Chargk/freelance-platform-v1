import { Response } from 'express'
import Invite from '../models/Invite'
import Project from '../models/Project'
import User from '../models/User'

export const createInvite = async (req: any, res: Response) => {
  try {
    const { projectId, freelancerId, message } = req.body

    // Check if project exists and user is the owner
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to invite for this project' })
    }

    // Check if freelancer exists
    const freelancer = await User.findById(freelancerId)
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' })
    }

    if (freelancer.role !== 'freelancer') {
      return res.status(400).json({ error: 'Can only invite freelancers' })
    }

    // Check if invite already exists
    const existingInvite = await Invite.findOne({
      projectId,
      freelancerId,
      status: { $in: ['pending', 'accepted'] }
    })

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already exists for this project and freelancer' })
    }

    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = new Invite({
      projectId,
      projectTitle: project.title,
      projectDescription: project.description,
      clientId: req.user._id,
      clientName: req.user.name,
      clientRating: req.user.rating || 0,
      freelancerId,
      freelancerName: freelancer.name,
      message,
      budget: project.budget,
      duration: project.duration,
      location: project.location,
      skills: project.skills,
      expiresAt
    })

    await invite.save()

    // Populate references
    await invite.populate('projectId', 'title description')
    await invite.populate('clientId', 'name email role rating')
    await invite.populate('freelancerId', 'name email role')

    res.status(201).json({
      message: 'Invite sent successfully',
      invite
    })
  } catch (error) {
    console.error('Create invite error:', error)
    res.status(500).json({ error: 'Failed to create invite' })
  }
}

export const getInvites = async (req: any, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter: any = { freelancerId: req.user._id }

    if (status && status !== 'all') {
      filter.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    const invites = await Invite.find(filter)
      .populate('projectId', 'title description')
      .populate('clientId', 'name email role rating')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Invite.countDocuments(filter)

    res.json({
      invites,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get invites error:', error)
    res.status(500).json({ error: 'Failed to get invites' })
  }
}

export const getInvite = async (req: any, res: Response) => {
  try {
    const invite = await Invite.findById(req.params.id)
      .populate('projectId', 'title description')
      .populate('clientId', 'name email role rating')
      .populate('freelancerId', 'name email role')

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    // Check if user is the freelancer or client
    if (invite.freelancerId.toString() !== req.user._id.toString() && 
        invite.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this invite' })
    }

    res.json(invite)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get invite' })
  }
}

export const respondToInvite = async (req: any, res: Response) => {
  try {
    const { response } = req.body // 'accept' or 'decline'

    const invite = await Invite.findById(req.params.id)

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    // Check if user is the freelancer
    if (invite.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to respond to this invite' })
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite is no longer pending' })
    }

    // Check if invite has expired
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired'
      await invite.save()
      return res.status(400).json({ error: 'Invite has expired' })
    }

    invite.status = response === 'accept' ? 'accepted' : 'declined'
    await invite.save()

    // If accepted, you might want to create a chat or update project status
    if (response === 'accept') {
      // Here you could create a chat between client and freelancer
      // and update project status if needed
    }

    res.json({
      message: `Invite ${response}d successfully`,
      invite
    })
  } catch (error) {
    console.error('Respond to invite error:', error)
    res.status(500).json({ error: 'Failed to respond to invite' })
  }
}

export const getSentInvites = async (req: any, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter: any = { clientId: req.user._id }

    if (status && status !== 'all') {
      filter.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    const invites = await Invite.find(filter)
      .populate('projectId', 'title description')
      .populate('freelancerId', 'name email role rating')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Invite.countDocuments(filter)

    res.json({
      invites,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get sent invites error:', error)
    res.status(500).json({ error: 'Failed to get sent invites' })
  }
}

export const deleteInvite = async (req: any, res: Response) => {
  try {
    const invite = await Invite.findById(req.params.id)

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    // Check if user is the client
    if (invite.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this invite' })
    }

    await Invite.findByIdAndDelete(req.params.id)

    res.json({ message: 'Invite deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invite' })
  }
}
