'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  createTeam, 
  getAllTeams, 
  getAllUsers, 
  addMemberToTeam, 
  clearError,
  setSelectedTeam
} from '../../../store/teamSlice';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  Users, 
  Plus, 
  Edit, 
  Search, 
  UserPlus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function TeamManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedUserId, setSelectedUserId] = useState('');

  const dispatch = useAppDispatch();
  const { teams, users, isLoading, error } = useAppSelector((state) => state.team);

  useEffect(() => {
    dispatch(getAllTeams());
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createTeam(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeamForMember && selectedUserId) {
      const result = await dispatch(addMemberToTeam({
        teamId: selectedTeamForMember,
        userId: selectedUserId
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowAddMemberModal(false);
        setSelectedUserId('');
        setSelectedTeamForMember(null);
      }
    }
  };

  const openAddMemberModal = (teamId: string) => {
    setSelectedTeamForMember(teamId);
    setShowAddMemberModal(true);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableUsers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return users;
    
    const teamMemberIds = team.members.map(member => member.id);
    return users.filter(user => !teamMemberIds.includes(user.id));
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                  <p className="text-sm text-gray-600">Create and manage teams and their members</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create Team</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error/Success Messages */}
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search teams..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Teams Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.name}</h3>
                        {team.description && (
                          <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openAddMemberModal(team.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                          title="Add Member"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => dispatch(setSelectedTeam(team))}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                          title="Edit Team"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Members</span>
                        <span className="text-xs text-gray-500">{team.members.length} member(s)</span>
                      </div>
                      
                      {team.members.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between py-1">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-indigo-600">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-700">{member.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                member.role === 'ADMIN' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 py-2">No members yet</div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => openAddMemberModal(team.id)}
                      className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTeams.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first team.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Team</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Team</h2>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      id="teamName"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter team name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="teamDescription"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter team description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ name: '', description: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.name.trim()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isLoading ? 'Creating...' : 'Create Team'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && selectedTeamForMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Team Member</h2>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label htmlFor="selectUser" className="block text-sm font-medium text-gray-700 mb-1">
                      Select User
                    </label>
                    <select
                      id="selectUser"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Choose a user...</option>
                      {getAvailableUsers(selectedTeamForMember).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {user.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemberModal(false);
                        setSelectedUserId('');
                        setSelectedTeamForMember(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedUserId}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isLoading ? 'Adding...' : 'Add Member'}
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