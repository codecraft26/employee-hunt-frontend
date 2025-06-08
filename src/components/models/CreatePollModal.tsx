// components/modals/CreatePollModal.tsx
import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { VoteType, CreateVoteRequest } from '../../types/votes';
import { useVotes } from '../../hooks/useVotes';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PollOption {
  name: string;
  imageUrl: string;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createVote, loading, error } = useVotes();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: VoteType.SINGLE_CHOICE,
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
  });

  const [options, setOptions] = useState<PollOption[]>([
    { name: '', imageUrl: '' },
    { name: '', imageUrl: '' }
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    const validOptions = options.filter(option => option.name.trim());
    if (validOptions.length < 2) {
      errors.options = 'At least 2 options are required';
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
      const voteData: CreateVoteRequest = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        resultDisplayTime: formData.resultDisplayTime || undefined,
        options: options
          .filter(option => option.name.trim())
          .map(option => ({
            name: option.name.trim(),
            imageUrl: option.imageUrl.trim() || undefined
          }))
      };

      await createVote(voteData);
      onSuccess();
      handleClose();
    } catch (err) {
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
    });
    setOptions([
      { name: '', imageUrl: '' },
      { name: '', imageUrl: '' }
    ]);
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                    />
                    <input
                      type="url"
                      value={option.imageUrl}
                      onChange={(e) => updateOption(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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