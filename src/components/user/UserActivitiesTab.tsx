// components/user/UserActivitiesTab.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Clock, 
  Activity as ActivityIcon,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Target,
  Vote,
  MapPin,
  Trophy
} from 'lucide-react';
import { useActivities, Activity } from '../../hooks/useActivities';

const UserActivitiesTab: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const {
    loading: activitiesLoading,
    error: activitiesError,
    activities,
    fetchActivities,
    clearError: clearActivitiesError,
    getActivityTypeIcon,
    getActivityTypeDisplay,
    getActivityStatusColor,
    formatActivityDate,
  } = useActivities();

  // Fetch activities when component mounts
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Get React icon component from string name
  const getIconComponent = useCallback((iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Target,
      Vote,
      MapPin,
      Trophy,
      ActivityIcon,
    };
    return iconMap[iconName] || ActivityIcon;
  }, []);

  const handleRefreshActivities = useCallback(() => {
    clearActivitiesError();
    fetchActivities();
  }, [fetchActivities, clearActivitiesError]);

  const handleActivitySelect = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Available Activities</h3>
        </div>
        <div className="border-t border-gray-200">
          {activitiesError ? (
            <div className="px-4 py-4 sm:px-6">
              <div className="p-4 bg-red-50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{activitiesError}</p>
                  <button
                    onClick={handleRefreshActivities}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : activities.length === 0 && !activitiesLoading ? (
            <div className="px-4 py-8 sm:px-6 text-center">
              <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activitiesLoading && activities.length === 0 ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                activities.map((activity) => {
                  const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
                  return (
                    <li key={activity.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconComponent className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-gray-900">{activity.title}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityStatusColor(activity.type)}`}>
                            {getActivityTypeDisplay(activity.type)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {activity.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>{formatActivityDate(activity.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => handleActivitySelect(activity)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Details
                          <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Activity Details Modal/Panel */}
      {selectedActivity && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Details</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedActivity.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityStatusColor(selectedActivity.type)}`}>
                      {getActivityTypeDisplay(selectedActivity.type)}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedActivity.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedActivity.user.name}
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {selectedActivity.user.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(selectedActivity.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
                {selectedActivity.referenceId && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Reference ID</dt>
                    <dd className="mt-1 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {selectedActivity.referenceId}
                    </dd>
                  </div>
                )}
                {selectedActivity.imageUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Image</dt>
                    <dd className="mt-1">
                      <img 
                        src={selectedActivity.imageUrl} 
                        alt={selectedActivity.title}
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </dd>
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

export default UserActivitiesTab;