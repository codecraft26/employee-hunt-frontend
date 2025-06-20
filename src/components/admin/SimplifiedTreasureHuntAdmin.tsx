'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Users,
  Trophy,
  Star,
  RefreshCw,
  Send,
  AlertCircle,
  Target,
  Crown,
  Calendar,
  X,
  Camera
} from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';

interface SimplifiedTreasureHuntAdminProps {
  hunt: any;
}

const SimplifiedTreasureHuntAdmin: React.FC<SimplifiedTreasureHuntAdminProps> = ({ hunt }) => {
  const { 
    getTeamSubmissionsForAdmin, 
    adminApproveTeamSubmission, 
    adminRejectTeamSubmission, 
    loading 
  } = useTreasureHunts();
  
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    submission: any;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    submission: null,
    action: 'approve'
  });
  const [feedback, setFeedback] = useState('');

  // Load team submissions
  const loadTeamSubmissions = useCallback(async () => {
    if (!hunt?.id) return;
    
    setRefreshing(true);
    try {
      const submissions = await getTeamSubmissionsForAdmin(hunt.id);
      console.log('🎯 Admin Panel - Team Submissions Data:', submissions);
      console.log('🎯 First submission structure:', submissions?.[0]);
      
      // Log image information for debugging
      submissions?.forEach((submission, index) => {
        console.log(`🖼️ Submission ${index + 1}:`, {
          id: submission.id,
          hasImageUrls: !!submission.imageUrls,
          imageUrlsCount: submission.imageUrls?.length || 0,
          imageUrls: submission.imageUrls,
          hasSingleImageUrl: !!submission.imageUrl,
          imageUrl: submission.imageUrl,
          hasSelectedSubmissions: !!submission.selectedSubmissions,
          selectedSubmissionsCount: submission.selectedSubmissions?.length || 0
        });
      });
      
      setTeamSubmissions(submissions || []);
    } catch (error) {
      console.error('Failed to load team submissions:', error);
    } finally {
      setRefreshing(false);
    }
  }, [hunt?.id, getTeamSubmissionsForAdmin]);

  useEffect(() => {
    loadTeamSubmissions();
  }, [loadTeamSubmissions]);

  const handleAction = async (submission: any, action: 'approve' | 'reject') => {
    if (action === 'reject' && !feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    const submissionId = submission.id;
    setActionLoading(prev => ({ ...prev, [submissionId]: true }));

    try {
      if (action === 'approve') {
        await adminApproveTeamSubmission(hunt.id, submissionId, {
          feedback: feedback.trim() || undefined
        });
      } else {
        await adminRejectTeamSubmission(hunt.id, submissionId, {
          feedback: feedback.trim()
        });
      }

      setFeedbackModal({ isOpen: false, submission: null, action: 'approve' });
      setFeedback('');
      await loadTeamSubmissions();
      
      alert(`Submission ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} submission:`, error);
      alert(`Failed to ${action} submission. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const openFeedbackModal = (submission: any, action: 'approve' | 'reject') => {
    setFeedbackModal({ isOpen: true, submission, action });
    setFeedback('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const pendingSubmissions = teamSubmissions.filter(s => s.status === 'PENDING');
  const approvedSubmissions = teamSubmissions.filter(s => s.status === 'APPROVED');
  const rejectedSubmissions = teamSubmissions.filter(s => s.status === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{hunt.title} - Admin Review</h2>
            <p className="text-purple-100 mb-4">{hunt.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Single Clue Hunt
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {teamSubmissions.length} Team Submissions
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {pendingSubmissions.length} Pending Review
              </span>
            </div>
          </div>
          <button
            onClick={loadTeamSubmissions}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingSubmissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Approved</p>
              <p className="text-2xl font-bold text-green-900">{approvedSubmissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedSubmissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clue Description */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hunt Clue</h3>
            <p className="text-sm text-gray-500">What teams were asked to find</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 font-medium">{hunt.clues?.[0]?.description}</p>
        </div>
      </div>

      {/* Team Submissions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Submissions ({teamSubmissions.length})
        </h3>

        {teamSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h4>
            <p className="text-gray-500">Teams haven't submitted any photos for review yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teamSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="border rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{submission.team?.name}</span>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </h4>
                      <p className="text-sm text-gray-500">
                        Submitted by: {submission.submittedBy?.name} (Team Leader)
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-1">{submission.status}</span>
                  </span>
                </div>

                {/* Leader Notes */}
                {submission.leaderNotes && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Leader Notes:</p>
                    <p className="text-blue-700 text-sm">{submission.leaderNotes}</p>
                  </div>
                )}

                {/* Images */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Team Selected Images ({submission.imageUrls?.length || 1})
                    {submission.imageUrls?.length > 1 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        - {submission.imageUrls.length} photos submitted by team leader
                      </span>
                    )}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Display ALL images from imageUrls array */}
                    {submission.imageUrls && submission.imageUrls.length > 0 ? (
                      submission.imageUrls.map((imageUrl: string, index: number) => (
                        <div key={`${submission.id}-image-${index}`} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Team ${submission.team?.name} submission ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-blue-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
                            onError={(e) => {
                              console.error(`Failed to load image ${index + 1}:`, imageUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium">
                            Photo {index + 1}
                          </div>
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          {/* Image index indicator */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                            {index + 1} of {submission.imageUrls.length}
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ))
                    ) : submission.imageUrl ? (
                      /* Fallback to single imageUrl if imageUrls array is empty */
                      <div className="relative group">
                        <img
                          src={submission.imageUrl}
                          alt="Team submission"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 left-2 bg-gray-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                          Single Photo
                        </div>
                      </div>
                    ) : (
                      /* No images available */
                      <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No images available for this submission</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Submission Details */}
                {submission.selectedSubmissions?.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Individual Member Submissions:</p>
                    <div className="space-y-3">
                      {submission.selectedSubmissions.map((memberSubmission: any, index: number) => (
                        <div key={memberSubmission.id || index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <img
                              src={memberSubmission.imageUrl}
                              alt={`Submission by ${memberSubmission.submittedBy?.name}`}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {memberSubmission.submittedBy?.name || 'Unknown Member'}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {new Date(memberSubmission.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {memberSubmission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {submission.description}
                    </p>
                  </div>
                )}

                {/* Admin Feedback */}
                {submission.adminFeedback && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">Your Feedback:</p>
                    <p className="text-green-700 text-sm">{submission.adminFeedback}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {submission.status === 'PENDING' && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => openFeedbackModal(submission, 'approve')}
                      disabled={actionLoading[submission.id]}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openFeedbackModal(submission, 'reject')}
                      disabled={actionLoading[submission.id]}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  {feedbackModal.action === 'approve' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>
                    {feedbackModal.action === 'approve' ? 'Approve' : 'Reject'} Submission
                  </span>
                </h3>
                <button
                  onClick={() => setFeedbackModal({ isOpen: false, submission: null, action: 'approve' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Team: <span className="font-medium">{feedbackModal.submission?.team?.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  This feedback will be visible to all team members.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback {feedbackModal.action === 'reject' ? '*' : '(Optional)'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    feedbackModal.action === 'approve'
                      ? "Great work! Your photos clearly show..."
                      : "Please improve by..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {feedbackModal.action === 'reject' && !feedback.trim() && (
                  <p className="text-red-500 text-xs mt-1">Feedback is required for rejection</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFeedbackModal({ isOpen: false, submission: null, action: 'approve' })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(feedbackModal.submission, feedbackModal.action)}
                  disabled={feedbackModal.action === 'reject' && !feedback.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    feedbackModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {feedbackModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedTreasureHuntAdmin; 