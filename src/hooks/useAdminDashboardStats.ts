import { useState, useEffect, useCallback } from 'react';
import { getLocalStorageItem } from '../utils/clientStorage';

// Types for the API response
export interface DashboardStats {
  totalTeams: number;
  activeUsers: number;
  activeContests: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  type: 'QUIZ' | 'VOTE' | 'TREASURE_HUNT' | 'CONTEST';
  id: string;
  title: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'DRAFT';
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface UseAdminDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
  // Helper functions
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
  getTypeDisplay: (type: string) => string;
  formatActivityDate: (dateString: string) => string;
}

export const useAdminDashboardStats = (): UseAdminDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get auth token (you might want to adapt this to your auth system)
  const getAuthToken = useCallback(() => {
    // Try to get from localStorage, Redux store, or your auth context
    return getLocalStorageItem('admin-token') || 
           (typeof window !== 'undefined' ? sessionStorage.getItem('admin-token') : null) || 
           'your-admin-token'; // fallback for development
  }, []);

  // Fetch dashboard stats from API
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      
      const response = await fetch('/api/admin/stats/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please check your admin credentials.');
        } else if (response.status === 403) {
          throw new Error('Forbidden. You do not have admin permissions.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Helper function to get type icon name
  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'QUIZ': return 'Target';
      case 'VOTE': return 'CheckCircle';
      case 'TREASURE_HUNT': return 'Trophy';
      case 'CONTEST': return 'Activity';
      default: return 'Activity';
    }
  }, []);

  // Helper function to get type display name
  const getTypeDisplay = useCallback((type: string) => {
    switch (type) {
      case 'QUIZ': return 'Quiz';
      case 'VOTE': return 'Voting';
      case 'TREASURE_HUNT': return 'Treasure Hunt';
      case 'CONTEST': return 'Contest';
      default: return type.replace(/_/g, ' ').toLowerCase();
    }
  }, []);

  // Helper function to format activity date
  const formatActivityDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    fetchStats,
    clearError,
    getStatusColor,
    getTypeIcon,
    getTypeDisplay,
    formatActivityDate,
  };
};