import { Mail, Clock, Check, X, User } from 'lucide-react'

interface Invite {
  id: string
  projectTitle: string
  clientName: string
  message: string
  budget: string
  status: 'pending' | 'accepted' | 'declined'
  receivedDate: string
}

const Invites = () => {
  const invites: Invite[] = [
    {
      id: '1',
      projectTitle: 'E-commerce Website Development',
      clientName: 'TechCorp Inc.',
      message: 'Hi! I saw your profile and I think you would be perfect for our project. We need a skilled developer to build our online store.',
      budget: '$3000 - $5000',
      status: 'pending',
      receivedDate: '2 hours ago'
    },
    {
      id: '2',
      projectTitle: 'Mobile App Design',
      clientName: 'DesignStudio',
      message: 'We are looking for a talented designer to create the UI/UX for our new mobile application.',
      budget: '$1500 - $2500',
      status: 'accepted',
      receivedDate: '1 day ago'
    },
    {
      id: '3',
      projectTitle: 'Content Writing for Blog',
      clientName: 'ContentHub',
      message: 'Need a professional writer to create engaging content for our technology blog.',
      budget: '$500 - $800',
      status: 'declined',
      receivedDate: '3 days ago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100'
      case 'declined':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4" />
      case 'declined':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Invites</h1>
        <p className="text-gray-600">Manage your project invitations and responses</p>
      </div>

      <div className="space-y-6">
        {invites.map((invite) => (
          <div key={invite.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{invite.projectTitle}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  <span>{invite.clientName}</span>
                </div>
                <p className="text-gray-600 mb-4">{invite.message}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invite.status)}`}>
                {getStatusIcon(invite.status)}
                <span className="capitalize">{invite.status}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{invite.receivedDate}</span>
                </div>
                <span className="font-medium text-gray-900">{invite.budget}</span>
              </div>
              
              {invite.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="btn-primary">
                    Accept
                  </button>
                  <button className="btn-secondary">
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Invites 