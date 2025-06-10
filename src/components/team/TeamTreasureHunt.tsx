 // components/team/TeamTreasureHunts.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, MapPin, AlertCircle, Play, CheckCircle } from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';

interface TeamTreasureHuntsProps {
  onStartHunt?: (huntId: string) => void;
  onViewProgress?: (huntId: string) => void;
}

const TeamTreasureHunts: React.FC<TeamTreasureHuntsProps> = ({
  onStartHunt,
  onViewProgress
}) => {
  const { 
    fetchMyAssignedTreasureHunts,
    loading,
    error,
    clearError
  } = useTreasureHunts();

  const [assignedHunts, setAssignedHunts] = useState<any[]>([]);

  useEffect(() => {
    loadAssignedHunts();
  }, []);

  const loadAssignedHunts = async () => {
    try {
      const hunts = await fetchMyAssignedTreasureHunts();
      if (hunts) {
        setAssignedHunts(hunts);
      }
    } catch (error) {
      console.error('Failed to load assigned treasure hunts:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ACTIVE': 
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isHuntActive = (hunt: any) => {
    const now = new Date();
    const startTime = new Date(hunt.startTime);
    const endTime = new Date(hunt.endTime);
    return now >= startTime && now <= endTime && (hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS');
  };

  const isHuntUpcoming = (hunt: any) => {
    const now = new Date();
    const startTime = new Date(hunt.startTime);
    return now < startTime && hunt.status === 'UPCOMING';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 mt-4">Loading your treasure hunts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Treasure Hunts</h2>
        <div className="text-sm text-gray-500">
          {assignedHunts.length} hunt{assignedHunts.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Treasure Hunts Grid */}
      {assignedHunts.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No treasure hunts assigned</h3>
          <p className="text-gray-500">Your team hasn't been assigned to any treasure hunts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedHunts.map((hunt) => (
            <div key={hunt.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hunt.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hunt.description}</p>
                    
                    <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(hunt.status)}`}>
                      {getStatusIcon(hunt.status)}
                      <span className="ml-1">{hunt.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Starts: {formatDate(hunt.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Ends: {formatDate(hunt.endTime)}</span>
                  </div>
                  
                  {hunt.clues && hunt.clues.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{hunt.clues.length} stage{hunt.clues.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Active Hunts */}
                {(hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS') && hunt.clues && hunt.clues.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {hunt.clues.filter((c: any) => c.status === 'APPROVED').length} / {hunt.clues.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(hunt.clues.filter((c: any) => c.status === 'APPROVED').length / hunt.clues.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                {isHuntActive(hunt) && (
                  <button 
                    onClick={() => onStartHunt?.(hunt.id)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Continue Hunt</span>
                  </button>
                )}
                
                {isHuntUpcoming(hunt) && (
                  <div className="w-full text-center py-2">
                    <span className="text-sm text-gray-500">Hunt starts soon</span>
                  </div>
                )}

                {hunt.status === 'COMPLETED' && (
                  <button 
                    onClick={() => onViewProgress?.(hunt.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>View Results</span>
                  </button>
                )}

                {(hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS') && (
                  <button 
                    onClick={() => onViewProgress?.(hunt.id)}
                    className="w-full mt-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    View Progress
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamTreasureHunts;