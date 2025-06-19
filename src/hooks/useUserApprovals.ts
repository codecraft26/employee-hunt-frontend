// hooks/useUserApprovals.ts
'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  employeeCode?: string | null;
  department?: string | null;
  createdAt: string;
}

export interface ApprovedUser {
  id: string;
  name: string;
  email: string;
  isApproved: boolean;
}

export interface PendingUsersResponse {
  success: boolean;
  data: PendingUser[];
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: ApprovedUser;
}

export interface RejectResponse {
  success: boolean;
  message: string;
}

export interface RejectUserRequest {
  reason?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const useUserApprovals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  // Fetch pending users
  const fetchPendingUsers = useCallback(async (): Promise<PendingUser[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PendingUsersResponse>('/auth/users/pending');
      
      if (response.data.success) {
        setPendingUsers(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch pending users');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch pending users';
      setError(errorMessage);
      console.error('Pending users fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve user
  const approveUser = useCallback(async (userId: string): Promise<ApprovedUser | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<ApprovalResponse>(`/auth/users/${userId}/approve`);
      
      if (response.data.success) {
        // Remove the approved user from pending users list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        return response.data.data;
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject user with optional reason
  const rejectUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: RejectUserRequest = reason ? { reason } : {};
      const response = await api.post<RejectResponse>(`/auth/users/${userId}/reject`, requestBody);
      
      if (response.data.success) {
        // Remove the rejected user from pending users list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to reject user');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk approve users
  const bulkApproveUsers = useCallback(async (userIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const approvalPromises = userIds.map(userId => 
        api.post<ApprovalResponse>(`/auth/users/${userId}/approve`)
      );
      
      const results = await Promise.allSettled(approvalPromises);
      
      // Check if all approvals were successful
      const failedApprovals = results.filter(result => result.status === 'rejected');
      
      if (failedApprovals.length === 0) {
        // Remove all approved users from pending list
        setPendingUsers(prev => prev.filter(user => !userIds.includes(user.id)));
        return true;
      } else {
        // Some approvals failed
        const successfulIds = results
          .map((result, index) => result.status === 'fulfilled' ? userIds[index] : null)
          .filter(Boolean) as string[];
        
        // Remove only successfully approved users
        setPendingUsers(prev => prev.filter(user => !successfulIds.includes(user.id)));
        
        throw new Error(`${failedApprovals.length} out of ${userIds.length} approvals failed`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve users';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk reject users
  const bulkRejectUsers = useCallback(async (userIds: string[], reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: RejectUserRequest = reason ? { reason } : {};
      const rejectionPromises = userIds.map(userId => 
        api.post<RejectResponse>(`/auth/users/${userId}/reject`, requestBody)
      );
      
      const results = await Promise.allSettled(rejectionPromises);
      
      // Check if all rejections were successful
      const failedRejections = results.filter(result => result.status === 'rejected');
      
      if (failedRejections.length === 0) {
        // Remove all rejected users from pending list
        setPendingUsers(prev => prev.filter(user => !userIds.includes(user.id)));
        return true;
      } else {
        // Some rejections failed
        const successfulIds = results
          .map((result, index) => result.status === 'fulfilled' ? userIds[index] : null)
          .filter(Boolean) as string[];
        
        // Remove only successfully rejected users
        setPendingUsers(prev => prev.filter(user => !successfulIds.includes(user.id)));
        
        throw new Error(`${failedRejections.length} out of ${userIds.length} rejections failed`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject users';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pending users statistics
  const getPendingUsersStats = useCallback(() => {
    const departments = [...new Set(pendingUsers.map(u => u.department).filter(Boolean))];
    const departmentCounts = departments.reduce((acc, dept) => {
      acc[dept!] = pendingUsers.filter(u => u.department === dept).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPending: pendingUsers.length,
      departments: departments,
      departmentCounts: departmentCounts,
      oldestPending: pendingUsers.length > 0 
        ? new Date(Math.min(...pendingUsers.map(u => new Date(u.createdAt).getTime())))
        : null,
      newestPending: pendingUsers.length > 0
        ? new Date(Math.max(...pendingUsers.map(u => new Date(u.createdAt).getTime())))
        : null,
    };
  }, [pendingUsers]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh pending users (alias for fetchPendingUsers for consistency)
  const refreshPendingUsers = useCallback(async () => {
    return await fetchPendingUsers();
  }, [fetchPendingUsers]);

  return {
    loading,
    error,
    pendingUsers,
    fetchPendingUsers,
    refreshPendingUsers,
    approveUser,
    rejectUser,
    bulkApproveUsers,
    bulkRejectUsers,
    getPendingUsersStats,
    clearError,
  };
};