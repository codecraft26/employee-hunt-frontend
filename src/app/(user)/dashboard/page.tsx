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
import { Trophy } from 'lucide-react';
import { lazy } from 'react';

// Lazy load the UserOverviewTab component
const UserOverviewTab = lazy(() => import('../../../components/user/UserOverviewTab'));

// Static notifications data - moved outside component to prevent re-creation
const STATIC_NOTIFICATIONS = [
  { id: 1, title: 'New Quiz Available', message: 'Team Alpha has a new quiz to complete', time: '2 hours ago', type: 'quiz' },
  { id: 2, title: 'Treasure Hunt Update', message: 'Your clue has been approved!', time: '4 hours ago', type: 'treasure' },
  { id: 3, title: 'Voting Ends Soon', message: 'Office Event voting ends in 2 hours', time: '6 hours ago', type: 'vote' }
];

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

  // Loading state
  if (!user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Banner - Optimized with better image loading */}
        <div className="relative w-full h-40 sm:h-56 md:h-64 rounded-b-3xl overflow-hidden mb-2">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Trip Games Banner"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 px-6 pt-8 pb-4 flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow">Trip Games</h1>
              <p className="text-white text-base sm:text-lg opacity-90">Let's play together!</p>
            </div>
          </div>
        </div>

        {/* Optimized Header */}
        <OptimizedHeader
          title="Dashboard"
          subtitle="Welcome back"
          icon={Trophy}
          iconGradient="from-indigo-600 to-purple-600"
          userName={user.name}
          notificationCount={STATIC_NOTIFICATIONS.length}
          onLogout={handleLogout}
        />

        {/* Main Content with Lazy Loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LazyWrapper
            fallback={
              <div className="space-y-8">
                {/* Loading skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                            </div>
                            <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 lg:space-y-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border p-4 lg:p-6">
                      <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
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
      </div>
    </ProtectedRoute>
  );
}