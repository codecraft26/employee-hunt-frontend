'use client';

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import AdminHeader from '../../../components/admin/AdminHeader';
import PollsTab from '../../../components/tabs/PollsTab';

// Mock stats for header
const mockStats = {
  pendingApprovals: 7
};

export default function PollsPage() {
  const { user, logout: handleLogout } = useAuth();

  // Poll handlers
  const handleViewResults = (pollId: string) => {
    console.log(`View results: ${pollId}`);
    // TODO: Navigate to poll results page or open modal
  };

  const handleNotifyWinner = (pollId: string) => {
    console.log(`Notify users about poll results: ${pollId}`);
    // TODO: API call to notify users about poll results
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollsTab
          onViewResults={handleViewResults}
          onNotifyWinner={handleNotifyWinner}
        />
      </div>
    </div>
  );
} 