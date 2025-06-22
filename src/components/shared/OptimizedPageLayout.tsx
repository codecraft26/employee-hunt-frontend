import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/authSlice';
import ProtectedRoute from '../ProtectedRoute';
import OptimizedHeader from './OptimizedHeader';
import LazyWrapper from './LazyWrapper';

interface OptimizedPageLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
  backPath?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  customBackground?: React.ReactNode;
}

// Static notifications data - shared across all pages
const STATIC_NOTIFICATIONS = [
  { id: 1, title: 'New Quiz Available', message: 'Team Alpha has a new quiz to complete', time: '2 hours ago', type: 'quiz' },
  { id: 2, title: 'Treasure Hunt Update', message: 'Your clue has been approved!', time: '4 hours ago', type: 'treasure' },
  { id: 3, title: 'Voting Ends Soon', message: 'Office Event voting ends in 2 hours', time: '6 hours ago', type: 'vote' }
];

const DefaultFallback: React.FC = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OptimizedPageLayout: React.FC<OptimizedPageLayoutProps> = memo(({
  title,
  subtitle,
  icon,
  iconGradient,
  backPath = '/dashboard',
  children,
  fallback = <DefaultFallback />,
  customBackground
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Memoized handlers
  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.push('/login');
  }, [dispatch, router]);

  const handleBack = useCallback(() => {
    router.push(backPath);
  }, [router, backPath]);

  // Early return for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
        {/* Thematic/Custom Background */}
        {customBackground && (
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
            {customBackground}
          </div>
        )}
        {/* Optimized Header */}
        <OptimizedHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          iconGradient={iconGradient}
          onLogout={handleLogout}
        />
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          {/* Page Content with Lazy Loading */}
          <LazyWrapper fallback={fallback}>
            {children}
          </LazyWrapper>
        </div>
      </div>
    </ProtectedRoute>
  );
});

OptimizedPageLayout.displayName = 'OptimizedPageLayout';

export default OptimizedPageLayout; 