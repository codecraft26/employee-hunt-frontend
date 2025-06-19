// components/user/UserPollsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Vote as VoteIcon, Clock, Users, Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Vote, VoteStatus, VoteType } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import VotePollComponent from '../polls/VotePollComponent';
import PollsFilter from '../polls/PollsFilter';

interface UserPollsTabProps {
  onVoteSuccess?: () => void;
}

const UserPollsTab: React.FC<UserPollsTabProps> = ({ onVoteSuccess }) => {
  const { getUserVotes, loading, error } = useVotes();
  const [polls, setPolls] = useState<Vote[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<VoteStatus | 'ALL'>(VoteStatus.ACTIVE);
  const [activeTypeFilter, setActiveTypeFilter] = useState<VoteType | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(() => {
      fetchPolls();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await getUserVotes();
      if (response?.data) {
        setPolls(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPolls();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleVoteSuccess = (pollTitle?: string) => {
    fetchPolls();
    setSuccessMessage(`Thank you for voting${pollTitle ? ` on "${pollTitle}"` : ''}!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    onVoteSuccess?.();
  };

  // Filter polls based on active filters
  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      if (!poll) return false;
      const statusMatch = activeStatusFilter === 'ALL' || poll.status === activeStatusFilter;
      const typeMatch = activeTypeFilter === 'ALL' || poll.type === activeTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [polls, activeStatusFilter, activeTypeFilter]);

  // Calculate poll counts for filter badges
  const pollCounts = useMemo(() => {
    return {
      total: polls.length,
      active: polls.filter(p => p && p.status === VoteStatus.ACTIVE).length,
      upcoming: polls.filter(p => p && p.status === VoteStatus.UPCOMING).length,
      completed: polls.filter(p => p && p.status === VoteStatus.COMPLETED).length,
    };
  }, [polls]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTimeRemaining = (endTime: string | null | undefined) => {
    if (!endTime) return 'No end time set';
    
    try {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) return 'Ended';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h remaining`;
      if (hours > 0) return `${hours}h remaining`;
      
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m remaining`;
    } catch (error) {
      return 'Invalid end time';
    }
  };

  if (loading && polls.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Polls & Voting</h2>
          <p className="text-gray-600 mt-1">Participate in team polls and see results</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <VoteIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pollCounts.total}</p>
              <p className="text-xs text-gray-600">Total Polls</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pollCounts.active}</p>
              <p className="text-xs text-gray-600">Active Polls</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pollCounts.upcoming}</p>
              <p className="text-xs text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pollCounts.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PollsFilter
        activeStatus={activeStatusFilter}
        activeType={activeTypeFilter}
        onStatusChange={setActiveStatusFilter}
        onTypeChange={setActiveTypeFilter}
        pollCounts={pollCounts}
      />

      {/* Polls List */}
      <div className="space-y-6">
        {filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <VoteIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {polls.length === 0 ? 'No polls available' : 'No polls match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {polls.length === 0 
                ? 'Check back later for new polls to participate in'
                : 'Try adjusting your filters to see more polls'
              }
            </p>
          </div>
        ) : (
          filteredPolls.map((poll) => (
            <VotePollComponent
              key={poll.id}
              poll={poll}
              onVoteSuccess={() => handleVoteSuccess(poll?.title)}
              showResults={poll?.status === VoteStatus.COMPLETED || poll?.isResultPublished}
            />
          ))
        )}
      </div>

      {/* Active Poll Reminder */}
      {pollCounts.active > 0 && activeStatusFilter !== VoteStatus.ACTIVE && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Active Polls Available</h4>
              <p className="text-sm text-gray-600">
                You have {pollCounts.active} active poll{pollCounts.active > 1 ? 's' : ''} waiting for your vote.
              </p>
            </div>
            <button
              onClick={() => setActiveStatusFilter(VoteStatus.ACTIVE)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              View Active Polls
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPollsTab;