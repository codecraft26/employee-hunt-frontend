'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator show">
      <div className="flex items-center justify-center space-x-3 px-4 py-3">
        {/* Enhanced Icon */}
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <WifiOff className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <AlertTriangle className="h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        {/* Enhanced Text */}
        <div className="flex-1 text-center">
          <span className="text-white font-semibold text-sm">
            You're offline! 
          </span>
          <span className="text-red-200 text-xs ml-2">
            Check your connection
          </span>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-red-200 text-xs font-medium">OFFLINE</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator; 