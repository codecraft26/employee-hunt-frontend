import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface LeaderCheckResponse {
  success: boolean;
  data: {
    isLeader: boolean;
    userId: string;
  };
}

// Get API base URL
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return 'http://localhost:5000/api';
  }
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const adminTokenCookie = Cookies.get('adminToken');
  const adminTokenLocal = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const regularToken = Cookies.get('token');
  
  const token = adminTokenCookie || adminTokenLocal || regularToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export const useTeamLeadership = () => {
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check if current user is a team leader
  const checkIsTeamLeader = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<LeaderCheckResponse>('/teams/check-leader');
      
      if (response.data.success) {
        const leaderStatus = response.data.data.isLeader;
        setIsLeader(leaderStatus);
        setLastChecked(new Date());
        return leaderStatus;
      } else {
        setIsLeader(false);
        return false;
      }
    } catch (err: any) {
      let errorMessage = 'Failed to check team leadership';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (err.response?.status === 400) {
        errorMessage = 'User not found or invalid request';
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Network error - please check your connection';
      }
      
      setError(errorMessage);
      setIsLeader(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh leadership status
  const refresh = useCallback(async () => {
    return await checkIsTeamLeader();
  }, [checkIsTeamLeader]);

  // Auto-check on mount
  useEffect(() => {
    checkIsTeamLeader();
  }, [checkIsTeamLeader]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLeader,
    loading,
    error,
    lastChecked,
    checkIsTeamLeader,
    refresh,
    clearError,
  };
}; 