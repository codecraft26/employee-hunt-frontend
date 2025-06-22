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
      const statusMatch = activeStatusFilter === 'ALL' || poll.status === activeStatusFilter;
      const typeMatch = activeTypeFilter === 'ALL' || poll.type === activeTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [polls, activeStatusFilter, activeTypeFilter]);

  // Calculate poll counts for filter badges
  const pollCounts = useMemo(() => {
    return {
      total: polls.length,
      active: polls.filter(p => p.status === VoteStatus.ACTIVE).length,
      upcoming: polls.filter(p => p.status === VoteStatus.UPCOMING).length,
      completed: polls.filter(p => p.status === VoteStatus.COMPLETED).length,
    };
  }, [polls]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endTime: string) => {
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
  };

  if (loading && polls.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="gaming-card p-4 sm:p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="mt-4 h-10 bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient flex items-center gap-3">
            <VoteIcon className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
            Polls & Voting
          </h2>
          <p className="text-slate-300 mt-1">Participate in team polls and see results</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-gaming-secondary"
          title="Refresh polls"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="gaming-card p-4 border border-red-500/20 bg-red-500/10">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="gaming-card p-4 border border-green-500/20 bg-green-500/10">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="gaming-card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <VoteIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pollCounts.total}</p>
              <p className="text-xs text-slate-400">Total Polls</p>
            </div>
          </div>
        </div>

        <div className="gaming-card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pollCounts.active}</p>
              <p className="text-xs text-slate-400">Active Polls</p>
            </div>
          </div>
        </div>

        <div className="gaming-card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pollCounts.upcoming}</p>
              <p className="text-xs text-slate-400">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="gaming-card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pollCounts.completed}</p>
              <p className="text-xs text-slate-400">Completed</p>
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
          <div className="text-center py-12 gaming-card">
            <div className="w-24 h-24 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <VoteIcon className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {polls.length === 0 ? 'No polls available' : 'No polls match your filters'}
            </h3>
            <p className="text-slate-400 mb-4">
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
              onVoteSuccess={() => handleVoteSuccess(poll.title)}
              showResults={poll.status === VoteStatus.COMPLETED || poll.isResultPublished}
            />
          ))
        )}
      </div>

      {/* Active Poll Reminder */}
      {pollCounts.active > 0 && activeStatusFilter !== VoteStatus.ACTIVE && (
        <div className="gaming-card p-4 border border-green-500/20 bg-green-500/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white">Active Polls Available</h4>
              <p className="text-sm text-slate-300">
                You have {pollCounts.active} active poll{pollCounts.active > 1 ? 's' : ''} waiting for your vote.
              </p>
            </div>
            <button
              onClick={() => setActiveStatusFilter(VoteStatus.ACTIVE)}
              className="btn-gaming text-sm font-medium"
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