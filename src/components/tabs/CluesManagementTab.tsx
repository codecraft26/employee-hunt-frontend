// components/tabs/CluesManagementTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Target, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTreasureHunts, TreasureHuntClue } from '../../hooks/useTreasureHunts';

interface CluesManagementTabProps {
  treasureHuntId: string;
  onBack: () => void;
}

const CluesManagementTab: React.FC<CluesManagementTabProps> = ({ 
  treasureHuntId, 
  onBack 
}) => {
  const { 
    fetchTreasureHuntWithClues, 
    addClue, 
    updateClue, 
    deleteClue,
    currentTreasureHuntWithClues,
    loading, 
    error, 
    clearError 
  } = useTreasureHunts();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    clue: TreasureHuntClue | null;
  }>({
    isOpen: false,
    clue: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clue: TreasureHuntClue | null;
  }>({
    isOpen: false,
    clue: null
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    stageNumber: 1,
    description: ''
  });

  // Fetch treasure hunt with clues on component mount
  useEffect(() => {
    if (treasureHuntId) {
      fetchTreasureHuntWithClues(treasureHuntId);
    }
  }, [treasureHuntId, fetchTreasureHuntWithClues]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'NOT_STARTED': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleAddClue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      return;
    }

    try {
      await addClue(treasureHuntId, {
        clueNumber: formData.stageNumber,
        stageNumber: formData.stageNumber,
        description: formData.description.trim()
      });
      
      setSuccessMessage('Stage added successfully!');
      setIsAddModalOpen(false);
      setFormData({ stageNumber: 1, description: '' });
    } catch (error) {
      console.error('Failed to add stage:', error);
    }
  };

  const handleEditClue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editModal.clue || !formData.description.trim()) {
      return;
    }

    try {
      await updateClue(treasureHuntId, editModal.clue.id, {
        stageNumber: formData.stageNumber,
        description: formData.description.trim()
      });
      
      setSuccessMessage('Stage updated successfully!');
      setEditModal({ isOpen: false, clue: null });
      setFormData({ stageNumber: 1, description: '' });
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const handleDeleteClue = async () => {
    if (!deleteModal.clue) return;

    try {
      await deleteClue(treasureHuntId, deleteModal.clue.id);
      setSuccessMessage('Stage deleted successfully!');
      setDeleteModal({ isOpen: false, clue: null });
    } catch (error) {
      console.error('Failed to delete stage:', error);
    }
  };

  const handleEdit = (clue: TreasureHuntClue) => {
    setEditModal({
      isOpen: true,
      clue
    });
    setFormData({
      stageNumber: clue.stageNumber,
      description: clue.description
    });
  };

  const handleDelete = (clue: TreasureHuntClue) => {
    setDeleteModal({
      isOpen: true,
      clue
    });
  };

  // Use clues array since that's what the API returns
  const clues = currentTreasureHuntWithClues?.clues || [];

  if (loading && !currentTreasureHuntWithClues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading treasure hunt stages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Treasure Hunts
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Stages: {currentTreasureHuntWithClues?.title}
          </h2>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stage</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Stages List */}
      {clues.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stages yet</h3>
          <p className="text-gray-500 mb-6">
            {currentTreasureHuntWithClues 
              ? `This treasure hunt "${currentTreasureHuntWithClues.title}" doesn't have any stages yet.`
              : 'Loading treasure hunt data...'
            }
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add First Stage
          </button>
          
          {/* Show treasure hunt info if available */}
          {currentTreasureHuntWithClues && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Treasure Hunt Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Title:</strong> {currentTreasureHuntWithClues.title}</p>
                <p><strong>Description:</strong> {currentTreasureHuntWithClues.description}</p>
                <p><strong>Status:</strong> {currentTreasureHuntWithClues.status}</p>
                <p><strong>Teams:</strong> {currentTreasureHuntWithClues.assignedTeams?.length || 0}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clues.map((clue) => (
            <div key={clue.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        Stage {clue.stageNumber}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(clue.status)}`}>
                        {getStatusIcon(clue.status)}
                        <span className="ml-1">{clue.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-700">{clue.description}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(clue)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(clue)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {clue.adminFeedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Admin Feedback:</strong> {clue.adminFeedback}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Created: {new Date(clue.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Stage Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Stage</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddClue} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.stageNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, stageNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe what teams need to find or do for this stage..."
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stage Modal */}
      {editModal.isOpen && editModal.clue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Stage</h3>
              <button
                onClick={() => setEditModal({ isOpen: false, clue: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditClue} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.stageNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, stageNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe what teams need to find or do for this stage..."
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, clue: null })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Stage Modal */}
      {deleteModal.isOpen && deleteModal.clue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Stage</h3>
              <button
                onClick={() => setDeleteModal({ isOpen: false, clue: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete Stage {deleteModal.clue.stageNumber}?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. Any submissions for this stage will also be deleted.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, clue: null })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClue}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CluesManagementTab;