'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the TeamsTab component
const TeamsTab = lazy(() => import('../../../components/tabs/TeamsTab'));

export default function TeamsPage() {
  // Memoized team handlers
  const handleCreateTeam = useCallback(() => {
    console.log('Create team - handled by TeamsTab component');
  }, []);

  const handleImportUsers = useCallback(() => {
    console.log('Import users');
    // TODO: Handle user import
  }, []);

  const handleManageMembers = useCallback((teamId: string) => {
    console.log(`Manage members for team: ${teamId}`);
  }, []);

  const handleViewStats = useCallback((teamId: string) => {
    console.log(`View stats for team: ${teamId}`);
  }, []);

  return (
    <OptimizedAdminPageLayout title="Teams Management">
      <TeamsTab
        onCreateTeam={handleCreateTeam}
        onImportUsers={handleImportUsers}
        onManageMembers={handleManageMembers}
        onViewStats={handleViewStats}
      />
    </OptimizedAdminPageLayout>
  );
} 