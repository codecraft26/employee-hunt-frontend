// components/modals/CreateTreasureHuntModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, Target, Plus, Trash2 } from 'lucide-react';
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
      {
        stageNumber: 1,
        description: ''
      }
    ] as Array<{ stageNumber: number; description: string }>,
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
          {
            stageNumber: 1,
            description: ''
          }
        ],
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

    // Validate stages
    if (formData.stages.length === 0) {
      newErrors.stages = 'At least one stage is required';
    } else {
      formData.stages.forEach((stage, index) => {
        if (!stage.description.trim()) {
          newErrors[`stage-${index}`] = 'Stage description is required';
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

  const handleStageChange = (index: number, field: 'stageNumber' | 'description', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      )
    }));

    // Clear stage error when user starts typing
    if (errors[`stage-${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`stage-${index}`]: ''
      }));
    }
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [
        ...prev.stages,
        {
          stageNumber: prev.stages.length + 1,
          description: ''
        }
      ]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.stages.length <= 1) return; // Keep at least one stage
    
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index).map((stage, i) => ({
        ...stage,
        stageNumber: i + 1
      }))
    }));
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{huntError}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hunt Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter treasure hunt title"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the treasure hunt..."
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              min={formData.startTime || getMinDateTime()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.endTime ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>

          {/* Stages Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Stages *
              </label>
              <button
                type="button"
                onClick={addStage}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Stage</span>
              </button>
            </div>
            
            {errors.stages && (
              <p className="text-red-500 text-sm mb-3">{errors.stages}</p>
            )}

            <div className="space-y-4">
              {formData.stages.map((stage, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Stage {stage.stageNumber}</h4>
                    {formData.stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stage Number
                      </label>
                      <input
                        type="number"
                        value={stage.stageNumber}
                        onChange={(e) => handleStageChange(index, 'stageNumber', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={stage.description}
                        onChange={(e) => handleStageChange(index, 'description', e.target.value)}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors[`stage-${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe what teams need to find or do for this stage..."
                        required
                      />
                      {errors[`stage-${index}`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`stage-${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign Teams *
            </label>
            
            {teamsLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <p className="text-gray-500 mt-2">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No teams available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.teamIds.includes(team.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.teamIds.includes(team.id)}
                      onChange={() => handleTeamSelection(team.id)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                      formData.teamIds.includes(team.id)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.teamIds.includes(team.id) && (
                        <div className="w-2 h-2 bg-white rounded"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-500">
                        {team.members?.length || 0} members
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {errors.teams && (
              <p className="text-red-500 text-sm mt-2">{errors.teams}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || huntLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Treasure Hunt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTreasureHuntModal;