// hooks/useTeams.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeCode?: string | null;
  gender?: string | null;
  profileImage?: string | null;
  department?: string | null;
  hobbies?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  score: number;
  leader?: TeamLeader | null;
  leaderId?: string | null;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface TeamLeader {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string | null;
  department?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  team: Team | null;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  leaderId?: string;
  memberIds?: string[];
}

export interface AddMemberRequest {
  teamId: string;
  userId: string;
}

export interface RemoveMemberRequest {
  teamId: string;
  userId: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
  data: Team;
}

export interface MyTeamResponse {
  success: boolean;
  data: Team;
}

export interface TeamsResponse {
  success: boolean;
  data: Team[];
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface LeaderCheckResponse {
  success: boolean;
  data: {
    isLeader: boolean;
    userId: string;
  };
}

// Get API base URL and ensure it's properly configured
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_API_URL environment variable is not set');
    return 'http://localhost:5000/api'; // fallback for development
  }
  
  // Ensure the URL ends with /api if it doesn't already
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    // Get authentication token with priority: adminToken > localStorage adminToken > regular token
    const adminTokenCookie = Cookies.get('adminToken');
    const adminTokenLocal = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const regularToken = Cookies.get('token');
    
    const token = adminTokenCookie || adminTokenLocal || regularToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized access - token may be invalid');
      // Optionally clear tokens and redirect to login
      // Cookies.remove('token');
      // Cookies.remove('adminToken');
      // localStorage.removeItem('adminToken');
    }
    
    return Promise.reject(error);
  }
);

// Debug function to test API connectivity
export const debugApiConnection = async () => {
  try {
    console.log('🔍 Debug: Testing API connection...');
    console.log('API Base URL:', API_BASE_URL);
    
    const token = Cookies.get('adminToken') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) || 
                  Cookies.get('token');
    
    console.log('Token available:', !!token);
    console.log('Token type:', token ? (token.length > 100 ? 'JWT' : 'Simple') : 'None');
    
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    console.log('Connection test result:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    console.error('🔴 API connection test failed:', error);
    return false;
  }
};

export const useTeams = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  // Helper function to handle API errors consistently
  const handleApiError = (err: any, defaultMessage: string): string => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.status === 401) {
      return 'Authentication failed. Please login again.';
    }
    if (err.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (err.response?.status === 404) {
      return 'Resource not found.';
    }
    if (err.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    return err.message || defaultMessage;
  };

  // API request helper with better error handling
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = Cookies.get('adminToken') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) || 
                  Cookies.get('token');
    if (!token) {
      throw new Error('No authentication token available');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    const token = Cookies.get('adminToken') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) || 
                  Cookies.get('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Connected successfully' : 'Connection failed'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: 'Connection error'
      };
    }
  };

  // Fetch all teams
  const fetchTeams = useCallback(async (): Promise<Team[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams');
      
      if (response.success) {
        setTeams(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch teams');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create team
  const createTeam = useCallback(async (teamData: CreateTeamRequest): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create team');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create team');
      console.error('❌ Create team error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Get current user's team
  const fetchMyTeam = useCallback(async (): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams/my-team');
      
      if (response.success && response.data) {
        setMyTeam(response.data);
        return response.data;
      } else {
        setMyTeam(null);
        return null;
      }
    } catch (error) {
      setMyTeam(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async (): Promise<User[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/users/all');
      
      if (response.success) {
        setUsers(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add member to team
  const addMemberToTeam = useCallback(async (memberData: AddMemberRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add member');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Remove member from team
  const removeMemberFromTeam = useCallback(async (teamId: string, userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        teamId,
        userId,
      };

      const response = await apiRequest('/teams/members/remove', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to remove member');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Remove member from team (alternative method)
  const removeMemberFromTeamAlt = useCallback(async (teamId: string, userId: string, method: 'DELETE' | 'POST' = 'DELETE'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        teamId,
        userId,
      };

      const response = await apiRequest('/teams/members/remove', {
        method,
        body: JSON.stringify(requestData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to remove member');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Update team
  const updateTeam = useCallback(async (teamId: string, teamData: Partial<CreateTeamRequest>): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(teamData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update team');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Delete team
  const deleteTeam = useCallback(async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete team');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Calculate team statistics
  const getTeamStats = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      console.warn('⚠️ Team not found for stats:', teamId);
      return null;
    }

    const stats = {
      memberCount: team.members.length,
      totalScore: team.score,
      averageScore: team.members.length > 0 ? Math.round((team.score / team.members.length) * 100) / 100 : 0,
      departments: [...new Set(team.members.map(m => m.department).filter(Boolean))],
      roles: [...new Set(team.members.map(m => m.role))],
      genders: [...new Set(team.members.map(m => m.gender).filter(Boolean))],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    };
    
    return stats;
  }, [teams]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchTeams(),
        fetchUsers(),
        fetchMyTeam()
      ]);
    } catch (error) {
      throw error;
    }
  }, [fetchTeams, fetchUsers, fetchMyTeam]);

  // Get available users (users not in any team)
  const getAvailableUsers = useCallback(() => {
    const teamMemberIds = new Set();
    teams.forEach(team => {
      team.members?.forEach(member => {
        teamMemberIds.add(member.id);
      });
    });

    return users.filter(user => !teamMemberIds.has(user.id));
  }, [teams, users]);

  // Get users in a specific team
  const getUsersInTeam = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.members || [];
  }, [teams]);

  // Create team with leader and members
  const createTeamWithLeader = useCallback(async (teamData: CreateTeamRequest): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams/with-leader', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create team with leader');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Assign team leader
  const assignTeamLeader = useCallback(async (teamId: string, leaderId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/teams/assign-leader', {
        method: 'POST',
        body: JSON.stringify({ teamId, leaderId }),
      });

      if (response.success) {
        // Refresh teams list
        await fetchTeams();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to assign team leader');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Check if current user is team leader
  const checkIfUserIsTeamLeader = useCallback(async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/teams/${teamId}/is-leader`);
      
      if (response.success) {
        return response.data.isLeader;
      } else {
        throw new Error(response.message || 'Failed to check leadership status');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    teams,
    users,
    myTeam,
    
    // Team operations
    createTeam,
    createTeamWithLeader,
    updateTeam,
    deleteTeam,
    
    // Leader operations
    assignTeamLeader,
    
    // Member operations
    addMemberToTeam,
    removeMemberFromTeam,
    removeMemberFromTeamAlt,
    
    // Data fetching
    fetchTeams,
    fetchUsers,
    fetchMyTeam,
    refreshAll,
    
    // Utility functions
    getTeamStats,
    getAvailableUsers,
    getUsersInTeam,
    clearError,
    
    // Debug functions
    debugApiConnection,
    
    // Leadership check function
    checkIfUserIsTeamLeader,
  };
};