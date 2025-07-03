import React, { useState, useEffect } from 'react';
import { X, Building2, User, Key, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useRoomAllotment, HotelRoom } from '../../hooks/useRoomAllotment';
import { useUserManagement } from '../../hooks/useUserManagement';

interface RoomAllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RoomAllotmentModal: React.FC<RoomAllotmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { assignRoomToUser, assignRoomToMultipleUsers, fetchAllRooms, rooms, loading, error, clearError } = useRoomAllotment();
  const { users, fetchAllUsers } = useUserManagement();
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllRooms();
      fetchAllUsers();
      clearError();
    }
  }, [isOpen, fetchAllRooms, fetchAllUsers, clearError]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.employeeCode?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Get user's current room
  const getUserCurrentRoom = (userId: string) => {
    return rooms.find(room => 
      room.user?.id === userId || 
      (room.users && room.users.some(user => user.id === userId))
    );
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (selectedUserIds.length === 0) {
      errors.user = 'Please select at least one user';
    }
    if (!roomNumber.trim()) {
      errors.roomNumber = 'Room number is required';
    } else if (roomNumber.trim().length < 2) {
      errors.roomNumber = 'Room number must be at least 2 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (selectedUserIds.length === 1) {
        await assignRoomToUser(selectedUserIds[0], roomNumber.trim());
      } else {
        await assignRoomToMultipleUsers(selectedUserIds, roomNumber.trim());
      }
      onSuccess();
      handleClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    setRoomNumber('');
    setUserSearchTerm('');
    setShowUserDropdown(false);
    setValidationErrors({});
    onClose();
  };

  const handleUserSelect = (user: any) => {
    setSelectedUserIds((prev) =>
      prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]
    );
    setUserSearchTerm('');
    setShowUserDropdown(false);
  };

  const selectedUser = users.find(u => u.id === selectedUserIds[0]);
  const currentRoom = selectedUser ? getUserCurrentRoom(selectedUserIds[0]) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Hotel Room</h2>
                <p className="text-sm text-gray-600">Assign a room number to a user</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User *
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
                    placeholder="Search users by name, email, or employee code..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Loading users...</p>
                      </div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                          {filteredUsers.length} users available
                          {userSearchTerm && ` matching "${userSearchTerm}"`}
                        </p>
                      </div>
                      {filteredUsers.map((user) => {
                        const userRoom = getUserCurrentRoom(user.id);
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-100' : ''}`}
                          >
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">
                                {user.employeeCode} • {user.department}
                              </p>
                              {userRoom && (
                                <p className="text-xs text-orange-600 font-medium">
                                  Currently in Room {userRoom.roomNumber}
                                </p>
                              )}
                            </div>
                            <input type="checkbox" checked={isSelected} readOnly className="ml-2" />
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-500">
                      No users found matching "{userSearchTerm}"
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
          {selectedUserIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUserIds.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;
                  return (
                    <span key={user.id} className="flex items-center px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                      {user.name}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-900"
                        onClick={() => setSelectedUserIds(selectedUserIds.filter(id => id !== user.id))}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Room Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room number (e.g., A101, B205)"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.roomNumber ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {validationErrors.roomNumber && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.roomNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter a unique room number. If the room doesn't exist, it will be created.
            </p>
          </div>

          {/* Room Assignment Preview */}
          {selectedUserIds.length > 0 && roomNumber.trim() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Assignment Preview</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>{selectedUserIds.length === 1 ? users.find(u => u.id === selectedUserIds[0])?.name : `${selectedUserIds.length} users`}</strong>
                  {' '}will be assigned to <strong>Room {roomNumber.trim()}</strong>
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
              type="submit"
              disabled={loading || selectedUserIds.length === 0 || !roomNumber.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : `Assign Room${selectedUserIds.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomAllotmentModal; 