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
  Calendar,
  MapPin
} from 'lucide-react';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useTeams } from '../../hooks/useTeams';
import { useAuth } from '../../hooks/useAuth';
import SimplifiedTreasureHuntTab from './SimplifiedTreasureHuntTab';
import TreasureHuntStages from './TreasureHuntStages';
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

  // Helper function to determine if hunt is multi-stage
  const isMultiStageHunt = (hunt: any) => {
    // Check if hunt has stages array with multiple stages
    if (hunt.stages && hunt.stages.length > 1) {
      return true;
    }
    
    // Check if hunt has clues array with multiple clues
    if (hunt.clues && hunt.clues.length > 1) {
      return true;
    }
    
    // Check if hunt has a totalStages property greater than 1
    if (hunt.totalStages && hunt.totalStages > 1) {
      return true;
    }
    
    return false;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-300';
      case 'UPCOMING':
        return 'bg-blue-500/20 text-blue-300';
      case 'COMPLETED':
        return 'bg-slate-500/20 text-slate-300';
      default:
        return 'bg-slate-600/20 text-slate-400';
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
      <div className="text-center py-12 gaming-card">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-xl font-bold text-white">Error Loading Hunts</h3>
        <p className="mt-2 text-base text-slate-400">{error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-6 btn-gaming inline-flex items-center"
        >
          {refreshing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="gaming-card p-4 sm:p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="mt-4 h-10 bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // No team error
  if (!myTeam) {
    return (
      <div className="text-center py-12 gaming-card">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-xl font-bold text-white">No Team Assigned</h3>
        <p className="mt-2 text-base text-slate-400">You need to be in a team to participate in treasure hunts.</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient flex items-center gap-3">
            <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
            Treasure Hunts
          </h2>
          <p className="text-slate-300 mt-1">
            Team: <span className="font-bold text-white">{myTeam.name}</span> • {treasureHunts.length} hunts available
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          disabled={refreshing}
          className="btn-gaming-secondary"
        >
          {refreshing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
          Refresh
        </button>
      </div>

      {/* No hunts message */}
      {treasureHunts.length === 0 ? (
        <div className="text-center py-12 gaming-card">
          <Target className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-xl font-bold text-white">No Treasure Hunts</h3>
          <p className="mt-2 text-base text-slate-400">No hunts are currently available. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Hunt List - Takes 1 column on mobile, 1 column on desktop */}
          <div className="lg:col-span-1 space-y-4">
            {treasureHunts.map((hunt) => {
              const timingStatus = getHuntTimingStatus(hunt);
              const isSelected = selectedHunt?.id === hunt.id;
              const isMultiStage = isMultiStageHunt(hunt);
              
              return (
                <div
                  key={hunt.id}
                  onClick={() => setSelectedHunt(hunt)}
                  className={`gaming-card p-4 sm:p-5 cursor-pointer transition-all duration-300 hover-lift ${
                    isSelected ? 'ring-2 ring-blue-500 bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{hunt.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{hunt.description}</p>
                      
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(hunt.startTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {isMultiStage ? 'Multi-Stage' : 'Single Stage'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(hunt.status)}`}>
                        {hunt.status}
                      </span>
                      
                      {timingStatus.status === 'active' && (
                        <TimerDisplay 
                          variant="compact"
                          status="active"
                          urgency="normal"
                          startTime={hunt.startTime}
                          endTime={hunt.endTime}
                          showCountdown={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Hunt Details - Takes 1 column on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2">
            {selectedHunt ? (
              isMultiStageHunt(selectedHunt) ? (
                <TreasureHuntStages hunt={selectedHunt} teamId={myTeam.id} />
              ) : (
                <SimplifiedTreasureHuntTab 
                  treasureHunt={selectedHunt} 
                  team={myTeam} 
                  user={user} 
                />
              )
            ) : (
              <div className="gaming-card p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                  <h3 className="mt-4 text-xl font-bold text-white">Select a Hunt</h3>
                  <p className="mt-2 text-base text-slate-400">Choose a treasure hunt from the list to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}