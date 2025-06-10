// components/modals/WinnerSelectionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, AlertCircle } from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';

interface WinnerSelectionModalProps {
  isOpen: boolean;
  huntId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const WinnerSelectionModal: React.FC<WinnerSelectionModalProps> = ({
  isOpen,
  huntId,
  onClose,
  onSuccess
}) => {
  const { 
    currentTreasureHunt, 
    fetchTreasureHuntById, 
    declareWinner,
    loading,
    error
  } = useTreasureHunts();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch treasure hunt details when modal opens
  useEffect(() => {
    if (isOpen && huntId) {
      fetchTreasureHuntById(huntId);
    }
  }, [isOpen, huntId, fetchTreasureHuntById]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTeamId('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId || !huntId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await declareWinner(huntId, selectedTeamId);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to declare winner:', error);
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !huntId) return null;

  const hunt = currentTreasureHunt;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Declare Winner</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-gray-500 mt-2">Loading treasure hunt details...</p>
            </div>
          ) : !hunt ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
              <p className="text-gray-500">Failed to load treasure hunt details</p>
            </div>
          ) : (
            <>
              {/* Hunt Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{hunt.title}</h3>
                <p className="text-sm text-gray-600">{hunt.description}</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Team Selection Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Users className="h-4 w-4 inline mr-1" />
                    Select Winning Team
                  </label>
                  
                  {hunt.assignedTeams.length === 0 ? (
                    <p className="text-gray-500 text-sm">No teams assigned to this treasure hunt</p>
                  ) : (
                    <div className="space-y-3">
                      {hunt.assignedTeams.map((team) => (
                        <label
                          key={team.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedTeamId === team.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="winningTeam"
                            value={team.id}
                            checked={selectedTeamId === team.id}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            disabled={isSubmitting}
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium text-gray-900">{team.name}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once a winner is declared, the treasure hunt will be marked as completed 
                        and results will be published. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTeamId || isSubmitting || hunt.assignedTeams.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <Trophy className="h-4 w-4" />
                    <span>{isSubmitting ? 'Declaring...' : 'Declare Winner'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionModal;