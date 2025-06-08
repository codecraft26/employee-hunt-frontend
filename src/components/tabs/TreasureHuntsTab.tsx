// components/tabs/TreasureHuntsTab.tsx
import React from 'react';
import { Plus, Eye, Trophy } from 'lucide-react';
import { TreasureHunt } from '../../types/admin';

interface TreasureHuntsTabProps {
  treasureHunts: TreasureHunt[];
  onCreateHunt: () => void;
  onViewClues: (huntId: number) => void;
  onDeclareWinner: (huntId: number) => void;
}

const TreasureHuntsTab: React.FC<TreasureHuntsTabProps> = ({ 
  treasureHunts, 
  onCreateHunt, 
  onViewClues, 
  onDeclareWinner 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Treasure Hunt Management</h2>
        <button 
          onClick={onCreateHunt}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Hunt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {treasureHunts.map((hunt) => (
          <div key={hunt.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{hunt.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{hunt.description}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(hunt.status)}`}>
                    {hunt.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Clues</p>
                    <p className="font-medium">{hunt.totalClues}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Teams</p>
                    <p className="font-medium">{hunt.teams.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium">{hunt.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium">{hunt.endDate}</p>
                  </div>
                </div>

                {Object.keys(hunt.progress).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Team Progress</p>
                    <div className="space-y-2">
                      {Object.entries(hunt.progress).map(([team, progress]) => (
                        <div key={team} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{team}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(progress / hunt.totalClues) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{progress}/{hunt.totalClues}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button 
                onClick={() => onViewClues(hunt.id)}
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Clues</span>
              </button>
              {hunt.status === 'active' && (
                <button 
                  onClick={() => onDeclareWinner(hunt.id)}
                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Declare Winner</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreasureHuntsTab;