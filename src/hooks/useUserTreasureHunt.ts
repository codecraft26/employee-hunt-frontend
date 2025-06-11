// hooks/useUserTreasureHunt.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types matching your backend API response
export interface TreasureHunt {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED';
  startTime: string;
  endTime: string;
  isResultPublished: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  assignedTeams: Array<{
    id: string;
    name: string;
  }>;
  winningTeam?: {
    id: string;
    name: string;
  } | null;
  clues?: TreasureHuntClue[];
  createdAt: string;
  updatedAt: string;
}

export interface TreasureHuntClue {
  id: string;
  stageNumber: number;
  description: string;
  imageUrl?: string;
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentStage {
  id: string;
  stageNumber: number;
  description: string;
}

export interface Submission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl: string;
  adminFeedback?: string;
  createdAt: string;
  clue: {
    id: string;
    stageNumber: number;
    description: string;
  };
}

export interface TeamProgress {
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
  currentStage?: CurrentStage;
  submissions: Submission[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Create axios instance with your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const useTreasureHunt = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedHunts, setAssignedHunts] = useState<TreasureHunt[]>([]);
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null);
  const [progress, setProgress] = useState<TeamProgress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // Polling reference
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
      console.log('⏹️ Polling stopped');
    }
  }, []);

  // Fetch assigned treasure hunts
  const fetchAssignedHunts = useCallback(async (teamId?: string): Promise<TreasureHunt[]> => {
    console.log('🔍 Fetching assigned treasure hunts...', { teamId });
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Build URL according to your backend API
      let url = '/treasure-hunts/assigned';
      if (teamId) {
        url += `?teamId=${teamId}`;
      }
      
      console.log('📡 Making API call to:', url);
      const response = await api.get<ApiResponse<TreasureHunt[]>>(url);
      
      console.log('✅ API Response received:', response.data);
      
      if (response.data.success) {
        const hunts = response.data.data || [];
        console.log('🎯 Treasure hunts found:', hunts.length);
        setAssignedHunts(hunts);
        
        // Auto-select first active hunt
        if (hunts.length > 0) {
          const activeHunt = hunts.find(hunt => 
            hunt.status === 'IN_PROGRESS' || hunt.status === 'ACTIVE'
          ) || hunts[0];
          console.log('🎮 Auto-selecting hunt:', activeHunt.title);
          setSelectedHunt(activeHunt);
          // Automatically fetch progress for the selected hunt
          await fetchProgressInternal(activeHunt.id);
        }
        
        return hunts;
      } else {
        throw new Error(response.data.message || 'Failed to fetch assigned treasure hunts');
      }
    } catch (err: any) {
      console.error('💥 Fetch assigned hunts error:', err);
      
      let errorMessage = 'Failed to fetch assigned treasure hunts';
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on localhost:4000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Treasure hunts endpoint not found. Please check your API routes.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Team ID is required or invalid.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Internal fetch progress function
  const fetchProgressInternal = useCallback(async (huntId: string): Promise<TeamProgress | null> => {
    if (!huntId) {
      console.log('⚠️ No hunt ID provided for progress fetch');
      return null;
    }

    console.log('📊 Fetching progress for hunt:', huntId);
    setProgressLoading(true);
    
    try {
      // Using your backend route: GET /api/treasure-hunts/{treasureHuntId}/progress
      const response = await api.get<ApiResponse<TeamProgress>>(`/treasure-hunts/${huntId}/progress`);
      
      if (response.data.success) {
        const progressData = response.data.data;
        console.log('📈 Progress data received:', progressData);
        setProgress(progressData);
        return progressData;
      } else {
        throw new Error(response.data.message || 'Failed to fetch progress');
      }
    } catch (err: any) {
      console.error('💥 Fetch progress error:', err);
      
      let errorMessage = 'Failed to fetch progress';
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Progress endpoint not found or hunt does not exist.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed for progress fetch.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.warn('Progress fetch failed:', errorMessage);
      return null;
    } finally {
      setProgressLoading(false);
    }
  }, []);

  // Public fetch progress function
  const fetchProgress = useCallback(async (huntId?: string): Promise<TeamProgress | null> => {
    const targetHuntId = huntId || selectedHunt?.id;
    if (!targetHuntId) {
      console.log('⚠️ No hunt ID provided for progress fetch');
      return null;
    }

    return await fetchProgressInternal(targetHuntId);
  }, [selectedHunt?.id, fetchProgressInternal]);

  // Submit clue solution for current stage
  const submitStage = useCallback(async (
    huntId: string,
    stageId: string,
    imageUrl: string,
    teamId?: string
  ): Promise<boolean> => {
    if (!imageUrl.trim()) {
      setError('Image URL is required');
      return false;
    }

    console.log('📤 Submitting stage solution:', { 
      huntId, 
      stageId, 
      teamId, 
      imageUrl: imageUrl.substring(0, 50) + '...' 
    });
    setSubmitting(true);
    setError(null);
    
    try {
      // Using the correct backend route: POST /api/treasure-hunts/{treasureHuntId}/stages/{stageId}/submit
      const payload = { 
        imageUrl: imageUrl.trim(),
        ...(teamId && { teamId })
      };
      
      const response = await api.post<ApiResponse<any>>(
        `/treasure-hunts/${huntId}/stages/${stageId}/submit`,
        payload
      );
      
      if (response.data.success) {
        console.log('✅ Stage submitted successfully');
        // Immediately fetch updated progress
        await fetchProgressInternal(huntId);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to submit stage');
      }
    } catch (err: any) {
      console.error('💥 Submit stage error:', err);
      
      let errorMessage = 'Failed to submit stage';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid submission data. Please check your image URL format.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Stage not found or submission endpoint not available.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to submit for this stage.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchProgressInternal]);

  // Select hunt and load its progress
  const selectHunt = useCallback(async (hunt: TreasureHunt) => {
    console.log('🎯 Selecting hunt:', hunt.title);
    setSelectedHunt(hunt);
    setProgress(null);
    stopPolling();
    await fetchProgressInternal(hunt.id);
  }, [fetchProgressInternal, stopPolling]);

  // Start polling for progress updates
  const startPolling = useCallback((huntId: string, interval: number = 10000) => {
    console.log('🔄 Starting polling for hunt:', huntId);
    stopPolling();
    
    pollingInterval.current = setInterval(() => {
      console.log('🔄 Polling for updates...');
      fetchProgressInternal(huntId);
    }, interval);
  }, [fetchProgressInternal, stopPolling]);

  // Refresh data
  const refresh = useCallback(async (teamId?: string) => {
    console.log('🔄 Refreshing treasure hunt data...', { teamId });
    try {
      const hunts = await fetchAssignedHunts(teamId);
      
      // If we have a selected hunt, refresh its progress
      if (selectedHunt && hunts.find(h => h.id === selectedHunt.id)) {
        await fetchProgressInternal(selectedHunt.id);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [fetchAssignedHunts, selectedHunt, fetchProgressInternal]);

  // Get hunt statistics
  const getHuntStats = useCallback(() => {
    if (!progress) return null;

    const completionPercentage = progress.totalStages > 0 
      ? Math.round((progress.completedStages / progress.totalStages) * 100)
      : 0;

    return {
      totalStages: progress.totalStages,
      completedStages: progress.completedStages,
      pendingStages: progress.pendingStages,
      rejectedStages: progress.rejectedStages,
      completionPercentage,
      isCompleted: progress.completedStages === progress.totalStages && progress.totalStages > 0,
      hasPendingSubmissions: progress.pendingStages > 0,
      hasCurrentStage: !!progress.currentStage,
      nextStageNumber: progress.currentStage?.stageNumber || 1,
    };
  }, [progress]);

  // Check if submission is allowed
  const canSubmit = useCallback(() => {
    if (!progress?.currentStage) return false;
    
    // Check if there's already a pending submission for current stage
    const currentStageNumber = progress.currentStage.stageNumber;
    const currentStageSubmission = progress.submissions.find(
      sub => sub.clue.stageNumber === currentStageNumber && sub.status === 'PENDING'
    );
    
    return !currentStageSubmission;
  }, [progress]);

  // Get current stage submission status
  const getCurrentStageStatus = useCallback(() => {
    if (!progress?.currentStage) return null;
    
    const currentStageNumber = progress.currentStage.stageNumber;
    const submission = progress.submissions.find(
      sub => sub.clue.stageNumber === currentStageNumber
    );
    
    return submission || null;
  }, [progress]);

  // Get submission for a specific stage
  const getStageSubmission = useCallback((stageNumber: number) => {
    if (!progress?.submissions) return null;
    
    return progress.submissions.find(
      sub => sub.clue.stageNumber === stageNumber
    ) || null;
  }, [progress]);

  // Check if a stage is unlocked (can be submitted)
  const isStageUnlocked = useCallback((stageNumber: number) => {
    if (!progress) return false;
    
    // First stage is always unlocked
    if (stageNumber === 1) return true;
    
    // Check if previous stage is completed
    const previousStageSubmission = progress.submissions.find(
      sub => sub.clue.stageNumber === stageNumber - 1
    );
    
    return previousStageSubmission?.status === 'APPROVED';
  }, [progress]);

  // Get all stages with their status
  const getAllStagesWithStatus = useCallback(() => {
    if (!progress) return [];
    
    const stages = [];
    for (let i = 1; i <= progress.totalStages; i++) {
      const submission = getStageSubmission(i);
      const isUnlocked = isStageUnlocked(i);
      const isCurrent = progress.currentStage?.stageNumber === i;
      
      stages.push({
        stageNumber: i,
        submission,
        isUnlocked,
        isCurrent,
        canSubmit: isUnlocked && !submission?.status || submission?.status === 'REJECTED',
        description: isCurrent ? progress.currentStage?.description : `Stage ${i}`,
        id: isCurrent ? progress.currentStage?.id : `stage-${i}`,
      });
    }
    
    return stages;
  }, [progress, getStageSubmission, isStageUnlocked]);

  // Format time remaining
  const getTimeRemaining = useCallback((endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;
    
    if (difference <= 0) return 'Ended';
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    console.log('🔄 Resetting treasure hunt state');
    setAssignedHunts([]);
    setSelectedHunt(null);
    setProgress(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setProgressLoading(false);
    stopPolling();
  }, [stopPolling]);

  return {
    // State
    loading,
    error,
    assignedHunts,
    selectedHunt,
    progress,
    submitting,
    progressLoading,
    
    // Actions
    fetchAssignedHunts,
    fetchProgress,
    submitStage,
    selectHunt,
    refresh,
    clearError,
    reset,
    
    // Polling
    startPolling,
    stopPolling,
    
    // Helpers
    getHuntStats,
    canSubmit,
    getCurrentStageStatus,
    getStageSubmission,
    isStageUnlocked,
    getAllStagesWithStatus,
    getTimeRemaining,
  };
};