'use client';

import React, { lazy, useCallback, useState, useEffect } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the components
const TreasureHuntsTab = lazy(() => import('../../../components/tabs/TreasureHuntsTab'));
const CluesManagementTab = lazy(() => import('../../../components/tabs/CluesManagementTab'));
const SubmissionsManagementTab = lazy(() => import('../../../components/tabs/SubmissionsManagementTab'));
const WinnerSelectionModal = lazy(() => import('../../../components/modals/WinnerSelectionModal'));

export default function TreasureHuntsPage() {
  const [currentView, setCurrentView] = useState<'list' | 'clues' | 'submissions'>('list');
  const [selectedHuntId, setSelectedHuntId] = useState<string | null>(null);
  const [winnerModal, setWinnerModal] = useState<{
    isOpen: boolean;
    huntId: string | null;
  }>({
    isOpen: false,
    huntId: null
  });

  // Check URL parameters for declare winner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const declareWinner = urlParams.get('declare-winner');
      if (declareWinner) {
        setWinnerModal({
          isOpen: true,
          huntId: declareWinner
        });
        // Clean up URL
        window.history.replaceState({}, '', '/admin/treasure-hunts');
      }
    }
  }, []);

  // Memoized treasure hunt handlers
  const handleViewClues = useCallback(async (huntId: string) => {
    console.log(`View clues: ${huntId}`);
    setSelectedHuntId(huntId);
    setCurrentView('clues');
  }, []);

  const handleViewSubmissions = useCallback(async (huntId: string) => {
    console.log(`View submissions: ${huntId}`);
    setSelectedHuntId(huntId);
    setCurrentView('submissions');
  }, []);

  const handleDeclareWinner = useCallback((huntId: string) => {
    console.log(`Declare winner: ${huntId}`);
    setWinnerModal({
      isOpen: true,
      huntId
    });
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setSelectedHuntId(null);
  }, []);

  const handleWinnerSuccess = useCallback(() => {
    setWinnerModal({
      isOpen: false,
      huntId: null
    });
    // Optionally refresh the list or navigate back
    setCurrentView('list');
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'clues':
        return (
          <CluesManagementTab
            treasureHuntId={selectedHuntId!}
            onBack={handleBackToList}
          />
        );
      case 'submissions':
        return (
          <SubmissionsManagementTab
            treasureHuntId={selectedHuntId!}
            onBack={handleBackToList}
            onDeclareWinner={handleDeclareWinner}
          />
        );
      default:
        return (
          <TreasureHuntsTab
            onViewClues={handleViewClues}
            onViewSubmissions={handleViewSubmissions}
            onDeclareWinner={handleDeclareWinner}
          />
        );
    }
  };

  return (
    <OptimizedAdminPageLayout title="Treasure Hunts Management">
      {renderCurrentView()}
      
      {/* Winner Selection Modal */}
      {winnerModal.isOpen && winnerModal.huntId && (
        <WinnerSelectionModal
          isOpen={winnerModal.isOpen}
          treasureHuntId={winnerModal.huntId}
          onClose={() => setWinnerModal({ isOpen: false, huntId: null })}
          onSuccess={handleWinnerSuccess}
        />
      )}
    </OptimizedAdminPageLayout>
  );
} 