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
  Trophy,
  Calendar,
  User,
  Sparkles,
  ArrowRight
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

  // Get gradient colors based on activity type
  const getActivityGradient = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return 'from-blue-500 via-purple-500 to-indigo-600';
      case 'poll':
      case 'vote':
        return 'from-green-500 via-emerald-500 to-teal-600';
      case 'treasure_hunt':
      case 'treasure-hunt':
        return 'from-orange-500 via-red-500 to-pink-600';
      case 'announcement':
        return 'from-yellow-400 via-orange-500 to-red-500';
      default:
        return 'from-gray-500 via-gray-600 to-gray-700';
    }
  }, []);

  // Get icon color based on activity type
  const getIconColor = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return 'text-blue-600';
      case 'poll':
      case 'vote':
        return 'text-green-600';
      case 'treasure_hunt':
      case 'treasure-hunt':
        return 'text-orange-600';
      case 'announcement':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const handleRefreshActivities = useCallback(() => {
    clearActivitiesError();
    fetchActivities();
  }, [fetchActivities, clearActivitiesError]);

  const handleActivitySelect = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Activities Timeline
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest announcements, quizzes, polls, and treasure hunts
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={handleRefreshActivities}
            disabled={activitiesLoading}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${activitiesLoading ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh Activities</span>
          </button>
        </div>

        {/* Activities Timeline */}
        <div className="relative">
          {activitiesError ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900">Unable to load activities</h3>
                  <p className="text-red-700">{activitiesError}</p>
                  <button
                    onClick={handleRefreshActivities}
                    className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : activities.length === 0 && !activitiesLoading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
                <ActivityIcon className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">Check back later for new announcements and activities</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30"></div>

              {activitiesLoading && activities.length === 0 ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="relative pl-20">
                    <div className="absolute left-6 w-4 h-4 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                activities.map((activity, index) => {
                  const IconComponent = getIconComponent(getActivityTypeIcon(activity.type));
                  const gradient = getActivityGradient(activity.type);
                  const iconColor = getIconColor(activity.type);
                  
                  return (
                    <div key={activity.id} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className={`absolute left-4 w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>

                      {/* Activity Card */}
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{activity.title}</h3>
                                <p className="text-white text-opacity-90 text-sm font-medium">
                                  {getActivityTypeDisplay(activity.type)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-white text-opacity-90 text-sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatActivityDate(activity.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          <p className="text-gray-700 text-base leading-relaxed mb-4">
                            {activity.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <User className="h-4 w-4" />
                              <span>Created by {activity.user.name}</span>
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                {activity.user.role}
                              </span>
                            </div>

                            <button
                              onClick={() => handleActivitySelect(activity)}
                              className={`inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
                            >
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Activity Details Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${getActivityGradient(selectedActivity.type)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      {(() => {
                        const IconComponent = getIconComponent(getActivityTypeIcon(selectedActivity.type));
                        return <IconComponent className="h-6 w-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Activity Details</h2>
                      <p className="text-white text-opacity-90">
                        {getActivityTypeDisplay(selectedActivity.type)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Title</h4>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{selectedActivity.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Type</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getActivityGradient(selectedActivity.type)} text-white mt-1`}>
                        {getActivityTypeDisplay(selectedActivity.type)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Created By</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-gray-900 font-medium">{selectedActivity.user.name}</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {selectedActivity.user.role}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Date & Time</h4>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedActivity.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</h4>
                      <p className="text-gray-900 leading-relaxed mt-1">{selectedActivity.description}</p>
                    </div>

                    {selectedActivity.referenceId && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reference ID</h4>
                        <code className="inline-block mt-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-800">
                          {selectedActivity.referenceId}
                        </code>
                      </div>
                    )}

                    {selectedActivity.imageUrl && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Image</h4>
                        <div className="mt-1">
                          <img 
                            src={selectedActivity.imageUrl} 
                            alt={selectedActivity.title}
                            className="w-full h-48 object-cover rounded-lg border shadow-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivitiesTab;