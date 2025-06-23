// components/modals/WinnerSelectionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';
import { useTreasureHunts, TeamForWinner } from '../../hooks/useTreasureHunts';

interface WinnerSelectionModalProps {
  isOpen: boolean;
  treasureHuntId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const WinnerSelectionModal: React.FC<WinnerSelectionModalProps> = ({
  isOpen,
  treasureHuntId,
  onClose,
  onSuccess
}) => {
  const { 
    fetchTeamsForWinner,
    fetchTreasureHuntById,
    declareWinner,
    loading, 
    error, 
    clearError 
  } = useTreasureHunts();

  const [teamsForWinner, setTeamsForWinner] = useState<TeamForWinner[]>([]);
  const [treasureHunt, setTreasureHunt] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load treasure hunt details when modal opens
  useEffect(() => {
    if (isOpen && treasureHuntId) {
      console.log('🔍 WinnerSelectionModal: Loading data for hunt ID:', treasureHuntId);
      
      const loadTreasureHuntDetails = async () => {
        try {
          console.log('🔍 Loading treasure hunt details...');
          const data = await fetchTreasureHuntById(treasureHuntId);
          console.log('✅ Treasure hunt details loaded:', data);
          if (data && data.assignedTeams) {
            setTreasureHunt(data);
          }
        } catch (error) {
          console.error('❌ Error loading treasure hunt details:', error);
        }
      };

      const loadTeamsForWinner = async () => {
        try {
          console.log('🔍 Loading teams for winner...');
          const data = await fetchTeamsForWinner(treasureHuntId);
          console.log('✅ Teams for winner loaded:', data);
          if (data && Array.isArray(data)) {
            setTeamsForWinner(data);
          }
        } catch (error) {
          console.error('❌ Error loading teams for winner:', error);
        }
      };

      loadTreasureHuntDetails();
      loadTeamsForWinner();
    }
  }, [isOpen, treasureHuntId, fetchTreasureHuntById, fetchTeamsForWinner]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDeclareWinner = async () => {
    if (!selectedTeamId) return;

    setIsSubmitting(true);
    try {
      const result = await declareWinner(treasureHuntId, selectedTeamId);
      setSuccessMessage('Winner declared successfully!');
      onSuccess?.();
      setTimeout(() => {
        onClose();
        setSelectedTeamId(null);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Declare Winner</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Trophy className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Select the winning team for this treasure hunt. Consider factors such as:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Completion rate of all stages</li>
              <li>Quality and creativity of submissions</li>
              <li>Speed of completion</li>
              <li>Team collaboration and effort</li>
            </ul>
          </div>

          {/* Teams Progress */}
          {(loading || teamsForWinner.length === 0 || !treasureHunt) && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="text-gray-500 mt-4">Loading treasure hunt details and teams...</p>
              </div>
            </div>
          )}

          {teamsForWinner.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-500">No teams have been assigned to this treasure hunt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamsForWinner.map((team) => {
                const isSelected = selectedTeamId === team.teamId;
                
                return (
                  <div
                    key={team.teamId}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedTeamId(team.teamId);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
                        {isSelected && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <Trophy className="h-3 w-3 mr-1" />
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{team.completionPercentage}%</div>
                        <div className="text-sm text-gray-500">
                          {team.completedStages}/{team.totalStages} stages
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{team.completedStages} completed, {team.pendingStages} pending</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-green-600 h-2 rounded-full transition-all duration-300 ${getCompletionColor(team.completionPercentage)}`}
                          style={{ width: `${team.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stage Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-green-600 font-medium">{team.completedStages}</div>
                        <div className="text-green-600">Completed</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <div className="text-yellow-600 font-medium">{team.pendingStages}</div>
                        <div className="text-yellow-600">Pending</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded text-center">
                        <div className="text-red-600 font-medium">{team.rejectedStages}</div>
                        <div className="text-red-600">Rejected</div>
                      </div>
                    </div>

                    {/* Team Members */}
                    {team.teamMembers && team.teamMembers.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Team Members ({team.teamMembers.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {team.teamMembers.map((member) => (
                            <span
                              key={member.id}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                member.role === 'Leader' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {member.name}
                              {member.role === 'Leader' && (
                                <Award className="h-3 w-3 ml-1" />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Submission Time */}
                    {team.lastSubmissionTime && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Last Submission
                        </h4>
                        <p className="text-xs text-gray-600">
                          {formatDate(team.lastSubmissionTime)}
                        </p>
                      </div>
                    )}

                    {/* Recent Submissions */}
                    {team.submissions && team.submissions.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Submissions</h4>
                        <div className="flex space-x-2 overflow-x-auto">
                          {team.submissions.slice(0, 5).map((submission: any) => (
                            <div key={submission.id} className="flex-shrink-0">
                              <img
                                src={submission.imageUrl}
                                alt="Submission"
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded ${getStatusColor(submission.status)}`}>
                                  {getStatusIcon(submission.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {team.submissions.length > 5 && (
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{team.submissions.length - 5}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">
              {selectedTeamId 
                ? `Selected: ${teamsForWinner.find(t => t.teamId === selectedTeamId)?.teamName}`
                : 'Please select a winning team'
              }
            </p>
            {selectedTeamId && (
              <>
                <p className="text-xs text-gray-400 mt-1">
                  Team ID: {selectedTeamId}
                </p>
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeclareWinner}
              disabled={
                !selectedTeamId || 
                isSubmitting
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>{isSubmitting ? 'Declaring...' : 'Declare Winner'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionModal;