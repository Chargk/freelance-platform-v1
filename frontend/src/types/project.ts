export interface Project {
  id: string
  title: string
  description: string
  budget: {
    min: number
    max: number
  }
  skills: string[]
  category: string
  postedBy: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  postedDate: string
  proposals: number
  status: 'open' | 'in-progress' | 'completed'
  location: string
  duration: string
  experience: 'entry' | 'intermediate' | 'expert'
}

export interface ProjectFilters {
  search: string
  category: string
  budgetRange: [number, number]
  skills: string[]
  experience: string
  location: string
  sortBy: 'date' | 'budget' | 'proposals' | 'rating'
  sortOrder: 'asc' | 'desc'
}

export interface CreateProjectData {
  title: string
  description: string
  budget: {
    min: number
    max: number
  }
  skills: string[]
  category: string
  location: string
  duration: string
  experience: 'entry' | 'intermediate' | 'expert'
}
