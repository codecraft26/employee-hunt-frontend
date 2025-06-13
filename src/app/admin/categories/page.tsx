'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AdminHeader from '../../../components/admin/AdminHeader';
import CategoriesTab from '../../../components/tabs/CategoriesTab';

// Mock stats for header
const mockStats = {
  pendingApprovals: 7
};

export default function CategoriesPage() {
  const { user, logout: handleLogout } = useAuth();
  const router = useRouter();

  // Category handlers
  const handleCreateCategory = () => {
    console.log('Create category - handled by CategoriesTab component');
  };

  const handleViewCategoryStats = (categoryId: string) => {
    console.log(`View stats for category: ${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <CategoriesTab
          onCreateCategory={handleCreateCategory}
          onViewStats={handleViewCategoryStats}
        />
      </div>
    </div>
  );
} 