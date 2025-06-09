// components/polls/VotePollComponent.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, Calendar, BarChart3, Send, Timer, Award } from 'lucide-react';
import { Vote, VoteStatus, VoteType, VoteOption } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';

interface VotePollComponentProps {
  poll: Vote;
  onVoteSuccess?: (pollTitle?: string) => void;
  showResults?: boolean;
  userHasVoted?: boolean;
  userSelectedOptions?: string[];
}

const VotePollComponent: React.FC<VotePollComponentProps> = ({ 
  poll, 
  onVoteSuccess,
  showResults = false,
  userHasVoted = false,
  userSelectedOptions = []
}) => {
  const { castVote, getUserVoteStatus, loading, error, clearError } = useVotes();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userSelectedOptions || []);
  const [hasVoted, setHasVoted] = useState(userHasVoted || false);
  const [userVoteDetails, setUserVoteDetails] = useState<Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [alreadyVotedError, setAlreadyVotedError] = useState<string | null>(null);

  // Determine voting eligibility and result visibility
  const canVote = poll.status === VoteStatus.ACTIVE && !hasVoted;
  const shouldShowResults = showResults || poll.status === VoteStatus.COMPLETED || hasVoted || poll.isResultPublished;
  const isUpcoming = poll.status === VoteStatus.UPCOMING;

  // Fetch user's voting status when component mounts
  useEffect(() => {
    const fetchUserVoteStatus = async () => {
      if (poll.id) {
        try {
          const voteStatus = await getUserVoteStatus(poll.id);
          if (voteStatus) {
            setHasVoted(voteStatus.hasVoted);
            setSelectedOptions(voteStatus.selectedOptions);
            if (voteStatus.selectedOptionsDetails) {
              setUserVoteDetails(voteStatus.selectedOptionsDetails);
            }
          }
        } catch (err) {
          console.error('Failed to fetch user vote status:', err);
        }
      }
    };

    fetchUserVoteStatus();
  }, [poll.id, getUserVoteStatus]);

  useEffect(() => {
    // Clear any previous errors when poll changes
    clearError();
    setAlreadyVotedError(null);
  }, [poll.id, clearError]);

  // Check if user has already voted based on error message
  useEffect(() => {
    if (error && error.includes('already voted')) {
      setAlreadyVotedError(error);
      setHasVoted(true);
      clearError();
    }
  }, [error, clearError]);

  const handleOptionSelect = (optionId: string) => {
    if (!canVote) return;

    if (poll.type === VoteType.SINGLE_CHOICE) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        (prev || []).includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...(prev || []), optionId]
      );
    }
  };

  const handleSubmitVote = async () => {
    if (selectedOptions.length === 0 || !canVote) return;

    try {
      const success = await castVote({
        voteId: poll.id,
        optionIds: selectedOptions
      });
      
      if (success) {
        setHasVoted(true);
        setAlreadyVotedError(null);
        // Update user vote details with the newly selected options
        const newVoteDetails = poll.options.filter(option => 
          selectedOptions.includes(option.id)
        ).map(option => ({
          id: option.id,
          name: option.name,
          imageUrl: option.imageUrl
        }));
        setUserVoteDetails(newVoteDetails);
        onVoteSuccess?.(poll.title);
      } else {
        // Handle already voted case
        setAlreadyVotedError('You have already voted in this poll. Each user can only vote once.');
        setHasVoted(true);
      }
    } catch (err: any) {
      console.error('Failed to cast vote:', err);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(poll.endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Poll ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(poll.startTime);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Starts in ${minutes}m`;
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

  const getVotePercentage = (option: VoteOption) => {
    if (poll.totalVotes === 0) return 0;
    return (option.voteCount / poll.totalVotes) * 100;
  };

  const getStatusBadge = () => {
    switch (poll.status) {
      case VoteStatus.UPCOMING:
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Upcoming</span>;
      case VoteStatus.ACTIVE:
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Active</span>;
      case VoteStatus.COMPLETED:
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Completed</span>;
    }
  };

  // Get user's selected option names for display - prioritize userVoteDetails from API
  const getUserChoiceNames = () => {
    if (userVoteDetails.length > 0) {
      return userVoteDetails.map(detail => detail.name);
    }
    
    // Fallback to using userSelectedOptions prop
    if (userSelectedOptions.length === 0) return [];
    return poll.options
      .filter(option => userSelectedOptions.includes(option.id))
      .map(option => option.name);
  };

  // Get the most recent user choice (last option they selected)
  const getLastUserChoice = () => {
    if (userVoteDetails.length > 0) {
      // Return the last option (most recently created/selected)
      return userVoteDetails[userVoteDetails.length - 1];
    }
    return null;
  };

  const timeUntilStart = getTimeUntilStart();
  const userChoiceNames = getUserChoiceNames();
  const lastUserChoice = getLastUserChoice();

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{poll.title}</h2>
              {getStatusBadge()}
            </div>
            {poll.description && (
              <p className="text-gray-600 mb-3">{poll.description}</p>
            )}
            {poll.createdBy && (
              <p className="text-sm text-gray-500">Created by {poll.createdBy.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-600 flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{poll.type === VoteType.SINGLE_CHOICE ? 'Single Choice' : 'Multiple Choice'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{poll.totalVoters} participants</span>
          </div>
          {poll.status === VoteStatus.ACTIVE && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Clock className="h-4 w-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}
          {isUpcoming && timeUntilStart && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Timer className="h-4 w-4" />
              <span>{timeUntilStart}</span>
            </div>
          )}
        </div>

        {/* Poll Timeline - Collapsible */}
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isExpanded ? 'Hide' : 'Show'} poll timeline
          </button>
          {isExpanded && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
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
          )}
        </div>

        {/* Status Messages */}
        {isUpcoming && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Timer className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 text-sm font-medium">Poll not started yet</p>
                <p className="text-yellow-700 text-sm">
                  This poll will start on {formatDate(poll.startTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already Voted Message */}
        {(hasVoted || alreadyVotedError) && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-700 text-sm font-medium">Thank you for voting!</p>
                
                {/* Show last/most recent choice prominently */}
                {lastUserChoice && (
                  <div className="mt-2">
                    <p className="text-green-700 text-sm font-medium">Your latest choice:</p>
                    <div className="flex items-center space-x-2 mt-1 p-2 bg-green-100 border border-green-300 rounded-lg">
                      {lastUserChoice.imageUrl && (
                        <img
                          src={lastUserChoice.imageUrl}
                          alt={lastUserChoice.name}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">{lastUserChoice.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show all choices if multiple */}
                {userChoiceNames.length > 1 && (
                  <div className="mt-3">
                    <p className="text-green-700 text-sm">All your choices:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userChoiceNames.map((choiceName, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-medium rounded-full"
                        >
                          <Award className="h-3 w-3" />
                          <span>{choiceName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {alreadyVotedError && (
                  <p className="text-green-600 text-sm mt-1">Each user can only vote once per poll.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voting/Results Section */}
      <div className="p-6">
        {error && !alreadyVotedError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Show options only for ACTIVE and COMPLETED polls */}
        {!isUpcoming ? (
          <>
            {poll.options.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No options available for this poll</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    {canVote ? 'Make your choice:' : 'Poll Options:'}
                  </h3>
                  {canVote && (
                    <p className="text-sm text-gray-600">
                      {poll.type === VoteType.SINGLE_CHOICE ? 'Select one option' : 'Select multiple options'}
                    </p>
                  )}
                </div>

                {poll.options.map((option) => {
                  const isSelected = selectedOptions?.includes(option.id) || false;
                  const isUserChoice = selectedOptions?.includes(option.id) && hasVoted;
                  const percentage = getVotePercentage(option);
                  
                  return (
                    <div
                      key={option.id}
                      className={`relative border rounded-lg p-4 transition-all duration-200 ${
                        canVote 
                          ? 'cursor-pointer hover:border-indigo-300 hover:bg-indigo-50' 
                          : 'cursor-default'
                      } ${
                        isSelected && canVote
                          ? 'border-indigo-500 bg-indigo-50' 
                          : isUserChoice
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {option.imageUrl && (
                          <img
                            src={option.imageUrl}
                            alt={option.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{option.name}</p>
                              {isUserChoice && (
                                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <Award className="h-3 w-3" />
                                  <span>Your choice</span>
                                </span>
                              )}
                            </div>
                            {shouldShowResults && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{option.voteCount} votes</span>
                                <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                          
                          {shouldShowResults && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isUserChoice ? 'bg-green-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {canVote && (
                          <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                            poll.type === VoteType.SINGLE_CHOICE ? 'rounded-full' : 'rounded'
                          } ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className={`bg-white ${
                                poll.type === VoteType.SINGLE_CHOICE ? 'w-2 h-2 rounded-full' : 'w-2 h-2'
                              }`} />
                            )}
                          </div>
                        )}

                        {isUserChoice && !canVote && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vote Button - only show for active polls */}
            {canVote && poll.options.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmitVote}
                  disabled={!selectedOptions?.length || loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  <Send className="h-4 w-4" />
                  <span>
                    {loading ? 'Submitting...' : `Submit Vote${selectedOptions?.length > 1 ? 's' : ''}`}
                  </span>
                </button>
              </div>
            )}

            {/* Results Summary - only show for completed polls or when user has voted */}
            {shouldShowResults && poll.totalVotes > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Poll Results</span>
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: {poll.totalVotes} votes from {poll.totalVoters} participants
                  </div>
                </div>
              </div>
            )}

            {/* No Results Yet - only show for active/completed polls */}
            {shouldShowResults && poll.totalVotes === 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No votes yet. Be the first to vote!</p>
              </div>
            )}
          </>
        ) : (
          /* For UPCOMING polls - show placeholder content instead of options */
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Timer className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Poll Not Started Yet</h3>
              <p className="text-gray-600 mb-4">
                This poll will become available for voting when it starts.
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Starts: {formatDate(poll.startTime)}
                </span>
              </div>
            </div>

            {/* Show poll type and basic info for upcoming polls */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Poll Type:</span>
                  <span className="font-medium text-gray-900">
                    {poll.type === VoteType.SINGLE_CHOICE ? 'Single Choice' : 'Multiple Choice'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Options:</span>
                  <span className="font-medium text-gray-900">{poll.options.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotePollComponent;