'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  createTreasureHunt, 
  getAllTeams, 
  getTeamTreasureHunts,
  getTreasureHuntClues,
  approveClue,
  rejectClue,
  clearError,
  setSelectedTreasureHunt
} from '../../../store/teamSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  MapPin, 
  Plus, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  Trophy,
  AlertCircle,
  X,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

export default function TreasureHuntPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCluesModal, setShowCluesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    clueId: '',
    feedback: '',
    action: '' as 'approve' | 'reject'
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const dispatch = useAppDispatch();
  const { teams, treasureHunts, clues, isLoading, error, selectedTreasureHunt } = useAppSelector((state) => state.team);

  useEffect(() => {
    dispatch(getAllTeams());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTeamId) {
      dispatch(getTeamTreasureHunts(selectedTeamId));
    }
  }, [selectedTeamId, dispatch]);

  const handleCreateTreasureHunt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeamId) {
      const result = await dispatch(createTreasureHunt({
        teamId: selectedTeamId,
        ...formData
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateModal(false);
        setFormData({ title: '', description: '' });
        dispatch(getTeamTreasureHunts(selectedTeamId));
      }
    }
  };

  const handleViewClues = async (treasureHuntId: string) => {
    await dispatch(getTreasureHuntClues(treasureHuntId));
    setShowCluesModal(true);
  };

  const handleClueAction = (clueId: string, action: 'approve' | 'reject') => {
    setFeedbackData({ clueId, feedback: '', action });
    setShowFeedbackModal(true);
  };

  const submitClueAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { clueId, feedback, action } = feedbackData;
    
    if (action === 'approve') {
      await dispatch(approveClue({ clueId, feedback }));
    } else {
      await dispatch(rejectClue({ clueId, feedback }));
    }
    
    setShowFeedbackModal(false);
    setFeedbackData({ clueId: '', feedback: '', action: 'approve' });
    
    // Refresh clues
    if (selectedTreasureHunt) {
      dispatch(getTreasureHuntClues(selectedTreasureHunt.id));
    }
  };

  const filteredTreasureHunts = treasureHunts.filter(hunt =>
    hunt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hunt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Treasure Hunt Management</h1>
                  <p className="text-sm text-gray-600">Create and manage treasure hunts for teams</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!selectedTeamId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Create Treasure Hunt</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => dispatch(clearError())}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Team Selection */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Team
            </label>
            <select
              id="teamSelect"
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">Choose a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>

          {selectedTeamId && (
            <>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search treasure hunts..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Treasure Hunts Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTreasureHunts.map((hunt) => (
                    <div key={hunt.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{hunt.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{hunt.description}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(hunt.status)}`}>
                              {hunt.status}
                            </span>
                          </div>
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Team:</span>
                            <span className="font-medium">{hunt.team.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Clues:</span>
                            <span className="font-medium">{hunt.clues?.length || 0} submitted</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => {
                            dispatch(setSelectedTreasureHunt(hunt));
                            handleViewClues(hunt.id);
                          }}
                          className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Clues</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredTreasureHunts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No treasure hunts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Create the first treasure hunt for this team.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Treasure Hunt</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {!selectedTeamId && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a team</h3>
              <p className="text-gray-600">Choose a team from the dropdown above to view and manage their treasure hunts.</p>
            </div>
          )}
        </div>

        {/* Create Treasure Hunt Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Treasure Hunt</h2>
                <form onSubmit={handleCreateTreasureHunt} className="space-y-4">
                  <div>
                    <label htmlFor="huntTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="huntTitle"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter treasure hunt title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="huntDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="huntDescription"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter treasure hunt description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ title: '', description: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isLoading ? 'Creating...' : 'Create Hunt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Clues Modal */}
        {showCluesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Clues for {selectedTreasureHunt?.title}
                  </h2>
                  <button
                    onClick={() => setShowCluesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {clues.length > 0 ? (
                  <div className="space-y-4">
                    {clues.map((clue) => (
                      <div key={clue.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">Clue #{clue.clueNumber}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(clue.status)}`}>
                              {clue.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Submitted by {clue.submittedBy.name}
                          </div>
                        </div>
                        
                        {clue.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={clue.imageUrl} 
                              alt={`Clue ${clue.clueNumber}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {clue.adminFeedback && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">Admin Feedback:</div>
                            <div className="text-sm text-gray-600">{clue.adminFeedback}</div>
                          </div>
                        )}
                        
                        {clue.status === 'PENDING' && (
                          <div className="flex space-x-2 pt-3">
                            <button
                              onClick={() => handleClueAction(clue.id, 'approve')}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleClueAction(clue.id, 'reject')}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clues submitted yet</h3>
                    <p className="text-gray-600">Team members haven't submitted any clues for this treasure hunt.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {feedbackData.action === 'approve' ? 'Approve Clue' : 'Reject Clue'}
                </h2>
                <form onSubmit={submitClueAction} className="space-y-4">
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback {feedbackData.action === 'reject' ? '(Required)' : '(Optional)'}
                    </label>
                    <textarea
                      id="feedback"
                      required={feedbackData.action === 'reject'}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Enter ${feedbackData.action === 'approve' ? 'approval notes' : 'rejection reason'}`}
                      value={feedbackData.feedback}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setFeedbackData({ clueId: '', feedback: '', action: 'approve' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || (feedbackData.action === 'reject' && !feedbackData.feedback.trim())}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        feedbackData.action === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isLoading ? 'Processing...' : (feedbackData.action === 'approve' ? 'Approve' : 'Reject')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}