// components/tabs/TeamsTab.tsx
import React from 'react';
import { Plus, Upload, Edit, Users, BarChart3 } from 'lucide-react';
import { Team } from '../../types/admin';

interface TeamsTabProps {
  teams: Team[];
  onCreateTeam: () => void;
  onImportUsers: () => void;
  onManageMembers: (teamId: number) => void;
  onViewStats: (teamId: number) => void;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ 
  teams, 
  onCreateTeam, 
  onImportUsers, 
  onManageMembers, 
  onViewStats 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={onCreateTeam}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
          <button 
            onClick={onImportUsers}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import Users</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                    team.rank === 1 ? 'bg-yellow-500' : 
                    team.rank === 2 ? 'bg-gray-400' : 
                    team.rank === 3 ? 'bg-amber-600' : 'bg-indigo-500'
                  }`}>
                    #{team.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.department}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Members</p>
                    <p className="text-2xl font-bold text-gray-900">{team.members}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Points</p>
                    <p className="text-2xl font-bold text-gray-900">{team.points}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {team.members > 4 && (
                      <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                        +{team.members - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button 
                onClick={() => onManageMembers(team.id)}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
              >
                <Users className="h-4 w-4" />
                <span>Manage Members</span>
              </button>
              <button 
                onClick={() => onViewStats(team.id)}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Stats</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsTab;