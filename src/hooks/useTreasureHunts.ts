// hooks/useTreasureHunts.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface TreasureHuntClue {
  id: string;
  clueNumber: number;
  description: string;
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl?: string;
  adminFeedback?: string;
  submittedBy?: {
    id: string;
    name: string;
    description?: string;
    members?: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>;
  };
  approvedBy?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssignedTeam {
  id: string;
  name: string;
  description?: string;
  members?: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
  }>;
}

export interface TreasureHunt {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startTime: string;
  endTime: string;
  isResultPublished: boolean;
  createdBy: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  assignedTeams: AssignedTeam[];
  clues?: TreasureHuntClue[];
  winningTeam?: {
    id: string;
    name: string;
    description?: string;
    members?: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreasureHuntRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  teamIds: string[];
  stages: Array<{
    stageNumber: number;
    description: string;
  }>;
}

export interface AddClueRequest {
  clueNumber: number;
  description: string;
}

export interface SubmitClueRequest {
  imageUrl: string;
}

export interface ApproveRejectClueRequest {
  feedback?: string;
}

export interface TeamProgress {
  totalClues: number;
  approvedClues: number;
  pendingClues: number;
  rejectedClues: number;
  clues: TreasureHuntClue[];
}

export interface TreasureHuntResponse {
  success: boolean;
  message?: string;
  data: TreasureHunt;
}

export interface TreasureHuntsResponse {
  success: boolean;
  data: TreasureHunt[];
}

export interface TeamProgressResponse {
  success: boolean;
  data: TeamProgress;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useTreasureHunts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treasureHunts, setTreasureHunts] = useState<TreasureHunt[]>([]);
  const [currentTreasureHunt, setCurrentTreasureHunt] = useState<TreasureHunt | null>(null);

  // Create a new treasure hunt
  const createTreasureHunt = useCallback(async (huntData: CreateTreasureHuntRequest): Promise<TreasureHunt | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<TreasureHuntResponse>('/treasure-hunts', huntData);
      
      if (response.data.success) {
        // Refresh treasure hunts list after creation
        await fetchTreasureHunts();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create treasure hunt');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create treasure hunt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all treasure hunts
  const fetchTreasureHunts = useCallback(async (): Promise<TreasureHunt[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TreasureHuntsResponse>('/treasure-hunts');
      
      if (response.data.success) {
        setTreasureHunts(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch treasure hunts');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch treasure hunts';
      setError(errorMessage);
      console.error('Treasure hunts fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch treasure hunt by ID
  const fetchTreasureHuntById = useCallback(async (huntId: string): Promise<TreasureHunt | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TreasureHuntResponse>(`/treasure-hunts/${huntId}`);
      
      if (response.data.success) {
        setCurrentTreasureHunt(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch treasure hunt');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch treasure hunt';
      setError(errorMessage);
      console.error('Treasure hunt fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assigned treasure hunts for current user's team
  const fetchMyAssignedTreasureHunts = useCallback(async (): Promise<TreasureHunt[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TreasureHuntsResponse>('/treasure-hunts/assigned');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch assigned treasure hunts');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch assigned treasure hunts';
      setError(errorMessage);
      console.error('Assigned treasure hunts fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add clue to treasure hunt
  const addClue = useCallback(async (huntId: string, clueData: AddClueRequest): Promise<TreasureHuntClue | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/clues`, clueData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh current treasure hunt if it matches
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        return response.data.data;
      } else {
        throw new Error('Failed to add clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, fetchTreasureHuntById]);

  // Submit clue solution
  const submitClue = useCallback(async (huntId: string, clueId: string, teamId: string, submitData: SubmitClueRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/clues/${clueId}/submit`, {
        ...submitData,
        teamId
      });
      
      if (response.status === 200 || response.status === 201) {
        return true;
      } else {
        throw new Error('Failed to submit clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve clue
  const approveClue = useCallback(async (huntId: string, clueId: string, approvalData: ApproveRejectClueRequest = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/clues/${clueId}/approve`, approvalData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh current treasure hunt if it matches
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        return true;
      } else {
        throw new Error('Failed to approve clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, fetchTreasureHuntById]);

  // Reject clue
  const rejectClue = useCallback(async (huntId: string, clueId: string, rejectionData: ApproveRejectClueRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/clues/${clueId}/reject`, rejectionData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh current treasure hunt if it matches
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        return true;
      } else {
        throw new Error('Failed to reject clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, fetchTreasureHuntById]);

  // Declare winner
  const declareWinner = useCallback(async (huntId: string, teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/winner`, { teamId });
      
      if (response.status === 200 || response.status === 201) {
        // Refresh treasure hunts and current hunt
        await Promise.all([
          fetchTreasureHunts(),
          currentTreasureHunt?.id === huntId ? fetchTreasureHuntById(huntId) : Promise.resolve()
        ]);
        return true;
      } else {
        throw new Error('Failed to declare winner');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to declare winner';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTreasureHunts, currentTreasureHunt, fetchTreasureHuntById]);

  // Get team progress for a treasure hunt
  const getTeamProgress = useCallback(async (huntId: string, teamId: string): Promise<TeamProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TeamProgressResponse>(`/treasure-hunts/${huntId}/progress/${teamId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch team progress');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch team progress';
      setError(errorMessage);
      console.error('Team progress fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get hunt statistics
  const getHuntStats = useCallback((huntId: string) => {
    try {
      const hunt = treasureHunts.find(h => h.id === huntId);
      if (!hunt) {
        console.warn(`Hunt with ID ${huntId} not found`);
        return null;
      }

      // Safe access to arrays with fallbacks
      const clues = hunt.clues || [];
      const assignedTeams = hunt.assignedTeams || [];

      const totalClues = clues.length;
      const completedClues = clues.filter(c => c.status === 'APPROVED').length;
      const pendingClues = clues.filter(c => c.status === 'PENDING').length;
      const rejectedClues = clues.filter(c => c.status === 'REJECTED').length;

      return {
        totalTeams: assignedTeams.length,
        totalClues,
        completedClues,
        pendingClues,
        rejectedClues,
        completionRate: totalClues > 0 ? Math.round((completedClues / totalClues) * 100) : 0,
        status: hunt.status || 'UNKNOWN',
        isActive: hunt.status === 'ACTIVE',
        isCompleted: hunt.status === 'COMPLETED',
        hasWinner: !!(hunt.winningTeam && hunt.winningTeam.id),
      };
    } catch (error) {
      console.error('Error in getHuntStats:', error, { huntId, treasureHunts });
      return {
        totalTeams: 0,
        totalClues: 0,
        completedClues: 0,
        pendingClues: 0,
        rejectedClues: 0,
        completionRate: 0,
        status: 'UNKNOWN',
        isActive: false,
        isCompleted: false,
        hasWinner: false,
      };
    }
  }, [treasureHunts]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset current treasure hunt
  const resetCurrentTreasureHunt = useCallback(() => {
    setCurrentTreasureHunt(null);
  }, []);

  return {
    loading,
    error,
    treasureHunts,
    currentTreasureHunt,
    createTreasureHunt,
    fetchTreasureHunts,
    fetchTreasureHuntById,
    fetchMyAssignedTreasureHunts,
    addClue,
    submitClue,
    approveClue,
    rejectClue,
    declareWinner,
    getTeamProgress,
    getHuntStats,
    clearError,
    resetCurrentTreasureHunt,
  };
};