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
  const { assignRoomToUser, fetchAllRooms, rooms, loading, error, clearError } = useRoomAllotment();
  const { users, fetchAllUsers } = useUserManagement();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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

    if (!selectedUserId) {
      errors.user = 'Please select a user';
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
      await assignRoomToUser(selectedUserId, roomNumber.trim());
      onSuccess();
      handleClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setRoomNumber('');
    setUserSearchTerm('');
    setShowUserDropdown(false);
    setValidationErrors({});
    onClose();
  };

  const handleUserSelect = (user: any) => {
    setSelectedUserId(user.id);
    setUserSearchTerm(user.name);
    setShowUserDropdown(false);
    
    // Check if user already has a room
    const currentRoom = getUserCurrentRoom(user.id);
    if (currentRoom) {
      setRoomNumber(currentRoom.roomNumber);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const currentRoom = selectedUser ? getUserCurrentRoom(selectedUserId) : null;

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
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
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
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-600">
                    {selectedUser.employeeCode} • {selectedUser.department}
                  </p>
                </div>
              </div>
              
              {currentRoom && (
                <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Currently assigned to Room {currentRoom.roomNumber}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    This will update the existing assignment
                  </p>
                </div>
              )}
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
          {selectedUser && roomNumber.trim() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Assignment Preview</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>{selectedUser.name}</strong> will be assigned to <strong>Room {roomNumber.trim()}</strong></p>
                {currentRoom && (
                  <p className="text-xs mt-1">
                    This will replace the current assignment to Room {currentRoom.roomNumber}
                  </p>
                )}
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
              disabled={loading || !selectedUserId || !roomNumber.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomAllotmentModal; 