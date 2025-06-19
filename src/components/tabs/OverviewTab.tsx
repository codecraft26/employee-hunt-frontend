// components/tabs/OverviewTab.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Trophy, 
  AlertCircle, 
  Plus,
  Target,
  MapPin,
  Vote,
  Building2,
  User,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';

interface QuickAction {
  title: string;
  icon: any;
  color: string;
  type: string;
}

interface OverviewTabProps {
  onQuickAction?: (type: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onQuickAction }) => {
  const router = useRouter();
  const {
    loading,
    error,
    stats,
    fetchDashboardStats,
    refreshStats,
    getFormattedStats,
    getActivityTypeInfo,
    getStatusColor,
    clearError
  } = useAdminStats();

  // Fetch stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const quickActions: QuickAction[] = [
    { title: 'Create Quiz', icon: Target, color: 'from-blue-500 to-blue-600', type: 'create-quiz' },
    { title: 'Start Treasure Hunt', icon: MapPin, color: 'from-green-500 to-green-600', type: 'create-hunt' },
    { title: 'Create Poll/Vote', icon: Vote, color: 'from-purple-500 to-purple-600', type: 'create-poll' },
    { title: 'Manage Teams', icon: Users, color: 'from-orange-500 to-orange-600', type: 'create-team' },
    { title: 'Manage Categories', icon: Building2, color: 'from-indigo-500 to-indigo-600', type: 'create-category' },
    { title: 'Manage Approval', icon: User, color: 'from-pink-500 to-pink-600', type: 'approve-user' }
  ];

  const handleQuickAction = (type: string) => {
    console.log(`Quick action: ${type}`);
    
    // Use parent's quick action handler if provided, otherwise use router navigation
    if (onQuickAction) {
      onQuickAction(type);
      return;
    }
    
    // Navigate to appropriate route based on quick action (fallback)
    switch (type) {
      case 'quiz':
      case 'create-quiz':
        router.push('/admin/quizzes');
        break;
      case 'treasure':
      case 'create-hunt':
        router.push('/admin/treasure-hunts');
        break;
      case 'poll':
      case 'create-poll':
        router.push('/admin/polls');
        break;
      case 'team':
      case 'create-team':
        router.push('/admin/teams');
        break;
      case 'create-category':
        router.push('/admin/categories');
        break;
      case 'approve-user':
        router.push('/admin/approveUser');
        break;
      default:
        console.log(`Unhandled quick action: ${type}`);
    }
  };

  const handleRefresh = async () => {
    clearError();
    await refreshStats();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return Target;
      case 'VOTE':
        return Vote;
      case 'TREASURE_HUNT':
        return MapPin;
      case 'TEAM':
        return Users;
      case 'USER':
        return User;
      default:
        return Activity;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's key metrics and recent activities</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-gray-700">Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Failed to load dashboard statistics</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Block - Statistics Cards */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            
            {/* Total Teams Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Teams</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalTeams}</p>
                  )}
                </div>
                <div className="p-2 lg:p-3 bg-blue-100 rounded-lg lg:rounded-xl">
                  <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Active Users</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                  )}
                </div>
                <div className="p-2 lg:p-3 bg-green-100 rounded-lg lg:rounded-xl">
                  <Activity className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Active Contests Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Active Contests</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.activeContests}</p>
                  )}
                </div>
                <div className="p-2 lg:p-3 bg-purple-100 rounded-lg lg:rounded-xl">
                  <Trophy className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Approvals Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Approvals</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl lg:text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
                  )}
                </div>
                <div className="p-2 lg:p-3 bg-orange-100 rounded-lg lg:rounded-xl">
                  <AlertCircle className="h-4 w-4 lg:h-6 lg:w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <span className="text-sm text-gray-500">
                  {stats.recentActivities.length} activities
                </span>
              </div>
            </div>
            
            <div className="p-4 lg:p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivities.slice(0, 5).map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const typeInfo = getActivityTypeInfo(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
                          <IconComponent className={`h-4 w-4 ${typeInfo.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              by {activity.createdBy.name}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Block - Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-sm lg:text-base text-gray-600">Manage your platform efficiently</p>
          </div>
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border p-4 lg:p-6">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.type)}
                  className={`group relative overflow-hidden rounded-lg lg:rounded-xl p-4 lg:p-6 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r ${action.color}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <action.icon className="h-6 w-6 lg:h-8 lg:w-8 mb-2 lg:mb-3 opacity-90" />
                    <h3 className="font-semibold text-xs lg:text-sm leading-tight">{action.title}</h3>
                  </div>
                  <Plus className="absolute top-2 right-2 lg:top-3 lg:right-3 h-3 w-3 lg:h-4 lg:w-4 opacity-70 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              ))}
            </div>
          </div>

          {/* Pending Approvals Alert (if any) */}
          {!loading && stats.pendingApprovals > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl lg:rounded-2xl shadow-sm text-white">
              <div className="p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6" />
                  <div>
                    <h4 className="font-semibold">Attention Required</h4>
                    <p className="text-sm opacity-90 mt-1">
                      {stats.pendingApprovals} user{stats.pendingApprovals !== 1 ? 's' : ''} waiting for approval
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleQuickAction('approve-user')}
                  className="mt-4 w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors rounded-lg py-2 px-4 text-sm font-medium"
                >
                  Review Pending Users
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;