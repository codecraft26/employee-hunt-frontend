// components/modals/CreatePollModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, AlertCircle, Building2, Users, Search, UserCheck, Eye, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { VoteType, CreateVoteRequest, VotingOptionType, UserVoteOption, AvailableUser, UsersByCategoriesResponse } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import { useCategories } from '../../hooks/useCategories';
import { useModalBodyLock } from '../../hooks/useModalBodyLock';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PollOption {
  name: string;
  imageUrl: string;
}

type CategoryType = 'ALL' | 'SPECIFIC';

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSuccess }) => {
  useModalBodyLock(isOpen);
  const { createVote, getAvailableUsers, getUsersByCategories, getAllUsers, loading, error } = useVotes();
  const { categories, fetchCategories } = useCategories();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: VoteType.SINGLE_CHOICE,
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    categoryType: 'ALL' as CategoryType,
    allowedCategories: [] as string[],
    votingOptionType: VotingOptionType.USER_SPECIFIC
  });

  // For custom text options
  const [options, setOptions] = useState<PollOption[]>([
    { name: '', imageUrl: '' },
    { name: '', imageUrl: '' }
  ]);

  // For user-specific polls
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserVoteOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // For category-based polls (auto from categories)
  const [selectedOptionCategories, setSelectedOptionCategories] = useState<string[]>([]);
  const [categoryUserPreview, setCategoryUserPreview] = useState<UsersByCategoriesResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // For custom options - user reference
  const [allUsers, setAllUsers] = useState<AvailableUser[]>([]);
  const [showUsersReference, setShowUsersReference] = useState(false);
  const [userReferenceSearch, setUserReferenceSearch] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('🔓 CREATE POLL MODAL OPENED');
      console.log('📊 Initial form data:', formData);
      console.log('🎯 Voting option type:', formData.votingOptionType);
      
      fetchCategories();
      if (formData.votingOptionType === VotingOptionType.USER_SPECIFIC) {
        console.log('👥 Fetching users for USER_SPECIFIC poll...');
        fetchAvailableUsers();
      } else if (formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS) {
        console.log('📝 Fetching users for CUSTOM_OPTIONS reference...');
        fetchAllUsersForReference();
      }
    }
  }, [isOpen, fetchCategories]);

  // Fetch available users when categories change for USER_SPECIFIC polls
  useEffect(() => {
    if (formData.votingOptionType === VotingOptionType.USER_SPECIFIC) {
      fetchAvailableUsers();
    }
  }, [formData.categoryType, formData.allowedCategories, formData.votingOptionType]);

  // Preview users when categories change for CATEGORY_USER_BASED polls
  useEffect(() => {
    if (formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED && selectedOptionCategories.length > 0) {
      previewCategoryUsers();
    } else {
      setCategoryUserPreview(null);
    }
  }, [selectedOptionCategories, formData.votingOptionType]);

  // Fetch all users for reference when creating custom text polls
  const fetchAllUsersForReference = async () => {
    try {
      console.log('🔍 CreatePollModal: Fetching all users for reference...');
      const users = await getAllUsers();
      if (users) {
        console.log('✅ CreatePollModal: Successfully fetched users:', users.length);
        setAllUsers(users);
      } else {
        console.warn('⚠️ CreatePollModal: getAllUsers returned null');
      }
    } catch (err) {
      console.error('❌ CreatePollModal: Failed to fetch all users for reference:', err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log('🔍 CreatePollModal: Fetching available users for USER_SPECIFIC voting...');
      console.log('📊 Form data:', {
        categoryType: formData.categoryType,
        allowedCategories: formData.allowedCategories,
        votingOptionType: formData.votingOptionType
      });

      const params = formData.categoryType === 'SPECIFIC' && formData.allowedCategories.length > 0
        ? { categoryIds: formData.allowedCategories }
        : undefined;
      
      console.log('📋 API params:', params);
      
      const users = await getAvailableUsers(params);
      if (users) {
        console.log('✅ CreatePollModal: Successfully fetched available users:', users.length);
        setAvailableUsers(users);
      } else {
        console.warn('⚠️ CreatePollModal: getAvailableUsers returned null');
        setAvailableUsers([]);
      }
    } catch (err) {
      console.error('❌ CreatePollModal: Failed to fetch available users:', err);
      setAvailableUsers([]);
    }
  };

  const previewCategoryUsers = async () => {
    setPreviewLoading(true);
    try {
      const response = await getUsersByCategories({ categoryIds: selectedOptionCategories });
      setCategoryUserPreview(response);
    } catch (err) {
      console.error('Failed to preview category users:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const addOption = () => {
    setOptions([...options, { name: '', imageUrl: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof PollOption, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
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

  const handleOptionCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedOptionCategories, categoryId]
      : selectedOptionCategories.filter(id => id !== categoryId);
    setSelectedOptionCategories(newCategories);
  };

  const filteredAvailableUsers = availableUsers.filter(user => 
    !selectedUsers.find(selected => selected.userId === user.id) &&
    (user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.employeeCode?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  // Filter users for reference display
  const filteredReferenceUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(userReferenceSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userReferenceSearch.toLowerCase()) ||
    user.employeeCode?.toLowerCase().includes(userReferenceSearch.toLowerCase()) ||
    user.department?.toLowerCase().includes(userReferenceSearch.toLowerCase())
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

    if (formData.categoryType === 'SPECIFIC' && formData.allowedCategories.length === 0) {
      errors.categories = 'Please select at least one category';
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
    } else if (formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED) {
      if (selectedOptionCategories.length === 0) {
        errors.optionCategories = 'Please select at least one category for voting options';
      } else if (!categoryUserPreview) {
        errors.optionCategories = 'Loading users from categories... Please wait';
      } else if (!categoryUserPreview.preview.canCreatePoll) {
        errors.optionCategories = 'At least 2 users must exist in the selected categories';
      } else if (!categoryUserPreview.data || categoryUserPreview.data.length === 0) {
        errors.optionCategories = 'No users found in selected categories';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 CREATE POLL: Form submitted');
    console.log('📊 Form Data:', formData);
    console.log('👥 Selected Users:', selectedUsers);
    console.log('🏢 Selected Categories:', selectedOptionCategories);
    console.log('📝 Options:', options);
    
    const validationResult = validateForm();
    console.log('✅ Validation Result:', validationResult);
    console.log('❌ Validation Errors:', validationErrors);
    
    if (!validationResult) {
      console.log('❌ CREATE POLL: Validation failed, stopping submission');
      return;
    }

    try {
      console.log('📤 CREATE POLL: Preparing vote data...');
      
      const voteData: CreateVoteRequest = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        resultDisplayTime: formData.resultDisplayTime || undefined,
        categoryType: formData.categoryType,
        allowedCategories: formData.categoryType === 'SPECIFIC' ? formData.allowedCategories : undefined,
        votingOptionType: formData.votingOptionType,
      };

      if (formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS) {
        voteData.options = options
          .filter(option => option.name.trim())
          .map(option => ({
            name: option.name.trim()
          }));
        console.log('📝 Custom Options:', voteData.options);
      } else if (formData.votingOptionType === VotingOptionType.USER_SPECIFIC) {
        voteData.userOptions = selectedUsers;
        console.log('👥 User Options:', voteData.userOptions);
      } else if (formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED) {
        // For category-user-based polls, send selected categories and the users become options
        voteData.optionCategories = selectedOptionCategories;
        console.log('🏢 Category Options:', voteData.optionCategories);
      }

      console.log('📤 Final Vote Data:', voteData);
      console.log('🔄 CREATE POLL: Calling createVote...');
      
      const result = await createVote(voteData);
      console.log('✅ CREATE POLL: Success!', result);
      
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('❌ CREATE POLL: Error occurred:', err);
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: VoteType.SINGLE_CHOICE,
      startTime: '',
      endTime: '',
      resultDisplayTime: '',
      categoryType: 'ALL' as CategoryType,
      allowedCategories: [],
      votingOptionType: VotingOptionType.USER_SPECIFIC
    });
    setOptions([
      { name: '', imageUrl: '' },
      { name: '', imageUrl: '' }
    ]);
    setSelectedUsers([]);
    setSelectedOptionCategories([]);
    setCategoryUserPreview(null);
    setAllUsers([]);
    setShowUsersReference(false);
    setUserReferenceSearch('');
    setUserSearchTerm('');
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Poll</h2>
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
                    // Reset relevant state when changing type
                    if (newType !== VotingOptionType.USER_SPECIFIC) {
                      setSelectedUsers([]);
                    }
                    if (newType !== VotingOptionType.CATEGORY_USER_BASED) {
                      setSelectedOptionCategories([]);
                      setCategoryUserPreview(null);
                    }
                    if (newType !== VotingOptionType.CUSTOM_OPTIONS) {
                      setAllUsers([]);
                      setShowUsersReference(false);
                      setUserReferenceSearch('');
                    }
                    // Fetch users when switching to different types
                    if (newType === VotingOptionType.USER_SPECIFIC) {
                      fetchAvailableUsers();
                    } else if (newType === VotingOptionType.CUSTOM_OPTIONS) {
                      fetchAllUsersForReference();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={VotingOptionType.USER_SPECIFIC}>User-Specific (Manual Selection)</option>
                  <option value={VotingOptionType.CATEGORY_USER_BASED}>Category-Based (Auto from Categories)</option>
                  <option value={VotingOptionType.CUSTOM_OPTIONS}>Custom Options (Write Text Options)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.votingOptionType === VotingOptionType.USER_SPECIFIC && 'Manually select specific users as voting options'}
                  {formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED && 'All users from selected categories become voting options automatically'}
                  {formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS && 'Create custom text-based options'}
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who Can Vote
              </label>
              <select
                value={formData.categoryType}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  categoryType: e.target.value as CategoryType,
                  allowedCategories: e.target.value === 'ALL' ? [] : formData.allowedCategories
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">All Categories</option>
                <option value="SPECIFIC">Specific Categories</option>
              </select>
            </div>

            {formData.categoryType === 'SPECIFIC' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Categories *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.allowedCategories.includes(category.id)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...formData.allowedCategories, category.id]
                            : formData.allowedCategories.filter(id => id !== category.id);
                          setFormData({ ...formData, allowedCategories: newCategories });
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.categories && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.categories}</p>
                )}
              </div>
            )}
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
            />
            <p className="text-sm text-gray-500 mt-1">
              When results should be displayed to users. Leave empty to show results immediately after poll ends.
            </p>
          </div>

          {/* Voting Options */}
          {formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Poll Options *
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        placeholder={`Option ${index + 1} name`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    {options.length > 2 && (
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

              {/* User Reference Section for Custom Options */}
              {allUsers.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setShowUsersReference(!showUsersReference)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <Users className="h-4 w-4" />
                      <span>Available Users for Reference ({allUsers.length})</span>
                      {showUsersReference ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {showUsersReference && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={userReferenceSearch}
                          onChange={(e) => setUserReferenceSearch(e.target.value)}
                          placeholder="Search users by name, email, employee code, or department..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {filteredReferenceUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            {user.profileImage ? (
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
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.employeeCode} • {user.department}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                              {user.categories && user.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.categories.slice(0, 2).map((category) => (
                                    <span key={category.id} className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                      {category.name}
                                    </span>
                                  ))}
                                  {user.categories.length > 2 && (
                                    <span className="text-xs text-gray-400">+{user.categories.length - 2} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredReferenceUsers.length === 0 && userReferenceSearch && (
                        <div className="text-center py-4 text-gray-500">
                          <p>No users found matching "{userReferenceSearch}"</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                        💡 <strong>Tip:</strong> Use this user list as reference to create meaningful custom options. 
                        For example, seeing "John (Developer)" might inspire you to create an option called "Best Coder" or "Technical Excellence".
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {formData.votingOptionType === VotingOptionType.USER_SPECIFIC && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Users for Voting *
                </label>
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} users selected
                </span>
              </div>

              {/* User Search */}
              <div className="relative mb-4">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearchTerm('');
                      setShowUserDropdown(true);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Show All</span>
                  </button>
                </div>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {availableUsers.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p>Loading users...</p>
                        </div>
                      </div>
                    ) : filteredAvailableUsers.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-sm text-gray-600">
                            {filteredAvailableUsers.length} users available
                            {userSearchTerm && ` matching "${userSearchTerm}"`}
                          </p>
                        </div>
                        {filteredAvailableUsers.map((user) => (
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
                        ))}
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

              {/* Selected Users */}
              <div className="space-y-3">
                {selectedUsers.map((userOption, index) => {
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
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">
                            {user?.employeeCode} • {user?.department}
                          </p>
                        </div>
                        <input
                          type="text"
                          value={userOption.name || user?.name || ''}
                          onChange={(e) => updateUserDisplayName(userOption.userId, e.target.value)}
                          placeholder="Custom display name (optional)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(userOption.userId)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
                  <p>No users selected yet</p>
                  <p className="text-sm">Search and select users above to add them as voting options</p>
                </div>
              )}
            </div>
          )}

          {formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Categories for Voting Options *
                </label>
                {categoryUserPreview && (
                  <span className="text-sm text-gray-500">
                    {categoryUserPreview.preview.totalUsers} users will become options
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 mb-4">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedOptionCategories.includes(category.id)}
                      onChange={(e) => handleOptionCategoryChange(category.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>

              {validationErrors.optionCategories && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.optionCategories}</p>
              )}

              {/* Category User Preview */}
              {selectedOptionCategories.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Preview Voting Options</h4>
                  </div>

                  {previewLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading preview...</p>
                    </div>
                  ) : categoryUserPreview ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          {categoryUserPreview.message}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {categoryUserPreview.data.map((user) => (
                          <div key={user.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
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
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.employeeCode} • {user.department}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {selectedOptionCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No categories selected</p>
                  <p className="text-sm">Select categories above to preview users who will become voting options</p>
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={() => {
                console.log('🔘 CREATE POLL BUTTON CLICKED');
                console.log('🔄 Loading state:', loading);
                console.log('📊 Current form data:', formData);
              }}
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>

          {/* Debug Panel - Remove this in production */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Debug Info:</h4>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const startTime = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
                  const endTime = new Date(now.getTime() + 24 * 60 * 60000); // 24 hours from now
                  
                  setFormData({
                    ...formData,
                    title: 'Test Poll - ' + new Date().toLocaleTimeString(),
                    description: 'This is a test poll created for debugging',
                    startTime: startTime.toISOString().slice(0, 16),
                    endTime: endTime.toISOString().slice(0, 16),
                  });
                  
                  if (formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS) {
                    setOptions([
                      { name: 'Option 1', imageUrl: '' },
                      { name: 'Option 2', imageUrl: '' }
                    ]);
                  }
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Fill Test Data
              </button>
            </div>
            <div className="space-y-1 text-gray-600">
              <div>Title: {formData.title || 'Empty'}</div>
              <div>Voting Type: {formData.votingOptionType}</div>
              <div>Start Time: {formData.startTime || 'Empty'}</div>
              <div>End Time: {formData.endTime || 'Empty'}</div>
              {formData.votingOptionType === VotingOptionType.USER_SPECIFIC && (
                <div>Selected Users: {selectedUsers.length}</div>
              )}
              {formData.votingOptionType === VotingOptionType.CATEGORY_USER_BASED && (
                <>
                  <div>Selected Categories: {selectedOptionCategories.length}</div>
                  <div>Category Preview: {categoryUserPreview ? 'Loaded' : 'Not loaded'}</div>
                  <div>Preview Users: {categoryUserPreview?.data?.length || 0}</div>
                  <div>Can Create Poll: {categoryUserPreview?.preview?.canCreatePoll ? 'Yes' : 'No'}</div>
                </>
              )}
              {formData.votingOptionType === VotingOptionType.CUSTOM_OPTIONS && (
                <div>Custom Options: {options.filter(opt => opt.name.trim()).length}</div>
              )}
              <div>Available Users: {availableUsers.length}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
              {Object.keys(validationErrors).length > 0 && (
                <div className="text-red-600">
                  Validation Errors: {Object.keys(validationErrors).join(', ')}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;