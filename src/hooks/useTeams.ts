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
    
         // Enhanced logging for debugging
     try {
       console.log('🚀 API Request:', {
         method: config.method?.toUpperCase() || 'UNKNOWN',
         url: `${config.baseURL || ''}${config.url || ''}`,
         hasToken: !!token,
         tokenType: (adminTokenCookie || adminTokenLocal) ? 'admin' : 'regular',
         data: config.data || null,
         timestamp: new Date().toISOString()
       });
     } catch (logError) {
       console.warn('Failed to log API request:', logError);
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
         try {
       console.log('✅ API Response Success:', {
         method: response.config?.method?.toUpperCase() || 'UNKNOWN',
         url: response.config?.url || 'UNKNOWN',
         status: response.status || 0,
         statusText: response.statusText || 'UNKNOWN',
         success: response.data?.success || false,
         dataType: Array.isArray(response.data?.data) ? 'array' : typeof response.data?.data,
         timestamp: new Date().toISOString()
       });
     } catch (logError) {
       console.warn('Failed to log API response:', logError);
     }
    return response;
  },
  (error) => {
         try {
       console.error('❌ API Response Error:', {
         method: error.config?.method?.toUpperCase() || 'UNKNOWN',
         url: error.config?.url || 'UNKNOWN',
         status: error.response?.status || 0,
         statusText: error.response?.statusText || 'UNKNOWN',
         message: error.response?.data?.message || error.message || 'Unknown error',
         data: error.response?.data || null,
         timestamp: new Date().toISOString()
       });
     } catch (logError) {
       console.warn('Failed to log API error:', logError);
     }
    
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

  // Create a new team
  const createTeam = useCallback(async (teamData: CreateTeamRequest): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏗️ Creating team:', teamData);
      
      const response = await api.post<{ success: boolean; data: Team }>('/teams', teamData);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Team created successfully:', response.data.data);
        // Refresh teams list after creation
        await fetchTeams();
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to create team');
      console.error('❌ Create team error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's team
  const fetchMyTeam = useCallback(async (): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 Fetching my team...');
      
      const response = await api.get<MyTeamResponse>('/teams/my-team');
      
      if (response.data.success && response.data.data) {
        console.log('✅ My team fetched successfully:', response.data.data);
        setMyTeam(response.data.data);
        return response.data.data;
      } else {
        setMyTeam(null);
        return null;
      }
    } catch (err: any) {
      // Handle case where user is not part of any team (404)
      if (err.response?.status === 404) {
        console.log('ℹ️ User is not part of any team');
        setMyTeam(null);
        return null;
      }
      
      const errorMessage = handleApiError(err, 'Failed to fetch your team');
      console.error('❌ Fetch my team error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all teams
  const fetchTeams = useCallback(async (): Promise<Team[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching all teams...');
      
      const response = await api.get<TeamsResponse>('/teams');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Teams fetched successfully: ${response.data.data.length} teams`);
        setTeams(response.data.data);
        return response.data.data;
      } else {
        console.warn('⚠️ Invalid teams response format');
        setTeams([]);
        return [];
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch teams');
      console.error('❌ Fetch teams error:', errorMessage);
      setError(errorMessage);
      setTeams([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users available for team assignment
  const fetchUsers = useCallback(async (): Promise<User[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 Fetching users...');
      
      const response = await api.get<UsersResponse>('/teams/users');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Users fetched successfully: ${response.data.data.length} users`);
        setUsers(response.data.data);
        return response.data.data;
      } else {
        console.warn('⚠️ Invalid users response format');
        setUsers([]);
        return [];
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch users');
      console.error('❌ Fetch users error:', errorMessage);
      setError(errorMessage);
      setUsers([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add member to team
  const addMemberToTeam = useCallback(async (memberData: AddMemberRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Adding member to team:', memberData);
      
      const response = await api.post('/teams/members', memberData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Member added successfully');
        // Refresh teams and users list after adding member
        await Promise.all([fetchTeams(), fetchUsers()]);
        return true;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to add member to team');
      console.error('❌ Add member error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams, fetchUsers]);

  // Remove member from team - FIXED VERSION
  const removeMemberFromTeam = useCallback(async (teamId: string, userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➖ Removing member from team:', { teamId, userId });
      
      // Validate inputs
      if (!teamId || !userId) {
        throw new Error('Team ID and User ID are required');
      }
      
      const requestData: RemoveMemberRequest = {
        teamId: teamId.trim(),
        userId: userId.trim()
      };
      
      console.log('📤 Request data:', requestData);
      console.log('🔗 Full URL:', `${API_BASE_URL}/teams/members/remove`);
      
      // Make the API call
      const response = await api.post<RemoveMemberResponse>('/teams/members/remove', requestData);
      
      console.log('📥 Remove member response:', {
        status: response.status,
        data: response.data
      });
      
      // Check for successful response
      if (response.status === 200) {
        if (response.data && response.data.success) {
          console.log('✅ Member removed successfully:', response.data.message);
          
          // Update local state with the updated team data if available
          if (response.data.data) {
            setTeams(prevTeams => 
              prevTeams.map(team => 
                team.id === teamId ? response.data.data : team
              )
            );
          }
          
          // Refresh teams and users list after removing member
          await Promise.all([fetchTeams(), fetchUsers()]);
          return true;
        } else {
          // Handle case where status is 200 but success is false
          const errorMsg = response.data?.message || 'Operation was not successful';
          console.error('⚠️ Remove member failed:', errorMsg);
          setError(errorMsg);
          return false;
        }
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err: any) {
      console.error('❌ Remove member error:', err);
      
      // Enhanced error handling with specific status codes
      let errorMessage: string;
      
      if (err.response?.status === 404) {
        errorMessage = 'Team or user not found. Please refresh and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to remove this member.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request. Please check the team and user information.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Cannot remove member due to a conflict. The member may have already been removed.';
      } else {
        errorMessage = handleApiError(err, 'Failed to remove member from team');
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams, fetchUsers]);

  // Alternative remove member function using different HTTP methods (for testing)
  const removeMemberFromTeamAlternative = useCallback(async (teamId: string, userId: string, method: 'DELETE_URL' | 'DELETE_BODY' | 'POST' = 'POST'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (method) {
        case 'DELETE_URL':
          // DELETE with URL parameters
          response = await api.delete(`/teams/${teamId}/members/${userId}`);
          break;
          
        case 'DELETE_BODY':
          // DELETE with request body
          response = await api.delete('/teams/members', {
            data: { teamId, userId }
          });
          break;
          
        case 'POST':
        default:
          // POST method (current approach)
          response = await api.post('/teams/members/remove', { teamId, userId });
          break;
      }
      
      console.log(`✅ Remove member (${method}) response:`, response.data);
      
      if (response.status === 200 || response.status === 204) {
        await Promise.all([fetchTeams(), fetchUsers()]);
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMessage = handleApiError(err, `Failed to remove member using ${method} method`);
      console.error(`❌ Remove member (${method}) error:`, errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTeams, fetchUsers]);

  // Update team details
  const updateTeam = useCallback(async (teamId: string, teamData: Partial<CreateTeamRequest>): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating team:', { teamId, teamData });
      
      const response = await api.put(`/teams/${teamId}`, teamData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Team updated successfully');
        // Refresh teams list after update
        await fetchTeams();
        return response.data.data || response.data;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to update team');
      console.error('❌ Update team error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Delete team
  const deleteTeam = useCallback(async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting team:', teamId);
      
      const response = await api.delete(`/teams/${teamId}`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Team deleted successfully');
        // Refresh teams list after deletion
        await fetchTeams();
        return true;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to delete team');
      console.error('❌ Delete team error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Get team statistics
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
    
    console.log('📊 Team stats calculated:', stats);
    return stats;
  }, [teams]);

  // Clear error
  const clearError = useCallback(() => {
    console.log('🧹 Clearing error state');
    setError(null);
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    setError(null);
    
    try {
      await Promise.all([
        fetchTeams(),
        fetchUsers(),
        fetchMyTeam()
      ]);
      console.log('✅ All data refreshed successfully');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
    }
  }, [fetchTeams, fetchUsers, fetchMyTeam]);

  // Get available users (not in any team)
  const getAvailableUsers = useCallback(() => {
    const availableUsers = users.filter(user => !user.team);
    console.log(`👥 Available users: ${availableUsers.length}/${users.length}`);
    return availableUsers;
  }, [users]);

  // Get users in specific team
  const getUsersInTeam = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    const usersInTeam = team?.members || [];
    console.log(`👥 Users in team ${teamId}: ${usersInTeam.length}`);
    return usersInTeam;
  }, [teams]);

  // Create team with leader and members
  const createTeamWithMembers = useCallback(async (teamData: CreateTeamRequest): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏗️ Creating team with leader and members:', teamData);
      
      const response = await api.post<{ success: boolean; data: Team }>('/teams', teamData);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Team created successfully with leader:', response.data.data);
        // Refresh teams and users list after creation
        await Promise.all([fetchTeams(), fetchUsers()]);
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to create team with members');
      console.error('❌ Create team with members error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams, fetchUsers]);

  // Assign or change team leader
  const assignTeamLeader = useCallback(async (teamId: string, leaderId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Assigning team leader:', { teamId, leaderId });
      
      const response = await api.post('/teams/assign-leader', { teamId, leaderId });
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Team leader assigned successfully');
        // Refresh teams list after leader assignment
        await fetchTeams();
        return true;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to assign team leader');
      console.error('❌ Assign team leader error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Get available users for leadership (team members)
  const getAvailableLeaders = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    
    return team.members.filter(member => member.id !== team.leaderId);
  }, [teams]);

  // Check if current user is a team leader using the new dedicated endpoint
  const checkIsTeamLeader = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Checking if user is team leader...');
      
      const response = await api.get<LeaderCheckResponse>('/teams/check-leader');
      
      if (response.data.success) {
        const isLeader = response.data.data.isLeader;
        console.log(`✅ Leadership check result: ${isLeader ? 'IS LEADER' : 'IS MEMBER'}`);
        return isLeader;
      } else {
        console.warn('⚠️ Leadership check failed');
        return false;
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.response?.status === 401) {
        console.error('🔒 Unauthorized - token may be invalid');
        return false;
      }
      
      const errorMessage = handleApiError(err, 'Failed to check team leadership');
      console.error('❌ Leadership check error:', errorMessage);
      setError(errorMessage);
      return false;
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
    createTeamWithMembers,
    updateTeam,
    deleteTeam,
    
    // Leader operations
    assignTeamLeader,
    getAvailableLeaders,
    
    // Member operations
    addMemberToTeam,
    removeMemberFromTeam,
    removeMemberFromTeamAlternative, // For testing different methods
    
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
    checkIsTeamLeader,
  };
};