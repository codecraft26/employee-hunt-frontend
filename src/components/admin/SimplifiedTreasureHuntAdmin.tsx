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
import { useMemberSubmissions } from '../../hooks/useMemberSubmissions';

interface SimplifiedTreasureHuntAdminProps {
  hunt: any;
}

const SimplifiedTreasureHuntAdmin: React.FC<SimplifiedTreasureHuntAdminProps> = ({ hunt }) => {
  const { 
    approveTeamSubmission, 
    rejectTeamSubmission, 
    loading 
  } = useTreasureHunts();
  
  const {
    fetchTreasureHuntSubmissions
  } = useMemberSubmissions();
  
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
      const submissions = await fetchTreasureHuntSubmissions(hunt.id);
      setTeamSubmissions(submissions || []);
    } catch (error) {
      // Handle error
    } finally {
      setRefreshing(false);
    }
  }, [hunt?.id, fetchTreasureHuntSubmissions]);

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
        await approveTeamSubmission(hunt.id, submissionId, feedback.trim() || undefined);
      } else {
        await rejectTeamSubmission(hunt.id, submissionId, feedback.trim());
      }

      setFeedbackModal({ isOpen: false, submission: null, action: 'approve' });
      setFeedback('');
      await loadTeamSubmissions();
      
      alert(`Submission ${action}d successfully!`);
    } catch (error) {
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

  // Render team submissions
  const renderTeamSubmissions = () => {
    if (!teamSubmissions || teamSubmissions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No submissions yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {teamSubmissions.map((submission, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {submission.team?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{submission.team?.name || 'Unknown Team'}</h4>
                  <p className="text-sm text-gray-500">Stage {submission.stageNumber || index + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getStatusColor(submission.status)} rounded-full`}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">{submission.status}</span>
                </span>
              </div>
            </div>
            
            {/* Display multiple images if available, otherwise show single image */}
            {submission.imageUrls && submission.imageUrls.length > 0 ? (
              <div className="mb-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {submission.imageUrls.map((imageUrl: string, imgIndex: number) => (
                    <div key={imgIndex} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Submission ${index + 1} - Image ${imgIndex + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                        {imgIndex + 1}/{submission.imageUrls.length}
                      </div>
                    </div>
                  ))}
                </div>
                {submission.imageUrls.length > 1 && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {submission.imageUrls.length} images submitted by team
                  </p>
                )}
              </div>
            ) : submission.imageUrl && (
              <div className="mb-3">
                <img 
                  src={submission.imageUrl} 
                  alt={`Submission ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{submission.description || 'No description provided'}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => openFeedbackModal(submission, 'approve')}
                  disabled={actionLoading[submission.id]}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => openFeedbackModal(submission, 'reject')}
                  disabled={actionLoading[submission.id]}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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

        {renderTeamSubmissions()}
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