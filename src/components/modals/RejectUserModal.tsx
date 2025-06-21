'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useUserApprovals } from '../../hooks/useUserApprovals';
import { useModalBodyLock } from '../../hooks/useModalBodyLock';

interface RejectUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  userName: string;
  isLoading?: boolean;
  isBulk?: boolean;
  userCount?: number;
  userId: string;
}

const RejectUserModal: React.FC<RejectUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
  isBulk = false,
  userCount = 1,
  userId,
}) => {
  useModalBodyLock(isOpen);
  const { rejectUser, loading, error } = useUserApprovals();
  const [reason, setReason] = useState('');
  const [includeReason, setIncludeReason] = useState(false);

  const handleSubmit = () => {
    onConfirm(includeReason && reason.trim() ? reason.trim() : undefined);
    // Reset form
    setReason('');
    setIncludeReason(false);
  };

  const handleClose = () => {
    setReason('');
    setIncludeReason(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reject {isBulk ? 'Users' : 'User'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {isBulk 
              ? `Are you sure you want to reject ${userCount} selected users? This action cannot be undone.`
              : `Are you sure you want to reject ${userName}? This action cannot be undone.`
            }
          </p>

          {/* Optional reason checkbox */}
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeReason}
                onChange={(e) => setIncludeReason(e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Include rejection reason</span>
            </label>
          </div>

          {/* Reason textarea */}
          {includeReason && (
            <div className="mb-4">
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                placeholder="Enter reason for rejection (optional)..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be logged for administrative purposes.
              </p>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> {isBulk ? 'These users' : 'This user'} will be permanently removed from the system and cannot be recovered.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (includeReason && !reason.trim())}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Rejecting...' : 'Reject'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectUserModal; 