'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { getAllTeams, getAllUsers } from '../../store/teamSlice';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  Users, 
  MapPin, 
  Trophy, 
  UserCheck, 
  TrendingUp, 
  ArrowRight,
  Calendar,
  Award,
  Target,
  Activity
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { teams, users, treasureHunts, isLoading } = useAppSelector((state) => state.team);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllTeams());
    dispatch(getAllUsers());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Teams',
      value: teams.length,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Active Hunts',
      value: treasureHunts.filter(hunt => hunt.status === 'ACTIVE').length,
      icon: MapPin,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Completed Hunts',
      value: treasureHunts.filter(hunt => hunt.status === 'COMPLETED').length,
      icon: Trophy,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  const quickActions = [
    {
      title: 'Team Management',
      description: 'Create teams and manage members',
      icon: Users,
      href: '/admin/teams',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Treasure Hunts',
      description: 'Create and manage treasure hunts',
      icon: MapPin,
      href: '/admin/treasure-hunts',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'User Analytics',
      description: 'View user activity and statistics',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Activity,
      href: '/admin/settings',
      color: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  ];

  const recentActivity = [
    { action: 'New team created', details: 'Team Alpha was created', time: '2 hours ago', icon: Users },
    { action: 'Treasure hunt completed', details: 'Team Beta completed Downtown Quest', time: '4 hours ago', icon: Trophy },
    { action: 'New user registered', details: 'John Doe joined the platform', time: '6 hours ago', icon: UserCheck },
    { action: 'Clue approved', details: 'Clue #3 approved for Team Gamma', time: '8 hours ago', icon: Target }
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {isLoading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="group relative overflow-hidden rounded-xl p-6 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                      style={{ background: action.color }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                          <p className="text-sm opacity-90">{action.description}</p>
                        </div>
                        <div className="ml-4">
                          <action.icon className="h-8 w-8 opacity-80" />
                        </div>
                      </div>
                      <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Team Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Teams Overview</h2>
                  <Link 
                    href="/admin/teams"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.slice(0, 5).map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-600">{team.members.length} members</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No teams created yet</p>
                    <Link 
                      href="/admin/teams"
                      className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
                    >
                      Create your first team
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link 
                  href="/admin/activity"
                  className="block text-center text-indigo-600 hover:text-indigo-700 font-medium mt-4 pt-4 border-t border-gray-200"
                >
                  View All Activity
                </Link>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Status</span>
                    <span className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <span className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message for New Admins */}
          {teams.length === 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mt-8 border border-indigo-200">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Admin Dashboard!</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Get started by creating your first team and setting up treasure hunts. 
                  Use the quick actions above to begin managing your teams and activities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/admin/teams"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Create Your First Team</span>
                  </Link>
                  <Link
                    href="/admin/treasure-hunts"
                    className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Set Up Treasure Hunts</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}