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

  const handleNotifyWinner = useCallback(async (pollId: string) => {
    console.log('🔍 Admin handleNotifyWinner called with poll ID:', pollId);
    
    try {
      // Import the useVotes hook dynamically to avoid circular dependencies
      console.log('📦 Importing useVotes hook...');
      const { useVotes } = await import('../../../hooks/useVotes');
      const { notifyUsers } = useVotes();
      
      console.log('📤 Calling notifyUsers API...');
      const success = await notifyUsers(pollId);
      console.log('📥 API response:', success);
      
      if (!success) {
        throw new Error('Failed to notify users');
      }
      
      console.log('✅ Notification process completed successfully');
    } catch (error) {
      console.error('❌ Error notifying users:', error);
      throw error; // Re-throw to let PollsTab handle the error display
    }
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