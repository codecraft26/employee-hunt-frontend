// components/tabs/CategoriesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  BarChart3, 
  AlertCircle, 
  RefreshCw, 
  X,
  Trash2,
  Calendar,
  Building2,
  Tag,
  Users,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useCategories, Category, CreateCategoryRequest } from '../../hooks/useCategories';

interface CategoriesTabProps {
  onCreateCategory?: () => void;
  onViewStats?: (categoryId: string) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ 
  onCreateCategory: externalOnCreateCategory,
  onViewStats: externalOnViewStats
}) => {
  const {
    loading,
    error,
    categories,
    users,
    createCategory,
    fetchCategories,
    fetchUsers,
    assignUserToCategory,
    removeUserFromCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useCategories();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [createCategoryData, setCreateCategoryData] = useState<CreateCategoryRequest>({
    name: '',
    description: ''
  });
  const [editCategoryData, setEditCategoryData] = useState<CreateCategoryRequest>({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    console.log('CategoriesTab: Fetching categories...');
    fetchCategories();
  }, [fetchCategories]);

  // Debug logging for categories
  useEffect(() => {
    console.log('CategoriesTab: Categories updated:', categories);
  }, [categories]);

  const handleCreateCategory = async () => {
    if (!createCategoryData.name.trim() || !createCategoryData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory(createCategoryData);
      setShowCreateModal(false);
      setCreateCategoryData({ name: '', description: '' });
      // Call external handler if provided
      externalOnCreateCategory?.();
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryData({
      name: category.name,
      description: category.description
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editCategoryData.name.trim() || !editCategoryData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory(selectedCategory.id, editCategoryData);
      setShowEditModal(false);
      setSelectedCategory(null);
      setEditCategoryData({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to update category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewStats = (category: Category) => {
    setSelectedCategory(category);
    setShowStatsModal(true);
    // Call external handler if provided
    externalOnViewStats?.(category.id);
  };

  const handleManageUsers = async (category: Category) => {
    console.log('Opening user management for category:', category.name, category.id);
    setSelectedCategory(category);
    setShowUserManagementModal(true);
    // Fetch available users for assignment
    console.log('Fetching users for assignment...');
    await fetchUsers();
    console.log('Users fetched, available users count:', users.length);
  };

  const handleRefresh = () => {
    clearError();
    fetchCategories();
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await assignUserToCategory(selectedCategory.id, userId);
      // Refresh categories to get updated user list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to assign user to category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await removeUserFromCategory(userId);
      // Refresh categories to get updated user list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to remove user from category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users for assignment (users not already in the category)
  const availableUsersForAssignment = users.filter(user => 
    !selectedCategory?.users.find(categoryUser => categoryUser.id === user.id)
  );

  // Filter available users based on search term
  const filteredAvailableUsers = availableUsersForAssignment.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.employeeCode?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Sort categories by user count (highest first)
  const sortedCategories = [...categories].sort((a, b) => b.users.length - a.users.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600">Manage categories and their information</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first category</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCategories.map((category, index) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Users Assigned</p>
                      <p className="text-2xl font-bold text-gray-900">{category.users.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Created: {new Date(category.createdAt).toLocaleDateString()}</p>
                    <p>Updated: {new Date(category.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-center space-x-2">
                <button 
                  onClick={() => handleViewStats(category)}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Stats</span>
                </button>
                <button 
                  onClick={() => handleManageUsers(category)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Category</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={createCategoryData.name}
                  onChange={(e) => setCreateCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createCategoryData.description}
                  onChange={(e) => setCreateCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!createCategoryData.name.trim() || !createCategoryData.description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editCategoryData.name}
                  onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editCategoryData.description}
                  onChange={(e) => setEditCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={!editCategoryData.name.trim() || !editCategoryData.description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Category:</strong> {selectedCategory.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Users:</strong> {selectedCategory.users.length} 
                  {selectedCategory.users.length > 0 && " (users will be unassigned)"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong> {selectedCategory.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              <p className="text-sm text-red-600 mt-3">
                Deleting this category will permanently remove all category data and unassign all users.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats Modal */}
      {showStatsModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Category Statistics - {selectedCategory.name}
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Assigned Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{selectedCategory.users.length}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Status</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Category Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedCategory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium text-right max-w-xs">{selectedCategory.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(selectedCategory.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(selectedCategory.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedCategory.users.length > 0 && (
                <>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-600">User Roles Distribution</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(selectedCategory.users.map(u => u.role))].map((role) => (
                        <span 
                          key={role}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                        >
                          {role} ({selectedCategory.users.filter(u => u.role === role).length})
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedCategory.users.some(u => u.department) && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Building2 className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">Departments</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(selectedCategory.users.map(u => u.department).filter(Boolean))].map((dept) => (
                          <span 
                            key={dept}
                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserManagementModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Users - {selectedCategory.name}
              </h3>
              <button
                onClick={() => setShowUserManagementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Users */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Current Users ({selectedCategory.users.length})</span>
                  </h4>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {selectedCategory.users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No users assigned to this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCategory.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              {user.employeeCode && (
                                <p className="text-xs text-gray-500">ID: {user.employeeCode}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isSubmitting}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove user from category"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Users */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Available Users ({filteredAvailableUsers.length})</span>
                  </h4>
                </div>

                {/* Search */}
                <div>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or employee code..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>
                        {userSearchTerm 
                          ? 'No users found matching your search'
                          : 'No available users to assign'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAvailableUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              {user.employeeCode && (
                                <p className="text-xs text-gray-500">ID: {user.employeeCode}</p>
                              )}
                              {user.department && (
                                <p className="text-xs text-gray-500">Dept: {user.department}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignUser(user.id)}
                            disabled={isSubmitting}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Add user to category"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowUserManagementModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;