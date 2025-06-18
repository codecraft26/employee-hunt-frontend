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
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
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
}

export interface AddMemberRequest {
  teamId: string;
  userId: string;
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

export const useTeams = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  // Create a new team
  const createTeam = useCallback(async (teamData: CreateTeamRequest): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ success: boolean; data: Team }>('/teams', teamData);
      
      if (response.data.success) {
        // Refresh teams list after creation
        await fetchTeams();
        return response.data.data;
      } else {
        throw new Error('Failed to create team');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create team';
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
      const response = await api.get<MyTeamResponse>('/teams/my-team');
      
      if (response.data.success) {
        setMyTeam(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch your team');
      }
    } catch (err: any) {
      // Handle case where user is not part of any team (404)
      if (err.response?.status === 404) {
        setMyTeam(null);
        return null;
      }
      
      const errorMessage = err.response?.data?.message || 'Failed to fetch your team';
      setError(errorMessage);
      console.error('My team fetch error:', err);
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
      const response = await api.get<TeamsResponse>('/teams');
      
      if (response.data.success) {
        setTeams(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch teams');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch teams';
      setError(errorMessage);
      console.error('Teams fetch error:', err);
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
      const response = await api.get<UsersResponse>('/teams/users');
      
      if (response.data.success) {
        setUsers(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Users fetch error:', err);
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
      const response = await api.post('/teams/members', memberData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh teams and users list after adding member
        await Promise.all([fetchTeams(), fetchUsers()]);
        return true;
      } else {
        throw new Error('Failed to add member to team');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add member to team';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams, fetchUsers]);

  // Remove member from team using the correct endpoint
  const removeMemberFromTeam = useCallback(async (teamId: string, userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/teams/members/remove', {
        teamId: teamId,
        userId: userId
      });
      
      if (response.data.success) {
        // Refresh teams and users list after removing member
        await Promise.all([fetchTeams(), fetchUsers()]);
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove member from team';
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
      const response = await api.put(`/teams/${teamId}`, teamData);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh teams list after update
        await fetchTeams();
        return response.data;
      } else {
        throw new Error('Failed to update team');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update team';
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
      const response = await api.delete(`/teams/${teamId}`);
      
      if (response.status === 200 || response.status === 204) {
        // Refresh teams list after deletion
        await fetchTeams();
        return true;
      } else {
        throw new Error('Failed to delete team');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete team';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  // Get team statistics
  const getTeamStats = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;

    return {
      memberCount: team.members.length,
      totalScore: team.score,
      averageScore: team.members.length > 0 ? team.score / team.members.length : 0,
      departments: [...new Set(team.members.map(m => m.department).filter(Boolean))],
      roles: [...new Set(team.members.map(m => m.role))],
    };
  }, [teams]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    teams,
    users,
    myTeam,
    createTeam,
    fetchTeams,
    fetchUsers,
    fetchMyTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    updateTeam,
    deleteTeam,
    getTeamStats,
    clearError,
  };
};