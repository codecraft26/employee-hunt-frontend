// components/user/TreasureHuntStages.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Target,
  Users,
  Crown,
  ImageIcon,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Lock,
  Play,
  Award,
  X
} from 'lucide-react';
import { useTreasureHunt } from '../../hooks/useUserTreasureHunt';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useTeams } from '../../hooks/useTeams';
import { useTeamLeadership } from '../../hooks/useTeamLeadership';
import { useAuth } from '../../hooks/useAuth';
import { TeamMemberSubmission } from '../../types/teams';
import TimerDisplay from '../shared/TimerDisplay';

interface TreasureHuntStagesProps {
  hunt: any;
  teamId: string;
}

const TreasureHuntStages: React.FC<TreasureHuntStagesProps> = ({ hunt, teamId }) => {
  const { user } = useAuth();
  const {
    progress,
    submitting,
    progressLoading,
    error,
    submitStage,
    fetchProgress,
    getTimeRemaining,
    clearError,
    isStageUnlocked,
    getStageSubmission,
    getAllStagesWithStatus,
    getHuntTimingStatus
  } = useTreasureHunt();

  const {
    submitMemberClue,
    getMemberSubmissionsForReview,
    leaderSubmitToAdmin,
    getMySubmissions,
    loading: huntLoading
  } = useTreasureHunts();
  
  const { fetchMyTeam } = useTeams();
  const { 
    isLeader: isTeamLeader, 
    loading: leadershipLoading, 
    error: leadershipError,
    lastChecked,
    refresh: refreshLeadership,
    clearError: clearLeadershipError
  } = useTeamLeadership();

  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submittingMember, setSubmittingMember] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<TeamMemberSubmission[]>([]);
  const [memberSubmissions, setMemberSubmissions] = useState<TeamMemberSubmission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [leaderNotes, setLeaderNotes] = useState('');
  const [autoRefresh, setAutoRefresh] = useState<NodeJS.Timeout | null>(null);
  const [leaderSelectionError, setLeaderSelectionError] = useState<string | null>(null);

  // Check if hunt is accessible
  const canAccessHunt = hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS';

  // Get all stages with their status
  const stages = getAllStagesWithStatus();
  const currentStage = progress?.currentStage;

  // Check if all stages are completed
  const allStagesCompleted = progress && progress.completedStages === progress.totalStages && progress.totalStages > 0;
  
  // Check if this is the last stage and team has submitted
  const isLastStage = currentStage && progress && currentStage.stageNumber === progress.totalStages;
  const hasSubmittedToLastStage = isLastStage && stages.some(stage => 
    stage.stageNumber === progress.totalStages && stage.submission?.status === 'PENDING'
  );

  // Load my submissions for current stage
  const loadMySubmissions = async () => {
    if (!teamId || !currentStage?.id) return;
    try {
      const submissions = await getMySubmissions(teamId, currentStage.id, user?.id || '');
      setMySubmissions(submissions || []);
    } catch (error) {
      console.error('Failed to load my submissions:', error);
    }
  };

  // Load member submissions (for leaders)
  const loadMemberSubmissions = async () => {
    if (!teamId || !currentStage?.id) return;
    
    setRefreshing(true);
    try {
      const submissions = await getMemberSubmissionsForReview(teamId, currentStage.id);
      setMemberSubmissions(submissions || []);
    } catch (error) {
      console.error('Failed to load member submissions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      fetchProgress(hunt.id),
      loadMySubmissions(),
      isTeamLeader ? loadMemberSubmissions() : Promise.resolve()
    ]);
  };

  // Initialize data
  useEffect(() => {
    fetchProgress(hunt.id);
  }, [hunt.id, teamId]);

  useEffect(() => {
    if (currentStage) {
      loadMySubmissions();
      if (isTeamLeader) {
        loadMemberSubmissions();
      }
    }
  }, [currentStage, isTeamLeader]);

  // Auto-refresh progress every 30 seconds
  useEffect(() => {
    if (canAccessHunt && progress?.currentStage) {
      const interval = setInterval(() => {
        refreshAllData();
      }, 30000);
      setAutoRefresh(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [canAccessHunt, progress?.currentStage]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.zIndex = '9999';
      video.style.objectFit = 'cover';
      
      // Create camera overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '9998';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      
      // Create camera controls
      const controls = document.createElement('div');
      controls.style.position = 'fixed';
      controls.style.bottom = '50px';
      controls.style.left = '50%';
      controls.style.transform = 'translateX(-50%)';
      controls.style.zIndex = '10000';
      controls.style.display = 'flex';
      controls.style.gap = '20px';
      
      // Capture button
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📸';
      captureBtn.style.width = '80px';
      captureBtn.style.height = '80px';
      captureBtn.style.borderRadius = '50%';
      captureBtn.style.border = 'none';
      captureBtn.style.backgroundColor = 'white';
      captureBtn.style.fontSize = '32px';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      
      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '❌';
      cancelBtn.style.width = '60px';
      cancelBtn.style.height = '60px';
      cancelBtn.style.borderRadius = '50%';
      cancelBtn.style.border = 'none';
      cancelBtn.style.backgroundColor = 'red';
      cancelBtn.style.color = 'white';
      cancelBtn.style.fontSize = '24px';
      cancelBtn.style.cursor = 'pointer';
      
      // Add elements to page
      document.body.appendChild(overlay);
      document.body.appendChild(video);
      document.body.appendChild(controls);
      controls.appendChild(cancelBtn);
      controls.appendChild(captureBtn);
      
      // Handle capture
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
          }
        }, 'image/jpeg', 0.8);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);
        document.body.removeChild(video);
        document.body.removeChild(controls);
      };
      
      // Handle cancel
      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);
        document.body.removeChild(video);
        document.body.removeChild(controls);
      };
      
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check camera permissions and try again.');
    }
  };

  // Handle member submission
  const handleMemberSubmit = async () => {
    if (!selectedImage || !description.trim() || !teamId || !currentStage?.id) return;

    setSubmittingMember(true);
    try {
      await submitMemberClue(currentStage.id, {
        teamId: teamId,
        description: description.trim(),
        image: selectedImage
      });
      setSelectedImage(null);
      setImagePreview(null);
      setDescription('');
      await loadMySubmissions();
      
      // If user is a leader, also refresh the team submissions view
      if (isTeamLeader) {
        await loadMemberSubmissions();
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmittingMember(false);
    }
  };

  // Handle leader submission to admin
  const handleLeaderSubmit = async () => {
    if (selectedSubmissions.size === 0 || !teamId || !currentStage?.id) return;

    setSubmittingMember(true);
    setLeaderSelectionError(null);
    try {
      await leaderSubmitToAdmin(teamId, currentStage.id, {
        selectedSubmissionIds: Array.from(selectedSubmissions),
        leaderNotes: leaderNotes.trim()
      });
      
      setSelectedSubmissions(new Set());
      setLeaderNotes('');
      await loadMemberSubmissions();
    } catch (error) {
      console.error('Failed to submit to admin:', error);
    } finally {
      setSubmittingMember(false);
    }
  };

  // Toggle submission selection
  const toggleSubmissionSelection = (submissionId: string) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
      setLeaderSelectionError(null); // Clear error when deselecting
    } else {
      newSelected.add(submissionId);
      setLeaderSelectionError(null);
    }
    setSelectedSubmissions(newSelected);
  };

  // Helper functions for status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-3 w-3" />;
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      case 'REJECTED':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  if (progressLoading || huntLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading treasure hunt stages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-[0_0_24px_0_rgba(0,255,180,0.08)]">
      <div className="text-right flex justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hunt.status}
              </span>
              {hunt.winningTeam && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  <Trophy className="h-3 w-3 mr-1" />
                  Winner: {hunt.winningTeam.name}
                </span>
              )}
            </div>
            <TimerDisplay 
              {...getHuntTimingStatus(hunt)}
              variant="compact"
              startTime={hunt.startTime}
              endTime={hunt.endTime}
              showCountdown={true}
            />
          </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{hunt.title}</h2>
            <p className="text-slate-200">{hunt.description}</p>
          </div>
         
        </div>

        {/* Prominent Timer Display for Active Hunts */}
        {(hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS') && (
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch w-full">
            {/* Info Card */}
            <div className="flex-1 bg-slate-800 rounded-2xl flex items-center p-4 md:p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400/30 to-blue-500/20 flex items-center justify-center shadow-lg mr-4">
                <Clock className="h-6 w-6 text-green-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Time Remaining</h3>
                <p className="text-sm text-slate-300">Complete all stages before time runs out!</p>
              </div>
            </div>
            {/* Timer Card */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-full">
                <TimerDisplay 
                  variant="detailed"
                  status="active"
                  urgency="normal"
                  startTime={hunt.startTime}
                  endTime={hunt.endTime}
                  showCountdown={true}
                  className="bg-transparent text-green-200 font-bold h-full w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        {progress && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{progress.totalStages}</div>
              <div className="text-sm text-slate-300">Total Stages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{progress.completedStages}</div>
              <div className="text-sm text-slate-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{progress.pendingStages}</div>
              <div className="text-sm text-slate-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{progress.rejectedStages}</div>
              <div className="text-sm text-slate-300">Rejected</div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Completion Message */}
      {allStagesCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">🎉 All Stages Completed!</h3>
            <p className="text-green-700 mb-4">
              Congratulations! Your team has successfully completed all stages of the treasure hunt.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-green-800">
              <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Waiting for admin to review and declare results...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Stage Submission Message */}
      {hasSubmittedToLastStage && !allStagesCompleted && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Send className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">📤 Final Stage Submitted!</h3>
            <p className="text-blue-700 mb-4">
              Your team has submitted the final stage. All stages are now complete!
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-blue-800">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <Clock className="h-4 w-4" />
                <span>Waiting for admin approval and results...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {hunt.winningTeam && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">🏆 Results Announced!</h3>
            <p className="text-yellow-700 mb-4">
              The treasure hunt has concluded and the results are in!
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-yellow-800">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  Winner: {hunt.winningTeam.name}
                </span>
              </div>
              {hunt.winningTeam.id === teamId && (
                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  🎉 Congratulations! Your team won!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage Progression Timeline */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-[0_0_24px_0_rgba(0,255,180,0.08)]">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Stage Progression
        </h3>
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={refreshAllData}
            disabled={refreshing}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Progress'}</span>
          </button>
          
          {currentStage && (
            <div className="text-sm text-gray-600">
              Current Stage: <span className="font-medium text-blue-600">Stage {currentStage.stageNumber}</span>
            </div>
          )}
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => {
            const progressIndicator = stage.isUnlocked 
              ? stage.submission?.status === 'APPROVED'
                ? { icon: <Award className="h-4 w-4" />, color: 'text-green-600', bgColor: 'bg-green-100' }
                : stage.isCurrent
                ? { icon: <Play className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' }
                : { icon: <Target className="h-4 w-4" />, color: 'text-gray-600', bgColor: 'bg-gray-100' }
              : { icon: <Lock className="h-4 w-4" />, color: 'text-gray-400', bgColor: 'bg-gray-50' };

            return (
              <div
                key={stage.id}
                className={`bg-slate-800 rounded-2xl overflow-hidden shadow-[0_0_24px_0_rgba(0,255,180,0.08)] transition-all ${
                  stage.isCurrent ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${stage.submission?.status === 'APPROVED' ? 'ring-2 ring-green-500 shadow-lg' : ''}
                ${!stage.isUnlocked ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${progressIndicator.bgColor} ${progressIndicator.color}`}>
                        {progressIndicator.icon}
                        <span className="ml-1">Stage {stage.stageNumber}</span>
                      </span>
                      {stage.isCurrent && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                      {stage.submission?.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-white mb-2">{stage.description}</h3>

                  {/* Stage Status */}
                  {stage.submission && (
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stage.submission.status)}`}>
                        {getStatusIcon(stage.submission.status)}
                        <span className="ml-1">{stage.submission.status}</span>
                      </span>
                    </div>
                  )}

                  {/* Stage Progress Message */}
                  {stage.submission?.status === 'APPROVED' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {stage.stageNumber === progress?.totalStages 
                            ? 'Final stage completed! Waiting for results...' 
                            : 'Stage completed! Ready for next stage.'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {stage.isCurrent && stage.submission?.status !== 'APPROVED' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center text-blue-800">
                        <Play className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {stage.stageNumber === progress?.totalStages 
                            ? 'Final stage - Submit your photo!' 
                            : 'Current stage - Submit your photo!'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {stage.isCurrent && stage.isUnlocked && canAccessHunt && stage.submission?.status !== 'APPROVED' && (
                    <div className="space-y-3">
                      {/* Member Submission */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3">Submit Your Photo</h4>
                        
                        {imagePreview ? (
                          <div className="mb-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
                            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No image selected</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Photo Upload Options */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={handleCameraCapture}
                              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Camera className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium text-slate-200">Take Photo</span>
                            </button>
                            
                            <label className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <Upload className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-slate-200">Choose from Gallery</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your submission..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />

                          <button
                            onClick={handleMemberSubmit}
                            disabled={!selectedImage || !description.trim() || submittingMember}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Upload className="h-4 w-4" />
                            <span>{submittingMember ? 'Submitting...' : 'Submit Photo'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Leader Review Section */}
                      {isTeamLeader && (
                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium text-blue-200 mb-3 flex items-center">
                            <Crown className="h-4 w-4 mr-2" />
                            Team Leader Review
                          </h4>
                          
                          {/* Leader Selection Error */}
                          {leaderSelectionError && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-red-700">{leaderSelectionError}</p>
                              </div>
                              <button
                                onClick={() => setLeaderSelectionError(null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          
                          {memberSubmissions.length > 0 ? (
                            <div className="space-y-3">
                              {selectedSubmissions.size > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-800">
                                    📤 <strong>{selectedSubmissions.size} photo{selectedSubmissions.size !== 1 ? 's' : ''} selected</strong>
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Click "Submit to Admin" to send these photos for final review.
                                  </p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-2">
                                {memberSubmissions.map((submission) => (
                                  <div
                                    key={submission.id}
                                    className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                                      selectedSubmissions.has(submission.id)
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => toggleSubmissionSelection(submission.id)}
                                  >
                                    <img
                                      src={submission.imageUrl}
                                      alt="Submission"
                                      className="w-full h-20 object-cover rounded mb-2"
                                    />
                                    <p className="text-sm text-slate-200 line-clamp-2">
                                      {submission.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      By: {submission.submittedBy?.name}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <textarea
                                value={leaderNotes}
                                onChange={(e) => setLeaderNotes(e.target.value)}
                                placeholder="Add notes about the selected submissions..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />

                              <button
                                onClick={handleLeaderSubmit}
                                disabled={selectedSubmissions.size === 0 || submittingMember}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                              >
                                <Send className="h-4 w-4" />
                                <span>
                                  {submittingMember 
                                    ? 'Submitting...' 
                                    : selectedSubmissions.size > 0 
                                      ? `Submit ${selectedSubmissions.size} Photo${selectedSubmissions.size !== 1 ? 's' : ''} to Admin`
                                      : 'Submit to Admin'
                                  }
                                </span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-blue-700">
                              Waiting for team members to submit photos...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Stage */}
                  {stage.submission?.status === 'APPROVED' && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        {stage.stageNumber === progress?.totalStages 
                          ? 'Final Stage Completed!' 
                          : 'Stage Completed!'
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stage.stageNumber === progress?.totalStages 
                          ? 'Waiting for results...' 
                          : 'Ready for next stage'
                        }
                      </p>
                    </div>
                  )}

                  {/* Locked Stage */}
                  {!stage.isUnlocked && (
                    <div className="text-center py-4">
                      <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Complete previous stage to unlock</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Submissions */}
      {mySubmissions.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-[0_0_24px_0_rgba(0,255,180,0.08)]">
          <h3 className="text-lg font-semibold text-white-900 mb-4">My Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubmissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <img
                  src={submission.imageUrl}
                  alt="My submission"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-white-700 mb-2">{submission.description}</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">{submission.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasureHuntStages;