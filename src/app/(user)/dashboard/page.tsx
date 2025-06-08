'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { logout } from '../../../store/authSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  User as UserIcon, 
  Trophy, 
  MapPin, 
  Vote, 
  Camera, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  Star,
  Clock,
  Users,
  Target,
  CheckCircle,
  Play,
  Medal,
  Zap,
  Calendar,
  Award,
  Image as ImageIcon,
  Heart,
  Activity,
  Briefcase,
  Mail,
  Edit,
  Upload,
  Send,
  Eye,
  Plus,
  Timer,
  ArrowRight
} from 'lucide-react';

type Activity = {
  id: number;
  type: string;
  title: string;
  status: string;
  description: string;
  points: number;
  deadline: string;
  progress: number;
  questions?: number;
  timeLimit?: string;
  cluesFound?: number;
  totalClues?: number;
  currentClue?: string;
  options?: Array<{ id: number; text: string; votes: number }>;
  score?: number;
  totalQuestions?: number;
};

// Move static data outside component
const activities = [
  {
    id: 1,
    type: 'quiz',
    title: 'JavaScript Fundamentals Quiz',
    status: 'available',
    description: 'Test your knowledge of JavaScript basics',
    points: 50,
    deadline: '2 days left',
    progress: 0,
    questions: 15,
    timeLimit: '30 min'
  },
  // ... rest of the activities array
];

const notifications = [
  { id: 1, title: 'New Quiz Available', message: 'Team Alpha has a new quiz to complete', time: '2 hours ago', type: 'quiz' },
  { id: 2, title: 'Treasure Hunt Update', message: 'Your clue has been approved!', time: '4 hours ago', type: 'treasure' },
  { id: 3, title: 'Voting Ends Soon', message: 'Office Event voting ends in 2 hours', time: '6 hours ago', type: 'vote' }
];

const teamMembers = [
  { id: 1, name: 'John Doe', role: 'Lead Developer', points: 450, avatar: 'JD' },
  // ... rest of the team members array
];

export default function UserDashboardUI() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.push('/login');
  }, [dispatch, router]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'quiz': return Target;
      case 'treasure': return MapPin;
      case 'vote': return Vote;
      default: return Activity;
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleActivitySelect = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  const handleImageUploadToggle = useCallback(() => {
    setShowImageUpload(prev => !prev);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-First Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Welcome back, {user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="bg-white border-b overflow-x-auto">
          <div className="flex space-x-8 px-4 sm:px-6 lg:px-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'activities', label: 'Activities', icon: Zap },
              { id: 'team', label: 'My Team', icon: Users },
              { id: 'profile', label: 'Profile', icon: UserIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* User Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.points || 0}</p>
                      <p className="text-xs text-gray-600">Total Points</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Medal className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">#{user.rank || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Team Rank</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{user.activeChallenges || 0}</p>
                      <p className="text-xs text-gray-600">Active Challenges</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-xs text-gray-600">Hunts Joined</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Info */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{user.team?.name || 'No Team'}</h2>
                    <p className="opacity-90">You're part of an amazing team!</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">5 Members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Rank #{user.rank || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <Trophy className="h-16 w-16 opacity-20" />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <li key={activity.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {(() => {
                              const Icon = getTypeIcon(activity.type);
                              return <Icon className="h-5 w-5 text-gray-400" />;
                            })()}
                            <p className="ml-2 text-sm font-medium text-gray-900">{activity.title}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{activity.deadline}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="relative px-6 pb-6">
                  <div className="flex items-end space-x-4 -mt-16">
                    <div className="relative">
                      <div className="h-24 w-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <button className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {user.role}
                        </span>
                        <span className="text-sm text-gray-600">{user.employeeCode}</span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Employee Code</p>
                        <p className="text-gray-900">{user.employeeCode || 'Not assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Gender</p>
                        <p className="text-gray-900 capitalize">{user.gender || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Department</p>
                        <p className="text-gray-900">{user.department || 'Not assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hobbies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.hobbies && user.hobbies.length > 0 ? (
                            user.hobbies.map((hobby) => (
                              <span key={hobby} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                                {hobby}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No hobbies specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Information */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                  <div className="space-y-4">
                    {user.team ? (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <Trophy className="h-6 w-6 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">{user.team.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Team ID</p>
                            <p className="font-semibold">{user.team.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Member Since</p>
                            <p className="font-semibold">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-600">Not part of any team yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Available Activities</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <li key={activity.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {(() => {
                              const Icon = getTypeIcon(activity.type);
                              return <Icon className="h-5 w-5 text-gray-400" />;
                            })()}
                            <p className="ml-2 text-sm font-medium text-gray-900">{activity.title}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{activity.deadline}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => handleActivitySelect(activity)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Details
                            <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Team Members</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <li key={member.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-900">{member.avatar}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm leading-5 font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm leading-5 text-gray-500">{member.role}</div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex">
                            <p className="text-sm leading-5 font-medium text-gray-900">{member.points} Points</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}