// components/user/UserProfileTab.tsx
'use client';

import { useMemo, useEffect } from 'react';
import { 
  Camera, 
  Edit, 
  User as UserIcon, 
  Users, 
  Briefcase, 
  Heart, 
  Building2,
  Tag
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

interface UserProfileTabProps {
  user: any; // Replace with proper User type
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user }) => {
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get user's category from the categories list
  const userCategory = useMemo(() => {
    if (!user?.department || !categories.length) return null;
    return categories.find(category => category.id === user.department) || null;
  }, [categories, user?.department]);

  // Get category members count
  const categoryMembersCount = useMemo(() => {
    if (!userCategory) return 0;
    return userCategory.users?.length || 0;
  }, [userCategory]);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end space-x-4 -mt-16">
            <div className="relative">
              <div className="h-24 w-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  {user.role}
                </span>
                {user.employeeCode && (
                  <span className="text-sm text-gray-600">{user.employeeCode}</span>
                )}
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            {user.employeeCode && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee Code</p>
                  <p className="text-gray-900">{user.employeeCode}</p>
                </div>
              </div>
            )}
            {user.gender && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Gender</p>
                  <p className="text-gray-900 capitalize">{user.gender}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Category</p>
                <p className="text-gray-900">
                  {categoriesLoading ? 'Loading...' : (userCategory?.name || 'Not assigned')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-gray-900 capitalize">{user.role || 'Not specified'}</p>
              </div>
            </div>
            {user.hobbies && user.hobbies.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Hobbies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.hobbies.map((hobby: string) => (
                      <span key={hobby} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Account Created</p>
            <p className="text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Last Updated</p>
            <p className="text-gray-900">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileTab;