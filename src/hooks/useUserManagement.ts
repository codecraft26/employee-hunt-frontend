'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from './redux';

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

  // Get API base URL with fallback
  const getApiBaseUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
      }
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  }, []);

  // Get authentication headers
  const getAuthHeaders = useCallback(() => {
    const authToken = token || 
                     (typeof window !== 'undefined' ? localStorage.getItem('token') : null) ||
                     (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null);

    if (!authToken) {
      throw new Error('No authentication token found');
    }

    return {
      'Authorization': `Bearer ${authToken}`,
    };
  }, [token]);

  // Safe logging function
  const safeLog = useCallback((message: string, data?: any) => {
    try {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    } catch (error) {
      console.log(message);
    }
  }, []);

  // Create new admin user
  const createAdminUser = useCallback(async (adminData: CreateAdminRequest): Promise<CreateAdminResponse | null> => {
    setState(prev => ({ ...prev, createAdminLoading: true, createAdminError: null }));
    
    try {
      safeLog('🔧 Creating admin user...', { email: adminData.email, name: adminData.name });
      
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/auth/register/admin`;
      
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

      const headers = getAuthHeaders();
      
      safeLog('📡 Making API request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      safeLog('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        safeLog('❌ API Error Response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result: CreateAdminResponse = await response.json();
      safeLog('✅ Admin created successfully:', result);

      setState(prev => ({ 
        ...prev, 
        createAdminLoading: false,
        users: [...prev.users, result.data]
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create admin user';
      safeLog('❌ Create admin error:', errorMessage);
      
      setState(prev => ({ 
        ...prev, 
        createAdminLoading: false, 
        createAdminError: errorMessage 
      }));
      
      return null;
    }
  }, [getApiBaseUrl, getAuthHeaders, safeLog]);

  // Fetch all users
  const fetchAllUsers = useCallback(async (): Promise<GetUsersResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      safeLog('🔧 Fetching all users...');
      
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/auth/users`;
      
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      };
      
      safeLog('📡 Making API request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      safeLog('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        safeLog('❌ API Error Response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result: GetUsersResponse = await response.json();
      safeLog('✅ Users fetched successfully:', { count: result.data.length });

      setState(prev => ({ 
        ...prev, 
        loading: false,
        users: result.data
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      safeLog('❌ Fetch users error:', errorMessage);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return null;
    }
  }, [getApiBaseUrl, getAuthHeaders, safeLog]);

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