import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users,
  SlidersHorizontal
} from 'lucide-react'
import { mockProjects, categories, skills } from '../data/mockProjects'
import type { Project, ProjectFilters } from '../types/project'
import Modal from '../components/ui/Modal'
import CreateProjectForm from '../components/projects/CreateProjectForm'
import ApplyForm from '../components/projects/ApplyForm'
import { useAuth } from '../contexts/AuthContext'
import { getLocalStorage, setLocalStorage } from '../utils/storage'

const Projects = () => {
  const { user, getUserId } = useAuth()
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    category: '',
    budgetRange: [0, 10000],
    skills: [],
    experience: '',
    location: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  
  // Modal states
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)

  // Get projects from localStorage or use mock data
  const allProjects = useMemo(() => {
    const savedProjects = getLocalStorage('projects')
    return savedProjects || mockProjects
  }, [])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(project => project.category === filters.category)
    }

    // Budget filter
    filtered = filtered.filter(project =>
      project.budget.min >= filters.budgetRange[0] && project.budget.max <= filters.budgetRange[1]
    )

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(project =>
        filters.skills.some(skill => project.skills.includes(skill))
      )
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter(project => project.experience === filters.experience)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(project => project.location === filters.location)
    }

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.postedDate).getTime()
          bValue = new Date(b.postedDate).getTime()
          break
        case 'budget':
          aValue = a.budget.max
          bValue = b.budget.max
          break
        case 'proposals':
          aValue = a.proposals
          bValue = b.proposals
          break
        case 'rating':
          aValue = a.postedBy.rating
          bValue = b.postedBy.rating
          break
        default:
          return 0
      }

      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [filters, allProjects])

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      budgetRange: [0, 10000],
      skills: [],
      experience: '',
      location: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
    setSelectedSkills([])
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleCreateProject = async (data: any) => {
    setIsCreatingProject(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newProject: Project = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        budget: data.budget,
        skills: data.skills,
        category: data.category,
        postedBy: {
          id: getUserId() || 'unknown',
          name: user?.name || 'Unknown',
          rating: 5.0
        },
        postedDate: new Date().toISOString(),
        proposals: 0,
        status: 'open',
        location: data.location,
        duration: data.duration,
        experience: data.experience
      }

      // Save to localStorage
      const updatedProjects = [newProject, ...allProjects]
      setLocalStorage('projects', updatedProjects)
      
      setShowCreateProject(false)
      // You could add a success notification here
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleApplyToProject = async (data: any) => {
    if (!selectedProject) return
    
    setIsSubmittingApplication(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save application to localStorage
      const applications = getLocalStorage('applications') || []
      const newApplication = {
        id: Date.now().toString(),
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        freelancerId: getUserId(),
        freelancerName: user?.name,
        coverLetter: data.coverLetter,
        proposedBudget: data.proposedBudget,
        estimatedDuration: data.estimatedDuration,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }
      
      applications.push(newApplication)
      setLocalStorage('applications', applications)
      
      setShowApplyForm(false)
      setSelectedProject(null)
      // You could add a success notification here
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsSubmittingApplication(false)
    }
  }

  const handleApplyClick = (project: Project) => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to apply for projects')
      return
    }
    setSelectedProject(project)
    setShowApplyForm(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Projects</h1>
        <p className="text-gray-600">Browse and apply for projects that match your skills</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {Object.values(filters).some(v => v !== '' && v !== 'date' && v !== 'desc' && (Array.isArray(v) ? v.length > 0 : true)) && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                  {filters.skills.length + (filters.category ? 1 : 0) + (filters.experience ? 1 : 0) + (filters.location ? 1 : 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowCreateProject(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Project
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }))
                  }}
                  className="input-field"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="budget-desc">Highest Budget</option>
                  <option value="budget-asc">Lowest Budget</option>
                  <option value="proposals-desc">Most Proposals</option>
                  <option value="rating-desc">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 20).map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Clear all filters
              </button>
              <span className="text-sm text-gray-500">
                {filteredProjects.length} projects found
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 ml-4">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{project.postedBy.rating}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.slice(0, 5).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {project.skills.length > 5 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    +{project.skills.length - 5} more
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(project.postedDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.proposals} proposals</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleApplyClick(project)}
                  className="btn-primary"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create New Project"
        size="lg"
      >
        <CreateProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateProject(false)}
          isLoading={isCreatingProject}
        />
      </Modal>

      {/* Apply to Project Modal */}
      <Modal
        isOpen={showApplyForm}
        onClose={() => {
          setShowApplyForm(false)
          setSelectedProject(null)
        }}
        title="Apply to Project"
        size="md"
      >
        {selectedProject && (
          <ApplyForm
            project={selectedProject}
            onSubmit={handleApplyToProject}
            onCancel={() => {
              setShowApplyForm(false)
              setSelectedProject(null)
            }}
            isLoading={isSubmittingApplication}
          />
        )}
      </Modal>
    </div>
  )
}

export default Projects 