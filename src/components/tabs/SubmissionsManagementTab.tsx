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
  Eye
} from 'lucide-react';
import { useTreasureHunts, ClueSubmission } from '../../hooks/useTreasureHunts';

interface SubmissionsManagementTabProps {
  treasureHuntId: string | null;
  onBack: () => void;
}

interface FeedbackModalProps {
  isOpen: boolean;
  submission: ClueSubmission | null;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  loading: boolean;
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
  onBack
}) => {
  const {
    currentTreasureHunt,
    submissions,
    loading,
    error,
    fetchTreasureHuntById,
    fetchTreasureHuntSubmissions,
    approveSubmission,
    rejectSubmission,
    getSubmissionStats,
    clearError
  } = useTreasureHunts();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    submission: ClueSubmission | null;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    submission: null,
    action: 'approve'
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (treasureHuntId) {
      fetchTreasureHuntById(treasureHuntId);
      fetchTreasureHuntSubmissions(treasureHuntId);
    }
  }, [treasureHuntId, fetchTreasureHuntById, fetchTreasureHuntSubmissions]);

  const handleApprove = (submission: ClueSubmission) => {
    setFeedbackModal({
      isOpen: true,
      submission,
      action: 'approve'
    });
  };

  const handleReject = (submission: ClueSubmission) => {
    setFeedbackModal({
      isOpen: true,
      submission,
      action: 'reject'
    });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackModal.submission || !treasureHuntId) return;

    setActionLoading(true);
    try {
      console.log('Processing submission:', {
        treasureHuntId,
        submissionId: feedbackModal.submission.id,
        action: feedbackModal.action,
        feedback
      });

      if (feedbackModal.action === 'approve') {
        await approveSubmission(treasureHuntId, feedbackModal.submission.id, { feedback });
      } else {
        await rejectSubmission(treasureHuntId, feedbackModal.submission.id, { feedback });
      }
      
      setFeedbackModal({ isOpen: false, submission: null, action: 'approve' });
    } catch (error) {
      console.error('Failed to process submission:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'ALL' || submission.status === filterStatus;
    const matchesSearch = submission.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.clue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === null || submission.clue.stageNumber === selectedStage;
    
    return matchesStatus && matchesSearch && matchesStage;
  });

  // Get unique stages for filter
  const availableStages = Array.from(new Set(submissions.map(s => s.clue.stageNumber))).sort((a, b) => a - b);

  const stats = getSubmissionStats();

  if (!treasureHuntId) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Treasure Hunt Selected</h3>
        <p className="text-gray-500">Please select a treasure hunt to view submissions.</p>
      </div>
    );
  }

  if (loading && submissions.length === 0) {
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
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Treasure Hunts
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submissions Management</h2>
            {currentTreasureHunt && (
              <p className="text-gray-600">{currentTreasureHunt.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejectedSubmissions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams or clues..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={selectedStage || ''}
              onChange={(e) => setSelectedStage(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Stages</option>
              {availableStages.map(stage => (
                <option key={stage} value={stage}>Stage {stage}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500">
            {submissions.length === 0 
              ? 'No submissions have been made for this treasure hunt yet.'
              : 'No submissions match your current filters.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Stage {submission.clue.stageNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Team: {submission.team.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Clue:</span> {submission.clue.description}
                        </p>
                        
                        {submission.adminFeedback && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Admin Feedback:
                            </p>
                            <p className="text-sm text-gray-600">{submission.adminFeedback}</p>
                            {submission.approvedBy && (
                              <p className="text-xs text-gray-500 mt-1">
                                By: {submission.approvedBy.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-700 mb-2 flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Submitted Image:
                        </p>
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          {submission.imageUrl ? (
                            <img
                              src={submission.imageUrl}
                              alt="Submission"
                              className="max-w-full max-h-full object-contain rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '';
                                e.currentTarget.className = 'hidden';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={submission.imageUrl ? 'hidden' : 'text-gray-400 text-center'}>
                            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">Image not available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {submission.status === 'PENDING' && (
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(submission)}
                      className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(submission)}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        submission={feedbackModal.submission}
        action={feedbackModal.action}
        onClose={() => setFeedbackModal({ isOpen: false, submission: null, action: 'approve' })}
        onSubmit={handleFeedbackSubmit}
        loading={actionLoading}
      />
    </div>
  );
};

export default SubmissionsManagementTab;