import { useState } from 'react'
import { validateProjectTitle, validateProjectDescription, validateBudget } from '../../utils/validation'
import { skills, categories } from '../../data/mockProjects'
import type { CreateProjectData } from '../../types/project'
import { X } from 'lucide-react'

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectData) => void
  onCancel: () => void
  isLoading?: boolean
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    budget: { min: 0, max: 0 },
    skills: [],
    category: '',
    location: 'Remote',
    duration: '1-2 months',
    experience: 'intermediate'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    const titleError = validateProjectTitle(formData.title)
    if (titleError) newErrors.title = titleError

    const descriptionError = validateProjectDescription(formData.description)
    if (descriptionError) newErrors.description = descriptionError

    const budgetError = validateBudget(formData.budget.max.toString())
    if (budgetError) newErrors.budget = budgetError

    if (!formData.category) newErrors.category = 'Please select a category'
    if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]
    
    setSelectedSkills(newSkills)
    setFormData(prev => ({ ...prev, skills: newSkills }))
    
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }))
            if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
          }}
          className={`input-field ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
          placeholder="Enter project title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, description: e.target.value }))
            if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
          }}
          rows={4}
          className={`input-field ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
          placeholder="Describe your project requirements..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Category and Location */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, category: e.target.value }))
              if (errors.category) setErrors(prev => ({ ...prev, category: '' }))
            }}
            className={`input-field ${errors.category ? 'border-red-300 focus:ring-red-500' : ''}`}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="input-field"
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range (USD) *
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder="Minimum"
              value={formData.budget.min}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
              }))}
              className="input-field"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Maximum"
              value={formData.budget.max}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
              }))}
              className={`input-field ${errors.budget ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
          </div>
        </div>
        {errors.budget && (
          <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
        )}
      </div>

      {/* Duration and Experience */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="input-field"
          >
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-3 weeks">2-3 weeks</option>
            <option value="1-2 months">1-2 months</option>
            <option value="2-3 months">2-3 months</option>
            <option value="3+ months">3+ months</option>
            <option value="Ongoing">Ongoing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value as any }))}
            className="input-field"
          >
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Skills *
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSkills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {skills.map(skill => (
            <button
              key={skill}
              type="button"
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
        {errors.skills && (
          <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}

export default CreateProjectForm
