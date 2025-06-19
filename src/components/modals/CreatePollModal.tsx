// components/modals/CreatePollModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, AlertCircle, Building2, Upload, Trash2, Eye } from 'lucide-react';
import { VoteType, CreateVoteRequest } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';
import { useCategories } from '../../hooks/useCategories';
import S3Image from '../shared/S3Image';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PollOption {
  name: string;
  imageFile: File | null;
  imagePreview: string | null;
}

type CategoryType = 'ALL' | 'SPECIFIC';

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createVote, loading, error } = useVotes();
  const { categories, fetchCategories } = useCategories();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: VoteType.SINGLE_CHOICE,
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    categoryType: 'ALL' as CategoryType,
    allowedCategories: [] as string[]
  });

  const [options, setOptions] = useState<PollOption[]>([
    { name: '', imageFile: null, imagePreview: null },
    { name: '', imageFile: null, imagePreview: null }
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const addOption = () => {
    setOptions([...options, { name: '', imageFile: null, imagePreview: null }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Clean up image preview URLs
      if (options[index].imagePreview) {
        URL.revokeObjectURL(options[index].imagePreview!);
      }
      setOptions(newOptions);
    }
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const updateOptionImage = (index: number, file: File | null) => {
    const newOptions = [...options];
    
    // Clean up previous preview URL
    if (newOptions[index].imagePreview) {
      URL.revokeObjectURL(newOptions[index].imagePreview!);
    }
    
    newOptions[index].imageFile = file;
    newOptions[index].imagePreview = file ? URL.createObjectURL(file) : null;
    setOptions(newOptions);
  };

  const removeOptionImage = (index: number) => {
    updateOptionImage(index, null);
  };

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

    const validOptions = options.filter(option => option.name.trim());
    if (validOptions.length < 2) {
      errors.options = 'At least 2 options are required';
    }

    // Validate image files (optional but if provided, should be valid images)
    options.forEach((option, index) => {
      if (option.imageFile) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (option.imageFile.size > maxSize) {
          errors[`option_image_${index}`] = 'Image size should be less than 5MB';
        }
        if (!option.imageFile.type.startsWith('image/')) {
          errors[`option_image_${index}`] = 'Only image files are allowed';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add basic form fields
      formDataToSubmit.append('title', formData.title);
      if (formData.description) {
        formDataToSubmit.append('description', formData.description);
      }
      formDataToSubmit.append('type', formData.type);
      formDataToSubmit.append('startTime', formData.startTime);
      formDataToSubmit.append('endTime', formData.endTime);
      if (formData.resultDisplayTime) {
        formDataToSubmit.append('resultDisplayTime', formData.resultDisplayTime);
      }
      formDataToSubmit.append('categoryType', formData.categoryType);
      
      if (formData.categoryType === 'SPECIFIC' && formData.allowedCategories.length > 0) {
        formDataToSubmit.append('allowedCategories', JSON.stringify(formData.allowedCategories));
      }

      // Add option names as JSON array
      const optionNames = options
        .filter(option => option.name.trim())
        .map(option => option.name.trim());
      formDataToSubmit.append('optionNames', JSON.stringify(optionNames));

      // Add option images
      options.forEach((option, index) => {
        if (option.imageFile && option.name.trim()) {
          formDataToSubmit.append('optionImages', option.imageFile);
        }
      });

      await createVote(formDataToSubmit);
      onSuccess();
      handleClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    // Clean up image preview URLs
    options.forEach(option => {
      if (option.imagePreview) {
        URL.revokeObjectURL(option.imagePreview);
      }
    });
    
    setFormData({
      title: '',
      description: '',
      type: VoteType.SINGLE_CHOICE,
      startTime: '',
      endTime: '',
      resultDisplayTime: '',
      categoryType: 'ALL' as CategoryType,
      allowedCategories: []
    });
    setOptions([
      { name: '', imageFile: null, imagePreview: null },
      { name: '', imageFile: null, imagePreview: null }
    ]);
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Type
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

          {/* Options */}
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

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Option {index + 1}</h4>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOptionName(index, e.target.value)}
                        placeholder={`Option ${index + 1} name`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option Image (Optional)
                      </label>
                      
                      {option.imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={option.imagePreview}
                            alt={`Option ${index + 1} preview`}
                            className="w-150 h-100 rounded-lg object-cover border border-gray-200"
                            style={{ width: '150px', height: '100px' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateOptionImage(index, file);
                              }
                            }}
                            className="hidden"
                            id={`option-image-${index}`}
                          />
                          <label
                            htmlFor={`option-image-${index}`}
                            className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                          >
                            Click to upload image
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                      
                      {validationErrors[`option_image_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors[`option_image_${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {validationErrors.options && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.options}</p>
            )}
          </div>

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
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;