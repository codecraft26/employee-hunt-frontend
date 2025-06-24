import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Activity, 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { Activity as ActivityType } from '../../hooks/useActivities';
import { apiService } from '../../services/apiService';
import CreateActivityModal from '../modals/CreateActivityModal';

const ActivitiesTab: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [allActivities, setAllActivities] = useState<ActivityType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ACTIVITIES_PER_PAGE = 50;

  // Helper functions from the hook (we'll copy them locally)
  const getActivityTypeDisplay = (type: string) => {
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
      case 'ANNOUNCEMENT_CREATED':
        return 'Announcement';
      default:
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActivityStatusColor = (type: string) => {
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
      case 'ANNOUNCEMENT_CREATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const clearError = () => {
    setError(null);
  };

  // Fetch activities on component mount
  useEffect(() => {
    // Fetch user's activities using the same API as UserOverview tab
    const loadInitialActivities = async () => {
      try {
        setLoading(true);
        console.log('🔄 ActivitiesTab: Fetching my activities...');
        // Use the same endpoint as UserOverview tab: /activities/my-activities
        const response = await apiService.getMyActivities();
        console.log('📋 ActivitiesTab: API response:', response);
        if (response?.success && response?.data) {
          console.log('✅ ActivitiesTab: Fetched activities:', response.data.length);
          setAllActivities(response.data);
          // Since getMyActivities returns all user activities at once, no pagination needed
          setHasMoreActivities(false);
        }
      } catch (error) {
        console.error('❌ ActivitiesTab: Failed to load activities:', error);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    loadInitialActivities();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateSuccess = () => {
    setSuccessMessage('Activity created successfully!');
    setCurrentPage(1); // Reset to first page
    // Refresh the list using the same API as UserOverview
    const refreshActivities = async () => {
      try {
        const response = await apiService.getMyActivities();
        if (response?.success && response?.data) {
          setAllActivities(response.data);
          setHasMoreActivities(false); // No pagination for user activities
        }
      } catch (error) {
        console.error('Failed to refresh activities:', error);
      }
    };
    refreshActivities();
  };

  const handleRefresh = () => {
    clearError();
    setCurrentPage(1); // Reset to first page
    // Refresh using the same API as UserOverview
    const refreshActivities = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyActivities();
        if (response?.success && response?.data) {
          setAllActivities(response.data);
          setHasMoreActivities(false); // No pagination for user activities
        }
      } catch (error) {
        console.error('Failed to refresh activities:', error);
        setError('Failed to refresh activities');
      } finally {
        setLoading(false);
      }
    };
    refreshActivities();
  };

  const handleLoadMore = async () => {
    // Since getMyActivities doesn't support pagination, disable load more
    // All user activities are loaded at once
    setHasMoreActivities(false);
  };

  const toggleDropdown = (activityId: string) => {
    setDropdownOpen(dropdownOpen === activityId ? null : activityId);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  const handleViewActivity = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setDropdownOpen(null);
  };

  const handleDeleteActivity = async (activity: ActivityType) => {
    if (!confirm(`Are you sure you want to delete "${activity.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(activity.id);
    setDropdownOpen(null);
    
    try {
      await apiService.deleteActivity(activity.id);
      
      // Remove the activity from the local state
      setAllActivities(prev => prev.filter(a => a.id !== activity.id));
      
      setSuccessMessage('Activity deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete activity';
      setSuccessMessage(null);
      // Show error in a more visible way
      alert(`Error deleting activity: ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getActivityGradient = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ANNOUNCEMENT_CREATED':
        return 'from-blue-500 to-purple-600';
      case 'QUIZ_UPLOADED':
        return 'from-green-500 to-emerald-600';
      case 'POLL_CREATED':
        return 'from-orange-500 to-red-600';
      case 'TREASURE_HUNT':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading && allActivities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-4">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Activities</h2>
          <p className="text-gray-600">
            View and manage your activities and announcements
            {allActivities.length > 0 && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {allActivities.length} activities{hasMoreActivities ? '+' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Activities Grid */}
      {allActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
            <Activity className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Yet</h3>
          <p className="text-gray-600 mb-6">Create your first activity to get started!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Activity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allActivities.map((activity) => {
            const gradient = getActivityGradient(activity.type);
            
            return (
              <div key={activity.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
                {/* Activity Header */}
                <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{activity.title}</h3>
                        <p className="text-sm text-white text-opacity-80">
                          {getActivityTypeDisplay(activity.type)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(activity.id)}
                        className="p-1 text-white text-opacity-80 hover:text-opacity-100 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {dropdownOpen === activity.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={closeDropdown}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewActivity(activity)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(activity)}
                                disabled={deleteLoading === activity.id}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleteLoading === activity.id ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {deleteLoading === activity.id ? 'Deleting...' : 'Delete Activity'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Content */}
                <div className="p-6">
                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {activity.description || 'No description provided'}
                  </p>

                  {/* Image Preview */}
                  {activity.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Activity Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{activity.user?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatActivityDate(activity.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getActivityStatusColor(activity.type)}`}>
                      {getActivityTypeDisplay(activity.type)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMoreActivities && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Load More Activities
          </button>
        </div>
      )}

      {/* Create Activity Modal */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Activity Detail Modal (TODO: Implement) */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Activity Details</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Title</h4>
                  <p className="text-gray-700">{selectedActivity.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-700">{selectedActivity.description || 'No description'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Created By</h4>
                  <p className="text-gray-700">
                    {selectedActivity.user?.name || 'Unknown User'} 
                    {selectedActivity.user?.email && ` (${selectedActivity.user.email})`}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Created At</h4>
                  <p className="text-gray-700">{new Date(selectedActivity.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedActivity.imageUrl && (
                  <div>
                    <h4 className="font-medium text-gray-900">Image</h4>
                    <img
                      src={selectedActivity.imageUrl}
                      alt={selectedActivity.title}
                      className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;