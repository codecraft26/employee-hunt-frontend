'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Eye, 
  EyeOff, 
  Upload, 
  Trash2,
  Filter,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  User,
  Edit
} from 'lucide-react';
import { useUserManagement, CreateAdminRequest, User as UserType } from '../../hooks/useUserManagement';
import { useToast } from '../shared/ToastContainer';
import { uploadProfileImage, validateImageFile } from '../../services/s3Service';
import { useCategories } from '../../hooks/useCategories';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'create' | 'view';
}

type TabType = 'create' | 'view';
type FilterType = 'all' | 'admin' | 'user' | 'approved' | 'pending';

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'view'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // Form state for creating admin
  const [formData, setFormData] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    name: '',
    department: '',
    gender: 'male',
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const {
    users,
    loading,
    error,
    createAdminLoading,
    createAdminError,
    createAdminUser,
    fetchAllUsers,
    refreshUsers,
    clearErrors,
    getUserStats,
    updateUser
  } = useUserManagement();

  const { showSuccess, showError, showInfo } = useToast();

  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editProfileImageFile, setEditProfileImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();

  // Fetch users on modal open
  useEffect(() => {
    if (isOpen && activeTab === 'view') {
      fetchAllUsers();
    }
  }, [isOpen, activeTab, fetchAllUsers]);

  // Reset form on tab change
  useEffect(() => {
    if (activeTab === 'create') {
      setFormData({
        email: '',
        password: '',
        name: '',
        department: '',
        gender: 'male',
      });
      setProfileImageFile(null);
      setIdProofFile(null);
      clearErrors();
    }
  }, [activeTab, clearErrors]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof CreateAdminRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle file uploads
  const handleFileChange = useCallback((type: 'profile' | 'idProof', file: File | null) => {
    if (type === 'profile') {
      setProfileImageFile(file);
    } else {
      setIdProofFile(file);
    }
  }, []);

  // Create admin user
  const handleCreateAdmin = useCallback(async () => {
    if (!formData.email || !formData.password || !formData.name) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    const adminData: CreateAdminRequest = {
      ...formData,
      profileImage: profileImageFile || undefined,
      idProof: idProofFile || undefined,
    };

    const result = await createAdminUser(adminData);
    
    if (result) {
      showSuccess('Admin Created', `Admin user ${formData.name} has been created successfully`);
      setActiveTab('view');
      // Refresh users list
      await fetchAllUsers();
    } else if (createAdminError) {
      showError('Creation Failed', createAdminError);
    }
  }, [formData, profileImageFile, idProofFile, createAdminUser, createAdminError, showSuccess, showError, fetchAllUsers]);

  // Filter users based on filter type
  const filteredUsers = users.filter(user => {
    const matchesFilter = (() => {
      switch (filterType) {
        case 'admin': return user.role === 'admin';
        case 'user': return user.role === 'user';
        case 'approved': return user.isApproved;
        case 'pending': return !user.isApproved;
        default: return true;
      }
    })();

    return matchesFilter;
  });

  const stats = getUserStats();

  useEffect(() => { if (editUser) fetchCategories(); }, [editUser, fetchCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">Create admin users and manage user accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'view'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>View Users ({stats.totalUsers})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Admin</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'view' ? (
            <div className="space-y-6">
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

              {/* Filter and Refresh */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Regular Users</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
                <button
                  onClick={refreshUsers}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Users List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{user.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{user.department}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">#{user.employeeCode}</span>
                            </div>
                          </div>
                          {user.team && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Team:</span> {user.team.name}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-gray-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                            onClick={() => {
                              setEditUser(user);
                              setEditFormData({ ...user, password: '' });
                              setEditProfileImageFile(null);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No users match the current filter.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Admin User</h3>
                
                {/* Error Display */}
                {createAdminError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{createAdminError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Administration, IT, HR"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Gender
                      </label>
                                             <select
                         value={formData.gender}
                         onChange={(e) => handleInputChange('gender', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                         <option value="other">Other</option>
                       </select>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Profile Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('profile', e.target.files?.[0] || null)}
                          className="hidden"
                          id="profile-upload"
                        />
                        <label htmlFor="profile-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            {profileImageFile ? profileImageFile.name : 'Click to upload profile image'}
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </label>
                        {profileImageFile && (
                          <button
                            type="button"
                            onClick={() => handleFileChange('profile', null)}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        ID Proof
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)}
                          className="hidden"
                          id="idproof-upload"
                        />
                        <label htmlFor="idproof-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            {idProofFile ? idProofFile.name : 'Click to upload ID proof'}
                          </p>
                          <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                        </label>
                        {idProofFile && (
                          <button
                            type="button"
                            onClick={() => handleFileChange('idProof', null)}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('view')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAdmin}
                    disabled={createAdminLoading || !formData.email || !formData.password || !formData.name}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createAdminLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <UserPlus className="h-4 w-4" />
                    <span>{createAdminLoading ? 'Creating...' : 'Create Admin'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl relative p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setEditUser(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit User: {editUser.name}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                let data: any = { ...editFormData };
                // Handle profile image upload to S3 if a new file is selected
                if (editProfileImageFile) {
                  const validation = validateImageFile(editProfileImageFile);
                  if (!validation.isValid) {
                    showError('Invalid Image', validation.error || 'Invalid file');
                    setEditLoading(false);
                    return;
                  }
                  try {
                    const url = await uploadProfileImage(editProfileImageFile);
                    data.profileImage = url;
                  } catch (err) {
                    showError('Upload Failed', 'Failed to upload profile image');
                    setEditLoading(false);
                    return;
                  }
                }
                const result = await updateUser(editUser.id, data);
                setEditLoading(false);
                if (result) {
                  showSuccess('User Updated', 'User information updated successfully');
                  setEditUser(null);
                  await fetchAllUsers();
                } else {
                  showError('Update Failed', 'Failed to update user');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Password (leave blank to keep unchanged)</label>
                <input
                  type="password"
                  value={editFormData.password || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Employee Code</label>
                <input
                  type="text"
                  value={editFormData.employeeCode || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, employeeCode: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Gender</label>
                <select
                  value={editFormData.gender || ''}
                  onChange={e => setEditFormData((f: any) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Hobbies (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editFormData.hobbies) ? editFormData.hobbies.join(', ') : (editFormData.hobbies || '')}
                  onChange={e => setEditFormData((f: any) => ({ ...f, hobbies: e.target.value.split(',').map((h: string) => h.trim()) }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Categories</label>
                <div className="relative">
                  <div
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer"
                    onClick={() => {
                      const dropdown = document.getElementById('edit-categories-dropdown');
                      if (dropdown) dropdown.classList.toggle('hidden');
                    }}
                  >
                    <span className={(!editFormData.categoryIds || editFormData.categoryIds.length === 0) ? 'text-gray-400' : 'text-gray-900'}>
                      {(!editFormData.categoryIds || editFormData.categoryIds.length === 0)
                        ? 'Select categories'
                        : `${editFormData.categoryIds.length} selected`}
                    </span>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {/* Dropdown Options */}
                  <div
                    id="edit-categories-dropdown"
                    className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    {categoriesLoading ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No categories available
                      </div>
                    ) : categories.map(category => (
                      <label key={category.id} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={category.id}
                          checked={Array.isArray(editFormData.categoryIds) && editFormData.categoryIds.includes(category.id)}
                          onChange={e => {
                            const { value, checked } = e.target;
                            if (checked) {
                              setEditFormData((f: any) => ({ ...f, categoryIds: [...f.categoryIds, value] }));
                            } else {
                              setEditFormData((f: any) => ({ ...f, categoryIds: f.categoryIds.filter((id: string) => id !== value) }));
                            }
                          }}
                        />
                        <span className="ml-2">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditProfileImageFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded"
                />
                {editUser.profileImage && !editProfileImageFile && (
                  <img src={editUser.profileImage} alt="Profile" className="mt-2 h-12 w-12 rounded-full object-cover" />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementModal; 