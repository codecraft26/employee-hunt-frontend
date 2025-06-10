// components/user/UserOverviewTab.tsx
'use client';

import { useMemo, useCallback } from 'react';
import { 
  Trophy, 
  Medal, 
  Target, 
  MapPin, 
  Users, 
  Award, 
  Star, 
  Clock, 
  Activity as ActivityIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useActivities, Activity } from '../../hooks/useActivities';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/teams';

interface UserOverviewTabProps {
  user: any; // Replace with proper User type
}

const UserOverviewTab: React.FC<UserOverviewTabProps> = ({ user }) => {
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
    myTeam,
    fetchMyTeam,
    clearError: clearTeamsError,
  } = useTeams();

  // Get React icon component from string name
  const getIconComponent = useCallback((iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Target,
      Medal,
      Trophy,
      MapPin,
      ActivityIcon,
    };
    return iconMap[iconName] || ActivityIcon;
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

  return (
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
            <h2 className="text-2xl font-bold mb-2 text-white">{userTeam?.name || 'No Team'}</h2>
            <p className="opacity-90 text-indigo-100">
              {userTeam && 'description' in userTeam ? 
                `You're part of an amazing team! ${userTeam.description || ''}` : 
                userTeam ?
                "You're part of an amazing team!" :
                "You haven't been assigned to a team yet."
              }
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-indigo-200" />
                <span className="text-sm text-indigo-100">{userTeam ? `${teamMembers.length} Members` : 'No team'}</span>
              </div>
              {userTeam && 'score' in userTeam && (
                <>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-indigo-200" />
                    <span className="text-sm text-indigo-100">{userTeam.score} Points</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-indigo-200" />
                    <span className="text-sm text-indigo-100">Team Rank #1</span>
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
  );
};

export default UserOverviewTab;