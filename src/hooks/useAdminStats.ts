// hooks/useAdminStats.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface RecentActivity {
  type: 'QUIZ' | 'VOTE' | 'TREASURE_HUNT' | 'TEAM' | 'USER';
  id: string;
  title: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'PENDING';
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export interface DashboardStats {
  totalTeams: number;
  activeUsers: number;
  activeContests: number;
  pendingApprovals: number;
  recentActivities: RecentActivity[];
}

export interface AdminStatsResponse {
  success: boolean;
  data: DashboardStats;
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
      console.log('📊 Admin Stats API Request:', {
        method: config.method?.toUpperCase() || 'UNKNOWN',
        url: `${config.baseURL || ''}${config.url || ''}`,
        hasToken: !!token,
        tokenType: (adminTokenCookie || adminTokenLocal) ? 'admin' : 'regular',
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log admin stats API request:', logError);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Admin Stats Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    try {
      console.log('✅ Admin Stats API Response Success:', {
        method: response.config?.method?.toUpperCase() || 'UNKNOWN',
        url: response.config?.url || 'UNKNOWN',
        status: response.status || 0,
        statusText: response.statusText || 'UNKNOWN',
        success: response.data?.success || false,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log admin stats API response:', logError);
    }
    return response;
  },
  (error) => {
    try {
      console.error('❌ Admin Stats API Response Error:', {
        method: error.config?.method?.toUpperCase() || 'UNKNOWN',
        url: error.config?.url || 'UNKNOWN',
        status: error.response?.status || 0,
        statusText: error.response?.statusText || 'UNKNOWN',
        message: error.response?.data?.message || error.message || 'Unknown error',
        data: error.response?.data || null,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log admin stats API error:', logError);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized access to admin stats - token may be invalid');
    }
    
    return Promise.reject(error);
  }
);

export const useAdminStats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    activeUsers: 0,
    activeContests: 0,
    pendingApprovals: 0,
    recentActivities: []
  });

  // Helper function to handle API errors consistently
  const handleApiError = (err: any, defaultMessage: string): string => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.status === 401) {
      return 'Authentication failed. Please login as admin.';
    }
    if (err.response?.status === 403) {
      return 'You do not have permission to view admin statistics.';
    }
    if (err.response?.status === 404) {
      return 'Admin statistics endpoint not found.';
    }
    if (err.response?.status === 500) {
      return 'Server error while fetching statistics. Please try again later.';
    }
    return err.message || defaultMessage;
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      const response = await api.get<AdminStatsResponse>('/admin/stats/dashboard');
      
      if (response.data.success && response.data.data) {
        console.log('✅ Dashboard stats fetched successfully:', response.data.data);
        
        const statsData = response.data.data;
        
        // Validate the response data structure
        const validatedStats: DashboardStats = {
          totalTeams: statsData.totalTeams || 0,
          activeUsers: statsData.activeUsers || 0,
          activeContests: statsData.activeContests || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          recentActivities: Array.isArray(statsData.recentActivities) ? statsData.recentActivities : []
        };
        
        setStats(validatedStats);
        return validatedStats;
      } else {
        console.warn('⚠️ Invalid dashboard stats response format');
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch dashboard statistics');
      console.error('❌ Fetch dashboard stats error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team statistics specifically
  const fetchTeamStats = useCallback(async (): Promise<{ totalTeams: number; activeTeams: number } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏢 Fetching team statistics...');
      
      const response = await api.get('/admin/stats/teams');
      
      if (response.data.success && response.data.data) {
        console.log('✅ Team stats fetched successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid team stats response format');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch team statistics');
      console.error('❌ Fetch team stats error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user statistics specifically
  const fetchUserStats = useCallback(async (): Promise<{ totalUsers: number; activeUsers: number; pendingApprovals: number } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 Fetching user statistics...');
      
      const response = await api.get('/admin/stats/users');
      
      if (response.data.success && response.data.data) {
        console.log('✅ User stats fetched successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid user stats response format');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch user statistics');
      console.error('❌ Fetch user stats error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch activity statistics specifically
  const fetchActivityStats = useCallback(async (): Promise<{ activeQuizzes: number; activeTreasureHunts: number; activePolls: number } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎯 Fetching activity statistics...');
      
      const response = await api.get('/admin/stats/activities');
      
      if (response.data.success && response.data.data) {
        console.log('✅ Activity stats fetched successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid activity stats response format');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch activity statistics');
      console.error('❌ Fetch activity stats error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async (limit: number = 10): Promise<RecentActivity[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📋 Fetching recent activities (limit: ${limit})...`);
      
      const response = await api.get(`/admin/stats/recent-activities?limit=${limit}`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Recent activities fetched successfully: ${response.data.data.length} activities`);
        return response.data.data;
      } else {
        throw new Error('Invalid recent activities response format');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch recent activities');
      console.error('❌ Fetch recent activities error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all statistics
  const refreshStats = useCallback(async (): Promise<void> => {
    console.log('🔄 Refreshing all admin statistics...');
    await fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Clear error
  const clearError = useCallback(() => {
    console.log('🧹 Clearing admin stats error state');
    setError(null);
  }, []);

  // Get formatted stats for display
  const getFormattedStats = useCallback(() => {
    return {
      totalTeams: stats.totalTeams.toLocaleString(),
      activeUsers: stats.activeUsers.toLocaleString(),
      activeContests: stats.activeContests.toLocaleString(),
      pendingApprovals: stats.pendingApprovals.toLocaleString(),
      recentActivitiesCount: stats.recentActivities.length
    };
  }, [stats]);

  // Get activity type icon and color
  const getActivityTypeInfo = useCallback((type: RecentActivity['type']) => {
    switch (type) {
      case 'QUIZ':
        return { icon: 'Target', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'VOTE':
        return { icon: 'Vote', color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'TREASURE_HUNT':
        return { icon: 'MapPin', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'TEAM':
        return { icon: 'Users', color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'USER':
        return { icon: 'User', color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
      default:
        return { icon: 'Activity', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: RecentActivity['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'UPCOMING':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-gray-600 bg-gray-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  return {
    // State
    loading,
    error,
    stats,
    
    // Main functions
    fetchDashboardStats,
    refreshStats,
    
    // Specific fetch functions
    fetchTeamStats,
    fetchUserStats,
    fetchActivityStats,
    fetchRecentActivities,
    
    // Utility functions
    getFormattedStats,
    getActivityTypeInfo,
    getStatusColor,
    clearError,
  };
};