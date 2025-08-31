import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Star, 
  Briefcase, 
  Award,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Camera,
  Plus,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLocalStorage, setLocalStorage } from '../utils/storage'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string
  location: string
  bio: string
  avatar: string
  role: 'client' | 'freelancer'
  joinDate: string
  rating: number
  totalProjects: number
  completedProjects: number
  skills: string[]
  experience: string
  education: string
  portfolio: string
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
    website?: string
  }
  hourlyRate?: number
  availability: 'available' | 'busy' | 'unavailable'
  languages: string[]
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    url?: string
  }>
}

const Profile = () => {
  const { user, updateUser } = useAuth() 
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Form states
  const [formData, setFormData] = useState<Partial<ProfileData>>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  // Additional states
  const [showAddCertification, setShowAddCertification] = useState(false)
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    url: ''
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = () => {
    // Load from localStorage or create default profile
    const savedProfile = getLocalStorage('profile')
    if (savedProfile) {
      setProfileData(savedProfile)
      setFormData(savedProfile)
    } else {
      // Create default profile based on user data
      const defaultProfile: ProfileData = {
        id: user?.id || 'unknown',
        name: user?.name || 'Unknown User',
        email: user?.email || '',
        phone: '',
        location: '',
        bio: 'Tell us about yourself...',
        avatar: '',
        role: user?.role || 'freelancer',
        joinDate: new Date().toISOString(),
        rating: 0,
        totalProjects: 0,
        completedProjects: 0,
        skills: [],
        experience: 'entry',
        education: '',
        portfolio: '',
        socialLinks: {},
        hourlyRate: 0,
        availability: 'available',
        languages: ['English'],
        certifications: []
      }
      setProfileData(defaultProfile)
      setFormData(defaultProfile)
      setLocalStorage('profile', defaultProfile)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number'
    }

    if (formData.hourlyRate && formData.hourlyRate < 0) {
      newErrors.hourlyRate = 'Hourly rate must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !profileData) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      
      const updatedProfile: ProfileData = {
        ...profileData,
        ...formData,
        id: profileData.id,
        name: formData.name || profileData.name,
        email: formData.email || profileData.email,
        role: formData.role || profileData.role,
        joinDate: profileData.joinDate,
        rating: profileData.rating,
        totalProjects: profileData.totalProjects,
        completedProjects: profileData.completedProjects,
        skills: formData.skills || profileData.skills,
        experience: formData.experience || profileData.experience,
        education: formData.education || profileData.education,
        portfolio: formData.portfolio || profileData.portfolio,
        socialLinks: formData.socialLinks || profileData.socialLinks,
        hourlyRate: formData.hourlyRate || profileData.hourlyRate,
        availability: formData.availability || profileData.availability,
        languages: formData.languages || profileData.languages,
        certifications: formData.certifications || profileData.certifications,
        bio: formData.bio || profileData.bio,
        avatar: formData.avatar || profileData.avatar,
        phone: formData.phone || profileData.phone,
        location: formData.location || profileData.location
      }
      
      setProfileData(updatedProfile)
      setLocalStorage('profile', updatedProfile)
      

      updateUser({
        name: formData.name || user?.name,
        email: formData.email || user?.email,
        role: formData.role || user?.role
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(profileData || {})
    setErrors({})
    setIsEditing(false)
  }

  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.skills || []
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill]
    
    setFormData(prev => ({ ...prev, skills: newSkills }))
  }

  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuer || !newCertification.date) return

    const certification = {
      id: Date.now().toString(),
      name: newCertification.name,
      issuer: newCertification.issuer,
      date: newCertification.date,
      url: newCertification.url || undefined
    }

    const updatedCertifications = [...(formData.certifications || []), certification]
    setFormData(prev => ({ ...prev, certifications: updatedCertifications }))
    
    setNewCertification({ name: '', issuer: '', date: '', url: '' })
    setShowAddCertification(false)
  }

  const handleRemoveCertification = (id: string) => {
    const updatedCertifications = (formData.certifications || []).filter(cert => cert.id !== id)
    setFormData(prev => ({ ...prev, certifications: updatedCertifications }))
  }

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = formData.languages || []
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language]
    
    setFormData(prev => ({ ...prev, languages: newLanguages }))
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your profile information and settings</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    profileData.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-center bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  profileData.name
                )}
              </h2>
              
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}

              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{profileData.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({profileData.totalProjects} reviews)</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                <Briefcase className="w-4 h-4" />
                <span className="capitalize">{profileData.role}</span>
                <span>•</span>
                <span>Member since {new Date(profileData.joinDate).getFullYear()}</span>
              </div>

              {profileData.role === 'freelancer' && profileData.hourlyRate && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4">
                  <span className="font-semibold">${profileData.hourlyRate}/hr</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  profileData.availability === 'available' ? 'bg-green-500' :
                  profileData.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="capitalize">{profileData.availability}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Email"
                  />
                ) : (
                  <span className="text-gray-600">{profileData.email}</span>
                )}
              </div>
              
              {errors.email && (
                <p className="text-sm text-red-600 ml-7">{errors.email}</p>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Phone"
                  />
                ) : (
                  <span className="text-gray-600">{profileData.phone || 'Not provided'}</span>
                )}
              </div>
              
              {errors.phone && (
                <p className="text-sm text-red-600 ml-7">{errors.phone}</p>
              )}

              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Location"
                  />
                ) : (
                  <span className="text-gray-600">{profileData.location || 'Not specified'}</span>
                )}
              </div>
            </div>

            {/* Social Links */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Social Links</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.socialLinks?.github || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, github: e.target.value }
                      }))}
                      className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, website: e.target.value }
                      }))}
                      className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      placeholder="Website URL"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {['overview', 'skills', 'experience', 'certifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  {isEditing ? (
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="input-field"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profileData.totalProjects}</div>
                    <div className="text-sm text-gray-600">Total Projects</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData.completedProjects}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData.rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'].map((language) => (
                      <button
                        key={language}
                        onClick={() => isEditing && handleLanguageToggle(language)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          (formData.languages || []).includes(language)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'Vue.js', 'Angular', 'Django', 'Flask', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'Agile', 'Scrum'].map((skill) => (
                      <button
                        key={skill}
                        onClick={() => isEditing && handleSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          (formData.skills || []).includes(skill)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {profileData.role === 'freelancer' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience Level</h3>
                    {isEditing ? (
                      <select
                        value={formData.experience || 'entry'}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        className="input-field"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                        {profileData.experience}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  {isEditing ? (
                    <textarea
                      value={formData.education || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Your educational background..."
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.education || 'No education information provided'}</p>
                  )}
                </div>

                {profileData.role === 'freelancer' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfolio</h3>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.portfolio || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                        className="input-field"
                        placeholder="Portfolio website URL"
                      />
                    ) : (
                      <p className="text-gray-600">
                        {profileData.portfolio ? (
                          <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profileData.portfolio}
                          </a>
                        ) : (
                          'No portfolio link provided'
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddCertification(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(formData.certifications || []).map((cert) => (
                    <div key={cert.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                        <p className="text-sm text-gray-500">{cert.date}</p>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            View Certificate
                          </a>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCertification(cert.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {(formData.certifications || []).length === 0 && (
                    <p className="text-gray-500 text-center py-8">No certifications added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddCertification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Certification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., AWS Certified Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Obtained</label>
                <input
                  type="date"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL (Optional)</label>
                <input
                  type="url"
                  value={newCertification.url}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, url: e.target.value }))}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddCertification(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                className="btn-primary"
              >
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile