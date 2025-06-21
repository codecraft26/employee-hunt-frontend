// hooks/useTreasureHunts.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TeamMemberSubmission } from '../types/teams';

// Enhanced types for new multi-stage treasure hunt system
export interface TreasureHuntStage {
  id: string;
  stageNumber: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSubmission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl: string;
  description: string;
  team: {
    id: string;
    name: string;
  };
  submittedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  adminFeedback?: string;
  createdAt: string;
  clue: {
    id: string;
    stageNumber: number;
    description: string;
  };
}

export interface TeamProgress {
  teamId: string;
  teamName: string;
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
  submissions: TeamSubmission[];
}

export interface StageSubmissions {
  stageNumber: number;
  stageDescription: string;
  submissions: TeamSubmission[];
}

export interface AllTeamsProgress {
  teamId: string;
  teamName: string;
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
  submissions: TeamSubmission[];
}

export interface CurrentStage {
  currentStage: {
    id: string;
    stageNumber: number;
    description: string;
  };
  completedStages: number;
  totalStages: number;
  isCompleted: boolean;
}

// Legacy types for backward compatibility
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
  status: 'UPCOMING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
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
  stages?: TreasureHuntStage[]; // New multi-stage support
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
  stages: TreasureHuntStage[];
}

// Enhanced request interfaces for new API
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
  status?: 'UPCOMING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
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

export interface DeclareWinnerRequest {
  teamId: string;
}

// New interfaces for enhanced workflow
export interface TeamMemberSubmitRequest {
  teamId: string;
  description: string;
  image: File;
}

export interface LeaderSubmitToAdminRequest {
  selectedSubmissionIds: string[]; // Frontend sends array, backend expects selectedSubmissionId (singular)
  leaderNotes?: string;
}

export interface AdminApproveSubmissionRequest {
  feedback?: string;
}

export interface AdminRejectSubmissionRequest {
  feedback: string;
}

// Enhanced interface for team submissions with detailed member submission info
export interface TeamClueSubmissionEnhanced {
  id: string;
  imageUrl: string; // Primary image for backward compatibility
  imageUrls: string[]; // Multiple selected images
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  leaderNotes?: string;
  adminFeedback?: string;
  submittedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  selectedSubmissionIds: string[];
  selectedSubmissions?: TeamMemberSubmission[]; // Detailed member submission data
  clueId: string;
  teamId: string;
  treasureHuntId: string;
  team?: {
    id: string;
    name: string;
  };
  createdAt: string;
  approvedAt?: string;
}

// Legacy interface for backward compatibility
export interface TeamProgress {
  totalClues: number;
  approvedClues: number;
  pendingClues: number;
  rejectedClues: number;
  clues: TreasureHuntClue[];
}

// API Response interfaces
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

export interface TeamSubmissionsResponse {
  success: boolean;
  data: TeamClueSubmissionEnhanced[];
}

export interface MemberSubmissionResponse {
  success: boolean;
  message?: string;
  data: TeamMemberSubmission;
}

export interface LeaderSubmissionResponse {
  success: boolean;
  message?: string;
  data: TeamClueSubmissionEnhanced;
}

// New response interfaces for enhanced API
export interface StageSubmissionsResponse {
  success: boolean;
  message?: string;
  data: StageSubmissions[];
}

export interface AllTeamsProgressResponse {
  success: boolean;
  data: AllTeamsProgress[];
}

export interface CurrentStageResponse {
  success: boolean;
  message?: string;
  data: CurrentStage;
}

// Interface for teams with progress for winner declaration
export interface TeamForWinner {
  teamId: string;
  teamName: string;
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
  completionPercentage: number;
  lastSubmissionTime: string;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  submissions: Array<{
    id: string;
    stageNumber: number;
    status: string;
    imageUrl: string;
    description: string;
    createdAt: string;
  }>;
}

export interface TeamsForWinnerResponse {
  success: boolean;
  message?: string;
  data: TeamForWinner[];
}

// API service setup
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token with admin priority
api.interceptors.request.use((config) => {
  // Get authentication token with priority: adminToken > localStorage adminToken > regular token
  const adminTokenCookie = Cookies.get('adminToken');
  const adminTokenLocal = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const regularToken = Cookies.get('token');
  
  const token = adminTokenCookie || adminTokenLocal || regularToken;
  
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

  // Create a new treasure hunt with stages
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

  // Fetch all submissions for a treasure hunt (admin review)
  const fetchTreasureHuntSubmissionsForReview = useCallback(async (huntId: string): Promise<StageSubmissions[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<StageSubmissionsResponse>(`/treasure-hunts/${huntId}/submissions/review`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch treasure hunt submissions for review');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch treasure hunt submissions for review';
      setError(errorMessage);
      console.error('Treasure hunt submissions review fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all teams progress for a treasure hunt
  const fetchAllTeamsProgress = useCallback(async (huntId: string): Promise<AllTeamsProgress[] | null> => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 Fetching all teams progress for hunt:', huntId);
    
    try {
      const response = await api.get<AllTeamsProgressResponse>(`/treasure-hunts/${huntId}/teams-progress`);
      
      console.log('📊 All teams progress API response:', {
        status: response.status,
        data: response.data,
        success: response.data.success,
        teamsCount: response.data.data?.length
      });
      
      if (response.data.success) {
        const teams = response.data.data;
        console.log('✅ Teams progress data:', teams);
        if (teams) {
          teams.forEach(team => {
            console.log(`  - Team: ${team.teamName} (ID: ${team.teamId})`);
          });
        }
        return teams;
      } else {
        throw new Error('Failed to fetch all teams progress');
      }
    } catch (err: any) {
      console.error('❌ All teams progress fetch error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 'Failed to fetch all teams progress';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch teams for winner declaration
  const fetchTeamsForWinner = useCallback(async (huntId: string): Promise<TeamForWinner[] | null> => {
    setLoading(true);
    setError(null);
    
    console.log('🏆 Fetching teams for winner declaration:', huntId);
    
    try {
      const response = await api.get<TeamsForWinnerResponse>(`/treasure-hunts/${huntId}/teams-for-winner`);
      
      console.log('📊 Teams for winner API response:', {
        status: response.status,
        data: response.data,
        success: response.data.success,
        teamsCount: response.data.data?.length
      });
      
      if (response.data.success) {
        const teams = response.data.data;
        console.log('✅ Teams for winner data:', teams);
        if (teams) {
          teams.forEach(team => {
            console.log(`  - Team: ${team.teamName} (ID: ${team.teamId}) - ${team.completionPercentage}% complete`);
            console.log(`    Members: ${team.teamMembers.length}, Last submission: ${team.lastSubmissionTime}`);
          });
        }
        return teams;
      } else {
        throw new Error('Failed to fetch teams for winner declaration');
      }
    } catch (err: any) {
      console.error('❌ Teams for winner fetch error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 'Failed to fetch teams for winner declaration';
      setError(errorMessage);
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

  // Assign teams to treasure hunt
  const assignTeamsToTreasureHunt = useCallback(async (huntId: string, teamIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/assign-teams`, { teamIds });
      
      if (response.data.success) {
        await fetchTreasureHuntById(huntId);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to assign teams');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to assign teams';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTreasureHuntById]);

  // Get assigned teams for a treasure hunt
  const getAssignedTeams = useCallback(async (huntId: string): Promise<AssignedTeam[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/treasure-hunts/${huntId}/assigned-teams`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch assigned teams');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch assigned teams';
      setError(errorMessage);
      console.error('Assigned teams fetch error:', err);
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

  // Approve team submission
  const approveTeamSubmission = useCallback(async (huntId: string, submissionId: string, feedback?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/submissions/${submissionId}/approve`, { feedback });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to approve submission');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject team submission
  const rejectTeamSubmission = useCallback(async (huntId: string, submissionId: string, feedback: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/submissions/${submissionId}/reject`, { feedback });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to reject submission');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Declare winner
  const declareWinner = useCallback(async (huntId: string, teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    console.log('🏆 Declare Winner API Call:', {
      huntId,
      teamId,
      endpoint: `/treasure-hunts/${huntId}/declare-winner`,
      requestBody: { teamId }
    });
    
    try {
      const response = await api.post(`/treasure-hunts/${huntId}/declare-winner`, { teamId });
      
      console.log('✅ Declare Winner API Response:', {
        status: response.status,
        data: response.data,
        success: response.data.success
      });
      
      if (response.data.success) {
        await Promise.all([
          fetchTreasureHunts(),
          currentTreasureHunt?.id === huntId ? fetchTreasureHuntById(huntId) : Promise.resolve(),
          currentTreasureHuntWithClues?.id === huntId ? fetchTreasureHuntWithClues(huntId) : Promise.resolve()
        ]);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to declare winner');
      }
    } catch (err: any) {
      console.error('❌ Declare winner error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        huntId,
        teamId
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to declare winner';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTreasureHunts, currentTreasureHunt, currentTreasureHuntWithClues, fetchTreasureHuntById, fetchTreasureHuntWithClues]);

  // Get team progress for a treasure hunt
  const getTeamProgress = useCallback(async (huntId: string, teamId?: string): Promise<TeamProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = teamId 
        ? `/treasure-hunts/${huntId}/progress?teamId=${teamId}`
        : `/treasure-hunts/${huntId}/progress`;
      
      const response = await api.get<TeamProgressResponse>(url);
      
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

  // Get current stage for a team
  const getCurrentStage = useCallback(async (huntId: string): Promise<CurrentStage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CurrentStageResponse>(`/treasure-hunts/${huntId}/current-stage`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch current stage');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch current stage';
      setError(errorMessage);
      console.error('Current stage fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit member clue (team member submission)
  const submitMemberClue = useCallback(async (clueId: string, submitData: TeamMemberSubmitRequest): Promise<TeamMemberSubmission | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', submitData.image);
      formData.append('teamId', submitData.teamId);
      formData.append('description', submitData.description);

      const response = await api.post<MemberSubmissionResponse>(
        `/team-member-submissions/clues/${clueId}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit member clue');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit member clue';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get member submissions for review (team leader)
  const getMemberSubmissionsForReview = useCallback(async (teamId: string, clueId: string): Promise<TeamMemberSubmission[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/team-member-submissions/teams/${teamId}/clues/${clueId}/review`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch member submissions for review');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch member submissions for review';
      setError(errorMessage);
      console.error('Member submissions review fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leader submits to admin
  const leaderSubmitToAdmin = useCallback(async (teamId: string, clueId: string, submitData: LeaderSubmitToAdminRequest): Promise<TeamClueSubmissionEnhanced | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Debug logging
      console.log('🔍 Leader Submit to Admin - Request Data:', {
        teamId,
        clueId,
        submitData,
        selectedSubmissionIds: submitData.selectedSubmissionIds,
        selectedSubmissionIdsLength: submitData.selectedSubmissionIds?.length,
        leaderNotes: submitData.leaderNotes
      });

      // Validate that we have selected submissions
      if (!submitData.selectedSubmissionIds || submitData.selectedSubmissionIds.length === 0) {
        throw new Error('No submissions selected. Please select at least one submission.');
      }

      // Convert to backend expected format - use first selected submission ID
      const requestData = {
        selectedSubmissionId: submitData.selectedSubmissionIds[0], // Backend expects singular
        leaderNotes: submitData.leaderNotes || ''
      };

      console.log('📤 Final request data being sent:', requestData);

      const response = await api.post<LeaderSubmissionResponse>(
        `/team-member-submissions/teams/${teamId}/clues/${clueId}/progress-to-next`,
        requestData
      );

      console.log('✅ Leader Submit to Admin - Response:', response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit to admin');
      }
    } catch (err: any) {
      console.error('❌ Leader Submit to Admin - Error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        teamId,
        clueId,
        submitData
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit to admin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get my submissions
  const getMySubmissions = useCallback(async (teamId: string, clueId: string, userId: string): Promise<TeamMemberSubmission[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/team-member-submissions/teams/${teamId}/clues/${clueId}/my-submissions`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch my submissions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch my submissions';
      setError(errorMessage);
      console.error('My submissions fetch error:', err);
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
      const stages = hunt.stages || [];
      const assignedTeams = hunt.assignedTeams || [];

      // Handle both clues with stageNumber and separate stages array
      const totalClues = clues.length;
      const totalStages = stages.length || clues.length; // Use clues length if no separate stages
      const completedClues = clues.filter((c: TreasureHuntClue) => c.status === 'APPROVED').length;
      const completedStages = stages.filter((s: TreasureHuntStage) => s.status === 'APPROVED').length;
      const pendingClues = clues.filter((c: TreasureHuntClue) => c.status === 'PENDING').length;
      const pendingStages = stages.filter((s: TreasureHuntStage) => s.status === 'PENDING').length;
      const rejectedClues = clues.filter((c: TreasureHuntClue) => c.status === 'REJECTED').length;
      const rejectedStages = stages.filter((s: TreasureHuntStage) => s.status === 'REJECTED').length;

      // Use the appropriate completion counts based on what's available
      const effectiveCompleted = completedStages > 0 ? completedStages : completedClues;
      const effectivePending = pendingStages > 0 ? pendingStages : pendingClues;
      const effectiveRejected = rejectedStages > 0 ? rejectedStages : rejectedClues;
      const effectiveTotal = totalStages > 0 ? totalStages : totalClues;

      return {
        totalTeams: assignedTeams.length,
        totalClues,
        totalStages,
        completedClues,
        completedStages,
        pendingClues,
        pendingStages,
        rejectedClues,
        rejectedStages,
        completionRate: totalClues > 0 ? Math.round((completedClues / totalClues) * 100) : 0,
        stageCompletionRate: effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : 0,
        status: hunt.status || 'UNKNOWN',
        isActive: hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS',
        isCompleted: hunt.status === 'COMPLETED',
        hasWinner: !!(hunt.winningTeam && hunt.winningTeam.id),
        canDeclareWinner: (hunt.status === 'ACTIVE' || hunt.status === 'IN_PROGRESS' || hunt.status === 'COMPLETED') && !hunt.winningTeam,
      };
    } catch (error) {
      console.error('Error in getHuntStats:', error, { huntId, treasureHunts });
      return {
        totalTeams: 0,
        totalClues: 0,
        totalStages: 0,
        completedClues: 0,
        completedStages: 0,
        pendingClues: 0,
        pendingStages: 0,
        rejectedClues: 0,
        rejectedStages: 0,
        completionRate: 0,
        stageCompletionRate: 0,
        status: 'UNKNOWN',
        isActive: false,
        isCompleted: false,
        hasWinner: false,
        canDeclareWinner: false,
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
    setCurrentTreasureHuntWithClues(null);
  }, []);

  return {
    // State
    loading,
    error,
    treasureHunts,
    currentTreasureHunt,
    currentTreasureHuntWithClues,
    submissions,
    
    // Admin Actions
    createTreasureHunt,
    fetchTreasureHunts,
    fetchTreasureHuntById,
    fetchTreasureHuntWithClues,
    fetchTreasureHuntSubmissionsForReview,
    fetchAllTeamsProgress,
    fetchTeamsForWinner,
    updateTreasureHunt,
    deleteTreasureHunt,
    assignTeamsToTreasureHunt,
    getAssignedTeams,
    addClue,
    updateClue,
    deleteClue,
    approveTeamSubmission,
    rejectTeamSubmission,
    declareWinner,
    
    // User Actions
    fetchMyAssignedTreasureHunts,
    getTeamProgress,
    getCurrentStage,
    submitMemberClue,
    getMemberSubmissionsForReview,
    leaderSubmitToAdmin,
    getMySubmissions,
    
    // Helpers
    getHuntStats,
    clearError,
    resetCurrentTreasureHunt,
  };
};