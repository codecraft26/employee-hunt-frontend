import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Crown,
  Users,
  Image as ImageIcon,
  Send,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useMemberSubmissions } from '../../hooks/useMemberSubmissions';
import { useTeams } from '../../hooks/useTeams';
import { TeamMemberSubmission } from '../../types/teams';

interface LeaderReviewPanelProps {
  treasureHuntId?: string;
  clueId?: string;
  className?: string;
}

const LeaderReviewPanel: React.FC<LeaderReviewPanelProps> = ({ 
  treasureHuntId, 
  clueId, 
  className = '' 
}) => {
  const { 
    loading, 
    error, 
    fetchSubmissionsForReview, 
    approveSubmission, 
    rejectSubmission, 
    clearError 
  } = useMemberSubmissions();
  
  const { myTeam, fetchMyTeam } = useTeams();
  
  const [submissions, setSubmissions] = useState<TeamMemberSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TeamMemberSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, [treasureHuntId, clueId]);

  const initializeData = async () => {
    try {
      if (!myTeam) {
        await fetchMyTeam();
      }
      if (myTeam?.id && clueId) {
        await loadSubmissions();
      }
    } catch (error) {
      console.error('Failed to initialize leader review data:', error);
    }
  };

  const loadSubmissions = async () => {
    if (!myTeam?.id || !clueId) return;
    
    try {
      const submissionsList = await fetchSubmissionsForReview(myTeam.id, clueId);
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Failed to load submissions for review:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSubmissions();
    } catch (error) {
      console.error('Failed to refresh submissions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openReviewModal = (submission: TeamMemberSubmission, isApproval: boolean) => {
    setSelectedSubmission(submission);
    setIsApproving(isApproval);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    try {
      let success = false;
      
      if (isApproving) {
        success = await approveSubmission(selectedSubmission.id, reviewNotes);
      } else {
        success = await rejectSubmission(selectedSubmission.id, reviewNotes);
      }

      if (success) {
        setShowReviewModal(false);
        setSelectedSubmission(null);
        setReviewNotes('');
        await loadSubmissions(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to review submission:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED_BY_LEADER':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED_BY_LEADER':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SENT_TO_ADMIN':
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review';
      case 'APPROVED_BY_LEADER':
        return 'Approved';
      case 'REJECTED_BY_LEADER':
        return 'Rejected';
      case 'SENT_TO_ADMIN':
        return 'Sent to Admin';
      default:
        return 'Unknown Status';
    }
  };

  if (!myTeam) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Assignment</h3>
          <p className="text-gray-600">You are not assigned to any team yet.</p>
        </div>
      </div>
    );
  }

  if (!myTeam.leader || myTeam.leader.id !== myTeam.leaderId) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leader Access Required</h3>
          <p className="text-gray-600">This feature is only available to team leaders.</p>
        </div>
      </div>
    );
  }

  if (!clueId) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Clue</h3>
          <p className="text-gray-600">Please select a treasure hunt clue to review submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Crown className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Leader Review Panel</h2>
            </div>
            <p className="text-sm text-gray-600">
              Review team member submissions for {myTeam.name}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh submissions"
          >
            <RefreshCw className={`h-5 w-5 ${(refreshing || loading) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-red-600 hover:text-red-700 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading && submissions.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="h-24 w-24 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions to Review</h3>
            <p className="text-gray-600 mb-4">
              No team members have submitted images for this clue yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={submission.imageUrl}
                        alt={submission.description}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => window.open(submission.imageUrl, '_blank')}
                      />
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {submission.description}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>By: {submission.submittedBy.name}</span>
                          <span>•</span>
                          <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className="text-sm text-gray-600">{getStatusText(submission.status)}</span>
                      </div>
                    </div>

                    {/* Leader Notes (if already reviewed) */}
                    {submission.leaderNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 mb-1">Your Review</p>
                            <p className="text-sm text-blue-700">{submission.leaderNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {submission.status === 'PENDING' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openReviewModal(submission, true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve & Send to Admin</span>
                        </button>
                        <button
                          onClick={() => openReviewModal(submission, false)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {submission.status === 'APPROVED_BY_LEADER' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Approved and automatically sent to admin for final review
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isApproving ? 'Approve Submission' : 'Reject Submission'}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-3">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedSubmission.imageUrl}
                      alt={selectedSubmission.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {selectedSubmission.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      By: {selectedSubmission.submittedBy.name}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isApproving ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    isApproving 
                      ? 'Add any comments about this submission...' 
                      : 'Please explain why this submission is being rejected...'
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isApproving && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Send className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Approving this submission will automatically send it to the admin for final review.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={loading || (!isApproving && !reviewNotes.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isApproving 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : (isApproving ? 'Approve & Send' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {submissions.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.length}
              </p>
              <p className="text-xs text-gray-600">Total Submissions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-600">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'APPROVED_BY_LEADER' || s.status === 'SENT_TO_ADMIN').length}
              </p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.status === 'REJECTED_BY_LEADER').length}
              </p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderReviewPanel; 