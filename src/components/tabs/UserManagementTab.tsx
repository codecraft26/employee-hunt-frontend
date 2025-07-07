'use client';

import React, { useState, useCallback } from 'react';
import { UserCog, UserPlus, Users, Shield, CheckCircle, XCircle, Mail, Building, RefreshCw } from 'lucide-react';
import { useUserManagement } from '../../hooks/useUserManagement';
import UserManagementModal from '../modals/UserManagementModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { apiService } from '../../services/apiService';

const UserManagementTab: React.FC = () => {
  const [userManagementModalOpen, setUserManagementModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const {
    users,
    loading,
    error,
    fetchAllUsers,
    refreshUsers,
    clearErrors,
    getUserStats
  } = useUserManagement();

  // Fetch users on component mount
  React.useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleOpenCreateAdmin = useCallback(() => {
    setSelectedUserForEdit(null);
    setUserManagementModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: any) => {
    setSelectedUserForEdit(user);
    setUserManagementModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback(async (user: any) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      console.log('Attempting to delete user:', user.id, user.name);
      const response = await apiService.deleteUser(user.id);
      console.log('Delete response:', response);

      if (response.success) {
        // Refresh the users list to reflect the deletion
        await fetchAllUsers();
        alert(`User "${user.name}" has been deleted successfully.`);
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to delete user';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Failed to delete user: ${errorMessage}`);
    } finally {
      setDeletingUserId(null);
    }
  }, [fetchAllUsers]);

  const handleCloseModal = useCallback(() => {
    setUserManagementModalOpen(false);
    setSelectedUserForEdit(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshUsers();
  }, [refreshUsers]);

  const handleDownloadAllIdProofs = async () => {
    const zip = new JSZip();
    const idProofUsers = users.filter(user => !!user.idProof);

    for (const user of idProofUsers) {
      try {
        // @ts-ignore: idProof is guaranteed by filter
        const response = await fetch(user.idProof);
        const blob = await response.blob();
        // @ts-ignore: idProof is guaranteed by filter
        const ext = user.idProof.split('.').pop()?.split('?')[0] || 'jpg';
        const safeName = user.name?.replace(/[^a-zA-Z0-9-_]/g, '_') || user.id;
        const filename = `${safeName}.${ext}`;
        zip.file(filename, blob);
      } catch (err) {
        console.error(`Failed to fetch ID proof for ${user.name}:`, err);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'all-id-proofs.zip');
  };

  const stats = getUserStats();

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Create admin users and manage user accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Admin</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Admins</p>
              <p className="text-2xl font-bold text-green-900">{stats.adminUsers}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Approved</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.approvedUsers}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Pending</p>
              <p className="text-2xl font-bold text-red-900">{stats.pendingUsers}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">All Users</h3>
          <button
            onClick={handleDownloadAllIdProofs}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download All ID Proofs as Zip
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserCog className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.idProof ? (
                      <a
                        href={user.idProof}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download ID Proof
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.team?.name || 'No Team'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingUserId === user.id}
                        className={`text-red-600 hover:text-red-900 hover:underline ${
                          deletingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={userManagementModalOpen}
        onClose={handleCloseModal}
        initialTab={selectedUserForEdit ? "view" : "create"}
        initialEditUser={selectedUserForEdit}
      />
    </div>
  );
};

export default UserManagementTab; 