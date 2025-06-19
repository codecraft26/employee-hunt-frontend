'use client';

import React, { useState, useEffect } from 'react';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem, isLocalStorageAvailable } from '../utils/clientStorage';

const PWADebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const collectDebugInfo = () => {
      if (typeof window === 'undefined') {
        return { ssrMode: true, timestamp: new Date().toISOString() };
      }

      const info = {
        // Browser info
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        
        // PWA specific
        serviceWorkerSupported: 'serviceWorker' in navigator,
        serviceWorkerRegistered: false,
        manifestSupported: 'onbeforeinstallprompt' in window,
        standaloneModeDetected: window.matchMedia('(display-mode: standalone)').matches,
        appleStandalone: (window.navigator as any).standalone === true,
        
        // Security
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        
        // Storage
        localStorageAvailable: isLocalStorageAvailable(),
        
        // Install state
        pwaInstallDismissed: getLocalStorageItem('pwa-install-dismissed'),
        
        // Device info
        touchSupport: 'ontouchstart' in window,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        
        // Time
        timestamp: new Date().toISOString()
      };

      // Check service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          info.serviceWorkerRegistered = registrations.length > 0;
          info.serviceWorkerCount = registrations.length;
          setDebugInfo({ ...info });
        });
      }

      return info;
    };

    setDebugInfo(collectDebugInfo());

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = () => {
      setDebugInfo(prev => ({ ...prev, beforeInstallPromptFired: true }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  // Only show debug in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !getLocalStorageItem('pwa-debug-enabled')) {
    return null;
  }

  return (
    <>
      {/* Debug toggle button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-4 right-4 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-70 hover:opacity-100"
        style={{ fontSize: '10px' }}
      >
        PWA Debug
      </button>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">PWA Debug Information</h3>
              <button
                onClick={() => setShowDebug(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                      navigator.serviceWorker.register('/sw.js');
                    }
                  }}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm"
                >
                  Force Register Service Worker
                </button>
                
                <button
                  onClick={() => {
                    removeLocalStorageItem('pwa-install-dismissed');
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded text-sm"
                >
                  Reset Install Prompt
                </button>
                
                <button
                  onClick={() => {
                    const data = JSON.stringify(debugInfo, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'pwa-debug-info.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded text-sm"
                >
                  Export Debug Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWADebugger;
