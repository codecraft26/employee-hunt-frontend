'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTreasureHunts } from '../../../hooks/useTreasureHunts';
import AdminHeader from '../../../components/admin/AdminHeader';
import TreasureHuntsTab from '../../../components/tabs/TreasureHuntsTab';
import CluesManagementTab from '../../../components/tabs/CluesManagementTab';
import SubmissionsManagementTab from '../../../components/tabs/SubmissionsManagementTab';
import WinnerSelectionModal from '../../../components/modals/WinnerSelectionModal';

// Mock stats for header
const mockStats = {
  pendingApprovals: 7
};

type ViewType = 'main' | 'clues-management' | 'submissions-management';

export default function TreasureHuntsPage() {
  const { user, logout: handleLogout } = useAuth();
  const { resetCurrentTreasureHunt, fetchTreasureHuntWithClues } = useTreasureHunts();
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedTreasureHuntId, setSelectedTreasureHuntId] = useState<string | null>(null);
  const [winnerSelectionModal, setWinnerSelectionModal] = useState<{
    isOpen: boolean;
    huntId: string | null;
  }>({
    isOpen: false,
    huntId: null
  });

  // Treasure hunt handlers
  const handleViewClues = async (huntId: string) => {
    console.log(`View clues: ${huntId}`);
    setSelectedTreasureHuntId(huntId);
    setCurrentView('clues-management');
    
    try {
      await fetchTreasureHuntWithClues(huntId);
    } catch (error) {
      console.error('Failed to fetch treasure hunt with clues:', error);
    }
  };

  const handleViewSubmissions = async (huntId: string) => {
    console.log(`View submissions: ${huntId}`);
    setSelectedTreasureHuntId(huntId);
    setCurrentView('submissions-management');
  };

  const handleDeclareWinner = (huntId: string) => {
    console.log(`Declare winner: ${huntId}`);
    setWinnerSelectionModal({
      isOpen: true,
      huntId: huntId
    });
  };

  const handleWinnerSelectionClose = () => {
    setWinnerSelectionModal({
      isOpen: false,
      huntId: null
    });
    resetCurrentTreasureHunt();
  };

  const handleWinnerSelectionSuccess = () => {
    console.log('Winner declared successfully');
  };

  const handleBackFromManagement = () => {
    setCurrentView('main');
    setSelectedTreasureHuntId(null);
    resetCurrentTreasureHunt();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'clues-management':
        return (
          <CluesManagementTab
            treasureHuntId={selectedTreasureHuntId}
            onBack={handleBackFromManagement}
          />
        );
      case 'submissions-management':
        return (
          <SubmissionsManagementTab
            treasureHuntId={selectedTreasureHuntId}
            onBack={handleBackFromManagement}
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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - only show on main view */}
        {currentView === 'main' && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
        
        {renderContent()}
      </div>

      {/* Winner Selection Modal */}
      <WinnerSelectionModal
        isOpen={winnerSelectionModal.isOpen}
        huntId={winnerSelectionModal.huntId}
        onClose={handleWinnerSelectionClose}
        onSuccess={handleWinnerSelectionSuccess}
      />
    </div>
  );
} 