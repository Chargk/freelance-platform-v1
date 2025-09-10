import { Response, Request } from 'express'
import Project from '../models/Project'
import User from '../models/User'

export const createProject = async (req: any, res: Response) => {
  try {
    const projectData = {
      ...req.body,
      postedBy: req.user._id
    }

    const project = new Project(projectData)
    await project.save()

    // Populate user info
    await project.populate('postedBy', 'name email role rating')

    res.status(201).json({
      message: 'Project created successfully',
      project
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
}

export const getProjects = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      skills,
      experience,
      location,
      minBudget,
      maxBudget,
      sortBy = 'postedDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query

    // Build filter object
    const filter: any = { status: 'open' }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      filter.category = category
    }

    if (skills && Array.isArray(skills)) {
      filter.skills = { $in: skills }
    }

    if (experience) {
      filter.experience = experience
    }

    if (location) {
      filter.location = location
    }

    if (minBudget || maxBudget) {
      filter.budget = {}
      if (minBudget) filter.budget.$gte = Number(minBudget)
      if (maxBudget) filter.budget.$lte = Number(maxBudget)
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    const projects = await Project.find(filter)
      .populate('postedBy', 'name email role rating')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    const total = await Project.countDocuments(filter)

    res.json({
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ error: 'Failed to get projects' })
  }
}

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'name email role rating')

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get project' })
  }
}

export const updateProject = async (req: any, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this project' })
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email role rating')

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' })
  }
}

export const deleteProject = async (req: any, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this project' })
    }

    await Project.findByIdAndDelete(req.params.id)

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' })
  }
}

export const getUserProjects = async (req: any, res: Response) => {
  try {
    const projects = await Project.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email role rating')
      .sort({ createdAt: -1 })

    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user projects' })
  }
}
