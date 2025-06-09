'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { logout } from '../../../store/authSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import UserPollsTab from '../../../components/user/UserPollsTab';
import { useActivities, Activity } from '../../../hooks/useActivities';
import { useTeams } from '../../../hooks/useTeams';
import { Team } from '../../../types/teams';
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
  Activity as ActivityIcon,
  Briefcase,
  Mail,
  Edit,
  Upload,
  Send,
  Eye,
  Plus,
  Timer,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

// Static notifications data
const notifications = [
  { id: 1, title: 'New Quiz Available', message: 'Team Alpha has a new quiz to complete', time: '2 hours ago', type: 'quiz' },
  { id: 2, title: 'Treasure Hunt Update', message: 'Your clue has been approved!', time: '4 hours ago', type: 'treasure' },
  { id: 3, title: 'Voting Ends Soon', message: 'Office Event voting ends in 2 hours', time: '6 hours ago', type: 'vote' }
];

const teamMembers = [
  { id: 1, name: 'John Doe', role: 'Lead Developer', points: 450, avatar: 'JD' },
  { id: 2, name: 'Sarah Smith', role: 'UI Designer', points: 380, avatar: 'SS' },
  { id: 3, name: 'Mike Johnson', role: 'Backend Developer', points: 420, avatar: 'MJ' },
  { id: 4, name: 'Emily Davis', role: 'Product Manager', points: 350, avatar: 'ED' },
  { id: 5, name: 'Chris Wilson', role: 'QA Engineer', points: 290, avatar: 'CW' }
];

