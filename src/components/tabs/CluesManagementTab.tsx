// components/tabs/CluesManagementTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileImage,
  Plus,
  Save,
  X,
  AlertCircle,
  Trophy,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';

interface CluesManagementTabProps {
  treasureHuntId: string | null;
  onBack: () => void;
}

const CluesManagementTab: React.FC<CluesManagementTabProps> = ({ 
  treasureHuntId, 
  onBack 
}) => {
  const { 
    currentTreasureHuntWithClues,
    loading,
    error,
    fetchTreasureHuntWithClues,
    updateClue,
    approveSubmission,
    rejectSubmission,
    clearError
  } = useTreasureHunts();

  const [editingClue, setEditingClue] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    stageNumber: 0,
    description: '',
    imageUrl: ''
  });
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Fetch treasure hunt data when component mounts or treasureHuntId changes
  useEffect(() => {
    if (treasureHuntId) {
      fetchTreasureHuntWithClues(treasureHuntId);
    }
  }, [treasureHuntId, fetchTreasureHuntWithClues]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!treasureHuntId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Treasure Hunt Selected</h3>
        <p className="text-gray-500 mb-6">Please select a treasure hunt to manage its clues.</p>
        <button 
          onClick={onBack}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Treasure Hunts
        </button>
      </div>
    );
  }

  if (loading && !currentTreasureHuntWithClues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading treasure hunt details...</p>
        </div>
      </div>
    );
  }

  if (!currentTreasureHuntWithClues) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Treasure Hunt Not Found</h3>
        <p className="text-gray-500 mb-6">The requested treasure hunt could not be loaded.</p>
        <button 
          onClick={onBack}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Treasure Hunts
        </button>
      </div>
    );
  }

  const treasureHunt = currentTreasureHuntWithClues;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleEditClue = (clue: any) => {
    setEditingClue(clue.id);
    setEditForm({
      stageNumber: clue.stageNumber,
      description: clue.description,
      imageUrl: clue.imageUrl || ''
    });
    setDropdownOpen(null);
  };

  const handleSaveClue = async () => {
    if (!editingClue || !treasureHuntId) return;

    try {
      await updateClue(treasureHuntId, editingClue, editForm);
      setSuccessMessage('Clue updated successfully!');
      setEditingClue(null);
    } catch (error) {
      console.error('Failed to update clue:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingClue(null);
    setEditForm({
      stageNumber: 0,
      description: '',
      imageUrl: ''
    });
  };

  const handleApproveSubmission = async (submissionId: string) => {
    if (!treasureHuntId) return;

    try {
      await approveSubmission(treasureHuntId, submissionId);
      setSuccessMessage('Submission approved successfully!');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to approve submission:', error);
    }
  };

  const handleRejectSubmission = async (submissionId: string, feedback: string) => {
    if (!treasureHuntId) return;

    try {
      await rejectSubmission(treasureHuntId, submissionId, { feedback });
      setSuccessMessage('Submission rejected with feedback.');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to reject submission:', error);
    }
  };

  const getClueStats = (clue: any) => {
    const submissions = clue.submissions || [];
    const total = submissions.length;
    const approved = submissions.filter((s: any) => s.status === 'APPROVED').length;
    const pending = submissions.filter((s: any) => s.status === 'PENDING').length;
    const rejected = submissions.filter((s: any) => s.status === 'REJECTED').length;
    
    return { total, approved, pending, rejected };
  };

  const toggleDropdown = (clueId: string) => {
    setDropdownOpen(dropdownOpen === clueId ? null : clueId);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{treasureHunt.title}</h1>
            <p className="text-gray-600">{treasureHunt.description}</p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            treasureHunt.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            treasureHunt.status === 'UPCOMING' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {treasureHunt.status}
          </span>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Clues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(treasureHunt.clues || []).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Teams</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(treasureHunt.assignedTeams || []).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Approved</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(treasureHunt.clues || []).reduce((acc, clue) => 
                acc + (clue.submissions || []).filter((s: any) => s.status === 'APPROVED').length, 0
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(treasureHunt.clues || []).reduce((acc, clue) => 
                acc + (clue.submissions || []).filter((s: any) => s.status === 'PENDING').length, 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Clues List */}
      {(!treasureHunt.clues || treasureHunt.clues.length === 0) ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clues yet</h3>
          <p className="text-gray-500 mb-6">This treasure hunt doesn't have any clues configured yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(treasureHunt.clues || []).map((clue) => {
            const stats = getClueStats(clue);
            const isEditing = editingClue === clue.id;

            return (
              <div key={clue.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          Stage {clue.stageNumber}
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{stats.total} submissions</span>
                          <span>•</span>
                          <span>{stats.approved} approved</span>
                          <span>•</span>
                          <span>{stats.pending} pending</span>
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stage Number
                            </label>
                            <input
                              type="number"
                              value={editForm.stageNumber}
                              onChange={(e) => setEditForm(prev => ({ ...prev, stageNumber: parseInt(e.target.value) || 0 }))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Image URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={editForm.imageUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={handleSaveClue}
                              disabled={loading}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 mb-3">{clue.description}</p>
                          {clue.imageUrl && (
                            <div className="mb-3">
                              <img
                                src={clue.imageUrl}
                                alt="Clue reference"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(clue.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {dropdownOpen === clue.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={closeDropdown}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditClue(clue)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Clue
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <>
                      {/* Progress Bar */}
                      {stats.total > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Team Progress</span>
                            <span>{stats.approved}/{(treasureHunt.assignedTeams || []).length} teams completed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(treasureHunt.assignedTeams || []).length > 0 ? 
                                  (stats.approved / (treasureHunt.assignedTeams || []).length) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Submissions */}
                      {clue.submissions && clue.submissions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Submissions</h4>
                          <div className="space-y-3">
                            {clue.submissions.map((submission) => (
                              <div key={submission.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={submission.imageUrl}
                                  alt="Team submission"
                                  className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setSelectedSubmission(submission)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900">{submission.team.name}</span>
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                      {getStatusIcon(submission.status)}
                                      <span className="ml-1">{submission.status}</span>
                                    </span>
                                  </div>
                                  {submission.submittedAt && (
                                    <p className="text-sm text-gray-500">
                                      Submitted {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                  )}
                                  {submission.adminFeedback && (
                                    <p className="text-sm text-red-600 mt-1">
                                      Admin feedback: {submission.adminFeedback}
                                    </p>
                                  )}
                                </div>
                                {submission.status === 'PENDING' && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleApproveSubmission(submission.id)}
                                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => setSelectedSubmission(submission)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!clue.submissions || clue.submissions.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p>No submissions yet</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission from {selectedSubmission.team.name}
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <img
                  src={selectedSubmission.imageUrl}
                  alt="Team submission"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                  {getStatusIcon(selectedSubmission.status)}
                  <span className="ml-1">{selectedSubmission.status}</span>
                </span>
                {selectedSubmission.submittedAt && (
                  <span className="text-sm text-gray-500">
                    Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {selectedSubmission.adminFeedback && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Admin Feedback:</p>
                  <p className="text-sm text-red-700">{selectedSubmission.adminFeedback}</p>
                </div>
              )}

              {selectedSubmission.status === 'PENDING' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApproveSubmission(selectedSubmission.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Approve Submission
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Feedback (Optional)
                    </label>
                    <textarea
                      placeholder="Provide feedback for why this submission was rejected..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      id="rejection-feedback"
                    />
                    <button
                      onClick={() => {
                        const feedback = (document.getElementById('rejection-feedback') as HTMLTextAreaElement)?.value || '';
                        handleRejectSubmission(selectedSubmission.id, feedback);
                      }}
                      disabled={loading}
                      className="mt-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CluesManagementTab;