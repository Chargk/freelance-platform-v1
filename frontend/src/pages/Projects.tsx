import { useState } from 'react'
import { Briefcase, Search, Filter, Plus, Star, Clock, DollarSign } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  budget: string
  skills: string[]
  postedBy: string
  postedDate: string
  proposals: number
  rating: number
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const projects: Project[] = [
    {
      id: '1',
      title: 'Website Development for E-commerce',
      description: 'Need a modern, responsive website for an online store. Should include product catalog, shopping cart, and payment integration.',
      budget: '$2000 - $5000',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      postedBy: 'TechCorp Inc.',
      postedDate: '2 days ago',
      proposals: 12,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Mobile App for Food Delivery',
      description: 'Looking for a developer to create a food delivery app with real-time tracking and payment features.',
      budget: '$3000 - $8000',
      skills: ['React Native', 'Firebase', 'Google Maps API'],
      postedBy: 'FoodExpress',
      postedDate: '1 day ago',
      proposals: 8,
      rating: 4.9
    },
    {
      id: '3',
      title: 'Logo and Brand Identity Design',
      description: 'Need a professional logo and complete brand identity package for a new startup.',
      budget: '$500 - $1500',
      skills: ['Logo Design', 'Brand Identity', 'Illustrator'],
      postedBy: 'StartupXYZ',
      postedDate: '3 days ago',
      proposals: 25,
      rating: 4.7
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Projects</h1>
        <p className="text-gray-600">Browse and apply for projects that match your skills</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Projects</option>
            <option value="web">Web Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="design">Design</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{project.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{project.budget}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.postedDate}</span>
                </div>
                <span>{project.proposals} proposals</span>
              </div>
              <button className="btn-primary">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects 