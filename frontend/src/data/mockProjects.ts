import type { Project } from '../types/project'

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Development with React and Node.js',
    description: 'Need a modern, responsive e-commerce website with product catalog, shopping cart, payment integration (Stripe), and admin dashboard. The site should be mobile-friendly and optimized for SEO.',
    budget: { min: 2000, max: 5000 },
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript'],
    category: 'Web Development',
    postedBy: {
      id: 'user1',
      name: 'TechCorp Inc.',
      rating: 4.8
    },
    postedDate: '2024-01-15T10:30:00Z',
    proposals: 12,
    status: 'open',
    location: 'Remote',
    duration: '2-3 months',
    experience: 'intermediate'
  },
  {
    id: '2',
    title: 'Mobile App for Food Delivery Service',
    description: 'Looking for a skilled developer to create a food delivery app with real-time tracking, push notifications, payment processing, and restaurant management features.',
    budget: { min: 3000, max: 8000 },
    skills: ['React Native', 'Firebase', 'Google Maps API', 'Node.js'],
    category: 'Mobile Development',
    postedBy: {
      id: 'user2',
      name: 'FoodExpress',
      rating: 4.9
    },
    postedDate: '2024-01-14T15:45:00Z',
    proposals: 8,
    status: 'open',
    location: 'Remote',
    duration: '3-4 months',
    experience: 'expert'
  },
  {
    id: '3',
    title: 'Logo and Brand Identity Design Package',
    description: 'Need a professional logo design and complete brand identity package including business cards, letterhead, and social media templates for a new startup.',
    budget: { min: 500, max: 1500 },
    skills: ['Logo Design', 'Brand Identity', 'Illustrator', 'Photoshop'],
    category: 'Design',
    postedBy: {
      id: 'user3',
      name: 'StartupXYZ',
      rating: 4.7
    },
    postedDate: '2024-01-13T09:20:00Z',
    proposals: 25,
    status: 'open',
    location: 'Remote',
    duration: '2-3 weeks',
    experience: 'intermediate'
  },
  {
    id: '4',
    title: 'Content Writing for Technology Blog',
    description: 'Seeking a skilled content writer to create engaging articles about technology trends, software reviews, and industry insights. Must have experience in tech writing.',
    budget: { min: 300, max: 800 },
    skills: ['Content Writing', 'SEO', 'Technology', 'Blog Writing'],
    category: 'Content Writing',
    postedBy: {
      id: 'user4',
      name: 'TechBlog Media',
      rating: 4.6
    },
    postedDate: '2024-01-12T14:15:00Z',
    proposals: 18,
    status: 'open',
    location: 'Remote',
    duration: 'Ongoing',
    experience: 'entry'
  },
  {
    id: '5',
    title: 'Data Analysis and Visualization Dashboard',
    description: 'Need to create an interactive dashboard for business analytics with data visualization, real-time updates, and export functionality.',
    budget: { min: 1500, max: 4000 },
    skills: ['Python', 'Data Analysis', 'Tableau', 'SQL', 'JavaScript'],
    category: 'Data Science',
    postedBy: {
      id: 'user5',
      name: 'Analytics Corp',
      rating: 4.9
    },
    postedDate: '2024-01-11T11:00:00Z',
    proposals: 6,
    status: 'open',
    location: 'Remote',
    duration: '1-2 months',
    experience: 'expert'
  }
]

export const categories = [
  'Web Development',
  'Mobile Development',
  'Design',
  'Content Writing',
  'Data Science',
  'Marketing',
  'Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech'
]

export const skills = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'SQL',
  'React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'AWS', 'Docker',
  'Logo Design', 'UI/UX', 'Photoshop', 'Illustrator', 'Figma', 'Sketch',
  'Content Writing', 'SEO', 'Copywriting', 'Blog Writing', 'Technical Writing',
  'Data Analysis', 'Machine Learning', 'Tableau', 'Power BI', 'Excel',
  'Digital Marketing', 'Social Media', 'Google Ads', 'Facebook Ads', 'Email Marketing'
]
