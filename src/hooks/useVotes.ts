// hooks/useVotes.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Vote, 
  CreateVoteRequest,
  UpdateVoteRequest, 
  VoteResponse, 
  VotesListResponse,
  CastVoteRequest,
  CastVoteResponse 
} from '../types/votes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

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

export const useVotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new vote
  const createVote = useCallback(async (voteData: CreateVoteRequest): Promise<Vote | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<VoteResponse>('/votes', voteData);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all votes (admin endpoint)
  const getVotes = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<VotesListResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<VotesListResponse>('/votes/admin/all', { params });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch votes';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get votes for users (only available/accessible votes)
  const getUserVotes = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<VotesListResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the regular votes endpoint for users (not admin endpoint)
      const response = await api.get<VotesListResponse>('/votes/admin/all', { params });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch votes';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single vote by ID with user voting status
  const getVoteById = useCallback(async (voteId: string): Promise<Vote | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<VoteResponse>(`/votes/${voteId}`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vote';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's voting status for a specific poll
  const getUserVoteStatus = useCallback(async (voteId: string): Promise<{
    hasVoted: boolean;
    selectedOptions: string[];
    selectedOptionsDetails?: Array<{
      id: string;
      name: string;
      imageUrl?: string;
    }>;
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/votes/${voteId}/my-vote`);
      return response.data.data;
    } catch (err: any) {
      // If 404, user hasn't voted yet
      if (err.response?.status === 404) {
        return { hasVoted: false, selectedOptions: [] };
      }
      const errorMessage = err.response?.data?.message || 'Failed to fetch vote status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cast a vote
  const castVote = useCallback(async (voteData: CastVoteRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post<CastVoteResponse>(`/votes/${voteData.voteId}/cast`, {
        optionIds: voteData.optionIds
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cast vote';
      setError(errorMessage);
      // Don't throw error for "already voted" case or database errors
      if (errorMessage.includes('already voted') || errorMessage.includes('column')) {
        return false;
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update vote (admin endpoint)
  const updateVote = useCallback(async (voteId: string, voteData: UpdateVoteRequest): Promise<Vote | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<VoteResponse>(`/votes/admin/${voteId}`, voteData);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete vote (admin endpoint)
  const deleteVote = useCallback(async (voteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/votes/admin/${voteId}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish vote results
  const publishResults = useCallback(async (voteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post(`/votes/${voteId}/publish-results`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to publish results';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vote statistics (admin)
  const getVoteStats = useCallback(async (): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/votes/admin/stats');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vote statistics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createVote,
    getVotes,
    getUserVotes,
    getVoteById,
    castVote,
    updateVote,
    deleteVote,
    publishResults,
    getVoteStats,
    getUserVoteStatus,
    clearError,
  };
};