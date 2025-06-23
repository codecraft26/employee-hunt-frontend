'use client';

import React, { useState } from 'react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import WinnerSelectionModal from '../../components/modals/WinnerSelectionModal';

export default function TestTreasureHuntPage() {
  const { treasureHunts, fetchTreasureHunts } = useTreasureHunts();
  const [selectedHuntId, setSelectedHuntId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDeclareWinner = (huntId: string) => {
    console.log('Test: Declare winner for hunt:', huntId);
    setSelectedHuntId(huntId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHuntId(null);
  };

  const handleModalSuccess = () => {
    console.log('Test: Winner declared successfully');
    setModalOpen(false);
    setSelectedHuntId(null);
    fetchTreasureHunts(); // Refresh the list
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Treasure Hunt Test Page</h1>
      
      <button 
        onClick={fetchTreasureHunts}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Refresh Treasure Hunts
      </button>

      <div className="space-y-4">
        {treasureHunts.map((hunt) => (
          <div key={hunt.id} className="border p-4 rounded">
            <h3 className="font-bold">{hunt.title}</h3>
            <p className="text-sm text-gray-600">{hunt.description}</p>
            <p className="text-sm">Status: {hunt.status}</p>
            <p className="text-sm">Teams: {hunt.assignedTeams?.length || 0}</p>
            {hunt.winningTeam && (
              <p className="text-sm text-green-600">Winner: {hunt.winningTeam.name}</p>
            )}
            <button 
              onClick={() => handleDeclareWinner(hunt.id)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Test Declare Winner
            </button>
          </div>
        ))}
      </div>

      {modalOpen && selectedHuntId && (
        <WinnerSelectionModal
          isOpen={modalOpen}
          treasureHuntId={selectedHuntId}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
} 