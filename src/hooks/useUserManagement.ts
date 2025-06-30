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

      const response = await apiService.createAdminUser(formData);
      
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
      const response = await apiService.getAllUsers();
      
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
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development' && error.response?.status === 404) {
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'user',
            employeeCode: 'EMP001',
            department: 'Engineering',
            gender: 'male',
            profileImage: '/uploads/profiles/default.jpg',
            idProof: '/uploads/proofs/default.jpg',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            team: {
              id: 'team1',
              name: 'Team Alpha',
              description: 'Frontend Development Team'
            },
            category: {
              id: 'cat1',
              name: 'Developer'
            },
            hobbies: ['Coding', 'Reading', 'Gaming']
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'admin',
            employeeCode: 'EMP002',
            department: 'Management',
            gender: 'female',
            profileImage: '/uploads/profiles/default.jpg',
            idProof: '/uploads/proofs/default.jpg',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            team: {
              id: 'team2',
              name: 'Team Beta',
              description: 'Backend Development Team'
            },
            category: {
              id: 'cat2',
              name: 'Manager'
            },
            hobbies: ['Leadership', 'Strategy', 'Team Building']
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@company.com',
            role: 'user',
            employeeCode: 'EMP003',
            department: 'Design',
            gender: 'male',
            profileImage: '/uploads/profiles/default.jpg',
            idProof: '/uploads/proofs/default.jpg',
            isApproved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: {
              id: 'cat3',
              name: 'Designer'
            },
            hobbies: ['Design', 'Art', 'Photography']
          }
        ];
        
        setState(prev => ({ 
          ...prev, 
          loading: false,
          users: mockUsers
        }));
        
        return {
          success: true,
          data: mockUsers
        };
      }
      
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

  // Update user information (admin or self)
  const updateUser = useCallback(async (userId: string, updateData: any): Promise<User | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiService.updateUser(userId, updateData);
      if (response.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          users: prev.users.map(user => user.id === userId ? response.data : user)
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, []);

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
    updateUser,
    
    // Computed
    getUserStats,
  };
}; 