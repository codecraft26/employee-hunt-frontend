import React, { useState, useEffect } from 'react';
import { X, Users, User, Search, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamId: string;
  teamName: string;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  teamId, 
  teamName 
}) => {
  const { addMemberToTeam, loading, error, clearError, users, fetchUsers } = useTeams();
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      clearError();
    }
  }, [isOpen, fetchUsers, clearError]);

  // Filter users based on search term and exclude users already in teams
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    // Only show users who are not already in a team
    const isAvailable = !user.team;
    
    return matchesSearch && isAvailable;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userSearchTerm.trim()) {
      errors.user = 'Please search and select a user';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (user: any) => {
    if (!validateForm()) {
      return;
    }

    setAddingUserId(user.id);
    try {
      const success = await addMemberToTeam({
        teamId: teamId,
        userId: user.id
      });
      
      if (success) {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setAddingUserId(null);
    }
  };

  const handleClose = () => {
    setUserSearchTerm('');
    setShowUserDropdown(false);
    setValidationErrors({});
    setAddingUserId(null);
    onClose();
  };

  const handleUserSelect = (user: any) => {
    setUserSearchTerm(user.name);
    setShowUserDropdown(false);
  };

  const selectedUser = users.find(u => u.name === userSearchTerm);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
                <p className="text-sm text-gray-600">Add a user to {teamName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User to Add *
            </label>
            <div className="relative">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    placeholder="Search users by name, email, employee code, or department..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      validationErrors.user ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserSearchTerm('');
                    setShowUserDropdown(true);
                  }}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Show All</span>
                </button>
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p>Loading users...</p>
                      </div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                          {filteredUsers.length} available users
                          {userSearchTerm && ` matching "${userSearchTerm}"`}
                        </p>
                      </div>
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.role}</p>
                          </div>
                          <div className="text-green-600">
                            <UserPlus className="h-4 w-4" />
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-500">
                      {userSearchTerm ? (
                        <div>
                          <p>No available users found matching "{userSearchTerm}"</p>
                          <p className="text-xs mt-1">All matching users may already be in teams</p>
                        </div>
                      ) : (
                        <div>
                          <p>No available users found</p>
                          <p className="text-xs mt-1">All users are already assigned to teams</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Click outside to close dropdown */}
              {showUserDropdown && (
                <div 
                  className="fixed inset-0 z-5"
                  onClick={() => setShowUserDropdown(false)}
                />
              )}
            </div>
            {validationErrors.user && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.user}</p>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-600">{selectedUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Team Assignment Preview */}
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Assignment Preview</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>{selectedUser.name}</strong> will be added to <strong>{teamName}</strong></p>
                <p className="text-xs mt-1">
                  This user will become a member of the team and can participate in team activities
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => selectedUser && handleAddUser(selectedUser)}
              disabled={loading || !selectedUser}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && addingUserId ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Add to Team</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberModal; 