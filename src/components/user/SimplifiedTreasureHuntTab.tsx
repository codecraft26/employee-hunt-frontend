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
  XCircle
} from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useTeams } from '../../hooks/useTeams';
import { useTeamLeadership } from '../../hooks/useTeamLeadership';
import { TeamMemberSubmission } from '../../types/teams';
import TimerDisplay from '../shared/TimerDisplay';

interface SimplifiedTreasureHuntTabProps {
  treasureHunt: any;
  team: any;
  user: any;
}

const SimplifiedTreasureHuntTab: React.FC<SimplifiedTreasureHuntTabProps> = ({ 
  treasureHunt: hunt, 
  team: myTeam, 
  user 
}) => {
  const {
    submitMemberClue,
    getMemberSubmissionsForReview,
    leaderSubmitToAdmin,
    getMySubmissions,
    loading
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
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<TeamMemberSubmission[]>([]);
  const [memberSubmissions, setMemberSubmissions] = useState<TeamMemberSubmission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [leaderNotes, setLeaderNotes] = useState('');

  // Check if all team submissions are complete (sent to admin)
  const allSubmissionsComplete = memberSubmissions.length > 0 && 
    memberSubmissions.every(sub => sub.status === 'SENT_TO_ADMIN' || sub.status === 'APPROVED_BY_LEADER' || sub.status === 'REJECTED_BY_LEADER');

  // Extract clue from hunt (simplified workflow has one clue)
  const clue = hunt?.clues?.[0] || { 
    id: `${hunt.id}-clue-1`, 
    description: hunt?.clueDescription || 'Complete the treasure hunt challenge!',
    stageNumber: 1
  };

  // Check if hunt is accessible
  const canAccessHunt = hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS';

  // Load my submissions
  const loadMySubmissions = async () => {
    if (!myTeam?.id || !clue?.id || !user?.id) return;
    try {
      const submissions = await getMySubmissions(myTeam.id, clue.id, user.id);
      setMySubmissions(submissions || []);
    } catch (error) {
      console.error('Failed to load my submissions:', error);
    }
  };

  // Load member submissions (for leaders)
  const loadMemberSubmissions = async () => {
    if (!myTeam?.id || !clue?.id) {
      return;
    }
    
    setRefreshing(true);
    try {
      const submissions = await getMemberSubmissionsForReview(myTeam.id, clue.id);
      setMemberSubmissions(submissions || []);
    } catch (error) {
      console.error('Failed to load member submissions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize data
  useEffect(() => {
    // Load my submissions for all users (including leaders)
    loadMySubmissions();
    
    // Load member submissions for leaders regardless of hunt status
    if (isTeamLeader) {
      loadMemberSubmissions();
    }
  }, [hunt.id, canAccessHunt, isTeamLeader]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle member submission
  const handleMemberSubmit = async () => {
    if (!selectedImage || !description.trim() || !myTeam?.id || !clue?.id) return;

    setSubmitting(true);
    try {
      await submitMemberClue(clue.id, {
        teamId: myTeam.id,
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
      setSubmitting(false);
    }
  };

  // Handle leader submission to admin
  const handleLeaderSubmit = async () => {
    if (selectedSubmissions.size === 0 || !myTeam?.id || !clue?.id) return;

    setSubmitting(true);
    try {
      await leaderSubmitToAdmin(myTeam.id, clue.id, {
        selectedSubmissionIds: Array.from(selectedSubmissions),
        leaderNotes: leaderNotes.trim() || undefined
      });
      setSelectedSubmissions(new Set());
      setLeaderNotes('');
      await loadMemberSubmissions();
    } catch (error) {
      console.error('Failed to submit to admin:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle submission selection
  const toggleSubmissionSelection = (submissionId: string) => {
    const newSelection = new Set(selectedSubmissions);
    if (newSelection.has(submissionId)) {
      newSelection.delete(submissionId);
    } else {
      newSelection.add(submissionId);
    }
    setSelectedSubmissions(newSelection);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED_BY_LEADER': return 'bg-blue-100 text-blue-800';
      case 'SENT_TO_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'APPROVED_BY_LEADER': return <Crown className="h-3 w-3" />;
      case 'SENT_TO_ADMIN': return <Send className="h-3 w-3" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />;
      case 'REJECTED': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };



  return (
    <div className="space-y-6">

      
      {/* Leadership Error Display */}
      {leadershipError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Leadership Check Error</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">{leadershipError}</p>
          <button
            onClick={() => {
              clearLeadershipError();
              refreshLeadership();
            }}
            className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            Retry Leadership Check
          </button>
        </div>
      )}
      
      {/* Hunt Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{hunt.title}</h2>
            <p className="text-green-100 mb-4">{hunt.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Single Clue Hunt
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Team: {myTeam?.name || 'Not assigned'}
              </span>
              {isTeamLeader && (
                <span className="flex items-center bg-yellow-500 bg-opacity-20 px-2 py-1 rounded">
                  <Crown className="h-4 w-4 mr-1" />
                  Team Leader
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <TimerDisplay 
              variant="card" 
              status={canAccessHunt ? 'active' : hunt.status === 'UPCOMING' ? 'upcoming' : 'ended'}
              timeText={canAccessHunt ? 'Active' : hunt.status === 'UPCOMING' ? 'Upcoming' : 'Ended'}
              urgency="normal"
              className="bg-white bg-opacity-20"
              startTime={hunt.startTime}
              endTime={hunt.endTime}
              showCountdown={true}
            />
          </div>
        </div>

        {!canAccessHunt && (
          <div className="bg-red-50 bg-opacity-20 border border-red-200 border-opacity-30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-100">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {hunt.status === 'UPCOMING' 
                  ? 'This hunt has not started yet.'
                  : 'This hunt has ended.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Winner Announcement */}
      {hunt.winningTeam && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 bg-opacity-30 p-3 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">🏆 Winner Announced!</h3>
                <p className="text-yellow-100">
                  Congratulations to <span className="font-semibold">{hunt.winningTeam.name}</span> for winning this treasure hunt!
                </p>
                {hunt.winningTeam.description && (
                  <p className="text-yellow-100 text-sm mt-1">{hunt.winningTeam.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-yellow-500 bg-opacity-30 px-4 py-2 rounded-lg">
                <div className="text-sm text-yellow-100">Winner</div>
                <div className="text-lg font-bold">{hunt.winningTeam.name}</div>
              </div>
            </div>
          </div>
          
          {/* Show if current user's team won */}
          {myTeam?.id === hunt.winningTeam.id && (
            <div className="mt-4 bg-yellow-500 bg-opacity-30 border border-yellow-300 border-opacity-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-200" />
                <span className="font-semibold text-yellow-200">🎉 Your team won!</span>
              </div>
              <p className="text-yellow-100 text-sm mt-1">
                Great job! Your team's submissions were selected as the best for this treasure hunt.
              </p>
            </div>
          )}
          
          {/* Show if current user's team didn't win */}
          {myTeam?.id && myTeam.id !== hunt.winningTeam.id && (
            <div className="mt-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Thanks for participating!</span>
              </div>
              <p className="text-yellow-100 text-sm mt-1">
                Your team did great! Keep participating in future treasure hunts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hunt Completed - Waiting for Results */}
      {hunt.status === 'COMPLETED' && !hunt.winningTeam && (
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500 bg-opacity-30 p-3 rounded-full">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">⏳ Results Pending</h3>
                <p className="text-purple-100">
                  The treasure hunt has ended and all submissions are being reviewed.
                </p>
                <p className="text-purple-100 text-sm mt-1">
                  The winner will be announced soon!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-purple-500 bg-opacity-30 px-4 py-2 rounded-lg">
                <div className="text-sm text-purple-100">Status</div>
                <div className="text-lg font-bold">Reviewing</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                // Trigger a refresh of hunt data
                window.location.reload();
              }}
              className="bg-purple-500 bg-opacity-30 hover:bg-purple-500 bg-opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Check for Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* All Submissions Complete - Waiting for Admin Review */}
      {allSubmissionsComplete && hunt.status !== 'COMPLETED' && !hunt.winningTeam && (
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 bg-opacity-30 p-3 rounded-full">
                <Send className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">📤 All Submissions Sent!</h3>
                <p className="text-blue-100">
                  Your team has completed all submissions and sent them to the admin for review.
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Waiting for admin approval and winner announcement.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-500 bg-opacity-30 px-4 py-2 rounded-lg">
                <div className="text-sm text-blue-100">Status</div>
                <div className="text-lg font-bold">Submitted</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clue Description */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Mission</h3>
            <p className="text-sm text-gray-500">What you need to find and photograph</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 font-medium">{clue.description}</p>
        </div>
      </div>

      {canAccessHunt && (
        <div className="space-y-6">
          {/* Member Submission Section - Available to all team members including leaders */}
          {(
            <div className="space-y-6">
                              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Submit Your Photo {isTeamLeader && <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium flex items-center"><Crown className="h-3 w-3 mr-1" />Leader</span>}
                </h3>
              
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center relative ${!canAccessHunt ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}>
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto max-h-64 rounded-lg border"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            disabled={!canAccessHunt}
                            className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          {!canAccessHunt ? (
                            <>
                              <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-400 mb-2">Hunt {hunt.status === 'UPCOMING' ? 'not started' : 'has ended'}</p>
                              <p className="text-sm text-gray-300">Image upload disabled</p>
                            </>
                          ) : (
                            <>
                              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-2">Click to upload an image</p>
                              <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={!canAccessHunt}
                        className={`absolute inset-0 w-full h-full opacity-0 ${canAccessHunt ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={canAccessHunt ? "Describe what you found and how it relates to the clue..." : "Hunt is closed - submissions disabled"}
                      rows={3}
                      disabled={!canAccessHunt}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    onClick={handleMemberSubmit}
                    disabled={!selectedImage || !description.trim() || submitting || !canAccessHunt}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : !canAccessHunt ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Hunt {hunt.status === 'UPCOMING' ? 'Not Started' : 'Closed'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Submit Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* My Submissions Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    My Submissions ({mySubmissions.length})
                  </h3>
                  <button
                    onClick={loadMySubmissions}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                {mySubmissions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h4>
                    <p className="text-gray-500">Upload your first photo above to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mySubmissions.map((submission, index) => (
                        <div
                          key={submission.id}
                          className="border rounded-lg p-4 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span className="ml-1">{submission.status}</span>
                            </span>
                            <span className="text-xs text-gray-400">
                              #{index + 1}
                            </span>
                          </div>
                          
                          {submission.imageUrl && (
                            <img
                              src={submission.imageUrl}
                              alt={`My submission ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border mb-3"
                            />
                          )}
                          
                          <p className="text-sm text-gray-600 mb-2">{submission.description}</p>
                          
                          {/* Status Messages */}
                          {submission.status === 'PENDING' && (
                            <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              ⏳ Waiting for team leader review
                            </div>
                          )}
                          {submission.status === 'APPROVED_BY_LEADER' && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              👑 Selected by team leader
                            </div>
                          )}
                          {submission.status === 'SENT_TO_ADMIN' && (
                            <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                              📤 Sent to admin for final review
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> You can submit multiple photos! {isTeamLeader ? 'As a team leader, you can submit your own photos AND review all team submissions to select the best ones for admin approval.' : 'Your team leader will review all submissions and select the best ones to send to the admin.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Separator for Leaders */}
      {isTeamLeader && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Team Leader Functions</span>
            </div>
          </div>
        </div>
      )}

      {/* Leader Review Section - Available regardless of hunt status */}
      {isTeamLeader && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Review All Team Submissions ({memberSubmissions.length})
              <span className="ml-2 text-sm text-gray-500 font-normal">(Including your own)</span>
            </h3>
            <button
              onClick={loadMemberSubmissions}
              disabled={refreshing}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {!canAccessHunt && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Hunt {hunt.status === 'UPCOMING' ? 'Not Started' : 'Ended'}</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {hunt.status === 'UPCOMING' 
                  ? 'You can still review team submissions even before the hunt starts.'
                  : 'The hunt has ended, but you can still review and manage team submissions.'}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Leader Instructions:</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Review all team member submissions below. Select the best photos by checking the boxes, then send your selection to the admin for final approval.
            </p>
          </div>

          {memberSubmissions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h4>
              <p className="text-gray-500">Team members haven't submitted any photos yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submissions grouped by member */}
              {Object.entries(
                memberSubmissions.reduce((acc, submission) => {
                  const memberName = submission.submittedBy?.name || 'Unknown';
                  if (!acc[memberName]) acc[memberName] = [];
                  acc[memberName].push(submission);
                  return acc;
                }, {} as Record<string, any[]>)
              ).map(([memberName, memberSubmissions]) => (
                <div key={memberName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{memberName}</h4>
                    <span className="text-sm text-gray-500">({memberSubmissions.length} submission{memberSubmissions.length !== 1 ? 's' : ''})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className={`border rounded-lg p-3 transition-all bg-white ${
                          selectedSubmissions.has(submission.id)
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.has(submission.id)}
                            onChange={() => toggleSubmissionSelection(submission.id)}
                            disabled={!canAccessHunt}
                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{submission.status}</span>
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(submission.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{submission.description}</p>
                            {submission.imageUrl && (
                              <img
                                src={submission.imageUrl}
                                alt="Submission"
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selection Summary and Send */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Selection Summary
                  </h4>
                  {selectedSubmissions.size > 0 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSubmissions.size} photo{selectedSubmissions.size !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                {selectedSubmissions.size === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Send className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Select photos above to send them to the admin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        📤 <strong>Ready to send {selectedSubmissions.size} photo{selectedSubmissions.size !== 1 ? 's' : ''} to admin</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Once sent, the admin will review and approve/reject your team's submission.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leader Notes (Optional)
                      </label>
                      <textarea
                        value={leaderNotes}
                        onChange={(e) => setLeaderNotes(e.target.value)}
                        placeholder={canAccessHunt ? "Explain why you selected these photos (e.g., 'Selected for clarity and team representation')" : "Hunt is closed - leader submission disabled"}
                        rows={3}
                        disabled={!canAccessHunt}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      onClick={handleLeaderSubmit}
                      disabled={submitting || !canAccessHunt}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending to Admin...</span>
                        </>
                      ) : !canAccessHunt ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Hunt {hunt.status === 'UPCOMING' ? 'Not Started' : 'Closed'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send {selectedSubmissions.size} Photo{selectedSubmissions.size !== 1 ? 's' : ''} to Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimplifiedTreasureHuntTab; 