'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Globe, Wifi, WifiOff } from 'lucide-react';

const TestPWAPage: React.FC = () => {
  const [pwaInfo, setPwaInfo] = useState<any>({});
  const [showManualTrigger, setShowManualTrigger] = useState(false);

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isHTTPS: location.protocol === 'https:',
      isLocalhost: location.hostname === 'localhost',
      standalone: (window.navigator as any).standalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      beforeInstallPromptSupported: 'BeforeInstallPromptEvent' in window,
      isOnline: navigator.onLine,
    };
    setPwaInfo(info);
  }, []);

  const triggerPWAInstall = () => {
    // Clear any dismissed state
    localStorage.removeItem('pwa-install-dismissed');
    // Reload to trigger the installer
    window.location.reload();
  };

  const clearPWADismissed = () => {
    localStorage.removeItem('pwa-install-dismissed');
    alert('PWA install dismissed state cleared. Refresh the page to see the installer again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PWA Test Page</h1>
              <p className="text-gray-600">Test and debug PWA installation</p>
            </div>
          </div>
        </div>

        {/* PWA Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">PWA Requirements</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HTTPS or Localhost</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.isHTTPS || pwaInfo.isLocalhost ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.isHTTPS || pwaInfo.isLocalhost ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Worker Support</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.serviceWorkerSupported ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.serviceWorkerSupported ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Install Prompt Support</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.beforeInstallPromptSupported ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.beforeInstallPromptSupported ? 'Yes' : 'Partial'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mobile Device</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.isMobile ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.isMobile ? 'Yes' : 'Desktop'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standalone Mode</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.displayMode ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.displayMode ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">iOS Standalone</span>
                <div className="flex items-center space-x-2">
                  {pwaInfo.standalone ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium">
                    {pwaInfo.standalone ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={triggerPWAInstall}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Trigger PWA Installer</span>
            </button>
            <button
              onClick={clearPWADismissed}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Clear Dismissed State</span>
            </button>
            <button
              onClick={() => setShowManualTrigger(!showManualTrigger)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Smartphone className="h-4 w-4" />
              <span>{showManualTrigger ? 'Hide' : 'Show'} Manual Install Guide</span>
            </button>
          </div>
        </div>

        {/* Manual Install Guide */}
        {showManualTrigger && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Installation Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  iOS (iPhone/iPad)
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li>1. Open Safari browser</li>
                  <li>2. Tap the Share button (square with arrow)</li>
                  <li>3. Scroll down and tap "Add to Home Screen"</li>
                  <li>4. Tap "Add" to confirm</li>
                </ol>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Android
                </h3>
                <ol className="space-y-2 text-sm text-green-800">
                  <li>1. Open Chrome browser</li>
                  <li>2. Tap the menu button (⋮)</li>
                  <li>3. Tap "Add to Home screen" or "Install app"</li>
                  <li>4. Tap "Add" to confirm</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(pwaInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPWAPage; 