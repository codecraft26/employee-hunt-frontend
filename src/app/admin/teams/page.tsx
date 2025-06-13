'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AdminHeader from '../../../components/admin/AdminHeader';
import TeamsTab from '../../../components/tabs/TeamsTab';

// Mock stats for header
const mockStats = {
  pendingApprovals: 7
};

export default function TeamsPage() {
  const { user, logout: handleLogout } = useAuth();
  const router = useRouter();

  // Team handlers
  const handleCreateTeam = () => {
    console.log('Create team - handled by TeamsTab component');
  };

  const handleImportUsers = () => {
    console.log('Import users');
    // TODO: Handle user import
  };

  const handleManageMembers = (teamId: string) => {
    console.log(`Manage members for team: ${teamId}`);
  };

  const handleViewStats = (teamId: string) => {
    console.log(`View stats for team: ${teamId}`);
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
        
        <TeamsTab
          onCreateTeam={handleCreateTeam}
          onImportUsers={handleImportUsers}
          onManageMembers={handleManageMembers}
          onViewStats={handleViewStats}
        />
      </div>
    </div>
  );
} 