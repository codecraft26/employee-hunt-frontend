// components/tabs/TreasureHuntsTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trophy, Calendar, Users, Clock, AlertCircle, Edit, Trash2, MoreVertical, FileText } from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import CreateTreasureHuntModal from '../modals/CreateTreasureHuntModal';
import EditTreasureHuntModal from '../modals/EditTreasureHuntModal';
import DeleteTreasureHuntModal from '../modals/DeleteTreasureHuntModal';

interface TreasureHuntsTabProps {
  onViewClues: (huntId: string) => void;
  onViewSubmissions: (huntId: string) => void;
  onDeclareWinner: (huntId: string) => void;
}

const TreasureHuntsTab: React.FC<TreasureHuntsTabProps> = ({ 
  onViewClues, 
  onViewSubmissions,
  onDeclareWinner 
}) => {
  const { 
    treasureHunts, 
    loading, 
    error, 
    fetchTreasureHunts,
    getHuntStats,
    clearError 
  } = useTreasureHunts();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    treasureHunt: any | null;
  }>({
    isOpen: false,
    treasureHunt: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    treasureHunt: any | null;
  }>({
    isOpen: false,
    treasureHunt: null
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Fetch treasure hunts on component mount
  useEffect(() => {
    fetchTreasureHunts();
  }, [fetchTreasureHunts]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateSuccess = (treasureHunt: any) => {
    setSuccessMessage(`Treasure hunt "${treasureHunt.title}" created successfully!`);
    fetchTreasureHunts(); // Refresh the list
  };

  const handleEditSuccess = (treasureHunt: any) => {
    setSuccessMessage(`Treasure hunt "${treasureHunt.title}" updated successfully!`);
    fetchTreasureHunts(); // Refresh the list
  };

  const handleDeleteSuccess = () => {
    setSuccessMessage(`Treasure hunt deleted successfully!`);
    fetchTreasureHunts(); // Refresh the list
  };

  const handleEdit = (hunt: any) => {
    setEditModal({
      isOpen: true,
      treasureHunt: hunt
    });
    setDropdownOpen(null);
  };

  const handleDelete = (hunt: any) => {
    setDeleteModal({
      isOpen: true,
      treasureHunt: hunt
    });
    setDropdownOpen(null);
  };

  const toggleDropdown = (huntId: string) => {
    setDropdownOpen(dropdownOpen === huntId ? null : huntId);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  const handleDeclareWinner = (huntId: string) => {
    const hunt = treasureHunts.find(h => h.id === huntId);
    const stats = getHuntStats(huntId);
    
    // Allow declaring winner for ACTIVE or COMPLETED hunts that don't have a winner yet
    if (hunt && stats?.canDeclareWinner) {
      onDeclareWinner(huntId);
    }
  };

  // Check if hunt can be deleted (UPCOMING or COMPLETED hunts can be deleted, not ACTIVE or IN_PROGRESS)
  const canDeleteHunt = (hunt: any) => {
    return hunt.status === 'UPCOMING' || hunt.status === 'COMPLETED';
  };

  if (loading && treasureHunts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading treasure hunts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Treasure Hunt Management</h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Hunt</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Trophy className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
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
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Treasure Hunts Grid */}
      {treasureHunts.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No treasure hunts yet</h3>
          <p className="text-gray-500 mb-6">Create your first treasure hunt to get started!</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First Hunt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {treasureHunts.map((hunt) => {
            const stats = getHuntStats(hunt.id);
            const safeAssignedTeams = hunt.assignedTeams || [];
            
            return (
              <div key={hunt.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden relative">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{hunt.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hunt.description}</p>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(hunt.status)}`}>
                          {hunt.status}
                        </span>
                        {hunt.winningTeam && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner: {hunt.winningTeam.name}
                          </span>
                        )}
                        {hunt.status === 'COMPLETED' && !hunt.winningTeam && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            No Winner Declared
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(hunt.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {dropdownOpen === hunt.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={closeDropdown}
                          ></div>
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(hunt)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Hunt
                              </button>
                              <button
                                onClick={() => onViewClues(hunt.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Manage Clues
                              </button>
                              <button
                                onClick={() => {
                                  onViewSubmissions(hunt.id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Submissions
                              </button>
                              {stats?.canDeclareWinner && (
                                <button
                                  onClick={() => {
                                    handleDeclareWinner(hunt.id);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                >
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Declare Winner
                                </button>
                              )}
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => handleDelete(hunt)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!canDeleteHunt(hunt)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {!canDeleteHunt(hunt)
                                  ? 'Cannot Delete (Active)' 
                                  : 'Delete Hunt'
                                }
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <Trophy className="h-4 w-4 mr-1" />
                          Total Clues
                        </p>
                        <p className="font-medium">{stats?.totalClues || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Teams
                        </p>
                        <p className="font-medium">{stats?.totalTeams || safeAssignedTeams.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Start Date
                        </p>
                        <p className="font-medium text-xs">{formatDate(hunt.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          End Date
                        </p>
                        <p className="font-medium text-xs">{formatDate(hunt.endTime)}</p>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    {stats && stats.totalClues > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Progress Overview</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-green-600 font-medium">{stats.completedClues}</p>
                            <p className="text-green-600">Completed</p>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <p className="text-yellow-600 font-medium">{stats.pendingClues}</p>
                            <p className="text-yellow-600">Pending</p>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <p className="text-red-600 font-medium">{stats.rejectedClues}</p>
                            <p className="text-red-600">Rejected</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team List */}
                    {safeAssignedTeams.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned Teams</p>
                        <div className="flex flex-wrap gap-1">
                          {safeAssignedTeams.slice(0, 3).map((team) => (
                            <span 
                              key={team.id}
                              className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {team.name}
                            </span>
                          ))}
                          {safeAssignedTeams.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              +{safeAssignedTeams.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => onViewClues(hunt.id)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Clues</span>
                    </button>
                    <button 
                      onClick={() => onViewSubmissions(hunt.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Submissions</span>
                    </button>
                  </div>
                  {stats?.canDeclareWinner && (
                    <button 
                      onClick={() => handleDeclareWinner(hunt.id)}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded font-medium text-sm flex items-center space-x-1 transition-colors"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Declare Winner</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Treasure Hunt Modal */}
      <CreateTreasureHuntModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Treasure Hunt Modal */}
      <EditTreasureHuntModal
        isOpen={editModal.isOpen}
        treasureHunt={editModal.treasureHunt}
        onClose={() => setEditModal({ isOpen: false, treasureHunt: null })}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Treasure Hunt Modal */}
      <DeleteTreasureHuntModal
        isOpen={deleteModal.isOpen}
        treasureHunt={deleteModal.treasureHunt}
        onClose={() => setDeleteModal({ isOpen: false, treasureHunt: null })}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default TreasureHuntsTab;