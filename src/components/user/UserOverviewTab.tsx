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
  Activity as ActivityIcon,
  Sparkles,
  Flame,
  Sword,
  Heart,
  Gem
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
  description: string;
  bgImage?: string;
}

// Enhanced quick actions with background images and dark blue gaming theme
const QUICK_ACTIONS: QuickAction[] = [
  { 
    title: 'Take Quiz', 
    icon: Shield, 
    color: 'from-blue-500/70 via-blue-600/70 to-cyan-500/70', 
    type: 'quiz',
    description: 'Test your knowledge',
    bgImage: '/dashboard_tiles/take_quiz.jpg'
  },
  { 
    title: 'Treasure Hunt', 
    icon: MapPin, 
    color: 'from-green-500/70 via-emerald-600/70 to-teal-500/70', 
    type: 'treasure-hunt',
    description: 'Find hidden treasures',
    bgImage: '/dashboard_tiles/treaure_hunt.jpg'
  },
  { 
    title: 'Vote in Polls', 
    icon: Vote, 
    color: 'from-indigo-500/70 via-indigo-600/70 to-purple-500/70', 
    type: 'polls',
    description: 'Make your voice heard',
    bgImage: '/dashboard_tiles/polls.jpg'
  },
  { 
    title: 'Photo Wall', 
    icon: Camera, 
    color: 'from-pink-500/70 via-rose-600/70 to-red-500/70', 
    type: 'photo-wall',
    description: 'Share your moments',
    bgImage: '/dashboard_tiles/photo_wall.jpg'
  },
  { 
    title: 'Activities', 
    icon: Zap, 
    color: 'from-yellow-500/70 via-orange-600/70 to-red-500/70', 
    type: 'activities',
    description: 'Join epic challenges',
    bgImage: '/dashboard_tiles/activities.jpg'
  },
  { 
    title: 'My Team', 
    icon: Users, 
    color: 'from-blue-500/70 via-indigo-600/70 to-purple-500/70', 
    type: 'team',
    description: 'Lead your squad',
    bgImage: '/dashboard_tiles/my_team.jpg'
  },
  { 
    title: 'My Profile', 
    icon: Crown, 
    color: 'from-amber-500 via-yellow-600 to-orange-500', 
    type: 'profile',
    description: 'Level up your stats',
  }
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
        return 'from-blue-500 to-cyan-500';
      case 'poll':
      case 'poll_created':
      case 'poll_vote_cast':
        return 'from-green-500 to-emerald-500';
      case 'treasure_hunt':
      case 'treasure-hunt':
        return 'from-orange-500 to-red-500';
      case 'challenge':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Team Info Section - Mobile responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Block - Team Info with Gaming Theme */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="animate-bounce-in">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient mb-2 flex items-center">
              <Sword className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-400" />
              My Gaming Hub
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">Your team and epic progress</p>
          </div>

          {/* Enhanced Team Card - Mobile responsive */}
          <div className="gaming-card p-4 sm:p-6 lg:p-8 hover-lift group">
            <div className="relative">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                        {userTeam?.name || 'No Team'}
                      </h3>
                      {isCurrentUserLeader && (
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                          <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          <span className="text-white text-xs sm:text-sm font-bold">LEADER</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
                      {isCurrentUserLeader ? 
                        "You're leading an epic team to victory! 🏆" :
                        userTeam && 'description' in userTeam ? 
                          `You're part of an amazing team! ${userTeam.description || ''}` : 
                          userTeam ?
                          "You're part of an amazing team! Ready to conquer challenges together!" :
                          "Join a team to start your epic adventure! 🚀"
                      }
                    </p>
                    
                    {/* Team Leader Info - Mobile responsive */}
                    {userTeam?.leader && !isCurrentUserLeader && (
                      <div className="glass-dark rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-white text-xs sm:text-sm font-semibold truncate block">
                              Led by {userTeam.leader.name}
                            </span>
                            <div className="text-slate-400 text-xs">Team Captain</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Team Stats - Mobile responsive */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl mx-auto mb-1 sm:mb-2">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="text-white font-bold text-sm sm:text-lg">{userTeam ? teamMembers.length : 0}</div>
                        <div className="text-slate-400 text-xs">Members</div>
                      </div>
                      
                      {userTeam && 'score' in userTeam && (
                        <>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl mx-auto mb-1 sm:mb-2">
                              <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="text-white font-bold text-sm sm:text-lg">{userTeam.score}</div>
                            <div className="text-slate-400 text-xs">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl mx-auto mb-1 sm:mb-2">
                              <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="text-white font-bold text-sm sm:text-lg">#1</div>
                            <div className="text-slate-400 text-xs">Rank</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Floating Trophy - Mobile responsive */}
                  <div className="relative flex-shrink-0">
                    <Trophy className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-yellow-400 drop-shadow-lg animate-rotate" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Block - Enhanced Quick Actions - Mobile responsive */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient mb-2 flex items-center">
              <Zap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-yellow-400" />
              Quick Actions
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">Jump into epic activities</p>
          </div>
          
          <div className="gaming-card p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={action.type}
                  onClick={() => handleQuickAction(action.type)}
                  className={`group relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white hover-lift transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 ${
                    action.bgImage ? 'bg-cover bg-center' : `bg-gradient-to-br ${action.color}`
                  }`}
                  style={{
                    backgroundImage: action.bgImage ? `url(${action.bgImage})` : 'none',
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {action.bgImage && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.color} transition-opacity duration-300 group-hover:opacity-90`}
                    ></div>
                  )}
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ${
                        action.bgImage ? 'backdrop-blur-sm border border-white/20' : ''
                      }`}
                    >
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8 text-white" />
                    </div>
                    <h3
                      className={`font-bold text-xs sm:text-sm lg:text-base leading-tight mb-1 ${
                        action.bgImage ? 'drop-shadow-lg' : ''
                      }`}
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block ${
                        action.bgImage ? 'drop-shadow-md' : ''
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Floating plus icon */}
                  <Plus className="absolute top-2 right-2 sm:top-3 sm:right-3 h-3 w-3 sm:h-4 sm:w-4 text-white/70 group-hover:rotate-90 transition-transform duration-300" />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activities Section - Mobile responsive */}
      <div className="gaming-card p-3 sm:p-4 md:p-6 lg:p-8 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient mb-1 sm:mb-2 flex items-center">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-orange-400 flex-shrink-0" />
              <span className="truncate">Announcements</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base">Stay updated with epic announcements</p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => router.push('/dashboard/activities')}
              className="btn-gaming neon-glow-orange hover-lift text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 w-full sm:w-auto inline-flex items-center justify-center"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden md:inline">View All Activities</span>
              <span className="md:hidden">View All</span>
            </button>
          </div>
        </div>

        {activitiesLoading ? (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="gaming-card p-3 sm:p-4 md:p-5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl opacity-20 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                      <div className="h-3 sm:h-4 md:h-5 bg-slate-600 rounded w-full max-w-xs opacity-20"></div>
                      <div className="h-2 sm:h-3 md:h-4 bg-slate-600 rounded w-full max-w-sm opacity-20"></div>
                      <div className="h-2 sm:h-2.5 bg-slate-600 rounded w-1/3 opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 md:mb-3">No Recent Activities</h3>
            <p className="text-slate-400 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base px-4">Check back later for epic announcements and challenges</p>
            <button
              onClick={() => router.push('/dashboard/activities')}
              className="btn-gaming text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 inline-flex items-center"
            >
              <Gem className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 flex-shrink-0" />
              Check Activities
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {activities.slice(0, 3).map((activity, index) => {
              const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
              const gradient = getActivityGradient(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className="gaming-card p-3 sm:p-4 md:p-5 lg:p-6 hover-lift cursor-pointer group transition-all duration-300"
                  onClick={() => router.push('/dashboard/activities')}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Activity Icon */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-white" />
                    </div>
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white truncate group-hover:text-gradient transition-colors duration-300 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm md:text-base line-clamp-2 leading-relaxed mb-2 sm:mb-3">
                        {activity.description}
                      </p>
                      
                      {/* Activity Meta Info */}
                      <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-3 sm:space-x-4">
                        <span className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-full border border-blue-500/30 self-start xs:self-auto">
                          {getActivityTypeDisplay(activity.type)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Chevron Arrow */}
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* View More Activities Link */}
            {activities && activities.length > 3 && (
              <div className="text-center pt-3 sm:pt-4 md:pt-6">
                <button
                  onClick={() => router.push('/dashboard/activities')}
                  className="inline-flex items-center text-xs sm:text-sm md:text-base text-gradient hover:text-white font-bold transition-colors duration-300 group"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">View {activities.length - 3} more epic activities</span>
                  <span className="sm:hidden">View {activities.length - 3} more</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
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