// components/user/UserProfileTab.tsx
'use client';

import { useMemo } from 'react';
import { 
  Camera, 
  Edit, 
  User as UserIcon, 
  Users, 
  Briefcase, 
  Heart, 
  Trophy
} from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/teams';

interface UserProfileTabProps {
  user: any; // Replace with proper User type
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user }) => {
  const { myTeam } = useTeams();

  // Get user's team from the dedicated myTeam state
  const userTeam = useMemo(() => {
    return (myTeam || user?.team || null) as Team | null;
  }, [myTeam, user?.team]);

  // Get team members from the user's team (with proper type checking)
  const teamMembers = useMemo(() => {
    if (!userTeam || !userTeam.members) return [];
    return userTeam.members;
  }, [userTeam]);

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
                <span className="text-sm text-gray-600">{user.employeeCode}</span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Employee Code</p>
                <p className="text-gray-900">{user.employeeCode || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Gender</p>
                <p className="text-gray-900 capitalize">{user.gender || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-gray-900">{user.department || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Hobbies</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.hobbies && user.hobbies.length > 0 ? (
                    user.hobbies.map((hobby: string) => (
                      <span key={hobby} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                        {hobby}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No hobbies specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
          <div className="space-y-4">
            {userTeam ? (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="h-6 w-6 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">{userTeam.name}</h4>
                </div>
                <div className="space-y-3">
                  {'description' in userTeam && userTeam.description && (
                    <p className="text-sm text-gray-700">{userTeam.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {'score' in userTeam && (
                      <div>
                        <p className="text-gray-600">Team Score</p>
                        <p className="font-semibold text-indigo-600">{userTeam.score} points</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Members</p>
                      <p className="font-semibold">{teamMembers.length} people</p>
                    </div>
                    {'createdAt' in userTeam && (
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold">
                          {new Date(userTeam.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {'updatedAt' in userTeam && (
                      <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="font-semibold">
                          {new Date(userTeam.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Not part of any team yet</p>
                <p className="text-gray-500 text-sm mt-1">Contact your administrator to be assigned to a team</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileTab;