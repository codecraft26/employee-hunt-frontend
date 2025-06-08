'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for initial auth check to complete
    if (!isLoading) {
      setIsChecking(false);
      
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // Check role if required
      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, requiredRole, router, fallbackPath, isLoading]);

  // Show loading spinner while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}