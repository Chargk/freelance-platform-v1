const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Add auth token if available
    const token = localStorage.getItem('token')
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    if (token) {
      // Use array syntax to set Authorization header since HeadersInit doesn't have direct property access
      if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${token}`)
      } else if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${token}`])
      } else {
        headers = {
          ...headers,
          'Authorization': `Bearer ${token}`
        }
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(data: {
    name: string
    email: string
    password: string
    role: 'client' | 'freelancer'
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(userId: string) {
    return this.request(`/auth/profile/${userId}`)
  }

  async updateProfile(userId: string, data: any) {
    return this.request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Projects endpoints
  async getProjects(params?: {
    search?: string
    category?: string
    skills?: string[]
    experience?: string
    location?: string
    minBudget?: number
    maxBudget?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/projects${queryString ? `?${queryString}` : ''}`)
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`)
  }

  async createProject(data: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getUserProjects() {
    return this.request('/projects/user/my-projects')
  }

  // Chat endpoints
  async getChats() {
    return this.request('/chat')
  }

  async getChat(id: string) {
    return this.request(`/chat/${id}`)
  }

  async getMessages(chatId: string, page?: number, limit?: number) {
    const params = new URLSearchParams()
    if (page) params.append('page', String(page))
    if (limit) params.append('limit', String(limit))
    
    const queryString = params.toString()
    return this.request(`/chat/${chatId}/messages${queryString ? `?${queryString}` : ''}`)
  }

  async sendMessage(data: {
    chatId: string
    content: string
    type?: 'text' | 'image' | 'file'
    fileUrl?: string
  }) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markAsRead(chatId: string) {
    return this.request(`/chat/${chatId}/read`, {
      method: 'PUT',
    })
  }

  async createChat(data: { participantId: string; projectId?: string }) {
    return this.request('/chat/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Invites endpoints
  async getInvites(params?: { status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/invites${queryString ? `?${queryString}` : ''}`)
  }

  async getInvite(id: string) {
    return this.request(`/invites/${id}`)
  }

  async createInvite(data: {
    projectId: string
    freelancerId: string
    message: string
  }) {
    return this.request('/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async respondToInvite(id: string, response: 'accept' | 'decline') {
    return this.request(`/invites/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    })
  }

  async getSentInvites(params?: { status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const queryString = queryParams.toString()
    return this.request(`/invites/sent${queryString ? `?${queryString}` : ''}`)
  }

  async deleteInvite(id: string) {
    return this.request(`/invites/${id}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient(API_BASE_URL)


