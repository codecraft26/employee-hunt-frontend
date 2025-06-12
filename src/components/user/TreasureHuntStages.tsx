// components/user/TreasureHuntStages.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  AlertCircle, 
  Eye,
  Camera,
  FileText,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { useTreasureHunt, TreasureHunt, TeamProgress, Submission, TreasureHuntClue } from '../../hooks/useUserTreasureHunt';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string) => void;
  submitting: boolean;
  clue: TreasureHuntClue | null;
}

interface TreasureHuntStagesProps {
  hunt: TreasureHunt;
  teamId?: string;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  clue,
  onClose,
  onSubmit,
  submitting
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setImageUrl('');
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onSubmit(imageUrl.trim());
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    // Simple URL validation for preview
    if (url && (url.startsWith('http://') || url.startsWith('https://')) && 
        (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.gif'))) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  if (!isOpen || !clue) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Submit Solution - Stage {clue.stageNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-1">Clue Description:</p>
              <p className="text-blue-700">{clue.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Solution Image URL
              </label>
              <input
                id="imageUrl"
                type="url"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://example.com/your-solution-image.jpg"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your image to a service like Imgur, Cloudinary, or any image hosting service and paste the URL here.
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                <div className="border border-gray-300 rounded-lg p-2">
                  <img
                    src={imagePreview}
                    alt="Solution preview"
                    className="max-w-full h-48 object-contain mx-auto rounded"
                    onError={() => setImagePreview(null)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!imageUrl.trim() || submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Submit Solution</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TreasureHuntStages: React.FC<TreasureHuntStagesProps> = ({ hunt, teamId }) => {
  const {
    progress,
    submitting,
    progressLoading,
    error,
    submitStage,
    fetchProgress,
    getTimeRemaining,
    clearError
  } = useTreasureHunt();

  const [submissionModal, setSubmissionModal] = useState<{
    isOpen: boolean;
    clue: TreasureHuntClue | null;
  }>({
    isOpen: false,
    clue: null
  });

  const [selectedSubmission, setSelectedSubmission] = useState<{
    isOpen: boolean;
    submission: Submission | null;
  }>({
    isOpen: false,
    submission: null
  });

  // Auto-refresh progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hunt.id) {
        fetchProgress(hunt.id);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hunt.id, fetchProgress]);

  // Add helper function to check if hunt is accessible
  const canAccessHunt = (hunt: any) => {
    return hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS';
  };

  // Update the handleSubmitClue function
  const handleSubmitClue = async (imageUrl: string) => {
    if (!submissionModal.clue) return;

    if (!canAccessHunt(hunt)) {
      console.error('Cannot submit: Hunt is not active');
      return;
    }

    try {
      const success = await submitStage(
        hunt.id,
        submissionModal.clue.id,
        imageUrl
      );

      if (success) {
        setSubmissionModal({ isOpen: false, clue: null });
      }
    } catch (error) {
      console.error('Failed to submit stage:', error);
    }
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
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add null checks for progress
  const totalStages = progress?.totalStages ?? 0;
  const completedStages = progress?.completedStages ?? 0;
  const pendingStages = progress?.pendingStages ?? 0;
  const rejectedStages = progress?.rejectedStages ?? 0;

  // Get clues with status from progress
  const cluesWithStatus = progress?.submissions ?? [];

  // Add type for map callback parameters
  const renderSubmission = (submission: Submission, clue: TreasureHuntClue, index: number) => {
    const isLocked = false; // Submissions are always unlocked
    const canSubmit = submission.status === 'REJECTED';
    
    return (
      <div
        key={submission.id}
        className={`border rounded-lg p-4 transition-all ${
          isLocked 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                <Unlock className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-900">
                  Stage {clue.stageNumber}
                </span>
              </div>
              
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(submission.status)}`}>
                {getStatusIcon(submission.status)}
                <span className="ml-1">{submission.status}</span>
              </span>
            </div>

            <p className="text-sm mb-3 text-gray-700">
              {clue.description}
            </p>

            {/* Submission Image */}
            {submission.imageUrl && (
              <div className="mb-3">
                <img
                  src={submission.imageUrl}
                  alt={`Submission for stage ${clue.stageNumber}`}
                  className="max-w-full h-32 object-contain border border-gray-200 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Admin Feedback */}
            {submission.adminFeedback && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Admin Feedback</p>
                  <span className="text-xs text-gray-500">
                    {formatDate(submission.createdAt)}
                  </span>
                </div>
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Feedback:
                  </p>
                  <p className="text-xs text-gray-600">{submission.adminFeedback}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="ml-4">
            {canSubmit && (
              <button
                onClick={() => setSubmissionModal({ isOpen: true, clue })}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                disabled={submitting}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resubmit</span>
              </button>
            )}

            <button
              onClick={() => setSelectedSubmission({ isOpen: true, submission })}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (progressLoading && !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading treasure hunt progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hunt Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{hunt.title}</h2>
            <p className="text-green-100 mb-4">{hunt.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Trophy className="h-4 w-4 mr-1" />
                {completedStages} / {totalStages} Completed
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {getTimeRemaining(hunt.endTime)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {totalStages > 0 
                ? Math.round(((completedStages / totalStages) * 100))
                : 0}%
            </div>
            <div className="text-sm text-green-100">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ 
                width: `${totalStages > 0 
                  ? (completedStages / totalStages) * 100
                  : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Status Warning */}
        {!canAccessHunt(hunt) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {hunt.status === 'UPCOMING' 
                  ? 'This hunt has not started yet. Actions will be available when the hunt becomes active.'
                  : 'This hunt has ended. Actions are no longer available.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
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

      {/* Stages List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Treasure Hunt Stages</h3>
          <button
            onClick={() => fetchProgress(hunt.id)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            disabled={progressLoading}
          >
            <RefreshCw className={`h-4 w-4 ${progressLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {!canAccessHunt(hunt) ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hunt.status === 'UPCOMING' ? 'Hunt Not Started' : 'Hunt Ended'}
            </h3>
            <p className="text-gray-500">
              {hunt.status === 'UPCOMING'
                ? 'This treasure hunt has not started yet. You will be able to access the stages when the hunt becomes active.'
                : 'This treasure hunt has ended. You can view your submissions but cannot make new ones.'}
            </p>
          </div>
        ) : cluesWithStatus.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stages available</h3>
            <p className="text-gray-500">This treasure hunt doesn't have any stages set up yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cluesWithStatus.map((submission, index) => {
              const clue: TreasureHuntClue = {
                id: submission.clue.id,
                stageNumber: submission.clue.stageNumber,
                description: submission.clue.description,
                status: submission.status,
                createdAt: submission.createdAt,
                updatedAt: submission.createdAt,
                adminFeedback: submission.adminFeedback
              };
              return renderSubmission(submission, clue, index);
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={submissionModal.isOpen}
        clue={submissionModal.clue}
        onClose={() => setSubmissionModal({ isOpen: false, clue: null })}
        onSubmit={handleSubmitClue}
        submitting={submitting}
      />

      {/* Submission View Modal */}
      {selectedSubmission.isOpen && selectedSubmission.submission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission Details - Stage {selectedSubmission.submission.clue.stageNumber}
                </h3>
                <button
                  onClick={() => setSelectedSubmission({ isOpen: false, submission: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedSubmission.submission.status)}`}>
                    {getStatusIcon(selectedSubmission.submission.status)}
                    <span className="ml-2">{selectedSubmission.submission.status}</span>
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Image:</p>
                  <img
                    src={selectedSubmission.submission.imageUrl}
                    alt="Submission"
                    className="max-w-full h-64 object-contain border border-gray-200 rounded"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Submitted:</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedSubmission.submission.createdAt)}
                  </p>
                </div>

                {selectedSubmission.submission.adminFeedback && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Admin Feedback:</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{selectedSubmission.submission.adminFeedback}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSubmission({ isOpen: false, submission: null })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasureHuntStages;