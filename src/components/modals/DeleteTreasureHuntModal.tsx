// components/modals/DeleteTreasureHuntModal.tsx
import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useTreasureHunts, TreasureHunt } from '../../hooks/useTreasureHunts';

interface DeleteTreasureHuntModalProps {
  isOpen: boolean;
  treasureHunt: TreasureHunt | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteTreasureHuntModal: React.FC<DeleteTreasureHuntModalProps> = ({
  isOpen,
  treasureHunt,
  onClose,
  onSuccess
}) => {
  const { deleteTreasureHunt, loading, error } = useTreasureHunts();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!treasureHunt || confirmText !== treasureHunt.title) {
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteTreasureHunt(treasureHunt.id);
      if (success) {
        onSuccess?.();
        onClose();
        setConfirmText('');
      }
    } catch (error) {
      console.error('Failed to delete treasure hunt:', error);
      // Error is handled by the hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  const isConfirmationValid = confirmText === treasureHunt?.title;
  const canDelete = treasureHunt?.status === 'UPCOMING' || treasureHunt?.status === 'COMPLETED';

  if (!isOpen || !treasureHunt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Treasure Hunt</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeleting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. This will permanently delete the treasure hunt 
                  "{treasureHunt.title}" and all associated data including clues and submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Status Check */}
          {!canDelete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Cannot Delete</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Active treasure hunts cannot be deleted. Please change the status to 
                    "COMPLETED" or "UPCOMING" before deleting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hunt Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Treasure Hunt Details:</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm font-medium text-gray-900">{treasureHunt.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  treasureHunt.status === 'ACTIVE' || treasureHunt.status === 'IN_PROGRESS' 
                    ? 'text-green-600' 
                    : treasureHunt.status === 'COMPLETED'
                    ? 'text-blue-600'
                    : 'text-orange-600'
                }`}>
                  {treasureHunt.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Teams:</span>
                <span className="text-sm font-medium text-gray-900">
                  {treasureHunt.assignedTeams?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clues:</span>
                <span className="text-sm font-medium text-gray-900">
                  {treasureHunt.clues?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          {canDelete && (
            <div className="mb-6">
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Type "{treasureHunt.title}" to confirm deletion:
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={treasureHunt.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                disabled={isDeleting}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || !isConfirmationValid || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeleting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Forever'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTreasureHuntModal;