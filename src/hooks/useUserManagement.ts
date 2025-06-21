'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from './redux';
import Cookies from 'js-cookie';
import { apiService } from '../services/apiService';

// Types for user management
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  employeeCode: string;
  department: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
  idProof?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: string;
    name: string;
    description: string;
  };
  category?: {
    id: string;
    name: string;
  };
  hobbies?: string[];
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  name: string;
  department?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: File;
  idProof?: File;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
}

interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  createAdminLoading: boolean;
  createAdminError: string | null;
}

export const useUserManagement = () => {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: false,
    error: null,
    createAdminLoading: false,
    createAdminError: null,
  });

  const { token } = useAppSelector((state) => state.auth);

  // Get authentication token from cookies (same as rest of app)
  const getAuthToken = useCallback(() => {
    return Cookies.get('token') || token;
  }, [token]);

  // Create new admin user
  const createAdminUser = useCallback(async (adminData: CreateAdminRequest): Promise<CreateAdminResponse | null> => {
    setState(prev => ({ ...prev, createAdminLoading: true, createAdminError: null }));
    
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('email', adminData.email);
      formData.append('password', adminData.password);
      formData.append('name', adminData.name);
      
      if (adminData.department) {
        formData.append('department', adminData.department);
      }
      
      if (adminData.gender) {
        formData.append('gender', adminData.gender);
      }
      
      if (adminData.profileImage) {
        formData.append('profileImage', adminData.profileImage);
      }
      
      if (adminData.idProof) {
        formData.append('idProof', adminData.idProof);
      }

      const response = await apiService.post('/api/auth/register/admin', formData);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          createAdminLoading: false,
          users: [...prev.users, response.data]
        }));
        return response;
      } else {
        throw new Error(response.message || 'Failed to create admin user');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create admin user';
      
      setState(prev => ({ 
        ...prev, 
        createAdminLoading: false, 
        createAdminError: errorMessage 
      }));
      
      return null;
    }
  }, []);

  // Fetch all users
  const fetchAllUsers = useCallback(async (): Promise<GetUsersResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.get('/api/auth/users');
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          users: response.data
        }));
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return null;
    }
  }, []);

  // Refresh users data
  const refreshUsers = useCallback(async () => {
    return await fetchAllUsers();
  }, [fetchAllUsers]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      createAdminError: null 
    }));
  }, []);

  // Get user statistics
  const getUserStats = useCallback(() => {
    const totalUsers = state.users.length;
    const adminUsers = state.users.filter(user => user.role === 'admin').length;
    const regularUsers = state.users.filter(user => user.role === 'user').length;
    const approvedUsers = state.users.filter(user => user.isApproved).length;
    const pendingUsers = state.users.filter(user => !user.isApproved).length;
    
    const departments = [...new Set(state.users.map(user => user.department))];
    const teams = [...new Set(state.users.filter(user => user.team).map(user => user.team!.name))];

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      approvedUsers,
      pendingUsers,
      departments: departments.length,
      teams: teams.length,
    };
  }, [state.users]);

  return {
    // State
    users: state.users,
    loading: state.loading,
    error: state.error,
    createAdminLoading: state.createAdminLoading,
    createAdminError: state.createAdminError,
    
    // Actions
    createAdminUser,
    fetchAllUsers,
    refreshUsers,
    clearErrors,
    
    // Computed
    getUserStats,
  };
}; 