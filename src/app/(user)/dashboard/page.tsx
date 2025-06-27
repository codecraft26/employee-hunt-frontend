// pages/user/dashboard/page.tsx
'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { logout } from '../../../store/authSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import OptimizedHeader from '../../../components/shared/OptimizedHeader';
import LazyWrapper from '../../../components/shared/LazyWrapper';
import { useOptimizedData } from '../../../hooks/useOptimizedData';
import { Trophy, Sparkles, Zap, Crown } from 'lucide-react';
import UserOverviewTab from '../../../components/user/UserOverviewTab';
import SupportFloatingButton from '../../../components/shared/SupportFloatingButton';


export default function UserDashboardUI() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Optimized data fetching with caching
  const { data: activities, loading: activitiesLoading } = useOptimizedData(
    'user-activities',
    async () => {
      if (!user) return [];
      // This will be handled by the UserOverviewTab component
      return [];
    },
    { staleTime: 30000 } // 30 seconds
  );

  const { data: teamData, loading: teamLoading } = useOptimizedData(
    'user-team',
    async () => {
      if (!user) return null;
      // This will be handled by the UserOverviewTab component
      return null;
    },
    { staleTime: 60000 } // 1 minute
  );

  // Memoized handlers to prevent re-renders
  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.push('/login');
  }, [dispatch, router]);

  // Memoized redirect logic
  const shouldRedirectToAdmin = useMemo(() => {
    return !isLoading && user?.role === 'admin';
  }, [isLoading, user?.role]);

  // Handle admin redirect
  if (shouldRedirectToAdmin) {
    router.push('/admin');
    return null;
  }

  // Loading state with gaming theme
  if (!user && isLoading) {
    return (
      <div className="gaming-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="loading-gaming mx-auto mb-6"></div>
          <div className="text-gradient text-xl sm:text-2xl font-bold mb-2">Loading Adventure...</div>
          <div className="text-slate-400 text-sm">Preparing your gaming experience</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="gaming-bg min-h-screen relative overflow-hidden">
        {/* Animated background particles - Mobile optimized */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-20 sm:top-40 right-4 sm:right-20 w-1 sm:w-1 h-1 sm:h-1 bg-indigo-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-20 sm:bottom-40 left-4 sm:left-20 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-orange-400 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-1 sm:w-1 h-1 sm:h-1 bg-green-400 rounded-full animate-pulse opacity-30"></div>
        </div>

        {/* Hero Banner with Video Background */}
        <div className="relative w-full min-h-40 sm:min-h-48 md:min-h-56 lg:min-h-64 xl:min-h-72 overflow-hidden">
          {/* Video Background with Bluish Filter */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.7) contrast(1.2) saturate(1.3) hue-rotate(200deg)',
              }}
            >
              <source src="/videos/7550567-hd_1920_1080_30fps.mp4" type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <div className="w-full h-full gradient-animate opacity-80"></div>
            </video>
            
            {/* Enhanced overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30"></div>
            
            {/* Additional bluish filter overlay */}
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-multiply"></div>
          </div>
          
          {/* Floating elements - Mobile responsive */}
          <div className="absolute top-4 sm:top-10 left-4 sm:left-10 float">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 drop-shadow-lg" />
          </div>
          <div className="absolute top-8 sm:top-20 right-4 sm:right-20 float" style={{ animationDelay: '2s' }}>
            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-400 drop-shadow-lg" />
          </div>
          <div className="absolute bottom-8 sm:bottom-20 left-4 sm:left-20 float" style={{ animationDelay: '4s' }}>
            <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-blue-400 drop-shadow-lg" />
          </div>
          
          {/* Content overlay - Mobile responsive */}
          <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-8 pb-1 flex flex-col h-full justify-between">
            <div className="animate-bounce-in">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-2xl mb-2 flex items-center justify-start">
                <img
                  src="/dashboard_tiles/bandhan-initial.svg"
                  alt="बंधन Logo"
                  className="h-20 sm:h-28 md:h-36 lg:h-44 xl:h-52 w-auto"
                  style={{ maxWidth: '100vw', filter: 'brightness(1.5) contrast(1.2)' }}
                />
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl opacity-90 font-medium" style={{position:'relative', bottom :12 }}>
                Ready for an epic adventure? Let's play together! 🎮
              </p>
            </div>
            
            {/* User welcome with gaming flair - Mobile responsive */}
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">
                    Welcome {user.name}!
                  </div>
                  <div className="text-slate-300 text-xs sm:text-sm truncate">Your adventure awaits...</div>
                </div>
                <div className="ml-auto">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Header with Gaming Theme */}
        <div className="relative z-20">
          <OptimizedHeader
            title="Dashboard"
            subtitle="Your epic journey"
            icon={Trophy}
            iconGradient="from-yellow-400 to-orange-500"
            userName={user.name}
            onLogout={handleLogout}
          />
        </div>
         

        {/* Main Content with Gaming Aesthetics - Mobile responsive */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <LazyWrapper
            fallback={
              <div className="space-y-6 sm:space-y-8">
                {/* Gaming-themed loading skeleton - Mobile responsive */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    <div className="animate-pulse">
                      <div className="h-6 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg w-1/3 mb-2 opacity-20"></div>
                      <div className="h-3 sm:h-4 bg-slate-600 rounded w-1/2 opacity-20"></div>
                    </div>
                    <div className="gaming-card p-4 sm:p-6 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-3 sm:h-4 bg-slate-600 rounded w-2/3 mb-2 opacity-20"></div>
                          <div className="h-6 sm:h-8 bg-slate-600 rounded w-1/2 opacity-20"></div>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    <div className="animate-pulse">
                      <div className="h-6 sm:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg w-1/3 mb-2 opacity-20"></div>
                      <div className="h-3 sm:h-4 bg-slate-600 rounded w-1/2 opacity-20"></div>
                    </div>
                    <div className="gaming-card p-4 sm:p-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20 animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <UserOverviewTab user={user} />
          </LazyWrapper>
        </div>

        {/* Floating action button for quick access - Mobile responsive */}
       
      </div>
      <SupportFloatingButton dashboardOnly />
    </ProtectedRoute>
  );
}