export default function UserDashboardUI() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  // Activities hook
  const {
    loading: activitiesLoading,
    error: activitiesError,
    activities,
    fetchActivities,
    clearError: clearActivitiesError,
    getActivityTypeIcon,
    getActivityTypeDisplay,
    getActivityStatusColor,
    formatActivityDate,
  } = useActivities();

  // Teams hook for fetching user's team data
  const {
    loading: teamsLoading,
    error: teamsError,
    teams,
    myTeam,
    fetchTeams,
    fetchMyTeam,
    clearError: clearTeamsError,
  } = useTeams();

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  // Fetch activities and user's team on component mount
  useEffect(() => {
    fetchActivities();
    fetchMyTeam(); // Use the specific endpoint for user's team
  }, [fetchActivities, fetchMyTeam]);

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
      default: return ActivityIcon;
    }
  }, []);

  // Get React icon component from string name
  const getIconComponent = useCallback((iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Target,
      Vote,
      CheckCircle,
      MapPin,
      Trophy,
      ActivityIcon,
    };
    return iconMap[iconName] || ActivityIcon;
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Fetch activities when switching to activities tab
    if (tab === 'activities') {
      fetchActivities();
    }
  }, [fetchActivities]);

  const handleActivitySelect = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  const handleImageUploadToggle = useCallback(() => {
    setShowImageUpload(prev => !prev);
  }, []);

  const handleRefreshActivities = useCallback(() => {
    clearActivitiesError();
    fetchActivities();
  }, [fetchActivities, clearActivitiesError]);

  // Get recent activities for overview (limit to 5)
  const recentActivities = useMemo(() => {
    return activities.slice(0, 5);
  }, [activities]);

  // Get user's team from the dedicated myTeam state
  const userTeam = useMemo(() => {
    return (myTeam || user?.team || null) as Team | null;
  }, [myTeam, user?.team]);

  // Get team members from the user's team (with proper type checking)
  const teamMembers = useMemo(() => {
    if (!userTeam || !userTeam.members) return [];
    return userTeam.members;
  }, [userTeam]);

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
              { id: 'overview', label: 'Overview', icon: ActivityIcon },
              { id: 'activities', label: 'Activities', icon: Zap },
              { id: 'polls', label: 'Polls', icon: Vote },
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
                      <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                      <p className="text-xs text-gray-600">Total Activities</p>
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
                    <h2 className="text-2xl font-bold mb-2">{userTeam?.name || 'No Team'}</h2>
                    <p className="opacity-90">
                      {userTeam && 'description' in userTeam ? 
                        `You're part of an amazing team! ${userTeam.description || ''}` : 
                        userTeam ?
                        "You're part of an amazing team!" :
                        "You haven't been assigned to a team yet."
                      }
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{userTeam ? `${teamMembers.length} Members` : 'No team'}</span>
                      </div>
                      {userTeam && 'score' in userTeam && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Award className="h-4 w-4" />
                            <span className="text-sm">{userTeam.score} Points</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">Team Rank #1</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Trophy className="h-16 w-16 opacity-20" />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                  {activitiesLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  )}
                </div>
                <div className="border-t border-gray-200">
                  {activitiesError ? (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <p className="text-red-700 text-sm">{activitiesError}</p>
                        </div>
                        <button
                          onClick={handleRefreshActivities}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <div className="px-4 py-8 sm:px-6 text-center">
                      <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No activities found</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {recentActivities.map((activity) => {
                        const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
                        return (
                          <li key={activity.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <IconComponent className="h-5 w-5 text-gray-400" />
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                  <p className="text-sm text-gray-500">{activity.description}</p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityStatusColor(activity.type)}`}>
                                  {getActivityTypeDisplay(activity.type)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  Created by {activity.user.name}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                <p>{formatActivityDate(activity.createdAt)}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <UserPollsTab onVoteSuccess={() => {
              // Handle vote success - could update user stats, etc.
              console.log('User voted successfully');
            }} />
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Available Activities</h3>
                </div>
                <div className="border-t border-gray-200">
                  {activitiesError ? (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="p-4 bg-red-50 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-700 text-sm">{activitiesError}</p>
                          <button
                            onClick={handleRefreshActivities}
                            className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : activities.length === 0 && !activitiesLoading ? (
                    <div className="px-4 py-8 sm:px-6 text-center">
                      <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No activities found</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {activitiesLoading && activities.length === 0 ? (
                        // Loading state
                        Array.from({ length: 3 }).map((_, index) => (
                          <li key={index} className="px-4 py-4 sm:px-6">
                            <div className="animate-pulse">
                              <div className="flex items-center space-x-4">
                                <div className="h-5 w-5 bg-gray-300 rounded"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        activities.map((activity) => {
                          const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
                          return (
                            <li key={activity.id} className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <IconComponent className="h-5 w-5 text-gray-400" />
                                  <p className="ml-2 text-sm font-medium text-gray-900">{activity.title}</p>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityStatusColor(activity.type)}`}>
                                    {getActivityTypeDisplay(activity.type)}
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
                                  <p>{formatActivityDate(activity.createdAt)}</p>
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
                          );
                        })
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Activity Details Modal/Panel */}
              {selectedActivity && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Details</h3>
                      <button
                        onClick={() => setSelectedActivity(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedActivity.title}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                          <dd className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityStatusColor(selectedActivity.type)}`}>
                              {getActivityTypeDisplay(selectedActivity.type)}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedActivity.description}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Created By</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedActivity.user.name}
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {selectedActivity.user.role}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Created At</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(selectedActivity.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </dd>
                        </div>
                        {selectedActivity.referenceId && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Reference ID</dt>
                            <dd className="mt-1 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                              {selectedActivity.referenceId}
                            </dd>
                          </div>
                        )}
                        {selectedActivity.imageUrl && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Image</dt>
                            <dd className="mt-1">
                              <img 
                                src={selectedActivity.imageUrl} 
                                alt={selectedActivity.title}
                                className="h-32 w-32 object-cover rounded-lg border"
                              />
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    {userTeam ? (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <Trophy className="h-6 w-6 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">{userTeam.name}</h4>
                        </div>
                        <div className="space-y-3">
                          {'description' in userTeam && userTeam.description && (
                            <p className="text-sm text-gray-700">{userTeam.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {'score' in userTeam && (
                              <div>
                                <p className="text-gray-600">Team Score</p>
                                <p className="font-semibold text-indigo-600">{userTeam.score} points</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-600">Members</p>
                              <p className="font-semibold">{teamMembers.length} people</p>
                            </div>
                            {'createdAt' in userTeam && (
                              <div>
                                <p className="text-gray-600">Created</p>
                                <p className="font-semibold">
                                  {new Date(userTeam.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {'updatedAt' in userTeam && (
                              <div>
                                <p className="text-gray-600">Last Updated</p>
                                <p className="font-semibold">
                                  {new Date(userTeam.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Not part of any team yet</p>
                        <p className="text-gray-500 text-sm mt-1">Contact your administrator to be assigned to a team</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Header */}
              {userTeam && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{userTeam.name}</h2>
                      <p className="opacity-90 mb-3">
                        {'description' in userTeam ? userTeam.description || 'Team description' : 'Team description'}
                      </p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>{teamMembers.length} Members</span>
                        </div>
                        {'score' in userTeam && (
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5" />
                            <span>{userTeam.score} Points</span>
                          </div>
                        )}
                        {'createdAt' in userTeam && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Since {new Date(userTeam.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Trophy className="h-16 w-16 opacity-20" />
                  </div>
                </div>
              )}

              {/* Team Members */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {userTeam ? `${userTeam.name} Members` : 'Team Members'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {userTeam ? 
                        `Meet your ${teamMembers.length} team member${teamMembers.length !== 1 ? 's' : ''}` :
                        'You are not assigned to any team yet'
                      }
                    </p>
                  </div>
                  {teamsLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  )}
                </div>
                <div className="border-t border-gray-200">
                  {teamsError ? (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="p-4 bg-red-50 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-700 text-sm">{teamsError}</p>
                          <button
                            onClick={() => {
                              clearTeamsError();
                              fetchMyTeam();
                            }}
                            className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : !userTeam ? (
                    <div className="px-4 py-8 sm:px-6 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Assigned</h3>
                      <p className="text-gray-600">Contact your administrator to be assigned to a team</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="px-4 py-8 sm:px-6 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No members in this team yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {teamMembers.map((member: any) => (
                        <li key={member.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                  {member.id === user.id && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span>{member.email}</span>
                                  {member.role && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{member.role}</span>
                                    </>
                                  )}
                                </div>
                                {member.department && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Briefcase className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{member.department}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {member.employeeCode && (
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {member.employeeCode}
                                </span>
                              )}
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Member since</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(member.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}