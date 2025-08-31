import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { Project } from '../../types/project'

interface ApplyFormProps {
  project: Project
  onSubmit: (data: { coverLetter: string; proposedBudget: number; estimatedDuration: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

const ApplyForm: React.FC<ApplyFormProps> = ({ project, onSubmit, onCancel, isLoading = false }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedBudget: project.budget.min,
    estimatedDuration: '2-3 weeks'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required'
    } else if (formData.coverLetter.length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters'
    }

    if (formData.proposedBudget < project.budget.min || formData.proposedBudget > project.budget.max) {
      newErrors.proposedBudget = `Budget must be between $${project.budget.min} and $${project.budget.max}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Budget: ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}</span>
          <span>Duration: {project.duration}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter *
          </label>
          <textarea
            value={formData.coverLetter}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, coverLetter: e.target.value }))
              if (errors.coverLetter) setErrors(prev => ({ ...prev, coverLetter: '' }))
            }}
            rows={6}
            className={`input-field ${errors.coverLetter ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Explain why you're the best fit for this project..."
          />
          {errors.coverLetter && (
            <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.coverLetter.length}/1000 characters
          </p>
        </div>

        {/* Proposed Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Proposed Budget (USD) *
          </label>
          <input
            type="number"
            value={formData.proposedBudget}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, proposedBudget: parseInt(e.target.value) || 0 }))
              if (errors.proposedBudget) setErrors(prev => ({ ...prev, proposedBudget: '' }))
            }}
            className={`input-field ${errors.proposedBudget ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter your proposed budget"
          />
          {errors.proposedBudget && (
            <p className="mt-1 text-sm text-red-600">{errors.proposedBudget}</p>
          )}
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Estimated Duration
          </label>
          <select
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
            className="input-field"
          >
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-3 weeks">2-3 weeks</option>
            <option value="1-2 months">1-2 months</option>
            <option value="2-3 months">2-3 months</option>
            <option value="3+ months">3+ months</option>
          </select>
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
            {isLoading ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApplyForm
