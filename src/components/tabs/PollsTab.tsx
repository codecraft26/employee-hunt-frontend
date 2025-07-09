// components/tabs/PollsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, Send, Clock, Users, Eye, Edit, Trash2, Calendar, RefreshCw, Building2, UserCheck } from 'lucide-react';
import { Vote, VoteStatus, VoteType, VotingOptionType } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import CreatePollModal from '../modals/CreatePollModal';
import EditPollModal from '../modals/EditPollModal';
import PollsFilter from '../polls/PollsFilter';
import TimerDisplay from '../shared/TimerDisplay';

interface PollsTabProps {
  onViewResults: (pollId: string) => void;
  onNotifyWinner: (pollId: string) => void;
}

const PollsTab: React.FC<PollsTabProps> = ({ 
  onViewResults, 
  onNotifyWinner 
}) => {
  const { getVotes, deleteVote, publishResults, loading, error } = useVotes();
  const [polls, setPolls] = useState<Vote[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Vote | null>(null);
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<VoteStatus | 'ALL'>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<VoteType | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notifyingPollId, setNotifyingPollId] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await getVotes();
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

  const handleCreateSuccess = () => {
    fetchPolls();
    setSuccessMessage('Poll created successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleEditPoll = (poll: Vote) => {
    setEditingPoll(poll);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchPolls();
    setSuccessMessage('Poll updated successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleNotifyUsers = async (pollId: string) => {
    console.log('🔍 Poll notification requested for poll ID:', pollId);
    setNotifyingPollId(pollId);
    try {
      // Call the parent's onNotifyWinner function
      console.log('📤 Calling onNotifyWinner function...');
      await onNotifyWinner(pollId);
      console.log('✅ Notification sent successfully');
      setSuccessMessage('Users have been notified about the poll results successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('❌ Error notifying users:', error);
      setSuccessMessage('Failed to notify users about poll results. Please try again.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setNotifyingPollId(null);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    const pollToDelete = polls.find(p => p.id === pollId);
    const confirmMessage = `Are you sure you want to delete "${pollToDelete?.title}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setDeletingPollId(pollId);
      try {
        await deleteVote(pollId);
        setPolls(polls.filter(poll => poll.id !== pollId));
        setSuccessMessage(`Poll "${pollToDelete?.title}" has been deleted successfully.`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err) {
        console.error('Failed to delete poll:', err);
      } finally {
        setDeletingPollId(null);
      }
    }
  };

  const handlePublishResults = async (pollId: string) => {
    try {
      await publishResults(pollId);
      const poll = polls.find(p => p.id === pollId);
      setSuccessMessage(`Results published for "${poll?.title}"`);
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchPolls();
    } catch (err) {
      console.error('Failed to publish results:', err);
    }
  };

  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      const statusMatch = activeStatusFilter === 'ALL' || poll.status === activeStatusFilter;
      const typeMatch = activeTypeFilter === 'ALL' || poll.type === activeTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [polls, activeStatusFilter, activeTypeFilter]);

  const pollCounts = useMemo(() => {
    return {
      total: polls.length,
      active: polls.filter(p => p.status === VoteStatus.ACTIVE).length,
      upcoming: polls.filter(p => p.status === VoteStatus.UPCOMING).length,
      completed: polls.filter(p => p.status === VoteStatus.COMPLETED).length,
    };
  }, [polls]);

  const getStatusColor = (status: VoteStatus) => {
    switch (status) {
      case VoteStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case VoteStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case VoteStatus.UPCOMING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Get poll timing status for TimerDisplay
  const getPollTimingStatus = (poll: Vote) => {
    const now = new Date().getTime();
    const start = new Date(poll.startTime).getTime();
    const end = new Date(poll.endTime).getTime();
    
    if (now < start) {
      return { status: 'upcoming' as const, urgency: 'normal' as const };
    } else if (now >= start && now < end) {
      const timeRemaining = end - now;
      return { 
        status: 'active' as const, 
        urgency: timeRemaining < 60 * 60 * 1000 ? 'high' as const : timeRemaining < 24 * 60 * 60 * 1000 ? 'medium' as const : 'normal' as const 
      };
    } else {
      return { status: 'ended' as const, urgency: 'none' as const };
    }
  };

  if (loading && polls.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Polls & Voting Management</h2>
            <p className="text-gray-600 mt-1">Manage all polls and track voting progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh polls"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Poll</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <PollsFilter
          activeStatus={activeStatusFilter}
          activeType={activeTypeFilter}
          onStatusChange={setActiveStatusFilter}
          onTypeChange={setActiveTypeFilter}
          pollCounts={pollCounts}
        />

        <div className="space-y-6">
          {filteredPolls.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {polls.length === 0 ? 'No polls created yet' : 'No polls match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {polls.length === 0 
                  ? 'Create your first poll to start engaging with teams'
                  : 'Try adjusting your filters to see more polls'
                }
              </p>
              {polls.length === 0 && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create First Poll
                </button>
              )}
            </div>
          ) : (
            filteredPolls.map((poll) => (
              <div key={poll.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(poll.status)}`}>
                          {poll.status}
                        </span>
                      </div>
                      {poll.description && (
                        <p className="text-sm text-gray-600 mb-3">{poll.description}</p>
                      )}
                      <div className="flex items-center space-x-4 flex-wrap gap-2">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {poll.type === VoteType.SINGLE_CHOICE ? 'Single Choice' : 'Multiple Choice'}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          {poll.votingOptionType === VotingOptionType.USER_SPECIFIC ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              User-Specific Poll
                            </>
                          ) : poll.votingOptionType === VotingOptionType.CATEGORY_USER_BASED ? (
                            <>
                              <Building2 className="h-4 w-4 mr-1" />
                              Category-User Poll
                            </>
                          ) : (
                            <>
                              <Building2 className="h-4 w-4 mr-1" />
                              Category-Based Poll
                            </>
                          )}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {poll.categoryType === 'ALL' ? 'All Categories' : `${poll.allowedCategories?.length || 0} Categories`}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {poll.totalVotes} votes
                        </span>
                        {poll.status === VoteStatus.ACTIVE && (
                          <span className="text-sm text-orange-600 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <TimerDisplay 
                              variant="compact"
                              status={getPollTimingStatus(poll).status}
                              urgency={getPollTimingStatus(poll).urgency}
                              startTime={poll.startTime}
                              endTime={poll.endTime}
                              showCountdown={true}
                              className="text-orange-600"
                            />
                          </span>
                        )}
                        {poll.status === VoteStatus.UPCOMING && (
                          <span className="text-sm text-blue-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <TimerDisplay 
                              variant="compact"
                              status={getPollTimingStatus(poll).status}
                              urgency={getPollTimingStatus(poll).urgency}
                              startTime={poll.startTime}
                              endTime={poll.endTime}
                              showCountdown={true}
                              className="text-blue-600"
                            />
                          </span>
                        )}
                        {poll.status === VoteStatus.COMPLETED && (
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <TimerDisplay 
                              variant="compact"
                              status={getPollTimingStatus(poll).status}
                              urgency={getPollTimingStatus(poll).urgency}
                              startTime={poll.startTime}
                              endTime={poll.endTime}
                              showCountdown={false}
                              className="text-gray-500"
                            />
                          </span>
                        )}
                        {poll.createdBy && (
                          <span className="text-sm text-gray-500">
                            Created by {poll.createdBy.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Start Time</p>
                        <p className="text-gray-900">{formatDate(poll.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">End Time</p>
                        <p className="text-gray-900">{formatDate(poll.endTime)}</p>
                      </div>
                      {poll.resultDisplayTime && (
                        <div>
                          <p className="text-gray-600 font-medium">Results Display</p>
                          <p className="text-gray-900">{formatDate(poll.resultDisplayTime)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prominent Timer Display for Active Polls */}
                  {poll.status === VoteStatus.ACTIVE && (
                    <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch w-full">
                      {/* Info Card */}
                      <div className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center p-4 md:p-6 text-white">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center shadow-lg mr-4">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Poll Active</h3>
                          <p className="text-sm text-purple-100">Voting ends soon!</p>
                        </div>
                      </div>
                      {/* Timer Card */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full h-full">
                          <TimerDisplay 
                            variant="detailed"
                            status={getPollTimingStatus(poll).status}
                            urgency={getPollTimingStatus(poll).urgency}
                            startTime={poll.startTime}
                            endTime={poll.endTime}
                            showCountdown={true}
                            className="bg-transparent text-white font-bold h-full w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timer Display for Upcoming Polls */}
                  {poll.status === VoteStatus.UPCOMING && (
                    <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch w-full">
                      {/* Info Card */}
                      <div className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center p-4 md:p-6 text-white">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center shadow-lg mr-4">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Poll Starting Soon</h3>
                          <p className="text-sm text-orange-100">Get ready to vote!</p>
                        </div>
                      </div>
                      {/* Timer Card */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full h-full">
                          <TimerDisplay 
                            variant="detailed"
                            status={getPollTimingStatus(poll).status}
                            urgency={getPollTimingStatus(poll).urgency}
                            startTime={poll.startTime}
                            endTime={poll.endTime}
                            showCountdown={true}
                            className="bg-transparent text-white font-bold h-full w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {poll.options.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Options ({poll.options.length})</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {poll.options.map((option) => (
                          <div key={option.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3 mb-2">
                              {option.imageUrl && (
                                <img 
                                  src={option.imageUrl} 
                                  alt={option.name} 
                                  className="h-10 w-10 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{option.name}</p>
                                <p className="text-xs text-gray-600">{option.voteCount} votes</p>
                              </div>
                            </div>
                            {poll.totalVotes > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        ))}
                        {/* {poll.options.length > 4 && (
                          <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">+{poll.options.length - 4} more options</p>
                          </div>
                        )} */}
                      </div>
                    </div>
                  )}

                  {poll.options.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">⚠️ This poll has no options configured</p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditPoll(poll)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                  </div>

                  <div className="flex space-x-2">
                    {poll.status === VoteStatus.COMPLETED && !poll.isResultPublished && (
                      <button 
                        onClick={() => handlePublishResults(poll.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                        disabled={loading}
                      >
                        <Send className="h-4 w-4" />
                        <span>Publish Results</span>
                      </button>
                    )}
                    
                    {poll.status === VoteStatus.COMPLETED && poll.isResultPublished && (
                      <button 
                        onClick={() => handleNotifyUsers(poll.id)}
                        disabled={notifyingPollId === poll.id}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className={`h-4 w-4 ${notifyingPollId === poll.id ? 'animate-spin' : ''}`} />
                        <span>{notifyingPollId === poll.id ? 'Notifying...' : 'Notify Users'}</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeletePoll(poll.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                      disabled={deletingPollId === poll.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{deletingPollId === poll.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreatePollModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditPollModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPoll(null);
        }}
        onSuccess={handleEditSuccess}
        poll={editingPoll}
      />
    </>
  );
};

export default PollsTab;