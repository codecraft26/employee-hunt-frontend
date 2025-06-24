// hooks/useActivities.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { apiService } from '../services/apiService';

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
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
  } | null;
}

export interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests with admin priority
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

export const useActivities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch all activities (admin view)
  const fetchActivities = useCallback(async (limit?: number, page?: number): Promise<Activity[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Add query parameters for pagination if provided
      let url = '/activities';
      const params = new URLSearchParams();
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      if (page) {
        params.append('page', page.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('🔄 Fetching activities from:', url);
      const response = await api.get<ActivitiesResponse>(url);
      
      if (response.data.success) {
        console.log('✅ Fetched activities:', response.data.data.length);
        setActivities(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch activities';
      setError(errorMessage);
      console.error('❌ Activities fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's activities (user view)
  const fetchUserActivities = useCallback(async (): Promise<Activity[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Try different endpoints in order of preference
      let response;
      
      try {
        // First try the new my-activities endpoint
        response = await api.get<ActivitiesResponse>('/activities/my-activities');
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          try {
            // If that fails, try the user-specific endpoint
            response = await api.get<ActivitiesResponse>('/activities/user');
          } catch (userErr: any) {
            if (userErr.response?.status === 404 || userErr.response?.status === 400) {
              // If that also fails, try the general activities endpoint
              response = await api.get<ActivitiesResponse>('/activities');
            } else {
              throw userErr;
            }
          }
        } else {
          throw err;
        }
      }
      
      if (response.data.success) {
        setActivities(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch user activities');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user activities';
      setError(errorMessage);
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'QUIZ_UPLOADED',
            title: 'Weekly Quiz Available',
            description: 'A new quiz has been uploaded for your team to complete.',
            referenceId: 'quiz-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          },
          {
            id: '2',
            type: 'POLL_CREATED',
            title: 'Team Event Poll',
            description: 'Vote for your preferred team event this month.',
            referenceId: 'poll-1',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            user: {
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        ];
        setActivities(mockActivities);
        return mockActivities;
      }
      
      // Return empty array as fallback to prevent UI from breaking
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete activity
  const deleteActivity = useCallback(async (activityId: string) => {
    try {
      console.log('Deleting activity:', activityId);
      const response = await apiService.deleteActivity(activityId);
      console.log('Delete response:', response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete activity';
      console.error('Delete activity error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get activity type icon name for UI
  const getActivityTypeIcon = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'QUIZ_UPLOADED':
        return 'Target';
      case 'POLL_CREATED':
        return 'Vote';
      case 'POLL_VOTE_CAST':
        return 'CheckCircle';
      case 'TREASURE_HUNT':
        return 'MapPin';
      case 'CHALLENGE':
        return 'Trophy';
      default:
        return 'Activity';
    }
  }, []);

  // Get activity type display name
  const getActivityTypeDisplay = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'QUIZ_UPLOADED':
        return 'Quiz';
      case 'POLL_CREATED':
        return 'Poll Created';
      case 'POLL_VOTE_CAST':
        return 'Vote Cast';
      case 'TREASURE_HUNT':
        return 'Treasure Hunt';
      case 'CHALLENGE':
        return 'Challenge';
      default:
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  }, []);

  // Get activity status color
  const getActivityStatusColor = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'QUIZ_UPLOADED':
        return 'bg-blue-100 text-blue-800';
      case 'POLL_CREATED':
        return 'bg-green-100 text-green-800';
      case 'POLL_VOTE_CAST':
        return 'bg-purple-100 text-purple-800';
      case 'TREASURE_HUNT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CHALLENGE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Fetch my activities using apiService
  const fetchMyActivities = useCallback(async (): Promise<Activity[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching my activities...');
      const response = await apiService.getMyActivities();
      
      if (response.success) {
        console.log('✅ My activities fetched successfully:', response.data);
        setActivities(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch my activities');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch my activities';
      console.error('❌ Fetch my activities error:', errorMessage);
      setError(errorMessage);
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using mock activities for development');
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'QUIZ_UPLOADED',
            title: 'Weekly Quiz Available',
            description: 'A new quiz has been uploaded for your team to complete.',
            referenceId: 'quiz-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          },
          {
            id: '2',
            type: 'POLL_CREATED',
            title: 'Team Event Poll',
            description: 'Vote for your preferred team event this month.',
            referenceId: 'poll-1',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            user: {
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        ];
        setActivities(mockActivities);
        return mockActivities;
      }
      
      // Return empty array as fallback to prevent UI from breaking
      setActivities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Format date for display
  const formatActivityDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }, []);

  return {
    loading,
    error,
    activities,
    fetchActivities,
    fetchUserActivities,
    fetchMyActivities,
    deleteActivity,
    clearError,
    getActivityTypeIcon,
    getActivityTypeDisplay,
    getActivityStatusColor,
    formatActivityDate,
  };
};