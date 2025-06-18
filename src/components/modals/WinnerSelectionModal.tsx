// components/modals/WinnerSelectionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
  members: any[];
}

// Create axios instance matching useTreasureHunts pattern
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // Update the canAccessHunt function to allow completed hunts
  const canAccessHunt = (hunt: any) => {
    return hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS' || hunt.status === 'COMPLETED';
  };

  // Update the useEffect to check status
  useEffect(() => {
    if (isOpen && huntId) {
      clearHuntError();
      setSubmitError(null);
      setTeamsError(null);
      
      // Fetch hunt data
      fetchTreasureHuntById(huntId).then((hunt) => {
        if (hunt && !canAccessHunt(hunt)) {
          setTeamsError(`This treasure hunt is ${hunt.status.toLowerCase()}. Actions are only available during active hunts.`);
        }
      });
      
      // Fetch teams using the same pattern as useTreasureHunts
      const fetchAssignedTeams = async () => {
        setLoadingTeams(true);
        setTeamsError(null);
        try {
          console.log('Fetching assigned teams for hunt:', huntId);
          console.log('API Base URL:', API_BASE_URL);
          console.log('Full URL:', `${API_BASE_URL}/treasure-hunts/${huntId}/assigned-teams`);
          
          const response = await api.get(`/treasure-hunts/${huntId}/assigned-teams`);
          
          console.log('API Response:', response);
          
          if (response.data.success) {
            console.log('Assigned teams fetched successfully:', response.data.data);
            setAssignedTeams(response.data.data);
          } else {
            throw new Error(response.data.message || 'Failed to fetch assigned teams');
          }
        } catch (err: any) {
          console.error('Failed to fetch assigned teams:', err);
          console.error('Error details:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: err.config
          });
          
          // Provide more specific error messages
          let errorMessage = 'Failed to fetch assigned teams';
          if (err.response?.status === 404) {
            errorMessage = 'Treasure hunt not found or no teams assigned';
          } else if (err.response?.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (err.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
            errorMessage = 'Cannot connect to server. Please check if the server is running.';
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          
          setTeamsError(errorMessage);
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

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId || !huntId) {
      setSubmitError('Please select a team to declare as winner');
      return;
    }

    if (!hunt || !canAccessHunt(hunt)) {
      setSubmitError(`Cannot declare winner for ${hunt?.status.toLowerCase()} treasure hunt`);
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
                <div className={`border rounded-lg p-3 ${
                  hunt.status === 'ACTIVE' 
                    ? 'bg-green-50 border-green-200' 
                    : hunt.status === 'COMPLETED'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      hunt.status === 'ACTIVE' ? 'bg-green-500' : 
                      hunt.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Status: {hunt.status}
                    </span>
                  </div>
                  {!canAccessHunt(hunt) && (
                    <p className="text-sm mt-2 text-red-600">
                      {hunt.status === 'UPCOMING' 
                        ? 'This hunt has not started yet. Actions will be available when the hunt becomes active.'
                        : 'This hunt has ended. Actions are no longer available.'}
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Select Winning Team</h4>
                    {hunt.status === 'COMPLETED' && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Hunt Completed
                      </span>
                    )}
                  </div>
                  {loadingTeams ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <span className="ml-2 text-gray-600">Loading teams...</span>
                    </div>
                  ) : teamsError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">{teamsError}</span>
                      </div>
                    </div>
                  ) : assignedTeams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No teams assigned to this treasure hunt.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedTeams.map((team) => (
                        <div
                          key={team.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedTeamId === team.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                          onClick={() => setSelectedTeamId(team.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{team.name}</h5>
                              <p className="text-sm text-gray-600">
                                {team.members?.length || 0} members
                              </p>
                            </div>
                            {selectedTeamId === team.id && (
                              <CheckCircle className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning */}
                {!hunt.winningTeam && assignedTeams.length > 0 && canAccessHunt(hunt) && (
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
                  
                  {!hunt.winningTeam && assignedTeams.length > 0 && canAccessHunt(hunt) && (
                    <button
                      type="submit"
                      disabled={!selectedTeamId || isSubmitting}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Declaring Winner...
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4" />
                          Declare Winner
                        </>
                      )}
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