'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Info,
  Wifi,
  WifiOff,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

const PWASettingsPage: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkPWAStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = (window.navigator as any).standalone === true;
      const isInstalled = standalone || navigatorStandalone || document.referrer.includes('android-app://');
      
      setIsInstalled(isInstalled);
      setIsStandalone(standalone || navigatorStandalone);
    };

    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const checkServiceWorkerStatus = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setServiceWorkerStatus('Active');
          } else {
            setServiceWorkerStatus('Not registered');
          }
        } catch (error) {
          setServiceWorkerStatus('Error');
        }
      } else {
        setServiceWorkerStatus('Not supported');
      }
    };

    const calculateCacheSize = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          let totalSize = 0;
          
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            // Rough estimation: each cached item is ~100KB
            totalSize += keys.length * 100;
          }
          
          if (totalSize > 1024) {
            setCacheSize(`${(totalSize / 1024).toFixed(1)} MB`);
          } else {
            setCacheSize(`${totalSize} KB`);
          }
        } catch (error) {
          setCacheSize('Error calculating');
        }
      } else {
        setCacheSize('Not supported');
      }
    };

    checkPWAStatus();
    checkOnlineStatus();
    checkServiceWorkerStatus();
    calculateCacheSize();

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        setCacheSize('0 KB');
        alert('Cache cleared successfully!');
      } catch (error) {
        alert('Error clearing cache');
      }
    }
  };

  const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
          setServiceWorkerStatus('Unregistered');
          alert('Service Worker unregistered successfully!');
        }
      } catch (error) {
        alert('Error unregistering Service Worker');
      }
    }
  };

  const refreshApp = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PWA Settings</h1>
              <p className="text-gray-600">Manage your Progressive Web App settings</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Installation Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Smartphone className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Installation Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Installed as PWA</span>
                <div className="flex items-center space-x-2">
                  {isInstalled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {isInstalled ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standalone Mode</span>
                <div className="flex items-center space-x-2">
                  {isStandalone ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium">
                    {isStandalone ? 'Yes' : 'Browser'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">Connection</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network Status</span>
                <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Worker</span>
                <span className="text-sm font-medium text-gray-900">{serviceWorkerStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cache Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Size</span>
              <span className="text-sm font-medium text-gray-900">{cacheSize}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={clearCache}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Clear Cache</span>
              </button>
              <button
                onClick={refreshApp}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Refresh App</span>
              </button>
            </div>
          </div>
        </div>

        {/* Service Worker Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Service Worker</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Service Workers enable offline functionality and background sync. 
              Only unregister if you're experiencing issues.
            </p>
            <button
              onClick={unregisterServiceWorker}
              className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            >
              Unregister Service Worker
            </button>
          </div>
        </div>

        {/* Installation Guide */}
        {!isInstalled && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Install App</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Install this app on your device for a better experience with offline support and faster loading.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Installation Instructions:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Android:</strong> Tap the menu (⋮) in Chrome and select "Add to Home screen"</p>
                  <p><strong>iOS:</strong> Tap the Share button in Safari and select "Add to Home Screen"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PWA Benefits */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PWA Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Works offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Faster loading</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Push notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Home screen access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWASettingsPage; 