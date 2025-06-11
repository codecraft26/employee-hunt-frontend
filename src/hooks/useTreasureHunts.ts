// hooks/useTreasureHunts.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface ClueSubmission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl: string;
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  clue: {
    id: string;
    stageNumber: number;
    description: string;
    imageUrl?: string;
    status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    adminFeedback?: string;
    createdAt: string;
    updatedAt: string;
  };
  team: {
    id: string;
    name: string;
    description?: string;
    score: number;
    createdAt: string;
    updatedAt: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TreasureHuntClue {
  id: string;
  clueNumber?: number; // For backward compatibility
  stageNumber: number;
  description: string;
  imageUrl?: string;
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  submissions?: ClueSubmission[]; // For admin view
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

export interface TreasureHuntWithClues extends TreasureHunt {
  clues: TreasureHuntClue[];
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

export interface UpdateTreasureHuntRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  teamIds?: string[];
}

export interface AddClueRequest {
  clueNumber?: number; // For backward compatibility
  stageNumber: number;
  description: string;
  imageUrl?: string;
}

export interface UpdateClueRequest {
  stageNumber?: number;
  description?: string;
  imageUrl?: string;
  status?: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
}

export interface SubmitClueRequest {
  imageUrl: string;
}

export interface ApproveRejectClueRequest {
  feedback?: string;
}

export interface ApproveRejectSubmissionRequest {
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

export interface TreasureHuntWithCluesResponse {
  success: boolean;
  message?: string;
  data: TreasureHuntWithClues;
}

export interface TreasureHuntsResponse {
  success: boolean;
  data: TreasureHunt[];
}

export interface ClueResponse {
  success: boolean;
  message?: string;
  data: TreasureHuntClue;
}

export interface TeamProgressResponse {
  success: boolean;
  data: TeamProgress;
}

export interface SubmissionsResponse {
  success: boolean;
  data: ClueSubmission[];
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
  const [currentTreasureHuntWithClues, setCurrentTreasureHuntWithClues] = useState<TreasureHuntWithClues | null>(null);
  const [submissions, setSubmissions] = useState<ClueSubmission[]>([]);

  // Create a new treasure hunt
  const createTreasureHunt = useCallback(async (huntData: CreateTreasureHuntRequest): Promise<TreasureHunt | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<TreasureHuntResponse>('/treasure-hunts', huntData);
      
      if (response.data.success) {
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

  // Fetch treasure hunt with clues by ID (for admin clue management)
  const fetchTreasureHuntWithClues = useCallback(async (huntId: string): Promise<TreasureHuntWithClues | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TreasureHuntWithCluesResponse>(`/treasure-hunts/${huntId}`);
      
      if (response.data.success) {
        setCurrentTreasureHuntWithClues(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch treasure hunt with clues');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch treasure hunt with clues';
      setError(errorMessage);
      console.error('Treasure hunt with clues fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // NEW: Fetch all submissions for a treasure hunt
  const fetchTreasureHuntSubmissions = useCallback(async (huntId: string): Promise<ClueSubmission[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<SubmissionsResponse>(`/treasure-hunts/${huntId}/submissions`);
      
      if (response.data.success) {
        setSubmissions(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch treasure hunt submissions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch treasure hunt submissions';
      setError(errorMessage);
      console.error('Treasure hunt submissions fetch error:', err);
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

  // Update treasure hunt
  const updateTreasureHunt = useCallback(async (huntId: string, updateData: UpdateTreasureHuntRequest): Promise<TreasureHunt | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<TreasureHuntResponse>(`/treasure-hunts/${huntId}`, updateData);
      
      if (response.data.success) {
        await Promise.all([
          fetchTreasureHunts(),
          currentTreasureHunt?.id === huntId ? fetchTreasureHuntById(huntId) : Promise.resolve(),
          currentTreasureHuntWithClues?.id === huntId ? fetchTreasureHuntWithClues(huntId) : Promise.resolve()
        ]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update treasure hunt');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update treasure hunt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTreasureHunts, currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // Delete treasure hunt
  const deleteTreasureHunt = useCallback(async (huntId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/treasure-hunts/${huntId}`);
      
      if (response.status === 200 || response.status === 204) {
        await fetchTreasureHunts();
        if (currentTreasureHunt?.id === huntId) {
          setCurrentTreasureHunt(null);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          setCurrentTreasureHuntWithClues(null);
        }
        return true;
      } else {
        throw new Error('Failed to delete treasure hunt');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete treasure hunt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTreasureHunts, currentTreasureHunt, currentTreasureHuntWithClues]);

  // Add clue to treasure hunt
  const addClue = useCallback(async (huntId: string, clueData: AddClueRequest): Promise<TreasureHuntClue | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<ClueResponse>(`/treasure-hunts/${huntId}/clues`, clueData);
      
      if (response.data.success) {
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
        }
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // Update clue
  const updateClue = useCallback(async (huntId: string, clueId: string, updateData: UpdateClueRequest): Promise<TreasureHuntClue | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<ClueResponse>(`/treasure-hunts/${huntId}/clues/${clueId}`, updateData);
      
      if (response.data.success) {
        // Refresh the treasure hunt data
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
        }
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // Delete clue
  const deleteClue = useCallback(async (huntId: string, clueId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/treasure-hunts/${huntId}/clues/${clueId}`);
      
      if (response.status === 200 || response.status === 204) {
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
        }
        return true;
      } else {
        throw new Error('Failed to delete clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

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
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
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
  }, [currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // Reject clue
  const rejectClue = useCallback(async (huntId: string, clueId: string, rejectionData: ApproveRejectClueRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/clues/${clueId}/reject`, rejectionData);
      
      if (response.status === 200 || response.status === 201) {
        if (currentTreasureHunt?.id === huntId) {
          await fetchTreasureHuntById(huntId);
        }
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
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
  }, [currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // NEW: Approve submission
  const approveSubmission = useCallback(async (huntId: string, submissionId: string, approvalData: ApproveRejectSubmissionRequest = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Approving submission:', { 
        huntId, 
        submissionId, 
        approvalData,
        endpoint: `/treasure-hunts/${huntId}/submissions/${submissionId}/approve`
      });
      
      const response = await api.post(`/treasure-hunts/${huntId}/submissions/${submissionId}/approve`, approvalData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh submissions data
        await fetchTreasureHuntSubmissions(huntId);
        
        // Also refresh treasure hunt data if loaded
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
        }
        return true;
      } else {
        throw new Error('Failed to approve submission');
      }
    } catch (err: any) {
      console.error('Approval error:', {
        error: err,
        response: err.response?.data,
        huntId,
        submissionId
      });
      const errorMessage = err.response?.data?.message || 'Failed to approve submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHuntWithClues, fetchTreasureHuntWithClues, fetchTreasureHuntSubmissions]);

  // NEW: Reject submission
  const rejectSubmission = useCallback(async (huntId: string, submissionId: string, rejectionData: ApproveRejectSubmissionRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/submissions/${submissionId}/reject`, rejectionData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh submissions data
        await fetchTreasureHuntSubmissions(huntId);
        
        // Also refresh treasure hunt data if loaded
        if (currentTreasureHuntWithClues?.id === huntId) {
          await fetchTreasureHuntWithClues(huntId);
        }
        return true;
      } else {
        throw new Error('Failed to reject submission');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTreasureHuntWithClues, fetchTreasureHuntWithClues, fetchTreasureHuntSubmissions]);

  // Declare winner
  const declareWinner = useCallback(async (huntId: string, teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/winner`, { teamId });
      
      if (response.status === 200 || response.status === 201) {
        await Promise.all([
          fetchTreasureHunts(),
          currentTreasureHunt?.id === huntId ? fetchTreasureHuntById(huntId) : Promise.resolve(),
          currentTreasureHuntWithClues?.id === huntId ? fetchTreasureHuntWithClues(huntId) : Promise.resolve()
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
  }, [fetchTreasureHunts, currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

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
      const hunt = treasureHunts.find((h: TreasureHunt) => h.id === huntId);
      if (!hunt) {
        console.warn(`Hunt with ID ${huntId} not found`);
        return null;
      }

      const clues = hunt.clues || [];
      const assignedTeams = hunt.assignedTeams || [];

      const totalClues = clues.length;
      const completedClues = clues.filter((c: TreasureHuntClue) => c.status === 'APPROVED').length;
      const pendingClues = clues.filter((c: TreasureHuntClue) => c.status === 'PENDING').length;
      const rejectedClues = clues.filter((c: TreasureHuntClue) => c.status === 'REJECTED').length;

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

  // NEW: Get submission statistics
  const getSubmissionStats = useCallback(() => {
    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
    const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED').length;
    const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED').length;

    return {
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      approvalRate: totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0,
    };
  }, [submissions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset current treasure hunt
  const resetCurrentTreasureHunt = useCallback(() => {
    setCurrentTreasureHunt(null);
    setCurrentTreasureHuntWithClues(null);
    setSubmissions([]);
  }, []);

  return {
    loading,
    error,
    treasureHunts,
    currentTreasureHunt,
    currentTreasureHuntWithClues,
    submissions,
    createTreasureHunt,
    updateTreasureHunt,
    deleteTreasureHunt,
    fetchTreasureHunts,
    fetchTreasureHuntById,
    fetchTreasureHuntWithClues,
    fetchTreasureHuntSubmissions,
    fetchMyAssignedTreasureHunts,
    addClue,
    updateClue,
    deleteClue,
    submitClue,
    approveClue,
    rejectClue,
    approveSubmission,
    rejectSubmission,
    declareWinner,
    getTeamProgress,
    getHuntStats,
    getSubmissionStats,
    clearError,
    resetCurrentTreasureHunt,
  };
};