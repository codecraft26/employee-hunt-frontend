// Utility functions for activities
import { apiService } from '../services/apiService';
import { Activity } from '../hooks/useActivities';

/**
 * Fetch current user's activities from the backend
 * This is a standalone utility that can be used outside of React components
 * 
 * @returns Promise<Activity[]> - Array of user's activities
 * @throws Error if request fails
 * 
 * @example
 * ```typescript
 * import { fetchMyActivities } from '../utils/activitiesUtils';
 * 
 * try {
 *   const activities = await fetchMyActivities();
 *   console.log('My activities:', activities);
 * } catch (error) {
 *   console.error('Failed to fetch activities:', error);
 * }
 * ```
 */
export const fetchMyActivities = async (): Promise<Activity[]> => {
  try {
    console.log('🔄 Fetching my activities...');
    const response = await apiService.getMyActivities();
    
    if (response.success) {
      console.log(`✅ Successfully fetched ${response.data.length} activities`);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch my activities');
    }
  } catch (error: any) {
    console.error('❌ Error fetching my activities:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch my activities');
  }
};

/**
 * Get the endpoint URL for my activities
 * Useful for debugging or documentation
 */
export const getMyActivitiesEndpoint = (): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/activities/my-activities`;
};

/**
 * Check if activities feature is available
 * Based on environment configuration
 */
export const isActivitiesFeatureAvailable = (): boolean => {
  return !!process.env.NEXT_PUBLIC_API_URL;
};

/**
 * Format activity type for display
 * Converts snake_case to Title Case
 * 
 * @example
 * formatActivityType('QUIZ_UPLOADED') // returns 'Quiz Uploaded'
 * formatActivityType('POLL_CREATED') // returns 'Poll Created'
 */
export const formatActivityType = (type: string): string => {
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get relative time string for activity
 * Returns human-readable time difference
 * 
 * @example
 * getRelativeTime('2023-12-01T10:00:00Z') // returns '2 hours ago'
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return diffMinutes === 0 ? 'Just now' : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

/**
 * Group activities by date
 * Returns activities grouped by day for better organization
 */
export const groupActivitiesByDate = (activities: Activity[]): Record<string, Activity[]> => {
  const grouped: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    const date = new Date(activity.createdAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(activity);
  });
  
  return grouped;
};

/**
 * Filter activities by type
 * Returns activities matching the specified type
 */
export const filterActivitiesByType = (activities: Activity[], type: string): Activity[] => {
  return activities.filter(activity => 
    activity.type.toLowerCase() === type.toLowerCase()
  );
};

/**
 * Sort activities by date (newest first)
 * Returns activities sorted by creation date in descending order
 */
export const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Export default for convenience
export default {
  fetchMyActivities,
  getMyActivitiesEndpoint,
  isActivitiesFeatureAvailable,
  formatActivityType,
  getRelativeTime,
  groupActivitiesByDate,
  filterActivitiesByType,
  sortActivitiesByDate,
};
