'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Bell, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Settings,
  RefreshCw,
  HardDrive,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePWA, PWAUtils } from '../../hooks/usePWA';

export default function PWASettingsPage() {
  const { 
    isOnline, 
    isInstalled, 
    isInstallable, 
    hasUpdate, 
    isLoading,
    installApp,
    updateApp,
    dismissInstall,
    checkForUpdates
  } = usePWA();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<string>('browser');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Get cache size
    PWAUtils.getCacheSize().then(setCacheSize);

    // Get display mode
    setDisplayMode(PWAUtils.getDisplayMode());
  }, []);

  const handleRequestNotifications = async () => {
    const permission = await PWAUtils.requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await PWAUtils.clearCache();
      setCacheSize(0);
      // Show success message
      PWAUtils.showNotification('Cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PWA Settings</h1>
              <p className="text-gray-600">Manage your Progressive Web App experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">App Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Connection Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Installation Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(isInstalled)}
                  <span className={`font-medium ${isInstalled ? 'text-green-600' : 'text-red-600'}`}>
                    {isInstalled ? 'Installed' : 'Not Installed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(notificationPermission === 'granted')}
                  <span className={`font-medium capitalize ${
                    notificationPermission === 'granted' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {notificationPermission}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Cache Size</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {formatBytes(cacheSize)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Display Mode</span>
                </div>
                <span className="text-gray-600 font-medium capitalize">
                  {displayMode}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
            
            <div className="space-y-4">
              {/* Install App */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={installApp}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span>{isLoading ? 'Installing...' : 'Install App'}</span>
                </button>
              )}

              {/* Update App */}
              {hasUpdate && (
                <button
                  onClick={updateApp}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Update Available - Install Now</span>
                </button>
              )}

              {/* Enable Notifications */}
              {notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestNotifications}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Enable Notifications</span>
                </button>
              )}

              {/* Check for Updates */}
              <button
                onClick={checkForUpdates}
                className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Check for Updates</span>
              </button>

              {/* Clear Cache */}
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isClearing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                <span>{isClearing ? 'Clearing...' : 'Clear Cache'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PWA Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">PWA Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <WifiOff className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Offline Support</h3>
              <p className="text-sm text-gray-600">
                Access cached content and features even when offline
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Push Notifications</h3>
              <p className="text-sm text-gray-600">
                Get notified about new activities and updates
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Native Experience</h3>
              <p className="text-sm text-gray-600">
                App-like experience with fast loading and smooth navigation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 