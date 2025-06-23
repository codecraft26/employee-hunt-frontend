"use client";

import { useFCM } from '../hooks/useFCM';
import { Bell, BellOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FCMManagerProps {
  className?: string;
  showToken?: boolean;
}

/**
 * Component to manage FCM tokens and notification permissions
 * Useful for testing and providing user feedback
 */
export const FCMManager: React.FC<FCMManagerProps> = ({ 
  className = '', 
  showToken = false 
}) => {
  const { 
    fcmToken, 
    isLoading, 
    error, 
    generateToken, 
    isSupported, 
    permission 
  } = useFCM();

  const handleEnableNotifications = async () => {
    await generateToken();
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        text: 'Notifications not supported',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: fcmToken ? 'Notifications enabled' : 'Generating token...',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'denied':
        return {
          icon: <BellOff className="h-5 w-5 text-red-500" />,
          text: 'Notifications blocked',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-yellow-500" />,
          text: 'Enable notifications',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
    }
  };

  const statusInfo = getPermissionStatus();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status Display */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg border ${statusInfo.bgColor}`}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          statusInfo.icon
        )}
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {isLoading ? 'Setting up notifications...' : statusInfo.text}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Notification Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Enable Button */}
      {isSupported && permission !== 'granted' && !isLoading && (
        <button
          onClick={handleEnableNotifications}
          disabled={permission === 'denied' || isLoading}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            permission === 'denied'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {permission === 'denied' 
            ? 'Notifications blocked in browser' 
            : 'Enable Push Notifications'
          }
        </button>
      )}

      {/* Token Display (for development/testing) */}
      {showToken && fcmToken && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">FCM Token:</p>
          <p className="text-xs text-gray-600 break-all font-mono">
            {fcmToken}
          </p>
        </div>
      )}

      {/* Instructions for denied permissions */}
      {permission === 'denied' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>To enable notifications:</strong>
          </p>
          <ol className="text-sm text-blue-600 mt-1 space-y-1">
            <li>1. Click the lock icon in your address bar</li>
            <li>2. Change notifications to "Allow"</li>
            <li>3. Refresh the page</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default FCMManager;
