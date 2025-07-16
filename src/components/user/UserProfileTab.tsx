// components/user/UserProfileTab.tsx
'use client';

import { useMemo, useEffect, useState } from 'react';
import { 
  Camera, 
  Edit, 
  User as UserIcon, 
  Users, 
  Briefcase, 
  Heart, 
  Building2,
  Tag,
  Crown,
  Shield,
  Trophy,
  Home,
  Key
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useTeams } from '../../hooks/useTeams';
import { apiService } from '../../services/apiService';

interface HotelRoom {
  id: string;
  roomNumber: string;
  user?: {
    id: string;
    name: string;
    email: string;
    employeeCode?: string;
    department?: string;
    profileImage?: string;
  } | null;
}

interface UserProfileTabProps {
  user: any; // Replace with proper User type
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user }) => {
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
  const { myTeam, fetchMyTeam, loading: teamLoading } = useTeams();
  const [userRoom, setUserRoom] = useState<HotelRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  // Fetch categories, team, and room when component mounts
  useEffect(() => {
    fetchCategories();
    fetchMyTeam();
    fetchUserRoom();
  }, [fetchCategories, fetchMyTeam]);

  const fetchUserRoom = async () => {
    setRoomLoading(true);
    try {
      // Try the user-specific endpoint first
      const response = await apiService.getMyRoom();
      if (response.success && response.data) {
        setUserRoom(response.data);
      } else {
        // Fallback: check if user object has roomNumber
        if (user?.roomNumber) {
          setUserRoom({
            id: 'user-room',
            roomNumber: user.roomNumber,
            user: user
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user room:', error);
      // Fallback: check if user object has roomNumber
      if (user?.roomNumber) {
        setUserRoom({
          id: 'user-room',
          roomNumber: user.roomNumber,
          user: user
        });
      }
    } finally {
      setRoomLoading(false);
    }
  };

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

  // Check if user is team leader
  const isTeamLeader = useMemo(() => {
    if (!myTeam || !user) return false;
    return myTeam.leaderId === user.id || myTeam.leader?.id === user.id;
  }, [myTeam, user]);

  return (
    <div className="space-y-6">
      {/* Profile Header - Redesigned */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden p-6 flex flex-col items-center">
        <div className="relative flex flex-col items-center w-full">
          <div className="relative mb-2">
            <div className="h-24 w-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Camera icon button removed */}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-2 text-center break-words w-full">{user.name}</h2>
          {user.employeeCode && (
            <div className="mt-1 text-center">
              <span className="text-sm font-medium text-gray-700">Employee Code: </span>
              <span className="text-base font-semibold text-blue-900">{user.employeeCode}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mt-1 justify-center w-full">
            <span className="text-gray-600 text-base break-all text-center">{user.email}</span>
            <span className="text-sm font-medium text-gray-700">{user.role}</span>
            {user.employeeCode && (
              <span className="text-base font-semibold text-blue-900">{user.employeeCode}</span>
            )}
            {user.department && (
              <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                <Briefcase className="h-4 w-4 mr-1 text-purple-500" />
                {user.department}
              </span>
            )}
            {userRoom && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                <Key className="inline h-3 w-3 mr-1" />
                Room {userRoom.roomNumber}
              </span>
            )}
            {isTeamLeader && (
              <span className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full text-white text-sm font-medium">
                <Crown className="h-4 w-4 mr-1" />Team Leader
              </span>
            )}
            {isTeamLeader && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center">
                <Shield className="inline h-3 w-3 mr-1" />Leadership Role
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Room Information */}
      {userRoom && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hotel Room Assignment</h3>
              <p className="text-blue-700">Your assigned accommodation</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Home className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Room Number</p>
                  <p className="text-2xl font-bold text-blue-900">{userRoom.roomNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Room ID</p>
                <p className="text-xs text-blue-500 font-mono">{userRoom.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Loading State */}
      {roomLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hotel Room Assignment</h3>
              <p className="text-blue-700">Loading your room information...</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      )}

      {/* No Room Assigned */}
      {!roomLoading && !userRoom && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gray-400 p-3 rounded-full">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hotel Room Assignment</h3>
              <p className="text-gray-600">No room assigned yet</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 text-center">
            <p className="text-gray-500">Contact your administrator to get assigned a room</p>
          </div>
        </div>
      )}

      {/* Leadership Status */}
      {isTeamLeader && myTeam && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Leadership</h3>
              <p className="text-blue-700">You are leading {myTeam.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Team Members</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{myTeam.members?.length || 0}</p>
            </div>
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Team Score</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{myTeam.score || 0}</p>
            </div>
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Responsibilities</span>
              </div>
              <p className="text-sm text-blue-700">Review & Approve</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            {user.employeeCode && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Key className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Employee Code</p>
                  <p className="text-blue-900 font-semibold">{user.employeeCode}</p>
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
              <Briefcase className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-purple-700">Department</p>
                <p className="text-purple-900 font-semibold">
                  {user.department || <span className='text-gray-400'>Not assigned</span>}
                </p>
              </div>
            </div>
            {user.categories && user.categories.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Personality Traits</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.categories.map((category: any) => (
                      <span key={category.id} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-gray-900 capitalize">{user.role || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Team</p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">
                    {teamLoading ? 'Loading...' : (myTeam?.name || user.team?.name || 'Not assigned')}
                  </p>
                  {isTeamLeader && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
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