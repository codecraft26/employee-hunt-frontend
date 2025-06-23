import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Crown,
  MessageSquare,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useMemberSubmissions } from '../../hooks/useMemberSubmissions';
import { useTeams } from '../../hooks/useTeams';
import { TeamMemberSubmission } from '../../types/teams';

interface UserSubmissionsViewProps {
  className?: string;
}

const UserSubmissionsView: React.FC<UserSubmissionsViewProps> = ({ className = '' }) => {
  const { 
    loading, 
    error, 
    memberSubmissions, 
    fetchMySubmissions, 
    clearError 
  } = useMemberSubmissions();
  
  const { myTeam, fetchMyTeam } = useTeams();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      if (!myTeam) {
        await fetchMyTeam();
      }
      if (myTeam?.id) {
        await fetchMySubmissions(myTeam.id);
      }
    } catch (error) {
      console.error('Failed to initialize user submissions data:', error);
    }
  };

  const handleRefresh = async () => {
    if (!myTeam?.id) return;
    
    setRefreshing(true);
    try {
      await fetchMySubmissions(myTeam.id);
    } catch (error) {
      console.error('Failed to refresh submissions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED_BY_LEADER':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED_BY_LEADER':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'SENT_TO_ADMIN':
        return <Crown className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Leader Review';
      case 'APPROVED_BY_LEADER':
        return 'Approved by Leader';
      case 'REJECTED_BY_LEADER':
        return 'Rejected by Leader';
      case 'SENT_TO_ADMIN':
        return 'Sent to Admin';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED_BY_LEADER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED_BY_LEADER':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SENT_TO_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white-900">My Submissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your treasure hunt submissions for {myTeam.name}
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
        {loading && memberSubmissions.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="h-20 w-20 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : memberSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any images for treasure hunt clues yet.
            </p>
            <p className="text-sm text-gray-500">
              Start participating in treasure hunts to see your submissions here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {memberSubmissions.map((submission) => (
              <div 
                key={submission.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex space-x-4">
                  {/* Image Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={submission.imageUrl}
                        alt={submission.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {submission.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Clue ID: {submission.clueId}
                        </p>
                      </div>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{getStatusText(submission.status)}</span>
                      </div>
                    </div>

                    {/* Submission Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted {new Date(submission.createdAt).toLocaleDateString()}</span>
                      </div>
                      {submission.reviewedAt && (
                        <div className="flex items-center space-x-1">
                          <Crown className="h-3 w-3" />
                          <span>Reviewed {new Date(submission.reviewedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Leader Notes */}
                    {submission.leaderNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 mb-1">Leader Feedback</p>
                            <p className="text-sm text-blue-700">{submission.leaderNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviewed By */}
                    {submission.reviewedBy && (
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Crown className="h-3 w-3" />
                        <span>Reviewed by {submission.reviewedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {memberSubmissions.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {memberSubmissions.length}
              </p>
              <p className="text-xs text-gray-600">Total Submissions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {memberSubmissions.filter(s => s.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-600">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {memberSubmissions.filter(s => s.status === 'APPROVED_BY_LEADER' || s.status === 'SENT_TO_ADMIN').length}
              </p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {memberSubmissions.filter(s => s.status === 'REJECTED_BY_LEADER').length}
              </p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubmissionsView; 