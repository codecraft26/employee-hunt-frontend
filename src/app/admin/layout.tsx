'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../hooks/redux';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminNavigation from '../../components/admin/AdminNavigation';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { logout: handleLogout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar for desktop */}
        <AdminSidebar pendingApprovals={0} />
        
        {/* Header and mobile navigation */}
        <div className="lg:pl-64">
          <AdminHeader 
            pendingApprovals={0}
            onLogout={handleLogout}
            userName={user?.name || user?.email || 'Admin'}
          />
          <AdminNavigation pendingApprovals={0} />
          
          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 