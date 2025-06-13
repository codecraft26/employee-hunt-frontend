import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdminHeader from '../admin/AdminHeader';
import LazyWrapper from './LazyWrapper';

interface OptimizedAdminPageLayoutProps {
  title: string;
  backPath?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Static mock stats - shared across all admin pages
const MOCK_STATS = {
  pendingApprovals: 7
};

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

const OptimizedAdminPageLayout: React.FC<OptimizedAdminPageLayoutProps> = memo(({
  title,
  backPath = '/admin',
  children,
  fallback = <DefaultFallback />
}) => {
  const { user, logout: handleLogout } = useAuth();
  const router = useRouter();

  // Memoized handlers
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
    <div className="min-h-screen bg-gray-50">
      {/* Optimized Admin Header */}
      <AdminHeader 
        pendingApprovals={MOCK_STATS.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {backPath === '/admin' ? 'Dashboard' : 'Previous Page'}</span>
          </button>
        </div>
        
        {/* Page Content with Lazy Loading */}
        <LazyWrapper fallback={fallback}>
          {children}
        </LazyWrapper>
      </div>
    </div>
  );
});

OptimizedAdminPageLayout.displayName = 'OptimizedAdminPageLayout';

export default OptimizedAdminPageLayout; 