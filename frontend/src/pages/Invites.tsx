import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Clock, 
  DollarSign, 
  MapPin, 
  Check, 
  X, 
  Eye, 
  Star,
  User,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'
import Loading from '../components/ui/Loading'

interface Invite {
  _id: string
  projectId: string
  projectTitle: string
  projectDescription: string
  clientId: string
  clientName: string
  clientRating: number
  freelancerId: string
  freelancerName: string
  message: string
  budget: {
    min: number
    max: number
  }
  duration: string
  location: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: string
  expiresAt: string
  skills: string[]
}

const Invites = () => {
  const { user, getUserId } = useAuth()
  const { showSuccess, showError } = useToast()
  const [invites, setInvites] = useState<Invite[]>([])
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null)
  const [showInviteDetails, setShowInviteDetails] = useState(false)

  useEffect(() => {
    loadInvites()
  }, [])

  useEffect(() => {
    filterInvites()
  }, [invites, statusFilter])

  const loadInvites = async () => {
    try {
      setIsLoading(true)
      const response = await api.getInvites() as { invites: Invite[] }
      setInvites(response.invites || [])
    } catch (error: any) {
      console.error('Error loading invites:', error)
      showError('Failed to load invites', error.message)
      
      // Fallback to localStorage if API fails
      const savedInvites = localStorage.getItem('invites')
      if (savedInvites) {
        setInvites(JSON.parse(savedInvites))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvites = () => {
    if (statusFilter === 'all') {
      setFilteredInvites(invites)
    } else {
      setFilteredInvites(invites.filter(invite => invite.status === statusFilter))
    }
  }

  const handleInviteAction = async (inviteId: string, action: 'accept' | 'decline') => {
    setIsProcessing(true)
    try {
      await api.respondToInvite(inviteId, action)
      
      const updatedInvites = invites.map(invite => 
        invite._id === inviteId 
          ? { ...invite, status: action === 'accept' ? 'accepted' : 'declined' }
          : invite
      )
      
      setInvites(updatedInvites as Invite[])
      
      // Save to localStorage as fallback
      localStorage.setItem('invites', JSON.stringify(updatedInvites))
      
      showSuccess(
        `Invitation ${action === 'accept' ? 'accepted' : 'declined'} successfully!`
      )
      
      // If accepted, create a project application
      if (action === 'accept') {
        const invite = invites.find(i => i._id === inviteId)
        if (invite) {
          try {
            // In a real app, you'd call an API to create an application
            const applications = JSON.parse(localStorage.getItem('applications') || '[]')
            const newApplication = {
              _id: Date.now().toString(),
              projectId: invite.projectId,
              projectTitle: invite.projectTitle,
              freelancerId: getUserId(),
              freelancerName: user?.name,
              coverLetter: `I'm excited to work on this project! I accept the invitation and look forward to collaborating.`,
              proposedBudget: invite.budget.max,
              estimatedDuration: invite.duration,
              submittedAt: new Date().toISOString(),
              status: 'accepted'
            }
            applications.push(newApplication)
            localStorage.setItem('applications', JSON.stringify(applications))
          } catch (error) {
            console.error('Error creating application:', error)
          }
        }
      }
    } catch (error: any) {
      console.error('Error updating invite:', error)
      showError(
        `Failed to ${action} invitation`, 
        error.message
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <Check className="w-4 h-4" />
      case 'declined': return <X className="w-4 h-4" />
      case 'expired': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Loading invites..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Invites</h1>
        <p className="text-gray-600">Manage your project invitations and opportunities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{invites.length}</div>
          <div className="text-sm text-gray-600">Total Invites</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {invites.filter(i => i.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {invites.filter(i => i.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {invites.filter(i => i.status === 'declined').length}
          </div>
          <div className="text-sm text-gray-600">Declined</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'accepted', 'declined'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        {filteredInvites.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invites found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? "You don't have any project invites yet." 
                : `No ${statusFilter} invites found.`
              }
            </p>
          </div>
        ) : (
          filteredInvites.map((invite) => (
            <motion.div
              key={invite._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                      {invite.projectTitle}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                      {getStatusIcon(invite.status)}
                      {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{invite.projectDescription}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{invite.clientName}</span>
                      <div className="flex items-center gap-1 text-yellow-500 ml-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{invite.clientRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${invite.budget.min.toLocaleString()} - ${invite.budget.max.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{invite.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{invite.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {invite.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {invite.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{invite.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Message from client:</strong> "{invite.message}"
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Sent {formatDate(invite.sentAt)}
                  {invite.status === 'pending' && (
                    <span className="ml-2">
                      • Expires {formatDate(invite.expiresAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedInvite(invite)
                      setShowInviteDetails(true)
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {invite.status === 'pending' && !isExpired(invite.expiresAt) && (
                    <>
                      <button
                        onClick={() => handleInviteAction(invite._id, 'accept')}
                        disabled={isProcessing}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleInviteAction(invite._id, 'decline')}
                        disabled={isProcessing}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Invite Details Modal */}
      {showInviteDetails && selectedInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedInvite.projectTitle}</h3>
              <button
                onClick={() => setShowInviteDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                <p className="text-gray-600">{selectedInvite.projectDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Client</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{selectedInvite.clientName}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{selectedInvite.clientRating}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                  <p className="text-gray-600">${selectedInvite.budget.min.toLocaleString()} - ${selectedInvite.budget.max.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                  <p className="text-gray-600">{selectedInvite.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <p className="text-gray-600">{selectedInvite.location}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInvite.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Client Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 italic">"{selectedInvite.message}"</p>
                </div>
              </div>
              
              {selectedInvite.status === 'pending' && !isExpired(selectedInvite.expiresAt) && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleInviteAction(selectedInvite._id, 'decline')}
                    className="btn-secondary"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleInviteAction(selectedInvite._id, 'accept')}
                    className="btn-primary"
                  >
                    Accept Invitation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invites 