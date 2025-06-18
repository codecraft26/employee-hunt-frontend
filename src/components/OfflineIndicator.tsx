'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR or initial client render
  if (!mounted) {
    return null;
  }

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator show">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span>You're offline - Some features may be limited</span>
      </div>
    </div>
  );
};

export default OfflineIndicator; 