// components/modals/EditPollModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, AlertCircle, Save, Users, Search, UserCheck } from 'lucide-react';
import { VoteType, UpdateVoteRequest, Vote, VotingOptionType, UserVoteOption, AvailableUser, UsersByCategoriesResponse } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import { useCategories } from '../../hooks/useCategories';
import { useModalBodyLock } from '../../hooks/useModalBodyLock';

interface EditPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  poll: Vote | null;
}

interface EditablePollOption {
  id?: string; // Existing options have IDs
  name: string;
  imageUrl: string;
  isNew?: boolean; // Track if this is a new option
}

const EditPollModal: React.FC<EditPollModalProps> = ({ isOpen, onClose, onSuccess, poll }) => {
  useModalBodyLock(isOpen);
  const { updateVote, getAvailableUsers, getUsersByCategories, loading, error } = useVotes();
  const { categories, fetchCategories } = useCategories();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: VoteType.SINGLE_CHOICE,
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    votingOptionType: VotingOptionType.CATEGORY_BASED,
  });

  // For category-based polls
  const [options, setOptions] = useState<EditablePollOption[]>([]);
  
  // For user-specific polls
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserVoteOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // For category-user-based polls
  const [selectedOptionCategories, setSelectedOptionCategories] = useState<string[]>([]);
  const [categoryUserPreview, setCategoryUserPreview] = useState<UsersByCategoriesResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when poll changes
  useEffect(() => {
    if (poll && isOpen) {
      setFormData({
        title: poll.title,
        description: poll.description || '',
        type: poll.type,
        startTime: poll.startTime ? new Date(poll.startTime).toISOString().slice(0, 16) : '',
        endTime: poll.endTime ? new Date(poll.endTime).toISOString().slice(0, 16) : '',
        resultDisplayTime: poll.resultDisplayTime ? new Date(poll.resultDisplayTime).toISOString().slice(0, 16) : '',
        votingOptionType: poll.votingOptionType || VotingOptionType.CATEGORY_BASED,
      });

      if (poll.votingOptionType === VotingOptionType.USER_SPECIFIC) {
        // Extract user options from poll options
        const userOptions = poll.options.map(option => ({
          userId: option.targetUser?.id || '',
          name: option.name !== option.targetUser?.name ? option.name : undefined
        })).filter(option => option.userId);
        setSelectedUsers(userOptions);
        setOptions([]);
        setSelectedOptionCategories([]);
      } else if (poll.votingOptionType === VotingOptionType.CATEGORY_BASED) {
        // For category-based polls, extract option categories
        const optionCategoryIds = poll.optionCategories?.map(cat => cat.id) || [];
        setSelectedOptionCategories(optionCategoryIds);
        setSelectedUsers([]);
        setOptions([]);
      } else {
        // Extract regular options
        setOptions(poll.options.map(option => ({
          id: option.id,
          name: option.name,
          imageUrl: option.imageUrl || '',
          isNew: false
        })));
        setSelectedUsers([]);
        setSelectedOptionCategories([]);
      }

      // Fetch categories for all polls
      fetchCategories();

      // Fetch available users if it's a user-specific poll
      if (poll.votingOptionType === VotingOptionType.USER_SPECIFIC) {
        fetchAvailableUsers();
      }
    }
  }, [poll, isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      const users = await getAvailableUsers();
      if (users) {
        setAvailableUsers(users);
      }
    } catch (err) {
      console.error('Failed to fetch available users:', err);
    }
  };

  const addOption = () => {
    setOptions([...options, { name: '', imageUrl: '', isNew: true }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof EditablePollOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleUserSelect = (user: AvailableUser) => {
    if (!selectedUsers.find(u => u.userId === user.id)) {
      setSelectedUsers([...selectedUsers, { userId: user.id, name: user.name }]);
    }
    setUserSearchTerm('');
    setShowUserDropdown(false);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.userId !== userId));
  };

  const updateUserDisplayName = (userId: string, name: string) => {
    setSelectedUsers(selectedUsers.map(u => 
      u.userId === userId ? { ...u, name } : u
    ));
  };

  const filteredAvailableUsers = availableUsers.filter(user => 
    !selectedUsers.find(selected => selected.userId === user.id) &&
    (user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.employeeCode?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      errors.endTime = 'End time must be after start time';
    }

    if (formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS) {
      const validOptions = options.filter(option => option.name.trim());
      if (validOptions.length < 2) {
        errors.options = 'At least 2 options are required';
      }
    } else if (formData.votingOptionType === VotingOptionType.USER_SPECIFIC) {
      if (selectedUsers.length < 2) {
        errors.userOptions = 'Please select at least 2 users';
      }
    } else if (formData.votingOptionType === VotingOptionType.CATEGORY_BASED) {
      if (selectedOptionCategories.length === 0) {
        errors.optionCategories = 'Please select at least one category for voting options';
      } else if (categoryUserPreview && !categoryUserPreview.preview.canCreatePoll) {
        errors.optionCategories = 'At least 2 users must exist in the selected categories';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poll || !validateForm()) {
      return;
    }

    try {
      const updateData: UpdateVoteRequest = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        resultDisplayTime: formData.resultDisplayTime || undefined,
        votingOptionType: formData.votingOptionType,
      };

      if (formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS) {
        updateData.options = options
          .filter(option => option.name.trim())
          .map(option => ({
            ...(option.id && !option.isNew ? { id: option.id } : {}), // Include ID for existing options
            name: option.name.trim(),
            imageUrl: option.imageUrl.trim() || undefined
          }));
      } else if (formData.votingOptionType === VotingOptionType.USER_SPECIFIC) {
        updateData.userOptions = selectedUsers;
      } else if (formData.votingOptionType === VotingOptionType.CATEGORY_BASED) {
        updateData.optionCategories = selectedOptionCategories;
      }

      await updateVote(poll.id, updateData);
      onSuccess();
      handleClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  if (!isOpen || !poll) return null;

  const canEdit = poll.status === 'UPCOMING' || poll.totalVotes === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Poll</h2>
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

          {!canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-700 text-sm">
                <p className="font-medium">Limited editing available</p>
                <p>This poll has votes or is active. Some fields may not be editable.</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poll Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter poll title"
                disabled={!canEdit}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter poll description"
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poll Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as VoteType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  <option value={VoteType.SINGLE_CHOICE}>Single Choice</option>
                  <option value={VoteType.MULTI_CHOICE}>Multiple Choice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voting Option Type
                </label>
                <select
                  value={formData.votingOptionType}
                  onChange={(e) => {
                    const newType = e.target.value as VotingOptionType;
                    setFormData({ ...formData, votingOptionType: newType });
                    if (newType === VotingOptionType.USER_SPECIFIC && availableUsers.length === 0) {
                      fetchAvailableUsers();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  <option value={VotingOptionType.CATEGORY_BASED}>Category-Based (Custom Options)</option>
                  <option value={VotingOptionType.USER_SPECIFIC}>User-Specific (Vote for Users)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  validationErrors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!canEdit}
              />
              {validationErrors.startTime && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  validationErrors.endTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!canEdit}
              />
              {validationErrors.endTime && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result Display Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.resultDisplayTime}
              onChange={(e) => setFormData({ ...formData, resultDisplayTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>

          {/* Voting Options */}
          {formData.votingOptionType === VotingOptionType.CATEGORY_BASED ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Poll Options *
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        placeholder={`Option ${index + 1} name`}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!canEdit}
                      />
                      <input
                        type="url"
                        value={option.imageUrl}
                        onChange={(e) => updateOption(index, 'imageUrl', e.target.value)}
                        placeholder="Image URL (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!canEdit}
                      />
                    </div>
                    {canEdit && options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {validationErrors.options && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.options}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Selected Users for Voting *
                </label>
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} users selected
                </span>
              </div>

              {canEdit && (
                <div className="relative mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="Search users to add..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* User Dropdown */}
                  {showUserDropdown && userSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAvailableUsers.length > 0 ? (
                        filteredAvailableUsers.map((user) => (
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
                                <Users className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">
                                {user.employeeCode} • {user.department}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500">
                          No users found matching "{userSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Users */}
              <div className="space-y-3">
                {selectedUsers.map((userOption) => {
                  const user = availableUsers.find(u => u.id === userOption.userId);
                  return (
                    <div key={userOption.userId} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{user?.name || userOption.userId}</p>
                          {user && (
                            <p className="text-sm text-gray-500">
                              {user.employeeCode} • {user.department}
                            </p>
                          )}
                        </div>
                        <input
                          type="text"
                          value={userOption.name || user?.name || ''}
                          onChange={(e) => updateUserDisplayName(userOption.userId, e.target.value)}
                          placeholder="Custom display name (optional)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={!canEdit}
                        />
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeSelectedUser(userOption.userId)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {validationErrors.userOptions && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.userOptions}</p>
              )}

              {selectedUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No users selected</p>
                  {canEdit && (
                    <p className="text-sm">Search and select users above to add them as voting options</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading || !canEdit}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Poll'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPollModal;