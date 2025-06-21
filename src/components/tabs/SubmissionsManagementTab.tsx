// components/tabs/SubmissionsManagementTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Trophy, 
  MessageSquare, 
  Image as ImageIcon,
  Calendar,
  Filter,
  Search,
  Eye,
  AlertCircle,
  Target,
  Award
} from 'lucide-react';
import { useTreasureHunts, ClueSubmission, TeamSubmission, StageSubmissions } from '../../hooks/useTreasureHunts';

interface SubmissionsManagementTabProps {
  treasureHuntId: string;
  onBack: () => void;
  onDeclareWinner?: (huntId: string) => void;
}

interface FeedbackModalProps {
  isOpen: boolean;
  submission: ClueSubmission | null;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  loading: boolean;
}

// Interface for team-based submissions
interface TeamSubmissionsData {
  teamId: string;
  teamName: string;
  teamDescription?: string;
  submissions: TeamSubmission[];
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  submission,
  action,
  onClose,
  onSubmit,
  loading
}) => {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFeedback('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {action === 'approve' ? 'Approve' : 'Reject'} Submission
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Team:</span> {submission.team.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Stage:</span> {submission.clue.stageNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Clue:</span> {submission.clue.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason'}
            </label>
            <textarea
              id="feedback"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={action === 'approve' 
                ? 'Great work! This submission meets all requirements.' 
                : 'Please provide a reason for rejection...'
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required={action === 'reject'}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (action === 'reject' && !feedback.trim())}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                action === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                action === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
              )}
              <span>{action === 'approve' ? 'Approve' : 'Reject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmissionsManagementTab: React.FC<SubmissionsManagementTabProps> = ({ 
  treasureHuntId, 
  onBack,
  onDeclareWinner
}) => {
  const { 
    fetchTreasureHuntSubmissionsForReview,
    approveTeamSubmission,
    rejectTeamSubmission,
    loading, 
    error, 
    clearError 
  } = useTreasureHunts();

  const [submissions, setSubmissions] = useState<StageSubmissions[]>([]);
  const [teamSubmissions, setTeamSubmissions] = useState<TeamSubmissionsData[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TeamSubmission | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [approvalFeedback, setApprovalFeedback] = useState('');

  // Fetch submissions on component mount
  useEffect(() => {
    if (treasureHuntId) {
      loadSubmissions();
    }
  }, [treasureHuntId]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadSubmissions = async () => {
    try {
      const data = await fetchTreasureHuntSubmissionsForReview(treasureHuntId);
      if (data) {
        setSubmissions(data);
        // Transform stage-based data to team-based data
        const teamData = transformToTeamSubmissions(data);
        setTeamSubmissions(teamData);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  // Transform stage-based submissions to team-based submissions
  const transformToTeamSubmissions = (stageData: StageSubmissions[]): TeamSubmissionsData[] => {
    const teamMap = new Map<string, TeamSubmissionsData>();

    stageData.forEach(stage => {
      stage.submissions.forEach(submission => {
        const teamId = submission.team.id;
        
        if (!teamMap.has(teamId)) {
          teamMap.set(teamId, {
            teamId,
            teamName: submission.team.name,
            teamDescription: submission.team.description,
            submissions: [],
            totalStages: 0,
            completedStages: 0,
            pendingStages: 0,
            rejectedStages: 0
          });
        }

        const teamData = teamMap.get(teamId)!;
        teamData.submissions.push(submission);

        // Count statuses
        switch (submission.status) {
          case 'APPROVED':
            teamData.completedStages++;
            break;
          case 'PENDING':
            teamData.pendingStages++;
            break;
          case 'REJECTED':
            teamData.rejectedStages++;
            break;
        }
      });
    });

    // Calculate total stages and sort submissions by stage number
    const result = Array.from(teamMap.values()).map(team => {
      team.totalStages = team.submissions.length;
      team.submissions.sort((a, b) => a.clue.stageNumber - b.clue.stageNumber);
      return team;
    });

    // Sort teams by completion rate (highest first)
    return result.sort((a, b) => {
      const aCompletionRate = a.totalStages > 0 ? a.completedStages / a.totalStages : 0;
      const bCompletionRate = b.totalStages > 0 ? b.completedStages / b.totalStages : 0;
      return bCompletionRate - aCompletionRate;
    });
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
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleApproveSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      await approveTeamSubmission(treasureHuntId, selectedSubmission.id, approvalFeedback || undefined);
      setSuccessMessage('Submission approved successfully!');
      setSelectedSubmission(null);
      setApprovalFeedback('');
      await loadSubmissions(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve submission:', error);
    }
  };

  const handleRejectSubmission = async () => {
    if (!selectedSubmission || !rejectionFeedback.trim()) return;

    try {
      await rejectTeamSubmission(treasureHuntId, selectedSubmission.id, rejectionFeedback);
      setSuccessMessage('Submission rejected successfully!');
      setSelectedSubmission(null);
      setRejectionFeedback('');
      await loadSubmissions(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject submission:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCompletionPercentage = (team: TeamSubmissionsData) => {
    if (team.totalStages === 0) return 0;
    return Math.round((team.completedStages / team.totalStages) * 100);
  };

  if (loading && teamSubmissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Treasure Hunts
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Review Team Submissions</h2>
        </div>
        <div className="flex items-center space-x-3">
          {/* Declare Winner Button - Show when all teams have completed */}
          {teamSubmissions.length > 0 && teamSubmissions.every(team => 
            team.totalStages > 0 && team.completedStages === team.totalStages
          ) && (
            <button
              onClick={() => {
                onDeclareWinner && onDeclareWinner(treasureHuntId);
              }}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Declare Winner
            </button>
          )}
          <button
            onClick={loadSubmissions}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
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

      {/* Teams Submissions */}
      {teamSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500 mb-6">Teams haven't submitted any photos for review yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {teamSubmissions.map((team) => {
            const completionPercentage = getCompletionPercentage(team);
            
            return (
              <div key={team.teamId} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                {/* Team Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{team.teamName}</h3>
                          {team.teamDescription && (
                            <p className="text-sm text-gray-600">{team.teamDescription}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
                      <div className="text-sm text-gray-500">
                        {team.completedStages}/{team.totalStages} steps completed
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{team.completedStages} completed, {team.pendingStages} pending, {team.rejectedStages} rejected</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-green-600 font-bold text-lg">{team.completedStages}</div>
                      <div className="text-green-600 text-sm">Completed</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-yellow-600 font-bold text-lg">{team.pendingStages}</div>
                      <div className="text-yellow-600 text-sm">Pending</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-red-600 font-bold text-lg">{team.rejectedStages}</div>
                      <div className="text-red-600 text-sm">Rejected</div>
                    </div>
                  </div>
                </div>

                {/* Team Submissions */}
                <div className="p-6">
                  {team.submissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p>No submissions from this team yet</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {team.submissions.map((submission, index) => (
                        <div key={submission.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Step Header */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full">
                                  Step {submission.clue.stageNumber}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{submission.clue.description}</h4>
                                  <p className="text-sm text-gray-500">Stage {submission.clue.stageNumber}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{submission.status}</span>
                              </span>
                            </div>
                          </div>

                          {/* Submission Content */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Image */}
                              <div className="relative group">
                                <img
                                  src={submission.imageUrl}
                                  alt="Team submission"
                                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                                  onClick={() => setSelectedSubmission(submission)}
                                />
                                <button
                                  onClick={() => window.open(submission.imageUrl, '_blank')}
                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Open in new tab"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </button>
                              </div>

                              {/* Details */}
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-1">Description</h5>
                                  <p className="text-sm text-gray-600">{submission.description}</p>
                                </div>

                                <div className="text-xs text-gray-500 space-y-1">
                                  <p><strong>Submitted by:</strong> {submission.submittedBy.name}</p>
                                  <p><strong>Submitted:</strong> {formatDate(submission.createdAt)}</p>
                                </div>

                                {submission.adminFeedback && (
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Feedback:</p>
                                    <p className="text-sm text-gray-600">{submission.adminFeedback}</p>
                                  </div>
                                )}

                                {submission.status === 'PENDING' && (
                                  <button
                                    onClick={() => setSelectedSubmission(submission)}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>Review Submission</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Submission from {selectedSubmission.team.name}
                </h3>
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setApprovalFeedback('');
                    setRejectionFeedback('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6 relative group">
                <img
                  src={selectedSubmission.imageUrl}
                  alt="Team submission"
                  className="w-full max-h-96 object-contain rounded-lg border cursor-pointer"
                  onClick={() => window.open(selectedSubmission.imageUrl, '_blank')}
                />
                <button
                  onClick={() => window.open(selectedSubmission.imageUrl, '_blank')}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open in new tab"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                  {getStatusIcon(selectedSubmission.status)}
                  <span className="ml-1">{selectedSubmission.status}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Submitted {formatDate(selectedSubmission.createdAt)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedSubmission.description}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Team Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Team:</strong> {selectedSubmission.team.name}</p>
                  <p className="text-sm"><strong>Submitted by:</strong> {selectedSubmission.submittedBy.name}</p>
                  <p className="text-sm"><strong>Stage:</strong> {selectedSubmission.clue.stageNumber} - {selectedSubmission.clue.description}</p>
                </div>
              </div>

              {selectedSubmission.adminFeedback && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Previous Admin Feedback:</p>
                  <p className="text-sm text-red-700">{selectedSubmission.adminFeedback}</p>
                </div>
              )}

              {selectedSubmission.status === 'PENDING' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Feedback (Optional)
                    </label>
                    <textarea
                      value={approvalFeedback}
                      onChange={(e) => setApprovalFeedback(e.target.value)}
                      placeholder="Provide positive feedback for this submission..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleApproveSubmission}
                      disabled={loading}
                      className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Approve Submission
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Feedback (Required for rejection)
                    </label>
                    <textarea
                      value={rejectionFeedback}
                      onChange={(e) => setRejectionFeedback(e.target.value)}
                      placeholder="Provide feedback for why this submission was rejected..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleRejectSubmission}
                      disabled={loading || !rejectionFeedback.trim()}
                      className="mt-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsManagementTab;