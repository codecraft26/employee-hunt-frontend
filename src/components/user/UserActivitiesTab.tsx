// components/user/UserActivitiesTab.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Clock, 
  Activity as ActivityIcon,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Target,
  Vote,
  MapPin,
  Trophy,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Info,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useActivities, Activity } from '../../hooks/useActivities';

const UserActivitiesTab: React.FC = () => {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});

  const {
    loading: activitiesLoading,
    error: activitiesError,
    activities,
    fetchUserActivities,
    clearError: clearActivitiesError,
    getActivityTypeIcon,
    getActivityTypeDisplay,
    getActivityStatusColor,
    formatActivityDate,
  } = useActivities();

  // Fetch activities when component mounts
  useEffect(() => {
    fetchUserActivities();
  }, [fetchUserActivities]);

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
    fetchUserActivities();
  }, [fetchUserActivities, clearActivitiesError]);

  const toggleActivityExpansion = useCallback((activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
    
    // Set default tab when expanding
    if (!expandedActivities.has(activityId)) {
      setActiveTab(prev => ({
        ...prev,
        [activityId]: 'details'
      }));
    }
  }, [expandedActivities]);

  const setActivityTab = useCallback((activityId: string, tab: string) => {
    setActiveTab(prev => ({
      ...prev,
      [activityId]: tab
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Activities Timeline
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Stay updated with the latest announcements, quizzes, polls, and treasure hunts
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={handleRefreshActivities}
            disabled={activitiesLoading}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${activitiesLoading ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh Activities</span>
          </button>
        </div>

        {/* Activities Timeline */}
        <div className="relative">
          {activitiesError ? (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-red-200">
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
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
                <ActivityIcon className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">Check back later for new announcements and activities</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30"></div>

              {activitiesLoading && activities.length === 0 ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="relative pl-12 sm:pl-20">
                    <div className="absolute left-2 sm:left-6 w-4 h-4 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 animate-pulse">
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
                  const isExpanded = expandedActivities.has(activity.id);
                  const currentTab = activeTab[activity.id] || 'details';
                  
                  return (
                    <div key={activity.id} className="relative pl-12 sm:pl-20">
                      {/* Timeline Dot */}
                      <div className={`absolute left-2 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>

                      {/* Activity Card */}
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-r ${gradient} p-4 sm:p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold truncate">{activity.title}</h3>
                                <p className="text-white text-opacity-90 text-sm font-medium">
                                  {getActivityTypeDisplay(activity.type)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <div className="text-right hidden sm:block">
                                <div className="flex items-center text-white text-opacity-90 text-sm">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatActivityDate(activity.createdAt)}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleActivityExpansion(activity.id)}
                                className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors flex-shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-white" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-6">
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                            {activity.description}
                          </p>

                          {/* Image Display */}
                          {activity.imageUrl && (
                            <div className="mb-4">
                              <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                              />
                            </div>
                          )}

                          {/* Mobile Date Display */}
                          <div className="sm:hidden mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatActivityDate(activity.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <User className="h-4 w-4" />
                              <span className="hidden sm:inline">Created by {activity.user.name}</span>
                              <span className="sm:hidden">{activity.user.name}</span>
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                {activity.user.role}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleActivityExpansion(activity.id)}
                              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm`}
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                              {isExpanded ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowRight className="ml-2 h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200">
                              <button
                                onClick={() => setActivityTab(activity.id, 'details')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                  currentTab === 'details'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  <Info className="h-4 w-4" />
                                  <span className="hidden sm:inline">Details</span>
                                  <span className="sm:hidden">Info</span>
                                </div>
                              </button>
                              
                              {activity.imageUrl && (
                                <button
                                  onClick={() => setActivityTab(activity.id, 'image')}
                                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    currentTab === 'image'
                                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    <ImageIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Image</span>
                                    <span className="sm:hidden">Photo</span>
                                  </div>
                                </button>
                              )}
                              
                              {activity.referenceId && (
                                <button
                                  onClick={() => setActivityTab(activity.id, 'reference')}
                                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    currentTab === 'reference'
                                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Reference</span>
                                    <span className="sm:hidden">Ref</span>
                                  </div>
                                </button>
                              )}
                            </div>

                            {/* Tab Content */}
                            <div className="p-4 sm:p-6">
                              {currentTab === 'details' && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-gray-900 leading-relaxed">{activity.description || 'No description provided'}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Created By</h4>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-900 font-medium">{activity.user.name}</span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                          {activity.user.role}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Date & Time</h4>
                                      <p className="text-gray-900">
                                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
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
                                </div>
                              )}

                              {currentTab === 'image' && activity.imageUrl && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Activity Image</h4>
                                  <div className="relative">
                                    <img 
                                      src={activity.imageUrl} 
                                      alt={activity.title}
                                      className="w-full max-h-96 object-contain rounded-lg border shadow-md"
                                    />
                                  </div>
                                </div>
                              )}

                              {currentTab === 'reference' && activity.referenceId && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Reference Information</h4>
                                  <div className="bg-gray-100 rounded-lg p-4">
                                    <code className="text-sm font-mono text-gray-800 break-all">
                                      {activity.referenceId}
                                    </code>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivitiesTab;