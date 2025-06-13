'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the TreasureHuntsTab component
const TreasureHuntsTab = lazy(() => import('../../../components/tabs/TreasureHuntsTab'));

export default function TreasureHuntsPage() {
  // Memoized treasure hunt handlers
  const handleViewClues = useCallback(async (huntId: string) => {
    console.log(`View clues: ${huntId}`);
    // TODO: Navigate to clues management
  }, []);

  const handleViewSubmissions = useCallback(async (huntId: string) => {
    console.log(`View submissions: ${huntId}`);
    // TODO: Navigate to submissions management
  }, []);

  const handleDeclareWinner = useCallback((huntId: string) => {
    console.log(`Declare winner: ${huntId}`);
    // TODO: Open winner selection modal
  }, []);

  return (
    <OptimizedAdminPageLayout title="Treasure Hunts Management">
      <TreasureHuntsTab
        onViewClues={handleViewClues}
        onViewSubmissions={handleViewSubmissions}
        onDeclareWinner={handleDeclareWinner}
      />
    </OptimizedAdminPageLayout>
  );
} 