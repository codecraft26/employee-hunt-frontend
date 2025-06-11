// components/user/UserTreasureHuntTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTreasureHunt } from '../../hooks/useUserTreasureHunt';
import { useTeams } from '../../hooks/useTeams';
import { 
  MapPin, 
  Clock, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Target,
  ImageIcon,
  Send,
  RefreshCw,
  Flag,
  Lock,
  Unlock,
  Eye,
  Calendar
} from 'lucide-react';

export default function UserTreasureHuntTab() {
  const {
    loading,
    error,
    assignedHunts,
    selectedHunt,
    progress,
    submitting,
    progressLoading,
    fetchAssignedHunts,
    fetchProgress,
    submitStage,
    selectHunt,
    refresh,
    clearError,
    startPolling,
    stopPolling,
    getHuntStats,
    canSubmit,
    getCurrentStageStatus,
    getStageSubmission,
    isStageUnlocked,
    getAllStagesWithStatus,
    getTimeRemaining,
  } = useTreasureHunt();

  const { myTeam, fetchMyTeam } = useTeams();

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<{
    isOpen: boolean;
    submission: any;
  }>({
    isOpen: false,
    submission: null
  });

  // Initialize component and fetch team data
  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 Initializing UserTreasureHuntTab...');
      try {
        if (!myTeam) {
          console.log('📋 Fetching team data...');
          await fetchMyTeam();
        }
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setInitialized(true); // Set to true anyway to prevent infinite loading
      }
    };

    if (!initialized) {
      initialize();
    }

    // Cleanup polling on unmount
    return () => {
      stopPolling();
    };
  }, [myTeam, fetchMyTeam, initialized, stopPolling]);

  // Fetch treasure hunts when team is available
  useEffect(() => {
    if (initialized && myTeam?.id) {
      console.log('🎯 Team available, fetching treasure hunts:', {
        teamId: myTeam.id,
        teamName: myTeam.name
      });
      
      fetchAssignedHunts(myTeam.id).then(hunts => {
        console.log('📦 Treasure hunts received:', hunts.length);
        if (hunts && hunts.length > 0) {
          console.log('🎮 First hunt details:', {
            id: hunts[0].id,
            title: hunts[0].title,
            status: hunts[0].status
          });
        }
      }).catch(error => {
        console.error('Failed to fetch treasure hunts:', error);
      });
    }
  }, [initialized, myTeam?.id, fetchAssignedHunts]);

  // Start polling when there are pending submissions
  useEffect(() => {
    const pendingStages = progress?.pendingStages ?? 0;
    if (selectedHunt && pendingStages > 0) {
      console.log('🔄 Starting polling for pending submissions:', {
        huntId: selectedHunt.id,
        pendingStages
      });
      startPolling(selectedHunt.id);
    } else {
      console.log('⏹️ Stopping polling - no pending submissions');
      stopPolling();
    }
    
    return () => stopPolling();
  }, [selectedHunt?.id, progress?.pendingStages, startPolling, stopPolling]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    
    if (!myTeam?.id) {
      console.log('⚠️ No team available for refresh, fetching team first...');
      try {
        await fetchMyTeam();
      } catch (error) {
        console.error('Failed to fetch team:', error);
        return;
      }
    }

    if (myTeam?.id) {
      console.log('🔄 Refreshing with team ID:', myTeam.id);
      await refresh(myTeam.id);
    }
  }, [myTeam?.id, refresh, fetchMyTeam]);

  // Handle stage submission
  const handleSubmitStage = useCallback(async () => {
    if (!submissionUrl.trim() || !selectedHunt || !progress?.currentStage) {
      console.log('⚠️ Missing required data for submission:', {
        hasUrl: !!submissionUrl.trim(),
        hasHunt: !!selectedHunt,
        hasStage: !!progress?.currentStage,
        teamId: myTeam?.id
      });
      return;
    }

    console.log('📤 Submitting stage:', {
      huntId: selectedHunt.id,
      stageId: progress.currentStage.id,
      teamId: myTeam?.id,
      imageUrl: submissionUrl.trim()
    });

    const success = await submitStage(
      selectedHunt.id,
      progress.currentStage.id,
      submissionUrl.trim(),
      myTeam?.id
    );

    if (success) {
      setSubmissionUrl('');
      console.log('✅ Submission successful, URL cleared');
    }
  }, [submissionUrl, selectedHunt, progress?.currentStage, myTeam?.id, submitStage]);

  // Handle hunt selection
  const handleHuntSelect = useCallback(async (hunt: any) => {
    console.log('🎯 Selecting hunt:', hunt.title);
    await selectHunt(hunt);
  }, [selectHunt]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': 
      case 'ACTIVE': 
        return 'bg-green-100 text-green-800';
      case 'UPCOMING': 
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': 
        return 'bg-gray-100 text-gray-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get submission status badge
  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const huntStats = getHuntStats();
  const currentStageStatus = getCurrentStageStatus();
  const submissionAllowed = canSubmit();
  const allStages = getAllStagesWithStatus();

  // Show loading state while initializing
  if (!initialized || (loading && assignedHunts.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading treasure hunts...</span>
      </div>
    );
  }

  // Show no team message if team is not available
  if (!myTeam) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Found</h3>
        <p className="text-gray-600 mb-4">You need to be part of a team to participate in treasure hunts.</p>
        <button
          onClick={fetchMyTeam}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // Show no hunts message if no treasure hunts are assigned
  if (assignedHunts.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Treasure Hunts Available</h3>
        <p className="text-gray-600 mb-2">You don't have any treasure hunts assigned to your team yet.</p>
        <p className="text-sm text-gray-500 mb-4">Team: {myTeam.name}</p>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Treasure Hunt</h2>
          <p className="text-gray-600">Complete stages to find the treasure!</p>
          {myTeam && (
            <p className="text-sm text-gray-500 mt-1">Team: {myTeam.name}</p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Hunt Selection */}
      {assignedHunts.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Treasure Hunts</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {assignedHunts.map((hunt) => (
              <div
                key={hunt.id}
                onClick={() => handleHuntSelect(hunt)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedHunt?.id === hunt.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{hunt.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hunt.status)}`}>
                    {hunt.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{hunt.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {hunt.status === 'IN_PROGRESS' || hunt.status === 'ACTIVE' 
                      ? getTimeRemaining(hunt.endTime) 
                      : formatDate(hunt.startTime)
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(hunt.startTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Hunt Details */}
      {selectedHunt && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedHunt.title}</h3>
              <p className="text-gray-600 mt-1">{selectedHunt.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedHunt.status)}`}>
                {selectedHunt.status}
              </span>
              {(selectedHunt.status === 'IN_PROGRESS' || selectedHunt.status === 'ACTIVE') && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTimeRemaining(selectedHunt.endTime)}
                </span>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          {huntStats && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">
                  {huntStats.completedStages} of {huntStats.totalStages} stages completed ({huntStats.completionPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${huntStats.completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {huntStats.completedStages} completed
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  {huntStats.pendingStages} pending
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  {huntStats.rejectedStages} rejected
                </span>
              </div>
            </div>
          )}

          {progressLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading progress...</span>
            </div>
          ) : progress ? (
            <>
              {/* Current Stage */}
              {progress.currentStage ? (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold">
                        {progress.currentStage.stageNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Stage {progress.currentStage.stageNumber}
                        </h4>
                        <p className="text-indigo-800 mb-4 text-lg">{progress.currentStage.description}</p>

                        {/* Current Stage Status */}
                        {currentStageStatus?.status === 'PENDING' ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-800 mb-2">
                              <AlertCircle className="h-5 w-5" />
                              <span className="font-medium">Submission Under Review</span>
                            </div>
                            <p className="text-yellow-700 text-sm mb-2">
                              Your submission is being reviewed by the admin. You'll be notified once it's approved or rejected.
                            </p>
                            {currentStageStatus.imageUrl && (
                              <div className="text-xs text-yellow-600">
                                Submitted: <a href={currentStageStatus.imageUrl} target="_blank" rel="noopener noreferrer" className="underline">View Image</a>
                              </div>
                            )}
                            {currentStageStatus.adminFeedback && (
                              <div className="bg-white rounded-md p-3 border border-yellow-200 mt-2">
                                <p className="text-sm font-medium text-yellow-800 mb-1">Admin Feedback:</p>
                                <p className="text-sm text-yellow-700">{currentStageStatus.adminFeedback}</p>
                              </div>
                            )}
                          </div>
                        ) : currentStageStatus?.status === 'REJECTED' ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 text-red-800 mb-2">
                              <XCircle className="h-5 w-5" />
                              <span className="font-medium">Submission Rejected</span>
                            </div>
                            {currentStageStatus.adminFeedback && (
                              <div className="bg-white rounded-md p-3 border border-red-200 mt-2">
                                <p className="text-sm font-medium text-red-800 mb-1">Admin Feedback:</p>
                                <p className="text-sm text-red-700">{currentStageStatus.adminFeedback}</p>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Submission Form */}
                        {submissionAllowed && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-indigo-900 mb-2">
                                Submit Your Evidence
                              </label>
                              <p className="text-sm text-indigo-700 mb-3">
                                Take a photo of the location and upload it, then paste the image URL here.
                              </p>
                              <div className="flex gap-2">
                                <div className="flex-1 relative">
                                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <input
                                    type="url"
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                    placeholder="https://example.com/your-image.jpg"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={submitting}
                                  />
                                </div>
                                <button
                                  onClick={handleSubmitStage}
                                  disabled={!submissionUrl.trim() || submitting}
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4" />
                                      Submit
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!submissionAllowed && !currentStageStatus && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-600 text-sm">
                              Please wait for your previous submission to be reviewed before submitting again.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Stages Completed */
                <div className="text-center py-12">
                  <div className="relative">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                    <div className="absolute -top-2 -right-2 bg-yellow-100 rounded-full p-2">
                      <Flag className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Quest Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    Congratulations! You have successfully completed all stages of this treasure hunt.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                    <p className="text-green-800 font-medium">
                      🎉 {huntStats?.completedStages} out of {huntStats?.totalStages} stages completed!
                    </p>
                  </div>
                </div>
              )}

              {/* All Stages Overview */}
              {allStages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    All Stages Overview
                  </h4>
                  <div className="space-y-3">
                    {allStages.map((stage) => {
                      const submission = stage.submission;
                      
                      return (
                        <div
                          key={stage.stageNumber}
                          className={`border rounded-lg p-4 transition-all ${
                            stage.isCurrent
                              ? 'border-indigo-300 bg-indigo-50'
                              : stage.isUnlocked
                              ? 'border-gray-300 bg-white'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold ${
                                stage.isCurrent
                                  ? 'bg-indigo-600 text-white'
                                  : stage.isUnlocked
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-200 text-gray-500'
                              }`}>
                                {stage.isUnlocked ? (
                                  submission?.status === 'APPROVED' ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    stage.stageNumber
                                  )
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  Stage {stage.stageNumber}
                                  {stage.isCurrent && <span className="text-indigo-600 ml-2">(Current)</span>}
                                </h5>
                                {stage.description && (
                                  <p className="text-sm text-gray-600">{stage.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {submission && getSubmissionStatusBadge(submission.status)}
                              {submission && (
                                <button
                                  onClick={() => setSelectedSubmissionModal({ 
                                    isOpen: true, 
                                    submission 
                                  })}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              {!stage.isUnlocked && (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submission History */}
              {progress.submissions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Submissions
                  </h4>
                  <div className="space-y-3">
                    {progress.submissions
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((submission) => (
                        <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                                {submission.clue.stageNumber}
                              </div>
                              <span className="font-medium text-gray-700">
                                Stage {submission.clue.stageNumber}
                              </span>
                              {getSubmissionStatusBadge(submission.status)}
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {formatDate(submission.createdAt)}
                              </span>
                              <button
                                onClick={() => setSelectedSubmissionModal({ 
                                  isOpen: true, 
                                  submission 
                                })}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {submission.adminFeedback && (
                            <div className="bg-white rounded-md p-3 border border-gray-200 mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Admin Feedback:</p>
                              <p className="text-sm text-gray-600">{submission.adminFeedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No Progress Data */
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
              <p className="text-gray-600 mb-4">Unable to load progress for this treasure hunt.</p>
              <button
                onClick={() => fetchProgress(selectedHunt.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">Something went wrong</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator for pending submissions */}
      {selectedHunt && progress && progress.pendingStages > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Auto-refreshing for updates...</span>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            Checking for approval status every 10 seconds
          </p>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmissionModal.isOpen && selectedSubmissionModal.submission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission Details - Stage {selectedSubmissionModal.submission.clue.stageNumber}
                </h3>
                <button
                  onClick={() => setSelectedSubmissionModal({ isOpen: false, submission: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
                  {getSubmissionStatusBadge(selectedSubmissionModal.submission.status)}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Clue Description:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedSubmissionModal.submission.clue.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Image:</p>
                  <img
                    src={selectedSubmissionModal.submission.imageUrl}
                    alt="Submission"
                    className="max-w-full h-64 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.className = 'hidden';
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Submitted:</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedSubmissionModal.submission.createdAt)}
                  </p>
                </div>

                {selectedSubmissionModal.submission.adminFeedback && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Admin Feedback:</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{selectedSubmissionModal.submission.adminFeedback}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSubmissionModal({ isOpen: false, submission: null })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
          <h5 className="font-semibold mb-2">Debug Info:</h5>
          <div className="space-y-1 text-gray-600">
            <div>Team ID: {myTeam?.id || 'Not available'}</div>
            <div>Team Name: {myTeam?.name || 'Not available'}</div>
            <div>Assigned Hunts: {assignedHunts.length}</div>
            <div>Selected Hunt: {selectedHunt?.id || 'None'}</div>
            <div>Has Progress: {progress ? 'Yes' : 'No'}</div>
            <div>Current Stage: {progress?.currentStage?.id || 'None'}</div>
            <div>Pending Stages: {progress?.pendingStages || 0}</div>
            <div>Total Stages: {progress?.totalStages || 0}</div>
            <div>Completed Stages: {progress?.completedStages || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}