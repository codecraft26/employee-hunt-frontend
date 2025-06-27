// components/user/UserTeamTab.tsx
'use client';

import { useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Award, 
  Calendar, 
  Briefcase, 
  AlertCircle,
  Crown,
  Star,
  Shield
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

  // Check if current user is team leader
  const isCurrentUserLeader = useMemo(() => {
    if (!userTeam || !user) return false;
    return userTeam.leaderId === user.id || userTeam.leader?.id === user.id;
  }, [userTeam, user]);

  return (
    <div className="space-y-6">
      {/* Team Header */}
      {userTeam && (
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-purple bg-opacity-30 rounded-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white drop-shadow">{userTeam.name}</h2>
              {isCurrentUserLeader && (
                <div className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <Crown className="h-4 w-4 text-yellow-300" />
                  <span className="text-yellow-100 text-sm font-medium">Team Leader</span>
                </div>
              )}
            </div>
            <p className="mb-4 text-indigo-100 drop-shadow">{'description' in userTeam ? userTeam.description || 'Team description' : 'Team description'}</p>
            {/* Team Stats */}
            <div className="flex flex-wrap items-center space-x-6 mb-4">
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
            {/* Team Leader Info */}
            {userTeam.leader && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3 w-full max-w-full mt-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Crown className="text-white" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{userTeam.leader.name}</p>
                    <p className="text-sm text-gray-700 truncate">{userTeam.leader.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Trophy className="h-16 w-16 opacity-20 absolute right-4 bottom-4" />
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
              {teamMembers.map((member: any) => {
                const isLeader = member.id === userTeam?.leaderId || member.id === userTeam?.leader?.id;
                const isCurrentUser = member.id === user.id;
                
                return (
                  <li key={member.id} className={`px-4 py-4 sm:px-6 ${isLeader ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium relative flex-shrink-0 ${
                          isLeader 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                          {isLeader && (
                            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 bg-blue-600 rounded-full p-0.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">{member.name}</p>
                            {isLeader && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center">
                                <Crown className="inline h-3 w-3 mr-1" />
                                Team Leader
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 min-w-0">
                            <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">{member.email}</span>
                            {member.role && (
                              <>
                                <span>•</span>
                                <span className="capitalize truncate max-w-[60px]">{member.role}</span>
                              </>
                            )}
                          </div>
                          {member.department && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Briefcase className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate max-w-[100px]">{member.department}</span>
                            </div>
                          )}
                          {isLeader && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Shield className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Leadership Responsibilities</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {member.employeeCode && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[80px]">{member.employeeCode}</span>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {isLeader ? 'Leader since' : 'Member since'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTeamTab;