// components/user/UserTreasureHuntTab.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Clock, 
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useTeams } from '../../hooks/useTeams';
import { useAuth } from '../../hooks/useAuth';
import SimplifiedTreasureHuntTab from './SimplifiedTreasureHuntTab';
import TimerDisplay from '../shared/TimerDisplay';

export default function UserTreasureHuntTab() {
  const { user } = useAuth();
  const { myTeam, fetchMyTeam } = useTeams();
  const { fetchTreasureHunts, loading, error } = useTreasureHunts();

  const [treasureHunts, setTreasureHunts] = useState<any[]>([]);
  const [selectedHunt, setSelectedHunt] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load treasure hunts
  const loadTreasureHunts = useCallback(async () => {
    try {
      const hunts = await fetchTreasureHunts();
      setTreasureHunts(hunts || []);
      
      // Auto-select active hunt if available
      const activeHunt = hunts?.find(hunt => hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS');
      if (activeHunt && !selectedHunt) {
        setSelectedHunt(activeHunt);
      }
    } catch (error) {
      console.error('Failed to load treasure hunts:', error);
    }
  }, [fetchTreasureHunts, selectedHunt]);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      if (!myTeam) {
        await fetchMyTeam();
      }
      await loadTreasureHunts();
    };

    initialize();
  }, [myTeam, fetchMyTeam, loadTreasureHunts]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTreasureHunts();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadTreasureHunts]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': 
      case 'ACTIVE': 
        return 'bg-green-100 text-green-800';
      case 'UPCOMING': 
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': 
        return 'bg-gray-100 text-gray-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get hunt timing status
  const getHuntTimingStatus = (hunt: any) => {
    const now = new Date().getTime();
    const start = new Date(hunt.startTime).getTime();
    const end = new Date(hunt.endTime).getTime();
    
    if (now < start) {
      return { status: 'upcoming' as const, urgency: 'normal' as const };
    } else if (now >= start && now < end) {
      return { status: 'active' as const, urgency: 'normal' as const };
    } else {
      return { status: 'ended' as const, urgency: 'none' as const };
    }
  };

  // Error display
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Treasure Hunts</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading Treasure Hunts...</h3>
        </div>
      </div>
    );
  }

  // No team error
  if (!myTeam) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Assigned</h3>
          <p className="mt-1 text-sm text-gray-500">You need to be assigned to a team to participate in treasure hunts.</p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Treasure Hunts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Team: {myTeam.name} • {treasureHunts.length} hunts available
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </button>
      </div>

      {/* No hunts message */}
      {treasureHunts.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Treasure Hunts</h3>
          <p className="mt-1 text-sm text-gray-500">No treasure hunts are currently available for your team.</p>
        </div>
      ) : (
        <>
          {/* Hunt List */}
          <div className="grid gap-4 md:grid-cols-2">
            {treasureHunts.map((hunt) => {
              const timingStatus = getHuntTimingStatus(hunt);
              const isSelected = selectedHunt?.id === hunt.id;
              
              return (
                <div
                  key={hunt.id}
                  onClick={() => setSelectedHunt(hunt)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{hunt.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{hunt.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(hunt.startTime)} - {formatDate(hunt.endTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hunt.status)}`}>
                        {hunt.status}
                      </span>
                      
                      {timingStatus.status === 'active' && (
                        <TimerDisplay 
                          variant="compact" 
                          status="active"
                          timeText="Active"
                          urgency={timingStatus.urgency}
                        />
                      )}
                      
                      {timingStatus.status === 'upcoming' && (
                        <TimerDisplay 
                          variant="compact" 
                          status="upcoming"
                          timeText="Upcoming"
                          urgency={timingStatus.urgency}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Hunt Details */}
          {selectedHunt && (
            <div className="mt-6">
              <SimplifiedTreasureHuntTab 
                treasureHunt={selectedHunt}
                team={myTeam}
                user={user}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}