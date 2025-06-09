// hooks/useActivities.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  user: {
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
  };
}

export interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

export const useActivities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch all activities
  const fetchActivities = useCallback(async (): Promise<Activity[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<ActivitiesResponse>('/activities');
      
      if (response.data.success) {
        setActivities(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch activities';
      setError(errorMessage);
      console.error('Activities fetch error:', err);
      return null;
    } finally {
      setLoading(false);
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
    clearError,
    getActivityTypeIcon,
    getActivityTypeDisplay,
    getActivityStatusColor,
    formatActivityDate,
  };
};