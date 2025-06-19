// components/polls/VotePollComponent.tsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Calendar, 
  Send, 
  BarChart3, 
  Timer, 
  ChevronDown, 
  ChevronUp,
  UserCheck,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Vote, VoteStatus, VoteType, VotingOptionType } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import { useAuth } from '../../hooks/useAuth';

interface VotePollComponentProps {
  poll: Vote;
  onVoteSuccess?: (pollTitle: string) => void;
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
  const { user } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userSelectedOptions || []);
  const [hasVoted, setHasVoted] = useState(userHasVoted || false);
  const [userVoteDetails, setUserVoteDetails] = useState<Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [alreadyVotedError, setAlreadyVotedError] = useState<string | null>(null);
  const [showFullResults, setShowFullResults] = useState(false);

  // Determine voting eligibility and result visibility
  const canVote = poll.status === VoteStatus.ACTIVE && !hasVoted;
  const isAdmin = user?.role === 'admin';
  const isUpcoming = poll.status === VoteStatus.UPCOMING;
  
  // Determine what results to show:
  // - Admins: Always see full results when available
  // - Users who voted: See only their vote unless they toggle to see full results
  // - Users who haven't voted: No results shown during active poll
  // - Published results: Everyone can see full results
  const shouldShowResults = showResults || poll.status === VoteStatus.COMPLETED || poll.isResultPublished;
  const shouldShowFullResults = isAdmin || showFullResults || poll.isResultPublished || poll.status === VoteStatus.COMPLETED;
  const shouldShowUserVoteOnly = hasVoted && !shouldShowFullResults;

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
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  const timeUntilStart = getTimeUntilStart();

  const getStatusBadge = () => {
    switch (poll.status) {
      case VoteStatus.UPCOMING:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Upcoming</span>;
      case VoteStatus.ACTIVE:
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>;
      case VoteStatus.COMPLETED:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  const renderOption = (option: any) => {
    const isSelected = selectedOptions?.includes(option.id);
    const isUserSelection = userVoteDetails.some(detail => detail.id === option.id);
    const votePercentage = poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0;
    
    // For user-only view, only show options they voted for
    if (shouldShowUserVoteOnly && !isUserSelection) {
      return null;
    }
    
    return (
      <div
        key={option.id}
        className={`border rounded-lg p-4 transition-all ${
          canVote ? 'cursor-pointer' : ''
        } ${
          canVote
            ? isSelected
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            : shouldShowUserVoteOnly && isUserSelection
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200'
        }`}
        onClick={() => canVote && handleOptionSelect(option.id)}
      >
        <div className="flex items-center space-x-3">
          {/* Checkbox/Radio for voting */}
          {canVote && (
            <div className="flex-shrink-0">
              {poll.type === VoteType.SINGLE_CHOICE ? (
                <div className={`w-4 h-4 rounded-full border-2 ${
                  isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </div>
              ) : (
                <div className={`w-4 h-4 rounded border-2 ${
                  isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Option Image */}
          {option.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={option.imageUrl}
                alt={option.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
          )}
          
          {/* User-specific option with profile image */}
          {(poll.votingOptionType === VotingOptionType.USER_SPECIFIC || poll.votingOptionType === VotingOptionType.CATEGORY_USER_BASED) && option.targetUser && (
            <div className="flex-shrink-0">
              {option.targetUser.profileImage ? (
                <img
                  src={option.targetUser.profileImage}
                  alt={option.targetUser.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          )}
          
          {/* Option Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{option.name}</h4>
                {(poll.votingOptionType === VotingOptionType.USER_SPECIFIC || poll.votingOptionType === VotingOptionType.CATEGORY_USER_BASED) && option.targetUser && (
                  <div className="text-sm text-gray-500 mt-1">
                    <span>{option.targetUser.email}</span>
                    {option.targetUser.employeeCode && (
                      <span> • {option.targetUser.employeeCode}</span>
                    )}
                    {option.targetUser.department && (
                      <span> • {option.targetUser.department}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Vote Count and Percentage - only show in full results mode */}
              {shouldShowResults && shouldShowFullResults && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {option.voteCount} votes
                  </div>
                  <div className="text-xs text-gray-500">
                    {votePercentage.toFixed(1)}%
                  </div>
                </div>
              )}
              
              {/* User Selection Indicator */}
              {shouldShowUserVoteOnly && isUserSelection && (
                <div className="text-right">
                  <div className="text-sm font-medium text-green-700">
                    ✓ Your Choice
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Bar - only show in full results mode */}
            {shouldShowResults && shouldShowFullResults && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votePercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            {poll.votingOptionType === VotingOptionType.USER_SPECIFIC ? (
              <>
                <UserCheck className="h-4 w-4" />
                <span>User-Specific Poll</span>
              </>
            ) : poll.votingOptionType === VotingOptionType.CATEGORY_USER_BASED ? (
              <>
                <Building2 className="h-4 w-4" />
                <span>Category-User Poll</span>
              </>
            ) : poll.votingOptionType === VotingOptionType.CATEGORY_BASED ? (
              <>
                <Building2 className="h-4 w-4" />
                <span>Legacy Category Poll</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>Custom Options Poll</span>
              </>
            )}
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
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>Poll Timeline</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {isExpanded && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Starts:</span>
                <span className="font-medium">{new Date(poll.startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ends:</span>
                <span className="font-medium">{new Date(poll.endTime).toLocaleString()}</span>
              </div>
              {poll.resultDisplayTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Results Display:</span>
                  <span className="font-medium">{new Date(poll.resultDisplayTime).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Poll Content */}
      <div className="p-6">
        {/* Error Messages */}
        {(error || alreadyVotedError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{alreadyVotedError || error}</p>
          </div>
        )}

        {/* Already Voted Message */}
        {hasVoted && !alreadyVotedError && userVoteDetails.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">✓ You have already voted in this poll</p>
                <p className="text-green-600 text-xs mt-1">
                  Your selection: {userVoteDetails.map(detail => detail.name).join(', ')}
                </p>
              </div>
              {/* Toggle for full results view - only for users, not admins */}
              {!isAdmin && shouldShowResults && (
                <button
                  onClick={() => setShowFullResults(!showFullResults)}
                  className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1"
                  title={showFullResults ? "Show only your vote" : "Show all results"}
                >
                  {showFullResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showFullResults ? "Hide Results" : "Show Results"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Poll Message */}
        {isUpcoming && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              🕒 This poll hasn't started yet. {timeUntilStart}
            </p>
          </div>
        )}

        {/* Poll Options */}
        {(canVote || shouldShowResults) && poll.options && poll.options.length > 0 ? (
          <>
            <div className="space-y-3">
              {poll.options.map(renderOption).filter(Boolean)}
            </div>

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

            {/* Results Summary - only show in full results mode */}
            {shouldShowResults && shouldShowFullResults && poll.totalVotes > 0 && (
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
            
            {/* User Vote Summary - show when user has voted and viewing their vote only */}
            {shouldShowUserVoteOnly && userVoteDetails.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-green-800 flex items-center space-x-2">
                    <UserCheck className="h-5 w-5" />
                    <span>Your Vote</span>
                  </h3>
                  <div className="text-sm text-green-600">
                    {userVoteDetails.length} option{userVoteDetails.length > 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>
            )}

            {/* No Results Yet - only show for active/completed polls */}
            {shouldShowResults && shouldShowFullResults && poll.totalVotes === 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No votes yet. Be the first to vote!</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {poll.options?.length === 0 ? (
                <p>No voting options available for this poll.</p>
              ) : (
                <p>Poll content is not available at the moment.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotePollComponent;