// components/quiz/QuizNotifications.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Trophy, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  X,
  Calendar,
  Users
} from 'lucide-react';
import { useUserQuizzes } from '../../hooks/useUserQuizzes';

interface QuizNotification {
  id: string;
  type: 'quiz_started' | 'quiz_ending' | 'results_published' | 'new_quiz' | 'quiz_reminder';
  title: string;
  message: string;
  quizId?: string;
  quizTitle?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface QuizNotificationsProps {
  className?: string;
  maxNotifications?: number;
}

const QuizNotifications: React.FC<QuizNotificationsProps> = ({ 
  className = '',
  maxNotifications = 5
}) => {
  const { quizzes, formatQuizDate } = useUserQuizzes();
  const [notifications, setNotifications] = useState<QuizNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Generate notifications based on quiz data
    if (quizzes && quizzes.length > 0) {
      const newNotifications: QuizNotification[] = [];
      const now = new Date();

      quizzes.forEach((quiz) => {
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);
        
        // Quiz starting soon (within 1 hour)
        const timeUntilStart = startTime.getTime() - now.getTime();
        if (timeUntilStart > 0 && timeUntilStart <= 3600000) { // 1 hour in milliseconds
          newNotifications.push({
            id: `start-${quiz.id}`,
            type: 'quiz_reminder',
            title: 'Quiz Starting Soon!',
            message: `"${quiz.title}" starts in ${Math.round(timeUntilStart / 60000)} minutes`,
            quizId: quiz.id,
            quizTitle: quiz.title,
            timestamp: new Date(now.getTime() - Math.random() * 600000), // Random time within last 10 minutes
            isRead: false,
            priority: 'high'
          });
        }

        // Quiz ending soon (within 30 minutes)
        const timeUntilEnd = endTime.getTime() - now.getTime();
        if (timeUntilEnd > 0 && timeUntilEnd <= 1800000 && quiz.status === 'ACTIVE') { // 30 minutes
          newNotifications.push({
            id: `end-${quiz.id}`,
            type: 'quiz_ending',
            title: 'Quiz Ending Soon!',
            message: `"${quiz.title}" ends in ${Math.round(timeUntilEnd / 60000)} minutes`,
            quizId: quiz.id,
            quizTitle: quiz.title,
            timestamp: new Date(now.getTime() - Math.random() * 300000), // Random time within last 5 minutes
            isRead: false,
            priority: 'high'
          });
        }

        // Results published
        if (quiz.isResultPublished && quiz.status === 'COMPLETED') {
          newNotifications.push({
            id: `results-${quiz.id}`,
            type: 'results_published',
            title: 'Quiz Results Available!',
            message: `Results for "${quiz.title}" have been published`,
            quizId: quiz.id,
            quizTitle: quiz.title,
            timestamp: new Date(now.getTime() - Math.random() * 86400000), // Random time within last day
            isRead: Math.random() > 0.5, // Randomly mark some as read
            priority: 'medium'
          });
        }

        // New quiz available
        const createdTime = new Date(quiz.createdAt);
        const timeSinceCreated = now.getTime() - createdTime.getTime();
        if (timeSinceCreated <= 86400000 && quiz.status === 'UPCOMING') { // Created within last day
          newNotifications.push({
            id: `new-${quiz.id}`,
            type: 'new_quiz',
            title: 'New Quiz Available!',
            message: `"${quiz.title}" has been added - starts ${formatQuizDate(quiz.startTime)}`,
            quizId: quiz.id,
            quizTitle: quiz.title,
            timestamp: createdTime,
            isRead: Math.random() > 0.7, // Randomly mark some as read
            priority: 'low'
          });
        }
      });

      // Sort by timestamp (newest first) and limit
      const sortedNotifications = newNotifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxNotifications);

      setNotifications(sortedNotifications);
    }
  }, [quizzes, maxNotifications, formatQuizDate]);

  const getNotificationIcon = (type: QuizNotification['type']) => {
    switch (type) {
      case 'quiz_started':
        return <Target className="h-5 w-5" />;
      case 'quiz_ending':
        return <Clock className="h-5 w-5" />;
      case 'results_published':
        return <Trophy className="h-5 w-5" />;
      case 'new_quiz':
        return <Calendar className="h-5 w-5" />;
      case 'quiz_reminder':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: QuizNotification['type'], priority: QuizNotification['priority']) => {
    if (priority === 'high') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    
    switch (type) {
      case 'quiz_started':
      case 'quiz_reminder':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'quiz_ending':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'results_published':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'new_quiz':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type: QuizNotification['type'], priority: QuizNotification['priority']) => {
    if (priority === 'high') {
      return 'text-red-600';
    }
    
    switch (type) {
      case 'quiz_started':
      case 'quiz_reminder':
        return 'text-blue-600';
      case 'quiz_ending':
        return 'text-orange-600';
      case 'results_published':
        return 'text-green-600';
      case 'new_quiz':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quiz Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No quiz notifications</p>
                  <p className="text-sm text-gray-500 mt-1">We'll notify you about quiz updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                          <div className={getIconColor(notification.type, notification.priority)}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => dismissNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Dismiss"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizNotifications;
