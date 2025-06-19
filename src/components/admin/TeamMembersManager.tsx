import React, { useState, useCallback, memo, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useTeams } from '../../hooks/useTeams';
import { useToast } from '../shared/ToastContainer';
import { Team, TeamMember } from '../../types/teams';

interface TeamMembersManagerProps {
  team: Team;
  onMemberRemoved?: () => void;
}

const TeamMembersManager: React.FC<TeamMembersManagerProps> = memo(({ 
  team,
  onMemberRemoved 
}) => {
  const { removeMemberFromTeam, loading, error, clearError } = useTeams();
  const { showSuccess, showError } = useToast();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // Clear errors when component unmounts or team changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError, team.id]);

  // Memoized handler for removing team members
  const handleRemoveMember = useCallback(async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} from the team?\n\nThis action cannot be undone.`)) {
      return;
    }

    setRemovingUserId(member.id);
    clearError();

    try {
      console.log('Attempting to remove member:', {
        teamId: team.id,
        userId: member.id,
        memberName: member.name
      });

      const success = await removeMemberFromTeam(team.id, member.id);
      
      if (success) {
        // Show success toast
        showSuccess(
          'Member Removed Successfully',
          `${member.name} has been removed from ${team.name}`,
          4000
        );
        
        onMemberRemoved?.();
      } else {
        // This should not happen if our error handling is correct, but just in case
        console.error('Remove member returned false without throwing an error');
        showError(
          'Removal Failed',
          'Failed to remove member from team. Please try again.',
          6000
        );
      }
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      
      // Show error toast with specific message
      const errorMessage = err.message || 'An unexpected error occurred';
      showError(
        'Failed to Remove Member',
        `Could not remove ${member.name}: ${errorMessage}`,
        8000
      );
    } finally {
      setRemovingUserId(null);
    }
  }, [team.id, removeMemberFromTeam, clearError, onMemberRemoved]);

  // Memoized member list to prevent unnecessary re-renders
  const membersList = team.members || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}



      <div className="bg-white shadow-sm rounded-lg border">
        {membersList.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No members in this team yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {membersList.map((member) => (
              <li key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {member.role && (
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={loading && removingUserId === member.id}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Remove ${member.name} from team`}
                  >
                    {loading && removingUserId === member.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

TeamMembersManager.displayName = 'TeamMembersManager';

export default TeamMembersManager; 