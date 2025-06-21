'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, Smartphone, Wifi, WifiOff } from 'lucide-react';

const PWAStatus: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Check PWA installation status
    const checkPWAStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = (window.navigator as any).standalone === true;
      const isInstalled = standalone || navigatorStandalone || document.referrer.includes('android-app://');
      
      setIsInstalled(isInstalled);
      setIsStandalone(standalone || navigatorStandalone);
    };

    // Check online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check status on mount
    checkPWAStatus();
    checkOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    // Show status briefly on mobile devices
    if (typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        setShowStatus(true);
      }, 1000);
      
      setTimeout(() => {
        setShowStatus(false);
      }, 5000);
    }

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <Smartphone className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">PWA Status</span>
        </div>
        
        <div className="space-y-2">
          {/* Installation Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Installed</span>
            <div className="flex items-center space-x-1">
              {isInstalled ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-gray-700">
                {isInstalled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Standalone Mode */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Standalone</span>
            <div className="flex items-center space-x-1">
              {isStandalone ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Info className="h-3 w-3 text-blue-500" />
              )}
              <span className="text-xs text-gray-700">
                {isStandalone ? 'Yes' : 'Browser'}
              </span>
            </div>
          </div>

          {/* Online Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Connection</span>
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!isInstalled && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => window.location.reload()}
              className="w-full text-xs bg-indigo-50 text-indigo-600 py-1 px-2 rounded hover:bg-indigo-100 transition-colors"
            >
              Refresh to check status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAStatus; 