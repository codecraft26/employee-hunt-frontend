// components/tabs/AdminApprovalsTab.tsx
'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { UserPlus, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { useUserApprovals } from '@/hooks/useUserApprovals';
import { PendingUser } from '@/hooks/useUserApprovals';
import RejectUserModal from '@/components/modals/RejectUserModal';
import UserManagementModal from '@/components/modals/UserManagementModal';

interface AdminApprovalsTabProps {
  onApproveUser?: (userId: string, userName: string) => void;
  onRejectUser?: (userId: string, userName: string, reason?: string) => void;
  onBulkApprove?: (userIds: string[]) => void;
  onBulkReject?: (userIds: string[], reason?: string) => void;
  onRefresh?: () => void;
  onViewUserDetails?: (userId: string) => void;
}

const AdminApprovalsTab: React.FC<AdminApprovalsTabProps> = ({
  onApproveUser,
  onRejectUser,
  onBulkApprove,
  onBulkReject,
  onRefresh,
  onViewUserDetails,
}) => {
  const {
    loading,
    error,
    pendingUsers,
    fetchPendingUsers,
    approveUser,
    rejectUser,
    bulkApproveUsers,
    bulkRejectUsers,
    getPendingUsersStats,
    clearError,
  } = useUserApprovals();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [userManagementModalOpen, setUserManagementModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{
    type: 'single' | 'bulk';
    userId?: string;
    userName?: string;
    userIds?: string[];
  } | null>(null);

  // Fetch pending users on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Handle single user approval
  const handleApproveUser = useCallback(async (userId: string, userName: string) => {
    try {
      setActionLoading(userId);
      await approveUser(userId);
      console.log(`User ${userName} approved successfully`);
      // Call optional callback
      onApproveUser?.(userId, userName);
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setActionLoading(null);
    }
  }, [approveUser, onApproveUser]);

  // Handle single user rejection
  const handleRejectUser = useCallback(async (userId: string, userName: string) => {
    setRejectTarget({ type: 'single', userId, userName });
    setRejectModalOpen(true);
  }, []);

  // Handle the actual rejection after modal confirmation
  const handleConfirmReject = useCallback(async (reason?: string) => {
    if (!rejectTarget) return;

    try {
      if (rejectTarget.type === 'single' && rejectTarget.userId && rejectTarget.userName) {
        setActionLoading(rejectTarget.userId);
        await rejectUser(rejectTarget.userId, reason);
        console.log(`User ${rejectTarget.userName} rejected successfully`);
        onRejectUser?.(rejectTarget.userId, rejectTarget.userName, reason);
      } else if (rejectTarget.type === 'bulk' && rejectTarget.userIds) {
        setActionLoading('bulk-reject');
        await bulkRejectUsers(rejectTarget.userIds, reason);
        const rejectedUserIds = [...rejectTarget.userIds];
        setSelectedUsers([]);
        console.log(`${rejectedUserIds.length} users rejected successfully`);
        onBulkReject?.(rejectedUserIds, reason);
      }
    } catch (error) {
      console.error('Failed to reject user(s):', error);
    } finally {
      setActionLoading(null);
      setRejectModalOpen(false);
      setRejectTarget(null);
    }
  }, [rejectTarget, rejectUser, bulkRejectUsers, onRejectUser, onBulkReject]);

  // Handle bulk approval
  const handleBulkApprove = useCallback(async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setActionLoading('bulk');
      await bulkApproveUsers(selectedUsers);
      const approvedUserIds = [...selectedUsers];
      setSelectedUsers([]);
      console.log(`${approvedUserIds.length} users approved successfully`);
      // Call optional callback
      onBulkApprove?.(approvedUserIds);
    } catch (error) {
      console.error('Failed to bulk approve users:', error);
    } finally {
      setActionLoading(null);
    }
  }, [selectedUsers, bulkApproveUsers, onBulkApprove]);

  // Handle bulk rejection
  const handleBulkReject = useCallback(() => {
    if (selectedUsers.length === 0) return;
    
    setRejectTarget({ type: 'bulk', userIds: selectedUsers });
    setRejectModalOpen(true);
  }, [selectedUsers]);

  // Handle user selection
  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === pendingUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingUsers.map(user => user.id));
    }
  }, [selectedUsers.length, pendingUsers]);

  // Handle refresh with optional callback
  const handleRefresh = useCallback(async () => {
    await fetchPendingUsers();
    onRefresh?.();
  }, [fetchPendingUsers, onRefresh]);

  // Handle view user details
  const handleViewUserDetails = useCallback((userId: string) => {
    onViewUserDetails?.(userId);
  }, [onViewUserDetails]);

  // Handle create admin modal
  const handleOpenCreateAdmin = useCallback(() => {
    setUserManagementModalOpen(true);
  }, []);

  // Handle admin creation success (refresh pending users)
  const handleAdminCreationSuccess = useCallback(() => {
    // Refresh the pending users list in case the new admin affects anything
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Get stats
  const stats = getPendingUsersStats();

  if (loading && pendingUsers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Approvals</h2>
          <p className="text-gray-600 mt-1">
            {stats.totalPending} users pending approval · Create admin users with instant approval
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenCreateAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Admin</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats.totalPending > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Total Pending</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPending}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900">Categories</h3>
            <p className="text-2xl font-bold text-green-600">{stats.categories.length}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900">Selected</h3>
            <p className="text-2xl font-bold text-yellow-600">{selectedUsers.length}</p>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {pendingUsers.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === pendingUsers.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            Select All
          </label>
          <button
            onClick={handleBulkApprove}
            disabled={selectedUsers.length === 0 || actionLoading === 'bulk'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === 'bulk' ? 'Approving...' : `Approve Selected (${selectedUsers.length})`}
          </button>
          <button
            onClick={handleBulkReject}
            disabled={selectedUsers.length === 0 || actionLoading === 'bulk-reject'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === 'bulk-reject' ? 'Rejecting...' : `Reject Selected (${selectedUsers.length})`}
          </button>
        </div>
      )}

      {/* Users List */}
      {pendingUsers.length === 0 ? (
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">✓</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Approvals</h3>
          <p className="text-gray-500">All users have been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Proof
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {onViewUserDetails ? (
                            <button
                              onClick={() => handleViewUserDetails(user.id)}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {user.name}
                            </button>
                          ) : (
                            user.name
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">Gender: {user.gender || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.profileImage && user.profileImage.trim() !== '' ? (
                        <div className="flex items-center space-x-2">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <img
                              src={user.profileImage}
                              alt={`${user.name}'s profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() => user.profileImage && window.open(user.profileImage, '_blank')}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            title="View full image"
                            disabled={!user.profileImage}
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">View</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.idProof && user.idProof.trim() !== '' ? (
                        <button
                          onClick={() => user.idProof && window.open(user.idProof, '_blank')}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="View ID proof document"
                          disabled={!user.idProof}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">View Document</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">No document</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.employeeCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.categories && user.categories.length > 0 ? (
                        <div className="space-y-1">
                          {user.categories.map((category, index) => (
                            <span
                              key={category.id}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1"
                              title={category.description}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveUser(user.id, user.name)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === user.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id, user.name)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject User Modal */}
      <RejectUserModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectTarget(null);
        }}
        onConfirm={handleConfirmReject}
        userName={rejectTarget?.userName || 'Selected Users'}
        isLoading={actionLoading === rejectTarget?.userId || actionLoading === 'bulk-reject'}
        isBulk={rejectTarget?.type === 'bulk'}
        userCount={rejectTarget?.userIds?.length || 1}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={userManagementModalOpen}
        onClose={() => setUserManagementModalOpen(false)}
        initialTab="create"
      />
    </div>
  );
};

export default AdminApprovalsTab;