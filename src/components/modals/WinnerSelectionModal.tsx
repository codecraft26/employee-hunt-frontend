// components/modals/WinnerSelectionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import axios from 'axios';
import Cookies from 'js-cookie';

interface WinnerSelectionModalProps {
  isOpen: boolean;
  huntId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AssignedTeam {
  id: string;
  name: string;
  description?: string;
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
    loading: huntLoading,
    error: huntError,
    clearError: clearHuntError
  } = useTreasureHunts();

  const [assignedTeams, setAssignedTeams] = useState<AssignedTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  // Fetch treasure hunt details and assigned teams when modal opens
  useEffect(() => {
    if (isOpen && huntId) {
      clearHuntError();
      setSubmitError(null);
      setTeamsError(null);
      
      // Fetch hunt data
      fetchTreasureHuntById(huntId);
      
      // Fetch assigned teams
      const fetchAssignedTeams = async () => {
        setLoadingTeams(true);
        try {
          const token = Cookies.get('token');
          console.log('Fetching assigned teams for hunt:', huntId);
          
          // Using the exact endpoint format provided
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/treasure-hunts/${huntId}/assigned-teams`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.data.success) {
            console.log('Assigned teams fetched successfully:', response.data.data);
            setAssignedTeams(response.data.data);
          } else {
            throw new Error(response.data.message || 'Failed to fetch assigned teams');
          }
        } catch (err: any) {
          console.error('Failed to fetch assigned teams:', err);
          setTeamsError(err.response?.data?.message || 'Failed to fetch assigned teams');
        } finally {
          setLoadingTeams(false);
        }
      };

      fetchAssignedTeams();
    }
  }, [isOpen, huntId, fetchTreasureHuntById, clearHuntError]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTeamId('');
      setIsSubmitting(false);
      setSubmitError(null);
      clearHuntError();
      setTeamsError(null);
      setAssignedTeams([]);
    }
  }, [isOpen, clearHuntError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId || !huntId) {
      setSubmitError('Please select a team to declare as winner');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Declaring winner from modal:', { huntId, selectedTeamId });
      
      const success = await declareWinner(huntId, selectedTeamId);
      
      if (success) {
        console.log('Winner declared successfully from modal');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to declare winner from modal:', error);
      setSubmitError(error.message || 'Failed to declare winner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !huntId) return null;

  const hunt = currentTreasureHunt;
  const loading = huntLoading || loadingTeams;
  const error = huntError || teamsError || submitError;

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
            onClick={handleClose}
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
              <button
                onClick={() => {
                  if (huntId) {
                    fetchTreasureHuntById(huntId);
                  }
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Hunt Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{hunt.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{hunt.description}</p>
                
                {/* Hunt Status Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      hunt.status === 'ACTIVE' ? 'bg-green-500' : 
                      hunt.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Status: {hunt.status}
                    </span>
                  </div>
                  {hunt.status === 'COMPLETED' && (
                    <p className="text-xs text-blue-600 mt-1">
                      This hunt has ended. You can still declare a winner.
                    </p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitError(null);
                      clearHuntError();
                      setTeamsError(null);
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Team Selection Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Users className="h-4 w-4 inline mr-1" />
                    Select Winning Team
                  </label>
                  
                  {assignedTeams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No teams assigned to this treasure hunt</p>
                    </div>
                  ) : hunt.winningTeam ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Winner Already Declared</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            <span className="font-medium">{hunt.winningTeam.name}</span> has already been declared as the winner of this treasure hunt.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedTeams.map((team) => (
                        <label
                          key={team.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTeamId === team.id
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium text-gray-900">{team.name}</span>
                              </div>
                              {selectedTeamId === team.id && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            {team.description && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">{team.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning */}
                {!hunt.winningTeam && assignedTeams.length > 0 && (
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
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  
                  {!hunt.winningTeam && assignedTeams.length > 0 && (
                    <button
                      type="submit"
                      disabled={!selectedTeamId || isSubmitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <Trophy className="h-4 w-4" />
                      <span>{isSubmitting ? 'Declaring Winner...' : 'Declare Winner'}</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Additional Info */}
              {assignedTeams.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Assigned Teams: {assignedTeams.length}</span>
                    <span>Hunt Status: {hunt.status}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionModal;