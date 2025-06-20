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
  Crown
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
    console.log(`Quick action: ${type}`);
    
    // Navigate to appropriate route based on quick action
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
      case 'photo-wall':
        router.push('/dashboard/photo-wall');
        break;
      case 'activities':
        router.push('/dashboard/activities');
        break;
      case 'team':
        router.push('/dashboard/team');
        break;
      case 'profile':
        router.push('/dashboard/profile');
        break;
      default:
        console.log(`Unhandled quick action: ${type}`);
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

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      label: 'Total Points',
      value: user?.points || 0,
      icon: Trophy,
      color: 'blue'
    },
    {
      label: 'Team Rank',
      value: `#${user?.rank || 'N/A'}`,
      icon: Medal,
      color: 'green'
    },
    {
      label: 'Activities',
      value: activities?.length || 0,
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Hunts Joined',
      value: 3, // This could be dynamic based on actual data
      icon: MapPin,
      color: 'yellow'
    }
  ], [user?.points, user?.rank, activities?.length]);

  // Memoized color classes
  const colorClasses = useMemo(() => ({
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  }), []);

  return (
    <div className="space-y-8">
      {/* Horizontal Layout with Stats and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Block - User Stats */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">My Dashboard</h2>
            <p className="text-sm lg:text-base text-gray-600">Your performance and progress</p>
          </div>
          
          {/* User Stats Cards - Optimized with memoized data */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {statsData.map((stat, index) => (
              <div key={stat.label} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 lg:p-3 ${colorClasses[stat.color as keyof typeof colorClasses]} rounded-lg lg:rounded-xl`}>
                    <stat.icon className="h-4 w-4 lg:h-6 lg:w-6" />
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
});

UserOverviewTab.displayName = 'UserOverviewTab';

export default UserOverviewTab;