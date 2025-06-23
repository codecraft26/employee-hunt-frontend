// components/tabs/TeamsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Edit, 
  Users, 
  BarChart3, 
  AlertCircle, 
  RefreshCw, 
  X,
  UserPlus,
  UserMinus,
  Trash2,
  Calendar,
  Award,
  Target,
  Crown,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { useTeams, Team, User, CreateTeamRequest } from '../../hooks/useTeams';
import { useToast } from '../shared/ToastContainer';
import AddTeamMemberModal from '../modals/AddTeamMemberModal';

interface TeamsTabProps {
  onCreateTeam?: () => void;
  onImportUsers?: () => void;
  onManageMembers?: (teamId: string) => void;
  onViewStats?: (teamId: string) => void;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ 
  onCreateTeam: externalOnCreateTeam,
  onImportUsers,
  onManageMembers: externalOnManageMembers,
  onViewStats: externalOnViewStats
}) => {
  const {
    loading,
    error,
    teams,
    users,
    createTeam,
    createTeamWithLeader,
    assignTeamLeader,
    fetchTeams,
    fetchUsers,
    addMemberToTeam,
    removeMemberFromTeam,
    updateTeam,
    deleteTeam,
    getTeamStats,
    clearError,
  } = useTeams();
  
  const { showSuccess, showError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [createTeamData, setCreateTeamData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    leaderId: '',
    memberIds: []
  });
  const [editTeamData, setEditTeamData] = useState<CreateTeamRequest>({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Fetch teams and users on component mount
  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [fetchTeams, fetchUsers]);

  const handleCreateTeam = async () => {
    if (!createTeamData.name.trim() || !createTeamData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newTeam = await createTeam(createTeamData);
      
      if (newTeam) {
        showSuccess(
          'Team Created',
          `${createTeamData.name} has been created successfully`,
          4000
        );
        
        setShowCreateModal(false);
        setCreateTeamData({ name: '', description: '' });
        // Call external handler if provided
        externalOnCreateTeam?.();
      }
    } catch (err: any) {
      console.error('Failed to create team:', err);
      
      showError(
        'Creation Failed',
        `Could not create team: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditTeamData({
      name: team.name,
      description: team.description
    });
    setShowEditModal(true);
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !editTeamData.name.trim() || !editTeamData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedTeam = await updateTeam(selectedTeam.id, editTeamData);
      
      if (updatedTeam) {
        showSuccess(
          'Team Updated',
          `${editTeamData.name} has been updated successfully`,
          4000
        );
        
        setShowEditModal(false);
        setSelectedTeam(null);
        setEditTeamData({ name: '', description: '' });
      }
    } catch (err: any) {
      console.error('Failed to update team:', err);
      
      showError(
        'Update Failed',
        `Could not update team: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeam) return;

    const teamName = selectedTeam.name;
    const teamId = selectedTeam.id;
    
    // Close modal immediately for better UX
    setShowDeleteModal(false);
    setSelectedTeam(null);
    
    // Show immediate success feedback
    showSuccess(
      'Team Deleted',
      `${teamName} has been deleted successfully`,
      4000
    );
    
    try {
      const success = await deleteTeam(teamId);
      
      if (!success) {
        // If deletion failed, show error and the team will be restored by the hook
        showError(
          'Deletion Failed',
          `Could not delete ${teamName}. Please try again.`,
          6000
        );
      }
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      
      showError(
        'Deletion Failed',
        `Could not delete ${teamName}: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    }
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
    // Call external handler if provided
    externalOnManageMembers?.(team.id);
  };

  const handleViewStats = (team: Team) => {
    setSelectedTeam(team);
    setShowStatsModal(true);
    // Call external handler if provided
    externalOnViewStats?.(team.id);
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;

    // Find the user being added for toast message
    const userToAdd = users.find(user => user.id === userId);
    const userName = userToAdd?.name || 'Unknown user';

    // Show immediate success feedback
    showSuccess(
      'Member Added',
      `${userName} has been added to ${selectedTeam.name}`,
      4000
    );

    try {
      const success = await addMemberToTeam({
        teamId: selectedTeam.id,
        userId: userId
      });
      
      if (!success) {
        // If addition failed, show error and the member will be restored by the hook
        showError(
          'Addition Failed',
          `Could not add ${userName}. Please try again.`,
          6000
        );
      }
    } catch (err: any) {
      console.error('Failed to add member:', err);
      
      showError(
        'Addition Failed',
        `Could not add ${userName}: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;

    // Find the member being removed for toast message
    const memberToRemove = selectedTeam.members.find(member => member.id === userId);
    const memberName = memberToRemove?.name || 'Unknown member';

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to remove "${memberName}" from "${selectedTeam.name}"?\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    setRemovingMemberId(userId);
    
    // Show immediate success feedback
    showSuccess(
      'Member Removed',
      `${memberName} has been removed from ${selectedTeam.name}`,
      4000
    );
    
    try {
      const success = await removeMemberFromTeam(selectedTeam.id, userId);
      
      if (!success) {
        // If removal failed, show error and the member will be restored by the hook
        showError(
          'Removal Failed', 
          `Could not remove ${memberName}. Please try again.`,
          6000
        );
      }
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      
      showError(
        'Removal Failed', 
        `Could not remove ${memberName}: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleRefresh = () => {
    clearError();
    fetchTeams();
    fetchUsers();
  };

  // Leader management functions
  const handleAssignLeader = (team: Team) => {
    setSelectedTeam(team);
    setSelectedLeaderId(team.leaderId || '');
    setShowLeaderModal(true);
  };

  const handleConfirmAssignLeader = async () => {
    if (!selectedTeam || !selectedLeaderId) return;

    setIsSubmitting(true);
    try {
      const success = await assignTeamLeader(selectedTeam.id, selectedLeaderId);
      
      if (success) {
        const leaderName = selectedTeam.members.find(m => m.id === selectedLeaderId)?.name || 'Unknown';
        showSuccess(
          'Leader Assigned',
          `${leaderName} has been assigned as leader of ${selectedTeam.name}`,
          4000
        );
        
        setShowLeaderModal(false);
        setSelectedTeam(null);
        setSelectedLeaderId('');
      }
    } catch (err: any) {
      console.error('Failed to assign leader:', err);
      
      showError(
        'Assignment Failed',
        `Could not assign leader: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced create team function with members and leader
  const handleCreateTeamWithLeader = async () => {
    if (!createTeamData.name.trim() || !createTeamData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newTeam = await createTeamWithLeader(createTeamData);
      
      if (newTeam) {
        showSuccess(
          'Team Created',
          `${createTeamData.name} has been created successfully with ${createTeamData.memberIds?.length || 0} members`,
          4000
        );
        
        setShowCreateModal(false);
        setCreateTeamData({ name: '', description: '', leaderId: '', memberIds: [] });
        externalOnCreateTeam?.();
      }
    } catch (err: any) {
      console.error('Failed to create team with members:', err);
      
      showError(
        'Creation Failed',
        `Could not create team: ${err.message || 'Unknown error occurred'}`,
        6000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available users (not in any team)
  const availableUsers = users.filter(user => !user.team);

  // Sort teams by score (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const handleAddMemberSuccess = () => {
    // Refresh teams and users data
    fetchTeams();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage teams and their members</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
          {onImportUsers && (
            <button 
              onClick={onImportUsers}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import Users</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Team</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={editTeamData.name}
                  onChange={(e) => setEditTeamData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editTeamData.description}
                  onChange={(e) => setEditTeamData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                disabled={!editTeamData.name.trim() || !editTeamData.description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Team</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Team:</strong> {selectedTeam.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Members:</strong> {selectedTeam.members.length} 
                  {selectedTeam.members.length > 0 && " (members will be unassigned)"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Score:</strong> {selectedTeam.score}
                </p>
              </div>

              <p className="text-sm text-red-600 mt-3">
                Deleting this team will permanently remove all team data and unassign all members.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {loading && teams.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first team</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedTeams.map((team, index) => (
            <div key={team.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-indigo-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditTeam(team)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit team"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeam(team)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Leader Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Team Leader</span>
                      </div>
                      <button 
                        onClick={() => handleAssignLeader(team)}
                        className="text-blue-600 hover:text-blue-700 text-xs flex items-center space-x-1"
                        title="Assign/Change Leader"
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>Assign</span>
                      </button>
                    </div>
                    {team.leader ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white">
                          {team.leader.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">{team.leader.name}</p>
                          <p className="text-xs text-blue-600">{team.leader.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-blue-600 mt-2">No leader assigned</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="text-2xl font-bold text-gray-900">{team.members.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-2xl font-bold text-gray-900">{team.score}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 4).map((member) => (
                        <div 
                          key={member.id} 
                          className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                            member.id === team.leaderId 
                              ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                              : 'bg-gray-300 text-gray-700'
                          }`}
                          title={`${member.name}${member.id === team.leaderId ? ' (Leader)' : ''}`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {team.members.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{team.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowAddMemberModal(true);
                    }}
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                  <button 
                    onClick={() => handleManageMembers(team)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Members</span>
                  </button>
                </div>
                <button 
                  onClick={() => handleViewStats(team)}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Stats</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={createTeamData.name}
                  onChange={(e) => setCreateTeamData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createTeamData.description}
                  onChange={(e) => setCreateTeamData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeamWithLeader}
                disabled={!createTeamData.name.trim() || !createTeamData.description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <AddTeamMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={handleAddMemberSuccess}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
        />
      )}

      {/* Manage Members Modal - Keep the old one for now but make it simpler */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Members - {selectedTeam.name}
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Members */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Members ({selectedTeam.members.length})</h4>
                {selectedTeam.members.length === 0 ? (
                  <p className="text-gray-500 text-sm">No members in this team yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingMemberId === member.id}
                          className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove member"
                        >
                          {removingMemberId === member.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Member Button */}
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setShowAddMemberModal(true);
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Member</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Stats Modal */}
      {showStatsModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Team Statistics - {selectedTeam.name}
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Members</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{selectedTeam.members.length}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Total Score</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{selectedTeam.score}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Average Score per Member</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {selectedTeam.members.length > 0 ? Math.round(selectedTeam.score / selectedTeam.members.length) : 0}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Team Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(selectedTeam.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(selectedTeam.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedTeam.members.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-600">Member Roles</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(selectedTeam.members.map(m => m.role))].map((role) => (
                      <span 
                        key={role}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                      >
                        {role} ({selectedTeam.members.filter(m => m.role === role).length})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeam.members.some(m => m.department) && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Departments</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(selectedTeam.members.map(m => m.department).filter(Boolean))].map((dept) => (
                      <span 
                        key={dept}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leader Assignment Modal */}
      {showLeaderModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Team Leader - {selectedTeam.name}
              </h3>
              <button
                onClick={() => setShowLeaderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Current Leader</span>
                </div>
                {selectedTeam.leader ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                      {selectedTeam.leader.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">{selectedTeam.leader.name}</p>
                      <p className="text-xs text-blue-600">{selectedTeam.leader.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">No leader assigned</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Leader
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTeam.members.length === 0 ? (
                    <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                      No team members available. Add members to the team first.
                    </p>
                  ) : (
                    selectedTeam.members.map((member) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLeaderId === member.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedLeaderId(member.id)}
                      >
                        <input
                          type="radio"
                          name="leader"
                          value={member.id}
                          checked={selectedLeaderId === member.id}
                          onChange={() => setSelectedLeaderId(member.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          {member.role && (
                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                          )}
                        </div>
                        {member.id === selectedTeam.leaderId && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLeaderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignLeader}
                disabled={!selectedLeaderId || isSubmitting || selectedTeam.members.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Leader'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsTab;