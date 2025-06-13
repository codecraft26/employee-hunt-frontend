// pages/user/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { logout } from '../../../store/authSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import UserPollsTab from '../../../components/user/UserPollsTab';
import UserOverviewTab from '../../../components/user/UserOverviewTab';
import UserActivitiesTab from '../../../components/user/UserActivitiesTab';
import UserProfileTab from '../../../components/user/UserProfileTab';
import UserTeamTab from '../../../components/user/UserTeamTab';
import UserQuizTab from '../../../components/user/UserQuizTab';
import UserTreasureHuntTab from '../../../components/user/UserTreasureHuntTab';
import { useActivities } from '../../../hooks/useActivities';
import { useTeams } from '../../../hooks/useTeams';
import { 
  User as UserIcon, 
  Trophy, 
  Vote, 
  Bell, 
  LogOut,
  Users,
  Shield,
  Zap,
  Activity as ActivityIcon,
  MapPin,
} from 'lucide-react';

// Static notifications data
const notifications = [
  { id: 1, title: 'New Quiz Available', message: 'Team Alpha has a new quiz to complete', time: '2 hours ago', type: 'quiz' },
  { id: 2, title: 'Treasure Hunt Update', message: 'Your clue has been approved!', time: '4 hours ago', type: 'treasure' },
  { id: 3, title: 'Voting Ends Soon', message: 'Office Event voting ends in 2 hours', time: '6 hours ago', type: 'vote' }
];

export default function UserDashboardUI() {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Activities hook for initial data fetching
  const { fetchActivities } = useActivities();
  
  // Teams hook for initial data fetching
  const { fetchMyTeam } = useTeams();

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  // Fetch initial data on component mount
  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchMyTeam();
    }
  }, [user, fetchActivities, fetchMyTeam]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.push('/login');
  }, [dispatch, router]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <UserOverviewTab user={user} />;
      case 'activities':
        return <UserActivitiesTab />;
      case 'polls':
        return (
          <UserPollsTab 
            onVoteSuccess={() => {
              console.log('User voted successfully');
            }} 
          />
        );
      case 'team':
        return <UserTeamTab user={user} />;
      case 'profile':
        return <UserProfileTab user={user} />;
      case 'quiz':
        return <UserQuizTab />;
      case 'treasureHunt':
        return <UserTreasureHuntTab />;
      default:
        return <UserOverviewTab user={user} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="relative w-full h-40 sm:h-56 md:h-64 rounded-b-3xl overflow-hidden mb-2">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Trip Games Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 px-6 pt-8 pb-4 flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow">Trip Games</h1>
              <p className="text-white text-base sm:text-lg opacity-90">Let's play together!</p>
            </div>
          </div>
        </div>
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
              { id: 'quiz', label: 'Quiz', icon: Shield },
              { id: 'treasureHunt', label: 'Treasure Hunt', icon: MapPin },
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
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveTab()}
        </div>
      </div>
    </ProtectedRoute>
  );
}