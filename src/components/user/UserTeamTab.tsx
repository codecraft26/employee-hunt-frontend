// components/user/UserTeamTab.tsx
'use client';

import { useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Award, 
  Calendar, 
  Briefcase, 
  AlertCircle
} from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/teams';

interface UserTeamTabProps {
  user: any; // Replace with proper User type
}

const UserTeamTab: React.FC<UserTeamTabProps> = ({ user }) => {
  const {
    loading: teamsLoading,
    error: teamsError,
    myTeam,
    fetchMyTeam,
    clearError: clearTeamsError,
  } = useTeams();

  // Fetch user's team when component mounts
  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

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
      {/* Team Header */}
      {userTeam && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">{userTeam.name}</h2>
              <p className="opacity-90 mb-3 text-indigo-100">
                {'description' in userTeam ? userTeam.description || 'Team description' : 'Team description'}
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-100">{teamMembers.length} Members</span>
                </div>
                {'score' in userTeam && (
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-indigo-200" />
                    <span className="text-indigo-100">{userTeam.score} Points</span>
                  </div>
                )}
                {'createdAt' in userTeam && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-200" />
                    <span className="text-indigo-100">Since {new Date(userTeam.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <Trophy className="h-16 w-16 opacity-20" />
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {userTeam ? `${userTeam.name} Members` : 'Team Members'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {userTeam ? 
                `Meet your ${teamMembers.length} team member${teamMembers.length !== 1 ? 's' : ''}` :
                'You are not assigned to any team yet'
              }
            </p>
          </div>
          {teamsLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          )}
        </div>
        <div className="border-t border-gray-200">
          {teamsError ? (
            <div className="px-4 py-4 sm:px-6">
              <div className="p-4 bg-red-50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{teamsError}</p>
                  <button
                    onClick={() => {
                      clearTeamsError();
                      fetchMyTeam();
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : !userTeam ? (
            <div className="px-4 py-8 sm:px-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Assigned</h3>
              <p className="text-gray-600">Contact your administrator to be assigned to a team</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="px-4 py-8 sm:px-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No members in this team yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {teamMembers.map((member: any) => (
                <li key={member.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          {member.id === user.id && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{member.email}</span>
                          {member.role && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{member.role}</span>
                            </>
                          )}
                        </div>
                        {member.department && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Briefcase className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{member.department}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.employeeCode && (
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {member.employeeCode}
                        </span>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Member since</p>
                        <p className="text-xs text-gray-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTeamTab;