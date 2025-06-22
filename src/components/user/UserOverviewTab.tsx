// components/user/UserOverviewTab.tsx
'use client';

import { useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Medal, 
  Target, 
  MapPin, 
  Users, 
  Award, 
  Star, 
  Plus,
  Vote,
  Shield,
  Zap,
  Camera,
  Crown,
  ChevronRight,
  Activity as ActivityIcon
} from 'lucide-react';
import { useOptimizedData } from '../../hooks/useOptimizedData';
import { useActivities } from '../../hooks/useActivities';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/teams';

interface UserOverviewTabProps {
  user: any; // Replace with proper User type
}

interface QuickAction {
  title: string;
  icon: any;
  color: string;
  type: string;
}

// Static quick actions - moved outside component to prevent re-creation
const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Take Quiz', icon: Shield, color: 'from-blue-500 to-blue-600', type: 'quiz' },
  { title: 'Join Treasure Hunt', icon: MapPin, color: 'from-green-500 to-green-600', type: 'treasure-hunt' },
  { title: 'Vote in Polls', icon: Vote, color: 'from-purple-500 to-purple-600', type: 'polls' },
  { title: 'Photo Wall', icon: Camera, color: 'from-teal-500 to-teal-600', type: 'photo-wall' },
    { title: 'View Activities', icon: Zap, color: 'from-orange-500 to-orange-600', type: 'activities' },
  { title: 'My Team', icon: Users, color: 'from-indigo-500 to-indigo-600', type: 'team' },
  { title: 'My Profile', icon: Medal, color: 'from-pink-500 to-pink-600', type: 'profile' }
];

const UserOverviewTab: React.FC<UserOverviewTabProps> = memo(({ user }) => {
  const router = useRouter();

  // Call hooks at the top level - this is required by Rules of Hooks
  const { fetchActivities } = useActivities();
  const { fetchMyTeam } = useTeams();

  // Optimized data fetching with caching - now using the hook methods properly
  const { data: activities = [], loading: activitiesLoading } = useOptimizedData(
    `user-activities-${user?.id}`,
    useCallback(async () => {
      return await fetchActivities() || [];
    }, [fetchActivities]),
    { 
      staleTime: 30000, // 30 seconds
      cacheTime: 300000 // 5 minutes
    }
  );

  const { data: myTeam, loading: teamLoading } = useOptimizedData(
    `user-team-${user?.id}`,
    useCallback(async () => {
      return await fetchMyTeam();
    }, [fetchMyTeam]),
    { 
      staleTime: 60000, // 1 minute
      cacheTime: 300000 // 5 minutes
    }
  );

  // Memoized navigation handler
  const handleQuickAction = useCallback((type: string) => {
    // Navigate to appropriate tab based on quick action
    switch (type) {
      case 'quiz':
        router.push('/dashboard/quiz');
        break;
      case 'treasure-hunt':
        router.push('/dashboard/treasure-hunt');
        break;
      case 'polls':
        router.push('/dashboard/polls');
        break;
      case 'team':
        router.push('/dashboard/team');
        break;
      case 'profile':
        router.push('/dashboard/profile');
        break;
      case 'activities':
        router.push('/dashboard/activities');
        break;
      case 'photo-wall':
        router.push('/dashboard/photo-wall');
        break;
      default:
        console.warn('Unhandled quick action:', type);
        break;
    }
  }, [router]);

  // Memoized user's team data
  const userTeam = useMemo(() => {
    return (myTeam || user?.team || null) as Team | null;
  }, [myTeam, user?.team]);

  // Memoized team members
  const teamMembers = useMemo(() => {
    if (!userTeam || !userTeam.members) return [];
    return userTeam.members;
  }, [userTeam]);

  // Check if current user is team leader
  const isCurrentUserLeader = useMemo(() => {
    if (!userTeam || !user) return false;
    return userTeam.leaderId === user.id || userTeam.leader?.id === user.id;
  }, [userTeam, user]);

  // Helper functions for activity display
  const getIconComponent = useCallback((iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Target,
      Vote,
      MapPin,
      Trophy,
      ActivityIcon,
    };
    return iconMap[iconName] || ActivityIcon;
  }, []);

  const getActivityTypeIcon = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'QUIZ_UPLOADED':
        return 'Target';
      case 'POLL_CREATED':
        return 'Vote';
      case 'POLL_VOTE_CAST':
        return 'Vote';
      case 'TREASURE_HUNT':
        return 'MapPin';
      case 'CHALLENGE':
        return 'Trophy';
      default:
        return 'Activity';
    }
  }, []);

  const getActivityTypeDisplay = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'QUIZ_UPLOADED':
        return 'Quiz';
      case 'POLL_CREATED':
        return 'Poll';
      case 'POLL_VOTE_CAST':
        return 'Vote';
      case 'TREASURE_HUNT':
        return 'Treasure Hunt';
      case 'CHALLENGE':
        return 'Challenge';
      default:
        return 'Activity';
    }
  }, []);

  const getActivityGradient = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
      case 'quiz_uploaded':
        return 'from-blue-500 to-blue-600';
      case 'poll':
      case 'poll_created':
      case 'poll_vote_cast':
        return 'from-green-500 to-green-600';
      case 'treasure_hunt':
      case 'treasure-hunt':
        return 'from-orange-500 to-orange-600';
      case 'challenge':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Horizontal Layout with Team Info and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Block - Team Info */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">My Dashboard</h2>
            <p className="text-sm lg:text-base text-gray-600">Your team and progress</p>
          </div>

          {/* Team Info - Optimized rendering */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg lg:text-xl font-bold text-white">
                    {userTeam?.name || 'No Team'}
                  </h3>
                  {isCurrentUserLeader && (
                    <div className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full">
                      <Crown className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
                      <span className="text-yellow-100 text-xs lg:text-sm font-medium">Leader</span>
                    </div>
                  )}
                </div>
                <p className="opacity-90 text-indigo-100 text-sm lg:text-base mb-3">
                  {isCurrentUserLeader ? 
                    "You're leading an amazing team!" :
                    userTeam && 'description' in userTeam ? 
                      `You're part of an amazing team! ${userTeam.description || ''}` : 
                      userTeam ?
                      "You're part of an amazing team!" :
                      "You haven't been assigned to a team yet."
                  }
                </p>
                
                {/* Team Leader Info */}
                {userTeam?.leader && !isCurrentUserLeader && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-3 w-3 text-yellow-300" />
                      <span className="text-xs text-indigo-100">
                        Led by {userTeam.leader.name}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-200" />
                    <span className="text-xs lg:text-sm text-indigo-100">
                      {userTeam ? `${teamMembers.length} Members` : 'No team'}
                    </span>
                  </div>
                  {userTeam && 'score' in userTeam && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-200" />
                        <span className="text-xs lg:text-sm text-indigo-100">{userTeam.score} Points</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-200" />
                        <span className="text-xs lg:text-sm text-indigo-100">Team Rank #1</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Trophy className="h-12 w-12 lg:h-16 lg:w-16 opacity-20" />
            </div>
          </div>
        </div>

        {/* Right Block - Quick Actions */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-sm lg:text-base text-gray-600">Jump into activities and manage your profile</p>
          </div>
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border p-4 lg:p-6">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={action.type}
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
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Recent Activities</h2>
            <p className="text-sm lg:text-base text-gray-600">Stay updated with the latest announcements and activities</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/activities')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            View All Activities
          </button>
        </div>

        {activitiesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activities</h3>
            <p className="text-gray-600 mb-4">Check back later for new announcements and activities</p>
            <button
              onClick={() => router.push('/dashboard/activities')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Check Activities
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 3).map((activity) => {
              const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
              const gradient = getActivityGradient(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push('/dashboard/activities')}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900 truncate">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {getActivityTypeDisplay(activity.type)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
            
            {activities && activities.length > 3 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => router.push('/dashboard/activities')}
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View {activities.length - 3} more activities
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

UserOverviewTab.displayName = 'UserOverviewTab';

export default UserOverviewTab;