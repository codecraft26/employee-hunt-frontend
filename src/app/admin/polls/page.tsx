'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the PollsTab component
const PollsTab = lazy(() => import('../../../components/tabs/PollsTab'));

export default function PollsPage() {
  // Memoized poll handlers
  const handleViewResults = useCallback((pollId: string) => {
    console.log(`View results: ${pollId}`);
    // TODO: Navigate to poll results page or open modal
  }, []);

  const handleNotifyWinner = useCallback((pollId: string) => {
    console.log(`Notify users about poll results: ${pollId}`);
    // TODO: API call to notify users about poll results
  }, []);

  return (
    <OptimizedAdminPageLayout title="Polls & Voting Management">
      <PollsTab
        onViewResults={handleViewResults}
        onNotifyWinner={handleNotifyWinner}
      />
    </OptimizedAdminPageLayout>
  );
} 