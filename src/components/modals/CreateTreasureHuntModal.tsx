// components/modals/CreateTreasureHuntModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useTeams } from '../../hooks/useTeams';

interface CreateTreasureHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (treasureHunt: any) => void;
}

const CreateTreasureHuntModal: React.FC<CreateTreasureHuntModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createTreasureHunt, loading: huntLoading, error: huntError } = useTreasureHunts();
  const { teams, fetchTeams, loading: teamsLoading } = useTeams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    teamIds: [] as string[],
    stages: [
      { stageNumber: 1, description: '' }
    ]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teams when modal opens
  useEffect(() => {
    if (isOpen && teams.length === 0) {
      fetchTeams();
    }
  }, [isOpen, teams.length, fetchTeams]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        teamIds: [],
        stages: [
          { stageNumber: 1, description: '' }
        ]
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const now = new Date();

      if (startDate <= now) {
        newErrors.startTime = 'Start time must be in the future';
      }

      if (endDate <= startDate) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.teamIds.length === 0) {
      newErrors.teams = 'At least one team must be selected';
    }

    if (formData.stages.length === 0) {
      newErrors.stages = 'At least one stage must be added';
    } else {
      // Validate each stage
      formData.stages.forEach((stage, index) => {
        if (!stage.description.trim()) {
          newErrors[`stage_${index}`] = `Stage ${index + 1} description is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, description: value } : stage
      )
    }));

    // Clear stage-specific error
    if (errors[`stage_${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`stage_${index}`]: ''
      }));
    }
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [
        ...prev.stages,
        { stageNumber: prev.stages.length + 1, description: '' }
      ]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.stages.length <= 1) return; // Don't allow removing the last stage

    setFormData(prev => ({
      ...prev,
      stages: prev.stages
        .filter((_, i) => i !== index)
        .map((stage, i) => ({ ...stage, stageNumber: i + 1 }))
    }));

    // Clear any errors for stages that were renumbered
    setErrors(prev => {
      const newErrors = { ...prev };
      formData.stages.forEach((_, i) => {
        if (i >= index) {
          delete newErrors[`stage_${i}`];
        }
      });
      return newErrors;
    });
  };

  const handleTeamSelection = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));

    // Clear team selection error
    if (errors.teams) {
      setErrors(prev => ({
        ...prev,
        teams: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const treasureHunt = await createTreasureHunt({
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        teamIds: formData.teamIds,
        stages: formData.stages.map(stage => ({
          stageNumber: stage.stageNumber,
          description: stage.description.trim()
        }))
      });

      if (treasureHunt) {
        onSuccess?.(treasureHunt);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create treasure hunt:', error);
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Treasure Hunt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {huntError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Creating Treasure Hunt</h3>
                <p className="text-sm text-red-700 mt-1">{huntError}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter treasure hunt title..."
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the treasure hunt..."
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                min={formData.startTime || getMinDateTime()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users className="h-4 w-4 inline mr-1" />
              Assign Teams * ({formData.teamIds.length} selected)
            </label>
            
            {teamsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-gray-500 mt-2">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No teams available</p>
                <p className="text-sm text-gray-400">Create teams first to assign them to treasure hunts</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.teamIds.includes(team.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => handleTeamSelection(team.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.teamIds.includes(team.id)}
                        onChange={() => handleTeamSelection(team.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-500">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.teams && (
              <p className="text-red-500 text-sm mt-1">{errors.teams}</p>
            )}
          </div>

          {/* Stages/Clues Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Stages/Clues * ({formData.stages.length} stage{formData.stages.length !== 1 ? 's' : ''})
              </label>
              <button
                type="button"
                onClick={addStage}
                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stage
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {formData.stages.map((stage, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {stage.stageNumber}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Stage {stage.stageNumber}
                      </span>
                    </div>
                    <textarea
                      value={stage.description}
                      onChange={(e) => handleStageChange(index, e.target.value)}
                      placeholder={`Describe what participants need to find or do in stage ${stage.stageNumber}...`}
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                        errors[`stage_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors[`stage_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}`]}</p>
                    )}
                  </div>
                  {formData.stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStage(index)}
                      className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors mt-2"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.stages && (
              <p className="text-red-500 text-sm mt-1">{errors.stages}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || teamsLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creating...' : 'Create Treasure Hunt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTreasureHuntModal;